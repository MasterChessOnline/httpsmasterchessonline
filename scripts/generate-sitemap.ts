// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml, public/sitemap-openings.xml, public/sitemap-images.xml, public/sitemap_index.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { ALL_OPENING_SLUGS, OPENING_SEO } from "../src/lib/opening-seo-meta";
import { OPENINGS_DATABASE } from "../src/lib/openings-data";
import { getOpeningBoardImage } from "../src/lib/og-board-image";
import { ONLINE_BOTS } from "../src/lib/online-bots-data";
import { BOT_PROFILES } from "../src/lib/bots/profiles";
import { GLOSSARY } from "../src/data/chessGlossary";
import { TOOLS } from "../src/data/tools";
import { MATE_PATTERNS } from "../src/data/matePatterns";
import { ELO_TIERS } from "../src/data/eloTiers";
import { FAMOUS_GAMES } from "../src/data/famousGames";
import { GRANDMASTERS } from "../src/data/grandmasters";
import { SEO_CITIES } from "../src/lib/seo-cities";
import { SR_LANDINGS } from "../src/lib/seo-landings-sr";
import { EN_LANDINGS } from "../src/lib/seo-landings-en";
import { AGE_GUIDES } from "../src/data/ageGuides";

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
  { path: "/built-by-a-kid", changefreq: "monthly", priority: "0.8" },
  { path: "/nikola", changefreq: "monthly", priority: "0.9" },
  { path: "/nikola-sakotic", changefreq: "monthly", priority: "0.9" },
  { path: "/authors/nikola-sakotic", changefreq: "monthly", priority: "0.7" },
  { path: "/founder", changefreq: "monthly", priority: "0.7" },
  { path: "/no-ads-chess", changefreq: "monthly", priority: "0.8" },
  { path: "/play-chess-with-friends-free", changefreq: "monthly", priority: "0.9" },
  { path: "/best-free-chess-site-2026", changefreq: "monthly", priority: "0.9" },
  { path: "/chess-opening-trainer-free", changefreq: "monthly", priority: "0.8" },
  { path: "/daily-chess-puzzle", changefreq: "daily", priority: "0.8" },
  { path: "/chess-rating-explained", changefreq: "monthly", priority: "0.8" },
  { path: "/learn-chess-in-7-days", changefreq: "monthly", priority: "0.9" },
  { path: "/changelog", changefreq: "weekly", priority: "0.7" },
  { path: "/alternative-to-major-chess-sites", changefreq: "monthly", priority: "0.8" },
  { path: "/reviews", changefreq: "daily", priority: "0.9" },
  { path: "/rate-masterchess", changefreq: "weekly", priority: "0.7" },
  { path: "/play", changefreq: "weekly", priority: "0.9" },
  { path: "/sah-online", changefreq: "weekly", priority: "0.9" },
  { path: "/play/online", changefreq: "daily", priority: "0.9" },
  { path: "/play/titles", changefreq: "weekly", priority: "0.6" },
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/news", changefreq: "daily", priority: "0.9" },
  { path: "/ranked", changefreq: "daily", priority: "0.9" },
  { path: "/hall-of-fame", changefreq: "daily", priority: "0.8" },
  { path: "/beta", changefreq: "weekly", priority: "0.6" },
  { path: "/community/map", changefreq: "weekly", priority: "0.7" },
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
  { path: "/press", changefreq: "monthly", priority: "0.5" },
  { path: "/streamers", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.3" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/signup", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
  { path: "/reviews", changefreq: "weekly", priority: "0.8" },
  { path: "/rate-masterchess", changefreq: "weekly", priority: "0.7" },
  { path: "/location", changefreq: "monthly", priority: "0.6", image: { loc: `${BASE_URL}/og-image.jpg`, title: "MasterChess Location & Contact", caption: "MasterChess headquarters and contact information." } },
  { path: "/promo", changefreq: "weekly", priority: "0.7", image: { loc: `${BASE_URL}/og-image.jpg`, title: "Promote MasterChess", caption: "Share MasterChess with your friends and community." } },
  { path: "/press-kit", changefreq: "monthly", priority: "0.5", image: { loc: `${BASE_URL}/og-image.jpg`, title: "MasterChess Press Kit", caption: "Media assets and brand guidelines for MasterChess." } },
  { path: "/viral", changefreq: "weekly", priority: "0.7", image: { loc: `${BASE_URL}/og-image.jpg`, title: "Go Viral with MasterChess", caption: "Challenge friends and share MasterChess on social media." } },
];

