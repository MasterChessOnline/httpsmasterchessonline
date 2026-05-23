// Send Web Push notifications to one or more users.
// Requires VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT secrets.
// Uses npm:web-push directly — no deno.json required.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import webpush from "npm:web-push@3.6.7";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1).max(500),
  /** Notification type — used to filter against notification_preferences */
  type: z
    .enum([
      "challenges",
      "your_turn",
      "tournaments",
      "daily_reminder",
      "direct_messages",
      "friend_activity",
      "system",
    ])
    .default("system"),
  payload: z.object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(500),
    url: z.string().max(500).optional(),
    icon: z.string().max(500).optional(),
    badge: z.string().max(500).optional(),
    tag: z.string().max(120).optional(),
  }),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authentication: allow service-role callers (internal cron / other functions),
  // or an authenticated user who can only push to themselves.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const isServiceRole = serviceKey !== "" && authHeader === `Bearer ${serviceKey}`;

  let callerUserId: string | null = null;
  if (!isServiceRole) {
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data, error } = await userClient.auth.getUser();
    if (error || !data?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    callerUserId = data.user.id;
  }


  try {
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:support@masterchess.live";

    if (!vapidPublic || !vapidPrivate) {
      return new Response(
        JSON.stringify({ error: "VAPID keys are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { user_ids, type, payload } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Filter recipients by their notification preferences (if pref column exists for type)
    let allowedUserIds = user_ids;
    if (type !== "system") {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select(`user_id, ${type}`)
        .in("user_id", user_ids);
      const allowedSet = new Set(
        (prefs ?? [])
          .filter((p: any) => p[type] !== false) // default to true if missing
          .map((p: any) => p.user_id as string)
      );
      // Include users with no prefs row (default-on semantics)
      const withPrefs = new Set((prefs ?? []).map((p: any) => p.user_id as string));
      allowedUserIds = user_ids.filter((id) => allowedSet.has(id) || !withPrefs.has(id));
    }

    if (allowedUserIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped: user_ids.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subs, error: subsErr } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .in("user_id", allowedUserIds);

    if (subsErr) throw subsErr;

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/",
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
    });

    let sent = 0;
    const staleIds: string[] = [];

    await Promise.allSettled(
      (subs ?? []).map(async (s: any) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            notificationPayload
          );
          sent++;
        } catch (err: any) {
          // Clean up expired / unsubscribed endpoints
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            staleIds.push(s.id);
          } else {
            console.error("push send error", err?.statusCode, err?.body);
          }
        }
      })
    );

    if (staleIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", staleIds);
    }

    return new Response(
      JSON.stringify({ sent, removed_stale: staleIds.length, recipients: allowedUserIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("push-send error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
