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

// ISO-2 (lowercase) -> FIDE/IOC 3-letter federation code.
const ISO2_TO_FED: Record<string, string> = {
  no:"NOR", rs:"SRB", us:"USA", ru:"RUS", in:"IND", cn:"CHN", ua:"UKR", by:"BLR", pl:"POL",
  de:"GER", fr:"FRA", es:"ESP", it:"ITA", hu:"HUN", nl:"NED", tr:"TUR", ar:"ARG", cu:"CUB",
  gr:"GRE", pt:"POR", ie:"IRL", uk:"ENG", gb:"ENG", ro:"ROU", bg:"BUL", cz:"CZE", sk:"SVK",
  si:"SLO", hr:"CRO", ba:"BIH", mk:"MKD", me:"MNE", al:"ALB", at:"AUT", ch:"SUI", be:"BEL",
  se:"SWE", dk:"DEN", fi:"FIN", is:"ISL", ee:"EST", lv:"LAT", lt:"LTU", md:"MDA", ge:"GEO",
  am:"ARM", az:"AZE", kz:"KAZ", uz:"UZB", tj:"TJK", kg:"KGZ", tm:"TKM", ir:"IRI", il:"ISR",
  eg:"EGY", ma:"MAR", tn:"TUN", dz:"ALG", za:"RSA", ng:"NGR", au:"AUS", nz:"NZL", jp:"JPN",
  kr:"KOR", vn:"VIE", th:"THA", ph:"PHI", id:"INA", my:"MAS", sg:"SGP", mn:"MGL", pk:"PAK",
  bd:"BAN", lk:"SRI", np:"NEP", ca:"CAN", mx:"MEX", br:"BRA", ve:"VEN", pe:"PER", cl:"CHI",
  co:"COL", ec:"ECU", uy:"URU", py:"PAR", bo:"BOL", cr:"CRC", pa:"PAN", do:"DOM", jm:"JAM",
  tt:"TTO", ci:"CIV", ke:"KEN", zw:"ZIM", zm:"ZAM", cg:"CGO", tz:"TAN", ug:"UGA",
};

const TITLE_NAME_TO_CODE: Record<string, string> = {
  "grandmaster":"GM","international master":"IM","fide master":"FM","candidate master":"CM",
  "national master":"NM","woman grandmaster":"WGM","woman international master":"WIM",
  "woman fide master":"WFM","woman candidate master":"WCM","woman national master":"WNM",
  "arena grandmaster":"AGM","arena international master":"AIM","arena fide master":"AFM",
  "arena candidate master":"ACM",
};

function extractFederation(html: string): string | null {
  // 1) Flag image inside profile-info-country: <img src="/images/flags/no.svg">
  const m1 = html.match(/profile-info-country[\s\S]{0,300}?\/flags\/([a-z]{2,3})\.(?:svg|png)/i);
  if (m1) {
    const iso = m1[1].toLowerCase();
    if (iso.length === 3) return iso.toUpperCase();
    if (ISO2_TO_FED[iso]) return ISO2_TO_FED[iso];
  }
  // 2) Text after flag inside profile-info-country
  const m2 = html.match(/profile-info-country[\s\S]{0,500}?>\s*([A-Za-z][A-Za-z .'-]{2,40})\s*</i);
  if (m2) {
    const country = m2[1].trim().toLowerCase();
    // reverse-lookup by common names
    const REV: Record<string, string> = {
      "norway":"NOR","serbia":"SRB","russia":"RUS","united states":"USA","usa":"USA",
      "india":"IND","china":"CHN","ukraine":"UKR","poland":"POL","germany":"GER",
      "france":"FRA","spain":"ESP","italy":"ITA","hungary":"HUN","netherlands":"NED",
      "croatia":"CRO","bosnia and herzegovina":"BIH","montenegro":"MNE",
      "north macedonia":"MKD","slovenia":"SLO","romania":"ROU","bulgaria":"BUL",
      "greece":"GRE","turkey":"TUR","israel":"ISR","armenia":"ARM","azerbaijan":"AZE",
      "georgia":"GEO","kazakhstan":"KAZ","uzbekistan":"UZB","england":"ENG",
      "iran":"IRI","cuba":"CUB","brazil":"BRA","argentina":"ARG",
    };
    if (REV[country]) return REV[country];
  }
  // 3) Fallback: any /rating/XXX/ or ?country=XXX
  const m3 = html.match(/\/rating\/([A-Z]{3})\//) || html.match(/(?:country|federation)=([A-Z]{3})\b/i);
  if (m3) return m3[1].toUpperCase();
  return null;
}

function extractTitle(html: string): string | null {
  // profile-info-title block: <div class="profile-info-title "><p>Grandmaster</p>
  const m = html.match(/profile-info-title[\s\S]{0,300}?<p[^>]*>\s*([^<]+?)\s*<\/p>/i);
  if (m?.[1]) {
    const raw = m[1].trim().toLowerCase();
    if (raw && raw !== "none" && raw !== "-") {
      if (TITLE_NAME_TO_CODE[raw]) return TITLE_NAME_TO_CODE[raw];
      // If already a short code like "GM"
      const upper = raw.toUpperCase();
      if (KNOWN_TITLES.has(upper)) return upper;
    }
  }
  // Fallback: explicit "FIDE title" row with code
  const m2 = html.match(/FIDE\s*title[\s\S]{0,300}?>\s*([A-Za-z]{1,5})\s*</i);
  if (m2?.[1]) {
    const t = m2[1].toUpperCase();
    if (KNOWN_TITLES.has(t)) return t;
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
  const m = html.match(/profile-info-byear[\s\S]{0,60}?>\s*(\d{4})/i)
    || html.match(/B[-\s]?Year[\s\S]{0,200}?>\s*(\d{4})\s*</i)
    || html.match(/Year\s+of\s+birth[\s\S]{0,200}?>\s*(\d{4})\s*</i)
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
      const cleaned = lastHtml.replace(/data:image[^"']+/g, "").replace(/<script[\s\S]*?<\/script>/gi, "");
      const rx = (re: RegExp, len = 2500) => { const m = cleaned.match(re); return m ? m[0].slice(0, len) : null; };
      return json({
        parsed,
        source_url: sourceUrl,
        html_length: lastHtml.length,
        cleaned_length: cleaned.length,
        after_photo: rx(/profile-games[\s\S]{0,4000}/i, 4000),
        fed_slice: rx(/Federation[\s\S]{0,600}/i, 900),
        title_slice: rx(/FIDE\s*title[\s\S]{0,600}/i, 900),
        rank_slice: rx(/(World\s*Rank|Rank\s*All)[\s\S]{0,400}/i, 700),
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
