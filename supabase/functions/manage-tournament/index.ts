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

  const { action, tournament_id, game_id, result, time_control_label, time_control_seconds, time_control_increment, category, format, total_rounds, max_players, name, starts_in_minutes } = await req.json();

  try {
    if (action === "create") {
      // Any authenticated user can create a tournament (they become the creator).
      return await handleCreate(supabase, user.id, { name, category, format, total_rounds, max_players, time_control_label, time_control_seconds, time_control_increment, starts_in_minutes });
    }
    if (action === "auto_start_due") {
      return await handleAutoStartDue(supabase);
    }
    if (action === "join") {
      return await handleJoin(supabase, user.id, tournament_id);
    }
    if (action === "leave") {
      return await handleLeave(supabase, user.id, tournament_id);
    }
    if (action === "start") {
      return await handleStart(supabase, tournament_id, user.id);
    }
    if (action === "report_result") {
      return await handleReportResult(supabase, game_id, result, user.id);
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

// ===================== CREATE =====================
async function handleCreate(supabase: any, opts: any) {
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert({
      name: `${opts.category?.charAt(0).toUpperCase() + opts.category?.slice(1) || "Blitz"} Arena`,
      description: `Auto-created ${opts.format || "swiss"} tournament`,
      category: opts.category || "blitz",
      format: opts.format || "swiss",
      total_rounds: opts.total_rounds || 5,
      max_players: opts.max_players || 32,
      time_control_label: opts.time_control_label || "5+3",
      time_control_seconds: opts.time_control_seconds || 300,
      time_control_increment: opts.time_control_increment || 3,
      status: "registering",
      starts_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return jsonRes({ tournament });
}

// ===================== JOIN =====================
async function handleJoin(supabase: any, userId: string, tournament_id: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("rating")
    .eq("user_id", userId)
    .single();

  const rating = profile?.rating || 1200;

  const { data: existing } = await supabase
    .from("tournament_registrations")
    .select("id")
    .eq("tournament_id", tournament_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return jsonRes({ message: "Already registered" });
  }

  // Enforce one-tournament-at-a-time: check if user is in any active/registering tournament
  const { data: allRegs } = await supabase
    .from("tournament_registrations")
    .select("tournament_id")
    .eq("user_id", userId);

  if (allRegs && allRegs.length > 0) {
    const regTournamentIds = allRegs.map((r: any) => r.tournament_id);
    const { data: activeTournaments } = await supabase
      .from("tournaments")
      .select("id, name")
      .in("id", regTournamentIds)
      .in("status", ["registering", "active"]);

    if (activeTournaments && activeTournaments.length > 0) {
      return jsonRes({
        error: `You're already registered in "${activeTournaments[0].name}". Complete or withdraw first.`,
      }, 400);
    }
  }

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("max_players, status")
    .eq("id", tournament_id)
    .single();

  if (!tournament || tournament.status === "finished") {
    return jsonRes({ error: "Tournament not available" }, 400);
  }

  const { count } = await supabase
    .from("tournament_registrations")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournament_id);

  if ((count || 0) >= tournament.max_players) {
    return jsonRes({ error: "Tournament is full" }, 400);
  }

  const { error } = await supabase.from("tournament_registrations").insert({
    tournament_id,
    user_id: userId,
    rating_at_join: rating,
  });

  if (error) throw error;

  // Track streak
  await updateStreak(supabase, userId);

  return jsonRes({ success: true });
}

// ===================== LEAVE =====================
async function handleLeave(supabase: any, userId: string, tournament_id: string) {
  await supabase
    .from("tournament_registrations")
    .delete()
    .eq("tournament_id", tournament_id)
    .eq("user_id", userId);

  return jsonRes({ success: true });
}

// ===================== START =====================
async function handleStart(supabase: any, tournament_id: string, callerId: string) {
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournament_id)
    .single();

  if (!tournament || tournament.status !== "registering") {
    return jsonRes({ error: "Cannot start" }, 400);
  }

  // Authorization: only the creator or an admin/organizer can start a tournament
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId);
  const isAdminOrOrganizer = (roleRows || []).some(
    (r: any) => r.role === "admin" || r.role === "organizer"
  );
  if (tournament.created_by !== callerId && !isAdminOrOrganizer) {
    return jsonRes({ error: "Forbidden" }, 403);
  }

  const { data: players } = await supabase
    .from("tournament_registrations")
    .select("user_id, rating_at_join, score")
    .eq("tournament_id", tournament_id)
    .order("rating_at_join", { ascending: false });

  if (!players || players.length < 2) {
    return jsonRes({ error: "Need at least 2 players" }, 400);
  }

  const pairings = generateSwissPairings(players, 1);

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

  if (players.length % 2 === 1) {
    const byePlayer = players[players.length - 1];
    await supabase.from("tournament_pairings").insert({
      tournament_id,
      round: 1,
      white_player_id: byePlayer.user_id,
      black_player_id: null,
      result: "1-0",
    });
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

  return jsonRes({ success: true, round: 1 });
}

// ===================== REPORT RESULT =====================
async function handleReportResult(supabase: any, game_id: string, result: string, callerId: string) {
  if (!["1-0", "0-1", "1/2-1/2"].includes(result)) {
    return jsonRes({ error: "Invalid result" }, 400);
  }

  // Authorization: caller must be one of the two players in this pairing,
  // OR an admin/organizer.
  const { data: pairingCheck } = await supabase
    .from("tournament_pairings")
    .select("white_player_id, black_player_id")
    .eq("game_id", game_id)
    .single();

  if (!pairingCheck) {
    return jsonRes({ error: "Pairing not found" }, 404);
  }

  const isPlayer =
    pairingCheck.white_player_id === callerId ||
    pairingCheck.black_player_id === callerId;

  if (!isPlayer) {
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);
    const isAdminOrOrganizer = (roleRows || []).some(
      (r: any) => r.role === "admin" || r.role === "organizer"
    );
    if (!isAdminOrOrganizer) {
      return jsonRes({ error: "Forbidden" }, 403);
    }
  }

  await supabase
    .from("tournament_pairings")
    .update({ result })
    .eq("game_id", game_id);

  const { data: pairing } = await supabase
    .from("tournament_pairings")
    .select("tournament_id, white_player_id, black_player_id")
    .eq("game_id", game_id)
    .single();

  if (pairing) {
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
        if (tournament.current_round >= tournament.total_rounds) {
          await supabase
            .from("tournaments")
            .update({ status: "finished" })
            .eq("id", pairing.tournament_id);
          await awardTournamentBadges(supabase, pairing.tournament_id);
        } else {
          await generateNextRound(supabase, pairing.tournament_id, tournament.current_round + 1);
        }
      }
    }
  }

  return jsonRes({ success: true });
}

