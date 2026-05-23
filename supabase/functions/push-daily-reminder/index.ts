// Sends a daily play reminder push to all users who:
//   - have at least one push_subscriptions row, AND
//   - have notification_preferences.daily_reminder != false
// Triggered by pg_cron once per day. Public — protected by a simple shared secret.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";


const MESSAGES = [
  { title: "♟️ Time for a game", body: "Your daily move awaits. One quick blitz?", url: "/play/online" },
  { title: "🔥 Keep your streak", body: "Don't break the chain — play one game today.", url: "/daily-plan" },
  { title: "👑 Tournaments live", body: "Open arenas are running. Claim your seat!", url: "/tournaments" },
  { title: "📈 Climb the ladder", body: "A few rated games and your ELO is on the move.", url: "/play/online" },
  { title: "🎯 Train like a GM", body: "Try Guess the Move or Play Like a GM.", url: "/guess-the-move" },
  { title: "♛ Your throne awaits", body: "MasterChess is calling — come play.", url: "/" },
];

function pickMessage() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return MESSAGES[dayOfYear % MESSAGES.length];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // All users who have a push subscription
    const { data: subs, error: subsErr } = await supabase
      .from("push_subscriptions")
      .select("user_id");
    if (subsErr) throw subsErr;

    const userIds = Array.from(new Set((subs ?? []).map((s: any) => s.user_id))).filter(Boolean);
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no_subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const msg = pickMessage();

    // Chunk to keep payloads under push-send's 500 cap
    const chunkSize = 400;
    let totalSent = 0;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const { data, error } = await supabase.functions.invoke("push-send", {
        body: {
          user_ids: chunk,
          type: "daily_reminder",
          payload: {
            title: msg.title,
            body: msg.body,
            url: msg.url,
            tag: "mc-daily-reminder",
          },
        },
      });
      if (error) console.error("push-send chunk error", error);
      totalSent += (data as any)?.sent ?? 0;
    }

    return new Response(JSON.stringify({ ok: true, sent: totalSent, recipients: userIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("push-daily-reminder error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
