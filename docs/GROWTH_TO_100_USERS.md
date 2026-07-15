# MasterChess — Growth & Marketing Playbook

Goal: **go from ~0 → 100+ real active users**, then compound.
Hero campaign: **DB Chess Cup, 18 July 2026, 16:00 CEST**.
Every idea below routes users toward the DB Cup or Quick Match.

---

## 1. Google Ads (paid search + display) — start €5–€10/day

### 1a. Search campaigns (highest-intent, cheap CPC)

Bid on long-tail buyer intent. Suggested ad groups:

| Ad group | Sample keywords | Landing page |
|---|---|---|
| Play free | `play chess online free`, `free chess site no ads`, `chess online no signup` | `/play-guest` |
| vs Bots | `chess vs computer`, `chess bots free`, `beat chess bot`, `chess ai training` | `/play` |
| Tournaments | `chess tournament 2026`, `online chess tournament free`, `swiss chess tournament online` | `/dragan-brakus` |
| Learn | `learn chess online`, `chess openings trainer`, `chess for beginners` | `/learn` |
| Kids | `chess for kids online`, `chess lessons for kids free` | `/learn` |
| Serbian | `šah online besplatno`, `učenje šaha online`, `blitz turnir online`, `šah srbija turnir` | `/play-guest` |
| Brand defense | `masterchess`, `master chess live`, `masterchess.live` | `/` |

### 1b. Campaign structure
- **Search — English (Worldwide, excl. India/PK)**: max CPC €0.15 for long-tail, €0.05 for brand
- **Search — Serbian (Serbia + region)**: max CPC €0.10
- **Performance Max — DB Cup**: single campaign, event-focused creative, ends 19 Jul
- **YouTube TrueView** — pre-roll on chess videos (audiences: chess.com viewers, chess24, GothamChess, Levy Rozman, Anna Cramling)

### 1c. Conversion tracking (needs GA4 + Ads set up)
Fire events: `signup_completed`, `game_started`, `tournament_registered`, `install_pwa`.
Import as Ads conversions with values: signup = €2, tournament reg = €5.

### 1d. What to paste when creating the campaign
- Final URL per ad group (see table above)
- **Headline 1**: `MasterChess — Free Online Chess`
- **Headline 2**: `Play, Train, Compete. No Ads.`
- **Headline 3**: `Join DB Chess Cup · 18 Jul 2026`
- **Description 1**: `Free chess vs players or AI bots. Live tournaments, Stockfish analysis, opening trainer.`
- **Description 2**: `Play instantly, no signup required. Register for the DB Chess Cup — free entry.`

---

## 2. Meta / Instagram / TikTok Ads

### 2a. Creative
- **Reels-first (9:16, 15 s)** — highest CTR format
- Hook variants:
  1. "I built a chess site alone at 13" (Nikola story = premium hook)
  2. "This position ruins beginners — can you solve it?" (puzzle overlay)
  3. "I challenge you to beat this bot in 10 moves"
  4. "500 free coins for your first game — masterchess.live"
- Always end with clear CTA + logo + URL

### 2b. Audiences
- **Interest**: Chess.com, Lichess, Magnus Carlsen, chess players, board games
- **Retargeting**: Meta Pixel fires on `/play-guest` visit → retarget with "Finish your first game, get 500 coins"
- **Lookalike**: 1% from DB Cup registrants once you have 100+ conversions

### 2c. Budget: €3–€5/day per platform, kill ads with CTR < 1.2%

---

## 3. Google Business Profile + Local SEO

### 3a. Verify + optimise (docs in /docs/GBP_*)
- Categories: **Chess club** (primary) + **Software company** + **E-sports team**
- Profile photo: new crown logo (public/app-icon-512.png)
- Cover photo: tournament screenshot
- Add 15+ photos: board setups, Nikola portrait, tournament panels, phone screenshots
- Description: mention DB Chess Cup, free entry, online play, Belgrade base

### 3b. Weekly GBP posts (automate via publish-gbp-posts edge function)
- Monday: puzzle-of-the-week
- Wednesday: player spotlight
- Friday: tournament preview / recap
- Sunday: lesson highlight

### 3c. Reviews playbook
- After a user's 3rd win, show modal: "Enjoying MasterChess? ⭐ Leave a Google review"
- Deep-link to GBP review URL
- Target: 20 reviews in first month

### 3d. Local citations (submit to)
- Šahovski savez Srbije (chess federation)
- Sportski portali: sport.rs, mozzartsport.com
- Gradski katalozi: 011info.com, poslovi-oglasi.rs
- International: Bing Places, Apple Maps Connect, Yelp

### 3e. Google Maps pin
- Address on file (see docs/GOOGLE_MAPS_INTEGRATION.md)
- Add "Nearby chess places" integration to `/community/map`

---

## 4. Organic content + community

