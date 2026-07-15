# MasterChess.live — Full Growth Spec Execution Plan

The 26-section spec is ~4–6 weeks of work. Doing it "all in one turn" would ship broken half-features. Below is the phased plan grouped by ROI, so we ship real value each phase.

## What's already done (audit)
- Logo replaced everywhere (favicon, PWA 192/512, maskable, apple-touch, `masterchess-logo.png` used by BrandLogo → Navbar, Footer, Login, Signup, DB Cup, hero)
- SEO in `index.html`: title, description, keywords, canonical, OG, Twitter, robots, Google Site Verification
- JSON-LD: WebSite + SearchAction, Organization, ItemList (nav), WebApplication, FAQPage, LocalBusiness, Person (Nikola)
- Sitemaps: 20+ topic sitemaps + `sitemap_index.xml`, `rss.xml`, `news-sitemap.xml`, `robots.txt`
- PWA: manifest, service worker, push subscriptions table
- Referral system (`/r/{code}` in memory), Battle Pass, Achievements, Leaderboards, Player Profiles, Clubs, Friends, DMs, Community Posts, Blog Posts table, News Posts table — **tables already exist**
- Email infra: auth email hook, transactional queue, unsubscribe tokens
- Google Business Profile: 10+ docs, edge functions for posts/reviews
- Marketing playbook: `/docs/marketing/00–10` (Reddit blitz, Google Ads, Meta/TikTok, YouTube, community, analytics, 30-day calendar)

## Phase 1 — Analytics & Verification (this turn, ~30 min)
User must provide IDs, but I'll wire the loader now with env-var slots:
- Add GA4 loader (reads `VITE_GA4_ID`) firing `page_view`, `signup`, `game_start`, `tournament_register`, `purchase`, `pwa_install`
- Add Bing Webmaster verification `<meta>` slot + `BingSiteAuth.xml` route
- Add Yandex verification `<meta>` slot
- Add Meta Pixel loader (`VITE_META_PIXEL_ID`)
- Add TikTok Pixel loader (`VITE_TIKTOK_PIXEL_ID`)
- Update `src/lib/track.ts` to fan out to all three

**User action needed:** paste your GA4 ID, Bing code, Yandex code, Meta Pixel, TikTok Pixel — I add them and ship.

## Phase 2 — Per-route SEO (next turn, ~1h)
- Add `<Helmet>` per route with dynamic title/description/canonical/OG
- Tournament pages → `Event` schema (already have data)
- Blog posts → `Article` + `BreadcrumbList` schema
- News posts → `NewsArticle` schema
- Player profile pages → `ProfilePage` + `Person` schema
- Openings pages → `HowTo` schema
- Breadcrumb component on every non-home route

## Phase 3 — Blog + News public UI (next turn, ~2h)
Backend tables exist. Missing:
- `/blog` list page with categories, tags, search
- `/blog/[slug]` with comments, share, related posts
- `/news` list + `/news/[slug]` with reactions, trending sort
- Admin composer (markdown editor) gated by `has_role('admin')`
- Auto OG image generation from title

## Phase 4 — Retention loops (already 60% built, finish)
- Daily rewards UI polish (`daily_spin_claims`, `user_daily_streaks` exist)
- Achievement toast + `/achievements` gallery (`achievements`, `user_achievements` exist)
- Extended leaderboards: country, club, weekly, daily views (`profiles` has country)
- Push notifications for: game invites, tournament start, friend online (edge functions exist, wire triggers)

## Phase 5 — Growth loops
- Referral rewards: +100 coins both sides on confirmed signup
- Social share buttons on results screen (IG, X, Reddit, WhatsApp, Telegram, Threads, copy link) with pre-filled UTMs
- Discord widget on `/community` (bot already exists)
- Post-game share PNG card

## Phase 6 — Performance & Security hardening
- Lazy-load routes (already partial), image `loading="lazy"` audit
- Core Web Vitals: preload LCP image per route, split vendor chunk
- Rate limit edge functions (tournament-register, game-invite) via `pg_cron` cleanup
- Captcha (Turnstile) on signup + contact
- CSP header + `security.txt` (exists)

## Phase 7 — Admin Marketing Dashboard
- `/admin/analytics`: visitors, countries, devices, sources, conversions (GA4 Data API via edge function)
- `/admin/marketing`: recent signups, referral leaderboard, DB Cup registrations chart, retention cohort table

## What I'm doing right now (Phase 1)
1. `src/lib/analytics.ts` — GA4 + Meta Pixel + TikTok Pixel unified loader
2. `index.html` — mount points + Bing/Yandex verification meta slots
3. `src/lib/track.ts` — fan-out to all pixels
4. Public `BingSiteAuth.xml` template
5. Env doc: which IDs to paste

Then I'll ask for the 5 IDs and move to Phase 2.

**Approve to start Phase 1, or say "menjaj plan" and tell me which phase to prioritize.**
