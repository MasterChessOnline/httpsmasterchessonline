// GSC full audit: sitemaps, top queries, top pages, coverage summary — one call
import { corsHeaders } from "../_shared/cors.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/google-search-console";
const SITE = "https://masterchess.live/";

function auth() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const K = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!LOVABLE_API_KEY || !K) throw new Error("GSC not configured");
  return { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": K };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const headers = auth();
    const site = encodeURIComponent(SITE);
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10);

    const [sitemaps, queries, pages, countries] = await Promise.all([
      fetch(`${GATEWAY}/webmasters/v3/sites/${site}/sitemaps`, { headers }).then(r => r.json()),
      fetch(`${GATEWAY}/webmasters/v3/sites/${site}/searchAnalytics/query`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: from, endDate: today, dimensions: ["query"], rowLimit: 50 }),
      }).then(r => r.json()),
      fetch(`${GATEWAY}/webmasters/v3/sites/${site}/searchAnalytics/query`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: from, endDate: today, dimensions: ["page"], rowLimit: 50 }),
      }).then(r => r.json()),
      fetch(`${GATEWAY}/webmasters/v3/sites/${site}/searchAnalytics/query`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: from, endDate: today, dimensions: ["country"], rowLimit: 20 }),
      }).then(r => r.json()),
    ]);

    return new Response(JSON.stringify({ site: SITE, range: { from, to: today }, sitemaps, queries, pages, countries }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("gsc-full-audit", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
