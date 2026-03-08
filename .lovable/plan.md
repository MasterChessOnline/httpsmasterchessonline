

## Plan: Add 200 Verified Checkmate Puzzles

### Approach
Add 200 new puzzles to `src/lib/puzzles-data.ts`, all mate-in-1, using proven checkmate patterns with correct FEN positions. Each puzzle will be validated by the existing test suite (`puzzles-data.test.ts`).

### Puzzle Distribution
- **70 Easy** (free, mate-in-1): Simple king+queen, king+rook mates in corners/edges
- **70 Medium** (premium, mate-in-1): Back rank, smothered, queen sacrifices, bishop+rook combos
- **60 Hard** (premium, mate-in-1): Complex positions with multiple pieces, discovered checks, double checks

### Categories covered
`checkmate`, `back-rank`, `smothered`, `queen-sacrifice`, `discovery`, `pin`, `endgame`, `opening`, `double-check`

### Patterns used (all mechanically verifiable mate-in-1)
- King in corner with rook/queen delivering mate (edge mates)
- Back rank mates with pawns blocking escape
- Smothered mates (knight on f7/f2 with king boxed)
- Queen + bishop battery mates
- Double check mates
- Queen sacrifice followed by mate (simplified as mate-in-1 delivery)
- Rook lift mates along ranks/files
- Bishop pair mates on diagonals

### File changes
1. **`src/lib/puzzles-data.ts`** — Append 200 new `Puzzle` entries after the existing 10, before the exports

### Validation
The existing `src/test/puzzles-data.test.ts` will automatically validate all 210 puzzles: legal FEN, correct turn, valid SAN moves, and final position is checkmate.

