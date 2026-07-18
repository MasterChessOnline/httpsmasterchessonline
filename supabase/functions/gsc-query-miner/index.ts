// Weekly GSC query miner. Pulls last 28d searchAnalytics and writes:
// - opportunities (impressions>=50, position>10) → seo_query_opportunities
// - CTR losers (position 3-10, ctr<0.02) → seo_query_opportunities (with suggested_page)
// - cannibalization (>=2 pages ranking for same query) → seo_cannibalization
// Auth: admin bearer OR cron (service role / x-cron-secret).
import { corsHeaders } from "../_shared/cors.ts";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE = "https://masterchess.live/";
const SITE_ENC = encodeURIComponent(SITE);

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function gscQuery(body: Record<string, unknown>) {
  const res = await fetch(`${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "X-Connection-Api-Key": Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY") ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GSC ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function isAdminCaller(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const c = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u } = await c.auth.getUser();
  if (!u?.user) return false;
  const { data } = await c.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authorized = isAuthorizedCronCaller(req) || (await isAdminCaller(req));
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY")) {
      return new Response(JSON.stringify({ error: "GSC connector not linked" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const startDate = isoDaysAgo(28);
    const endDate = isoDaysAgo(1);

    // Aggregate by query
    const byQuery = await gscQuery({
      startDate, endDate, dimensions: ["query"], rowLimit: 500,
    });
    // Aggregate by query+page (for cannibalization)
    const byQueryPage = await gscQuery({
      startDate, endDate, dimensions: ["query", "page"], rowLimit: 5000,
    });

    const opportunities: any[] = [];
    const ctrLosers: any[] = [];
    for (const row of byQuery.rows ?? []) {
      const q = row.keys?.[0] as string;
      if (!q) continue;
      const impressions = row.impressions ?? 0;
      const clicks = row.clicks ?? 0;
      const ctr = row.ctr ?? 0;
      const pos = row.position ?? 999;
      if (impressions >= 50 && pos > 10) {
        opportunities.push({ query: q, impressions, clicks, ctr, avg_position: pos });
      }
      if (pos >= 3 && pos <= 10 && ctr < 0.02 && impressions >= 30) {
        ctrLosers.push({ query: q, impressions, clicks, ctr, avg_position: pos });
      }
    }

    // Cannibalization: same query, >=2 pages with impressions
    const byQueryMap = new Map<string, { page: string; impressions: number; position: number }[]>();
    for (const row of byQueryPage.rows ?? []) {
      const [q, page] = row.keys ?? [];
      if (!q || !page) continue;
      const arr = byQueryMap.get(q) ?? [];
      arr.push({ page, impressions: row.impressions ?? 0, position: row.position ?? 999 });
      byQueryMap.set(q, arr);
    }
    const cannibals: any[] = [];
    for (const [q, pages] of byQueryMap.entries()) {
      const relevant = pages.filter((p) => p.impressions >= 5);
      if (relevant.length >= 2) {
        relevant.sort((a, b) => a.position - b.position);
        cannibals.push({
          query: q,
          urls: relevant.slice(0, 6),
          suggested_canonical: relevant[0].page,
          impressions: relevant.reduce((a, p) => a + p.impressions, 0),
        });
      }
    }

    const now = new Date().toISOString();
    // Insert opportunities (unique on (query, picked_up_at))
    let insertedOpps = 0;
    for (const o of [...opportunities, ...ctrLosers]) {
      const { error } = await admin.from("seo_query_opportunities").insert({
        ...o, picked_up_at: now, acted_on: false,
      });
      if (!error) insertedOpps++;
    }
    let insertedCann = 0;
    for (const c of cannibals) {
      const { error } = await admin.from("seo_cannibalization").insert({
        ...c, detected_at: now,
      });
      if (!error) insertedCann++;
    }

    return new Response(JSON.stringify({
      ok: true, opportunities: opportunities.length, ctr_losers: ctrLosers.length,
      cannibalization: cannibals.length, inserted_opps: insertedOpps, inserted_cann: insertedCann,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("gsc-query-miner", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
