// Online game watchdog — runs every ~1 min via pg_cron.
// 1) Timeout: side-to-move flagged → opponent wins on time.
// 2) Unstarted games (move_number=0) older than 10 min → aborted.
// 3) Stale games (no move >30 min) → aborted.
// 4) Cleans profiles.current_game_id so users can start a new game.
// 5) Drops matchmaking_queue entries older than 5 min.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!isAuthorizedCronCaller(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: Record<string, unknown> = { timedOut: 0, abortedUnstarted: 0, abortedStale: 0 };

  try {
    const { data: activeGames } = await supabase
      .from("online_games")
      .select("id, turn, white_time, black_time, white_player_id, black_player_id, last_move_at, status, move_number, created_at")
      .eq("status", "active");

    const now = Date.now();

    for (const g of activeGames ?? []) {
      const lastMs = g.last_move_at ? new Date(g.last_move_at).getTime() : now;
      const elapsedSec = Math.floor((now - lastMs) / 1000);
      const createdMs = g.created_at ? new Date(g.created_at).getTime() : now;
      const ageMin = (now - createdMs) / 60000;

      // 1) Timeout
      const clock = (g.turn === "w" ? g.white_time : g.black_time) - elapsedSec;
      if (g.move_number > 0 && clock <= 0) {
        const result = g.turn === "w" ? "0-1" : "1-0";
        try {
          const { error } = await supabase.rpc("finalize_online_game_admin" as never, {
            p_game_id: g.id,
            p_result: result,
            p_end_reason: "timeout",
          });
          if (error) throw error;
        } catch {
          await supabase
            .from("online_games")
            .update({ status: "finished", result, end_reason: "timeout" })
            .eq("id", g.id);
          await supabase
            .from("profiles")
            .update({ current_game_id: null })
            .in("user_id", [g.white_player_id, g.black_player_id]);
        }
        (results as any).timedOut++;
        continue;
      }

      // 2) Unstarted game older than 10 min → abort
      if (g.move_number === 0 && ageMin > 10) {
        await supabase
          .from("online_games")
          .update({ status: "aborted", end_reason: "agreement" })
          .eq("id", g.id);
        await supabase
          .from("profiles")
          .update({ current_game_id: null })
          .in("user_id", [g.white_player_id, g.black_player_id]);
        (results as any).abortedUnstarted++;
        continue;
      }

      // 3) Stale: no move in 30 min → abort
      if (elapsedSec > 30 * 60) {
        await supabase
          .from("online_games")
          .update({ status: "aborted", end_reason: "agreement" })
          .eq("id", g.id);
        await supabase
          .from("profiles")
          .update({ current_game_id: null })
          .in("user_id", [g.white_player_id, g.black_player_id]);
        (results as any).abortedStale++;
      }
    }

    const { error: qErr } = await supabase
      .from("matchmaking_queue")
      .delete()
      .lt("created_at", new Date(now - 5 * 60 * 1000).toISOString());
    (results as any).queueCleanup = qErr ? `err:${qErr.message}` : "ok";

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
