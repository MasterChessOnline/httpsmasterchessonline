// "Ring the bell": a real player is waiting in the matchmaking queue and asks
// MasterChess to ping everyone who opted in to opponent alerts.
//
// Honest by design:
//  - only a signed-in user can ring, and only for themselves
//  - it only fires when that user is actually sitting in matchmaking_queue
//  - each recipient is alerted at most once every 2 hours
//  - no fake players, no fake counts — it just wakes real humans up
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RING_COOLDOWN_MIN = 20; // per ringer
const RECIPIENT_COOLDOWN_MIN = 120;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  try {
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: auth, error: authErr } = await userClient.auth.getUser();
    if (authErr || !auth?.user) return json({ error: "Unauthorized" }, 401);
    const userId = auth.user.id;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. The ringer must really be waiting.
    const { data: queued } = await admin
      .from("matchmaking_queue")
      .select("id, time_control_label")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (!queued) return json({ ok: false, reason: "not_in_queue" }, 400);

    // 2. Ringer cooldown (stored on their own opt-in row).
    const { data: own } = await admin
      .from("opponent_alert_optins")
      .select("last_alerted_at")
      .eq("user_id", userId)
      .maybeSingle();
    const lastRing = own?.last_alerted_at ? new Date(own.last_alerted_at).getTime() : 0;
    if (Date.now() - lastRing < RING_COOLDOWN_MIN * 60_000) {
      return json({ ok: false, reason: "cooldown" }, 429);
    }

    // 3. Recipients: opted in, not the ringer, not alerted recently.
    const cutoff = new Date(Date.now() - RECIPIENT_COOLDOWN_MIN * 60_000).toISOString();
    const { data: optins } = await admin
      .from("opponent_alert_optins")
      .select("user_id, last_alerted_at")
      .eq("enabled", true)
      .neq("user_id", userId)
      .limit(400);

    const recipients = (optins ?? [])
      .filter((o: any) => !o.last_alerted_at || o.last_alerted_at < cutoff)
      .map((o: any) => o.user_id);

    // Always record the ring attempt so the ringer respects their own cooldown.
    await admin
      .from("opponent_alert_optins")
      .upsert(
        { user_id: userId, enabled: own ? undefined : true, last_alerted_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );

    if (recipients.length === 0) return json({ ok: true, notified: 0, reason: "no_recipients" });

    const { data: profile } = await admin
      .from("profiles")
      .select("username, elo")
      .eq("user_id", userId)
      .maybeSingle();

    const who = profile?.username ? `${profile.username}` : "A player";
    const rating = profile?.elo ? ` (${profile.elo})` : "";

    const pushRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/push-send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_ids: recipients,
        type: "challenges",
        payload: {
          title: "♟️ Someone is waiting to play",
          body: `${who}${rating} is in the queue right now — ${queued.time_control_label ?? "quick match"}. Join and you play instantly.`,
          url: "/play/online",
          tag: "queue-beacon",
        },
      }),
    });

    const now = new Date().toISOString();
    await admin
      .from("opponent_alert_optins")
      .update({ last_alerted_at: now })
      .in("user_id", recipients);

    return json({ ok: true, notified: recipients.length, push_ok: pushRes.ok });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
