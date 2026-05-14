// Google Search Console status proxy: sitemaps + 28-day search analytics for masterchess.live.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SITE = "https://masterchess.live/";
const SITE_ENC = encodeURIComponent(SITE);
const SITEMAP_URL = "https://masterchess.live/sitemap.xml";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

function gscHeaders() {
  const lov = Deno.env.get("LOVABLE_API_KEY");
  const gsc = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lov) throw new Error("LOVABLE_API_KEY not configured");
  if (!gsc) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY not configured");
  return {
    Authorization: `Bearer ${lov}`,
    "X-Connection-Api-Key": gsc,
    "Content-Type": "application/json",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth + admin check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const action = new URL(req.url).searchParams.get("action") ?? "status";
    const headers = gscHeaders();

    // Resubmit sitemap action
    if (action === "resubmit") {
      const r = await fetch(
        `${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`,
        { method: "PUT", headers },
      );
      return new Response(
        JSON.stringify({ ok: r.ok, status: r.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch sitemaps
    const sitemapsRes = await fetch(
      `${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/sitemaps`,
      { headers },
    );
    const sitemapsJson = sitemapsRes.ok ? await sitemapsRes.json() : { sitemap: [] };

    // Search analytics last 28d (totals)
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const startD = new Date(today.getTime() - 28 * 86400_000).toISOString().slice(0, 10);

    const totalsRes = await fetch(
      `${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ startDate: startD, endDate: end, dimensions: [] }),
      },
    );
    const totals = totalsRes.ok ? await totalsRes.json() : { rows: [] };

    // Top queries
    const queriesRes = await fetch(
      `${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          startDate: startD,
          endDate: end,
          dimensions: ["query"],
          rowLimit: 10,
        }),
      },
    );
    const queries = queriesRes.ok ? await queriesRes.json() : { rows: [] };

    // Top pages
    const pagesRes = await fetch(
      `${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          startDate: startD,
          endDate: end,
          dimensions: ["page"],
          rowLimit: 10,
        }),
      },
    );
    const pages = pagesRes.ok ? await pagesRes.json() : { rows: [] };

    return new Response(
      JSON.stringify({
        site: SITE,
        period: { startDate: startD, endDate: end },
        sitemaps: sitemapsJson.sitemap ?? [],
        totals: totals.rows?.[0] ?? null,
        topQueries: queries.rows ?? [],
        topPages: pages.rows ?? [],
        checked_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
