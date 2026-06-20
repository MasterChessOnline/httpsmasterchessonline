// Exchanges a Discord OAuth2 `code` for tokens, fetches the user, and links the
// Discord identity to the calling MasterChess account.
//
// Required secrets: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(auth.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const { code, redirect_uri, unlink } = await req.json();

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (unlink) {
      await admin.from("profiles").update({
        discord_user_id: null, discord_username: null, discord_avatar: null, discord_linked_at: null,
      }).eq("user_id", userId);
      return new Response(JSON.stringify({ ok: true, unlinked: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!code || !redirect_uri) {
      return new Response(JSON.stringify({ error: "Missing code or redirect_uri" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const clientId = Deno.env.get("DISCORD_CLIENT_ID");
    const clientSecret = Deno.env.get("DISCORD_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "Discord not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }),
    });
    if (!tokenResp.ok) {
      const t = await tokenResp.text();
      return new Response(JSON.stringify({ error: "discord_token_failed", detail: t }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const tok = await tokenResp.json();

    const userResp = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    if (!userResp.ok) {
      return new Response(JSON.stringify({ error: "discord_user_fetch_failed" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const du = await userResp.json();
    const avatar = du.avatar ? `https://cdn.discordapp.com/avatars/${du.id}/${du.avatar}.png` : null;

    const { error: updErr } = await admin.from("profiles").update({
      discord_user_id: du.id,
      discord_username: du.global_name ?? du.username,
      discord_avatar: avatar,
      discord_linked_at: new Date().toISOString(),
    }).eq("user_id", userId);
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      ok: true,
      discord_user_id: du.id,
      discord_username: du.global_name ?? du.username,
      discord_avatar: avatar,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
