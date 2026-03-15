export interface DailyPuzzle {
  id: string;
  fen: string;
  solution: string[]; // sequence of moves in UCI format e.g. ["e2e4", "d7d5", "e4d5"]
  type: "mate-in-2" | "tactical" | "endgame";
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

// Pool of puzzles – rotated by day-of-year
export const PUZZLE_POOL: DailyPuzzle[] = [
  {
    id: "p1",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["h5f7"],
    type: "mate-in-2",
    title: "Scholar's Mate",
    description: "Find the devastating queen sacrifice to deliver checkmate!",
    difficulty: "easy",
    points: 10,
  },
  {
    id: "p2",
    fen: "r2qk2r/ppp2ppp/2n1bn2/3pp1B1/2BPP1b1/2N2N2/PPP2PPP/R2QK2R w KQkq - 4 6",
    solution: ["d1a4"],
    type: "tactical",
    title: "Pin & Win",
    description: "Use a pin to win material. White to move.",
    difficulty: "medium",
    points: 10,
  },
  {
    id: "p3",
    fen: "6k1/5ppp/8/8/8/8/1K3PPP/3R4 w - - 0 1",
    solution: ["d1d8"],
    type: "endgame",
    title: "Back Rank Threat",
    description: "Use the back rank weakness to your advantage.",
    difficulty: "easy",
    points: 10,
  },
  {
    id: "p4",
    fen: "r1b1k2r/ppppqppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5",
    solution: ["f3e5"],
    type: "tactical",
    title: "Knight Fork",
    description: "Find the knight move that attacks two pieces at once.",
    difficulty: "medium",
    points: 10,
  },
  {
    id: "p5",
    fen: "r4rk1/ppp2ppp/2n5/3qN3/3P4/2P5/PP3PPP/R2QR1K1 w - - 0 15",
    solution: ["e5f7"],
    type: "tactical",
    title: "Royal Fork",
    description: "Find the devastating knight move.",
    difficulty: "medium",
    points: 10,
  },
  {
    id: "p6",
    fen: "2r3k1/pp3ppp/4p3/2Pp4/1P1P1B2/P4N2/5PPP/R5K1 w - - 0 1",
    solution: ["c5c6"],
    type: "endgame",
    title: "Passed Pawn Push",
    description: "Advance the passed pawn to create a winning advantage.",
    difficulty: "easy",
    points: 10,
  },
  {
    id: "p7",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    solution: ["f1b5"],
    type: "tactical",
    title: "Ruy Lopez",
    description: "Find the classic opening move that puts pressure on Black's center.",
    difficulty: "easy",
    points: 10,
  },
  {
    id: "p8",
    fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
    solution: ["e2e3"],
    type: "tactical",
    title: "Nimzo-Indian Defense",
    description: "Find the best response to Black's pin. White to move.",
    difficulty: "medium",
    points: 10,
  },
  {
    id: "p9",
    fen: "6k1/pp3p1p/2p3p1/8/3Pn3/4B1PP/PP3P2/5RK1 w - - 0 1",
    solution: ["f1e1"],
    type: "endgame",
    title: "Trap the Knight",
    description: "Find the rook move that wins the trapped knight.",
    difficulty: "hard",
    points: 10,
  },
  {
    id: "p10",
    fen: "r2q1rk1/ppp2ppp/2npbn2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    solution: ["c3d5"],
    type: "tactical",
    title: "Central Knight Outpost",
    description: "Place the knight on the dominant central square.",
    difficulty: "medium",
    points: 10,
  },
  {
    id: "p11",
    fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 5",
    solution: ["c1g5"],
    type: "tactical",
    title: "Pin the Knight",
    description: "Pin the knight to the queen. White to move.",
    difficulty: "easy",
    points: 10,
  },
  {
    id: "p12",
    fen: "8/8/8/4k3/8/8/3KQ3/8 w - - 0 1",
    solution: ["e2e3"],
    type: "endgame",
    title: "Queen vs King",
    description: "Begin the mating net. Restrict the enemy king's movement.",
    difficulty: "easy",
    points: 10,
  },
  {
    id: "p13",
    fen: "rnb1kbnr/ppppqppp/8/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3",
    solution: ["f3f7"],
    type: "mate-in-2",
    title: "Quick Mate",
    description: "Deliver checkmate in one move!",
    difficulty: "easy",
    points: 10,
  },
  {
    id: "p14",
    fen: "r3k2r/ppp2ppp/2n1bn2/1B1pp1B1/3PP3/2N2N2/PPP2PPP/R2QK2R w KQkq - 0 7",
    solution: ["d4e5"],
    type: "tactical",
    title: "Central Break",
    description: "Open the center with a pawn capture to exploit development advantage.",
    difficulty: "hard",
    points: 10,
  },
];

/**
 * Returns today's puzzle based on date rotation through the pool
 */
export function getTodaysPuzzle(): DailyPuzzle {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return PUZZLE_POOL[dayOfYear % PUZZLE_POOL.length];
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}
