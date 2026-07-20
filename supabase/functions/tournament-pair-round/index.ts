// Dutch Swiss pairing (simplified FIDE 04.1) for MasterChess tournaments.
//
// POST /tournament-pair-round
//   { tournament_id: uuid, round?: number, dry_run?: boolean }
//
// Generates pairings for the next round (or the explicit `round`) using:
//   - sort by score desc, rating desc
//   - score groups, top-half vs bottom-half pairing
//   - color balance (alternate when possible)
//   - avoid repeat opponents
//   - bye to the lowest-rated unpaired player (no previous bye preferred)
//
// Requires the caller to be an admin or the tournament organizer.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Player {
  user_id: string;
  rating: number;
  score: number;
  colors: ("w" | "b")[];
  opponents: Set<string>;
  hadBye: boolean;
  bye_rounds: number[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(auth.replace("Bearer ", ""));
    if (claimsErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const tournament_id = String(body.tournament_id || "");
    const dryRun = Boolean(body.dry_run);
    if (!tournament_id) return json({ error: "Missing tournament_id" }, 400);

    // AuthZ: admin OR organizer/creator.
    const [{ data: isAdmin }, { data: t }] = await Promise.all([
      admin.rpc("has_role", { _user_id: userId, _role: "admin" }),
      admin.from("tournaments").select("*").eq("id", tournament_id).single(),
    ]);
    if (!t) return json({ error: "Tournament not found" }, 404);
    if (!isAdmin && t.created_by !== userId) return json({ error: "Forbidden" }, 403);

    const targetRound = Number(body.round) || (t.status === "registering" ? 1 : (t.current_round || 0) + 1);
    if (targetRound > (t.total_rounds || 9)) return json({ error: "Round exceeds total_rounds" }, 400);

    const { data: regs } = await admin
      .from("tournament_registrations")
      .select("user_id, score, rating_at_join, fide_blitz_rating, bye_rounds, withdrew_at")
      .eq("tournament_id", tournament_id);

    const active = (regs || []).filter((r: any) => !r.withdrew_at);
    if (active.length < 2) return json({ error: "Not enough players" }, 400);

    const { data: prevPairs } = await admin
      .from("tournament_pairings")
      .select("round, white_player_id, black_player_id")
      .eq("tournament_id", tournament_id)
      .lt("round", targetRound);

    const players: Player[] = active.map((r: any) => ({
      user_id: r.user_id,
      rating: r.fide_blitz_rating || r.rating_at_join || 1200,
      score: Number(r.score) || 0,
      colors: [],
      opponents: new Set<string>(),
      hadBye: (r.bye_rounds || []).length > 0,
      bye_rounds: r.bye_rounds || [],
    }));
    const pmap = new Map(players.map((p) => [p.user_id, p]));
    for (const pp of prevPairs || []) {
      const w = pmap.get(pp.white_player_id);
      if (w) w.colors.push("w");
      if (pp.black_player_id) {
        const b = pmap.get(pp.black_player_id);
        if (b) b.colors.push("b");
        if (w && pp.black_player_id) w.opponents.add(pp.black_player_id);
        if (b) b.opponents.add(pp.white_player_id);
      } else {
        if (w) w.hadBye = true;
      }
    }

    // Players who requested half-point bye for this round are removed from pairing.
    const requestedBye = players.filter((p) => p.bye_rounds.includes(targetRound));
    const toPair = players.filter((p) => !p.bye_rounds.includes(targetRound));

    // Sort by score desc, rating desc.
    toPair.sort((a, b) => b.score - a.score || b.rating - a.rating);

    // Auto-bye: if odd, lowest-rated who hasn't had a bye.
    let autoBye: Player | null = null;
    if (toPair.length % 2 === 1) {
      const candidates = [...toPair].reverse();
      autoBye = candidates.find((p) => !p.hadBye) || candidates[0];
      toPair.splice(toPair.indexOf(autoBye!), 1);
    }

    // Group by score, pair top-half vs bottom-half, avoid repeats.
    const groups = new Map<number, Player[]>();
    for (const p of toPair) {
      const g = groups.get(p.score) || [];
      g.push(p);
      groups.set(p.score, g);
    }
    const sortedScores = [...groups.keys()].sort((a, b) => b - a);

    const pairings: { white: string; black: string | null; board: number }[] = [];
    let board = 1;
    let floater: Player | null = null;
    for (const s of sortedScores) {
      const group = groups.get(s)!;
      if (floater) group.unshift(floater);
      floater = null;
      if (group.length % 2 === 1) {
        // Float the lowest to next group.
        floater = group.pop()!;
      }
      const half = group.length / 2;
      const top = group.slice(0, half);
      const bot = group.slice(half);
      // Try to avoid repeats by shifting bottom half rotation.
      for (let attempt = 0; attempt < bot.length; attempt++) {
        let conflict = false;
        for (let i = 0; i < top.length; i++) {
          if (top[i].opponents.has(bot[i].user_id)) { conflict = true; break; }
        }
        if (!conflict) break;
        bot.push(bot.shift()!);
      }
      for (let i = 0; i < top.length; i++) {
        const a = top[i], b = bot[i];
        // Color decision: whoever has fewer whites gets white; tiebreak alternation.
        const aW = a.colors.filter((c) => c === "w").length;
        const bW = b.colors.filter((c) => c === "w").length;
        const aLast = a.colors[a.colors.length - 1];
        const bLast = b.colors[b.colors.length - 1];
        let whiteFirst = aW <= bW;
        if (aW === bW) whiteFirst = aLast !== "w" ? true : bLast !== "w" ? false : true;
        const white = whiteFirst ? a : b;
        const black = whiteFirst ? b : a;
        pairings.push({ white: white.user_id, black: black.user_id, board: board++ });
        a.opponents.add(b.user_id); b.opponents.add(a.user_id);
      }
    }
    if (floater) {
      // Unmatched floater becomes auto-bye if none assigned yet.
      if (!autoBye) autoBye = floater;
      else pairings.push({ white: floater.user_id, black: null, board: board++ });
    }
    if (autoBye) pairings.push({ white: autoBye.user_id, black: null, board: board++ });

    if (dryRun) {
      return json({ ok: true, dry_run: true, round: targetRound, pairings, requested_byes: requestedBye.map((p) => p.user_id) });
    }

    // Persist: clear any existing pairings for this round, then insert.
    await admin.from("tournament_pairings").delete()
      .eq("tournament_id", tournament_id).eq("round", targetRound);

    const rows = pairings.map((p) => ({
      tournament_id, round: targetRound,
      white_player_id: p.white, black_player_id: p.black,
    }));
    if (rows.length) {
      const { error: insErr } = await admin.from("tournament_pairings").insert(rows);
      if (insErr) return json({ error: insErr.message }, 500);
    }

    // Apply half-point bye points immediately for requested byes.
    for (const p of requestedBye) {
      await admin.from("tournament_registrations")
        .update({ score: Number(p.score) + 0.5 })
        .eq("tournament_id", tournament_id).eq("user_id", p.user_id);
    }
    // Apply full point for auto-bye.
    if (autoBye) {
      await admin.from("tournament_registrations")
        .update({ score: Number(autoBye.score) + 1 })
        .eq("tournament_id", tournament_id).eq("user_id", autoBye.user_id);
    }

    await admin.from("tournaments")
      .update({ current_round: targetRound, round_started_at: new Date().toISOString(), status: "active" })
      .eq("id", tournament_id);

    return json({ ok: true, round: targetRound, pairings: rows.length, bye: autoBye?.user_id || null });
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
});

function json(d: unknown, status = 200) {
  return new Response(JSON.stringify(d), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
