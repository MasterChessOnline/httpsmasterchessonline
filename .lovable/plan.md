# Plan: Build everything except #4 + add anti-chess.com original ideas

## Part A — Approved boosters (skipping #4 Live ticker)

Built in this order for maximum compounding effect:

**1. Post-game share card (PNG)**
- Edge function `og-game-card` renders FEN + result + handle + `masterchess.live/vs/{code}` watermark using satori/canvas → PNG.
- "Share" sheet after every finished game: X, WhatsApp, Telegram, copy link, download image.
- `<meta property="og:image">` per shared game URL.

**2. Referral rewards (wire existing `referrals` table)**
- `/invite` page with personal link `masterchess.live/?r={code}`.
- Cookie capture on landing → set on signup → `claim-referral` edge function awards 100 coins + 50 Battle Pass XP to inviter when invitee finishes first ranked game.
- Profile widget: "Invite 3 friends → unlock Gold board frame".

**3. Daily streak push (existing `push_subscriptions`)**
- Cron edge function `streak-fomo-push` runs hourly; for each user at 21:00 local with active streak ending in <3h, sends "🔥 Your N-day streak ends in {h}h — play 1 game to keep it."

**5. Daily King spotlight on `/`**
- New `<DailyKingSpotlight />` reads `daily_kings` for last 24h winner; crown animation, "Challenge the King" CTA → `/vs/{kingUsername}`.

**6. One-click spectate hero (logged-out only)**
- `<FeaturedLiveGame />` slot on `/` hero for guests: picks highest-rated currently-live game from `online_games`, embeds mini board with live moves via Realtime, "Watch full game →" CTA into signup funnel.

**7. Donor wall on `/supporter`**
- `recent_donors` SECURITY DEFINER RPC returns last 20: display name or "Anonymous", amount, time. Realtime sparkle animation on new INSERT.

**8. Milestone unlocks**
- Extend `get_donation_progress` to return current milestone (25/50/75/100%).
- `<body data-milestone="50">` controls sitewide cosmetic: gold-dust particles in lobby (50%), animated gold border on logo (75%), site-wide fireworks for a day (100%). Turns donating into shared event.

**9. "Buy me a move" $1 tip in spectator mode**
- Tip button on `/live` and on spectated games → `create-payment` with `itemType: "stream_tip"`, $1 default. Logged in `stream_donations`.

**10. Programmatic opening pages `/openings/{eco}`**
- Static SEO route per ECO code (A00–E99 from opening tree).
- Page: name, moves, brief history snippet, "Play this opening vs bot" CTA, top 5 master games from existing tree.
- Generator script + sitemap.xml entries.

**11. Programmatic puzzle pages `/puzzle/{id}`**
- One indexable URL per puzzle in cache; og:image is rendered position.
- "Solve this puzzle" CTA → opens in `/puzzles` with that puzzle pre-loaded.

**12. Weekly recap email**
- Cron edge function `weekly-recap` runs Sunday 18:00 UTC. Per user: games played, ELO delta, best win, biggest blunder marker (manual review only), favorite opening, daily-king count.
- Uses existing email infra. Honors `notification_preferences`.

**13. Cmd+K → "Challenge a friend"**
- New command palette entry generates `/vs/{code}` link, copies to clipboard, toast: "Link copied — paste anywhere".

---

## Part B — Original ideas chess.com would NEVER ship

These are the differentiators. All respect: zero AI in human play, no fake data, no competitor name-drops.

**N1. Soul Replay — your move in their hand**
Every finished game produces a 6-second vertical MP4 (Deno + ffmpeg edge function): the **last 3 moves animated** + result + your handle, formatted for IG Reels / TikTok / YT Shorts. One tap to download. Chess.com posts boring screenshots; we hand users finished short-form video.

**N2. Rival System — automatic nemesis**
Server cron tags any opponent you've played 3+ times. Profile shows "Your Rival: @x — H2H 4-2, last loss 2d ago". Generates a `/rival/{a}-vs-{b}` page with full H2H history that's shareable + indexable. Creates personal stories chess.com's flat leaderboards never do.