// Programmatic openings — auto-generated from ALL_OPENING_SLUGS (60+ pages)
const openingEntries: SitemapEntry[] = ALL_OPENING_SLUGS.map((slug) => ({
  path: `/openings/${slug}`,
  changefreq: "monthly" as const,
  priority: "0.85",
}));

// Programmatic bot profiles — every roster bot becomes its own indexable URL.
// Each one gets a unique title/description via the BotProfile route Helmet.
// We dedupe across both BOT_PROFILES (the `/bot/:id` route source) and the
// ONLINE_BOTS roster so any future bot in either list shows up in search.
const botIds = Array.from(new Set([
  ...BOT_PROFILES.map((b) => b.id),
  ...ONLINE_BOTS.map((b) => b.id),
]));
const botEntries: SitemapEntry[] = botIds.map((id) => ({
  path: `/bot/${id}`,
  changefreq: "monthly" as const,
  priority: "0.6",
}));

// "How to beat X" SEO landing pages — long-tail target per bot
const beatBotEntries: SitemapEntry[] = BOT_PROFILES.map((b) => ({
  path: `/beat/${b.id}`,
  changefreq: "monthly" as const,
  priority: "0.75",
}));

// Programmatic city SEO — "play chess online from {city}" long-tail
const cityEntries: SitemapEntry[] = [
  ...SEO_CITIES.map((c) => ({
    path: `/play-from/${c.slug}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  // "Chess in {city}" — real venues + map via Places API
  ...SEO_CITIES.map((c) => ({
    path: `/chess/${c.slug}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  })),
  { path: "/near-me", changefreq: "weekly" as const, priority: "0.7" },
  { path: "/players/world", changefreq: "weekly" as const, priority: "0.7" },
  { path: "/chess-map", changefreq: "daily" as const, priority: "0.9" },
  { path: "/beat-nikola", changefreq: "weekly" as const, priority: "0.8" },
];

