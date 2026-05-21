# MasterChess — Final Hardening Plan

Big scope, so I'll do it in 6 phases and pause for testing between each. Nothing here adds new pages; everything fixes/finishes what exists.

---

## Phase 1 — Online play core (finish what's left)

Already done: 1-user-1-game enforcement, Resign confirm, Abort, rematch via `start_online_game`.

Remaining:
- **Draw offer** — new table `online_draw_offers`, RPCs `offer_draw` / `respond_draw_offer`, toast UI with Accept/Decline, 30s expiry, auto-cancel on move.
- **Disconnect / AFK auto-loss** — `online_game_presence` table heartbeat every 5s; edge function `online-game-watchdog` (cron 15s) finalizes games where the player on move has `last_seen < now()-30s` OR clock ≤ 0; client toast "Opponent disconnected — auto-win in Ns".
- **Reconnect** — on `visibilitychange`/`online` event, force refetch game + re-subscribe channel; clear stale optimistic state.
- **Instant moves / sync** — already optimistic in `commit_online_move`; add server-clock drift correction using `last_move_at + remaining` on every poll; rollback toast on `ok:false`.
- **Premoves** — visual dashed gold ring + execute on opponent's move arrival (already partially wired — finish & test).

## Phase 2 — Spectate / Watch Live

- Remove all 6 placeholder games from `StreamHub` / "Watch Live Games".
- Query: `online_games WHERE status='active' AND move_number >= 2 ORDER BY updated_at DESC LIMIT 12`.
- Empty state: "No live games right now — be the first to play".
- Subscribe to realtime updates on `online_games` for the live list.
- `Spectate.tsx` already exists — verify no-lag broadcast subscription, fall back to 3s poll.

## Phase 3 — Game Review (Chess.com / Lichess-style)

`GameReview.tsx` + `CoachReviewPanel` already classify moves. Finish & polish:
- Auto-run review on game-end navigation (button "Review game" in `GameOverOverlay` → `/review?game=<id>`; auto-start Stockfish sweep at depth 14, MultiPV=3, cached per FEN).
- Per-move classifications with the **full set**: Brilliant `!!`, Great `!`, Best ★, Excellent ◆, Good ·, Book 📖, Inaccuracy `?!`, Mistake `?`, Blunder `??`, Miss ✗.
  - Extend `MoveClass` type + `CLASS_META` (colors, icons, labels).
  - Update `classifyMove` with thresholds for Excellent (wpLoss < 1, not best) and Miss (was winning ≥+200, dropped ≥150cp AND best move was forced mate or +300 swing).
- UI per move: colored chip + icon + Framer Motion fade-in (180ms) + Radix Tooltip with explanation.
- Accuracy %, centipawn loss, best-move arrow on board for each ply (already partial).

## Phase 4 — Mobile responsive overhaul

Screenshot shows scaling/coords/layout issues. Fixes:
- `ChessBoard`: change sizing to `min(100vw - 32px, 100vh - 360px, 560px)`; board + pieces scale together.
- Coordinates: move file labels INSIDE board edge (absolute bottom-1 left-1, opacity-50, text-[10px] on mobile) — no more overflow gap.
- Analysis panel: collapse below board with `mt-2` (was `mt-8`), full-width card, "Start analysis" button directly under board with `sticky bottom-0` on mobile.
- Eval bar: position `left-0 top-0 h-full w-2 md:w-3` flush against board, gradient bg, value label hidden < 360px.
- Global: `overflow-x-hidden` on `body`, remove fixed widths > 100vw, replace `gap-8` with responsive `gap-2 md:gap-6` on Play/Analysis layouts.

## Phase 5 — Review board orientation + Bot hints

- `GameReview.tsx`: read `game.black_player_id === user.id` → set `boardOrientation='black'` by default; flip button still works.
- `Play.tsx` (vs bots): "Hints" toggle calls Stockfish `getBestMove(depth 14)`, draws gold dashed arrow `from→to`, does NOT auto-move. Counter `5 hints left` from `useState`; decrement per use; disabled when 0; reset per game.

## Phase 6 — PWA install gating + mobile UX polish

- `useInstallStatus` hook: detect `display-mode: standalone` → never show banner again. Persist dismissal in `localStorage`.
- iOS detection (`/iPad|iPhone|iPod/.test(ua) && !window.MSStream`) → hide Android install UI; show iOS "Add to Home Screen" tooltip only when user taps Share-icon variant.
- Android Chrome / Desktop Chrome/Edge → only show install banner if `beforeinstallprompt` fired.
- Global mobile polish: audit `Play`, `PlayOnline`, `Analysis`, `GameReview`, `StreamHub` for overflow / overlap / cut elements. Add `touch-manipulation` + `select-none` on board squares.

---

## Technical notes

- New tables: `online_draw_offers`, `online_game_presence`. Both RLS-restricted to the two players.
- New edge function: `online-game-watchdog` (scheduled cron).
- New RPCs: `offer_draw`, `respond_draw_offer`, `heartbeat_online_game`, `claim_afk_win`.
- Classifier extension: pure frontend, no migration.
- Mobile fixes: pure CSS/Tailwind in `ChessBoard`, `Play`, `GameReview`, `Analysis`.

---

## Delivery order & pauses

1. **Phase 1** (DB + RPCs + edge function + client) — pause for testing.
2. **Phase 2** (live games list) — short, pause.
3. **Phase 3** (Game Review full classifications) — pause.
4. **Phase 4** (mobile responsive) — pause, you screenshot again.
5. **Phase 5** (orientation + hints).
6. **Phase 6** (PWA + final polish).

Approve and I start with Phase 1.
