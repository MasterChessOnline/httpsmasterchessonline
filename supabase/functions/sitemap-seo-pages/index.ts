// Live XML sitemap for AI-generated SEO pages (public.seo_pages).
// GET → application/xml with all published slugs.
// Referenced from public/robots.txt and public/sitemap_index.xml.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BASE = "https://masterchess.live";

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data } = await supabase
    .from("seo_pages")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(50000);

  const urls = (data ?? [])
    .map(
      (r: any) =>
        `  <url><loc>${BASE}/${r.slug}</loc><lastmod>${new Date(r.updated_at).toISOString().slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
