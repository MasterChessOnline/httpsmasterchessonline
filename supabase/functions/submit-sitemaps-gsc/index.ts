// Submit ALL sitemap files for masterchess.live to Google Search Console.
// PUT /webmasters/v3/sites/{site}/sitemaps/{feedpath}
//
// Two invocation modes:
//   1. Admin via Authorization Bearer JWT (manual click in admin UI)
//   2. Cron / public scheduler via header `X-Cron-Secret` matching SITEMAP_CRON_SECRET
//      OR if no secret is set, allow open invocation (idempotent — just re-tells Google to re-fetch).
//
// Safe to call as often as you like; Google rate-limits re-crawls itself.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const HOST = "masterchess.live";
const SITE = `https://${HOST}/`;
const SITE_ENC = encodeURIComponent(SITE);
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

// Every sitemap file shipped in /public.
const SITEMAPS = [
  "sitemap_index.xml",
  "sitemap.xml",
  "sitemap-bots.xml",
  "sitemap-elo.xml",
  "sitemap-famous-games.xml",
  "sitemap-glossary.xml",
  "sitemap-images.xml",
  "sitemap-mates.xml",
  "sitemap-openings.xml",
  "sitemap-players.xml",
  "sitemap-tools.xml",
  "sitemap-beat-bots.xml",
  "sitemap-puzzles.xml",
];

function gscHeaders() {
  const lov = Deno.env.get("LOVABLE_API_KEY");
  const gsc = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lov) throw new Error("LOVABLE_API_KEY missing");
  if (!gsc) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY missing");
  return {
    Authorization: `Bearer ${lov}`,
    "X-Connection-Api-Key": gsc,
    "Content-Type": "application/json",
  };
}

async function authorize(req: Request): Promise<{ ok: boolean; reason?: string }> {
  // Cron mode
  const cronSecret = Deno.env.get("SITEMAP_CRON_SECRET");
  const cronHeader = req.headers.get("x-cron-secret");
  if (cronSecret && cronHeader === cronSecret) return { ok: true };

  // Admin mode
  const auth = req.headers.get("Authorization");
  if (!auth) return { ok: false, reason: "missing auth" };
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return { ok: false, reason: "no user" };
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false, reason: "not admin" };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "auth failed" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authz = await authorize(req);
    if (!authz.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized", reason: authz.reason }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers = gscHeaders();
    const results: Array<{ sitemap: string; ok: boolean; status: number; detail?: string }> = [];

    for (const sm of SITEMAPS) {
      const fullUrl = `https://${HOST}/${sm}`;
      const endpoint = `${GATEWAY}/webmasters/v3/sites/${SITE_ENC}/sitemaps/${encodeURIComponent(fullUrl)}`;
      try {
        const r = await fetch(endpoint, { method: "PUT", headers });
        let detail: string | undefined;
        if (!r.ok) {
          try { detail = await r.text(); } catch { /* */ }
        }
        results.push({ sitemap: sm, ok: r.ok, status: r.status, detail });
      } catch (e) {
        results.push({
          sitemap: sm,
          ok: false,
          status: 0,
          detail: e instanceof Error ? e.message : "fetch failed",
        });
      }
    }

    const succeeded = results.filter((r) => r.ok).length;
    return new Response(
      JSON.stringify({
        ok: succeeded > 0,
        total: results.length,
        succeeded,
        failed: results.length - succeeded,
        results,
        submitted_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
