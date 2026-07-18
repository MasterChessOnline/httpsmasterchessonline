// Semrush weekly intel. Pulls our domain overview + writes gap findings to
// seo_query_opportunities so the auto-generator can turn them into pages.
// Cron: monday 08:00 UTC.
import { corsHeaders } from "../_shared/cors.ts";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const GATEWAY = "https://connector-gateway.lovable.dev/semrush";

async function sem(method: string, path: string, params: Record<string, string>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SEMRUSH_API_KEY = Deno.env.get("SEMRUSH_API_KEY");
  if (!LOVABLE_API_KEY || !SEMRUSH_API_KEY) throw new Error("Semrush not configured");
  const url = new URL(`${GATEWAY}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": SEMRUSH_API_KEY,
      "Allow-Limit-Offset": "true",
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Semrush ${r.status}: ${text}`);
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!isAuthorizedCronCaller(req)) {
      const auth = req.headers.get("Authorization");
      const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth ?? "" } },
      });
      const { data: u } = await uc.auth.getUser();
      const { data: isAdmin } = u?.user ? await uc.rpc("has_role", { _user_id: u.user.id, _role: "admin" }) : { data: false };
      if (!isAdmin) return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Our current keywords
    let ours: any[] = [];
    try {
      const o = await sem("GET", "/domains/domain_organic", {
        domain: "masterchess.live",
        database: "us",
        display_limit: "200",
        export_columns: "Ph,Po,Nq,Cp",
      });
      ours = o?.data?.rows ?? [];
    } catch (e) {
      console.warn("our-domain fetch failed:", (e as Error).message);
    }
    const oursSet = new Set(ours.map((r: any) => (r.Ph ?? "").toLowerCase()));

    // Competitor keywords (chess.com is huge — take top 200 sample)
    let comp: any[] = [];
    try {
      const c = await sem("GET", "/domains/domain_organic", {
        domain: "chess.com",
        database: "us",
        display_limit: "200",
        export_columns: "Ph,Po,Nq,Cp",
      });
      comp = c?.data?.rows ?? [];
    } catch (e) {
      console.warn("competitor fetch failed:", (e as Error).message);
    }

    // Gap: competitor ranks top 20, we don't rank at all
    const now = new Date().toISOString();
    const gaps: any[] = [];
    for (const row of comp) {
      const phrase = String(row.Ph ?? "").toLowerCase();
      const pos = Number(row.Po ?? 100);
      const volume = Number(row.Nq ?? 0);
      if (!phrase || pos > 20 || volume < 100) continue;
      if (oursSet.has(phrase)) continue;
      gaps.push({
        query: phrase,
        impressions: volume,
        clicks: 0,
        ctr: 0,
        avg_position: 100,
        picked_up_at: now,
        acted_on: false,
      });
    }

    let inserted = 0;
    for (const g of gaps.slice(0, 50)) {
      const { error } = await admin.from("seo_query_opportunities").insert(g);
      if (!error) inserted++;
    }

    return new Response(JSON.stringify({
      ok: true, our_keywords: ours.length, competitor_keywords: comp.length,
      gaps_found: gaps.length, gaps_inserted: inserted,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("semrush-weekly-intel", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
