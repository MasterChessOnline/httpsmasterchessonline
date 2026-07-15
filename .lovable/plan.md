# Plan: Logo swap + Marketing Blitz (Google, Reddit, Maps + 20 more)

## Part 1 — Use the uploaded logo EVERYWHERE (exact image, no regeneration)

Take the uploaded image (`user-uploads://image-55.png` — gold crown on black rounded square) and use it verbatim as the single source of truth for every logo/icon slot. No AI regeneration, no reinterpretation.

Pipeline:
1. Copy upload → `src/assets/masterchess-logo-source.png` (master, 1200×1200)
2. Resize (Pillow, sharp bicubic) into every slot with **pure black** background preserved:
   - `public/favicon.png` (64) + `public/favicon.ico` (multi-size 16/32/48)
   - `public/apple-touch-icon.png` (180)
   - `public/app-icon-192.png`, `app-icon-512.png`
   - `public/app-icon-maskable-192.png`, `maskable-512.png` (add ~10% safe-zone padding on black)
   - `public/logo-crown.png` (512)
   - `public/og-image.png` (1200×630, logo centered on black + "MasterChess.live" wordmark)
   - `src/assets/masterchess-logo.png` (used in Navbar/Footer/Loader)
3. Verify every `<img>`/`<link rel=icon>`/manifest reference points at these files. Grep for stale logo references and repoint.
4. Bump manifest/version query string (`?v=3`) to bust browser icon cache.

## Part 2 — Google Search Console (real setup, not docs)

- Add `<meta name="google-site-verification" content="__PASTE__">` slot in `index.html`.
- Programmatic verify flow via the `google_search_console` connector: request META token → user pastes → we bake it in → call `webResource?verificationMethod=META` → `PUT /sites/{url}`.
- Submit `sitemap.xml` via API after verification.
- Doc: `docs/marketing/12_GSC_SETUP.md` — one-page checklist + what to paste.

## Part 3 — Google Business Profile

- Since MasterChess is online-only, prepare a **Service-area Business** profile (no storefront).
- Build `/contact` page with NAP (Name/Address/Phone placeholders), hours, service area, embedded contact form.
- Add `LocalBusiness` + `Organization` JSON-LD to `/contact`.
- Doc: `docs/marketing/13_GBP_STEP_BY_STEP.md` — signup, category (`Chess club` / `Software company`), verification options, photo checklist (using new logo), post cadence.

## Part 4 — Google Maps

- Add optional Google Maps embed component on `/contact` (only shown when address env var set, so no fake pin).
- Structured data with `geo` coordinates once GBP is live.

## Part 5 — Reddit growth kit

- `docs/marketing/14_REDDIT_PLAYBOOK.md`: 15 target subs (r/chess, r/chessbeginners, r/AnarchyChess, r/ChessPuzzles, r/tournaments, r/SideProject, r/InternetIsBeautiful, r/webdev show-off, r/chesscom refugees threads, country subs, etc.), post templates (Show-off, AMA, Weekly Puzzle, Tournament Announce), timing table, karma-safe cadence, mod-DM template, comment-first strategy.
- In-app: "Share to Reddit" button on game-review + puzzle-solved screens with pre-filled title + UTM.

## Part 6 — 20 more marketing ideas (implemented + documented)

Each gets either a code hook in the app OR a ready-to-execute playbook file under `docs/marketing/`:

