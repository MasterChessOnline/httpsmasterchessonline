# Plan: Centered Board + Signature Weekly Tournament

## 1. Fix board centering (Play vs Bot + Online)

**Problem (from your screenshot):** board sits left, right-side panel (Strength / Time Control / Start) overflows, options get cut off on laptop screens (~1366px / 878px CSS width).

**Fix:**
- Update `src/pages/Play.tsx` and `src/pages/OnlineGame.tsx` (or whichever wraps the board + side panel) to use a centered CSS grid: `grid-cols-[1fr_minmax(280px,360px)]` on `lg+`, single column stacked on mobile, with `place-items-center` and `max-w-7xl mx-auto`.
- Tighten `BOARD_CONTAINER_CLASS` in `src/lib/board-sizing.ts` for the laptop range so board + side panel both fit without horizontal scroll: cap board to `min(calc(100svh - 8rem), 62vw, 720px)` on `lg`, leaving ~360px for the side rail.
- Make the right-side panel `sticky top-20` so Start / Time / Strength stay visible while scrolling.
- Verify with Playwright at 1366×768 and 1280×800 — screenshot Play vs Bot and Online to confirm nothing clips.

## 2. Signature weekly tournament: "MasterChess Monday"

Inspired by Titled Tuesday, but our own brand.

**Concept:**
- **MasterChess Monday** — every Monday 19:00 CET, 3+0 blitz arena, 90 minutes, open to all.
- **Friday Night Fire** — every Friday 21:00 CET, 1+0 bullet arena, 60 minutes.
- **Sunday Classic** — every Sunday 17:00 CET, 10+0 rapid swiss, 7 rounds.
- Auto-created by a cron edge function (`schedule-weekly-tournaments`) every Sunday 00:00 — inserts next 4 weeks into `tournaments` table so the lobby always shows upcoming events.
- Winner gets: title badge ("Monday Champion · {date}"), 500 coins, profile flair for 7 days, auto-tweet/share card.

**Homepage wiring:**
- `TonightArenaBanner` becomes `WeeklySignatureBanner` — reads next upcoming "signature" tournament from DB (new column `tournaments.is_signature boolean` + `signature_series text`).
- Whole card is a `<Link to={"/tournaments/" + id}>` — one click takes user straight into the lobby with live countdown + Join button.
- Shows: series name, countdown, current registrants, prize pool, "Join Now" CTA.

## 3. Bonus creative ideas (pick which to build)

1. **"Beat the Champion"** — winner of last MasterChess Monday becomes "Champion of the Week"; anyone who beats them in a ranked game gets a special badge + bounty coins. Creates a target for the community.
2. **Tournament Pass** — €2.99/month: priority queue, exclusive Wednesday titled-only events, custom flair. Recurring revenue.
3. **Live tournament ticker** on homepage — thin bar above the fold: "🔴 LIVE: MasterChess Monday · Round 4 · Leader: @nikola (12/12)" — clickable, drives traffic into spectating.
4. **Auto share-cards after tournament** — top 3 get an auto-generated PNG with their result + standing, one-tap share to X/IG/WhatsApp.
5. **Country leaderboard inside each tournament** — "Best Serbian player: @x · Best from Croatia: @y" — taps national pride, drives regional shares.
6. **Tournament Replay Hub** — `/tournaments/{id}/replays` auto-curates top 5 games from each event with one-click "Analyze" — extends engagement past the event.
7. **Tournament-only chat room** — opens 15min before start, closes 15min after — creates a "live event" feeling.

## Technical details

**Files to edit:**
- `src/pages/Play.tsx`, `src/pages/OnlineGame.tsx` — grid layout fix
- `src/lib/board-sizing.ts` — tighter laptop cap
- `src/components/TonightArenaBanner.tsx` → rename / refactor to `WeeklySignatureBanner.tsx`, read from DB
- `src/pages/Index.tsx` — swap component

**DB migration:**
- `ALTER TABLE tournaments ADD COLUMN is_signature boolean DEFAULT false, ADD COLUMN signature_series text;`
- Seed first 4 weeks of each series.

**New edge function:**
- `supabase/functions/schedule-weekly-tournaments/index.ts` — cron weekly, idempotent insert.

## What I need from you

Confirm which of these to build now. Suggested order:
1. Board centering fix (quick, high impact) ✅
2. MasterChess Monday + Friday Night Fire + Sunday Classic + homepage banner ✅
3. Pick 2-3 from the bonus list (my recommendation: #1 Beat the Champion, #3 Live ticker, #5 Country leaderboard)

Reply **"kreni"** for all of the above, or list the numbers you want.
