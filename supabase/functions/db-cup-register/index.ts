// db-cup-register — atomic registration for the Dragan Brakus Cup.
//   1. Authenticates the caller (Supabase JWT in Authorization header)
//   2. Inserts into tournament_registrations (idempotent)
//   3. Redeems the optional invite code -> credits inviter +50 coins
//   4. Sends an HTML confirmation email via the connected email provider (best effort)
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

function firstText(value: unknown, max = 80) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

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

async function sendConfirmationEmail(opts: { to: string; html: string; subject: string }) {
  if (!RESEND_API_KEY || !LOVABLE_API_KEY) {
    return { sent: false, error: "email_provider_not_configured" };
  }

  const attempts = [
    "MasterChess <noreply@masterchess.live>",
    "MasterChess <onboarding@resend.dev>",
  ];

  let lastError = "email_send_failed";
  for (const from of attempts) {
    try {
      const response = await fetch(`${RESEND_GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
      });

      if (response.ok) return { sent: true, error: null };
      lastError = await response.text().catch(() => `HTTP ${response.status}`);
      console.error(`DB Cup confirmation email failed [${response.status}]: ${lastError}`);
    } catch (e) {
      lastError = (e as Error).message;
      console.error("DB Cup confirmation email failed:", lastError);
    }
  }

  return { sent: false, error: lastError };
}

function sendConfirmationEmailInBackground(
  svc: ReturnType<typeof createClient>,
  opts: { registrationId?: string; to?: string; html: string; subject: string },
) {
  if (!opts.registrationId || !opts.to) return;
  EdgeRuntime.waitUntil((async () => {
    const email = await sendConfirmationEmail({ to: opts.to!, html: opts.html, subject: opts.subject });
    if (email.sent) {
      await svc.from("tournament_registrations")
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq("id", opts.registrationId);
    }
  })());
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

    const { tournament_id, invite_code, player_details } = await req.json();

    const svc = createClient(SUPABASE_URL, SERVICE);

    const allowedDetails = ["first_name", "last_name", "fide_id", "fide_title", "federation", "birth_year", "city", "fide_blitz_rating"];
    const detailPatch: Record<string, unknown> = {};
    if (player_details && typeof player_details === "object") {
      for (const key of allowedDetails) {
        if (player_details[key] !== undefined) detailPatch[key] = player_details[key] || null;
      }
    }

    // Load tournament
    let tournamentQuery = svc
      .from("tournaments")
      .select("id, name, starts_at, max_players, fide_verification_mode, fide_seeding_rating, fide_seeding_fallback");

    tournamentQuery = tournament_id && typeof tournament_id === "string"
      ? tournamentQuery.eq("id", tournament_id)
      : tournamentQuery.or("name.ilike.%Dragan Brakus%,name.ilike.%DB Chess Cup%").order("starts_at", { ascending: false }).limit(1);

    const { data: t, error: tErr } = await tournamentQuery.maybeSingle();
    if (tErr || !t) return json({ error: "Tournament not found" }, 404);
    const tournamentId = t.id as string;

    // FIDE verification (anti-fraud: server-side lookup overrides client identity)
    detailPatch.first_name = firstText(detailPatch.first_name);
    detailPatch.last_name = firstText(detailPatch.last_name);
    if (!detailPatch.first_name || !detailPatch.last_name) {
      return json({ error: "First name and last name are required." }, 400);
    }

    let seedingRating: number | null = null;
    const rawFide = ((detailPatch.fide_id as string | null | undefined)?.toString() || "").replace(/\D/g, "").trim();
    let verified: any = null;
    if (rawFide) {
      if (!/^\d{4,10}$/.test(rawFide)) return json({ error: "FIDE ID must be numbers only — 4 to 10 digits." }, 400);
      detailPatch.fide_id = rawFide;
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/fide-lookup?id=${rawFide}`, {
          headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
          signal: AbortSignal.timeout(4800),
        });
        const j: any = await r.json().catch(() => ({}));
        if (r.ok && j?.name) verified = j;
        else if (t.fide_verification_mode === "required") {
          return json({ error: "FIDE ID not found. Please check the number and try again." }, 400);
        }
      } catch {
        if (t.fide_verification_mode === "required") return json({ error: "FIDE verification temporarily unavailable." }, 503);
        const clientRating = Number(detailPatch.fide_blitz_rating || 0);
        if (clientRating > 0) seedingRating = clientRating;
      }
    } else if (t.fide_verification_mode === "required") {
      return json({ error: "This tournament requires a verified FIDE ID." }, 400);
    }

    // Compute seeding rating per tournament policy
    if (verified) {
      const start = (t.fide_seeding_rating as "blitz"|"rapid"|"standard") || "blitz";
      const order: Array<"blitz"|"rapid"|"standard"> = t.fide_seeding_fallback === "cascade"
        ? [start, ...(["blitz","rapid","standard"] as const).filter((x) => x !== start)]
        : [start];
      for (const k of order) {
        const v = verified[`${k}_rating`];
        if (typeof v === "number" && v > 0) { seedingRating = v; break; }
      }
    }

    // Verified data is authoritative — overwrite client-supplied identity
    if (verified) {
      detailPatch.fide_id = rawFide;
      const nm = String(verified.name);
      const parts = nm.includes(",") ? nm.split(",").map((s: string) => s.trim()) : null;
      const first = parts ? (parts[1] || "") : nm.split(/\s+/).slice(0, -1).join(" ");
      const last = parts ? parts[0] : nm.split(/\s+/).slice(-1)[0] || "";
      detailPatch.first_name = first || detailPatch.first_name;
      detailPatch.last_name = last || detailPatch.last_name;
      detailPatch.federation = (verified.federation || detailPatch.federation || "")?.toString().toUpperCase().slice(0, 3) || null;
      detailPatch.fide_title = (verified.title || detailPatch.fide_title || "")?.toString().toUpperCase().slice(0, 3) || null;
      detailPatch.birth_year = verified.birth_year ?? (detailPatch.birth_year ?? null);
      detailPatch.fide_blitz_rating = verified.blitz_rating ?? null;
      (detailPatch as any).fide_rapid_rating = verified.rapid_rating ?? null;
      (detailPatch as any).fide_standard_rating = verified.standard_rating ?? null;
      (detailPatch as any).fide_verified = true;
      (detailPatch as any).fide_verified_at = new Date().toISOString();
      (detailPatch as any).fide_verified_name = verified.name;
      (detailPatch as any).fide_profile_url = verified.profile_url;
    }

    // Capacity check
    const { count: regCount } = await svc
      .from("tournament_registrations")
      .select("user_id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId);
    if ((regCount || 0) >= (t.max_players || 500)) return json({ error: "Tournament is full" }, 409);

    // FIDE-ID uniqueness within tournament
    if (rawFide) {
      const { data: dupe } = await svc
        .from("tournament_registrations")
        .select("id, user_id")
        .eq("tournament_id", tournamentId).eq("fide_id", rawFide).maybeSingle();
      if (dupe && dupe.user_id !== user.id) {
        return json({ error: "This FIDE ID is already registered for this tournament." }, 409);
      }
    }

    // Name uniqueness within tournament (case-insensitive)
    {
      const fn = String(detailPatch.first_name).trim();
      const ln = String(detailPatch.last_name).trim();
      const { data: nameDupe } = await svc
        .from("tournament_registrations")
        .select("id, user_id")
        .eq("tournament_id", tournamentId)
        .ilike("first_name", fn)
        .ilike("last_name", ln)
        .maybeSingle();
      if (nameDupe && nameDupe.user_id !== user.id) {
        return json({ error: "A player with this first and last name is already registered. Please leave the tournament from the other account first." }, 409);
      }
    }

    // Already registered? -> idempotent success
    const { data: existing } = await svc
      .from("tournament_registrations")
      .select("id, confirmation_sent_at")
      .eq("tournament_id", tournamentId).eq("user_id", user.id).maybeSingle();

    let registrationId = existing?.id as string | undefined;
    let alreadyRegistered = Boolean(existing);

    if (!existing) {
      const { data: ins, error: insErr } = await svc
        .from("tournament_registrations")
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          referrer_invite_code: invite_code || null,
          rating_at_join: seedingRating ?? 1200,
          ...detailPatch,
        })
        .select("id").single();
      if (insErr) {
        const message = insErr.message || "Registration failed";
        if (message.includes("tournament_registrations_unique_fide")) {
          return json({ error: "This FIDE ID is already registered for this tournament." }, 409);
        }
        if (message.includes("tournament_registrations_unique_name")) {
          return json({ error: "A player with this first and last name is already registered. Please leave the tournament from the other account first." }, 409);
        }
        return json({ error: message }, 400);
      }
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

    if (existing && Object.keys(detailPatch).length > 0) {
      const existingPatch: Record<string, unknown> = { ...detailPatch };
      if (seedingRating) existingPatch.rating_at_join = seedingRating;
      const { error: updErr } = await svc
        .from("tournament_registrations")
        .update(existingPatch)
        .eq("id", existing.id);
      if (updErr) {
        const message = updErr.message || "Registration update failed";
        if (message.includes("tournament_registrations_unique_fide")) {
          return json({ error: "This FIDE ID is already registered for this tournament." }, 409);
        }
        return json({ error: message }, 400);
      }
    }

    if (Object.keys(detailPatch).length > 0) {
      const profilePatch: Record<string, unknown> = {};
      for (const key of ["first_name", "last_name", "fide_id", "fide_title", "federation", "birth_year"]) {
        if (detailPatch[key] !== undefined) profilePatch[key] = detailPatch[key];
      }
      if (Object.keys(profilePatch).length > 0) {
        await svc.from("profiles").update(profilePatch).eq("user_id", user.id);
      }
    }

    // Queue confirmation email in the background. Registration response must stay fast.
    const needsEmail = !existing?.confirmation_sent_at;
    let emailSent = false;
    let emailError: string | null = null;
    if (needsEmail && user.email) {
      const inviteUrl = `https://masterchess.live/dragan-brakus`;
      const html = htmlEmail({
        name: (user.user_metadata?.full_name || user.user_metadata?.username || user.email.split("@")[0]) as string,
        tournamentName: t.name,
        startsAt: t.starts_at,
        inviteUrl,
      });
      sendConfirmationEmailInBackground(svc, {
        registrationId,
        to: user.email,
        subject: `You're in — ${t.name}`,
        html,
      });
      emailSent = true;
    } else if (!user.email) {
      emailError = "user_email_missing";
    }

    return json({
      ok: true,
      already_registered: alreadyRegistered,
      registration_id: registrationId,
      fide_verified: Boolean(verified),
      rating_at_join: seedingRating ?? 1200,
      email_sent: emailSent,
      email_error: emailError,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
