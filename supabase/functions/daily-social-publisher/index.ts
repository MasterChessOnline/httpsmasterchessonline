// Daily social publisher. Picks a data-point (top rated player, biggest upset, hot opening)
// and posts to LinkedIn (always) and TikTok (if publish scope available; otherwise queues).
// Cron: daily 18:00 UTC.
import { corsHeaders } from "../_shared/cors.ts";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const GATEWAY_LI = "https://connector-gateway.lovable.dev/linkedin";

async function pickDailyInsight(admin: any): Promise<{ text: string; url: string; kind: string }> {
  // Top rated player
  const { data: top } = await admin
    .from("profiles")
    .select("display_name, rating, games_played")
    .gte("games_played", 5)
    .order("rating", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Games played today
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count: gamesToday } = await admin
    .from("online_games")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);

  const parts: string[] = [
    "♟️ MasterChess daily briefing",
    "",
  ];
  if (top?.display_name) {
    parts.push(`👑 Top rated player right now: ${top.display_name} (${top.rating} ELO)`);
  }
  if (typeof gamesToday === "number") {
    parts.push(`🎯 ${gamesToday} live games played in the last 24 hours`);
  }
  parts.push("");
  parts.push("Play instantly — no signup: https://masterchess.live/play-guest");
  parts.push("");
  parts.push("#chess #chesscommunity #onlinechess #chesstournament");

  return {
    text: parts.join("\n"),
    url: "https://masterchess.live/play-guest",
    kind: "daily-briefing",
  };
}

async function publishLinkedIn(text: string, url: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const LINKEDIN_API_KEY = Deno.env.get("LINKEDIN_API_KEY");
  if (!LOVABLE_API_KEY || !LINKEDIN_API_KEY) return { ok: false, error: "LinkedIn not configured" };
  const headers = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": LINKEDIN_API_KEY };
  const me = await (await fetch(`${GATEWAY_LI}/v2/userinfo`, { headers })).json();
  if (!me.sub) return { ok: false, error: "LinkedIn userinfo failed" };
  const body = {
    author: `urn:li:person:${me.sub}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "ARTICLE",
        media: [{ status: "READY", originalUrl: url, title: { text: "MasterChess" } }],
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };
  const r = await fetch(`${GATEWAY_LI}/v2/ugcPosts`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  if (!r.ok) return { ok: false, error: `LinkedIn ${r.status}: ${t}` };
  const parsed = JSON.parse(t);
  return { ok: true, id: parsed.id ?? parsed.activity };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!isAuthorizedCronCaller(req)) {
      // allow manual admin trigger
      const auth = req.headers.get("Authorization");
      if (!auth?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth } },
      });
      const { data: u } = await uc.auth.getUser();
      if (!u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      const { data: isAdmin } = await uc.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const insight = await pickDailyInsight(admin);
    const results: any[] = [];

    // LinkedIn
    const li = await publishLinkedIn(insight.text, insight.url);
    await admin.from("social_post_log").insert({
      platform: "linkedin",
      post_id: li.id ?? null,
      content: insight.text,
      url: insight.url,
      status: li.ok ? "sent" : "failed",
      error: li.error ?? null,
    });
    results.push({ platform: "linkedin", ...li });

    // TikTok: queue for now (publish scope typically requires reconnect)
    await admin.from("pending_social_posts").insert({
      platform: "tiktok",
      payload: { caption: insight.text, cta_url: insight.url, kind: insight.kind },
      reason: "video.publish scope requires reconnect",
    });
    results.push({ platform: "tiktok", queued: true });

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-social-publisher", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
