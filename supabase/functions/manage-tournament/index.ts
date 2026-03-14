import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Also create a user-context client for auth
  const authHeader = req.headers.get("Authorization");
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader || "" } },
  });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { action, tournament_id, game_id, result, time_control_label, time_control_seconds, time_control_increment, category, format, total_rounds, max_players } = await req.json();

  try {
    // ===================== CREATE TOURNAMENT =====================
    if (action === "create") {
      const { data: tournament, error } = await supabase
        .from("tournaments")
        .insert({
          name: `${category?.charAt(0).toUpperCase() + category?.slice(1) || "Blitz"} Arena`,
          description: `Auto-created ${format || "swiss"} tournament`,
          category: category || "blitz",
          format: format || "swiss",
          total_rounds: total_rounds || 5,
          max_players: max_players || 32,
          time_control_label: time_control_label || "5+3",
          time_control_seconds: time_control_seconds || 300,
          time_control_increment: time_control_increment || 3,
          status: "registering",
          starts_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ tournament }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===================== JOIN TOURNAMENT =====================
    if (action === "join") {
      // Get user profile for rating
      const { data: profile } = await supabase
        .from("profiles")
        .select("rating")
        .eq("user_id", user.id)
        .single();

      const rating = profile?.rating || 1200;

      // Check if already registered
      const { data: existing } = await supabase
        .from("tournament_registrations")
        .select("id")
        .eq("tournament_id", tournament_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ message: "Already registered" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check tournament capacity
      const { data: tournament } = await supabase
        .from("tournaments")
        .select("max_players, status")
        .eq("id", tournament_id)
        .single();

      if (!tournament || tournament.status === "finished") {
        return new Response(JSON.stringify({ error: "Tournament not available" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { count } = await supabase
        .from("tournament_registrations")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", tournament_id);

      if ((count || 0) >= tournament.max_players) {
        return new Response(JSON.stringify({ error: "Tournament is full" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("tournament_registrations").insert({
        tournament_id,
        user_id: user.id,
        rating_at_join: rating,
      });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===================== LEAVE TOURNAMENT =====================
    if (action === "leave") {
      await supabase
        .from("tournament_registrations")
        .delete()
        .eq("tournament_id", tournament_id)
        .eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===================== START TOURNAMENT =====================
    if (action === "start") {
      const { data: tournament } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournament_id)
        .single();

      if (!tournament || tournament.status !== "registering") {
        return new Response(JSON.stringify({ error: "Cannot start" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get all registered players sorted by rating for skill-based pairing
      const { data: players } = await supabase
        .from("tournament_registrations")
        .select("user_id, rating_at_join, score")
        .eq("tournament_id", tournament_id)
        .order("rating_at_join", { ascending: false });

      if (!players || players.length < 2) {
        return new Response(JSON.stringify({ error: "Need at least 2 players" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate round 1 pairings (by rating proximity)
      const pairings = generateSwissPairings(players, 1);

      // Create online games for each pairing
      for (const pairing of pairings) {
        const { data: onlineGame } = await supabase
          .from("online_games")
          .insert({
            white_player_id: pairing.white,
            black_player_id: pairing.black,
            white_time: tournament.time_control_seconds,
            black_time: tournament.time_control_seconds,
            time_control_label: tournament.time_control_label,
            increment: tournament.time_control_increment,
          })
          .select()
          .single();

        await supabase.from("tournament_pairings").insert({
          tournament_id,
          round: 1,
          white_player_id: pairing.white,
          black_player_id: pairing.black,
          game_id: onlineGame?.id || null,
        });
      }

      // Handle bye if odd number of players
      if (players.length % 2 === 1) {
        const byePlayer = players[players.length - 1];
        await supabase.from("tournament_pairings").insert({
          tournament_id,
          round: 1,
          white_player_id: byePlayer.user_id,
          black_player_id: null,
          result: "1-0", // bye = win
        });
        // Award bye point
        await supabase
          .from("tournament_registrations")
          .update({ score: 1 })
          .eq("tournament_id", tournament_id)
          .eq("user_id", byePlayer.user_id);
      }

      await supabase
        .from("tournaments")
        .update({
          status: "active",
          current_round: 1,
          round_started_at: new Date().toISOString(),
        })
        .eq("id", tournament_id);

      return new Response(JSON.stringify({ success: true, round: 1 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===================== REPORT GAME RESULT =====================
    if (action === "report_result") {
      // Update pairing result
      await supabase
        .from("tournament_pairings")
        .update({ result })
        .eq("game_id", game_id);

      // Get pairing info
      const { data: pairing } = await supabase
        .from("tournament_pairings")
        .select("tournament_id, white_player_id, black_player_id")
        .eq("game_id", game_id)
        .single();

      if (pairing) {
        // Update scores
        const whiteScore = result === "1-0" ? 1 : result === "1/2-1/2" ? 0.5 : 0;
        const blackScore = result === "0-1" ? 1 : result === "1/2-1/2" ? 0.5 : 0;

        if (whiteScore > 0) {
          const { data: reg } = await supabase
            .from("tournament_registrations")
            .select("score")
            .eq("tournament_id", pairing.tournament_id)
            .eq("user_id", pairing.white_player_id)
            .single();
          await supabase
            .from("tournament_registrations")
            .update({ score: (Number(reg?.score) || 0) + whiteScore })
            .eq("tournament_id", pairing.tournament_id)
            .eq("user_id", pairing.white_player_id);
        }
        if (blackScore > 0 && pairing.black_player_id) {
          const { data: reg } = await supabase
            .from("tournament_registrations")
            .select("score")
            .eq("tournament_id", pairing.tournament_id)
            .eq("user_id", pairing.black_player_id)
            .single();
          await supabase
            .from("tournament_registrations")
            .update({ score: (Number(reg?.score) || 0) + blackScore })
            .eq("tournament_id", pairing.tournament_id)
            .eq("user_id", pairing.black_player_id);
        }

        // Check if all games in current round are done
        const { data: tournament } = await supabase
          .from("tournaments")
          .select("current_round, total_rounds")
          .eq("id", pairing.tournament_id)
          .single();

        if (tournament) {
          const { data: pendingPairings } = await supabase
            .from("tournament_pairings")
            .select("id")
            .eq("tournament_id", pairing.tournament_id)
            .eq("round", tournament.current_round)
            .is("result", null);

          if (!pendingPairings || pendingPairings.length === 0) {
            // All games done - auto advance
            if (tournament.current_round >= tournament.total_rounds) {
              // Tournament finished - award badges
              await supabase
                .from("tournaments")
                .update({ status: "finished" })
                .eq("id", pairing.tournament_id);
              await awardTournamentBadges(supabase, pairing.tournament_id);
            } else {
              // Generate next round pairings
              await generateNextRound(supabase, pairing.tournament_id, tournament.current_round + 1);
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Swiss pairing: pair players by score first, then rating proximity
function generateSwissPairings(
  players: Array<{ user_id: string; rating_at_join: number; score: number | null }>,
  round: number
) {
  // Sort by score desc, then rating desc
  const sorted = [...players].sort((a, b) => {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return b.rating_at_join - a.rating_at_join;
  });

  const pairings: Array<{ white: string; black: string }> = [];
  const paired = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    if (paired.has(sorted[i].user_id)) continue;
    for (let j = i + 1; j < sorted.length; j++) {
      if (paired.has(sorted[j].user_id)) continue;
      // Alternate colors based on round
      const whiteFirst = (i + round) % 2 === 0;
      pairings.push({
        white: whiteFirst ? sorted[i].user_id : sorted[j].user_id,
        black: whiteFirst ? sorted[j].user_id : sorted[i].user_id,
      });
      paired.add(sorted[i].user_id);
      paired.add(sorted[j].user_id);
      break;
    }
  }

  return pairings;
}

async function generateNextRound(supabase: any, tournamentId: string, nextRound: number) {
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("time_control_seconds, time_control_label, time_control_increment")
    .eq("id", tournamentId)
    .single();

  const { data: players } = await supabase
    .from("tournament_registrations")
    .select("user_id, rating_at_join, score")
    .eq("tournament_id", tournamentId)
    .order("score", { ascending: false });

  if (!players || players.length < 2 || !tournament) return;

  const pairings = generateSwissPairings(players, nextRound);

  for (const pairing of pairings) {
    const { data: onlineGame } = await supabase
      .from("online_games")
      .insert({
        white_player_id: pairing.white,
        black_player_id: pairing.black,
        white_time: tournament.time_control_seconds,
        black_time: tournament.time_control_seconds,
        time_control_label: tournament.time_control_label,
        increment: tournament.time_control_increment,
      })
      .select()
      .single();

    await supabase.from("tournament_pairings").insert({
      tournament_id: tournamentId,
      round: nextRound,
      white_player_id: pairing.white,
      black_player_id: pairing.black,
      game_id: onlineGame?.id || null,
    });
  }

  // Handle bye
  if (players.length % 2 === 1) {
    // Give bye to lowest-scored player who hasn't had a bye
    const { data: previousByes } = await supabase
      .from("tournament_pairings")
      .select("white_player_id")
      .eq("tournament_id", tournamentId)
      .is("black_player_id", null);

    const byePlayerIds = new Set((previousByes || []).map((b: any) => b.white_player_id));
    const byeCandidate = [...players].reverse().find((p: any) => !byePlayerIds.has(p.user_id));
    const byePlayer = byeCandidate || players[players.length - 1];

    await supabase.from("tournament_pairings").insert({
      tournament_id: tournamentId,
      round: nextRound,
      white_player_id: byePlayer.user_id,
      black_player_id: null,
      result: "1-0",
    });

    const { data: reg } = await supabase
      .from("tournament_registrations")
      .select("score")
      .eq("tournament_id", tournamentId)
      .eq("user_id", byePlayer.user_id)
      .single();

    await supabase
      .from("tournament_registrations")
      .update({ score: (Number(reg?.score) || 0) + 1 })
      .eq("tournament_id", tournamentId)
      .eq("user_id", byePlayer.user_id);
  }

  await supabase
    .from("tournaments")
    .update({
      current_round: nextRound,
      round_started_at: new Date().toISOString(),
    })
    .eq("id", tournamentId);
}

async function awardTournamentBadges(supabase: any, tournamentId: string) {
  // Get final standings
  const { data: standings } = await supabase
    .from("tournament_registrations")
    .select("user_id, score")
    .eq("tournament_id", tournamentId)
    .order("score", { ascending: false });

  if (!standings || standings.length === 0) return;

  // Get achievement IDs
  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, key")
    .in("key", ["tournament_gold", "tournament_silver", "tournament_bronze", "tournament_win"]);

  if (!achievements) return;
  const achMap = new Map(achievements.map((a: any) => [a.key, a.id]));

  // Award placement badges
  const placements = [
    { idx: 0, key: "tournament_gold" },
    { idx: 1, key: "tournament_silver" },
    { idx: 2, key: "tournament_bronze" },
  ];

  for (const { idx, key } of placements) {
    if (standings[idx] && achMap.has(key)) {
      await supabase.from("user_achievements").upsert({
        user_id: standings[idx].user_id,
        achievement_id: achMap.get(key),
      }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true }).select();
    }
  }

  // Also award tournament_win to 1st place
  if (standings[0] && achMap.has("tournament_win")) {
    await supabase.from("user_achievements").upsert({
      user_id: standings[0].user_id,
      achievement_id: achMap.get("tournament_win"),
    }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true }).select();
  }
}
