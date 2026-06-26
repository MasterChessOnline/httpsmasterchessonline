# Why MasterChess.live News Doesn't Show in Google News Yet — And How to Fix It

> **TL;DR** Google News doesn't index every site automatically. We need to (1) be technically
> eligible (we are), (2) submit the domain to **Google Publisher Center**, (3) keep producing
> dated, original, English news with a clear author and image, and (4) be patient — first
> appearance typically takes 1–4 weeks after submission.

## 1. Why we're invisible right now

The screenshot showing only "SunLive — Tauranga student awarded Junior Master Chess title" proves
Google's News tab is matching the keyword **"master chess"**, not our domain. Reasons our content
isn't appearing yet:

1. **Not registered with Google Publisher Center** — required for News surface eligibility for
   most new domains. (Open-web news indexing also exists but is very slow without it.)
2. **Domain age** — `masterchess.live` is brand new; News favors trust signals built over time.
3. **Article freshness window** — Google News only considers items published in the last ~48h.
   Our seed articles need a continuous publishing cadence (we're shipping that now).
4. **Original reporting signal** — News surfaces stories with bylines, dates, named publication,
   original content. We've now standardized author = **MasterChess.live Newsroom** and added
   founder-first stories with on-the-ground photos.

## 2. What's already fixed in code

- `news-sitemap.xml` uses the official `<news:news>` namespace with `<news:publication_name>`
  set to **"MasterChess.live"** and only includes items <48h old.
- `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` is declared on every page.
- Every article has: title, dek, author (MasterChess.live Newsroom), cover image, datestamp.
- 10 published articles now live in `news_posts`, with 4 founder-photo features.
- `robots.txt` references both `sitemap.xml` and `news-sitemap.xml`.

## 3. Submit MasterChess.live to Google Publisher Center

1. Open: <https://publishercenter.google.com/>
2. Sign in with the same Google account that owns Search Console for `masterchess.live`.
3. Click **Add publication** → name: **MasterChess.live**.
4. Property: `https://masterchess.live`.
5. Categories: *Sports* → *Chess*. Location: *Serbia*. Languages: *English*, *Serbian*.
6. Add the logo (square, ≥1000×1000, on solid background) and a wide logo (1000×200).
7. Under **News content** → add a **Web location**: `https://masterchess.live/news`.
8. Under **Feed**: paste `https://masterchess.live/rss.xml`.
9. Submit for review.

Approval typically takes 2–14 days. Until then, also do step 4 below.

## 4. Manual indexing nudges

- In Search Console, run **URL inspection** on each new `/news/*` URL → **Request indexing**.
- Submit the news sitemap explicitly in Search Console → Sitemaps → add
  `https://masterchess.live/news-sitemap.xml`.
- Re-ping IndexNow via `supabase/functions/news-indexnow-ping` after each new article.

## 5. Keep publishing

Google News rewards consistency. Target cadence:

- **Daily** during launch month: 1 short founder-perspective post (200–400 words).
- **Weekly**: 1 long-form report (800+ words) with photos and internal links to product pages.
- **Real-time**: anything that ships on the platform → publish same day.

## 6. Eligibility checklist (Google News content policy)

- [x] Clear publication name in every article (MasterChess.live)
- [x] Stable author byline ("MasterChess.live Newsroom" or named contributor)
- [x] ISO 8601 datestamps + clear visible date
- [x] Original reporting (founder essays, on-the-ground photos from Serbian tournaments)
- [x] Contact page (`/press`) and ownership transparency (`/nikola-sakotic`)
- [x] No paywalls on news; ad-free
- [x] Proper `news:news` sitemap shipped at `/news-sitemap.xml`
- [x] HTTPS, mobile-friendly, fast Core Web Vitals
