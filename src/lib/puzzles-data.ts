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
  // ===================  MATE IN 1 — Easy (Free)  ===================
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", playerColor: "w", moves: ["Qxf7#"], title: "Scholar's Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The f7 pawn is only defended by the king.", answer: "1. Qxf7#" },
  { fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Back Rank Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is trapped behind its own pawns.", answer: "1. Re8#" },
  { fen: "7k/8/8/6N1/8/8/8/6RK w - - 0 1", playerColor: "w", moves: ["Rg8#"], title: "Arabian Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The knight and rook work together.", answer: "1. Rg8#" },
  { fen: "k7/p7/1K6/8/8/8/8/3R4 w - - 0 1", playerColor: "w", moves: ["Rd8#"], title: "Corridor Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is trapped on the edge.", answer: "1. Rd8#" },
  { fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Nf7#"], title: "Smothered Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is boxed in by its own pieces.", answer: "1. Nf7#" },
  { fen: "3k4/8/3K4/8/8/8/8/4R3 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "King & Rook Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The opposing king controls escape squares.", answer: "1. Re8#" },
  { fen: "1k6/ppp5/8/8/8/1B6/8/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Bishop & Rook Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king's own pawns trap it.", answer: "1. Re8#" },
  { fen: "3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1", playerColor: "b", moves: ["Rd1#"], title: "Black's Back Rank", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "White's king is trapped.", answer: "1...Rd1#" },
  { fen: "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["Qh4#"], title: "Fool's Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "White weakened the kingside fatally.", answer: "1...Qh4#" },
  { fen: "5k2/8/5K2/4Q3/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qe7#"], title: "Queen & King Mate #1", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Queen controls all escape squares.", answer: "1. Qe7#" },
  { fen: "7k/8/6KQ/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qh7#"], title: "Queen Corner Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Deliver mate in the corner.", answer: "1. Qh7#" },
  { fen: "k7/8/1K6/1Q6/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qa6#"], title: "Queen Support Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "King supports the queen.", answer: "1. Qa6#" },
  { fen: "7k/5R2/6K1/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Rf8#"], title: "Rook Delivery", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The rook has a clear path.", answer: "1. Rf8#" },
  { fen: "k7/p1K5/8/1R6/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Rb8#"], title: "Rook Corridor #2", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is trapped by its own pawn.", answer: "1. Rb8#" },
  { fen: "7k/R7/6K1/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Ra8#"], title: "Rook Endgame Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The rook controls the 8th rank.", answer: "1. Ra8#" },
  { fen: "k7/2K5/8/8/8/8/8/1R6 w - - 0 1", playerColor: "w", moves: ["Rb8#"], title: "Edge Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Mate on the a-file edge.", answer: "1. Rb8#" },
  { fen: "2k5/8/2K5/8/8/8/8/4R3 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Opposition Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Kings in opposition, rook delivers.", answer: "1. Re8#" },
  { fen: "5k2/5P2/5K2/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["f8=Q#"], title: "Promotion Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Promote the pawn with checkmate!", answer: "1. f8=Q#" },
  { fen: "7k/5Q1p/8/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qg8#"], title: "Queen Corner Trap", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The queen can reach g8.", answer: "1. Qg8#" },
  { fen: "r3r1k1/ppp2ppp/8/3Q4/8/8/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Qd8#"], title: "Queen & Rook Alignment", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Queen and rook work on the same file.", answer: "1. Qd8#" },
  { fen: "5rk1/5Npp/8/8/8/8/8/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Knight Support Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The rook invades with knight support.", answer: "1. Re8#" },
  { fen: "r5k1/5ppp/8/8/1Q6/8/5PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Qb8#"], title: "Queen Infiltration", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The queen reaches the 8th rank.", answer: "1. Qb8#" },
  { fen: "5rk1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Qb8#"], title: "Queen Back Rank", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Deliver check on the back rank.", answer: "1. Qb8#" },
  { fen: "6k1/5ppp/4N3/8/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Knight Guards Escape", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Knight covers f8 while rook mates.", answer: "1. Re8#" },
  { fen: "1k6/8/1K6/8/8/8/8/7R w - - 0 1", playerColor: "w", moves: ["Rh8#"], title: "Rook & King Mate #2", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The rook delivers from the h-file.", answer: "1. Rh8#" },
  { fen: "r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K2R w KQkq - 0 1", playerColor: "w", moves: ["Qxf7#"], title: "f7 Weakness", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "f7 is the weakest square.", answer: "1. Qxf7#" },
  { fen: "r1b2rk1/pppp1ppp/8/8/8/2B5/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Back Rank Classic", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The 8th rank is unguarded.", answer: "1. Re8#" },
  { fen: "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1", playerColor: "w", moves: ["Qe8#"], title: "Queen Invasion", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The 8th rank is open.", answer: "1. Qe8#" },
  { fen: "7k/6pp/5Q2/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qxg7#"], title: "Queen Captures Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Capture the g-pawn for checkmate.", answer: "1. Qxg7#" },

  // ===================  MATE IN 1 — Premium  ===================
  { fen: "r4rk1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Qf8#"], title: "Queen Invasion f8", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "The queen sneaks to f8.", answer: "1. Qf8#" },
  { fen: "6k1/5ppp/6N1/8/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Knight Covers f8", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Knight on g6 covers f8 and h8.", answer: "1. Re8#" },
  { fen: "1k1r4/pp6/8/8/8/8/8/1KR5 w - - 0 1", playerColor: "w", moves: ["Rc8#"], title: "Rook vs Rook Mate", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Invade the 8th rank.", answer: "1. Rc8#" },
  { fen: "5bk1/5ppp/5N2/8/8/8/8/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Knight & Rook Combo", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "The knight blocks f8; the rook delivers.", answer: "1. Re8#" },
  { fen: "r1b2bk1/ppp2ppp/8/8/8/2B5/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Back Rank Pattern #3", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "8th rank is weak.", answer: "1. Re8#" },
  { fen: "4k3/8/4K3/8/8/8/R7/8 w - - 0 1", playerColor: "w", moves: ["Ra8#"], title: "Rook & King Mate #3", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "King supports the rook.", answer: "1. Ra8#" },
  { fen: "4k3/4Q3/4K3/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qe7#"], title: "Queen & King Basic #2", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Queen on e7 with king support.", answer: "1. Qe7#" },
  { fen: "k7/1pK5/8/8/8/8/R7/8 w - - 0 1", playerColor: "w", moves: ["Ra8#"], title: "Rook & King Corner", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Rook to the 8th.", answer: "1. Ra8#" },
  { fen: "5k2/4Rp2/5K2/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Rook Endgame Mate #2", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "King supports the rook on the 8th.", answer: "1. Re8#" },
  { fen: "k1K5/pp6/8/8/8/8/8/1R6 w - - 0 1", playerColor: "w", moves: ["Rb8#"], title: "Corridor Mate #2", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Own pawns trap the king.", answer: "1. Rb8#" },
  { fen: "r4rk1/5Qpp/8/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qf8#"], title: "Queen Mates on f8", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Queen reaches f8.", answer: "1. Qf8#" },
  { fen: "6k1/5pBp/6p1/8/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Bishop Blocks Rook Mates", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Bishop covers f8; rook delivers.", answer: "1. Re8#" },
  { fen: "6k1/5ppp/7Q/8/8/8/5PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Qh8#"], title: "Queen h8 Mate", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Queen slides to h8.", answer: "1. Qh8#" },
  { fen: "r6k/5Qpp/8/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qg8#"], title: "Queen g8 Mate", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Queen on g8 is checkmate.", answer: "1. Qg8#" },
  { fen: "7k/8/5K1R/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Rh8#"], title: "Simple Rook Mate", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Rook to h8.", answer: "1. Rh8#" },
  { fen: "k7/8/K7/R7/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Ra8#"], title: "Rook on a-file Mate", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Rook delivers on a8.", answer: "1. Ra8#" },
  { fen: "6k1/8/5KQ1/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qg7#"], title: "Queen & King #3", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Queen moves to g7.", answer: "1. Qg7#" },
  { fen: "k7/8/1KQ5/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qc8#"], title: "Queen & King #4", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Queen to c8 with king support.", answer: "1. Qc8#" },
  { fen: "k1K5/8/8/8/8/8/8/7R w - - 0 1", playerColor: "w", moves: ["Rh8#"], title: "Basic KR vs K", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Simplest rook mate.", answer: "1. Rh8#" },
  { fen: "5rk1/5Qpp/8/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qxf8#"], title: "Queen Captures f8", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Capture the rook with mate.", answer: "1. Qxf8#" },
  { fen: "1k6/pp6/1K6/8/8/8/8/7R w - - 0 1", playerColor: "w", moves: ["Rh8#"], title: "Rook Long Range", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Rook across the board.", answer: "1. Rh8#" },
  { fen: "5K1k/6pp/7N/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Nf7#"], title: "Smothered Knight #2", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "The knight does it alone.", answer: "1. Nf7#" },
  { fen: "6k1/5p1p/4Q1p1/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qe8#"], title: "Queen Endgame Mate", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Queen to the 8th rank.", answer: "1. Qe8#" },

  // ===================  MATE IN 2 — Medium  ===================
  { fen: "r5k1/5ppp/8/8/8/8/5PPP/RR4K1 w - - 0 1", playerColor: "w", moves: ["Rb8+", "Rxb8", "Rxb8#"], title: "Double Rook Sacrifice", mateIn: 2, difficulty: "medium", category: "sacrifice", hint: "Sacrifice one rook to deflect.", answer: "1. Rb8+! Rxb8 2. Rxb8#" },
  { fen: "6k1/5pp1/8/8/8/8/6Q1/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Kh7", "Qg8#"], title: "Rook & Queen Tandem", mateIn: 2, difficulty: "medium", category: "checkmate", hint: "Force the king out with a rook check.", answer: "1. Re8+ Kh7 2. Qg8#" },
  { fen: "6k1/5p1p/6p1/4N2Q/8/3B4/8/6K1 w - - 0 1", playerColor: "w", moves: ["Bxg6", "hxg6", "Qh8#"], title: "Bishop Sacrifice Mate", mateIn: 2, difficulty: "medium", category: "sacrifice", hint: "Sacrifice the bishop to open the h-file!", answer: "1. Bxg6! hxg6 2. Qh8#" },
  { fen: "k7/pp6/8/8/8/8/1Q6/K1R5 w - - 0 1", playerColor: "w", moves: ["Qa3", "Kb8", "Qa8#"], title: "Queen & Rook Squeeze", mateIn: 2, difficulty: "medium", category: "checkmate", hint: "Threaten mate, force the king.", answer: "1. Qa3! Kb8 2. Qa8#" },
  { fen: "r4rk1/ppp2p1p/6pQ/8/8/8/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8", "Rxe8", "Qxh7#"], title: "Exchange then Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Trade rooks then queen finishes.", answer: "1. Re8! Rxe8 2. Qxh7#" },
  { fen: "r2qr1k1/ppp2ppp/8/3N4/8/8/PPP2PPP/R2Q2K1 w - - 0 1", playerColor: "w", moves: ["Nf6+", "Kh8", "Qd7#"], title: "Knight Check & Queen", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Check with the knight first.", answer: "1. Nf6+ Kh8 2. Qd7#" },
  { fen: "5rk1/ppp3pp/8/3Nb3/8/8/PPP1QPPP/6K1 w - - 0 1", playerColor: "w", moves: ["Nf6+", "Kh8", "Qe8#"], title: "Knight Fork to Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Knight check, queen invades.", answer: "1. Nf6+ Kh8 2. Qe8#" },
  { fen: "r5k1/1p3ppp/p7/8/8/1Q6/PP3PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Rxe8", "Qb8#"], title: "Rook Decoy Mate", mateIn: 2, difficulty: "medium", category: "sacrifice", premium: true, hint: "Sacrifice the rook to deflect.", answer: "1. Re8+! Rxe8 2. Qb8#" },
  { fen: "r1b2rk1/pppp1Npp/8/8/2B5/8/PPP2PPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Nh6+", "Kh8", "Qg8#"], title: "Knight Sacrifice Pattern", mateIn: 2, difficulty: "medium", category: "sacrifice", premium: true, hint: "The knight forces the king to the corner.", answer: "1. Nh6+ Kh8 2. Qg8#" },
  { fen: "6k1/5ppp/4Q3/8/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Qe8+", "Rf8", "Qxf8#"], title: "Queen Forces Exchange", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Force the rook to interpose, capture with mate.", answer: "1. Qe8+ Rf8 2. Qxf8#" },
  { fen: "r4rk1/pppb1ppp/8/4Q3/8/8/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Qe8", "Rfxe8", "Rxe8#"], title: "Queen Sacrifice Back Rank", mateIn: 2, difficulty: "medium", category: "sacrifice", premium: true, hint: "Sacrifice the queen to open the e-file.", answer: "1. Qe8! Rfxe8 2. Rxe8#" },
  { fen: "1k1r4/ppp5/8/8/8/8/1Q3PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Rd8", "Rxd8#"], title: "Rook Exchange Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Force the rook to block, capture with mate.", answer: "1. Re8+! Rd8 2. Rxd8#" },
  { fen: "5rk1/5p1p/8/6B1/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8", "Rxe8", "Bf6#"], title: "Bishop After Exchange", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Trade rooks, bishop mates.", answer: "1. Re8! Rxe8 2. Bf6#" },
  { fen: "r4rk1/ppp2Qpp/8/8/8/8/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Qf8+", "Rxf8", "Re8#"], title: "Queen Sac Back Rank", mateIn: 2, difficulty: "medium", category: "sacrifice", premium: true, hint: "Sacrifice the queen, rook delivers.", answer: "1. Qf8+! Rxf8 2. Re8#" },
  { fen: "5rk1/pp3ppp/8/8/8/5B2/PPP2PPP/4RRK1 w - - 0 1", playerColor: "w", moves: ["Re8", "Rxe8", "Rxe8#"], title: "Doubled Rook Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Doubled rooks on the e-file.", answer: "1. Re8! Rxe8 2. Rxe8#" },
  { fen: "6k1/5ppp/4p3/3N4/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Nf6+", "Kh8", "Re8#"], title: "Knight Fork into Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Knight checks, rook finishes.", answer: "1. Nf6+ Kh8 2. Re8#" },
  { fen: "r4rk1/ppp2Npp/8/8/8/8/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Nh6+", "Kh8", "Re8#"], title: "Knight Check Rook Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Knight checks, rook finishes on e8.", answer: "1. Nh6+ Kh8 2. Re8#" },
  { fen: "r1b2rk1/pppn1ppp/8/3N4/8/8/PPP1QPPP/R5K1 w - - 0 1", playerColor: "w", moves: ["Nf6+", "Kh8", "Qe8#"], title: "Knight & Queen Classic", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Knight check, queen invades.", answer: "1. Nf6+ Kh8 2. Qe8#" },
  { fen: "r1b2rk1/pppp1Qpp/2n5/8/2B5/8/PPP2PPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Qg6+", "Kh8", "Qg8#"], title: "Queen Approach Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Queen checks on g6, then g8.", answer: "1. Qg6+ Kh8 2. Qg8#" },
  { fen: "5rk1/5ppp/7N/8/8/8/5PPP/4Q1K1 w - - 0 1", playerColor: "w", moves: ["Qe8", "Rxe8", "Nf7#"], title: "Queen Sac Smothered", mateIn: 2, difficulty: "medium", category: "sacrifice", premium: true, hint: "Sacrifice the queen, knight delivers smothered mate.", answer: "1. Qe8! Rxe8 2. Nf7#" },
  { fen: "2kr4/ppp5/8/8/8/8/1Q3PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Rd8", "Rxd8#"], title: "Rook Forces Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Rook checks, captures with mate.", answer: "1. Re8+! Rd8 2. Rxd8#" },
  { fen: "r3k3/ppp5/8/8/8/8/1Q3PPP/4R1K1 w q - 0 1", playerColor: "w", moves: ["Re8+", "Kd7", "Qb7#"], title: "Rook Check Queen Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Rook checks, queen delivers.", answer: "1. Re8+ Kd7 2. Qb7#" },

  // ===================  MATE IN 3 — Hard  ===================
  { fen: "2b2rk1/5ppp/8/3QN3/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qxf7+", "Kh8", "Qg8+", "Rxg8", "Nf7#"], title: "Philidor's Smothered Mate", mateIn: 3, difficulty: "hard", category: "sacrifice", premium: true, hint: "Sacrifice the queen for a smothered mate!", answer: "1. Qxf7+! Kh8 2. Qg8+!! Rxg8 3. Nf7#" },
  { fen: "r1b1k2r/pppp1Npp/2n5/2b1p3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["Qh5", "g6", "Qxf7+", "Kd8", "Qf8#"], title: "Fried Liver Finish", mateIn: 3, difficulty: "hard", category: "checkmate", premium: true, hint: "The queen and knight combine lethally.", answer: "1. Qh5 g6 2. Qxf7+ Kd8 3. Qf8#" },
  { fen: "r1bqr1k1/pppn1ppp/8/3N4/2B5/8/PPP2PPP/R2QK2R w KQ - 0 1", playerColor: "w", moves: ["Nf6+", "Kh8", "Qh5", "h6", "Qxh6#"], title: "Knight Infiltration Mate", mateIn: 3, difficulty: "hard", category: "checkmate", premium: true, hint: "Knight check first, then queen storms in.", answer: "1. Nf6+ Kh8 2. Qh5 h6 3. Qxh6#" },
  { fen: "r3k2r/ppp2ppp/2n5/3Np1q1/2B5/8/PPP2PPP/R2QK2R w KQkq - 0 1", playerColor: "w", moves: ["Nf6+", "Ke7", "Qd7+", "Kf8", "Qf7#"], title: "Knight & Queen Pursuit", mateIn: 3, difficulty: "hard", category: "checkmate", premium: true, hint: "Knight check drives the king, queen finishes.", answer: "1. Nf6+ Ke7 2. Qd7+ Kf8 3. Qf7#" },
  { fen: "2kr4/ppp5/8/8/8/8/1Q3PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Rd8", "Rxd8+", "Kxd8", "Qb8#"], title: "Rook Sac into Queen Mate", mateIn: 3, difficulty: "hard", category: "sacrifice", premium: true, hint: "Double rook sacrifice, queen delivers.", answer: "1. Re8+! Rd8 2. Rxd8+! Kxd8 3. Qb8#" },
  { fen: "r4rk1/ppp2ppp/8/4Nb2/8/8/PPP1QPPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Nf3+", "Kh8", "Qe8", "Rxe8", "Rxe8#"], title: "Triple Threat", mateIn: 3, difficulty: "hard", category: "sacrifice", premium: true, hint: "Knight uncovers, queen sacs, rook finishes.", answer: "1. Nf3+ Kh8 2. Qe8! Rxe8 3. Rxe8#" },
];

// Helper to count puzzles by category
export const PUZZLE_CATEGORIES = [...new Set(PUZZLES.map(p => p.category).filter(Boolean))];
export const FREE_PUZZLES = PUZZLES.filter(p => !p.premium);
export const PREMIUM_PUZZLES = PUZZLES.filter(p => p.premium);
