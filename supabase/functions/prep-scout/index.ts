import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

// Public read-only endpoint: no private account data, credentials or engine calls.
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("search"), query: z.string().trim().min(2).max(80) }),
  z.object({ action: z.literal("report"), id: z.string().regex(/^[a-zA-Z0-9_-]{2,30}$/), kind: z.enum(["online", "fide"]) }),
]);
const cache = new Map<string, { at: number; data: unknown }>();
async function get(url: string, accept = "application/json") {
  const response = await fetch(url, { headers: { Accept: accept, "User-Agent": "MasterChess-PrepScout/1.0" }, signal: AbortSignal.timeout(18000) });
  if (!response.ok) throw new Error(response.status === 429 ? "Public archive is busy. Try again later or import PGN." : "Public source is unavailable. Try again later or import PGN.");
  return response;
}
const plain = (s: string) => s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
async function fide(id: string) {
  const html = await (await get(`https://ratings.fide.com/profile/${id}`, "text/html")).text();
  const name = html.match(/<title>\s*(.*?)\s*FIDE Chess Profile/i)?.[1];
  if (!name) throw new Error("Official player record could not be verified.");
  const ratings: Record<string, number> = {};
  for (const [key, cls] of [["Standard", "standart"], ["Rapid", "rapid"], ["Blitz", "blitz"]]) {
    const value = html.match(new RegExp(`class=["'][^"']*profile-${cls}[^"']*["'][\\s\\S]{0,400}?<p[^>]*>\\s*(\\d{3,4})\\s*<`, "i"))?.[1];
    if (value) ratings[key] = Number(value);
  }
  return { player: { id, kind: "fide", name: plain(name), rating: ratings.Standard }, ratings };
}
Deno.serve(async req => {
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Enter a valid player name, account or official ID." }, 400);
    const input = parsed.data;
    const key = JSON.stringify(input);
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < 300000) return json(hit.data);
    let data: unknown;
    if (input.action === "search") {
      const players: { id: string; name: string; kind: string; title?: string; rating?: number }[] = [];
      const warnings: string[] = [];
      await Promise.all([
        (async () => {
          try {
            const body = await (await get(`https://lichess.org/api/player/autocomplete?term=${encodeURIComponent(input.query)}&object=true`)).json();
            for (const p of (body.result || []).slice(0, 8)) if (p.id && p.name) players.push({ id: p.id, name: p.name, title: p.title, kind: "online" });
          } catch { warnings.push("Online account search is temporarily unavailable."); }
        })(),
        (async () => {
          try {
            if (/^\d{4,10}$/.test(input.query)) { players.push((await fide(input.query)).player); return; }
            const html = await (await get(`https://ratings.fide.com/incl_search_l.php?search=${encodeURIComponent(input.query)}&simple=1`, "text/html")).text();
            const matches = [...html.matchAll(/href\s*=\s*["']?(?:https:\/\/ratings\.fide\.com)?\/(?:profile\/(\d+)|card\.phtml\?event=(\d+))["']?[^>]*>([\s\S]*?)<\/a>/gi)].slice(0, 12);
            for (const m of matches) if (plain(m[3])) players.push({ id: m[1] || m[2], name: plain(m[3]), kind: "fide" });
            if (!matches.length) warnings.push("No official name match returned. Search by official player ID for a precise lookup.");
          } catch { warnings.push("Official name search is unavailable. Try an official player ID."); }
        })(),
      ]);
      data = { players, warnings };
    } else if (input.kind === "fide") {
      if (!/^\d{4,10}$/.test(input.id)) return json({ error: "Invalid official ID" }, 400);
      data = { ...await fide(input.id), games: [], warnings: ["Official ratings record only. Tournament games are not supplied by this source. Import an authorized PGN archive to build the repertoire."], fetchedAt: new Date().toISOString() };
    } else {
      const p = await (await get(`https://lichess.org/api/user/${encodeURIComponent(input.id)}`)).json();
      const ratings: Record<string, number> = {};
      for (const type of ["bullet", "blitz", "rapid", "classical"]) if (p.perfs?.[type]?.rating) ratings[type] = p.perfs[type].rating;
      const games: unknown[] = [];
      const warnings: string[] = [];
      try {
        const text = await (await get(`https://lichess.org/api/games/user/${encodeURIComponent(input.id)}?max=100&opening=true&pgnInJson=true&ongoing=false&finished=true`, "application/x-ndjson")).text();
        for (const line of text.split("\n").filter(Boolean)) {
          const g = JSON.parse(line);
          if (!g.pgn || g.variant !== "standard" || ["created", "started", "aborted"].includes(g.status)) continue;
          games.push({ id: g.id, white: g.players?.white?.user?.name || "Anonymous", black: g.players?.black?.user?.name || "Anonymous", result: g.winner === "white" ? "1-0" : g.winner === "black" ? "0-1" : "1/2-1/2", date: new Date(g.createdAt).toISOString().slice(0, 10), event: g.tournament ? `Tournament ${g.tournament}` : `${g.speed || ""} ${g.rated ? "rated" : "casual"}`, opening: g.opening?.name || "Unclassified", eco: g.opening?.eco || "—", pgn: g.pgn });
        }
      } catch (e) { warnings.push(e instanceof Error ? e.message : "Game archive unavailable."); }
      data = { player: { id: p.id, name: p.username, title: p.title, kind: "online" }, ratings, games, warnings, fetchedAt: new Date().toISOString() };
    }
    if (cache.size > 200) cache.clear();
    cache.set(key, { at: Date.now(), data });
    return json(data);
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Search unavailable. Try again." }, 502); }
});