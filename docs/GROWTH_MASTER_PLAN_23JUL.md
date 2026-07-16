# MasterChess — Growth Master Plan (23 July 2026 Cup Launch)

One file. Everything actionable to drive **traffic + retention** around the
**Dragan Brakus Cup, 23 July 2026, 16:00 CEST**.

Order matters: do sections in order. Each block is copy-pasteable.

---

## 0. Cup date changed → 23 July 2026, 16:00 CEST

- ✅ Landing `/dragan-brakus` — updated
- ✅ Countdown banner + JSON-LD `Event`
- ✅ DB row `tournaments` (starts_at, registration_deadline)
- ✅ Sitemap lastmod
- ✅ Docs (GBP event, press kit, media outreach, chess-results submit)

If you already emailed press with the old date, send a one-line correction:
> Correction: DB Chess Cup moves to **23 July 2026, 16:00 CEST**. Same format, same URL.

---

## 1. Retention — why people leave and how we fixed it

The gap between "landed" and "played 1 move" was too wide. New in this build:

- **LiveActivityBar** (top of Home) — shows real-time live games, online
  players, next tournament countdown. Kills the "is this dead?" feeling.
- **Instant Play CTA** — `/play-guest` primary button (no signup wall).
- **Cup countdown banner** — always visible, always ticking.

Next iterations (queued):
- Post-game share card (auto)
- "Next up" widget (Puzzle → Bot → Live)
- Chess DNA teaser after 5 games
- Web push: rival online, tournament in 2h, streak recovery
- Weekly email digest (rating delta, best game, next event)

---

## 2. Google Search Console

**One-time setup:**
1. https://search.google.com/search-console → property `https://masterchess.live`
2. Verify via HTML meta (already wired in `index.html`)
3. Submit sitemaps: `sitemap.xml`, `sitemap-tournaments.xml`,
   `sitemap-news.xml`, `sitemap-openings.xml`, `sitemap-cities.xml`,
   `sitemap-players.xml`, `sitemap-beat-bots.xml`, `sitemap-chess-for.xml`,
   `sitemap-glossary.xml`, `sitemap-mates.xml`, `sitemap-tools.xml`,
   `sitemap-landings.xml`, `sitemap-famous-games.xml`, `sitemap-bots.xml`,
   `sitemap-elo.xml`, `sitemap-seo-pages` (edge function URL),
   `news-sitemap.xml`
4. Request indexing on top pages: `/`, `/dragan-brakus`, `/play`, `/puzzles`,
   `/openings`, `/tournaments`, `/nikola`

**Weekly:** check "Performance" for rising queries → add landing pages that
match them. Existing `seo_query_opportunities` table already stores this
signal.

**Connector-driven automation** (already installed):
- IndexNow ping on new news posts (`indexnow-ping`)
- URL inspection via `gsc-status`
- Query analytics via `gsc-search-analytics`

---

## 3. Google Business Profile (GBP)

**Set up (30 min, one-time):**
- Name: `MasterChess Online Club`
- Category: `Game club` + `Online community` + `Education center`
- Service area business (no address)
- Website: `https://masterchess.live`
- Verify: video walkthrough of dashboard (60s)

**23 July Cup event post** (copy-paste into GBP → Add Event):

```
Title:  Dragan Brakus Cup #1 — Online Blitz Tournament
Start:  23 July 2026, 16:00 CEST
End:    23 July 2026, 19:30 CEST
Cover:  /og-image.jpg (or new tournament banner)

Details:
Dragan Brakus Cup is an official MasterChess Blitz tournament.
9-round Swiss, 3+2 blitz, live pairings, fair-play monitored.
Open to all registered MasterChess players. Free entry.
Awards: Champion trophy · Silver · Bronze · Fair Play · Best Junior.
Tie-breaks: Buchholz → Direct encounter → Wins.

Button: Sign up → https://masterchess.live/dragan-brakus
```

**Weekly GBP post cadence** (already in `docs/GBP_WEEKLY_POSTS_CALENDAR.md`).
Automation available via `publish-gbp-posts` edge function + `gbp_posts` table.

---

## 4. Google Maps

MasterChess is a digital product → Maps presence comes for free once GBP
is verified. Optional in-app map:
- Connect **Google Maps Platform** connector (managed, one-click on
  `*.lovable.app`; custom API key required on `masterchess.live` — see
  `docs/GOOGLE_BUSINESS_AND_MAPS_SETUP.md`)
- Then enable: player heatmap, `/events-near/:city`, OTB club discovery

---

## 5. Bing / Yandex / Apple / Wikidata

| Platform | Effort | Steps |
|---|---|---|
| **Bing Webmaster** | 2 min | https://www.bingplaces.com → "Import from Google" |
| **Yandex Webmaster** | 5 min | https://webmaster.yandex.com → verify via meta tag |
| **Apple Business Connect** | 10 min | https://businessconnect.apple.com → same info as GBP |
| **Wikidata** | 30 min | Create entry for `MasterChess` and `Nikola Šakotić` with `sameAs` links. Feeds Google Knowledge Graph. |
| **DuckDuckGo** | 0 min | Auto-inherits from Bing |

