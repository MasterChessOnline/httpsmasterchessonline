# Bing Webmaster Tools — Setup

Bing = 8-10% desktop search share globally, plus powers DuckDuckGo, Ecosia,
Yahoo. Setting up = free traffic on 4 search engines with one form.

## 1. Verify

Fastest path: **Import from Google Search Console** (needs GSC already verified).

1. Go to https://www.bing.com/webmasters
2. Click **Import your sites from Google Search Console**
3. Sign in with the same Google account as GSC → sites auto-import + verify

**Manual method** (if GSC isn't set up yet):
1. Bing Webmaster → **Add site** → `https://masterchess.live`
2. Choose **HTML Meta Tag** → copy `content="..."`
3. Paste into `index.html`:
   ```html
   <meta name="msvalidate.01" content="PASTE_HERE" />
   ```
4. Also save the GUID into `public/BingSiteAuth.xml`
5. Publish → click **Verify**

## 2. Submit sitemap

Bing Webmaster → **Sitemaps** → add:
- `https://masterchess.live/sitemap.xml` (main index)
- Repeat for each sub-sitemap (tournaments, news, openings, cities, players, etc.)

## 3. IndexNow (already wired)

Bing invented IndexNow. Key file at `/public/4f83d558d0d3ec7b2398bf19c3c84c1b.txt`
already ships. The `indexnow-ping` edge function pings Bing on every new SEO
page/news post — no extra work.

## 4. URL submission (10K/day quota)

Bing lets you submit up to **10,000 URLs/day** for near-instant indexing.
Use this on Cup day and after every major landing page batch (`/vs-bot/*`,
`/chess-in-{country}`, etc.).

Bing Webmaster → **URL Submission** → paste up to 10K URLs from any sitemap.

## 5. Bing Places (equivalent to Google Business Profile)

https://www.bingplaces.com → **Import from Google** (one click from GBP).
Auto-syncs on every GBP update.

## 6. Powered downstream

Once Bing indexes:
- **DuckDuckGo** — auto-inherits
- **Yahoo Search** — auto-inherits
- **Ecosia** — auto-inherits
- **Startpage** — auto-inherits

One Bing setup = 5 search engines covered.
