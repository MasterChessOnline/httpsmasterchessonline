# 20+ Marketing Ideas — Execution-Ready

Each one has: **What**, **Where**, **Time**, **First action today**.

---

### 1. Bing Webmaster + IndexNow
- **What:** Instant URL indexing on Bing/Yandex/DuckDuckGo.
- **Where:** https://www.bing.com/webmasters — "Import from Google Search Console" (1 click).
- **Time:** 10 min.
- **Today:** After GSC is verified, import to Bing, then submit sitemaps.
- IndexNow key file already at `public/indexnow-key.txt`. Ping endpoint whenever a new blog/news post publishes.

### 2. Yandex Webmaster
- https://webmaster.yandex.com → add site → paste verification code into `<meta name="yandex-verification">` slot in `index.html`.

### 3. DuckDuckGo & Brave
- Both crawl Bing's index. No separate submit — done via #1.

### 4. Pinterest Business
- https://business.pinterest.com — verify domain via meta tag slot.
- Auto-generate one Pin per blog post (1000×1500 vertical, board screenshot + title).
- Target boards: "Chess Openings", "Chess for Kids", "Chess Puzzles".

### 5. Quora Spaces
- Create Space "Free Chess Tools".
- Answer 20 top questions: "best free chess site", "how to improve at chess", "chess.com alternatives", "how to beat Stockfish level X", "learn chess openings free".
- One link per answer, in the last paragraph.

### 6. Hacker News "Show HN"
- **Best time:** Tue–Thu 09:00 EST.
- **Title:** `Show HN: MasterChess.live – free chess, no paywalls, no ads`
- **Body:** 4 short paragraphs — why, what, stack, ask for feedback.
- Only launch once. Don't repost.

### 7. Product Hunt
- Launch on a **Tuesday** (best day, avoids Monday's giant launches).
- Assets: logo 240×240, gallery 1270×760 (5 shots), 30s GIF of a live game.
- Line up 20 "hunters" via r/ProductHuntTeam a week before.

### 8. Indie Hackers milestones
- Post at 100, 500, 1000, 5000, 10000 users.
- Template: "How I got X users in Y days — what worked, what didn't".

### 9. Dev.to + Hashnode (10 SEO articles)
- Topics: "Running Stockfish in the browser with WASM", "Realtime multiplayer with Supabase", "How to build an ELO rating system", "Building a chess move validator with chess.js", "PGN parser in TypeScript".
- Set `<link rel="canonical">` back to `masterchess.live/blog/<slug>` to avoid duplicate content.

### 10. YouTube Shorts — "Puzzle of the Day"
- Auto-render vertical 1080×1920 mp4 from PGN using existing board renderer.
- Post daily → 60s hook: "Can you find mate in 2?"
- Description: "Play free at masterchess.live".

### 11. TikTok organic
- 3 posts/day for 30 days is the growth threshold.
- Hooks: "This trap wins in 5 moves", "Beat Magnus's opening", "Chess.com charges $14/mo — this is free".
- Hashtags: `#chess #chesstok #chessmoves #chessopening`.

### 12. Instagram Reels
- Same content as TikTok, cross-post.
- Add `#chess #chessboard #chessmaster #chessgame`.

### 13. X/Twitter automation
- Cron edge fn `daily-puzzle-poster` posts the daily puzzle at 09:00 local, with board GIF + link.

### 14. Discord server
- Add invite widget to `/community`.
- Roles auto-assigned per rank (Bronze → GM).
- Welcome bot posts /puzzles + /play links.

### 15. Telegram channel
- Daily puzzle + tournament announcements.
- Bot: `@MasterChessLiveBot` — inline mode to send puzzle cards.

### 16. WhatsApp Channel (Balkan focus)
- Broadcast-only; ideal for Serbian audience.
- Daily puzzle image + link.

### 17. Chess streamer outreach
- Target: 50 mid-tier streamers (500–5000 avg viewers).
- Pitch: "Free 'Streamer Mode' toggle (press F), no ads/paywalls popping up mid-stream".
- DM template in docs/marketing/06_META_TIKTOK_ADS.md.

### 18. Referral rewards (in-app)
- +100 coins both sides on successful signup.
- Share modal on Home + after every game win.

### 19. Weekly newsletter
- `/newsletter` signup + double opt-in via Resend edge fn.
- Weekly digest: top games, new puzzles, upcoming tournaments.

### 20. Cookie consent + Consent Mode v2
- GDPR banner gates GA4/Meta/TikTok pixels.
- Required for legit EU tracking; ignoring this = 4% revenue fine risk.

### 21. Microsoft Clarity
- Free heatmaps + session recordings.
- https://clarity.microsoft.com → project ID → paste into env.

### 22. hreflang + Serbian locale `/sr`
- Translate Home + `/play` landing.
- Add `<link rel="alternate" hreflang="sr">` in `<head>`.

### 23. LLMs.txt + FAQPage schema (AEO)
- Publish `/llms.txt` (already exists) with concise site summary.
- Add `FAQPage` JSON-LD on Home + `/how-to-play` — appears in ChatGPT/Perplexity answers.

### 24. Wikipedia / Wikidata entity
- Draft Wikidata item first (easier approval): Q-item with `instance of: chess website`, `official website`, `founder`.
- Once notable (5+ press mentions), draft Wikipedia article.

### 25. Chess forums (long-tail)
- ChessPub, ChessBase forums, Reddit r/tournamentchess.
- Signature link only — never a promo post.

### 26. GitHub stars flywheel
- Open-source a small useful lib (e.g. "react-chess-clock" or PGN parser).
- Link back to masterchess.live in README + demo.

### 27. Local chess clubs (Serbia + region)
- Email 30 clubs: free online tournament hosting for members.
- Trade: club logo on `/community` clubs page.

### 28. Podcast sponsor spots
- Perpetual Chess Podcast, Chess.com Podcast (paid), C-Squared Podcast.
- $200–$500/spot; measure with unique promo code `POD10`.

### 29. Sticker drop
- 100 vinyl stickers with crown logo + `masterchess.live`.
- Ship free to first 100 people who tweet about the site.

### 30. Chess.com forum comments
- Answer "best free alternative" threads honestly, only when genuine.
- Never spam — one comment per profile, well-written.
