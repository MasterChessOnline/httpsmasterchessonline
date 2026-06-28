// Admin-only orchestrator: pair + simulate every remaining round of a
// tournament end-to-end, then run a FIDE-rules audit on the result.
//
// POST { tournament_id, rounds?: number, stop_on_error?: boolean }
// Returns { ok, rounds_played, audit: { repeats, color_streaks, multi_bye, ... } }
//
// Designed so admins can validate a 64-bot Dutch Swiss in one click before
// the live DB Chess Cup. Re-uses the existing pair + simulate functions so
// production code paths are exactly what the live event will run.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (d: unknown, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const user = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await user.auth.getUser();
    if (!u?.user) return json({ error: "Unauthorized" }, 401);
    const { data: roleRow } = await service.from("user_roles")
      .select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const tournament_id = String(body.tournament_id || "");
    if (!tournament_id) return json({ error: "Missing tournament_id" }, 400);
    const stopOnError = body.stop_on_error !== false;

    const { data: t } = await service.from("tournaments").select("*").eq("id", tournament_id).single();
    if (!t) return json({ error: "Tournament not found" }, 404);

    const total = Number(body.rounds || t.total_rounds || 9);
    const startRound = (t.current_round || 0) + 1;

    const log: any[] = [];
    const invokeUrl = (fn: string) => `${url}/functions/v1/${fn}`;
    const fwd = { Authorization: auth, "Content-Type": "application/json" };

    for (let r = startRound; r <= total; r++) {
      // 1) Pair this round
      const pairRes = await fetch(invokeUrl("tournament-pair-round"), {
        method: "POST", headers: fwd,
        body: JSON.stringify({ tournament_id, round: r }),
      });
      const pairJson = await pairRes.json().catch(() => ({}));
      if (!pairRes.ok) {
        log.push({ round: r, step: "pair", error: pairJson });
        if (stopOnError) break; else continue;
      }
      // 2) Simulate all games for this round
      const simRes = await fetch(invokeUrl("tournament-simulate-round"), {
        method: "POST", headers: fwd,
        body: JSON.stringify({ tournament_id, round: r }),
      });
      const simJson = await simRes.json().catch(() => ({}));
      log.push({ round: r, pair: pairJson, sim: simJson });
      if (!simRes.ok && stopOnError) break;
    }

    // --- Audit ---
    const { data: pairings } = await service.from("tournament_pairings")
      .select("round, white_player_id, black_player_id, result")
      .eq("tournament_id", tournament_id)
      .order("round", { ascending: true });
    const { data: regs } = await service.from("tournament_registrations")
      .select("user_id, score, bye_rounds, rating_at_join")
      .eq("tournament_id", tournament_id);

    const seen = new Set<string>();
    const repeats: string[] = [];
    const colorSeq = new Map<string, ("w" | "b")[]>();
    const byeCount = new Map<string, number>();

    for (const p of pairings || []) {
      if (p.black_player_id) {
        const key = [p.white_player_id, p.black_player_id].sort().join("|");
        if (seen.has(key)) repeats.push(`R${p.round}: ${key}`);
        seen.add(key);
        const wSeq = colorSeq.get(p.white_player_id) || []; wSeq.push("w"); colorSeq.set(p.white_player_id, wSeq);
        const bSeq = colorSeq.get(p.black_player_id) || []; bSeq.push("b"); colorSeq.set(p.black_player_id, bSeq);
      } else {
        byeCount.set(p.white_player_id, (byeCount.get(p.white_player_id) || 0) + 1);
      }
    }
    const colorStreaks: string[] = [];
    const colorImbalance: string[] = [];
    for (const [uid, seq] of colorSeq) {
      let run = 1;
      for (let i = 1; i < seq.length; i++) {
        if (seq[i] === seq[i - 1]) { run++; if (run >= 3) { colorStreaks.push(`${uid}: 3+ ${seq[i]} in a row`); break; } }
        else run = 1;
      }
      const w = seq.filter(c => c === "w").length;
      const diff = Math.abs(w - (seq.length - w));
      if (diff > 2) colorImbalance.push(`${uid}: |W-B|=${diff}`);
    }
    const multiBye: string[] = [];
    for (const [uid, n] of byeCount) if (n > 1) multiBye.push(`${uid}: ${n} byes`);

    return json({
      ok: true,
      rounds_attempted: total - startRound + 1,
      log,
      players: regs?.length || 0,
      pairings: pairings?.length || 0,
      audit: {
        repeats,
        color_streaks: colorStreaks,
        color_imbalance: colorImbalance,
        multi_bye: multiBye,
        pass: repeats.length === 0 && colorStreaks.length === 0 && multiBye.length === 0,
      },
    });
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
});
