// Admin-only GSC opportunity miner.
// Returns three actionable reports from the last 28 days:
//   1. striking_distance — queries ranking 5–20 (fastest wins)
//   2. low_ctr_pages     — high impressions, CTR below threshold (rewrite title/desc)
//   3. sitemap_health    — per-sitemap error/warning counts as reported by Google
import { corsHeaders } from "../_shared/cors.ts";
import { isAdminCaller } from "../_shared/admin-auth.ts";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE = "https://masterchess.live/";
const SITE_ENC = encodeURIComponent(SITE);

function gscHeaders() {
  const lov = Deno.env.get("LOVABLE_API_KEY");
  const key = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lov || !key) throw new Error("Google Search Console is not configured");
  return {
    Authorization: `Bearer ${lov}`,
    "X-Connection-Api-Key": key,
    "Content-Type": "application/json",
  };
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function query(body: Record<string, unknown>) {
  const res = await fetch(`${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`, {
    method: "POST",
    headers: gscHeaders(),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GSC ${res.status}: ${text}`);
  return JSON.parse(text);
}

type Row = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!isAuthorizedCronCaller(req) && !(await isAdminCaller(req))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startDate = isoDaysAgo(28);
    const endDate = isoDaysAgo(2);

    const [queryPageRows, pageRows, sitemapsRes] = await Promise.all([
      query({
        startDate, endDate,
        dimensions: ["query", "page"],
        rowLimit: 500,
      }).then((r) => (r?.rows ?? []) as Row[]).catch(() => [] as Row[]),
      query({
        startDate, endDate,
        dimensions: ["page"],
        rowLimit: 200,
      }).then((r) => (r?.rows ?? []) as Row[]).catch(() => [] as Row[]),
      fetch(`${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/sitemaps`, { headers: gscHeaders() })
        .then((r) => r.json())
        .catch(() => ({})),
    ]);

    // 1. Striking distance: position 5–20, at least a few impressions.
    const striking = queryPageRows
      .filter((r) => (r.position ?? 99) >= 5 && (r.position ?? 99) <= 20 && (r.impressions ?? 0) >= 5)
      .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
      .slice(0, 50)
      .map((r) => ({
        query: r.keys?.[0] ?? "",
        page: (r.keys?.[1] ?? "").replace(/^https?:\/\/[^/]+/, "") || "/",
        impressions: r.impressions ?? 0,
        clicks: r.clicks ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      }));

    // 2. Low CTR pages: impressions >= 50 and CTR < 2%.
    const lowCtr = pageRows
      .filter((r) => (r.impressions ?? 0) >= 50 && (r.ctr ?? 0) < 0.02)
      .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
      .slice(0, 30)
      .map((r) => ({
        page: (r.keys?.[0] ?? "").replace(/^https?:\/\/[^/]+/, "") || "/",
        impressions: r.impressions ?? 0,
        clicks: r.clicks ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      }));

    // 3. Sitemap health as Google reports it (counts only — not causes).
    const sitemapHealth = ((sitemapsRes?.sitemap ?? []) as Array<Record<string, unknown>>).map((s) => ({
      path: String(s.path ?? "").replace(/^https?:\/\/[^/]+/, ""),
      lastSubmitted: s.lastSubmitted ?? null,
      lastDownloaded: s.lastDownloaded ?? null,
      errors: Number(s.errors ?? 0),
      warnings: Number(s.warnings ?? 0),
      isPending: Boolean(s.isPending),
      submitted: Number(
        (Array.isArray(s.contents) && (s.contents as Array<Record<string, unknown>>)[0]?.submitted) || 0,
      ),
      indexed: Number(
        (Array.isArray(s.contents) && (s.contents as Array<Record<string, unknown>>)[0]?.indexed) || 0,
      ),
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        period: { start: startDate, end: endDate },
        striking_distance: striking,
        low_ctr_pages: lowCtr,
        sitemap_health: sitemapHealth,
        note: "Sitemap error/warning values are counts reported by Google, not causes.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("gsc-opportunities", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
