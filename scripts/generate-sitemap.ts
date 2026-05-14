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
  { path: "/openings", changefreq: "weekly", priority: "0.7" },
  { path: "/openings/italian-game", changefreq: "monthly", priority: "0.85" },
  { path: "/openings/sicilian-defense", changefreq: "monthly", priority: "0.9" },
  { path: "/openings/french-defense", changefreq: "monthly", priority: "0.85" },
  { path: "/openings/ruy-lopez-spanish", changefreq: "monthly", priority: "0.85" },
  { path: "/openings/queens-gambit", changefreq: "monthly", priority: "0.9" },
  { path: "/openings/kings-indian-defense", changefreq: "monthly", priority: "0.8" },
  { path: "/openings/london-system", changefreq: "monthly", priority: "0.9" },
  { path: "/openings/caro-kann-defense", changefreq: "monthly", priority: "0.85" },
  { path: "/openings/english-opening", changefreq: "monthly", priority: "0.8" },
  { path: "/openings/scandinavian-defense", changefreq: "monthly", priority: "0.8" },
  { path: "/openings/kings-gambit", changefreq: "monthly", priority: "0.8" },
  { path: "/openings/vienna-game", changefreq: "monthly", priority: "0.75" },
  { path: "/openings/pirc-defense", changefreq: "monthly", priority: "0.75" },
  { path: "/openings/alekhines-defense", changefreq: "monthly", priority: "0.75" },
  { path: "/openings/nimzo-indian-defense", changefreq: "monthly", priority: "0.85" },
  { path: "/openings/slav-defense", changefreq: "monthly", priority: "0.8" },
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
  { path: "/fair-play", changefreq: "monthly", priority: "0.5" },
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
