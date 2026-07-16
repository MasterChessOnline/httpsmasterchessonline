# Yandex Webmaster — Setup

Yandex is #1 in Russia, Kazakhstan, Belarus and has ~50M unique searches/day.
MasterChess is English-first, but chess is universal — free traffic worth 10min.

## 1. Verify

1. Go to https://webmaster.yandex.com → **Add site** → `https://masterchess.live`
2. Choose **Meta tag** verification method
3. Copy the `content="..."` value
4. Paste into `index.html`:
   ```html
   <meta name="yandex-verification" content="PASTE_HERE" />
   ```
5. Publish → click **Verify** in Yandex dashboard

## 2. Submit sitemap

After verification, Yandex → **Indexing → Sitemap files** → add each:
- `https://masterchess.live/sitemap.xml`
- `https://masterchess.live/sitemap-tournaments.xml`
- `https://masterchess.live/sitemap-news.xml`
- `https://masterchess.live/sitemap-openings.xml`
- `https://masterchess.live/sitemap-cities.xml`
- `https://masterchess.live/sitemap-players.xml`
- `https://masterchess.live/sitemap-beat-bots.xml`
- `https://masterchess.live/sitemap-glossary.xml`
- `https://masterchess.live/news-sitemap.xml`

## 3. IndexNow (auto ping)

Yandex was the original IndexNow partner. The project already has the key file
`/public/4f83d558d0d3ec7b2398bf19c3c84c1b.txt` and the `indexnow-ping` edge
function pings both Yandex and Bing endpoints. No extra setup.

## 4. Turbo Pages (optional, mobile speedup)

Yandex Turbo = AMP equivalent, hosted on Yandex CDN. Skip unless you have
Russian-language content. When you do:
1. Create `public/turbo.xml` (RSS-like feed of news posts)
2. Register in Yandex Webmaster → Turbo pages

## 5. Yandex Metrica (analytics, optional)

Free, session recordings + heatmaps. https://metrica.yandex.com
Add tag ID to `.env` as `VITE_YANDEX_METRICA_ID` and wire into `src/lib/analytics.ts`.

## 6. Yandex Zen / Dzen news distribution

If you write regular chess news → Yandex Zen (now Dzen) auto-aggregates RSS.
The site already has `/rss.xml` — register it at https://dzen.ru/publishers.
