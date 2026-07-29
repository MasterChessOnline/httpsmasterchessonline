// Deletes tournaments that reached their start time with 0 registrations.
// Tournaments with players are moved to `active` instead.
// Scheduled every 5 minutes via pg_cron.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: due } = await admin
      .from("tournaments")
      .select("id, name")
      .lte("starts_at", new Date().toISOString())
      .in("status", ["registering", "upcoming"]);

    const deleted: string[] = [];
    const activated: string[] = [];

    for (const t of due ?? []) {
      const { count } = await admin
        .from("tournament_registrations")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", t.id);

      if (!count || count === 0) {
        // Bypass validate_tournament_changes lock via RPC-less path: direct delete works
        // because the trigger only guards UPDATE of start time.
        const { error } = await admin.from("tournaments").delete().eq("id", t.id);
        if (!error) deleted.push(t.name);
      } else {
        const { error } = await admin
          .from("tournaments")
          .update({ status: "active" })
          .eq("id", t.id);
        if (!error) activated.push(t.name);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, deleted, activated, checked: due?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("tournament-auto-cleanup error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
