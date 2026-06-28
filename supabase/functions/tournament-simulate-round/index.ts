// Admin-only: auto-resolve all bot-vs-bot pairings for the current round of a
// tournament using an Elo expectation roll. Lets admins fast-forward the full
// FIDE Dutch Swiss flow to verify pairings/Buchholz/tiebreaks end-to-end.
//
// After writing results into tournament_pairings, the caller should trigger
// `manage-tournament` action=generate_next_round (existing) to advance.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

function expected(rA: number, rB: number) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!(await isAdmin(service, user.id))) {
    return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const { tournament_id, round } = body;
  if (!tournament_id || !round) {
    return new Response(JSON.stringify({ error: "tournament_id and round required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    // Fetch pairings for this round that don't have a result yet.
    const { data: pairings, error: pErr } = await service
      .from("tournament_pairings")
      .select("id, white_player_id, black_player_id, result")
      .eq("tournament_id", tournament_id)
      .eq("round", round)
      .is("result", null);
    if (pErr) throw pErr;
    if (!pairings || pairings.length === 0) {
      return new Response(JSON.stringify({ ok: true, simulated: 0, message: "No pending pairings" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Resolve registration metadata for involved players (only bots are auto-played)
    const ids = Array.from(new Set(pairings.flatMap(p => [p.white_player_id, p.black_player_id].filter(Boolean)))) as string[];
    const { data: regs, error: rErr } = await service
      .from("tournament_registrations")
      .select("user_id, is_test_bot, rating_at_join, fide_blitz_rating")
      .eq("tournament_id", tournament_id)
      .in("user_id", ids);
    if (rErr) throw rErr;
    const regMap = new Map<string, { is_test_bot: boolean; rating: number }>();
    (regs || []).forEach((r: any) => regMap.set(r.user_id, {
      is_test_bot: r.is_test_bot, rating: r.fide_blitz_rating ?? r.rating_at_join ?? 1500,
    }));

    let simulated = 0, skipped = 0;
    for (const p of pairings) {
      // Bye = no black player → award 1-0 (white wins by default for byes)
      if (!p.black_player_id) {
        await service.from("tournament_pairings").update({ result: "1-0" }).eq("id", p.id);
        simulated++;
        continue;
      }
      const w = regMap.get(p.white_player_id);
      const b = regMap.get(p.black_player_id);
      // Only auto-play if BOTH are test bots — never touch real games
      if (!w?.is_test_bot || !b?.is_test_bot) { skipped++; continue; }

      const eW = expected(w.rating, b.rating);
      const roll = Math.random();
      let result: string;
      // small draw band proportional to closeness
      const drawWindow = 0.18 * Math.max(0.2, 1 - Math.abs(eW - 0.5) * 2);
      if (roll < eW - drawWindow / 2) result = "1-0";
      else if (roll < eW + drawWindow / 2) result = "0.5-0.5";
      else result = "0-1";

      await service.from("tournament_pairings").update({ result }).eq("id", p.id);
      simulated++;
    }

    return new Response(JSON.stringify({ ok: true, simulated, skipped, total: pairings.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
