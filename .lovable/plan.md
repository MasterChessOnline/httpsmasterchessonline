# Plan — Auto Place ID + Maximum masterchess.live GBP Saturation

## Part 1 — Place ID: stop hand-pasting, resolve automatically

Right now `VITE_GOOGLE_REVIEW_URL` requires the user to manually find Place ID and set an env var. Replace with auto-resolution.

**New edge function `resolve-place-id`** (one-time, cached):
- Uses Google Maps connector (already documented in context) → `places/v1/places:searchText` with query `"MasterChess masterchess.live"`.
- Stores result in new `site_config` table (key/value): `place_id`, `place_url`, `maps_url`, `cid`, `resolved_at`.
- Re-runs weekly via cron (in case Google reassigns).
- Falls back gracefully to the Maps search URL if not yet verified.

**New table `site_config`** (public read, service-role write) — one row per key. Used for any future global config too.

**New hook `useGoogleReview()`** in `src/lib/google-review.ts`:
- Fetches `site_config.place_id` from Supabase on mount, caches in localStorage 24h.
- Returns `{ reviewUrl, mapsUrl, placeId }`.
- Every existing button (Footer, /rate, /reviews) switches to the hook — no more env var needed.
- Keeps the env override as highest priority for emergencies.

## Part 2 — Flood GBP with masterchess.live deep links

Currently GBP dashboard has 4 link slots. We expose more URLs via **GBP Posts** (already 52 seeded) and **Products/Services entries**. Add a generator + admin export.

**Expand `docs/GBP_OFFICIAL_LINKS.md`** from 4 → 30+ canonical deep links, each with proper UTM:

| Surface | URL |
|---|---|
| Website | `/` |
| Play instant | `/play` |
| Play guest (no signup) | `/play-guest` |
| Tournaments hub | `/tournaments` |
| Today's tournament | `/tournaments/today` |
| Battle Royale | `/battle-royale` |
| Daily Puzzle | `/puzzles` |
| Daily Mate | `/daily-mate` |
| Openings explorer | `/openings` |
| Bot practice | `/bots` |
| Leaderboard | `/leaderboard` |
| Hall of Fame | `/hall-of-fame` |
| Community map | `/community/map` |
| Clubs | `/clubs` |
| Live stream hub | `/live` |
| Lessons | `/lessons` |
| Glossary | `/glossary` |
| Rating calculator | `/rating-calculator` |
| Game review | `/game-review` |
| Rate us | `/rate-masterchess` |
| Reviews | `/reviews` |
| Press kit | `/press-kit` |
| About / founder | `/about` |
| Contact | `/contact` |
| Signup | `/signup` |
| PWA install | `/?install=1` |
| Beat Nikola | `/beat/nikola` |
| Beat the bots SEO | `/beat-bots` |
| City landing template | `/play-chess-from/{city}` |
| Viral challenge | `/vs/new` |

All wrapped in `?utm_source=gbp&utm_medium={slot}&utm_campaign={theme}`.

**New script `scripts/generate-gbp-link-pack.ts`** — outputs `docs/GBP_LINK_PACK.md` with copy-paste blocks per GBP surface (Products, Services, Posts, Q&A answers, Updates). User pastes them into business.google.com one time.

**Lock-down enforcement**: extend the existing forbidden-host guard so every URL in `gbp_posts.cta_url`, `gbp_posts.body`, and the new link pack is validated to be `masterchess.live` only. Add the same check inside `publish-gbp-posts` edge function.

## Part 3 — "Intelligent extras" worth adding to GBP

These are low-effort, high-signal additions:

1. **Auto-generated GBP Product entries** — script reads `src/lib/shop-data.ts` + main features and emits 10 ready-to-paste Product cards (title, description, price=Free, photo URL, action URL).
2. **Pre-written Q&A pack** — 12 questions in `docs/GBP_QA_PACK.md` covering: free?, signup needed?, mobile?, cheating?, kids-safe?, OTB tournaments?, refunds?, language?, founder?, accessibility?, API?, partnership?. Each answer ends with a deep `masterchess.live` link.
3. **Review reply templates** (extend existing `GBP_REVIEWS_PLAYBOOK.md`) — add 5-star, 4-star, 3-star, 2-star, 1-star, spam, competitor-mention, language-other-than-EN reply templates, all signed by Nikola and linking back.
4. **GBP Photo manifest** — `docs/GBP_PHOTO_PACK.md` listing 14 owner-uploaded photos with filenames, alt text, geo-EXIF reminder, and which existing `/public/*.png|jpg` to download. No new assets generated.
5. **Auto-ping IndexNow** when a new `gbp_posts` row goes `ready_to_post` — pushes the linked deep URL to Bing/Yandex so the page is freshly indexed when GBP visitors click it.
6. **Schema.org `Review` aggregation** — extend the existing `LocalBusiness` JSON-LD in `index.html` to read `aggregateRating` from `site_ratings` table at build time via `scripts/generate-sitemap.ts` (already runs at build). Once ≥5 reviews exist, stars appear in the knowledge panel.
7. **`/maps` short redirect page** — new route that 302s to the resolved `place_url` from `site_config`. Lets you put `masterchess.live/maps` on social bios → one click to the Maps listing.
8. **`/review` short redirect** — same idea, redirects to the resolved review URL. Replaces every hard-coded long review URL with `masterchess.live/review` everywhere on the site.

## Technical summary

**New files**
- `supabase/functions/resolve-place-id/index.ts` (cron weekly)
- `scripts/generate-gbp-link-pack.ts`
- `docs/GBP_LINK_PACK.md` (generated)
- `docs/GBP_QA_PACK.md`
- `docs/GBP_PHOTO_PACK.md`
- `src/pages/MapsRedirect.tsx` (route `/maps`)
- `src/pages/ReviewRedirect.tsx` (route `/review`)

**New migration**
- `site_config(key text pk, value jsonb, updated_at timestamptz)` + GRANTs (SELECT to anon, ALL to service_role) + RLS (SELECT public, write service-role only).

**Edited files**
- `src/lib/google-review.ts` — add `useGoogleReview` hook, keep constants.
- `src/components/Footer.tsx`, `src/pages/RateMasterChess.tsx`, `src/pages/Reviews.tsx` — switch to hook.
- `src/App.tsx` — register `/maps` and `/review` routes.
- `docs/GBP_OFFICIAL_LINKS.md` — expand to 30+ URLs.
- `docs/GBP_REVIEWS_PLAYBOOK.md` — add 8 reply templates.
- `scripts/generate-sitemap.ts` — inject `aggregateRating` into JSON-LD.
- `supabase/functions/publish-gbp-posts/index.ts` — IndexNow ping on `ready_to_post`.

**Connectors**
- Requires the Google Maps Platform connector (already mentioned in context). If not linked yet, the first run of `resolve-place-id` will fall back to the search URL and the user gets a clear log saying "connect Google Maps Platform".

## Out of scope
- Actual GBP API auto-posting (needs Google's MyBusiness API allowlist — manual paste workflow stays).
- Generating new images.
- Anything that touches Lichess/Chess.com (forbidden per memory).
