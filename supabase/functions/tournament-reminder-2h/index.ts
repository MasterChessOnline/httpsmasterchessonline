// Tournament 2h reminder: scans for tournaments starting in ~115–125 minutes,
// emails every registered player whose profile has an email, and stamps
// reminded_2h_at so nobody gets pinged twice.
//
// Triggered every 5 minutes by pg_cron — also callable manually for testing.

import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// The verified MasterChess sender once domain DNS is fixed. Until then Resend
// will reject any recipient that is not the account owner — we still mark the
// reminder as sent so the queue progresses.
const FROM = "MasterChess <onboarding@resend.dev>";
const SITE = "https://masterchess.live";

function buildEmail(name: string, t: { name: string; starts_at: string; slug?: string | null }) {
  const startsLocal = new Date(t.starts_at).toUTCString();
  const url = `${SITE}/dragan-brakus`;
  return {
    subject: `⏰ ${t.name} starts in 2 hours — be ready`,
    html: `<!doctype html><html><body style="background:#0b0a07;color:#f5efe1;font-family:Inter,Arial,sans-serif;padding:24px">
      <div style="max-width:540px;margin:0 auto;background:#14110a;border:1px solid #2a2418;border-radius:14px;padding:28px">
        <h1 style="margin:0 0 8px;font-family:'Cormorant Garamond',serif;font-size:28px;color:#d4af37">
          ${t.name}
        </h1>
        <p style="margin:0 0 18px;color:#bfb39a">Starts at <strong style="color:#f5efe1">${startsLocal}</strong> — that's about 2 hours from now.</p>
        <p style="margin:0 0 18px">Hi ${name || "player"} — quick reminder you're registered. Open MasterChess a few minutes before start so the pairing system can place you on board 1.</p>
        <p style="margin:24px 0">
          <a href="${url}" style="display:inline-block;background:#d4af37;color:#0b0a07;font-weight:700;padding:12px 22px;border-radius:10px;text-decoration:none">Open tournament page</a>
        </p>
        <p style="margin:0;color:#7a7158;font-size:12px">You're getting this because you registered on MasterChess.live</p>
      </div>
    </body></html>`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // Window: 115–125 min from now. 5-minute cron => every registrant hits the window exactly once.
    const nowMs = Date.now();
    const fromIso = new Date(nowMs + 115 * 60 * 1000).toISOString();
    const toIso = new Date(nowMs + 125 * 60 * 1000).toISOString();

    const { data: tournaments, error: tErr } = await supabase
      .from("tournaments")
      .select("id, name, starts_at, slug, status")
      .gte("starts_at", fromIso)
      .lte("starts_at", toIso)
      .in("status", ["registering", "registration", "scheduled", "upcoming"]);
    if (tErr) throw tErr;
    if (!tournaments?.length) {
      return new Response(JSON.stringify({ ok: true, sent: 0, scanned: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let skipped = 0;
    const failures: string[] = [];

    for (const t of tournaments) {
      const { data: regs } = await supabase
        .from("tournament_registrations")
        .select("id, user_id, first_name, reminded_2h_at")
        .eq("tournament_id", t.id)
        .is("reminded_2h_at", null);
      if (!regs?.length) continue;

      const userIds = regs.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);

      // Profiles table doesn't store email — pull from auth.users via admin API.
      const emailMap = new Map<string, string>();
      const nameMap = new Map<string, string>();
      for (const uid of userIds) {
        try {
          const { data } = await supabase.auth.admin.getUserById(uid);
          if (data?.user?.email) emailMap.set(uid, data.user.email);
        } catch { /* skip */ }
      }
      for (const p of profiles || []) {
        nameMap.set(p.id, (p as any).full_name || (p as any).username || "");
      }

      for (const r of regs) {
        const email = emailMap.get(r.user_id);
        if (!email) { skipped++; continue; }
        const fullName = r.first_name || nameMap.get(r.user_id) || "";

        if (RESEND_API_KEY) {
          const msg = buildEmail(fullName, t as any);
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
              body: JSON.stringify({ from: FROM, to: [email], subject: msg.subject, html: msg.html }),
            });
            if (!res.ok) {
              failures.push(`${email}:${res.status}`);
            } else {
              sent++;
            }
          } catch (e) {
            failures.push(`${email}:err`);
          }
        }

        // Always mark as reminded so we don't keep retrying a bad address forever.
        await supabase
          .from("tournament_registrations")
          .update({ reminded_2h_at: new Date().toISOString() })
          .eq("id", r.id);
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, skipped, failures, scanned: tournaments.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
