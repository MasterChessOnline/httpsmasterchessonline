// Tournament auto-start scheduler.
// Called by pg_cron every minute AND as a client-side fallback when a user
// opens a tournament whose start time has passed.
// Idempotent: safely re-runnable; uses auto_started flag + status guard.

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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Optional single-tournament fast-path (client fallback)
  let targetId: string | null = null;
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (body && typeof body.tournament_id === "string") {
        targetId = body.tournament_id;
      }
    }
  } catch (_) { /* ignore */ }

  const nowIso = new Date().toISOString();

  // Find tournaments that should start
  let query = supabase
    .from("tournaments")
    .select("id, starts_at, tournament_type, total_rounds, time_control_seconds, time_control_label, time_control_increment")
    .eq("status", "registering")
    .lte("starts_at", nowIso);
  if (targetId) query = query.eq("id", targetId);

  const { data: due, error: dueErr } = await query;
  if (dueErr) {
    return json({ error: dueErr.message }, 500);
  }

  const started: string[] = [];
  const skipped: { id: string; reason: string }[] = [];

  for (const t of due || []) {
    // Atomic claim: flip only if still registering & not auto_started
    const { data: claimed, error: claimErr } = await supabase
      .from("tournaments")
      .update({
        auto_started: true,
        status: "active",
        current_round: 1,
        round_started_at: new Date().toISOString(),
      })
      .eq("id", t.id)
      .eq("status", "registering")
      .eq("auto_started", false)
      .select("id")
      .maybeSingle();

    if (claimErr || !claimed) {
      skipped.push({ id: t.id, reason: claimErr?.message || "already started" });
      continue;
    }

    // Get registered players
    const { data: players } = await supabase
      .from("tournament_registrations")
      .select("user_id, rating_at_join, score")
      .eq("tournament_id", t.id)
      .order("rating_at_join", { ascending: false });

    if (!players || players.length < 2) {
      // Cancel — not enough players
      await supabase
        .from("tournaments")
        .update({ status: "finished" })
        .eq("id", t.id);
      skipped.push({ id: t.id, reason: "cancelled — not enough players" });
      continue;
    }

    // Generate first-round pairings (Swiss/RR/Arena all start the same: by rating)
    const pairings = pairRound1(players);

    for (const p of pairings) {
      const { data: game } = await supabase
        .from("online_games")
        .insert({
          white_player_id: p.white,
          black_player_id: p.black,
          white_time: t.time_control_seconds,
          black_time: t.time_control_seconds,
          time_control_label: t.time_control_label,
          increment: t.time_control_increment,
        })
        .select()
        .single();

      await supabase.from("tournament_pairings").insert({
        tournament_id: t.id,
        round: 1,
        white_player_id: p.white,
        black_player_id: p.black,
        game_id: game?.id || null,
      });
    }

    // Bye for odd player count
    if (players.length % 2 === 1) {
      const bye = players[players.length - 1];
      await supabase.from("tournament_pairings").insert({
        tournament_id: t.id,
        round: 1,
        white_player_id: bye.user_id,
        black_player_id: null,
        result: "1-0",
      });
      await supabase
        .from("tournament_registrations")
        .update({ score: 1 })
        .eq("tournament_id", t.id)
        .eq("user_id", bye.user_id);
    }

    started.push(t.id);
  }

  return json({ started, skipped, scanned: (due || []).length });
});

function pairRound1(
  players: Array<{ user_id: string; rating_at_join: number; score: number | null }>,
) {
  const sorted = [...players].sort((a, b) => b.rating_at_join - a.rating_at_join);
  const half = Math.floor(sorted.length / 2);
  const top = sorted.slice(0, half);
  const bottom = sorted.slice(half, half * 2);
  const result: { white: string; black: string }[] = [];
  for (let i = 0; i < top.length; i++) {
    const whiteFirst = i % 2 === 0;
    result.push({
      white: whiteFirst ? top[i].user_id : bottom[i].user_id,
      black: whiteFirst ? bottom[i].user_id : top[i].user_id,
    });
  }
  return result;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