---

## 6. Reddit Launch Blitz (23 July, coordinated)

**8 subreddits, 8 different angles, spread across the day:**

| Time (CEST) | Subreddit | Angle |
|---|---|---|
| 09:00 | r/chess | "Free online Blitz Swiss tonight at 16:00 CEST — DB Chess Cup, 9 rounds" |
| 10:00 | r/chessbeginners | "Beginner-friendly tournament tonight — Free, all ratings welcome" |
| 11:00 | r/SideProject | "I'm 13. Built a chess platform solo. First tournament tonight." |
| 12:00 | r/InternetIsBeautiful | "MasterChess.live — no ads, no popups, just chess" |
| 13:00 | r/indiehackers | "Show IH: MasterChess.live — solo teen founder, 6-month build" |
| 14:00 | r/webdev | "How I built a real-time chess platform at 13 (React + Supabase + Stockfish)" |
| 15:00 | r/serbia | "Srpski tinejdžer napravio šahovsku platformu — turnir večeras" |
| 20:00 | r/chess | POST-EVENT recap with standings screenshot |

**Rules:** Never spam. Comment first for 2 days, then post. Never link-drop
in comments unless someone asks.

---

## 7. Product Hunt Launch

**Prep (2 weeks ahead):**
- 200+ mailing list "notify on launch" clicks (target: 400 upvotes day 1)
- Hunter: someone with existing PH karma (ask in #producthunt on IH Discord)
- Assets: gallery 1280×720 (5 images), logo 240×240, tagline ≤60 chars

**Launch day (Tuesday, 00:01 PST):**
- Tagline: "Chess platform built solo by a 13-year-old. No ads. No paywall."
- First comment (founder): the origin story + roadmap
- Every upvoter gets a 500-coin code
- Live tournament at 16:00 CEST tied to launch — mention in every reply

**After launch:**
- Backlink is permanent, indexed by Google in ~24h
- Aim: top 5 of the day = ~5000 visitors

---

## 8. Directory submissions (50 backlinks, 1 evening)

Priority list (all free, do in this order):

1. BetaList
2. IndieHackers (Product page)
3. Startup Base
4. SaaSHub
5. AlternativeTo (submit as Chess.com alternative)
6. Slant.co
7. F6S
8. Uneed.best
9. Startuplister
10. Product Radar
11. SideProjectors
12. TinyStartups
13. Awesome Indie
14. StartupTabs
15. SaaSGenius
16. Launched
17. Kizy
18. Toolify.ai (has "chess AI" category)
19. TheresAnAIForThat (Chess DNA counts)
20. FuturePedia
21. AI Tools Directory
22. GitHub Trending (open-source one small piece)
23. Awesome-lists on GitHub (`awesome-chess`, `awesome-webapps`)
24. r/InternetIsBeautiful weekly thread
25. Hacker News Show HN (Tuesday 14:00 UTC)

Gaming/chess-specific:
26. ChessBase news submission
27. Chess.com news community blog
28. IM/GM Discord servers (ask before dropping)
29. ChessTech news
30. FIDE.com news@ email

Serbian/regional:
31. Netokracija
32. Startit
33. IT Klub
34. Balkan Startup Hub
35. Startup Voivodina

Long tail:
36-50. GetTheBest, WhatRuns, SimilarWeb, Crunchbase (create profile),
LinkedIn company page, About.me, AngelList, Behance (design case study),
Dribbble (UI shots), Medium (cross-post news), Dev.to (technical write-up),
Hashnode, Substack (weekly newsletter start), Twitter (announce every
tournament), TikTok (30s Cup recap videos).

---

## 9. 30-day Cup Aftermath Plan

- **Day +1**: Publish standings + best game analysis on `/news`
- **Day +2**: Send weekly digest email with Cup recap
- **Day +3**: Reddit r/chess follow-up "Here's what happened at the Cup"
- **Day +7**: Announce Cup #2 (30 August 2026)
- **Day +14**: Product Hunt launch (if not done pre-Cup)
- **Day +21**: First Chess DNA "Wrapped" post — user-generated share cards
- **Day +30**: Growth review — measure signups, retention, top acquisition channel

---

## 10. Metrics to watch

- **Search Console**: impressions on `dragan brakus cup`, `masterchess`,
  `play chess online free 2026`
- **GA4** (once wired via `VITE_GA4_ID`): sessions, avg session duration,
  return rate day-7
- **Supabase**: `heartbeats` last-24h count, new signups/day,
  `tournament_registrations` count for Cup #1
- **Reddit/PH**: upvote count, referral clicks tracked via `?ref=reddit` /
  `?ref=ph` UTM

---

## Owner map

| Task | Owner | Deadline |
|---|---|---|
| GBP event post for 23 July | Nikola | 3 days before |
| Reddit posts (8 subs) | Nikola | Cup day, staggered |
| Product Hunt asset prep | Nikola | 14 days before PH day |
| Directory submissions (50) | Nikola | Any weekend evening |
| Sitemap resubmit after date change | Auto (already done) | ✅ |
| Push notifications (once activated) | Auto cron | Daily |
