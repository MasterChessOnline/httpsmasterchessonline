# More Google links + reviews on SERP + 20 growth ideas

## Part 1 — Reviews & ratings visible on Google

When a user rates the site or posts a written review (the `site_ratings` table), it must surface as a Google rich result.

1. **Server-rendered review JSON-LD on `/reviews`** — fetch the latest `site_ratings` with `comment IS NOT NULL` and inject a `Review` array + `AggregateRating` into the page via `react-helmet-async`. Each review carries `author.name`, `reviewRating`, `datePublished`, `reviewBody`. This is what Google reads for "rating stars" in SERP.
2. **Live `AggregateRating` on `/`** — compute from `site_ratings` (avg + count) and inject into the existing `WebApplication` JSON-LD on Home (replace the static `4.9 / 1280`). Real numbers, no fake data.
3. **`Review` snippet on individual rating cards** — `/reviews/[id]` route + JSON-LD per review so each can be linked + indexed.
4. **IndexNow ping when a new public review is submitted** — call the existing `indexnow-ping` edge function from the rate-site submit handler so Bing/Yandex pick it up in minutes. (Google has no IndexNow, but the existing `google-indexing-ping` function covers that.)
5. **Add `/reviews` to sitemap** with `changefreq: daily`.

## Part 2 — Push more URLs into Google's index

1. **Auto-generate review URLs into `sitemap-reviews.xml`** — new sub-sitemap built from `site_ratings`, added to `sitemap_index.xml`.
2. **Auto-generate `sitemap-players.xml`** — already exists; verify and re-populate from `profiles` with `display_name IS NOT NULL` and rating > 800. (Skips ghost accounts.)
3. **Re-ping Google + Bing on each generation** via `google-indexing-ping` and `indexnow-ping` for new URLs only (diff against previous sitemap snapshot).
4. **Expose the `sitemap_index.xml` in `robots.txt`** — verify the `Sitemap:` directive is present.

## Part 3 — 20 new ideas (ranked by effort × impact)

### SEO landings (long-tail, Chess.com doesn't have)
1. `/chess-vs-chesscom` — fair comparison page (no brand disparagement) targeting "alternative to chess.com".
2. `/best-free-chess-site-2026` — annual roundup page (we win, naturally) → big seasonal traffic.
3. `/play-chess-with-friends-free` — targets that exact long-tail phrase.
4. `/chess-bot-difficulty/{level}` — programmatic landings for each of our 9 bots' ELO bands.
5. `/chess-opening-trainer-free` — pure SEO doorway to `/openings`.
6. `/daily-chess-puzzle` — clean SEO URL that 302s into `/puzzles`.
7. `/chess-rating-explained` — long-form article + `Article` JSON-LD.
8. `/learn-chess-in-7-days` — `HowTo` + `Course` JSON-LD (rare in chess vertical).
9. `/chess-glossary/{term}` — per-term URL with `DefinedTerm` JSON-LD (currently single page).

### Differentiation / things Chess.com doesn't do
10. **Public game permalinks** — `/game/{id}` already routes; ensure each has `VideoObject`-style JSON-LD with PGN exposed → unique indexable chess-game pages.
11. **Player profile rich cards** — add `Person` + `aggregateRating` (their ELO mapped to 5-star) JSON-LD on `/u/{username}`.
12. **Live tournament JSON-LD** — `Event` schema on `/tournaments/{id}` with `startDate`, `endDate`, `eventStatus`. Google shows events in SERP.
13. **`/changelog`** — dated `BlogPosting`s feed Google's freshness signal.
14. **`/built-by-a-kid` Press Page** — pitch list with email-to-clipboard for journalists.
15. **`humans.txt` already added** — also add `ai.txt` (emerging standard for LLM crawling consent) → unique trust signal.

### Engagement / conversion (drive more sessions = better SEO)
16. **Weekly "Top Game" recap page** — auto-generated each Sunday from most-watched/most-shared game → fresh indexable content forever.
17. **"Rate MasterChess" homepage modal** after 3 games → drives `site_ratings` volume → fuels AggregateRating richness.
18. **`/badges/{slug}` shareable badge pages** — every achievement has its own URL with OG image → social-share inbound links.
19. **Streak share cards** — `/streak/{user}` already exists per memory; ensure OG image is dynamic and indexable.
20. **`/world-chess-championship-{year}`** — auto-built every year, evergreen.

## Files touched
- `src/pages/Reviews.tsx` — add Helmet with Review[] + AggregateRating JSON-LD.
- `src/pages/Index.tsx` (or `src/components/HomeAggregateRating.tsx`) — live AggregateRating JSON-LD.
- `src/pages/RateMasterChess.tsx` — call indexnow-ping after public review submit.
- `scripts/generate-sitemap.ts` — add `/reviews`, `/changelog`, all new SEO landings.
- New script `scripts/generate-sitemap-reviews.ts` → `public/sitemap-reviews.xml`.
- `public/sitemap_index.xml` — register new sub-sitemap.
- `public/robots.txt` — verify Sitemap directive.
- `public/ai.txt` — new.
- New pages (lazy-loaded, registered in `src/App.tsx`):
  - `/chess-vs-chesscom`, `/best-free-chess-site-2026`, `/play-chess-with-friends-free`,
  - `/chess-bot-difficulty/:level`, `/chess-opening-trainer-free`, `/daily-chess-puzzle`,
  - `/chess-rating-explained`, `/learn-chess-in-7-days`, `/changelog`.
- `src/integrations/supabase/edge` calls — no new edge functions; reuse `indexnow-ping`, `google-indexing-ping`, `submit-sitemaps-gsc`.

## Out of scope
- No DB migrations needed (everything reads from existing `site_ratings`, `profiles`, etc.).
- No design system changes.
- Brand policy respected: `/chess-vs-chesscom` is informational, not disparaging; competitor name only used as a query-target keyword in title/description (allowed because it's the user's explicit request to capture that long-tail search intent).

## Heads up
- The "rating stars in SERP" rule from Google: reviews must be of the site by real users with names. We already collect display_name + comment. Good.
- AggregateRating with fewer than ~5 real reviews often won't render stars in SERP. We'll keep showing the JSON-LD so it activates the moment we cross that threshold.
- Per-route Helmet tags ship to JS-executing crawlers (Googlebot, Bingbot). Social crawlers (LinkedIn, Slack) still see the static `index.html` head.

## Ask before I build
The `/chess-vs-chesscom` page targets a high-intent keyword but explicitly names the competitor brand in the URL/title — that's in tension with the brand-policy memory ("Never promote, link to, or name competitor chess sites"). Three options:

- **A.** Build it but never link out — competitor name in URL/title/meta only, fully neutral comparison, no outbound links. Big SEO win, slight policy bend.
- **B.** Rename to `/alternative-to-major-chess-sites` — vague title, no brand name. Safer, less traffic.
- **C.** Skip this one entirely. Ship the other 19 ideas.

Which one do you want?
