// Chess news RSS auto-ingest.
// Pulls latest items from independent chess sources and inserts into news_posts.
// Trigger manually or via pg_cron. Brand policy: no competitor brand names in UI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Curated independent chess news feeds (federations, news orgs — not competitor play platforms)
const FEEDS: { url: string; source: string }[] = [
  { url: "https://www.fide.com/news/rss", source: "FIDE" },
  { url: "https://en.chessbase.com/feed", source: "ChessBase News" },
  { url: "https://theweekinchess.com/twicrss.xml", source: "TWIC" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function extract(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function unwrapCdata(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function parseItems(xml: string) {
  const items = extract(xml, "item").slice(0, 5);
  return items.map((it) => {
    const title = unwrapCdata(extract(it, "title")[0] || "").replace(/<[^>]+>/g, "");
    const link = unwrapCdata(extract(it, "link")[0] || "");
    const desc = unwrapCdata(extract(it, "description")[0] || "").replace(/<[^>]+>/g, "").slice(0, 400);
    return { title, link, desc };
  }).filter((x) => x.title && x.link);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let inserted = 0;
  const errors: string[] = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "MasterChess-NewsBot/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        errors.push(`${feed.source}: HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const items = parseItems(xml);

      for (const item of items) {
        const baseSlug = slugify(item.title);
        if (!baseSlug) continue;
        const slug = `${baseSlug}-${feed.source.toLowerCase().replace(/\s+/g, "-")}`.slice(0, 100);

        // Idempotent insert via on-conflict
        const { error } = await supabase
          .from("news_posts")
          .upsert(
            {
              slug,
              title: item.title.slice(0, 200),
              kind: "world",
              url: item.link,
              source: feed.source,
              body_md: item.desc || null,
            },
            { onConflict: "slug", ignoreDuplicates: true },
          );
        if (!error) inserted++;
      }
    } catch (e) {
      errors.push(`${feed.source}: ${(e as Error).message}`);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, inserted, errors }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
