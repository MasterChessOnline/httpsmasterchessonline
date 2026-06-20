// Cron-triggered: marks due scheduled gbp_posts as "ready_to_post".
// When a Google Business Profile API connector is added later, this is the place
// to call accountManagement + posts.create. For now, it flips status so the
// admin UI surfaces them with a "Copy" action.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const now = new Date().toISOString();
    const { data: due, error } = await admin
      .from("gbp_posts")
      .select("id, title")
      .eq("status", "scheduled")
      .lte("scheduled_for", now)
      .limit(50);
    if (error) throw error;

    let processed = 0;
    for (const post of due ?? []) {
      // TODO: when GBP API connector is connected, POST to
      // https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
      // For now we surface them as "ready_to_post" for the admin UI.
      const { error: updErr } = await admin
        .from("gbp_posts")
        .update({ status: "ready_to_post" })
        .eq("id", post.id);
      if (!updErr) processed++;
    }

    return new Response(JSON.stringify({ processed, total_due: due?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