// SEO long-tail landing pages (EN + SR)
const seoLandingEntries: SitemapEntry[] = [
  ...Object.values(SR_LANDINGS).map((c) => ({
    path: c.path,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
  ...Object.values(EN_LANDINGS).map((c) => ({
    path: c.path,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
];

// Daily puzzle hub + every individual puzzle in the curated pool.
// Each puzzle id is sanitized via the same slug rule as the route handler
// (strip third-party data-source prefix). Caps at 500 entries — Google
// indexing budget — sampled across difficulty buckets for variety.
import { readFileSync as _readFileSync } from "fs";
type RawPuzzle = { id: string; bucket: string; difficulty: string; rating: number };
let puzzlePool: RawPuzzle[] = [];
try {
  puzzlePool = JSON.parse(_readFileSync(resolve("public/data/masterchess-puzzles.json"), "utf8"));
} catch { /* file missing during early builds */ }
const puzzleSlug = (id: string) => id.replace(/^lichess-/i, "").replace(/^mc-/i, "").toLowerCase();
// Sample evenly across buckets, cap at 500
const byBucket: Record<string, RawPuzzle[]> = {};
for (const p of puzzlePool) (byBucket[p.bucket] ??= []).push(p);
const samplePerBucket = Math.max(20, Math.floor(500 / Math.max(1, Object.keys(byBucket).length)));
const sampledPuzzles: RawPuzzle[] = [];
for (const list of Object.values(byBucket)) {
  // pick top-rated and lowest-rated for breadth
  const sorted = [...list].sort((a, b) => b.rating - a.rating);
  sampledPuzzles.push(...sorted.slice(0, samplePerBucket));
}
const puzzleEntries: SitemapEntry[] = [
  { path: "/puzzles", changefreq: "daily", priority: "0.85" },
  ...sampledPuzzles.slice(0, 500).map((p) => ({
    path: `/puzzle/${puzzleSlug(p.id)}`,
    changefreq: "monthly" as const,
    priority: "0.55",
  })),
];


// Programmatic glossary — every chess term becomes its own indexable URL
const glossaryEntries: SitemapEntry[] = [
  { path: "/learn/glossary", changefreq: "weekly", priority: "0.8" },
  ...GLOSSARY.map((t) => ({
    path: `/learn/glossary/${t.slug}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
];

// Programmatic tools, mate patterns, ELO tiers
const toolsEntries: SitemapEntry[] = [
  { path: "/tools", changefreq: "weekly", priority: "0.85" },
  ...TOOLS.map((t) => ({ path: `/tools/${t.slug}`, changefreq: "monthly" as const, priority: "0.8" })),
];
const mateEntries: SitemapEntry[] = [
  { path: "/learn/checkmate-patterns", changefreq: "weekly", priority: "0.85" },
  ...MATE_PATTERNS.map((m) => ({ path: `/learn/checkmate-patterns/${m.slug}`, changefreq: "monthly" as const, priority: "0.75" })),
];
const eloEntries: SitemapEntry[] = [
  { path: "/elo", changefreq: "weekly", priority: "0.8" },
  ...ELO_TIERS.map((t) => ({ path: `/elo/${t.rating}`, changefreq: "monthly" as const, priority: "0.7" })),
];

const ageGuideEntries: SitemapEntry[] = [
  { path: "/chess-for", changefreq: "monthly", priority: "0.8" },
  ...AGE_GUIDES.map((g) => ({ path: `/chess-for/${g.slug}`, changefreq: "monthly" as const, priority: "0.7" })),
];
const famousGameEntries: SitemapEntry[] = [
  { path: "/famous-games", changefreq: "weekly", priority: "0.85" },
  ...FAMOUS_GAMES.map((g) => ({ path: `/famous-games/${g.slug}`, changefreq: "monthly" as const, priority: "0.8" })),
];
const playerEntries: SitemapEntry[] = [
  { path: "/players", changefreq: "weekly", priority: "0.85" },
  ...GRANDMASTERS.map((g) => ({ path: `/players/${g.slug}`, changefreq: "monthly" as const, priority: "0.8" })),
];

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

// Image sitemap — every opening page emits a UNIQUE board-position screenshot URL
// (chess.com dynboard PNG of that opening's starting position). Google Images indexes
// each as a separate image, multiplying our presence in image search.
const BRAND_IMG = `${BASE_URL}/app-icon-512.png`;
const OG_IMG = `${BASE_URL}/og-image.jpg`;
const imageEntries: SitemapEntry[] = [
  { path: "/", image: { loc: OG_IMG, title: "MasterChess — Free Online Chess", caption: "Play chess online free with AI coach and tournaments on MasterChess." } },
  { path: "/", image: { loc: BRAND_IMG, title: "MasterChess logo — Play Chess Online", caption: "MasterChess — premium online chess with tournaments, bots and Stockfish analysis." } },
  { path: "/play/online", image: { loc: OG_IMG, title: "Play Chess Online Free — MasterChess", caption: "Play live chess online vs real players on MasterChess." } },
  { path: "/tournaments", image: { loc: OG_IMG, title: "Free Online Chess Tournaments — MasterChess", caption: "Join free daily Arena and Swiss chess tournaments on MasterChess." } },
  { path: "/analysis", image: { loc: OG_IMG, title: "Stockfish Chess Analysis — MasterChess", caption: "Analyze your chess games with Stockfish on MasterChess." } },
  { path: "/openings", image: { loc: OG_IMG, title: "Chess Openings Trainer — MasterChess", caption: "Learn and practice chess openings on MasterChess." } },
  ...ALL_OPENING_SLUGS.map((slug) => {
    const meta = OPENING_SEO[slug];
    const dbOpening = meta ? OPENINGS_DATABASE.find((o) => o.id === meta.id) : null;
    const startingMoves = dbOpening?.startingMoves ?? meta?.startingMoves;
    const name = dbOpening?.name ?? meta?.name ?? slug.replace(/-/g, " ");
    const eco = dbOpening?.eco ?? meta?.eco ?? "";
    return {
      path: `/openings/${slug}`,
      image: {
        loc: getOpeningBoardImage(startingMoves),
        title: `${name} chess opening${eco ? ` (ECO ${eco})` : ""} — MasterChess`,
        caption: `${name}${eco ? ` (ECO ${eco})` : ""} — starting position after ${startingMoves || "the opening moves"}. Learn it on MasterChess.`,
      },
    };
  }),
  ...botIds.map((id) => ({
    path: `/bot/${id}`,
    image: { loc: OG_IMG, title: `Play vs ${id} chess bot — MasterChess`, caption: `Play chess online vs the ${id} AI bot on MasterChess.` },
  })),
  ...GRANDMASTERS.map((g) => ({
    path: `/players/${g.slug}`,
    image: { loc: OG_IMG, title: `${g.name} — chess grandmaster on MasterChess`, caption: `${g.name} chess games, ratings and famous matches on MasterChess.` },
  })),
  ...FAMOUS_GAMES.map((g) => ({
    path: `/famous-games/${g.slug}`,
    image: { loc: OG_IMG, title: `${g.slug.replace(/-/g, " ")} — famous chess game on MasterChess`, caption: `Replay and analyze this famous chess game on MasterChess.` },
  })),
  ...MATE_PATTERNS.map((m) => ({
    path: `/learn/checkmate-patterns/${m.slug}`,
    image: { loc: OG_IMG, title: `${m.slug.replace(/-/g, " ")} checkmate pattern — MasterChess`, caption: `Learn the ${m.slug.replace(/-/g, " ")} checkmate pattern on MasterChess.` },
  })),
];

// ── News & RSS ────────────────────────────────────────────────────────────
// Seed list of published articles. Keep in sync with seeded rows in
// supabase/migrations/*_news_featured_seed.sql. Dynamic posts added later
// are pinged to IndexNow via supabase/functions/news-indexnow-ping.
interface NewsArticle {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO
  image?: string;
}
const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "how-13-year-old-built-masterchess-live",
    title: "How a 13-Year-Old Built MasterChess.live — The Full Story",
    description: "Nikola Šakotić, 13, from Serbia, built MasterChess.live by himself — every line of code, every bot, every pixel. This is the full story.",
    publishedAt: new Date(Date.now() - 3_600_000).toISOString(),
    image: `${BASE_URL}/__l5e/assets-v1/f35f47e4-9616-48fc-b29e-95e8a18ef06e/nikola-with-streamer.jpg`,
  },
  {
    slug: "meeting-hans-niemann-at-the-board-belgrade",
    title: "Meeting Hans Niemann at the Board in Belgrade",
    description: "MasterChess.live founder Nikola Šakotić at the Serbian Chess Federation board where Hans Niemann faced Ian Nepomniachtchi.",
    publishedAt: new Date(Date.now() - 7_200_000).toISOString(),
    image: `${BASE_URL}/__l5e/assets-v1/14dae1b4-8366-483a-85ee-cdfb7e456207/nikola-vs-niemann.jpg`,
  },
  {
    slug: "backstage-with-a-grandmaster-lessons-from-the-top",
    title: "Backstage with a Grandmaster: Lessons from the Top",
    description: "Four lessons from a grandmaster — and how they shape the next training tools on MasterChess.live.",
    publishedAt: new Date(Date.now() - 10_800_000).toISOString(),
    image: `${BASE_URL}/__l5e/assets-v1/2a6e1880-e177-4cbe-b12c-834b642345c7/nikola-with-gm.jpg`,
  },
  {
    slug: "founders-letter-why-masterchess-live-exists",
    title: "Founder's Letter: Why MasterChess.live Exists",
    description: "An open letter from MasterChess.live founder Nikola Šakotić about why he built a free, ad-free chess platform at 13.",
    publishedAt: new Date(Date.now() - 18_000_000).toISOString(),
    image: `${BASE_URL}/__l5e/assets-v1/f35f47e4-9616-48fc-b29e-95e8a18ef06e/nikola-with-streamer.jpg`,
  },
  {
    slug: "masterchess-live-launch-notes-2026",
    title: "MasterChess.live Launch Notes — Everything That's Live Today",
    description: "A full map of every feature live on MasterChess.live today — play, compete, learn, identity.",
    publishedAt: new Date(Date.now() - 14_400_000).toISOString(),
    image: `${BASE_URL}/__l5e/assets-v1/f35f47e4-9616-48fc-b29e-95e8a18ef06e/nikola-with-streamer.jpg`,
  },
  {
    slug: "roadmap-2026-tournaments-clans-battle-royale",
    title: "Roadmap 2026: Tournaments, Clans, and Battle Royale",
    description: "What ships next on MasterChess.live — arena tournaments, clan quests, battle royale and native mobile apps.",
    publishedAt: new Date(Date.now() - 21_600_000).toISOString(),
  },
  {
    slug: "a-13-year-old-who-built-his-own-chess-app",
    title: "A 13-Year-Old Who Built His Own Chess App",
    description: "Meet Nikola Šakotić, the Serbian U14 Chess Champion who built MasterChess.live — a free chess platform for competitive players.",
    publishedAt: new Date(Date.now() - 86_400_000).toISOString(),
    image: `${BASE_URL}/__l5e/assets-v1/14dae1b4-8366-483a-85ee-cdfb7e456207/nikola-vs-niemann.jpg`,
  },
  {
    slug: "masterchess-brand-serbian-chess-events",
    title: "MasterChess Wears the Brand at Top Serbian Chess Events",
    description: "MasterChess shows up at top-tier chess events in Serbia, building the brand in person and online.",
    publishedAt: new Date(Date.now() - 21_600_000).toISOString(),
    image: `${BASE_URL}/__l5e/assets-v1/f35f47e4-9616-48fc-b29e-95e8a18ef06e/nikola-with-streamer.jpg`,
  },
  {
    slug: "new-analysis-system-released",
    title: "New Analysis System Released on MasterChess.live",
    description: "Move-by-move classification, key-moment highlighting and one-click opening detection — free on MasterChess.live.",
    publishedAt: new Date(Date.now() - 43_200_000).toISOString(),
  },
  {
    slug: "weekly-signature-tournaments-live",
    title: "Weekly Signature Tournaments Now Live on MasterChess.live",
    description: "MasterChess Monday, Friday Night Fire and Sunday Classic — three signature events every week.",
    publishedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

const newsEntries: SitemapEntry[] = NEWS_ARTICLES.map((a) => ({
  path: `/news/${a.slug}`,
  changefreq: "weekly",
  priority: "0.9",
  ...(a.image ? { image: { loc: a.image, title: a.title, caption: a.description } } : {}),
}));

const newsSitemapXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`,
  ...NEWS_ARTICLES.map((a) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}/news/${a.slug}</loc>`,
      `    <news:news>`,
      `      <news:publication><news:name>MasterChess.live</news:name><news:language>en</news:language></news:publication>`,
      `      <news:publication_date>${a.publishedAt}</news:publication_date>`,
      `      <news:title>${escapeXml(a.title)}</news:title>`,
      `    </news:news>`,
      `  </url>`,
    ].join("\n"),
  ),
  `</urlset>`,
].join("\n");

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

const rssXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
  `  <channel>`,
  `    <title>MasterChess News</title>`,
  `    <link>${BASE_URL}/news</link>`,
  `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
  `    <description>Official news of MasterChess.live — platform updates, founder story, tournaments and community.</description>`,
  `    <language>en</language>`,
  `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  ...NEWS_ARTICLES.map((a) =>
    [
      `    <item>`,
      `      <title>${escapeXml(a.title)}</title>`,
      `      <link>${BASE_URL}/news/${a.slug}</link>`,
      `      <guid isPermaLink="true">${BASE_URL}/news/${a.slug}</guid>`,
      `      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(a.description)}</description>`,
      `    </item>`,
    ].join("\n"),
  ),
  `  </channel>`,
  `</rss>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), buildUrlset(staticEntries, true));
writeFileSync(resolve("public/sitemap-openings.xml"), buildUrlset(openingEntries));
writeFileSync(resolve("public/sitemap-bots.xml"), buildUrlset(botEntries));
writeFileSync(resolve("public/sitemap-beat-bots.xml"), buildUrlset(beatBotEntries));
writeFileSync(resolve("public/sitemap-puzzles.xml"), buildUrlset(puzzleEntries));
writeFileSync(resolve("public/sitemap-glossary.xml"), buildUrlset(glossaryEntries));
writeFileSync(resolve("public/sitemap-tools.xml"), buildUrlset(toolsEntries));
writeFileSync(resolve("public/sitemap-mates.xml"), buildUrlset(mateEntries));
writeFileSync(resolve("public/sitemap-elo.xml"), buildUrlset(eloEntries));
writeFileSync(resolve("public/sitemap-famous-games.xml"), buildUrlset(famousGameEntries));
writeFileSync(resolve("public/sitemap-players.xml"), buildUrlset(playerEntries));
writeFileSync(resolve("public/sitemap-cities.xml"), buildUrlset(cityEntries));
writeFileSync(resolve("public/sitemap-landings.xml"), buildUrlset(seoLandingEntries));
writeFileSync(resolve("public/sitemap-chess-for.xml"), buildUrlset(ageGuideEntries));
writeFileSync(resolve("public/sitemap-news.xml"), buildUrlset(newsEntries));
writeFileSync(resolve("public/news-sitemap.xml"), newsSitemapXml);
writeFileSync(resolve("public/rss.xml"), rssXml);
writeFileSync(resolve("public/sitemap-images.xml"), buildUrlset(imageEntries, true));

const indexXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  `  <sitemap><loc>${BASE_URL}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-openings.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-bots.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-beat-bots.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-puzzles.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-glossary.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-tools.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-mates.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-elo.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-famous-games.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-players.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-cities.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-landings.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-chess-for.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-news.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/news-sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-images.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `</sitemapindex>`,
].join("\n");
writeFileSync(resolve("public/sitemap_index.xml"), indexXml);

console.log(`✓ static (${staticEntries.length}) + openings (${openingEntries.length}) + bots (${botEntries.length}) + glossary (${glossaryEntries.length}) + tools (${toolsEntries.length}) + mates (${mateEntries.length}) + elo (${eloEntries.length}) + games (${famousGameEntries.length}) + players (${playerEntries.length}) + news (${NEWS_ARTICLES.length}) + images (${imageEntries.length})`);

