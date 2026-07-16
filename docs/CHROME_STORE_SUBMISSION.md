# Chrome Web Store — Submission Guide

The MasterChess Quick Play extension is packaged at
`public/masterchess-extension.zip`. Publishing it to Chrome Web Store gives
one-click install + permanent backlink on the store listing.

## 1. Developer account ($5 one-time)

1. https://chrome.google.com/webstore/devconsole
2. Sign in with a Google account (preferably `contact@masterchess.live`)
3. Pay **$5 one-time** registration fee
4. Verify identity (may take 1-3 days first time)

## 2. Prepare assets

| Asset | Size | Purpose |
|---|---|---|
| Extension icon | 128×128 PNG | Store listing + install prompt |
| Small promo tile | 440×280 PNG | Store category pages |
| Large promo tile (optional) | 920×680 PNG | Featured sections |
| Marquee (optional) | 1400×560 PNG | Homepage rotation (rare) |
| Screenshots | 1280×800 or 640×400 | 1–5 shots of popup + context menu |

All assets should carry the gold-crown MasterChess brand. Reuse
`/public/og-image.jpg` cropped for promo tiles.

## 3. Copy pack

**Name:** `MasterChess Quick Play — Free Online Chess`

**Short description** (132 char max):
> One-click chess: instant play, daily puzzle, and right-click FEN analysis on MasterChess.live. Built by a 13-year-old.

**Full description:**
```
Play chess in one click from any tab.

• Instant Play — click the crown, jump straight into a game (no signup)
• Daily Puzzle — one puzzle per day, right in the popup
• Right-click FEN → Analyze — highlight any chess position and open it on MasterChess Analysis (Stockfish-powered)
• Live tournament countdown — see when the next Blitz tournament starts
• Zero tracking, zero ads — free forever

MasterChess.live is a free online chess platform built solo by a 13-year-old
programmer from Serbia. Real human play, daily tournaments, Stockfish
analysis, and 9 AI bots (400–2000 ELO). No paywalls, no bot-fill in
matchmaking.

Featured event: **Dragan Brakus Cup — 23 July 2026, 16:00 CEST.** Free entry.

Website: https://masterchess.live
```

**Category:** Productivity (or Fun)
**Language:** English
**Website URL:** https://masterchess.live
**Support URL:** https://masterchess.live/contact
**Privacy policy URL:** https://masterchess.live/privacy

## 4. Privacy justification (required)

Chrome Web Store asks why each permission is needed:

- `contextMenus` — "Add right-click menu to analyze selected FEN chess positions on MasterChess."
- `storage` — "Store user's preferred puzzle difficulty locally (never sent to server)."
- `notifications` — "Notify user when a tournament they registered for is starting."
- Host permission `https://masterchess.live/*` — "Fetch live tournament countdown and daily puzzle from MasterChess."

**Data usage:** "This extension does NOT collect, transmit, or sell any user data. All requests go to masterchess.live public endpoints only."

## 5. Upload flow

1. Developer Console → **New item** → upload `masterchess-extension.zip`
2. Fill in Store listing (copy above)
3. Fill in Privacy practices (justifications above)
4. Set distribution → **Public**
5. Submit for review

**Review time:** typically 2–7 days for first submission, <24h for updates.

## 6. Post-launch

- Share Chrome Store link everywhere (Reddit, Twitter, IH)
- Ask first users for 5-star reviews (target: 20 reviews in first month)
- Update every 2 weeks with tiny changes to stay "recently updated" (algo boost)

## 7. Cross-browser (bonus)

The same ZIP works on:
- **Microsoft Edge Add-ons** — https://partner.microsoft.com/dashboard/microsoftedge (free, 1-2 day review)
- **Firefox Add-ons (AMO)** — https://addons.mozilla.org/developers (free, needs `browser_specific_settings` block in manifest)
- **Opera Add-ons** — https://addons.opera.com (free, 3-5 day review)

Submitting to all 4 stores = 4 permanent high-authority backlinks + install
funnel from 90%+ of desktop browsers worldwide.
