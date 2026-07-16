// TikTok: profile info, creator info, list videos, init video publish (PULL_FROM_URL)
import { corsHeaders } from "../_shared/cors.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/tiktok";

function auth() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TIKTOK_API_KEY = Deno.env.get("TIKTOK_API_KEY");
  if (!LOVABLE_API_KEY || !TIKTOK_API_KEY) throw new Error("TikTok not configured");
  return { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": TIKTOK_API_KEY };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { action = "profile", videoUrl, title, privacy = "SELF_ONLY" } = await req.json().catch(() => ({}));
    const headers = auth();

    if (action === "profile") {
      const r = await fetch(`${GATEWAY}/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count`, { headers });
      return new Response(await r.text(), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "videos") {
      const r = await fetch(`${GATEWAY}/video/list/?fields=id,title,cover_image_url,share_url,view_count,like_count,comment_count,create_time`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ max_count: 20 }),
      });
      return new Response(await r.text(), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "creator_info") {
      const r = await fetch(`${GATEWAY}/post/publish/creator_info/query/`, { method: "POST", headers });
      return new Response(await r.text(), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "publish") {
      if (!videoUrl) throw new Error("videoUrl required (publicly reachable mp4)");
      const r = await fetch(`${GATEWAY}/post/publish/video/init/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          post_info: { title: title ?? "Clutch moment on MasterChess.live ♟️", privacy_level: privacy, disable_duet: false, disable_comment: false, disable_stitch: false },
          source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
        }),
      });
      return new Response(await r.text(), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("invalid action");
  } catch (e) {
    console.error("tiktok-publish", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
