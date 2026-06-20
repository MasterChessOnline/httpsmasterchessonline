# Google Search Console — Detailed Setup for MasterChess

Goal: Google indexes every page on `masterchess.live` and we can see clicks /
impressions / CTR per keyword.

We already ship the technical SEO (sitemaps, robots, JSON-LD, OG tags,
canonicals). This guide covers the **manual** Google Search Console (GSC) side:
add the property, verify, submit sitemaps, monitor.

---

## 1. Add the property (5 min)

1. Open <https://search.google.com/search-console>.
2. **Add property → Domain** (preferred) → enter `masterchess.live`.
3. Google shows you a **TXT record** to add at your DNS provider:
   ```
   Type: TXT   Host: @   Value: google-site-verification=XXXXXXXXXXXX
   ```
4. Add the TXT at the registrar where `masterchess.live` is registered
   (Lovable's Domains tab tells you the registrar). Save.
5. Wait 5–60 min, then click **Verify**.

If you'd rather verify per-URL (only `https://masterchess.live/` instead of the
whole domain), pick **URL prefix property** and use the **HTML tag** method —
the meta tag goes into `index.html`, and Lovable's MasterChess project already
supports adding it (just say "add the GSC meta verification tag with content
google-site-verification=XXXXX").

---

## 2. Submit sitemaps

MasterChess publishes a sitemap index at
`https://masterchess.live/sitemap_index.xml` covering every shard:

- `sitemap.xml` — core static routes
- `sitemap-openings.xml` — opening landing pages
- `sitemap-cities.xml` — `/play-chess-from/:city` pages
- `sitemap-bots.xml`, `sitemap-beat-bots.xml` — bot profile + landing pages
- `sitemap-puzzles.xml`, `sitemap-mates.xml` — puzzle pages
- `sitemap-elo.xml` — ELO tier landings
- `sitemap-famous-games.xml`, `sitemap-players.xml`, `sitemap-glossary.xml`,
  `sitemap-tools.xml`, `sitemap-landings.xml`
- `sitemap-images.xml`

In GSC → **Sitemaps**, submit one row:

```
sitemap_index.xml
```

That's it — Google reads the index and crawls every shard.

If a shard fails to parse, GSC shows the error on that row. The most common
cause is a stale URL after a page is deleted; regenerate by running `npm run
dev` once (the `predev` hook rebuilds all sitemaps from current data).

---

## 3. Speed up indexing for new pages

Two automated paths are already wired in:

- `submit-sitemaps-gsc` edge function — call it after a content drop, it
  reposts every sitemap shard to GSC.
- `indexnow-ping` edge function — pings IndexNow (Bing + Yandex) with new
  URLs, secret `INDEXNOW_KEY` already configured.
- `google-indexing-ping` edge function — pings Google's deprecated ping
  endpoint (no longer required but harmless).

To request indexing for a single URL manually: GSC → **URL Inspection** →
paste the URL → **Request Indexing**. Use this for the most important new
landing pages (`/ranked`, `/hall-of-fame`, big blog posts).

---

## 4. Keywords to monitor

Track these in GSC → **Performance → Queries** after 2–3 weeks of data:

**Brand**
- `masterchess`
- `masterchess live`
- `masterchess.live`

**Core product**
- `play chess online free`
- `free chess no ads`
- `chess tournaments online`
- `daily chess puzzle`
- `online chess club`

**Long-tail (high intent, low competition)**
- `play chess with friends free no signup`
- `best free chess site 2026`
- `chess opening trainer free`
- `chess rating explained`
- `learn chess in 7 days`
- `chess tournaments serbia`
- `online chess club balkan`

**Bot landings**
- `beat <botname> chess`
- `chess bots free`

The site already has dedicated landing pages for most of these in
`src/lib/seo-landings-en.ts` and `src/lib/seo-cities.ts`. If a query is
showing impressions but no clicks, the matched landing's title/description
needs a rewrite — that's the fastest CTR lever.

---

## 5. Filters to set up

Pin these in GSC:

1. **New pages last 28 days** — Pages tab, sort by impressions desc, filter
   for new entries. Tells you which fresh landings are actually crawled.
2. **Position 11–20** — Performance tab, set position filter `>= 11 AND <= 20`.
   These are page-2 keywords; 1–2 days of on-page tuning pushes them to page 1.
3. **CTR < 3% with > 100 impressions** — title/meta rewrite candidates.

---

## 6. Verifying via the connector (optional, advanced)

If you connect the Google Search Console connector inside Lovable, the agent
can read your performance data, verify new properties using the
`META` verification token, and post sitemaps for you with one command — see
the connector setup docs.

---

## Common mistakes

- **Submitting `sitemap.xml` instead of `sitemap_index.xml`** — works but
  Google only crawls the first shard. Always submit the index.
- **`Disallow: /` in robots.txt** — blocks everything. MasterChess ships
  `Allow: /` by default; don't change it.
- **Canonical pointing to homepage on every page** — kills per-page rankings.
  MasterChess uses per-route canonical via `<Helmet>` correctly.
- **Verifying the wrong domain prefix** — `https://masterchess.live` and
  `https://www.masterchess.live` are separate URL-prefix properties. Use the
  Domain property (no prefix) to cover both.
