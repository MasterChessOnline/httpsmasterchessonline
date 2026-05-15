// Daily Mate puzzles — handpicked classic mate-in-2 / mate-in-3 positions.
// Deterministic rotation: the same puzzle is shown to everyone on the same calendar day.
// Solutions stored as the first-move SAN that the user must play; the engine
// then plays any defender response, and the puzzle is "solved" once chess.js
// reports checkmate.

export interface DailyMate {
  id: string;
  fen: string;             // White (or Black, indicated by side) to move
  side: "w" | "b";         // Whose turn / who delivers mate
  matesIn: 1 | 2 | 3;
  /** Acceptable first moves in SAN (handles transpositions). */
  firstMoves: string[];
  /** Optional human-readable name / source */
  name?: string;
}

// All positions are White-to-move mates unless noted. Any first-move SAN listed
// is accepted as the unique key move. The puzzle clears once chess.js reports
// mate, so the user must play the full sequence (engine plays defender).
export const DAILY_MATES: DailyMate[] = [
  // --- Mate in 2 ---
  { id: "m2-001", fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", side: "w", matesIn: 2, firstMoves: ["Re8+"], name: "Back-rank classic" },
  { id: "m2-002", fen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4", side: "w", matesIn: 1, firstMoves: ["Qxf7#"], name: "Scholar's Mate" },
  { id: "m2-003", fen: "r1b1k2r/pppp1ppp/2n2n2/2b1N3/2B1P3/8/PPPP1qPP/RNBQ1K1R w kq - 0 1", side: "w", matesIn: 2, firstMoves: ["Nxf7"], name: "Légal trap finish" },
  { id: "m2-004", fen: "6k1/pp3ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", side: "w", matesIn: 2, firstMoves: ["Re8+"] },
  { id: "m2-005", fen: "r4rk1/pp3ppp/2p5/8/8/2N5/PPP2PPP/R3R1K1 w - - 0 1", side: "w", matesIn: 2, firstMoves: ["Re8"] },
  { id: "m2-006", fen: "6k1/5p2/6p1/8/8/8/6PP/3R3K w - - 0 1", side: "w", matesIn: 2, firstMoves: ["Rd8+"] },
  { id: "m2-007", fen: "r1bqk2r/pppp1ppp/2n5/2b1p3/2B1n3/3P1N2/PPP2PPP/RNBQR1K1 w kq - 0 1", side: "w", matesIn: 2, firstMoves: ["Rxe4"] },
  { id: "m2-008", fen: "5rk1/5ppp/8/8/8/8/Q4PPP/6K1 w - - 0 1", side: "w", matesIn: 2, firstMoves: ["Qa8+"] },
  { id: "m2-009", fen: "kr6/p7/P7/1K6/8/8/8/8 w - - 0 1", side: "w", matesIn: 2, firstMoves: ["a7"] },
  { id: "m2-010", fen: "6k1/5ppp/8/8/8/7P/5PP1/3R2K1 w - - 0 1", side: "w", matesIn: 2, firstMoves: ["Rd8+"] },
  // --- Mate in 3 ---
  { id: "m3-001", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", side: "w", matesIn: 3, firstMoves: ["Qxf7+"], name: "Quick combo" },
  { id: "m3-002", fen: "6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1", side: "w", matesIn: 3, firstMoves: ["Qe8+"] },
  { id: "m3-003", fen: "r3k2r/ppp2ppp/8/3Q4/8/8/PPP2PPP/R3K2R w KQkq - 0 1", side: "w", matesIn: 3, firstMoves: ["Qd8+"] },
  { id: "m3-004", fen: "6k1/5p2/8/6Q1/8/8/5PPP/6K1 w - - 0 1", side: "w", matesIn: 3, firstMoves: ["Qd8+"] },
  { id: "m3-005", fen: "r4rk1/1b3ppp/p7/1p6/3Q4/8/PPP2PPP/2KR3R w - - 0 1", side: "w", matesIn: 3, firstMoves: ["Qxd7"] },
];

/** Pick today's puzzle deterministically by UTC date. */
export function getTodaysMate(now: Date = new Date()): DailyMate {
  const d = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  // Days since epoch
  const dayIndex = Math.floor(d / 86400000);
  return DAILY_MATES[dayIndex % DAILY_MATES.length];
}

/** Seconds until the next UTC midnight rotation. */
export function secondsUntilNextMate(now: Date = new Date()): number {
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
}
