// news-jacker — scans public chess RSS feeds and turns fresh chess news into
// original MasterChess commentary posts. Runs on a cron every 15 minutes.
// Admin-only when called manually with a JWT; the cron calls it with the service key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FEEDS = [
  "https://www.fide.com/rss",
  "https://en.chessbase.com/portals/all/feed",
  "https://www.chess-news.ru/en/rss",
];

type Item = { title: string; link: string; source: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseFeed(xml: string, source: string): Item[] {
  const items: Item[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const b of blocks.slice(0, 6)) {
    const title = b.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
    const link = b.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim();
    if (title && link) items.push({ title: title.replace(/<[^>]+>/g, ""), link, source });
  }
  return items;
}

async function writeAngle(apiKey: string, title: string): Promise<string | null> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        {
          role: "system",
          content:
            "You write short, punchy chess news commentary for MasterChess, an independent chess site. " +
            "Write 120-180 words in English, markdown, no headings, no hashtags. " +
            "Summarise the story in one paragraph, then give one opinionated paragraph on what it means for ordinary players. " +
            "Never mention or name any competitor chess platform. Never invent facts, quotes, results or numbers that are not in the headline.",
        },
        { role: "user", content: `Headline: ${title}` },
      ],
    }),
  });
  if (!res.ok) {
    console.error("AI gateway failed", res.status, await res.text());
    return null;
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Manual invocations must come from an admin; the cron uses the service key.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    const cronSecret = Deno.env.get("NEWS_JACKER_CRON_SECRET");
    const isCron = !!cronSecret && req.headers.get("x-cron-secret") === cronSecret;
    const isService = token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!isService && !isCron) {
      const anon = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: userData } = await anon.auth.getUser();
      if (!userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdmin } = await admin.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const items: Item[] = [];
    for (const feed of FEEDS) {
      try {
        const r = await fetch(feed, { headers: { "User-Agent": "MasterChessBot/1.0" } });
        if (!r.ok) continue;
        items.push(...parseFeed(await r.text(), new URL(feed).hostname));
      } catch (e) {
        console.error("feed failed", feed, String(e));
      }
    }

    const created: string[] = [];
    for (const item of items.slice(0, 12)) {
      if (created.length >= 3) break;
      const slug = slugify(item.title);
      if (!slug) continue;

      const { data: existing } = await admin
        .from("news_posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (existing) continue;

      const body = await writeAngle(apiKey, item.title);
      if (!body) continue;

      const { error } = await admin.from("news_posts").insert({
        title: item.title.slice(0, 200),
        slug,
        kind: "world",
        source: item.source,
        url: item.link,
        body_md: body,
        author_name: "MasterChess Desk",
      });
      if (error) {
        console.error("insert failed", error.message);
        continue;
      }
      created.push(slug);
    }

    return new Response(JSON.stringify({ ok: true, scanned: items.length, created }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("news-jacker error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
