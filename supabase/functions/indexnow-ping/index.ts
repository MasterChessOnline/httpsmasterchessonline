// IndexNow ping — instantly tells Bing, Yandex, Seznam, Naver, Yep about new/changed URLs.
// Google doesn't use IndexNow but DOES crawl Bing's index, so this still accelerates discovery.
//
// Usage: POST /functions/v1/indexnow-ping with { urls?: string[] }
// If no urls passed, it pings every URL from sitemap_index.xml.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const HOST = "masterchess.live";
const KEY = "4f83d558d0d3ec7b2398bf19c3c84c1b"; // matches public/indexnow-key.txt
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function fetchAllSitemapUrls(): Promise<string[]> {
  const sitemaps = [
    `https://${HOST}/sitemap.xml`,
    `https://${HOST}/sitemap-openings.xml`,
  ];
  const urls: string[] = [];
  for (const sm of sitemaps) {
    try {
      const xml = await (await fetch(sm)).text();
      const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
      for (const m of matches) {
        const u = m.replace(/<\/?loc>/g, "").trim();
        if (u.startsWith(`https://${HOST}`)) urls.push(u);
      }
    } catch (_) { /* ignore */ }
  }
  return Array.from(new Set(urls));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let urlList: string[] = [];
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body?.urls)) {
        urlList = body.urls.filter(
          (u: any) => typeof u === "string" && u.startsWith(`https://${HOST}`)
        );
      }
    }
  } catch (_) { /* noop */ }

  if (urlList.length === 0) urlList = await fetchAllSitemapUrls();
  if (urlList.length === 0) {
    return new Response(JSON.stringify({ error: "no urls" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // IndexNow allows up to 10,000 URLs per request
  const batch = urlList.slice(0, 10000);
  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  return new Response(
    JSON.stringify({ ok: res.ok, status: res.status, pinged: batch.length, sample: batch.slice(0, 5) }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
