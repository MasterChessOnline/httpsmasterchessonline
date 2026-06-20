# Google Business Profile + Google Maps — Detailed Setup

MasterChess is a digital product, so Google Business Profile (GBP) is
**optional** — it only matters if you want to show up on Google Maps and
"chess clubs near me" searches. If you'd rather skip it, the local-SEO
landing pages alone (`/play-chess-from/:city`) carry most of the value.

---

## A. Google Business Profile (manual)

### 1. Create the profile

1. Open <https://business.google.com> → **Manage now**.
2. **Business name**: `MasterChess Online Club`
3. **Category**:
   - Primary: `Game club`
   - Additional: `Online community`, `Education center`
4. **Service area** (no physical address): pick "I deliver goods and services
   to my customers". Add countries you want to appear in (start with Serbia,
   Croatia, BiH, plus US/UK for English).
5. Add contact: `support@masterchess.live` (or your contact form URL).
6. Add website: `https://masterchess.live`.

### 2. Verify

Google offers one of:
- **Video verification** (most common for online-only businesses) — record a
  60-second walkthrough showing the masterchess.live site, your dashboard,
  and you signed in as admin.
- **Postcard** — sent to a real address, takes 7–14 days. Skip if you have no
  office address.

### 3. Optimize the listing

- **Description** (750 char limit, use ~700):
  > MasterChess is a free online chess platform built by a 13-year-old player
  > for everyone who wants to play, learn, and compete without ads. Play
  > ranked games, join weekly tournaments (Swiss, Knockout, King of the Hill,
  > Puzzle), study openings, solve daily puzzles, and climb a global ELO
  > ladder. No paywalls. No bot-fill. Just chess.
- **Photos** (upload at least 10):
  - Hero / OG image (`/og-image.jpg`)
  - Live tournament screenshot
  - Daily puzzle screenshot
  - Hall of Fame page screenshot
  - Mobile UI screenshots
- **Services**: add `Online chess tournaments`, `Chess lessons`, `Chess
  puzzles`, `Chess coach AI`, `Chess club community`.
- **Q&A**: pre-seed 5 common questions (Is it free? Do I need an account?
  Mobile support? Cheating policy? Can I host a tournament?).
- **Posts**: post weekly — new tournament announcements, champion shout-outs,
  big puzzle wins. Drives "freshness" signal.

### 4. Verify on Bing Places too

Bing Places auto-imports from GBP. Open <https://www.bingplaces.com> → Import
from Google. Two listings, one form.

---

## B. Google Maps & Maps Platform connector (for in-app maps)

If MasterChess ever needs to **show a map inside the app** (player heatmap,
"upcoming OTB chess events near you", city pages with embedded maps), connect
the Google Maps Platform connector inside Lovable. It already supports:

- Maps JavaScript API (embed a map on `/play-chess-from/:city`)
- Places API New (autocomplete city search)
- Geocoding (city → lat/lng for sitemap.xml priority)
- Routes API (directions to OTB events, future feature)

### Quick connect

In Lovable chat say: *"connect Google Maps Platform"*. The agent opens the
connector dialog; pick the managed connection (no API key needed on
`*.lovable.app` domains).

### Custom domain caveat

The managed Google Maps key only works on `*.lovable.app` and
`*.lovableproject.com`. On `masterchess.live` (your custom domain) you must
provide your **own** API key:

1. <https://console.cloud.google.com> → create project `MasterChess Maps`.
2. **Billing** → enable (Maps APIs require a billing account; free-tier usage
   still works).
3. **APIs & Services → Enable APIs**: Maps JavaScript API, Places API (New),
   Geocoding API.
4. **Credentials → Create API key**. Copy it.
5. **Application restrictions → HTTP referrers**: add
   - `https://masterchess.live/*`
   - `https://*.masterchess.live/*`
6. In Lovable: connect Google Maps Platform → choose **custom connection** →
   paste your API key. Done.

---

## C. Map-based growth ideas (optional)

Once Maps is connected, MasterChess can:

- Plot a **live player heatmap** on the homepage — anonymized lat/lng of
  active players over the last hour.
- Add **OTB event** discovery: `/events-near/:city` pages that surface local
  chess clubs, with directions powered by Routes API.
- Auto-generate **city H1 variants** on `/play-chess-from/:city`:
  - "Chess tournaments in {city}"
  - "Online chess club {city}"
  - "Free chess games {country}"

The infrastructure (`PlayFromCity.tsx`, `seo-cities.ts`) is already in
place — these are content-level additions, not engineering work.

---

## TL;DR

- **GBP**: optional, ~20 min to set up, gives you Maps presence + Q&A panel.
  Worth it if you ever want to host OTB meetups.
- **Maps connector**: only connect if you want to embed maps inside the app.
- **Custom domain**: needs your own Google Cloud API key with referrer
  restrictions — managed key is `*.lovable.app` only.
