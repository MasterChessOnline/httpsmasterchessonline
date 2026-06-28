// Public FIDE profile lookup by FIDE ID.
// Scrapes the public ratings.fide.com/profile/<id> page (HTML) and returns
// { fide_id, name, federation, title, rating, birth_year } so the tournament
// registration form can auto-fill the player's identity.
//
// No auth required — this only reads publicly available FIDE data.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const FIDE_PROFILE_URL = (id: string) => `https://ratings.fide.com/profile/${id}`;

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m && m[1] ? m[1].replace(/<[^>]+>/g, "").trim() : null;
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

    const resp = await fetch(FIDE_PROFILE_URL(fideId), {
      headers: { "User-Agent": "MasterChess.live FIDE lookup" },
    });
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "FIDE profile not found", status: resp.status }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const html = await resp.text();

    // FIDE profile pages put the player name in <h2 ...>NAME</h2> at the top of the profile card.
    // Federation, title, birth year and standard rating sit in <div class="profile-info-row">…</div> blocks.
    const name =
      pick(html, /<h2[^>]*>([^<]+)<\/h2>/i) ||
      pick(html, /<title>([^<|]+)\s*\|/i);

    const federation = pick(html, /Federation[\s\S]{0,80}?<div[^>]*>([A-Z]{3})/i);
    const title = pick(html, /FIDE title[\s\S]{0,120}?<div[^>]*>([^<]+)<\/div>/i);
    const birthYear = pick(html, /B-Year[\s\S]{0,80}?<div[^>]*>(\d{4})<\/div>/i);
    const stdRating = pick(html, /std\.?\s*rating[\s\S]{0,80}?<div[^>]*>(\d{3,4})/i);

    if (!name) {
      return new Response(JSON.stringify({ error: "Could not parse FIDE profile" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        fide_id: fideId,
        name,
        federation: federation || null,
        title: title && title.toLowerCase() !== "none" ? title : null,
        rating: stdRating ? Number(stdRating) : null,
        birth_year: birthYear ? Number(birthYear) : null,
        profile_url: FIDE_PROFILE_URL(fideId),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
