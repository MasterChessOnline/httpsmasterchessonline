# DB Chess Cup — Reschedule + Auto-Cleanup + Growth Playbook

## 1. Reschedule Dragan Brakus Cup

Update the seeded tournament row `Dragan Brakus Humanitarian Blitz`:
- `starts_at` → **2026-08-10 16:00** (Europe/Belgrade → stored as UTC 14:00)
- `registration_opens_at` → now (still open)
- `status` → `registering`
- Reset `current_round` to 0 if it drifted

Also refresh any hardcoded date strings in copy:
- `src/pages/DraganBrakusRegister.tsx` (hero date line)
- `src/pages/DraganBrakusLive.tsx` (if any date mention)
- `docs/DRAGAN_BRAKUS_GBP_EVENT.md` (marketing pack)
- `public/sitemap-tournaments.xml` lastmod bump

## 2. Auto-delete tournament if nobody joins

New edge function `tournament-auto-cleanup` (scheduled via `pg_cron` every 5 min):
- Finds tournaments where `starts_at <= now()` AND `status IN ('registering','upcoming')`
- Counts `tournament_registrations` for each
- If **0 registrations** → hard delete the row (cascade removes pairings, chat, prizes)
- If ≥1 registration → transition to `active` and let existing pair-round cron take over

This makes the whole site self-clean: empty tournaments vanish, no dead links.

Also add a small UI safeguard on `/tournaments` list: hide rows where `status='completed' AND player_count=0` (belt-and-suspenders).

## 3. Growth playbook — what Lichess & Chess.com actually did

Written up as `docs/GROWTH_LICHESS_CHESSCOM_PLAYBOOK.md` and 3 concrete features to implement now:

### What worked for them
- **Lichess**: 100% free + open source → HN/Reddit love; puzzle streak with daily leaderboard; TV channels (spectate top games live); studies (shareable analysis boards → massive backlinks); zero ads; API that bloggers embed.
- **Chess.com**: Bot personalities with faces + voice; Daily Puzzle email; Chess.com News (own editorial arm, ranks in Google News); influencer deals (Hikaru, Botez); paid Google Ads on "play chess online"; account-required to view games → forces signup.

### 3 features to build now (pulled from that list)

**A. MasterChess TV (`/tv`)** — Lichess-style live channel  
Auto-picks the highest-rated ongoing game every 15s and streams it with spectator count + chat. Zero-friction landing page (no login to watch). Massive session-time boost.

**B. Studies / Shareable Analysis Boards (`/study/:id`)**  
User pastes PGN → gets a permanent shareable URL with embedded board, comments per move, and OG image. This is the #1 backlink magnet on Lichess — chess bloggers embed studies everywhere.

**C. Daily Puzzle Email + Streak** (already have `/puzzles`; add retention loop)  
Cron sends one puzzle at 09:00 local time to opted-in users. Solving keeps streak alive. Chess.com's #1 D30 retention driver.

### Marketing channel checklist (concrete, this week)
1. **Product Hunt launch** — schedule for Tue Aug 12 (2 days after DB Cup) with tournament recap as proof.
2. **Reddit** — r/chess "I built a free tournament platform, we just ran a humanitarian blitz for [cause]" (soft, story-first).
3. **Hacker News** — Show HN: MasterChess TV (open the TV feature above).
4. **Google Ads** — €5/day on "play chess free online serbia/balkans" (geo-fenced, cheap CPC).
5. **YouTube Shorts** — auto-clip every DB Cup decisive game via existing `og-match-story` → post to DailyChess_12.
6. **Wikipedia** — create Serbian-language stub for Dragan Brakus with cite to our tournament page.
7. **GBP posts** — weekly, using `docs/GBP_WEEKLY_POSTS_CALENDAR.md`.

## Technical section

```text
Migration:
  UPDATE tournaments
    SET starts_at = '2026-08-10 14:00:00+00',
        status   = 'registering',
        current_round = 0
    WHERE name = 'Dragan Brakus Humanitarian Blitz';

Edge fn: supabase/functions/tournament-auto-cleanup/index.ts
  - service-role client
  - SELECT id FROM tournaments WHERE starts_at<=now() AND status IN ('registering','upcoming')
  - for each: count registrations; if 0 → DELETE, else UPDATE status='active'

Cron (via supabase--insert, not migration — contains project URL/anon):
  select cron.schedule('tournament-auto-cleanup','*/5 * * * *', $$ net.http_post(...) $$);

New page: src/pages/MasterChessTV.tsx  (+ route /tv in App.tsx)
New page: src/pages/Study.tsx + src/pages/StudyView.tsx  (+ /study, /study/:id)
New table: public.studies (id, owner_id, title, pgn, comments jsonb, is_public, slug)
  full GRANTs + RLS (public SELECT when is_public, owner full CRUD)

Daily puzzle email: extend existing resend-campaign fn with a puzzle-of-the-day cron.
```

## Out of scope
- Redesigning Home (per project memory veto).
- Any competitor-brand mentions in UI (Lichess/Chess.com stay in internal docs only).
- Adding fake/ghost players to make DB Cup look full.

Approve to build.
