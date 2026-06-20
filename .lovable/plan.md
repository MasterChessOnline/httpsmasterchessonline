# Plan — GBP + Search Console maximization

Doing the 4 highest-ROI items I recommended, plus 2 quick wins.

## 1. Auto-verify masterchess.live in Google Search Console

Use the GSC connector (already available — see `<google_search_console>` knowledge).

- New edge function `gsc-auto-verify`:
  1. POST `/siteVerification/v1/token` with `{site: {identifier: "https://masterchess.live/", type: "SITE"}, verificationMethod: "META"}`
  2. Upsert returned token into `site_config` key `gsc_meta_token`
  3. PUT `/webmasters/v3/sites/https%3A%2F%2Fmasterchess.live%2F` to add property
  4. POST `/siteVerification/v1/webResource?verificationMethod=META` to finalize
- New component `<GscVerificationMeta />` mounted in `App.tsx`:
  - Reads `site_config.gsc_meta_token`
  - Injects `<meta name="google-site-verification" content="...">` via Helmet
- First time function runs returns the token → meta tag goes live on next request → admin re-runs function to verify. Or single-shot if token already injected via env override.
- Also add static `<meta name="google-site-verification" content="">` placeholder in `index.html` head for non-JS crawlers fallback (empty until token resolved — harmless).

## 2. GBP Posts: auto-generated images

Every post in `gbp_posts` gets an image at scheduled time.

- Extend `gbp_posts` table: add `image_url TEXT` column (migration).
- New edge function `generate-gbp-post-image`:
  - Reads post title + theme
  - Generates an OG-style PNG using existing `/og` rendering pattern OR a simple Canvas in Deno
  - Uploads to Supabase Storage bucket `gbp-images` (public)
  - Writes URL back to `gbp_posts.image_url`
- Hook into `publish-gbp-posts`: if `image_url` is null when flipping to `ready_to_post`, call generator first.
- Admin UI at `/admin/gbp-posts` shows the image preview + copy-paste action.

## 3. Auto-submit URLs via IndexNow (Bing/Yandex/Seznam)

GSC Indexing API requires special allowlist (jobs/livestream only). IndexNow is open and Bing-backed → covers ~10% of global search instantly.

- New edge function `indexnow-submit`:
  - Reads `public/sitemap.xml` (or its index)
  - Parses URLs, POSTs batches of 100 to `https://api.indexnow.org/indexnow`
  - Uses existing `public/indexnow-key.txt` (already in project)
- Daily cron at 04:00 UTC.
- Also hook into `publish-gbp-posts`: when a post goes `ready_to_post`, ping its CTA URL immediately.

## 4. `/admin/gsc` dashboard

Powered by GSC search analytics API.

- New edge function `gsc-search-analytics`:
  - POSTs `/webmasters/v3/sites/{site}/searchAnalytics/query` with last 28 days
  - Groups by `query` and `page`
  - Returns top 50 by clicks + top 50 losing CTR
- New admin route `/admin/gsc`:
  - Stats cards: total clicks, impressions, CTR, avg position (week-over-week deltas)
  - Top queries table (query, clicks, impressions, CTR, position)
  - Top losing pages table (clicks dropped >30% WoW)
  - "Rescan" button → triggers IndexNow submit + GSC analytics refresh
- Gated by `has_role(auth.uid(), 'admin')`.

## 5. Quick win — Sitemap auto-resubmit to GSC

Add to existing `scripts/generate-sitemap.ts` post-write step:
- POST `/webmasters/v3/sites/{site}/sitemaps/{sitemapUrl}` via GSC connector
- Only runs in production (skip on `predev`)

## 6. Quick win — GBP "Booking" + "Services" slot data

Extend `docs/GBP_OFFICIAL_LINKS.md` with:
- Booking URL → `https://masterchess.live/tournaments?utm_source=gbp&utm_medium=booking`
- 8 Services entries (Ranked Play, Tournaments, Lessons, Game Review, Puzzles, Bot Practice, Clubs, Streamer Mode) with title, description, deep link
- 1 "youth-led business" attribute note for the differentiation angle

## Technical summary

**New files**
- `supabase/functions/gsc-auto-verify/index.ts`
- `supabase/functions/gsc-search-analytics/index.ts`
- `supabase/functions/generate-gbp-post-image/index.ts`
- `supabase/functions/indexnow-submit/index.ts`
- `src/components/GscVerificationMeta.tsx`
- `src/pages/AdminGsc.tsx`

**New migration**
- `ALTER TABLE gbp_posts ADD COLUMN image_url TEXT`
- Storage bucket `gbp-images` (public read)

**Edited files**
- `index.html` — placeholder verification meta tag
- `src/App.tsx` — mount `<GscVerificationMeta />` + register `/admin/gsc` route
- `supabase/functions/publish-gbp-posts/index.ts` — call image generator + IndexNow ping
- `scripts/generate-sitemap.ts` — production sitemap resubmit
- `docs/GBP_OFFICIAL_LINKS.md` — booking + services
- `.lovable/plan.md` (auto)

**Cron jobs**
- `indexnow-daily` — 04:00 UTC daily
- `gsc-verify-retry` — once daily (idempotent, skips if already verified)

## Out of scope
- Google Indexing API (allowlist-only)
- Real Apple Business Connect (no API access from server)
- Auto-posting to GBP API (allowlist-only)
- Generating new design assets (uses existing OG renderer)