**N3. Confession Booth**
After a loss, optional 1-sentence "what went wrong" textarea. Saved private by default. Toggle "share publicly" → posts to a `/confessions` feed (anonymous handle option). Massively human, totally on-brand with FounderNote / Human Soul Layer. Nothing like it exists on competitors.

**N4. Heartbeat — pulse before key moves**
On long-think moves (>15s), record a single "tension" marker (no AI eval, just time + move number). Post-game review highlights "Your 3 heartbeat moments". Replaces engine-bar drama with **emotional** drama. Pure human-only metric.

**N5. Cover Your Tracks — opening anonymity mode**
Toggle in settings: "Hide my opening from explorer for next 5 games". Lets ambitious players prep secretly. Chess.com sells this as premium; we make it free + frame it as respect for the human craft.

**N6. The Door — random handshake button**
On any page, a small "🚪 Knock" button. Clicking pairs you LIVE-VOICE-ONLY with one other person who knocked in last 60s, for a 60-second chess chat (no game). Pure serendipity, zero gameplay. Builds community no big platform would risk.

**N7. Postcard — request a comment from a stronger player**
After a game, send PGN + 1 question to any user >200 ELO above you. They get a notification: "Reply with one paragraph + earn 50 coins". Creates organic mentorship loop. Chess.com would gate this behind coach payments.

**N8. The Quiet Hour**
Every day 03:00–04:00 your local time: lobby skin changes to monochrome, no chat, no taunts, no leaderboard updates. "Play in silence" mode for serious focus. Pure brand statement, polar opposite of casino-style competitor UIs.

**N9. Your Year in 12 Moves**
On Dec 31 (and on demand): auto-generated "year wrapped" page — 12 most-significant moves from your year (biggest comeback, highest-rated win, longest think, fastest mate). Vertical-share format. Annual viral moment chess.com botches with bland stat dumps.

**N10. Echo — reply to any move with an emoji**
On any finished public game (yours or spectated), tap any move to leave one emoji reaction visible to anyone viewing that game later. Builds collective memory on famous moves. Game pages become alive over time.

---

## Build order (recommendation)

If you want max bang fast, I'd do this sequence in waves:

1. **Wave 1 (viral seed)**: #1 share card → #10 opening pages → N1 Soul Replay → #11 puzzle pages.
   *Why first:* every game/visit produces shareable surfaces immediately.
2. **Wave 2 (retention)**: #2 referrals → #3 streak push → #12 weekly recap → #13 Cmd+K challenge.
3. **Wave 3 (identity)**: N2 Rival → N3 Confession → N4 Heartbeat → #5 Daily King → #6 spectate hero.
4. **Wave 4 (donation engine)**: #7 donor wall → #8 milestone unlocks → #9 stream tip.
5. **Wave 5 (soul features)**: N5 Cover Tracks → N6 Door → N7 Postcard → N8 Quiet Hour → N9 Year in 12 → N10 Echo.

## Tech notes (for me, not you)

- Image/video edge fns: satori + resvg for PNG; ffmpeg WASM for MP4 (single 6s clip stays under memory limits).
- Realtime: piggyback on existing channels (`online_games`, `purchases`).
- All new RPCs SECURITY DEFINER with explicit GRANT + RLS on underlying tables.
- New tables (rivals_cache, confessions, heartbeats, postcards, move_echoes) all RLS-locked; auth.uid() scoping.
- Cron jobs via `pg_cron` + `pg_net` calling edge functions.
- No competitor names in any UI string.
- Respect `notification_preferences` and Streamer Mode toggles everywhere.

## Confirmation needed

This is **A LOT**. ~20+ features. I can:
- **Option α**: Build it all in waves, each wave deployed before next starts (~5 separate turns).
- **Option β**: Just Wave 1 now (4 highest-impact features) and we evaluate before continuing.

Tell me α or β (or pick specific items) and I start.
