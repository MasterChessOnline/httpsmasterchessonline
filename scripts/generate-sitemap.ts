// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml, public/sitemap-openings.xml, public/sitemap-images.xml, public/sitemap_index.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { ALL_OPENING_SLUGS, OPENING_SEO } from "../src/lib/opening-seo-meta";
import { OPENINGS_DATABASE } from "../src/lib/openings-data";
import { getOpeningBoardImage } from "../src/lib/og-board-image";

const BASE_URL = "https://masterchess.live";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  image?: { loc: string; title?: string; caption?: string };
}

const today = new Date().toISOString().slice(0, 10);

// Core static routes
const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0", image: { loc: `${BASE_URL}/og-image.jpg`, title: "MasterChess — Play Chess Online Free", caption: "Free online chess platform with AI coach, tournaments, and lessons." } },
  { path: "/play", changefreq: "weekly", priority: "0.9" },
  { path: "/play/online", changefreq: "daily", priority: "0.9" },
  { path: "/play/titles", changefreq: "weekly", priority: "0.6" },
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/learn/how-to-play-chess", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/how-to-set-up-chess-board", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/how-to-castle-in-chess", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/play-chess-online-with-friends", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/best-chess-openings-for-beginners", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/queens-gambit-opening", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/sicilian-defense-explained", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/italian-game-opening", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/chess-piece-names-and-moves", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/chess-piece-values", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/chess-notation-explained", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/stalemate-vs-checkmate", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/en-passant-rule", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/chess-rating-elo-explained", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/how-to-improve-at-chess", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/scholars-mate", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/fools-mate", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/chess-opening-traps", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/knight-moves-chess", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/what-is-a-gambit-in-chess", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/best-chess-players-of-all-time", changefreq: "monthly", priority: "0.8" },
  { path: "/learn/chess-strategy-for-beginners", changefreq: "monthly", priority: "0.9" },
  { path: "/learn/chess-clock-rules", changefreq: "monthly", priority: "0.8" },
  { path: "/training", changefreq: "weekly", priority: "0.8" },
  { path: "/openings", changefreq: "weekly", priority: "0.8" },
  { path: "/opening-explorer", changefreq: "weekly", priority: "0.7" },
  { path: "/topics", changefreq: "weekly", priority: "0.7" },
  { path: "/tournaments", changefreq: "daily", priority: "0.9" },
  { path: "/leaderboard", changefreq: "daily", priority: "0.7" },
  { path: "/analysis", changefreq: "weekly", priority: "0.8" },
  { path: "/community", changefreq: "daily", priority: "0.7" },
  { path: "/live", changefreq: "daily", priority: "0.6" },
  { path: "/stats", changefreq: "weekly", priority: "0.5" },
  { path: "/clubs", changefreq: "weekly", priority: "0.5" },
  { path: "/achievements", changefreq: "weekly", priority: "0.5" },
  { path: "/missions", changefreq: "daily", priority: "0.5" },
  { path: "/skill-tree", changefreq: "weekly", priority: "0.5" },
  { path: "/guess-the-move", changefreq: "weekly", priority: "0.6" },
  { path: "/play-like-gm", changefreq: "weekly", priority: "0.6" },
  { path: "/coach", changefreq: "weekly", priority: "0.5" },
  { path: "/repertoire", changefreq: "weekly", priority: "0.5" },
  { path: "/tools", changefreq: "monthly", priority: "0.4" },
  { path: "/rating-calculator", changefreq: "monthly", priority: "0.4" },
  { path: "/piece-values", changefreq: "monthly", priority: "0.4" },
  { path: "/embed-tools", changefreq: "monthly", priority: "0.5" },
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/fair-play", changefreq: "monthly", priority: "0.5" },
  { path: "/referrals", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.3" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/signup", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
];

// Programmatic openings — auto-generated from ALL_OPENING_SLUGS (60+ pages)
const openingEntries: SitemapEntry[] = ALL_OPENING_SLUGS.map((slug) => ({
  path: `/openings/${slug}`,
  changefreq: "monthly" as const,
  priority: "0.85",
}));

function buildUrlset(entries: SitemapEntry[], withImages = false): string {
  const ns = withImages
    ? `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`
    : `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    ns,
    ...entries.map((e) =>
      [
        `  <url>`,
        `    <loc>${BASE_URL}${e.path}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        withImages && e.image ? `    <image:image><image:loc>${e.image.loc}</image:loc>${e.image.title ? `<image:title>${e.image.title}</image:title>` : ""}${e.image.caption ? `<image:caption>${e.image.caption}</image:caption>` : ""}</image:image>` : null,
        `  </url>`,
      ].filter(Boolean).join("\n"),
    ),
    `</urlset>`,
  ].join("\n");
}

// Image sitemap — every opening page renders an embedded chess board screenshot via OG image.
const imageEntries: SitemapEntry[] = [
  { path: "/", image: { loc: `${BASE_URL}/og-image.jpg`, title: "MasterChess — Free Online Chess", caption: "Play chess online free with AI coach and tournaments." } },
  ...ALL_OPENING_SLUGS.map((slug) => ({
    path: `/openings/${slug}`,
    image: {
      loc: `${BASE_URL}/og-image.jpg`,
      title: `${slug.replace(/-/g, " ")} chess opening`,
      caption: `Learn the ${slug.replace(/-/g, " ")} chess opening — moves, theory, and best lines.`,
    },
  })),
];

writeFileSync(resolve("public/sitemap.xml"), buildUrlset(staticEntries, true));
writeFileSync(resolve("public/sitemap-openings.xml"), buildUrlset(openingEntries));
writeFileSync(resolve("public/sitemap-images.xml"), buildUrlset(imageEntries, true));

const indexXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  `  <sitemap><loc>${BASE_URL}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-openings.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-images.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `</sitemapindex>`,
].join("\n");
writeFileSync(resolve("public/sitemap_index.xml"), indexXml);

console.log(`✓ sitemap.xml (${staticEntries.length}) + sitemap-openings.xml (${openingEntries.length}) + sitemap-images.xml (${imageEntries.length}) + sitemap_index.xml`);
