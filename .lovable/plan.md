# Spin Wheel to top + SEO/Differentiation blitz

## 1. Move Spin the Wheel to top of main content
In `src/pages/Index.tsx` move the `<HomeSpinWheelSection />` block to be the **first** item inside the main content container (above Daily Challenge). Remove it from the current bottom position.

New main-content order:
1. **Spin the Wheel** ← reward hook first
2. Daily Challenge
3. Daily King banner
4. Quick Match
5. Your Performance
6. Recent Games
7. Leaderboard
8. Between matches
9. Share card → Supporter CTA → FAQ

## 2. SEO + ranking blitz (things Chess.com / Lichess don't have)

### A. Core meta + structured data upgrades (`index.html`)
- Tighter `<title>` with primary keyword: "MasterChess — Play Free Online Chess, Puzzles & Bots"
- Meta description tuned for CTR (≤155 chars) emphasizing free, no ads, built by a 13-yo
- Add `<meta name="keywords">` with long-tail (play chess online free, beat chess bots, daily chess puzzle, chess rating calculator)
- `<link rel="alternate" hreflang="x-default">` + `en`
- Add **WebSite + SearchAction JSON-LD** (sitelinks search box in Google)
- Add **Organization JSON-LD** with founder Nikola Šakotić, sameAs to social
- Add **SoftwareApplication JSON-LD** (ratings stars in SERP via `AggregateRating` from `site_ratings`)
- Add **FAQPage JSON-LD** ping from HomeFaqSection (verify already present, fix if not)

### B. New rich-snippet pages (unique to MasterChess)
- `/chess-rating-calculator` — already exists as RatingCalculator; add `HowTo` JSON-LD + meta
- `/chess-glossary` — add `DefinedTermSet` JSON-LD (Chess.com doesn't expose structured glossary)
- `/famous-games` — add `Game` / `CreativeWork` JSON-LD per entry
- `/openings` landing — add `BreadcrumbList` + `ItemList` JSON-LD

### C. Programmatic SEO landings (already partial — extend)
Verify and extend the existing `/beat/{botId}`, `/elo/{tier}`, `/city/{slug}`, `/opening/{slug}` SEO landings:
- Ensure each has unique H1, meta description, canonical, OG image, JSON-LD
- Add internal cross-links between them (Chess.com has none of these long-tail pages)

### D. Unique differentiators (not on Chess.com)
1. **Founder Story schema** — `Person` JSON-LD on `/` for Nikola (13yo creator) → unique brand signal
2. **`/built-by-a-kid` landing** — viral SEO page targeting "youngest chess site creator", "13 year old programmer" — press-bait
3. **`/no-ads-chess` landing** — targets "chess site without ads", "free chess no signup"
4. **Live `AggregateRating` widget** on `/` reading from `site_ratings` table → enables stars in SERP
5. **`/changelog` page** with dated entries → freshness signal Google loves
6. **OG image generator** — dynamic OG per route using existing `og-board-image.ts` (verify each major page sets unique `og:image`)
7. **`robots.txt`** — add `Sitemap:` lines for all existing sub-sitemaps (verify)
8. **`humans.txt`** in `public/` — small but unique
9. **`security.txt`** in `public/.well-known/` — trust signal

### E. Performance / Core Web Vitals
- Preload hero image with `fetchpriority="high"` (verify)
- Add `<link rel="preconnect">` to Supabase domain
- Add `<link rel="dns-prefetch">` for YouTube
- Ensure all `<img>` have width/height + lazy where below fold

## Files touched
- `src/pages/Index.tsx` — reorder
- `index.html` — meta, JSON-LD, preconnect
- `public/humans.txt` — new
- `public/.well-known/security.txt` — new
- `src/pages/BuiltByAKid.tsx` — new SEO landing
- `src/pages/NoAdsChess.tsx` — new SEO landing
- `src/pages/Changelog.tsx` — new (or expand existing if present)
- `src/App.tsx` — register new routes
- `public/sitemap.xml` — add new URLs
- `src/components/HomeAggregateRating.tsx` — new tiny widget + JSON-LD

No backend migrations. No design system changes. Existing visual identity preserved.

## Out of scope
- Redesigning Home layout beyond the Spin Wheel move (user veto).
- Anything that touches gameplay, auth, or DB schema.
