// Cron-triggered: marks due scheduled gbp_posts as "ready_to_post" and
// pings IndexNow for the post's CTA URL so Bing/Yandex pick it up instantly.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOST = "masterchess.live";
const INDEXNOW_KEY = "4f83d558d0d3ec7b2398bf19c3c84c1b";

async function pingIndexNow(urls: string[]) {
  if (!urls.length) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch {
    // best-effort
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const now = new Date().toISOString();
    const { data: due, error } = await admin
      .from("gbp_posts")
      .select("id, title, cta_url")
      .eq("status", "scheduled")
      .lte("scheduled_for", now)
      .limit(50);
    if (error) throw error;

    const pingUrls: string[] = [];
    let processed = 0;
    for (const post of due ?? []) {
      const { error: updErr } = await admin
        .from("gbp_posts")
        .update({ status: "ready_to_post" })
        .eq("id", post.id);
      if (!updErr) {
        processed++;
        if (post.cta_url && post.cta_url.startsWith(`https://${HOST}`)) {
          // Strip UTM so IndexNow gets the canonical URL.
          try {
            const u = new URL(post.cta_url);
            u.search = "";
            pingUrls.push(u.toString());
          } catch {
            // ignore malformed
          }
        }
      }
    }

    if (pingUrls.length) await pingIndexNow([...new Set(pingUrls)]);

    return new Response(JSON.stringify({ processed, total_due: due?.length ?? 0, indexnow: pingUrls.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
