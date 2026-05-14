// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://masterchess.live";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().slice(0, 10);

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/play", changefreq: "weekly", priority: "0.9" },
  { path: "/play/online", changefreq: "daily", priority: "0.9" },
  { path: "/play/titles", changefreq: "weekly", priority: "0.6" },
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/training", changefreq: "weekly", priority: "0.8" },
  { path: "/openings", changefreq: "weekly", priority: "0.7" },
  { path: "/opening-explorer", changefreq: "weekly", priority: "0.7" },
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
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/contact", changefreq: "monthly", priority: "0.3" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/signup", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n")
  ),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);
