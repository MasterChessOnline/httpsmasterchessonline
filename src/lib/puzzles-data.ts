export interface Puzzle {
  fen: string;
  playerColor: "w" | "b";
  /** Alternating moves: [playerMove, opponentReply, playerMove, ...]. Last is always player's mating move. */
  moves: string[];
  title: string;
  hint: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  mateIn: number;
}

export const PUZZLES: Puzzle[] = [
  // ========== MATE IN 1 — Easy ==========
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    playerColor: "w",
    moves: ["Qxf7#"],
    title: "Scholar's Mate",
    mateIn: 1, difficulty: "easy",
    hint: "The f7 pawn is only defended by the king.",
    answer: "1. Qxf7# — Queen takes f7, checkmate.",
  },
  {
    // White Kg1, Re1, f2 g2 h2. Black Kg8, f7 g7 h7. No piece on f8.
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8#"],
    title: "Back Rank Mate",
    mateIn: 1, difficulty: "easy",
    hint: "The king is trapped behind its own pawns.",
    answer: "1. Re8# — The rook delivers mate on the 8th rank.",
  },
  {
    // White Kh1, Rg1, Ng5. Black Kh8. Rg1-g8# — knight covers h7 escape.
    fen: "7k/8/8/6N1/8/8/8/6RK w - - 0 1",
    playerColor: "w",
    moves: ["Rg8#"],
    title: "Arabian Mate",
    mateIn: 1, difficulty: "easy",
    hint: "The knight and rook work together beautifully.",
    answer: "1. Rg8# — Rook mates on g8. The knight covers escape squares.",
  },
  {
    // White Kb6, Rd1. Black Ka8, pa7.
    fen: "k7/p7/1K6/8/8/8/8/3R4 w - - 0 1",
    playerColor: "w",
    moves: ["Rd8#"],
    title: "Corridor Mate",
    mateIn: 1, difficulty: "easy",
    hint: "The king is trapped on the edge of the board.",
    answer: "1. Rd8# — The rook mates along the 8th rank. The king has no escape.",
  },
  {
    // White Kg1, Qf6. Black Kh8, g7 h7. Qxg7#.
    fen: "7k/6pp/5Q2/8/8/8/8/6K1 w - - 0 1",
    playerColor: "w",
    moves: ["Qxg7#"],
    title: "Queen Smothered Mate",
    mateIn: 1, difficulty: "easy",
    hint: "Capture a key pawn to deliver checkmate.",
    answer: "1. Qxg7# — Queen takes g7, the h-pawn and board edge trap the king.",
  },
  {
    // White Kg1, Nh6. Black Kh8, Rg8, g7 h7. Nh6-f7#.
    fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1",
    playerColor: "w",
    moves: ["Nf7#"],
    title: "Smothered Mate",
    mateIn: 1, difficulty: "easy",
    hint: "The king is boxed in by its own pieces. A knight can finish it!",
    answer: "1. Nf7# — The knight delivers mate. The king is smothered by its own rook and pawns.",
  },
  {
    // White Kd6, Re1. Black Kd8. Re8#.
    fen: "3k4/8/3K4/8/8/8/8/4R3 w - - 0 1",
    playerColor: "w",
    moves: ["Re8#"],
    title: "King & Rook Endgame",
    mateIn: 1, difficulty: "easy",
    hint: "The opposing king controls escape squares. Use the rook.",
    answer: "1. Re8# — Rook to e8 is checkmate. The White king covers all adjacent squares.",
  },
  {
    // White Kg1, Bb3, Re1. Black Kb8, pa7 pb7 pc7. Re8#.
    fen: "1k6/ppp5/8/8/8/1B6/8/4R1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8#"],
    title: "Bishop & Rook Mate",
    mateIn: 1, difficulty: "easy",
    hint: "The king's own pawns trap it. Deliver check on the back rank.",
    answer: "1. Re8# — The rook mates on e8. The pawns block the king's escape.",
  },
  {
    // Black to move. White Kg1, f2 g2 h2. Black Kg8, Rd8. Rd1#.
    fen: "3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1",
    playerColor: "b",
    moves: ["Rd1#"],
    title: "Black's Back Rank",
    mateIn: 1, difficulty: "easy",
    hint: "White's king is trapped. Deliver mate on the 1st rank!",
    answer: "1...Rd1# — The rook mates on d1. White's pawns are its prison.",
  },

  // ========== MATE IN 2 — Medium ==========
  {
    // White Ra1, Rb1, Kg1, f2 g2 h2. Black Ra8, Kg8, f7 g7 h7.
    // 1. Rb8+! Rxb8 2. Rxb8#
    fen: "r5k1/5ppp/8/8/8/8/5PPP/RR4K1 w - - 0 1",
    playerColor: "w",
    moves: ["Rb8+", "Rxb8", "Rxb8#"],
    title: "Double Rook Sacrifice",
    mateIn: 2, difficulty: "medium",
    hint: "Sacrifice one rook to deflect the defender, then mate with the other.",
    answer: "1. Rb8+! Rxb8 2. Rxb8# — Classic double rook back rank mate.",
  },
  {
    // White Kg1, Qg2, Re1. Black Kg8, f7 g7 (no h-pawn).
    // 1. Re8+ Kh7 2. Qg6#
    fen: "6k1/5pp1/8/8/8/8/6Q1/4R1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8+", "Kh7", "Qg6#"],
    title: "Rook & Queen Tandem",
    mateIn: 2, difficulty: "medium",
    hint: "Force the king out with a rook check, then the queen finishes.",
    answer: "1. Re8+ Kh7 (only move) 2. Qg6# — The queen mates from g6, the rook covers the 8th rank.",
  },
  {
    // White Kg1, Qh3. Black Kg8, f7 g7 h7.
    // 1. Qe6! (threatens unstoppable Qe8#) ...Kh8 2. Qe8#
    fen: "6k1/5ppp/8/8/8/7Q/8/6K1 w - - 0 1",
    playerColor: "w",
    moves: ["Qe6", "Kh8", "Qe8#"],
    title: "Quiet Queen Threat",
    mateIn: 2, difficulty: "medium",
    hint: "A quiet queen move creates an unstoppable mate threat.",
    answer: "1. Qe6! (threatens Qe8#) ...Kh8 2. Qe8# — Nothing can stop the queen.",
  },
  {
    // White Kg1, Bd3, Ne5, Qh5. Black Kg8, f7 g6 h7.
    // 1. Bxg6! hxg6 2. Qh8#
    fen: "6k1/5p1p/6p1/4N2Q/8/3B4/8/6K1 w - - 0 1",
    playerColor: "w",
    moves: ["Bxg6", "hxg6", "Qh8#"],
    title: "Bishop Sacrifice Mate",
    mateIn: 2, difficulty: "medium",
    hint: "Sacrifice the bishop to tear open the h-file!",
    answer: "1. Bxg6! hxg6 2. Qh8# — The h-file opens and the queen delivers mate.",
  },
  {
    // White Ka1, Rc1, Qb2. Black Ka8, pa7 pb7.
    // 1. Qa3! Kb8 2. Qa8#
    fen: "k7/pp6/8/8/8/8/1Q6/K1R5 w - - 0 1",
    playerColor: "w",
    moves: ["Qa3", "Kb8", "Qa8#"],
    title: "Queen & Rook Squeeze",
    mateIn: 2, difficulty: "medium",
    hint: "Threaten mate and force the king into a deadly corner.",
    answer: "1. Qa3! (threatens Qa8#) Kb8 2. Qa8# — The rook covers the c-file, queen mates.",
  },

  // ========== MATE IN 3 — Hard ==========
  {
    // Philidor's Legacy (Smothered Mate)
    // White Kg1, Qd5, Ne5. Black Kg8, Rf8, Bc8, f7 g7 h7.
    // 1. Qxf7+! Kh8 2. Qg8+! Rxg8 3. Nf7#
    fen: "2b2rk1/5ppp/8/3QN3/8/8/8/6K1 w - - 0 1",
    playerColor: "w",
    moves: ["Qxf7+", "Kh8", "Qg8+", "Rxg8", "Nf7#"],
    title: "Philidor's Smothered Mate",
    mateIn: 3, difficulty: "hard",
    hint: "Sacrifice the queen to set up a smothered mate with the knight!",
    answer: "1. Qxf7+! Kh8 2. Qg8+!! Rxg8 3. Nf7# — A stunning queen sacrifice leads to smothered mate.",
  },
];
