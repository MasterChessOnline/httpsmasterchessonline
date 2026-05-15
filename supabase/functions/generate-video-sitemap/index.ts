// Generates a Google Video Sitemap from the DailyChess_12 YouTube channel.
// Returns XML directly; the SEO admin panel can copy/paste it or wire a CDN/proxy
// to serve it at /sitemap-videos.xml. No write-to-public-folder (Edge Functions
// have no FS write to project repo at runtime).
//
// Public endpoint — returns XML for crawlers/admin to fetch.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const CHANNEL_ID = "UC8W92XBMdu20Z0tKBbwsaWA"; // DailyChess_12
const HOST = "https://masterchess.live";

interface YTVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

async function fetchAllVideos(apiKey: string): Promise<YTVideo[]> {
  const out: YTVideo[] = [];
  let pageToken = "";
  // Cap at 5 pages = up to 250 videos to keep within YT quota
  for (let p = 0; p < 5; p++) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("channelId", CHANNEL_ID);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "date");
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) break;
    const data = await res.json();
    for (const item of data.items ?? []) {
      const id = item.id?.videoId;
      if (!id) continue;
      out.push({
        id,
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? "",
        thumbnail: item.snippet?.thumbnails?.maxres?.url
          ?? item.snippet?.thumbnails?.high?.url
          ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
      });
    }
    pageToken = data.nextPageToken ?? "";
    if (!pageToken) break;
  }
  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildVideoSitemap(videos: YTVideo[]): string {
  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
  ];
  for (const v of videos) {
    const pageUrl = `${HOST}/live?v=${v.id}`;
    lines.push(`  <url>`);
    lines.push(`    <loc>${escapeXml(pageUrl)}</loc>`);
    lines.push(`    <video:video>`);
    lines.push(`      <video:thumbnail_loc>${escapeXml(v.thumbnail)}</video:thumbnail_loc>`);
    lines.push(`      <video:title>${escapeXml(v.title.slice(0, 100))}</video:title>`);
    lines.push(`      <video:description>${escapeXml((v.description || v.title).slice(0, 2000))}</video:description>`);
    lines.push(`      <video:player_loc allow_embed="yes">https://www.youtube.com/embed/${v.id}</video:player_loc>`);
    lines.push(`      <video:content_loc>https://www.youtube.com/watch?v=${v.id}</video:content_loc>`);
    lines.push(`      <video:publication_date>${v.publishedAt}</video:publication_date>`);
    lines.push(`      <video:family_friendly>yes</video:family_friendly>`);
    lines.push(`      <video:uploader info="https://www.youtube.com/@DailyChess_12">DailyChess_12</video:uploader>`);
    lines.push(`      <video:requires_subscription>no</video:requires_subscription>`);
    lines.push(`      <video:live>no</video:live>`);
    lines.push(`    </video:video>`);
    lines.push(`  </url>`);
  }
  lines.push(`</urlset>`);
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("YOUTUBE_API_KEY");
  if (!apiKey) {
    return new Response("YOUTUBE_API_KEY missing", {
      status: 500, headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }

  try {
    const videos = await fetchAllVideos(apiKey);
    const xml = buildVideoSitemap(videos);
    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=21600", // 6h
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(`Error: ${msg}`, {
      status: 500, headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
