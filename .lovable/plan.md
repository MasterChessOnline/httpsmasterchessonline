
# Plan — Kurir-style news, circular logo, marketing push

## 1. Kurir-style news article (Nikola + Niemann)
Create a new news post styled like Serbian tabloid **Kurir**: shouty red/black headline, big lead photo, "ŠOK", "EKSKLUZIVNO" chips, short punchy paragraphs, quoted lines.

- New file: `src/pages/news/NikolaVsNiemann.tsx` — route `/news/nikola-vs-niemann-belgrade`
- Add entry to `src/lib/news.ts` so it shows in `/news` and news sitemap
- Use existing photo `nikola-vs-niemann.jpg`
- Content: real facts only — 13-year-old founder of MasterChess.live sat at Niemann–Nepomniachtchi board in Belgrade. No fabricated quotes attributed to Niemann.
- Full SEO: `Seo` component, JSON-LD `NewsArticle`, OG image = the photo
- Kurir visual language scoped to this article only (red banner, condensed bold display font, yellow highlights) — does NOT touch global theme

## 2. Circular logo + "MasterChess" wordmark everywhere
Rework `src/components/BrandLogo.tsx`:
- Change outer container from `rounded-[22%]` to `rounded-full` (true circle)
- Inner image mask also `rounded-full`, with `object-cover` + slight negative padding so the crown fully fits inside the circle (no gold frame clipping the crown)
- Keep gold conic ring + glow, just circular
- New prop `withWordmark?: boolean` → renders `<BrandLogo />` + `MasterChess` text beside it (gold gradient, tracking-tight, display font)
- New wrapper `BrandLock` = logo + wordmark, single import

Then swap every logo usage across the site to the circular version with wordmark where a text logo is currently shown:
- `Navbar`, `Footer`, `AuthLayout`, splash, PWA header, `DraganBrakusPress`, `NikolaSakotic` avatar rings, any hero badges
- Replace `/favicon.png` and `/app-icon-192.png` with a circular-cropped version of the uploaded logo (via `imagegen--edit_image`, transparent background, circular crop) so browser tab + PWA install also show the circle

## 3. Connector strategy — what to add & what to publish

**Already connected & used:** LinkedIn, Resend, Semrush, GSC, TikTok (needs scope reconnect), Google Maps.

**Add these connectors (high ROI for a chess site):**
- **X (Twitter)** — chess Twitter is huge; auto-post daily puzzle + news
- **Slack or Telegram** — community broadcast + admin alerts
- **Notion** — content calendar for news/tournaments
- **Google Sheets** — tournament registrations mirror + marketing tracker
- **Reddit is not a Lovable connector** → keep as manual playbook (docs already exist)

**Skip / not worth it now:** Airtable (Sheets covers it), HubSpot (too heavy), Salesforce (irrelevant).

**Auto-publishing schedule (edge function `marketing-broadcaster`, cron daily 09:00 CET):**
| Channel | Content |
|---|---|
| LinkedIn | Daily puzzle image + link, weekly Nikola founder story |
| TikTok (after `video.publish` reconnect) | 9:16 video: puzzle-of-the-day, "beat this bot in 10 moves", tournament highlights |
| X/Twitter | Same puzzle post, thread on top GSC queries (50-move rule, en passant, Kasparov) |
| Resend | Weekly newsletter to registered users — new tournament, top puzzle, news article |
| Telegram/Slack | Tournament start countdown, live results |

## 4. Paid ads on the internet — recommendation
Yes, **small paid layer** on top of organic, focused only where chess players actually convert:

- **Google Ads Search** — brand + long-tail: "play chess without ads", "free chess tournament online", "chess vs bot no signup". Budget €5–10/day, geo Serbia + English worldwide.
- **Meta (IG/FB) Reels ads** — reuse TikTok 9:16 videos, target chess/gaming interests, €5/day
- **Reddit Ads** — r/chess, r/chessbeginners, promoted post of the Niemann article. €3–5/day
- **YouTube pre-roll** on chess channels — only after we have 3+ good 15s clips
- **Do NOT** run TikTok ads until organic proves the hook works (cheaper to test organic first)

All ads route to a single landing `/play-guest` (already exists — instant play, no signup).

## 5. Full marketing & promotion ideas (prioritized)

**Immediate (week 1):**
1. Ship Kurir-style Niemann article → seed to r/chess, Serbian chess FB groups, Telegram
2. Circular logo everywhere → brand consistency for social previews
3. Generate 5 TikTok/Reels videos (puzzle solve, bot roast, Nikola founder story, Niemann photo reveal, tournament trailer) using `videogen--generate_video`
4. Reconnect TikTok with `video.publish` scope → auto-post

**Short-term (weeks 2–4):**
5. `/news` daily post via `world-tournaments` edge function + a new `nikola-diary` function (founder blog)
6. SEO landing pages for top GSC queries: `/learn/50-move-rule`, `/learn/en-passant`, `/games/kasparov-vs-karpov-1985`
7. Weekly Resend newsletter to all registered users
8. LinkedIn post series: "13yo builds chess platform" — 1 post per component (Stockfish, matchmaking, tournaments)
9. Google Business Profile — post weekly updates, respond to reviews

**Ongoing:**
10. Auto-post daily puzzle to LinkedIn + X + TikTok
11. Referral program: `/vs/{code}` link gives inviter 100 coins per signup (already partially built)
12. Partner with Serbian chess clubs — free tournament hosting in exchange for GBP reviews and backlinks
13. Chess streamer outreach (DailyChess_12 already integrated) — sponsor 1 stream/month with tournament code
14. Press outreach — send Kurir article + press kit to B92, Blic, Sportske, ChessBase, Chess24

## Technical notes
- Kurir styling isolated with CSS scoped to article component (no globals modified)
- `BrandLogo` changes preserve all existing props (`size`, `glow`, `shimmer`) — no breaking changes to 30+ call sites
- Favicon replacement follows favicon knowledge (copy to `public/`, update `index.html`, delete old `.ico`)
- `marketing-broadcaster` edge function reuses existing Resend, LinkedIn, TikTok gateway patterns with `verify_jwt = false` + service-role cron auth

## What I will NOT do
- No fabricated quotes from Niemann or other public figures
- No changing homepage design (per Core rule)
- No competitor site names in UI (per Core rule)
- No paid ads set up automatically — I'll prepare copy + creatives, you launch them from your ad accounts
