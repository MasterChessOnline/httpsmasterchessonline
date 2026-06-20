// Public read-only stats for a username. Used by the Discord bot (`!stats`).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    if (!username || username.length > 64) {
      return new Response(JSON.stringify({ error: "Bad username" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await admin.from("profiles")
      .select("username, rating, games_won, games_lost, games_drawn, games_played")
      .ilike("username", username)
      .maybeSingle();
    if (!data) {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({
      username: data.username,
      rating: data.rating ?? 1200,
      wins: data.games_won ?? 0,
      losses: data.games_lost ?? 0,
      draws: data.games_drawn ?? 0,
      games: data.games_played ?? 0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
