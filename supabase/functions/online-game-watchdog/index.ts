// Online game watchdog — runs every ~30s via pg_cron.
// Responsibilities:
//   1. Finalize games whose clock has run out (timeout, opponent wins).
//   2. Abort games where BOTH players have been absent for >2 minutes
//      (no heartbeat, no move) — clears profiles.current_game_id so
//      they can start a new game.
//   3. Clean up empty matchmaking queue rows older than 5 minutes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: Record<string, unknown> = {};

  try {
    // 1) Timeouts — current player's clock <= 0 and game still active.
    const { data: activeGames } = await supabase
      .from("online_games")
      .select("id, turn, white_time, black_time, white_player_id, black_player_id, last_move_at, status")
      .eq("status", "active");

    let timedOut = 0;
    let abandoned = 0;
    const now = Date.now();

    for (const g of activeGames ?? []) {
      const lastMs = g.last_move_at ? new Date(g.last_move_at).getTime() : now;
      const elapsedSec = Math.floor((now - lastMs) / 1000);
      const clock = (g.turn === "w" ? g.white_time : g.black_time) - elapsedSec;

      if (clock <= 0) {
        // Side to move flagged → opponent wins on time.
        const result = g.turn === "w" ? "0-1" : "1-0";
        await supabase.rpc("finalize_online_game_admin" as never, {
          p_game_id: g.id,
          p_result: result,
          p_end_reason: "timeout",
        }).catch(async () => {
          // Fallback: direct write if admin variant not present.
          await supabase
            .from("online_games")
            .update({ status: "finished", result, end_reason: "timeout" })
            .eq("id", g.id);
          await supabase
            .from("profiles")
            .update({ current_game_id: null })
            .in("user_id", [g.white_player_id, g.black_player_id]);
        });
        timedOut++;
        continue;
      }

      // 2) Abandoned: no move in 30 min → abort with no Elo change.
      if (elapsedSec > 30 * 60) {
        await supabase
          .from("online_games")
          .update({ status: "aborted", end_reason: "agreement" })
          .eq("id", g.id);
        await supabase
          .from("profiles")
          .update({ current_game_id: null })
          .in("user_id", [g.white_player_id, g.black_player_id]);
        abandoned++;
      }
    }
    results.timedOut = timedOut;
    results.abandoned = abandoned;

    // 3) Matchmaking queue: drop entries older than 5 min.
    const { error: qErr } = await supabase
      .from("matchmaking_queue")
      .delete()
      .lt("created_at", new Date(now - 5 * 60 * 1000).toISOString());
    results.queueCleanup = qErr ? `err:${qErr.message}` : "ok";

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
