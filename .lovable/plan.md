
# MasterChess Online — Production Hardening Plan

Scope strictly limited to the 4 picked priorities + MultiPV for training. No new pages, no rewrites of existing flows that already work.

---

## Phase 1 — One active game per user (server-enforced)

Goal: a user can NEVER be in two ranked games or two queues at once. Ghost games auto-clear on finalize.

**DB migration**
- Add `profiles.current_game_id uuid NULL` (FK soft-ref to `online_games.id`).
- Partial unique index: `UNIQUE (user_id) WHERE current_game_id IS NOT NULL` is implicit — instead enforce via RPC.
- New RPC `start_online_game(white_id, black_id, ...)`:
  - locks both profile rows `FOR UPDATE`
  - rejects if either has `current_game_id IS NOT NULL` AND that game is still `active`
  - inserts game, sets `current_game_id` on both profiles, deletes both queue rows
  - returns the game row
- Patch `finalize_online_game` + `commit_online_move` (when result is set): clear `current_game_id` for both players in the same transaction.
- New RPC `cleanup_stale_game(user_id)`: if `current_game_id` points to a game whose `status='finished'` or `updated_at < now() - interval '2 hours'` with no moves, clear it.

**Matchmaking guard (`use-online-game.ts → searchMatch`)**
- Before joining queue: call new RPC `assert_can_queue()` which checks `current_game_id` and runs `cleanup_stale_game`. If still blocked → return `{ error: "You already have an active game", activeGameId }`.
- UI surfaces a toast with a "Resume game" button → `loadGameById`.
- Always delete this user's queue rows first (already done) AND verify no other queue rows for this user across ALL time controls.

**Lobby UI (`PlayOnline.tsx`)**
- Banner at top if `profile.current_game_id` is set: "You have an active game — Resume / Resign".

---

## Phase 2 — Resign / Draw / Abort / Rematch

Most exists; gaps to close:

**Resign** — already wired via `resign()` → `finalize_online_game(..., 'resignation')`. Add confirm dialog with `AlertDialog`. ✅ small.

**Draw offer (NEW)**
- New table `online_draw_offers (id, game_id, from_user_id, created_at, status: pending|accepted|declined|expired)`.
- Realtime: opponent sees toast "Player offered a draw" with Accept/Decline.
- Accept → call `finalize_online_game(game_id, '1/2-1/2', 'agreement')`.
- Decline → mark declined; sender sees toast.
- Auto-expire after 30s or after a move is played.
- Rate-limit: 1 active offer per side; cooldown 20s after decline.

**Abort (NEW)**
- Button shown ONLY when `game.move_number === 0` AND it's caller's turn or within first 10s.
- New RPC `abort_online_game(game_id)`: requires `move_number = 0`, sets status `aborted`, clears `current_game_id` on both players, NO Elo applied.
- Add `'aborted'` status handling in `GameOverOverlay` (shows "Game aborted — no rating change").

**Rematch** — keep existing handler if present; add explicit rematch challenge via `game_invites` table reuse (same time control, swapped colors). Both players see "Rematch offered" → accept creates new game via `start_online_game` (which itself respects 1-game rule, so rematch is blocked if either is in another game).

---

## Phase 3 — Disconnect / AFK auto-loss

**Presence** — extend existing `use-presence` so each player in an active game has a heartbeat row `online_game_presence (game_id, user_id, last_seen)` updated every 5s.

**Edge function `online-game-watchdog`** (cron every 15s):
- For each `online_games WHERE status='active'`:
  - if it's player X's turn AND `presence(X).last_seen < now() - 30s` AND no move in 30s → grant opponent win with `end_reason='abandonment'`, call `finalize_online_game`.
  - if either clock hits 0 server-side using `last_move_at` + remaining time → finalize with `end_reason='timeout'`.

**Client UX**
- Show "Opponent disconnected — auto-win in Ns" countdown in `Play.tsx` when peer presence stale.
- On reconnect (visibilitychange / online event) re-subscribe + force refetch.

---

## Phase 4 — Animations + Optimistic UI polish

Strictly visual, in `ChessBoard` component:
- Smooth piece move: CSS transform transition 180ms cubic-bezier(0.4,0,0.2,1) keyed on `from→to`.
- Last-move highlight: subtle gold tint on origin+destination squares (2 squares, no flicker).
- Legal-move dots (already exist?) — make glow softer on hover.
- Check animation: red pulse on king square 600ms.
- Capture: tiny scale+fade-out of captured piece (Framer Motion `AnimatePresence`).
- Premove visual: dashed gold ring on premove squares.
- Optimistic move already implemented in `makeMove`; add rollback toast "Move rejected" if RPC returns `ok:false`.

No changes to move-validation logic.

---

## Phase 5 — Puzzle MultiPV acceptance

Apply to `GuessTheMove.tsx`, `PlayLikeGM.tsx`, `OpeningTrainer.tsx` (train mode):
- Replace exact-SAN compare with: run Stockfish MultiPV=3 on the position; accept the user's move if its eval is within 30cp of the best line OR shares same mate distance.
- Cache eval per FEN in `stockfish-eval-cache`.
- Keep "expected" move shown as the primary hint but don't reject equivalents.

---

## Technical notes (not for end-user)

- All new RPCs `SECURITY DEFINER`, `SET search_path=public`, auth checks inside.
- New table RLS: only the two players can SELECT their own draw_offers / presence rows.
- `commit_online_move` patched to clear `current_game_id` when `p_result IS NOT NULL`.
- `finalize_online_game` patched same way (idempotent).
- Migration order: tables → RPCs → backfill (`UPDATE profiles SET current_game_id = (SELECT id FROM online_games WHERE status='active' AND ...)`).
- Frontend types regenerate automatically after migration approval.

---

## Delivery order

1. Phase 1 migration (await approval) → Phase 1 client code.
2. Phase 2 migration → UI dialogs.
3. Phase 3 migration + edge function + cron + client presence.
4. Phase 4 pure-frontend polish.
5. Phase 5 puzzle MultiPV.

I'll pause after each phase so you can test before I move on.
