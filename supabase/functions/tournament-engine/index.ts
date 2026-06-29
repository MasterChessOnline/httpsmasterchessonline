// Tournament Engine — orchestrates a tournament lifecycle:
//   action: "lock_registration" | "start_next_round" | "close_round" | "finalize" | "validate"
//
// Auth: admin OR tournament organizer (tournaments.created_by).
// Writes audit log entries for every transition.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action =
  | "lock_registration"
  | "start_next_round"
  | "close_round"
  | "finalize"
  | "validate";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: claims } = await supa.auth.getClaims(auth.replace("Bearer ", ""));
    const userId = claims?.claims?.sub as string | undefined;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const action = body.action as Action;
    const tournament_id = String(body.tournament_id || "");
    if (!tournament_id || !action) return json({ error: "tournament_id and action required" }, 400);

    const { data: isAuthorized } = await admin.rpc("is_tournament_admin", {
      _user: userId, _tid: tournament_id,
    });
    if (!isAuthorized) return json({ error: "Forbidden" }, 403);

    const { data: t, error: tErr } = await admin
      .from("tournaments").select("*").eq("id", tournament_id).maybeSingle();
    if (tErr || !t) return json({ error: "Tournament not found" }, 404);

    const log = async (act: string, payload: Record<string, unknown> = {}) => {
      await admin.from("tournament_audit_log").insert({
        tournament_id, actor_id: userId, action: act, payload,
      });
    };

    switch (action) {
      case "validate": {
        const checks = await runValidation(admin, tournament_id, t);
        return json({ ok: true, checks });
      }

      case "lock_registration": {
        if (t.registration_locked_at) {
          return json({ ok: true, already_locked: true });
        }
        const { count } = await admin
          .from("tournament_registrations")
          .select("*", { count: "exact", head: true })
          .eq("tournament_id", tournament_id)
          .eq("checked_in", true);
        if ((count ?? 0) < 2) return json({ error: "Need at least 2 checked-in players" }, 400);

        await admin.from("tournaments").update({
          registration_locked_at: new Date().toISOString(),
          status: "active",
        }).eq("id", tournament_id);
        await log("lock_registration", { players: count });
        return json({ ok: true, players: count });
      }

      case "start_next_round": {
        const checks = await runValidation(admin, tournament_id, t);
        if (!checks.allPass) {
          return json({ error: "Validation failed", checks }, 400);
        }
        const nextRound = (t.current_round ?? 0) + 1;
        if (nextRound > (t.total_rounds ?? 9)) {
          return json({ error: "Tournament already at final round" }, 400);
        }

        // Mark previous round closed
        if ((t.current_round ?? 0) > 0) {
          await admin.from("tournament_round_state").upsert({
            tournament_id, round: t.current_round, status: "closed",
            closed_at: new Date().toISOString(),
          }, { onConflict: "tournament_id,round" });
        }

        // Recompute tiebreaks before pairing
        await admin.rpc("recalc_tournament_tiebreaks", { _tid: tournament_id });

        // Invoke pairing function
        const pairUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tournament-pair-round`;
        const pairRes = await fetch(pairUrl, {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: auth },
          body: JSON.stringify({ tournament_id, round: nextRound }),
        });
        const pairData = await pairRes.json();
        if (!pairRes.ok) {
          return json({ error: "Pairing failed", detail: pairData }, 500);
        }

        await admin.from("tournaments").update({
          current_round: nextRound,
          round_started_at: new Date().toISOString(),
          status: "active",
        }).eq("id", tournament_id);

        await admin.from("tournament_round_state").upsert({
          tournament_id, round: nextRound, status: "published",
          published_at: new Date().toISOString(),
        }, { onConflict: "tournament_id,round" });

        await log("start_round", { round: nextRound, pairings: pairData.pairings_count });

        // Fire notifications (non-blocking)
        fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/tournament-notify`, {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: auth },
          body: JSON.stringify({ tournament_id, event: "round_published", round: nextRound }),
        }).catch(() => {});

        return json({ ok: true, round: nextRound, pairings: pairData });
      }

      case "close_round": {
        const round = Number(body.round ?? t.current_round);
        if (!round) return json({ error: "No active round" }, 400);

        // Force-forfeit any pairings without a result
        const { data: open } = await admin
          .from("tournament_pairings")
          .select("id, white_player_id, black_player_id")
          .eq("tournament_id", tournament_id).eq("round", round).is("result", null);
        for (const p of open ?? []) {
          if (!p.black_player_id) {
            // bye → already 1 point
            await admin.from("tournament_pairings").update({
              result: "1-0", end_reason: "bye", finished_at: new Date().toISOString(),
            }).eq("id", p.id);
          } else {
            await admin.from("tournament_pairings").update({
              result: "1/2-1/2", end_reason: "no_show",
              forfeit: true, finished_at: new Date().toISOString(),
            }).eq("id", p.id);
          }
        }

        await admin.rpc("recalc_tournament_tiebreaks", { _tid: tournament_id });
        await admin.from("tournament_round_state").upsert({
          tournament_id, round, status: "closed", closed_at: new Date().toISOString(),
        }, { onConflict: "tournament_id,round" });
        await log("close_round", { round, force_closed: open?.length ?? 0 });
        return json({ ok: true, round, force_closed: open?.length ?? 0 });
      }

      case "finalize": {
        await admin.rpc("recalc_tournament_tiebreaks", { _tid: tournament_id });
        const { data: top } = await admin
          .from("tournament_registrations")
          .select("user_id, score, buchholz, sonneborn")
          .eq("tournament_id", tournament_id)
          .order("score", { ascending: false })
          .order("buchholz", { ascending: false })
          .order("sonneborn", { ascending: false })
          .limit(1);
        const winner = top?.[0]?.user_id ?? null;
        await admin.from("tournaments").update({
          status: "finished",
          finished_at: new Date().toISOString(),
          winner_user_id: winner,
        }).eq("id", tournament_id);
        await log("finalize", { winner });

        // Award titles (non-blocking)
        fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/award-tournament-titles`, {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: auth },
          body: JSON.stringify({ tournament_id }),
        }).catch(() => {});

        return json({ ok: true, winner });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("[tournament-engine]", e);
    return json({ error: String(e) }, 500);
  }
});

async function runValidation(admin: any, tid: string, t: any) {
  const round = t.current_round ?? 0;
  const checks: Array<{ key: string; ok: boolean; detail?: any }> = [];

  if (round > 0) {
    const { count: missing } = await admin
      .from("tournament_pairings")
      .select("*", { count: "exact", head: true })
      .eq("tournament_id", tid).eq("round", round).is("result", null);
    checks.push({ key: "all_results_entered", ok: (missing ?? 0) === 0, detail: { missing } });
  } else {
    checks.push({ key: "all_results_entered", ok: true });
  }

  if (!t.registration_locked_at && round === 0) {
    checks.push({ key: "registration_locked", ok: false });
  } else {
    checks.push({ key: "registration_locked", ok: true });
  }

  const allPass = checks.every((c) => c.ok);
  return { checks, allPass };
}
