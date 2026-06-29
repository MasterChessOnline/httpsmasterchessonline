# DB Chess Cup — Pro Tournament Engine

Goal: turn the existing DB Cup pipeline into a Swiss-Manager / Chess-Results-grade system with zero manual work for the organizer, end-to-end from registration to winner proclamation.

A lot of the foundation already exists (`tournaments`, `tournament_registrations`, `tournament_pairings`, `recalc_tournament_tiebreaks`, `tournament-pair-swiss` edge function, `/dragan-brakus/live`, FIDE lookup). This plan fills the gaps and connects them into one professional flow.

---

## 1. Tournament Lifecycle State Machine

Add a single source of truth for tournament status, driven by an edge function `tournament-engine`:

```text
draft → registration_open → registration_locked → round_in_progress
  → round_closed → (next round)… → finished → archived
```

Transitions are admin-triggered OR cron-triggered (auto-start, auto-close round when all results in).

Each transition runs validations (see §5) and writes a row to `tournament_audit_log` for traceability.

## 2. Round Flow (automated)

For each round 1…9:

1. Lock previous round (no result edits without admin override).
2. Verify all pairings have a result (forfeit timeout = loss after `forfeit_minutes`).
3. Recompute scores + tiebreaks via `recalc_tournament_tiebreaks`.
4. Generate next round via `tournament-pair-swiss` (Dutch Swiss, FIDE-compliant):
   - No rematch
   - Color balance (avoid 3rd same color in a row)
   - Float handling
   - Single bye per player; bye gets 1 point
5. Publish pairings, notify players (push + email).
6. Start clocks; players play 3+2 blitz.
7. Auto-ingest results from `online_games` (link `game_id` ↔ `pairing_id`).
8. When all results in → close round, advance.

After round 9 → declare winner, lock standings, award `tournament_titles`, fire `tournament-finalize` (prizes, PGN bundle, exports).

## 3. Admin Panel `/admin/tournaments/:id`

One screen, four tabs:

- **Players** — approve / reject / disqualify, edit FIDE info, set seed.
- **Rounds** — start next round, edit individual results, force-pair, undo last round.
- **Standings** — live table with all tiebreaks, export buttons.
- **Settings** — name, date, time control, rounds, visibility, prize description, lock/unlock registration, pause/resume, end tournament early.

Gated by `has_role(auth.uid(),'admin')` OR `tournaments.organizer_id = auth.uid()`.

## 4. Live Public Pages

- `/dragan-brakus/live` — already exists; extend with: per-round pairings tab, player click-through to mini profile, board-by-board live games widget.
- `/tournaments/:id/standings` — printable table (rank, name, country flag, rating, points, Buchholz, BH Cut 1, SB, Progressive, wins, performance).
- `/tournaments/:id/player/:userId` — per-player tournament card: every game, color, opponent, result, running score.

Standings refresh: Supabase Realtime on `tournament_registrations` + `tournament_pairings`.

## 5. Pre-Round Validation Checklist

Run before publishing pairings, surface red banner if any fail:

- All previous results entered
- No duplicate pairings vs. history
- No player gets 3rd consecutive same color (unless unavoidable)
- Bye assigned to lowest-scoring eligible player who hasn't had one
- Score totals reconcile (sum of points = games played × 1)

## 6. Anti-Cheat

Extend existing `tournament_anti_cheat_flags`:

- Move-time variance check (engine-like uniformity)
- Centipawn-loss vs. opponent rating (computed by `tournament-anticheat` edge function using Stockfish WASM job queue)
- Disconnect / reconnect log per game
- Auto-flag → admin review queue in admin panel
- Severity: info / warn / critical (critical = auto-pause player pending review)

## 7. Exports & Integrations

`tournament-export` edge function (extend existing):

- TRF16 (FIDE) — for rating submission
- Chess-Results compatible CSV
- PGN bundle (all games concatenated)
- PDF standings (server-side via `@react-pdf/renderer` inside the function) 
- Excel (xlsx) standings & crosstable
- Public JSON feed at `/api/tournaments/:id.json` for embeds

Notifications: reuse `tournament-notify` for round-start push + email "Round X pairing is live, you play <opponent> with <color>".

## 8. Player Profile Enrichment

Add to `/u/:username` (or `/profile/:username`):

- Tournament history table (event, date, place, points, performance)
- Last 20 games with PGN viewer
- Opening repertoire derived from PGN (top 5 ECO codes by frequency) — computed by nightly `profile-stats-refresh` job
- Win % by color, avg moves per game, longest streak

## 9. Schema Additions (migration)

Only what's missing — most tables exist:

- `tournaments`: add `status_machine text`, `current_round int`, `forfeit_minutes int default 5`, `registration_locked_at timestamptz`, `finished_at timestamptz`, `winner_user_id uuid`
- `tournament_pairings`: add `online_game_id uuid references online_games(id)`, `started_at`, `finished_at`, `end_reason`
- New `tournament_audit_log` (tournament_id, actor_id, action, payload, created_at)
- New `tournament_round_state` (tournament_id, round, status, locked_at, published_at)

All with GRANTs + RLS (admin/organizer write, public read for non-sensitive fields).

## 10. Edge Functions (new or upgraded)

- `tournament-engine` — state machine driver (admin + cron)
- `tournament-pair-swiss` — already exists, harden FIDE Dutch logic
- `tournament-ingest-result` — links `online_games` → `tournament_pairings`, auto on game finish
- `tournament-anticheat` — async batch scoring
- `tournament-export` — extend formats
- `tournament-finalize` — winner, titles, prize payout, PGN bundle to storage

## 11. Rollout Order

1. Schema migration + audit log
2. State machine + admin panel skeleton
3. Result auto-ingest from `online_games`
4. Harden Swiss pairing + validation checklist
5. Live standings / pairings UI polish
6. Exports (TRF, PGN, PDF, XLSX)
7. Anti-cheat queue + admin review
8. Player profile enrichment
9. End-to-end dry run with `tournament-seed-bots` (512 bots, 9 rounds)

---

## Out of scope (ask before adding)

- Google Calendar sync
- Live video stream embeds per board
- Spectator betting integration with tournament games
- Mobile push for non-participants

Approve and I'll execute in the order above, starting with the schema migration and admin panel.