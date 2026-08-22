// Sends the "your account is ready" notification to a freshly registered user.
// Auth required: the email always goes to the authenticated caller's own address,
// so this can never be used to blast third parties.
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const GATEWAY = "https://connector-gateway.lovable.dev/resend";
const FROM = "MasterChess <hello@masterchess.live>";

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function html(name: string) {
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#e8e8e8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;padding:32px">
    <div style="font-size:14px;color:#c9a961;letter-spacing:2px;margin-bottom:8px">♟ MASTERCHESS</div>
    <h1 style="font-size:24px;margin:0 0 16px;color:#fff">Welcome, ${esc(name)} — your account is ready</h1>
    <p style="line-height:1.6;color:#c9c9c9;margin:0 0 20px">
      Your free MasterChess account is registered. Your rating, games and streak are saved from now on.
    </p>
    <p style="line-height:1.6;color:#c9c9c9;margin:0 0 24px">
      Account name: <strong style="color:#fff">${esc(name)}</strong>
    </p>
    <a href="https://masterchess.live/play/online?auto=1" style="display:inline-block;background:linear-gradient(135deg,#c9a961,#8b6f2d);color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700">Play your first game</a>
    <p style="font-size:12px;color:#666;margin-top:32px">MasterChess.live · If this wasn't you, just ignore this email.</p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    if (!token) return json({ error: "Unauthorized" }, 401);

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData } = await authClient.auth.getUser(token);
    const user = userData?.user;
    if (!user?.email) return json({ error: "Unauthorized" }, 401);

    let displayName = "";
    try {
      const body = await req.json();
      if (typeof body?.display_name === "string") displayName = body.display_name.slice(0, 32);
    } catch { /* body optional */ }
    const name =
      displayName.trim() ||
      String(user.user_metadata?.display_name ?? "").slice(0, 32).trim() ||
      user.email.split("@")[0];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      console.error("send-welcome-email: Resend connector not configured");
      return json({ error: "Email not configured" }, 503);
    }

    const r = await fetch(`${GATEWAY}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: FROM,
        to: [user.email],
        subject: `Welcome to MasterChess, ${name} ♟`,
        html: html(name),
        tags: [{ name: "template", value: "welcome_signup" }],
      }),
    });

    if (!r.ok) {
      const details = await r.text();
      console.error(`send-welcome-email gateway failed [${r.status}]: ${details}`);
      return json({ error: "Provider request failed", status: r.status, details }, r.status);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("send-welcome-email error", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