### 4a. Reddit (highest free-conversion source)
Weekly posts, no spam, contribute first:
- `/r/chess` — "I'm 13 and I built a free chess site — DB Cup 18 Jul, would love feedback"
- `/r/chessbeginners` — puzzle-of-the-week post
- `/r/serbia`, `/r/beograd` — Serbian tournament announcement
- `/r/webdev`, `/r/SideProject` — technical build story

### 4b. YouTube (DailyChess_12 collab)
- Dedicated stream: "Play me on MasterChess — winners get badges"
- Description includes CTA link with `?utm_source=youtube`
- Add stream to `/live` hub

### 4c. TikTok / IG Reels — 3 posts/week
1. Speedrun of bot demolition (15 s)
2. "Top comment picks my next move" live game
3. Blunder-of-the-week from Community feed

### 4d. Press pitch — Nikola's story
Angle: **13-year-old solo founder launches ad-free chess platform to rival Chess.com**.
Send to:
- **Serbia**: Blic, Politika, Kurir, RTS, Nova.rs, Telegraf, N1 Srbija
- **Chess press**: Chess.com news desk, ChessBase.com, Chess24
- **Tech**: TechCrunch "young founder" desk, Hacker News (Show HN)
- **Local**: OŠ chess clubs, gradske biblioteke

Template email: see `docs/MEDIA_OUTREACH.md`.

### 4e. Long-tail SEO landing pages to build
Each with proper H1 + FAQPage JSON-LD + internal links:
- `/free-chess-online`
- `/play-chess-with-friends`
- `/chess-for-beginners`
- `/chess-openings-guide`
- `/šah-online-besplatno` (SR)
- `/šah-srbija` (SR)
- `/chess-tournaments-2026`
- `/how-to-play-chess-online`
- `/chess-vs-computer-free`

Run Semrush `keyword_research` on each phrase before writing to pick the best-volume/lowest-difficulty variant.

---

## 5. In-app viral primitives (BUILD next)

Ads have nowhere to convert to without these. Build in this order:

1. **`/r/{code}` referral link** — inviter + invitee both get 250 coins + "Founder Friend" badge. Uses existing `referrals` table.
2. **DB Cup countdown ticker** — thin bar under navbar with live seconds to 18 Jul 16:00 CEST + registered/max count.
3. **"Founder 100" permanent badge** — auto-awarded to first 100 verified accounts. Shown on profile + leaderboard.
4. **Post-game one-tap share PNG** — final board + rating gain + username + URL, shared to WhatsApp/IG/X.
5. **GA4 + Meta Pixel stubs** in `index.html` behind `VITE_GA4_ID` and `VITE_META_PIXEL_ID` env vars.
6. **Email capture popup** for guests: "Get notified 15 min before DB Cup starts"
7. **Weekly leaderboard email** via existing email queue → engagement loop
8. **Smart PWA install prompt** — trigger hard after game 3 (component already exists)

---

## 6. Community / retention flywheel

- Discord auto-role by rating tier (bracelet effect)
- "Streak protection" (miss one day = warning, not reset)
- Daily login rewards ladder (already exists — promote it hard on home)
- Weekly free-entry mini-tournament every Sunday 20:00 CEST
- "Challenge a friend" `/vs/{code}` WhatsApp deep-link
- Public wall of DB Cup registrants (indexed, SEO magnet + ego share)
- Auto-tweet on: new registration, top-10 finish, upset wins
- Push notification: "friend online now" (opt-in)

---

## 7. Distribution channels — where to actually post

| Channel | Cost | Effort | Speed | Fit |
|---|---|---|---|---|
| Google Search Ads | €5/day | Low | Days | High (buyer intent) |
| Meta/IG Reels ads | €3/day | Med | Days | High |
| TikTok organic | Free | High | Weeks | Medium |
| Reddit organic | Free | Low | Days | **Very high** |
| YouTube (DailyChess_12) | Free | Low | Days | Very high |
| WhatsApp direct referrals | Free | Low | Instant | **Very high (SRB/EU)** |
| GBP posts | Free | Low | Weeks | Medium |
| Serbian press | Free | Med | Weeks | High (once) |
| Chess Discord servers | Free | Low | Days | High |
| Chess Facebook groups | Free | Low | Days | Medium |
| Show HN / ProductHunt | Free | Med | 1-day | Medium |

---

## 8. 30-day KPI targets

| Metric | Baseline | 30d target |
|---|---|---|
| Signups | ~0 | **100** |
| DB Cup registrants | 0 | **60** |
| Weekly active users | ~0 | **40** |
| Referral conversion | — | ≥15% |
| PWA installs | ~0 | 25 |
| Google reviews | 0 | 20 (≥4.5 avg) |
| Reddit upvotes cumulative | 0 | 500 |
| GBP profile views | 0 | 300 |

Track weekly. Kill anything under-performing after 2 weeks.
