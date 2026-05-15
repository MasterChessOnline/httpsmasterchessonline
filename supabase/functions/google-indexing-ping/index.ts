// Google Indexing API — instant URL submission to Googlebot.
// Routes through GSC connector gateway (token must include
// `https://www.googleapis.com/auth/indexing` scope).
//
// Usage:
//   POST /functions/v1/google-indexing-ping
//   Body: { urls?: string[], type?: "URL_UPDATED" | "URL_DELETED" }
//   If urls omitted → pings every URL from sitemap_index.xml.
//
// Admin-only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const HOST = "masterchess.live";
const GATEWAY_INDEXING =
  "https://connector-gateway.lovable.dev/google_search_console/indexing/v3/urlNotifications:publish";

function gatewayHeaders() {
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

async function fetchSitemapUrls(): Promise<string[]> {
  const sitemaps = [
    `https://${HOST}/sitemap.xml`,
    `https://${HOST}/sitemap-openings.xml`,
  ];
  const urls = new Set<string>();
  for (const sm of sitemaps) {
    try {
      const xml = await (await fetch(sm)).text();
      const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
      for (const m of matches) {
        const u = m.replace(/<\/?loc>/g, "").trim();
        if (u.startsWith(`https://${HOST}`)) urls.add(u);
      }
    } catch (_) { /* ignore */ }
  }
  return Array.from(urls);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Admin auth gate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const type = (body.type === "URL_DELETED" ? "URL_DELETED" : "URL_UPDATED") as
      | "URL_UPDATED" | "URL_DELETED";
    let urls: string[] = Array.isArray(body.urls)
      ? body.urls.filter((u: unknown) => typeof u === "string")
      : [];

    if (urls.length === 0) urls = await fetchSitemapUrls();
    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: "no urls to publish" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Indexing API allows 1 URL per request. Cap at 200 per call to avoid timeout.
    const batch = urls.slice(0, 200);
    const headers = gatewayHeaders();

    const results = await Promise.all(batch.map(async (url) => {
      try {
        const res = await fetch(GATEWAY_INDEXING, {
          method: "POST",
          headers,
          body: JSON.stringify({ url, type }),
        });
        const ok = res.ok;
        let detail: any = null;
        try { detail = await res.json(); } catch { /* */ }
        return { url, ok, status: res.status, detail: ok ? null : detail };
      } catch (e) {
        return { url, ok: false, status: 0, detail: e instanceof Error ? e.message : "fetch failed" };
      }
    }));

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);
    const scopeIssue = failed.some((r) =>
      JSON.stringify(r.detail ?? "").toLowerCase().includes("scope") ||
      JSON.stringify(r.detail ?? "").toLowerCase().includes("permission")
    );

    return new Response(JSON.stringify({
      ok: succeeded > 0,
      total: batch.length,
      succeeded,
      failed: failed.length,
      scopeIssue,
      hint: scopeIssue
        ? "Add the 'https://www.googleapis.com/auth/indexing' scope to the GSC connector and verify the service account is added as an Owner of the GSC property."
        : undefined,
      sample_failures: failed.slice(0, 3),
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
