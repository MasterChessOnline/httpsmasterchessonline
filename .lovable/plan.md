
# MasterChess Full Ecosystem — Phased Plan (✅ all phases shipped)

## Phase 1 — Turnir jezgro ✅
- Swiss/Knockout/KOTH/Puzzle handlers in `manage-tournament`
- `koth_throne` + `puzzle_tournament_attempts` tables
- `fast_win_bonus` + `no_mistake_bonus` columns on `tournament_registrations`
- Knockout bracket auto-seed and round advancement

## Phase 2 — Nagrade + Status ✅
- Tables: `tournament_titles`, `unique_badges`, `feature_votes`
- Profile cols: `username_style`, `coach_pro_until`, `unlocked_courses`, `access_tier`
- RPC: `award_tournament_title`, `transfer_unique_badge`
- Edge fn `award-tournament-titles` (called on tournament finish)
- Pages: `/hall-of-fame`, `/beta`
- Champion gets gold animated username (7 days) + Coach Pro pass

## Phase 3 — Viral + SEO + Landing ✅
- `/ranked` page (live ELO ladder, top-25 leaderboard)
- `/share/:gameId/:ply` page (OG board image, share buttons)
- Sitemap updated with `/ranked`, `/hall-of-fame`, `/beta`
- Existing 15 sitemap shards already cover cities, openings, bots, puzzles

## Phase 4 — Discord + GSC + Google Maps ✅
- Edge fn `discord-webhook-publish` (auto-posts tournament events)
- Manage-tournament now calls Discord + title-award on every finish
- Docs:
  - `docs/DISCORD_BOT_SETUP.md` — webhook + Node bot starter
  - `docs/GOOGLE_SEARCH_CONSOLE_SETUP.md` — verification, sitemap submit, keyword monitoring
  - `docs/GOOGLE_BUSINESS_AND_MAPS_SETUP.md` — GBP setup, Maps connector, custom-domain key

## Required secrets (Phase 4)
- `DISCORD_WEBHOOK_URL` — main channel
- `DISCORD_TOURNAMENTS_WEBHOOK_URL` — optional, separate tournaments channel
