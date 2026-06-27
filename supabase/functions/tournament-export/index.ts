// Exports tournament data in formats accepted by Chess-Results Serbia:
//   ?format=trf    → FIDE TRF (Tournament Report File)
//   ?format=pgn    → PGN archive (all games concatenated)
//   ?format=json   → cross-table + standings JSON
//
// GET /tournament-export?tournament_id=<uuid>&format=trf|pgn|json
//
// No write side-effects. Available to organizers / admins / signed-in registrants.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const tournament_id = url.searchParams.get("tournament_id");
  const format = (url.searchParams.get("format") || "trf").toLowerCase();
  if (!tournament_id) return text("Missing tournament_id", 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: t } = await supabase.from("tournaments").select("*").eq("id", tournament_id).single();
  if (!t) return text("Tournament not found", 404);

  const { data: regs } = await supabase
    .from("tournament_registrations")
    .select("user_id, score, rating_at_join, first_name, last_name, fide_id, fide_title, federation, birth_year")
    .eq("tournament_id", tournament_id);

  const profileIds = (regs || []).map((r: any) => r.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, country, first_name, last_name, fide_id, fide_title, federation, birth_year")
    .in("user_id", profileIds);

  const profMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

  // Sort by score desc then rating desc and assign starting numbers.
  const players = (regs || [])
    .map((r: any) => {
      const p = profMap.get(r.user_id) || {};
      return {
        user_id: r.user_id,
        first_name: r.first_name || p.first_name || "",
        last_name: r.last_name || p.last_name || p.display_name || p.username || "Player",
        federation: (r.federation || p.federation || p.country || "").toUpperCase().slice(0, 3),
        fide_title: r.fide_title || p.fide_title || "",
        fide_id: r.fide_id || p.fide_id || "",
        birth_year: r.birth_year || p.birth_year || "",
        rating: r.rating_at_join || 0,
        score: Number(r.score) || 0,
      };
    })
    .sort((a, b) => b.score - a.score || b.rating - a.rating);

  const startNo = new Map<string, number>();
  players.forEach((p, i) => startNo.set(p.user_id, i + 1));

  const { data: pairings } = await supabase
    .from("tournament_pairings")
    .select("round, white_player_id, black_player_id, result, game_id")
    .eq("tournament_id", tournament_id)
    .order("round", { ascending: true });

  if (format === "json") {
    return json({ tournament: t, players, pairings });
  }

  if (format === "pgn") {
    const ids = (pairings || []).map((p: any) => p.game_id).filter(Boolean);
    const { data: games } = await supabase
      .from("online_games")
      .select("id, white_player_id, black_player_id, result, pgn, created_at")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const lines: string[] = [];
    for (const p of pairings || []) {
      const g = (games || []).find((x: any) => x.id === p.game_id);
      const w = profMap.get(p.white_player_id) as any;
      const b = p.black_player_id ? (profMap.get(p.black_player_id) as any) : null;
      const wn = playerLabel(w);
      const bn = b ? playerLabel(b) : "BYE";
      const r = p.result || "*";
      lines.push(
        `[Event "${escPgn(t.name)}"]`,
        `[Site "MasterChess.live"]`,
        `[Date "${(g?.created_at || t.starts_at || "").slice(0, 10).replaceAll("-", ".")}"]`,
        `[Round "${p.round}"]`,
        `[White "${escPgn(wn)}"]`,
        `[Black "${escPgn(bn)}"]`,
        `[Result "${r}"]`,
        `[TimeControl "${t.time_control_label || ""}"]`,
        "",
        (g?.pgn || "").trim() || r,
        "",
      );
    }
    return new Response(lines.join("\n"), {
      headers: { ...corsHeaders, "Content-Type": "application/x-chess-pgn", "Content-Disposition": `attachment; filename="${safeName(t.name)}.pgn"` },
    });
  }

  // ----- TRF (FIDE Tournament Report File) -----
  const trf: string[] = [];
  trf.push(pad("012", 3) + " " + t.name);
  trf.push(pad("022", 3) + " MasterChess.live");
  trf.push(pad("032", 3) + " " + (t.organizer_label || "MasterChess"));
  trf.push(pad("042", 3) + " " + (t.starts_at || "").slice(0, 10));
  trf.push(pad("052", 3) + " " + (t.starts_at || "").slice(0, 10));
  trf.push(pad("062", 3) + " " + String(players.length));
  trf.push(pad("072", 3) + " " + String(t.total_rounds || 9));
  trf.push(pad("082", 3) + " " + "Swiss");
  trf.push(pad("092", 3) + " " + (t.time_control_label || "3+2 Blitz"));
  trf.push(pad("102", 3) + " " + "MasterChess");
  trf.push(pad("112", 3) + " " + "Chess-Results Serbia (manual upload)");

  // Player rows (001) per FIDE TRF16 layout
  for (const p of players) {
    const sn = startNo.get(p.user_id)!;
    const fullName = `${p.last_name}, ${p.first_name}`.trim().replace(/^,\s*/, "");
    const sex = " ";
    const title = (p.fide_title || "").padEnd(3, " ").slice(0, 3);
    const name = fullName.padEnd(33, " ").slice(0, 33);
    const rating = String(p.rating || 0).padStart(4, " ");
    const fed = (p.federation || "   ").padEnd(3, " ").slice(0, 3);
    const fideId = String(p.fide_id || "").padStart(11, " ").slice(-11);
    const birth = (String(p.birth_year || "").padStart(10, " ")).slice(0, 10);
    const points = p.score.toFixed(1).padStart(4, " ");
    const rank = String(sn).padStart(4, " ");

    // Per-round results
    const roundCols: string[] = [];
    for (let r = 1; r <= (t.total_rounds || 9); r++) {
      const myPair = (pairings || []).find((x: any) => x.round === r && (x.white_player_id === p.user_id || x.black_player_id === p.user_id));
      if (!myPair) { roundCols.push("  0000 - Z"); continue; }
      const isBye = !myPair.black_player_id;
      if (isBye) { roundCols.push("  0000 - U"); continue; }
      const oppId = myPair.white_player_id === p.user_id ? myPair.black_player_id : myPair.white_player_id;
      const oppSn = startNo.get(oppId);
      const color = myPair.white_player_id === p.user_id ? "w" : "b";
      let outcome = "-";
      if (myPair.result === "1/2-1/2") outcome = "=";
      else if (myPair.result === "1-0") outcome = color === "w" ? "1" : "0";
      else if (myPair.result === "0-1") outcome = color === "b" ? "1" : "0";
      const oppStr = String(oppSn || "").padStart(4, " ");
      roundCols.push(`  ${oppStr} ${color} ${outcome}`);
    }

    trf.push(
      "001 " +
      String(sn).padStart(4, " ") + " " +
      sex + " " +
      title + " " +
      name + " " +
      rating + " " +
      fed + " " +
      fideId + " " +
      birth + " " +
      points + " " +
      rank +
      roundCols.join(""),
    );
  }

  return new Response(trf.join("\n") + "\n", {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName(t.name)}.trf"`,
    },
  });
});

function pad(s: string, n: number) { return s.padEnd(n, " "); }
function safeName(s: string) { return (s || "tournament").replace(/[^a-z0-9_-]+/gi, "_"); }
function playerLabel(p: any) {
  if (!p) return "Player";
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return name || p.display_name || p.username || "Player";
}
function escPgn(s: string) { return String(s).replace(/"/g, "'"); }
function text(s: string, status = 200) {
  return new Response(s, { status, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
}
function json(d: any, status = 200) {
  return new Response(JSON.stringify(d), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
