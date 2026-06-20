// Pings IndexNow with one or more URLs. IndexNow is supported by Bing,
// Yandex, Seznam, Naver — instant notification beats waiting for crawlers.
// Body: { urls?: string[] }  (defaults to scanning public/sitemap-style endpoints)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOST = "masterchess.live";
const KEY = "4f83d558d0d3ec7b2398bf19c3c84c1b";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_INDEX = `https://${HOST}/sitemap_index.xml`;

async function urlsFromSitemap(url: string): Promise<string[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    return locs;
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let urls: string[] = [];
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.urls)) urls = body.urls;
    }

    if (!urls.length) {
      // Pull all sub-sitemaps from the index, then every URL inside them.
      const subs = await urlsFromSitemap(SITEMAP_INDEX);
      const sets = await Promise.all(
        (subs.length ? subs : [`https://${HOST}/sitemap.xml`]).map(urlsFromSitemap),
      );
      urls = [...new Set(sets.flat())].filter((u) => u.startsWith(`https://${HOST}`));
    }

    // IndexNow accepts up to 10 000 URLs per request; batch by 1 000 for safety.
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += 1000) batches.push(urls.slice(i, i + 1000));

    const results: Array<{ status: number; count: number }> = [];
    for (const batch of batches) {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: HOST,
          key: KEY,
          keyLocation: KEY_LOCATION,
          urlList: batch,
        }),
      });
      results.push({ status: res.status, count: batch.length });
    }

    await admin.from("site_config").upsert({
      key: "indexnow_last_run",
      value: {
        ran_at: new Date().toISOString(),
        total_urls: urls.length,
        batches: results,
      },
    });

    return new Response(
      JSON.stringify({ ok: true, total_urls: urls.length, batches: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
