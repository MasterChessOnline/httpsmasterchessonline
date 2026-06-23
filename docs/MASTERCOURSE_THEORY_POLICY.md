# MasterCourse Theory Policy

Every move shown in MasterCourse variations must come from one of two truth sources:

1. **Opening theory** — an ECO/main-line move appearing in master-database games (GM/IM practice).
2. **Engine top choice** — Stockfish at depth ≥ 18 considers it within 30cp of best.

Random or stylistic moves are not allowed.

## How to add new lines safely

- Drop the variation into `src/lib/masterclass-curated-lines.ts` (or the relevant data file).
- Run `bun scripts-validate-tree.ts < your-variation.json` — this checks legality with chess.js.
- Run `bun scripts/stockfish-repair-masterclass.ts` to auto-fix any move whose evaluation drops more than 80cp vs Stockfish's best.
- Inspect the diff; commit only after the repair pass exits clean.

## Runtime hint

`LessonVariation.moves[*]` may carry an optional `source: "theory" | "engine" | "unknown"` tag. The MasterCourse UI surfaces an "unverified" badge for `"unknown"` moves so you can audit them visually before merging.

## Threshold rationale

80cp is large enough to ignore engine noise on equal positions but small enough to catch genuine strategic blunders. Pure theory moves are allowed to differ from engine top choice (engines often disagree with established opening theory by ≤ 50cp) — that's why theory is checked first.
