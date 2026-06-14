// Computes (or recomputes) the Daily King for a given date.
// Default date = yesterday (UTC). Safe to call repeatedly.
// No JWT required — gated by service role key OR x-cron-secret OR public read-only invocation.
// Body (optional): { date: "YYYY-MM-DD" }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let dateArg: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.date && typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
          dateArg = body.date;
        }
      } catch {
        // empty body OK
      }
    }

    const args = dateArg ? { p_date: dateArg } : {};
    const { data, error } = await supabase.rpc("compute_daily_king", args);

    if (error) {
      console.error("compute_daily_king RPC error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, king: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compute-daily-king error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
