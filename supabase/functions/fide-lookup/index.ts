// Public FIDE profile lookup by FIDE ID.
// Scrapes the public ratings.fide.com profile (HTML) and returns
// { fide_id, name, federation, title, rating, birth_year } so the
// tournament registration form can auto-fill the player's identity.
//
// Hardened: tries 3 known FIDE URL shapes, falls back to the players.aspx
// classic page, and caches successful lookups in-memory for 24h so repeated
// hits don't hammer FIDE.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const UA = "Mozilla/5.0 (compatible; MasterChess.live/1.0; +https://masterchess.live)";
const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m && m[1] ? m[1].replace(/<[^>]+>/g, "").trim() : null;
}

async function tryFetch(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html,*/*" } });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

function parse(html: string, fideId: string) {
  const name =
    pick(html, /<h2[^>]*>([^<]+)<\/h2>/i) ||
    pick(html, /class=["']?profile-top-info__block__row__data["']?[^>]*>([^<]+)</i) ||
    pick(html, /<title>([^<|]+?)\s*(?:FIDE|\|)/i);

  const federation =
    pick(html, /Federation[\s\S]{0,120}?<div[^>]*>([A-Z]{3})/i) ||
    pick(html, /Federation<\/td>\s*<td[^>]*>\s*<[^>]+>\s*([A-Z]{3})/i) ||
    pick(html, /flag[\s\S]{0,40}?title=["']([A-Z]{3})["']/i);

  const title =
    pick(html, /FIDE title[\s\S]{0,140}?<div[^>]*>([^<]+)<\/div>/i) ||
    pick(html, /FIDE title<\/td>\s*<td[^>]*>([^<]+)</i);

  const birthYear =
    pick(html, /B-?Year[\s\S]{0,80}?<div[^>]*>(\d{4})<\/div>/i) ||
    pick(html, /Year of birth[\s\S]{0,80}?(\d{4})/i);

  const stdRating =
    pick(html, /std\.?\s*rating[\s\S]{0,80}?<div[^>]*>(\d{3,4})/i) ||
    pick(html, /standard[\s\S]{0,80}?(\d{3,4})/i);

  if (!name) return null;
  return {
    fide_id: fideId,
    name,
    federation: federation || null,
    title: title && title.toLowerCase() !== "none" ? title : null,
    rating: stdRating ? Number(stdRating) : null,
    birth_year: birthYear ? Number(birthYear) : null,
    profile_url: `https://ratings.fide.com/profile/${fideId}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const fideId = (url.searchParams.get("id") || "").trim();
    if (!/^\d{4,10}$/.test(fideId)) {
      return new Response(JSON.stringify({ error: "Invalid FIDE ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cached = cache.get(fideId);
    if (cached && Date.now() - cached.at < TTL_MS) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const candidates = [
      `https://ratings.fide.com/profile/${fideId}`,
      `https://ratings.fide.com/profile/${fideId}/chart`,
      `https://ratings.fide.com/card.phtml?event=${fideId}`,
    ];

    let parsed: ReturnType<typeof parse> = null;
    for (const u of candidates) {
      const html = await tryFetch(u);
      if (!html) continue;
      parsed = parse(html, fideId);
      if (parsed) break;
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: "FIDE profile not found or unparseable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    cache.set(fideId, { at: Date.now(), data: parsed });
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
