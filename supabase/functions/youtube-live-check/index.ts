import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const YOUTUBE_CHANNEL_ID = "UCweCc7bSMX5J4jEH7HFImng"; // DailyChess_12 — update if needed

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  
  if (!YOUTUBE_API_KEY) {
    // Return graceful fallback when no API key is configured
    return new Response(JSON.stringify({
      isLive: false,
      videoId: null,
      viewerCount: 0,
      channelTitle: "DailyChess_12",
      recentVideos: [],
      error: "YouTube API key not configured",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  try {
    // 1. Check for live streams
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    let isLive = false;
    let liveVideoId: string | null = null;
    let viewerCount = 0;

    if (searchData.items && searchData.items.length > 0) {
      isLive = true;
      liveVideoId = searchData.items[0].id.videoId;

      // Get live viewer count
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,statistics&id=${liveVideoId}&key=${YOUTUBE_API_KEY}`;
      const videoRes = await fetch(videoUrl);
      const videoData = await videoRes.json();
      if (videoData.items && videoData.items.length > 0) {
        const details = videoData.items[0].liveStreamingDetails;
        viewerCount = parseInt(details?.concurrentViewers || "0", 10);
      }
    }

    // 2. Get recent uploads
    const uploadsUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&order=date&maxResults=6&type=video&key=${YOUTUBE_API_KEY}`;
    const uploadsRes = await fetch(uploadsUrl);
    const uploadsData = await uploadsRes.json();

    const recentVideos = (uploadsData.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt,
    }));

    return new Response(JSON.stringify({
      isLive,
      videoId: liveVideoId,
      viewerCount,
      channelTitle: "DailyChess_12",
      recentVideos,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("YouTube API error:", errorMessage);
    return new Response(JSON.stringify({
      isLive: false,
      videoId: null,
      viewerCount: 0,
      recentVideos: [],
      error: errorMessage,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
