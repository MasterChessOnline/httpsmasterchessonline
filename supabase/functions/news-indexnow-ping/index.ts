// Pings IndexNow (Bing + Yandex + others) for fresh news/blog URLs.
// Invoked from the client right after a successful insert.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const INDEXNOW_KEY = Deno.env.get("INDEXNOW_KEY");
const HOST = "masterchess.live";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!INDEXNOW_KEY) {
      return new Response(JSON.stringify({ skipped: "INDEXNOW_KEY missing" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/indexnow-key.txt`,
        urlList: urls.slice(0, 10000),
      }),
    });
    return new Response(JSON.stringify({ status: res.status, ok: res.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
