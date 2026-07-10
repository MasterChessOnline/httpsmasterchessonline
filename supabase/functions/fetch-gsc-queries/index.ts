// Pulls the last 28 days of top search queries from Google Search Console
// where impressions > 50 and CTR < 2%, and stores them as opportunities.
// Cron-friendly. Requires LOVABLE_API_KEY + GOOGLE_SEARCH_CONSOLE_API_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://masterchess.live/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!isAuthorizedCronCaller(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const lov = Deno.env.get("LOVABLE_API_KEY");
    const gsc = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!lov || !gsc) {
      return new Response(JSON.stringify({ error: "GSC connector not configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);

    const resp = await fetch(`${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lov}`,
        "X-Connection-Api-Key": gsc,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate, endDate,
        dimensions: ["query"],
        rowLimit: 100,
        dataState: "all",
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: "gsc_failed", detail: t }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const j = await resp.json();
    const rows = (j.rows ?? []) as Array<{ keys: string[]; impressions: number; clicks: number; ctr: number; position: number }>;

    const opportunities = rows
      .filter(r => r.impressions >= 50 && r.ctr < 0.02)
      .slice(0, 50)
      .map(r => ({
        query: r.keys[0],
        impressions: Math.round(r.impressions),
        clicks: Math.round(r.clicks),
        ctr: r.ctr,
        avg_position: r.position,
      }));

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (opportunities.length) {
      await admin.from("seo_query_opportunities").insert(opportunities);
    }

    return new Response(JSON.stringify({ ok: true, inserted: opportunities.length, total_rows: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