// ===================== STREAK TRACKING =====================
async function updateStreak(supabase: any, userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("tournament_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("tournament_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_participation_date: today,
      total_tournaments_played: 1,
    });
  } else {
    if (existing.last_participation_date === today) {
      // Already counted today, just increment total
      await supabase
        .from("tournament_streaks")
        .update({ total_tournaments_played: existing.total_tournaments_played + 1, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      return;
    }

    const lastDate = new Date(existing.last_participation_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = 1;
    if (diffDays === 1) {
      newStreak = existing.current_streak + 1;
    }

    const longestStreak = Math.max(existing.longest_streak, newStreak);

    await supabase
      .from("tournament_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_participation_date: today,
        total_tournaments_played: existing.total_tournaments_played + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // Award streak achievements
    await awardStreakBadges(supabase, userId, newStreak, existing.total_tournaments_played + 1);
  }
}

async function awardStreakBadges(supabase: any, userId: string, streak: number, totalPlayed: number) {
  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, key, requirement_type, requirement_value")
    .in("requirement_type", ["streak", "tournaments_played"]);

  if (!achievements) return;

  for (const ach of achievements) {
    const qualifies =
      (ach.requirement_type === "streak" && streak >= ach.requirement_value) ||
      (ach.requirement_type === "tournaments_played" && totalPlayed >= ach.requirement_value);

    if (qualifies) {
      await supabase.from("user_achievements").upsert({
        user_id: userId,
        achievement_id: ach.id,
      }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true }).select();
    }
  }
}

// ===================== SWISS PAIRING =====================
function generateSwissPairings(
  players: Array<{ user_id: string; rating_at_join: number; score: number | null }>,
  round: number
) {
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

  if (players.length % 2 === 1) {
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
  const { data: standings } = await supabase
    .from("tournament_registrations")
    .select("user_id, score")
    .eq("tournament_id", tournamentId)
    .order("score", { ascending: false });

  if (!standings || standings.length === 0) return;

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, key")
    .in("key", ["tournament_gold", "tournament_silver", "tournament_bronze", "tournament_win"]);

  if (!achievements) return;
  const achMap = new Map(achievements.map((a: any) => [a.key, a.id]));

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

  if (standings[0] && achMap.has("tournament_win")) {
    await supabase.from("user_achievements").upsert({
      user_id: standings[0].user_id,
      achievement_id: achMap.get("tournament_win"),
    }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true }).select();
  }
}

// ===================== HELPERS =====================
function jsonRes(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
