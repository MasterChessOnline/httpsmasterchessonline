// Sitemap for /chess-in/:citySlug pages.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const BASE = "https://masterchess.live";

Deno.serve(async () => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await admin
    .from("city_chess_hubs")
    .select("city_slug, updated_at")
    .eq("page_generated", true)
    .order("updated_at", { ascending: false })
    .limit(1000);

  const urls = (data ?? []).map((c: any) => `
  <url>
    <loc>${BASE}/chess-in/${c.city_slug}</loc>
    <lastmod>${new Date(c.updated_at).toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
