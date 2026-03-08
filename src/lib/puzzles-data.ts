export interface Puzzle {
  fen: string;
  playerColor: "w" | "b";
  moves: string[];
  title: string;
  hint: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  mateIn: number;
  category?: string;
  premium?: boolean;
}

export const PUZZLES: Puzzle[] = [
  {
    fen: "8/8/8/8/8/8/1QK5/k7 w - - 0 1",
    playerColor: "w",
    moves: ["Qb1#"],
    title: "Corner Queen Mate C",
    hint: "Mate on b1.",
    answer: "1. Qb1#",
    difficulty: "easy",
    mateIn: 1,
    category: "checkmate",
  },
  {
    fen: "8/8/8/8/8/8/5KQ1/7k w - - 0 1",
    playerColor: "w",
    moves: ["Qg1#"],
    title: "Corner Queen Mate D",
    hint: "Queen to g1 is mate.",
    answer: "1. Qg1#",
    difficulty: "easy",
    mateIn: 1,
    category: "checkmate",
  },
  {
    fen: "k7/8/1K6/8/8/8/8/7R w - - 0 1",
    playerColor: "w",
    moves: ["Rh8#"],
    title: "Rook Mate A",
    hint: "Rook to the 8th rank.",
    answer: "1. Rh8#",
    difficulty: "easy",
    mateIn: 1,
    category: "checkmate",
  },
  {
    fen: "7k/8/6K1/8/8/8/8/R7 w - - 0 1",
    playerColor: "w",
    moves: ["Ra8#"],
    title: "Rook Mate B",
    hint: "Rook to a8.",
    answer: "1. Ra8#",
    difficulty: "easy",
    mateIn: 1,
    category: "checkmate",
  },
  {
    fen: "8/8/8/8/8/1Q6/2K5/k7 w - - 0 1",
    playerColor: "w",
    moves: ["Qb1#"],
    title: "Queen Lift Mate C",
    hint: "Lift the queen to b1.",
    answer: "1. Qb1#",
    difficulty: "easy",
    mateIn: 1,
    category: "checkmate",
  },
  {
    fen: "8/8/8/8/8/6Q1/5K2/7k w - - 0 1",
    playerColor: "w",
    moves: ["Qg1#"],
    title: "Queen Lift Mate D",
    hint: "Lift the queen to g1.",
    answer: "1. Qg1#",
    difficulty: "easy",
    mateIn: 1,
    category: "checkmate",
  },
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    playerColor: "w",
    moves: ["Qxf7#"],
    title: "Scholar's Mate",
    hint: "Attack f7.",
    answer: "1. Qxf7#",
    difficulty: "medium",
    mateIn: 1,
    premium: true,
    category: "opening",
  },
  {
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8#"],
    title: "Back Rank Classic",
    hint: "Back-rank weakness.",
    answer: "1. Re8#",
    difficulty: "medium",
    mateIn: 1,
    premium: true,
    category: "checkmate",
  },
  {
    fen: "3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1",
    playerColor: "b",
    moves: ["Rd1#"],
    title: "Black Back Rank",
    hint: "White king is boxed in.",
    answer: "1...Rd1#",
    difficulty: "medium",
    mateIn: 1,
    premium: true,
    category: "checkmate",
  },
  {
    fen: "7k/R7/6K1/8/8/8/8/8 w - - 0 1",
    playerColor: "w",
    moves: ["Ra8#"],
    title: "Ladder Mate",
    hint: "Rook to a8.",
    answer: "1. Ra8#",
    difficulty: "medium",
    mateIn: 1,
    premium: true,
    category: "checkmate",
  },
];

export const PUZZLE_CATEGORIES = [...new Set(PUZZLES.map((p) => p.category).filter(Boolean))];
export const FREE_PUZZLES = PUZZLES.filter((p) => !p.premium);
export const PREMIUM_PUZZLES = PUZZLES.filter((p) => p.premium);
