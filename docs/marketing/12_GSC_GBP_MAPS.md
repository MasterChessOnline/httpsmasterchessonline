# Google Search Console + Business Profile + Maps

## 1. Google Search Console (5 min)

1. Go to https://search.google.com/search-console
2. Add property → **URL prefix** → `https://masterchess.live`
3. Verification method → **HTML tag** → copy the `content="..."` value
4. Paste in `index.html` where you see `<meta name="google-site-verification" content="">` (leave the tag, only fill content)
5. Publish → click "Verify"
6. In GSC → Sitemaps → submit: `sitemap.xml`, `sitemap-openings.xml`, `sitemap-puzzles.xml`, `sitemap-tournaments.xml`, `sitemap-players.xml`, `sitemap-cities.xml`, `sitemap-news.xml`
7. Request Indexing on top pages: `/`, `/play`, `/puzzles`, `/openings`, `/tournaments`

## 2. Google Business Profile (online business)

MasterChess is online-only → register as **Service-area business**.

1. https://business.google.com → Add business
2. Name: `MasterChess.live`
3. Category (primary): **Software company** · secondary: **Chess club**
4. "I deliver goods and services to my customers" → Yes, no storefront
5. Service area: your city + region (or "Worldwide (online)")
6. Verification: postcard (5–10 days) OR video call
7. After verification:
   - Upload the new logo (`public/logo-crown.png`) as profile pic
   - Upload OG image (`public/og-image.jpg`) as cover
   - Add 5 screenshots (Play, Puzzles, Tournaments, Openings, Bots)
   - Website URL: `https://masterchess.live`
   - Post weekly: new features, tournament results, streamer highlights

## 3. Google Maps

Auto-populated from GBP once verified. No separate action needed.

For local SEO boost, add `LocalBusiness` JSON-LD to `/contact` page (already scaffolded in code).

## 4. Bing Places (import from GBP in 1 click)

https://www.bingplaces.com → "Import from Google" → done.

## 5. Apple Business Connect (free, often skipped)

https://businessconnect.apple.com → same info as GBP → appears in Apple Maps + Siri.
