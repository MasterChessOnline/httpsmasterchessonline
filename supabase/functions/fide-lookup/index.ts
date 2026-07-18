// Public FIDE profile lookup by FIDE ID.
// Returns { fide_id, name, federation, title, standard_rating, rapid_rating,
// blitz_rating, birth_year, profile_url }. Parses the current
// ratings.fide.com profile page with multiple fallback strategies so it keeps
// working when FIDE tweaks the markup.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();

async function tryFetch(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

const KNOWN_TITLES = new Set([
  "GM","IM","FM","CM","NM","WGM","WIM","WFM","WCM","WNM","AGM","AIM","AFM","ACM","AWM"
]);

function extractName(html: string): string | null {
  // 1) <title>Carlsen, Magnus FIDE Chess Profile</title>
  const t = html.match(/<title>\s*([^<]*?)\s*(?:FIDE\s+Chess\s+Profile|\|)/i);
  if (t?.[1]) {
    const cand = t[1].replace(/\s+/g, " ").trim();
    if (cand && !/^international$/i.test(cand) && cand.length > 1) return cand;
  }
  // 2) og:title / twitter:title meta
  const og = html.match(/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) {
    const c = og[1].replace(/FIDE\s+Chess\s+Profile/i, "").replace(/\s+/g, " ").trim();
    if (c && !/^international$/i.test(c)) return c;
  }
  // 3) profile header h1/h2 close to "Federation" label
  const h = html.match(/<h1[^>]*>\s*([^<]{3,80})\s*<\/h1>/i) || html.match(/<h2[^>]*>\s*([^<]{3,80})\s*<\/h2>/i);
  if (h?.[1]) {
    const c = stripTags(h[1]);
    if (c && !/^international$/i.test(c) && !/^federation$/i.test(c)) return c;
  }
  return null;
}

function extractFederation(html: string): string | null {
  // link like /rating/NOR/ or href="?country=NOR"
  const m1 = html.match(/\/rating\/([A-Z]{3})\//);
  if (m1) return m1[1];
  const m2 = html.match(/(?:country|federation)=([A-Z]{3})\b/i);
  if (m2) return m2[1].toUpperCase();
  const m3 = html.match(/\bflag[^>]*(?:title|alt)=["']([A-Z]{3})["']/i);
  if (m3) return m3[1].toUpperCase();
  // fallback: label "Federation" followed by 3-letter code in any tag
  const m4 = html.match(/Federation[\s\S]{0,200}?\b([A-Z]{3})\b/);
  if (m4) return m4[1];
  return null;
}

function extractTitle(html: string): string | null {
  // Explicit "FIDE title" row
  const m = html.match(/FIDE\s*title[\s\S]{0,200}?>\s*([A-Za-z]{1,5})\s*</i);
  if (m?.[1]) {
    const t = m[1].toUpperCase();
    if (KNOWN_TITLES.has(t)) return t;
  }
  // Any known title token in the profile header block (skip in ratings table)
  const head = html.slice(0, 8000);
  for (const tt of KNOWN_TITLES) {
    const re = new RegExp(`\\b${tt}\\b`);
    if (re.test(head)) return tt;
  }
  return null;
}

function extractRatings(html: string): { standard: number | null; rapid: number | null; blitz: number | null } {
  // ratings.fide.com profile: divs with class="profile-standart|profile-rapid|profile-blitz"
  // containing <p>2823</p> as the current rating. Note FIDE's typo "standart".
  const grabByClass = (cls: string): number | null => {
    const re = new RegExp(`class=["'][^"']*${cls}[^"']*["'][^>]*>[\\s\\S]{0,400}?<p[^>]*>\\s*(\\d{3,4})\\s*<`, "i");
    const m = html.match(re);
    if (m) {
      const n = Number(m[1]);
      if (n >= 800 && n <= 3600) return n;
    }
    return null;
  };
  const std = grabByClass("profile-standart") ?? grabByClass("profile-standard");
  const rap = grabByClass("profile-rapid");
  const bli = grabByClass("profile-blitz");
  return { standard: std, rapid: rap, blitz: bli };
}


function extractBirthYear(html: string): number | null {
  const m = html.match(/B[-\s]?Year[\s\S]{0,120}?>\s*(\d{4})\s*</i)
    || html.match(/Year\s+of\s+birth[\s\S]{0,120}?>\s*(\d{4})\s*</i)
    || html.match(/Born\s*(?:in)?[\s\S]{0,40}?(\d{4})/i);
  if (m) {
    const y = Number(m[1]);
    if (y >= 1900 && y <= new Date().getFullYear()) return y;
  }
  return null;
}

function parse(html: string, fideId: string) {
  const name = extractName(html);
  if (!name) return null;
  const federation = extractFederation(html);
  const title = extractTitle(html);
  const { standard, rapid, blitz } = extractRatings(html);
  const birth = extractBirthYear(html);
  return {
    fide_id: fideId,
    name,
    federation: federation ? federation.toUpperCase() : null,
    title,
    standard_rating: standard,
    rapid_rating: rapid,
    blitz_rating: blitz,
    // legacy alias
    rating: standard,
    birth_year: birth,
    profile_url: `https://ratings.fide.com/profile/${fideId}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const fideId = (url.searchParams.get("id") || "").trim();
    const fresh = url.searchParams.get("fresh") === "1";
    const debug = url.searchParams.get("debug") === "1";
    if (!/^\d{4,10}$/.test(fideId)) {
      return json({ error: "Invalid FIDE ID" }, 400);
    }

    if (!fresh && !debug) {
      const cached = cache.get(fideId);
      if (cached && Date.now() - cached.at < TTL_MS) {
        return json(cached.data, 200, { "X-Cache": "HIT" });
      }
    }

    const candidates = [
      `https://ratings.fide.com/profile/${fideId}`,
      `https://ratings.fide.com/profile/${fideId}/chart`,
    ];

    let parsed: ReturnType<typeof parse> = null;
    let lastHtml = "";
    let sourceUrl = "";
    for (const u of candidates) {
      const html = await tryFetch(u);
      if (!html) continue;
      lastHtml = html;
      sourceUrl = u;
      parsed = parse(html, fideId);
      if (parsed) break;
    }

    if (debug) {
      // Admin-only diagnostic — returns small HTML slice + parsed result.
      const rx = (re: RegExp) => { const m = lastHtml.match(re); return m ? m[0].slice(0, 800) : null; };
      return json({
        parsed,
        source_url: sourceUrl,
        html_length: lastHtml.length,
        federation_slice: rx(/[\s\S]{0,120}(Federation|country|profile-info)[\s\S]{0,500}/i),
        title_slice: rx(/[\s\S]{0,120}(FIDE\s*title|profile-title)[\s\S]{0,500}/i),
        ratings_slice: rx(/[\s\S]{0,120}profile-standart[\s\S]{0,1200}/i),
        flag_slice: rx(/[\s\S]{0,80}flag[\s\S]{0,300}/i),
      });
    }


    if (!parsed) {
      return json({ error: "FIDE ID not found. Please check the number and try again." }, 404);
    }

    cache.set(fideId, { at: Date.now(), data: parsed });
    return json(parsed, 200, { "X-Cache": fresh ? "BYPASS" : "MISS" });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}