1. **Bing Webmaster + IndexNow** — auto-ping on new blog/news publish (edge function).
2. **Yandex Webmaster** — verification meta + sitemap submit.
3. **DuckDuckGo / Brave** — auto-discover via sitemap; doc for submissions.
4. **Pinterest** — verification meta + auto-generated pin images per blog post.
5. **Quora Spaces** — 20 target questions + answer templates.
6. **Hacker News "Show HN"** — launch post template + best-time table.
7. **Product Hunt launch kit** — assets pack (logo, gallery, GIF), hunter outreach template.
8. **Indie Hackers milestone posts** — cadence + templates.
9. **Dev.to / Hashnode** — 10 SEO-friendly technical articles (Stockfish WASM, Realtime chess, etc.) cross-posted with canonical.
10. **YouTube Shorts pipeline** — auto-render "Puzzle of the Day" vertical video from PGN (edge function using existing board renderer).
11. **TikTok organic** — 30-day content calendar + hook library, hashtag research.
12. **Instagram Reels** — same content repurposed, IG-specific captions + `#chess #chesstok`.
13. **X/Twitter automation** — daily puzzle post via cron edge function, GIF board.
14. **Discord server** — invite widget on `/community`, welcome bot spec, role-per-rank.
15. **Telegram channel** — daily puzzle + tournament announcements, bot spec.
16. **WhatsApp Channel** — for Balkan/Serbian audience (per user's locale).
17. **Chess streamer outreach** — 50-name list template, DM script, free "Streamer Mode" pitch.
18. **Referral rewards** — +100 coins both sides, in-app "Invite friends" modal (leverages existing referral table).
19. **Weekly newsletter** — Resend edge function + `/newsletter` signup, double opt-in, weekly top games digest.
20. **Cookie consent + Consent Mode v2** — GDPR banner that gates GA4/Meta/TikTok pixels (needed for legit EU tracking).
21. **Microsoft Clarity** — heatmaps/session recordings loader (env-gated).
22. **hreflang + `/sr` Serbian locale** — start with Home + Play landing translated for Balkan traffic.
23. **AI-answer optimization (LLMs.txt + FAQ schema)** — publish `/llms.txt`, add `FAQPage` JSON-LD on Home & feature pages.
24. **Wikipedia/Wikidata entity** — draft entry + Wikidata item skeleton so brand appears in Knowledge Panel over time.

(Yes, that's 24 — user asked "20+"; I'll bundle the smaller ones.)

## Files touched / created (summary)

**Code**
- `index.html` — verification meta slots (Google, Bing, Yandex, Pinterest), OG image update
- `public/manifest.webmanifest` — new icon refs + version bust
- `public/*.png`, `public/favicon.ico` — regenerated from uploaded logo
- `src/assets/masterchess-logo*` — new master + pointer
- `src/components/CookieConsent.tsx` — GDPR + Consent Mode v2 wiring
- `src/lib/analytics.ts` — gate on consent, add Clarity + IndexNow ping
- `src/pages/Contact.tsx` — NAP, LocalBusiness schema, optional Maps embed
- `src/pages/Newsletter.tsx` + edge fn `newsletter-subscribe`
- Edge fns: `indexnow-ping`, `daily-puzzle-poster` (X/Telegram), `puzzle-short-render`
- Share-to-Reddit button on review/puzzle pages

**Docs** (`docs/marketing/`)
- `12_GSC_SETUP.md`, `13_GBP_STEP_BY_STEP.md`, `14_REDDIT_PLAYBOOK.md`
- `15_BING_INDEXNOW.md`, `16_PINTEREST.md`, `17_QUORA.md`
- `18_HN_SHOW.md`, `19_PRODUCT_HUNT.md`, `20_INDIE_HACKERS.md`
- `21_DEVTO_HASHNODE.md`, `22_YT_SHORTS.md`, `23_TIKTOK_30DAY.md`
- `24_IG_REELS.md`, `25_X_AUTOMATION.md`, `26_DISCORD.md`
- `27_TELEGRAM_WHATSAPP.md`, `28_STREAMER_OUTREACH.md`
- `29_NEWSLETTER.md`, `30_WIKIPEDIA_WIKIDATA.md`, `31_LLMS_TXT_AEO.md`

## What I need from you before I start Part 2 (Google verification)
Just approve the plan — I'll ask for the Google verification code, GA4/Meta/TikTok IDs, and any real NAP details **after** the logo + code scaffolding is in place. Nothing blocks Part 1.

Approve and I'll build it all in the next turn.
