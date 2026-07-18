// Retention emailer. Runs daily. Sends:
//  - streak_saver: users whose daily streak is >=5 and last_active < 22h ago (streak about to break)
//  - reactivation_3d / 7d / 30d: users inactive that long, one-time per bucket
// Requires: RESEND_API_KEY connector. Respects suppressed_emails.
import { corsHeaders } from "../_shared/cors.ts";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const GATEWAY = "https://connector-gateway.lovable.dev/resend";
const FROM = "MasterChess <hello@masterchess.live>";

async function sendEmail(to: string, subject: string, html: string, template: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) return { ok: false, error: "Resend not configured" };
  const r = await fetch(`${GATEWAY}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, tags: [{ name: "template", value: template }] }),
  });
  const text = await r.text();
  if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${text}` };
  return { ok: true, id: JSON.parse(text).id };
}

function tpl(headline: string, body: string, ctaLabel: string, ctaUrl: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#e8e8e8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;padding:32px">
    <div style="font-size:14px;color:#c9a961;letter-spacing:2px;margin-bottom:8px">MASTERCHESS</div>
    <h1 style="font-size:24px;margin:0 0 16px;color:#fff">${headline}</h1>
    <p style="line-height:1.6;color:#c9c9c9;margin:0 0 24px">${body}</p>
    <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#c9a961,#8b6f2d);color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700">${ctaLabel}</a>
    <p style="font-size:12px;color:#666;margin-top:32px">
      <a href="https://masterchess.live/unsubscribe" style="color:#666">Unsubscribe</a> · MasterChess.live
    </p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!isAuthorizedCronCaller(req)) {
      const auth = req.headers.get("Authorization");
      const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth ?? "" } },
      });
      const { data: u } = await uc.auth.getUser();
      const { data: isAdmin } = u?.user ? await uc.rpc("has_role", { _user_id: u.user.id, _role: "admin" }) : { data: false };
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const stats = { streak_saver: 0, reactivation_3d: 0, reactivation_7d: 0, reactivation_30d: 0, skipped: 0, failed: 0 };

    // Fetch suppressed emails
    const { data: suppressed } = await admin.from("suppressed_emails").select("email");
    const suppressedSet = new Set((suppressed ?? []).map((s: any) => s.email.toLowerCase()));

    // --- 1. Streak savers
    const { data: streaks } = await admin
      .from("user_daily_streaks")
      .select("user_id, current_streak, last_active_date")
      .gte("current_streak", 5)
      .limit(500);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    for (const s of streaks ?? []) {
      // If last_active is yesterday (not today), streak dies at midnight
      if (s.last_active_date !== yesterday) continue;
      const { data: user } = await admin.auth.admin.getUserById(s.user_id).catch(() => ({ data: null } as any));
      const email = user?.user?.email;
      if (!email || suppressedSet.has(email.toLowerCase())) { stats.skipped++; continue; }
      const res = await sendEmail(
        email,
        `🔥 Your ${s.current_streak}-day streak expires tonight`,
        tpl(
          `Don't lose your ${s.current_streak}-day streak`,
          `Play one game today to keep it alive. It only takes 3 minutes.`,
          "Play now",
          "https://masterchess.live/play-guest?src=streak-saver",
        ),
        "streak-saver",
      );
      await admin.from("email_send_log").insert({
        message_id: `streak-${s.user_id}-${today}`,
        template_name: "streak-saver",
        recipient_email: email,
        status: res.ok ? "sent" : "failed",
        error_message: res.error ?? null,
      });
      if (res.ok) stats.streak_saver++; else stats.failed++;
    }

    // --- 2. Reactivation drip (3d/7d/30d)
    for (const days of [3, 7, 30] as const) {
      const cutoffStart = new Date(Date.now() - (days + 1) * 24 * 3600 * 1000).toISOString();
      const cutoffEnd = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const { data: idle } = await admin
        .from("profiles")
        .select("id, display_name")
        .lt("last_active_at", cutoffEnd)
        .gt("last_active_at", cutoffStart)
        .limit(200);
      for (const p of idle ?? []) {
        const { data: user } = await admin.auth.admin.getUserById(p.id).catch(() => ({ data: null } as any));
        const email = user?.user?.email;
        if (!email || suppressedSet.has(email.toLowerCase())) { stats.skipped++; continue; }
        const messageId = `reactivate-${days}d-${p.id}`;
        // Check if we already sent this exact template to this user
        const { count } = await admin.from("email_send_log")
          .select("id", { count: "exact", head: true })
          .eq("message_id", messageId);
        if ((count ?? 0) > 0) { stats.skipped++; continue; }

        const subject = days === 3
          ? "Your rivals are climbing without you"
          : days === 7
          ? "New Battle Royale mode dropped — come see"
          : "The board misses you";
        const body = days === 3
          ? `It's been 3 days. Two players in your ELO bracket just moved up. Reclaim your rank before they run away.`
          : days === 7
          ? `We shipped Battle Royale (8-player elimination), Chess DNA, and 60+ new SEO landings this week. Come take a look.`
          : `A month has passed. Your rating hasn't moved. Come play a single game — no signup needed.`;
        const res = await sendEmail(email, subject, tpl(subject, body, "Play one game", `https://masterchess.live/play-guest?src=reactivate-${days}d`), `reactivate-${days}d`);
        await admin.from("email_send_log").insert({
          message_id: messageId,
          template_name: `reactivate-${days}d`,
          recipient_email: email,
          status: res.ok ? "sent" : "failed",
          error_message: res.error ?? null,
        });
        if (res.ok) {
          if (days === 3) stats.reactivation_3d++;
          else if (days === 7) stats.reactivation_7d++;
          else stats.reactivation_30d++;
        } else stats.failed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("retention-emailer", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
