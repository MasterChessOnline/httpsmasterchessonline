## Goal
Strip the "casino" look the IT friend flagged: lock the site to a 5-color high-contrast palette, simplify mobile to a single bottom bar, make the board fill the screen in every game, and finish the Chess-Results tournament setup.

## 1. 5-color theme + contrast pass
- Rewrite `src/index.css` tokens to a strict 5-color system:
  1. `--bg` deep black `#0A0A0B`
  2. `--surface` graphite `#16171A`
  3. `--text` near-white `#F5F5F2`
  4. `--muted` cool gray `#8A8F98`
  5. `--accent` MasterChess gold `#D4A24A`
- Delete/alias every secondary hue (purple, pink, cyan, green glows, multi-gradient backgrounds) → map to the 5 tokens.
- Remove decorative gradients/glass blurs from `Home`, `Nav`, cards, banners. Replace with flat surface + 1px hairline border `hsl(var(--text)/0.08)`.
- Audit hard-coded color classes (`text-white`, `bg-purple-*`, `from-pink-*`, etc.) site-wide and swap to tokens. WCAG AA contrast verified on text + buttons.

## 2. Mobile chrome cleanup
- On `< md` viewport, hide the top app bar entirely (logo + search + menu). Keep only the existing bottom tab bar.
- Remove the "search rich" / command bar from mobile header. Search stays accessible from the bottom bar's Search tab + `Cmd+K` on desktop.
- Add a thin safe-area-aware spacer so page content starts at the top edge on phones.
- Desktop keeps its current top nav unchanged.

## 3. Full-screen game board (online + bot)
On `/play` and `/play-online`, when viewport `< md`:
- Board takes 100vw × 100vw, centered, no padding.
- Opponent strip (avatar · name · rating · clock · captures) collapses to a single 44px bar above the board.
- Player strip (same) sits directly below the board.
- A compact right-edge floating column of icon buttons: Resign, Draw, Flag, Chat, More — each 40px, tap-target friendly. No labels, tooltips on long-press.
- Hide page chrome (header, footer, bottom tab bar) while in an active game; show a single "Back" pill top-left.
On `md+`:
- Board centered, capped at `min(80vh, 720px)`. Side panel (clocks/moves/chat) docks right. Names + clocks inline as already shipped.

## 4. Chess-Results / DB Chess Cup finalization
- Confirm `tournaments` row for Dragan Brakus Cup has: `chief_arbiter`, `deputy_arbiter`, `organizer_email`, `rating_type='unrated'`, `venue`, `city`, `chess_results_url` (nullable until listed).
- Add a one-click "Copy submission email" button next to the existing mailto on `/dragan-brakus` so the user can paste the full body if their mail client misbehaves.
- Add an admin-only `Chess-Results status` widget on `/admin` showing: submitted? listed? URL? — with a single input to paste the CR URL once it's live; flips the public badge from "Pending submission" → "Listed on Chess-Results".
- Update `docs/CHESS_RESULTS_SUBMIT.md` with the new admin step.
- Re-ping IndexNow for `/dragan-brakus` after status flips.

## Technical notes
- Theme tokens are HSL in `src/index.css` + `tailwind.config.ts`; no component-level hex.
- Game full-screen uses a `<GameShell>` wrapper that sets `body[data-game-active]` so global `Header`/`BottomBar`/`Footer` hide via CSS, no router changes needed.
- Admin CR widget reads/writes `tournaments.chess_results_url` + `chess_results_status` (already in schema).
- No new tables, no schema migration required.

## Out of scope (ask separately if wanted)
- Redesign of `/news`, `/blog`, `/nikola` (only token swap, no layout change).
- New piece sets or board themes.
- Replacing the bottom bar icons.
