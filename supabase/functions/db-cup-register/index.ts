// db-cup-register — atomic registration for the Dragan Brakus Cup.
//   1. Authenticates the caller (Supabase JWT in Authorization header)
//   2. Inserts into tournament_registrations (idempotent)
//   3. Redeems the optional invite code -> credits inviter +50 coins
//   4. Sends an HTML confirmation email via Resend (best effort)
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function htmlEmail(opts: { name: string; tournamentName: string; startsAt: string; inviteUrl: string }) {
  const dateStr = new Date(opts.startsAt).toLocaleString("en-GB", {
    timeZone: "Europe/Belgrade", dateStyle: "full", timeStyle: "short",
  });
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#fff;padding:24px;color:#111">
<div style="max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:14px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#facc15,#b45309);padding:20px 24px;color:#111">
    <div style="font-size:12px;letter-spacing:2px;opacity:.8">MASTERCHESS · OFFICIAL EVENT</div>
    <h1 style="margin:6px 0 0;font-size:22px">You're in — ${opts.tournamentName}</h1>
  </div>
  <div style="padding:24px">
    <p>Hi ${opts.name || "player"},</p>
    <p>Your seat is confirmed for the <strong>${opts.tournamentName}</strong>.</p>
    <table cellpadding="6" style="border-collapse:collapse;font-size:14px;margin:12px 0">
      <tr><td><strong>Start</strong></td><td>${dateStr} (Belgrade)</td></tr>
      <tr><td><strong>Format</strong></td><td>9-round Swiss Blitz · 3+2</td></tr>
      <tr><td><strong>Check-in</strong></td><td>16:45–16:55 CEST on event day</td></tr>
      <tr><td><strong>Venue</strong></td><td>Online · masterchess.live</td></tr>
    </table>
    <p>Reminders will be sent 24h and 2h before the start.</p>
    <p style="margin-top:24px"><a href="${opts.inviteUrl}" style="background:#facc15;color:#111;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">Bring a friend — earn 50 coins each</a></p>
    <p style="font-size:12px;color:#666;margin-top:24px">MasterChess · masterchess.live</p>
  </div>
</div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    if (!token) return json({ error: "Unauthorized" }, 401);

    const auth = createClient(SUPABASE_URL, ANON);
    const { data: u } = await auth.auth.getUser(token);
    const user = u?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { tournament_id, invite_code } = await req.json();
    if (!tournament_id || typeof tournament_id !== "string") return json({ error: "tournament_id required" }, 400);

    const svc = createClient(SUPABASE_URL, SERVICE);

    // Load tournament
    const { data: t, error: tErr } = await svc
      .from("tournaments")
      .select("id, name, starts_at, max_players")
      .eq("id", tournament_id).maybeSingle();
    if (tErr || !t) return json({ error: "Tournament not found" }, 404);

    // Capacity check
    const { count: regCount } = await svc
      .from("tournament_registrations")
      .select("user_id", { count: "exact", head: true })
      .eq("tournament_id", tournament_id);
    if ((regCount || 0) >= (t.max_players || 500)) return json({ error: "Tournament is full" }, 409);

    // Already registered? -> idempotent success
    const { data: existing } = await svc
      .from("tournament_registrations")
      .select("id, confirmation_sent_at")
      .eq("tournament_id", tournament_id).eq("user_id", user.id).maybeSingle();

    let registrationId = existing?.id as string | undefined;
    let alreadyRegistered = Boolean(existing);

    if (!existing) {
      const { data: ins, error: insErr } = await svc
        .from("tournament_registrations")
        .insert({
          tournament_id,
          user_id: user.id,
          referrer_invite_code: invite_code || null,
          rating_at_join: 1200,
        })
        .select("id").single();
      if (insErr) return json({ error: insErr.message }, 400);
      registrationId = ins.id;

      // Credit inviter (best effort)
      if (invite_code) {
        try {
          const { data: redeem } = await svc.rpc("redeem_invite", { _code: invite_code });
          const row = Array.isArray(redeem) ? redeem[0] : redeem;
          if (row?.inviter_id && row.inviter_id !== user.id && row?.reward_coins) {
            await svc.rpc("award_coins", { _user: row.inviter_id, _amount: row.reward_coins })
              .catch(() => {/* RPC may not exist; ignore */});
          }
        } catch {/* invite invalid -> ignore */}
      }
    }

    // Send confirmation email (idempotent)
    const needsEmail = !existing?.confirmation_sent_at;
    if (needsEmail && RESEND_API_KEY && user.email) {
      const inviteUrl = `https://masterchess.live/dragan-brakus`;
      const html = htmlEmail({
        name: (user.user_metadata?.full_name || user.user_metadata?.username || user.email.split("@")[0]) as string,
        tournamentName: t.name,
        startsAt: t.starts_at,
        inviteUrl,
      });
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "MasterChess <onboarding@resend.dev>",
            to: [user.email],
            subject: `You're in — ${t.name}`,
            html,
          }),
        });
        if (r.ok && registrationId) {
          await svc.from("tournament_registrations")
            .update({ confirmation_sent_at: new Date().toISOString() })
            .eq("id", registrationId);
        }
      } catch {/* swallow email failure */}
    }

    return json({ ok: true, already_registered: alreadyRegistered, registration_id: registrationId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
