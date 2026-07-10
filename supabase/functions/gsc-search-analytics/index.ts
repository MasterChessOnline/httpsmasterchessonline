// Pulls Search Console analytics for masterchess.live and returns
// admin-friendly aggregations: top queries, top pages, week-over-week deltas.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE = "https://masterchess.live/";
const SITE_ENC = encodeURIComponent(SITE);

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function query(body: Record<string, unknown>) {
  const res = await fetch(
    `${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "X-Connection-Api-Key": Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY") ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`GSC ${res.status}: ${text}`);
  return JSON.parse(text);
}

function totals(rows: Array<any>) {
  return rows.reduce(
    (a, r) => ({
      clicks: a.clicks + (r.clicks ?? 0),
      impressions: a.impressions + (r.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // Admin-only endpoint.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: auth } = await userClient.auth.getUser();
    if (!auth?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "GSC connector not linked" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const last28 = await query({
      startDate: isoDaysAgo(28),
      endDate: isoDaysAgo(1),
      dimensions: ["query"],
      rowLimit: 50,
    });
    const topPages = await query({
      startDate: isoDaysAgo(28),
      endDate: isoDaysAgo(1),
      dimensions: ["page"],
      rowLimit: 50,
    });
    const thisWeek = await query({
      startDate: isoDaysAgo(7),
      endDate: isoDaysAgo(1),
      dimensions: [],
      rowLimit: 1,
    });
    const lastWeek = await query({
      startDate: isoDaysAgo(14),
      endDate: isoDaysAgo(8),
      dimensions: [],
      rowLimit: 1,
    });

    const tw = totals(thisWeek.rows ?? []);
    const lw = totals(lastWeek.rows ?? []);

    return new Response(
      JSON.stringify({
        ok: true,
        site: SITE,
        period: { start: isoDaysAgo(28), end: isoDaysAgo(1) },
        weekOverWeek: {
          this_week: tw,
          last_week: lw,
          clicks_delta_pct: lw.clicks ? ((tw.clicks - lw.clicks) / lw.clicks) * 100 : 0,
        },
        top_queries: last28.rows ?? [],
        top_pages: topPages.rows ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
