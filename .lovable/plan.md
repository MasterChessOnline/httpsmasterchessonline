## Goal

1. **Chess-Results Serbia listing for DB Chess Cup** — wire the URL/ID into the site so the public badge on `/dragan-brakus` flips from "Pending submission" to "Listed on Chess-Results (SRB)" with a real link.
2. **Slim navbar** — collapse the current 6-section mega-menu (Play / Learn / Compete / Community / Watch / More with ~60 links) down to the few items a normal user actually needs.
3. **Extra ideas** — small, high-leverage additions that fit the same wave.

---

## 1. Chess-Results listing

Today `/dragan-brakus` shows "Pending submission". The schema already has `chess_results_url`, `chess_results_id`, `chess_results_status` on `tournaments`, plus an admin page at `/admin/chess-results` to paste the URL.

Two parts:

- **Data**: ask you for the actual Chess-Results tournament URL (e.g. `https://chess-results.com/tnr<ID>.aspx?lan=1`). I'll `UPDATE` the Brakus row with `chess_results_url`, `chess_results_id`, `chess_results_status = 'listed'`, `federation = 'SRB'`, and re-ping IndexNow.
- **UI**: replace the "Pending submission" block on `/dragan-brakus` with a green "Listed on Chess-Results Serbia (SRB)" badge + outbound link, add the link to the press page, the news article, the footer of the tournament card on the Home/Compete tabs, and to the `Event` JSON-LD as `sameAs` so Google can attach it to the listing.

If you don't have the URL yet, I'll add the federation/short-name to the announcement-TRF export and keep the badge as "Pending" until you paste it into `/admin/chess-results`.

## 2. Slim, normalized navbar

Target: one row, ≤7 top-level items, no mega-dropdowns, mobile parity. Everything else moves into the existing Command Palette (Cmd/Ctrl+K) and the relevant pages.

New desktop top bar:

```text
[Logo]  Play   Learn   Tournaments   News   Community   [🔍 search]  [Coins]  [Avatar]
```

- **Play** → plain link to `/play/online` (Quick Match). A tiny chevron opens a 3-item popover only: Quick Match, vs Bot, Ongoing Games.
- **Learn** → plain link to `/learn`. Popover: Lessons, AI Coach, Analysis.
- **Tournaments** → plain link to `/tournaments`. Popover: Upcoming, DB Chess Cup, Arena.
- **News** → `/news` (no dropdown).
- **Community** → `/community`. Popover: Feed, Clubs, Leaderboard.
- Search icon opens the existing Cmd+K palette — that's where every removed link still lives (Repertoire, Puzzles, Stats, Battle Pass, Stream Hub, Settings, etc.), so nothing is lost.
- Coin pill + avatar menu stay. Streak indicator moves into the avatar menu to reduce noise.

Mobile: bottom bar already exists and stays the source of truth. Top bar is hidden on mobile (already done last turn). The bottom bar is reduced to the same 5 items: Play, Learn, Tournaments, News, Profile.

Removed from top-level (still reachable via palette / profile menu / footer): Watch, Stream Hub, Clubs sub-pages, Battle Pass, Battle Royale, Hand & Brain, Puzzles, Stats, Achievements, Settings, Admin, Why MasterChess.

## 3. Extra ideas worth adding in the same wave

Pick any subset — I'll default to all four if you just say "do it":

- **a. Persistent DB Chess Cup ribbon** — thin gold strip under the navbar showing "DB Chess Cup · June 30 · Register" with a live countdown and registered-player counter. Auto-hides 24h after the event. Single biggest funnel for the tournament.
- **b. "Listed on Chess-Results" trust row** on Home — small logo strip (Chess-Results SRB, FIDE-style rating, Belgrade venue, Nikola founder) right under the hero. Cheap credibility for first-time visitors.
- **c. Auto-publish news article** "DB Chess Cup officially listed on Chess-Results Serbia" the moment the URL is saved in `/admin/chess-results` — pings IndexNow + Google News. Free SEO hit.
- **d. Share card generator** for registrants — after registering, user gets a personal OG image ("I'm player #47 in the DB Chess Cup") with a `/r/{affiliateCode}` link. Drives the viral loop you already built the affiliate table for.

---

## Technical details

- DB: single `UPDATE tournaments SET chess_results_url=…, chess_results_id=…, chess_results_status='listed', federation='SRB' WHERE slug='dragan-brakus-cup';` + insert into `news_posts` for idea (c).
- `src/components/Navbar.tsx`: rewrite `NAV_SECTIONS` to the 5-item shape, drop the wide mega-panel rendering branch, keep `NavSearchPalette` as the escape hatch.
- `src/components/MobileBottomNav.tsx`: reduce to 5 tabs matching desktop.
- `src/pages/DraganBrakusCup.tsx`: replace the pending-submission card with a listed-state card, add Chess-Results link to JSON-LD `sameAs`.
- `src/pages/Index.tsx` (or wherever the hero lives): add the trust strip (idea b) and the Brakus ribbon (idea a) as a single component `<BrakusRibbon />` mounted in `App.tsx` so it sits under the navbar globally.
- `src/pages/AdminChessResults.tsx`: on save, also POST to `news-indexnow-ping` and insert the auto-news row (idea c).
- Share card (idea d): reuse the existing OG image generator pattern; new route `/dragan-brakus/share/:userId`.

## Open question

Do you already have the Chess-Results URL/ID for DB Chess Cup? If yes, paste it and I'll mark it listed in the same migration. If no, I'll ship everything except the live link and you flip it via `/admin/chess-results` once Chess-Results SRB replies.
