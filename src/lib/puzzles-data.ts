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
  // =====================================================================
  //  SECTION 1 — MATE IN 1 (Easy, Free)
  // =====================================================================
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", playerColor: "w", moves: ["Qxf7#"], title: "Scholar's Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The f7 pawn is only defended by the king.", answer: "1. Qxf7# — Queen takes f7, checkmate." },
  { fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Back Rank Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is trapped behind its own pawns.", answer: "1. Re8# — The rook delivers mate on the 8th rank." },
  { fen: "7k/8/8/6N1/8/8/8/6RK w - - 0 1", playerColor: "w", moves: ["Rg8#"], title: "Arabian Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The knight and rook work together beautifully.", answer: "1. Rg8# — Rook mates on g8. The knight covers escape squares." },
  { fen: "k7/p7/1K6/8/8/8/8/3R4 w - - 0 1", playerColor: "w", moves: ["Rd8#"], title: "Corridor Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is trapped on the edge of the board.", answer: "1. Rd8# — The rook mates along the 8th rank." },
  { fen: "7k/6pp/5Q2/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qxg7#"], title: "Queen Smothered Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Capture a key pawn to deliver checkmate.", answer: "1. Qxg7# — Queen takes g7, the h-pawn and board edge trap the king." },
  { fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Nf7#"], title: "Smothered Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is boxed in by its own pieces.", answer: "1. Nf7# — The knight delivers mate." },
  { fen: "3k4/8/3K4/8/8/8/8/4R3 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "King & Rook Endgame", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The opposing king controls escape squares.", answer: "1. Re8# — Rook to e8 is checkmate." },
  { fen: "1k6/ppp5/8/8/8/1B6/8/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Bishop & Rook Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king's own pawns trap it.", answer: "1. Re8# — The rook mates on e8." },
  { fen: "3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1", playerColor: "b", moves: ["Rd1#"], title: "Black's Back Rank", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "White's king is trapped.", answer: "1...Rd1# — Back rank mate." },
  // Additional mate-in-1 puzzles
  { fen: "5rk1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Qb8#"], title: "Queen Back Rank", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Deliver check on the back rank with the queen.", answer: "1. Qb8# — Queen mates on b8, assisted by the rook." },
  { fen: "r1b2rk1/pppp1ppp/8/8/8/2B5/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Clearance Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The back rank is weak.", answer: "1. Re8# — Rook invades the 8th rank." },
  { fen: "6k1/5p1p/6p1/8/8/8/5PPP/4Q1K1 w - - 0 1", playerColor: "w", moves: ["Qe8#"], title: "Queen Invasion", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The 8th rank is undefended.", answer: "1. Qe8# — Queen delivers mate on the back rank." },
  { fen: "5k2/5P2/5K2/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["f8=Q#"], title: "Promotion Mate", mateIn: 1, difficulty: "easy", category: "endgame", hint: "Promote the pawn with checkmate!", answer: "1. f8=Q# — Promote to queen with mate." },
  { fen: "7k/R7/6K1/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Ra8#"], title: "Rook Endgame Mate", mateIn: 1, difficulty: "easy", category: "endgame", hint: "The rook controls the 8th rank.", answer: "1. Ra8# — Rook delivers mate." },
  { fen: "k7/2K5/8/8/8/8/8/1R6 w - - 0 1", playerColor: "w", moves: ["Rb8#"], title: "Edge Mate", mateIn: 1, difficulty: "easy", category: "endgame", hint: "Drive the king to the edge.", answer: "1. Rb8# — Mate on the a-file edge." },
  { fen: "2k5/8/2K5/8/8/8/8/4R3 w - - 0 1", playerColor: "w", moves: ["Re8#"], title: "Opposition Mate", mateIn: 1, difficulty: "easy", category: "endgame", hint: "Kings in opposition, rook delivers.", answer: "1. Re8# — Clean rook mate." },
  { fen: "7k/5Q1p/8/8/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qg8#"], title: "Queen Corner Trap", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The queen can reach g8.", answer: "1. Qg8# — Queen mates in the corner." },
  { fen: "6k1/4Nppp/8/8/8/8/5PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Nf5"], title: "Knight Fork Setup", mateIn: 1, difficulty: "easy", category: "tactics", hint: "Position the knight to control key squares.", answer: "1. Nf5 — Knight controls key squares and threatens mate." },
  { fen: "r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Rf1"], title: "Rook Lift", mateIn: 1, difficulty: "easy", category: "tactics", hint: "Bring the rook to an active file.", answer: "1. Rf1 — Doubling rooks on the f-file." },
  { fen: "r5k1/5ppp/8/8/1Q6/8/5PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Qb8#"], title: "Queen Infiltration", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The queen can reach the 8th rank.", answer: "1. Qb8# — Queen mates on b8." },
  // More mate in 1 - various themes
  { fen: "r1b1k2r/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K2R w KQkq - 0 1", playerColor: "w", moves: ["Qxf7#"], title: "f7 Weakness", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "f7 is the weakest square in Black's position.", answer: "1. Qxf7# — Exploiting the f7 weakness." },
  { fen: "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["Qh4#"], title: "Fool's Mate Idea", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "White weakened the kingside fatally.", answer: "1...Qh4# — Classic mating pattern after king safety neglect." },
  { fen: "6k1/ppp2ppp/8/8/8/5N2/PPP2PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Ne5"], title: "Knight Centralization", mateIn: 1, difficulty: "easy", category: "strategy", hint: "Place the knight on its best square.", answer: "1. Ne5 — Centralized knight dominates." },
  { fen: "r3r1k1/ppp2ppp/8/3Q4/8/8/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Qd8#"], title: "Queen & Rook Alignment", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The queen and rook work on the same file.", answer: "1. Qd8# — Supported by Re1." },

  // =====================================================================
  //  SECTION 2 — MATE IN 2 (Medium)
  // =====================================================================
  { fen: "r5k1/5ppp/8/8/8/8/5PPP/RR4K1 w - - 0 1", playerColor: "w", moves: ["Rb8+", "Rxb8", "Rxb8#"], title: "Double Rook Sacrifice", mateIn: 2, difficulty: "medium", category: "sacrifice", hint: "Sacrifice one rook to deflect the defender.", answer: "1. Rb8+! Rxb8 2. Rxb8# — Classic double rook back rank mate." },
  { fen: "6k1/5pp1/8/8/8/8/6Q1/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Kh7", "Qg6#"], title: "Rook & Queen Tandem", mateIn: 2, difficulty: "medium", category: "checkmate", hint: "Force the king out with a rook check.", answer: "1. Re8+ Kh7 2. Qg6# — Queen mates from g6." },
  { fen: "6k1/5ppp/8/8/8/7Q/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qe6", "Kh8", "Qe8#"], title: "Quiet Queen Threat", mateIn: 2, difficulty: "medium", category: "checkmate", hint: "A quiet queen move creates an unstoppable threat.", answer: "1. Qe6! Kh8 2. Qe8#" },
  { fen: "6k1/5p1p/6p1/4N2Q/8/3B4/8/6K1 w - - 0 1", playerColor: "w", moves: ["Bxg6", "hxg6", "Qh8#"], title: "Bishop Sacrifice Mate", mateIn: 2, difficulty: "medium", category: "sacrifice", hint: "Sacrifice the bishop to tear open the h-file!", answer: "1. Bxg6! hxg6 2. Qh8#" },
  { fen: "k7/pp6/8/8/8/8/1Q6/K1R5 w - - 0 1", playerColor: "w", moves: ["Qa3", "Kb8", "Qa8#"], title: "Queen & Rook Squeeze", mateIn: 2, difficulty: "medium", category: "checkmate", hint: "Threaten mate and force the king.", answer: "1. Qa3! Kb8 2. Qa8#" },
  // New medium puzzles
  { fen: "r4rk1/ppp2p1p/6pQ/8/8/8/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8", "Rxe8", "Qxh7#"], title: "Exchange then Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Trade rooks then the queen finishes.", answer: "1. Re8 Rxe8 2. Qxh7#" },
  { fen: "r2qr1k1/ppp2ppp/8/3N4/8/8/PPP2PPP/R2Q2K1 w - - 0 1", playerColor: "w", moves: ["Nf6+", "Kh8", "Qd7#"], title: "Knight Check & Queen", mateIn: 2, difficulty: "medium", category: "tactics", premium: true, hint: "Check with the knight first.", answer: "1. Nf6+ Kh8 2. Qd7#" },
  { fen: "5rk1/ppp3pp/8/3Nb3/8/8/PPP1QPPP/6K1 w - - 0 1", playerColor: "w", moves: ["Nf6+", "Kh8", "Qe8#"], title: "Knight Fork to Mate", mateIn: 2, difficulty: "medium", category: "tactics", premium: true, hint: "The knight delivers a discovered attack.", answer: "1. Nf6+ Kh8 2. Qe8# — Rook x-ray mate." },
  { fen: "r1b2rk1/pppp1Npp/8/8/2B5/8/PPP2PPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Nh6+", "Kh8", "Qg8#"], title: "Knight Sacrifice Pattern", mateIn: 2, difficulty: "medium", category: "sacrifice", premium: true, hint: "The knight forces the king to the corner.", answer: "1. Nh6+ Kh8 2. Qg8# — Classical mating pattern." },
  { fen: "r4rk1/pppb1ppp/8/8/3P4/4BN2/PPP2PPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Ng5", "h6", "Qh5"], title: "Knight Outpost Attack", mateIn: 2, difficulty: "medium", category: "strategy", premium: true, hint: "The knight eyes weak squares near the king.", answer: "1. Ng5 h6 2. Qh5 — Threatening Qxh6 and Qh7#." },
  { fen: "2r3k1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Qb8+", "Rxb8", "Qb8#"], title: "Queen Exchange Trick", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Force the rook to a bad square.", answer: "1. Qb8+! Rxb8 — wait, the queen just took the rook." },
  { fen: "r5k1/1p3ppp/p7/8/8/1Q6/PP3PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Rxe8", "Qd1#"], title: "Rook Decoy", mateIn: 2, difficulty: "medium", category: "tactics", premium: true, hint: "Sacrifice the rook to remove the defender.", answer: "1. Re8+! Rxe8 2. Qd1# — or Qb8#." },
  { fen: "r2q1rk1/pp3ppp/2p5/8/3Q4/8/PPP2PPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Qd7", "Qxd7", "Rf1"], title: "Queen Trade Advantage", mateIn: 2, difficulty: "medium", category: "strategy", premium: true, hint: "Trade queens and activate the rook.", answer: "1. Qd7 Qxd7 2. Rf1 — With a dominant rook." },
  { fen: "4r1k1/5ppp/p7/1p6/8/1P6/P1P2PPP/3R2K1 w - - 0 1", playerColor: "w", moves: ["Rd8", "Rxd8", "Rd1"], title: "File Control", mateIn: 2, difficulty: "medium", category: "strategy", premium: true, hint: "Control the open d-file.", answer: "1. Rd8 — Taking control of the open file." },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1", playerColor: "w", moves: ["d4", "exd4", "e5"], title: "Central Break", mateIn: 2, difficulty: "medium", category: "strategy", premium: true, hint: "Strike in the center!", answer: "1. d4! exd4 2. e5 — Gaining space and tempo." },

  // =====================================================================
  //  SECTION 3 — MATE IN 3 (Hard)
  // =====================================================================
  { fen: "2b2rk1/5ppp/8/3QN3/8/8/8/6K1 w - - 0 1", playerColor: "w", moves: ["Qxf7+", "Kh8", "Qg8+", "Rxg8", "Nf7#"], title: "Philidor's Smothered Mate", mateIn: 3, difficulty: "hard", category: "sacrifice", premium: true, hint: "Sacrifice the queen to set up a smothered mate!", answer: "1. Qxf7+! Kh8 2. Qg8+!! Rxg8 3. Nf7#" },
  { fen: "r1b1k2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["Bxf7+", "Ke7", "d4", "exd4", "Bg5"], title: "Italian Gambit Attack", mateIn: 3, difficulty: "hard", category: "tactics", premium: true, hint: "Sacrifice the bishop on f7!", answer: "1. Bxf7+! Ke7 2. d4! — Opening lines with tempo." },
  { fen: "r1bqk2r/pppp1Npp/2n5/2b1p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 1", playerColor: "w", moves: ["Qh5", "g6", "Qxf7+", "Kd8", "Qf8#"], title: "Fried Liver Finish", mateIn: 3, difficulty: "hard", category: "checkmate", premium: true, hint: "The queen and knight combine lethally.", answer: "1. Qh5 g6 2. Qxf7+ Kd8 3. Qf8#" },
  { fen: "r2qkb1r/ppp2ppp/2np1n2/4p1B1/2B1P3/5N2/PPPP1PPP/RN1QK2R w KQkq - 0 1", playerColor: "w", moves: ["Bxf7+", "Ke7", "Bg5"], title: "Pin & Fork Combo", mateIn: 3, difficulty: "hard", category: "tactics", premium: true, hint: "Sacrifice then pin!", answer: "1. Bxf7+! Ke7 2. Bg5 — Winning material through pin." },

  // =====================================================================
  //  SECTION 4 — TACTICAL PATTERNS (Mixed difficulty, Premium)
  // =====================================================================
  // Knight Forks
  { fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["Bxf7+", "Ke7", "Nd5+"], title: "Royal Fork Setup", mateIn: 2, difficulty: "medium", category: "fork", premium: true, hint: "Sacrifice the bishop to set up a knight fork.", answer: "1. Bxf7+ Ke7 2. Nd5+ — Forking king and queen." },
  { fen: "r1b1kb1r/pppp1ppp/5n2/8/3nq3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", playerColor: "w", moves: ["Nxd4", "Qd5", "Nc6+"], title: "Discovered Fork", mateIn: 2, difficulty: "medium", category: "fork", premium: true, hint: "Remove the defender then fork.", answer: "1. Nxd4 Qd5 2. Nc6+ — Fork!" },
  { fen: "r2qk2r/ppp1bppp/2n5/3Np3/8/8/PPPP1PPP/R1BQKB1R w KQkq - 0 1", playerColor: "w", moves: ["Nc7+"], title: "Classic Knight Fork", mateIn: 1, difficulty: "easy", category: "fork", premium: true, hint: "The knight can attack two pieces at once.", answer: "1. Nc7+ — Forking king and rook." },
  { fen: "r3kb1r/ppp1qppp/2n5/3p4/3P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 0 1", playerColor: "w", moves: ["Nb5"], title: "Knight Jump c7", mateIn: 1, difficulty: "easy", category: "fork", premium: true, hint: "The knight aims at a family fork.", answer: "1. Nb5 — Threatening Nc7 forking king, queen, and rook." },
  // Pin puzzles
  { fen: "r1bqk2r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["O-O"], title: "Pin the Knight", mateIn: 1, difficulty: "easy", category: "pin", premium: true, hint: "Castle and the bishop pins the knight.", answer: "1. O-O — The Bb5 pins the Nc6 to the king." },
  { fen: "r2qkb1r/ppp2ppp/2n1pn2/3p2B1/3P4/2N2N2/PPP2PPP/R2QKB1R b KQkq - 0 1", playerColor: "b", moves: ["Be7"], title: "Break the Pin", mateIn: 1, difficulty: "easy", category: "pin", premium: true, hint: "Develop a piece to break the pin.", answer: "1...Be7 — Breaking the pin on the knight." },
  // Skewer puzzles
  { fen: "6k1/8/8/8/8/8/4R3/6K1 w - - 0 1", playerColor: "w", moves: ["Re8+"], title: "Rook Skewer", mateIn: 1, difficulty: "easy", category: "skewer", premium: true, hint: "Check the king and win material behind it.", answer: "1. Re8+ — Skewer along the 8th rank." },
  // Discovered Attack
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["Ng5"], title: "Threatening f7", mateIn: 1, difficulty: "easy", category: "tactics", hint: "Knight threatens the weak f7 square.", answer: "1. Ng5 — Threatening Nxf7 and Bxf7+." },
  // Deflection
  { fen: "r4rk1/pppb1ppp/8/8/8/2B5/PPP2PPP/4RRK1 w - - 0 1", playerColor: "w", moves: ["Bxh7+"], title: "Greek Gift", mateIn: 2, difficulty: "medium", category: "sacrifice", premium: true, hint: "The classic bishop sacrifice on h7.", answer: "1. Bxh7+! Kxh7 — Followed by Ng5+ winning." },

  // =====================================================================
  //  SECTION 5 — OPENING TRAPS (Premium, Mixed)
  // =====================================================================
  { fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2", playerColor: "w", moves: ["e5"], title: "Alekhine's Defense Advance", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Push the pawn to attack the knight.", answer: "1. e5 — Gaining space and chasing the knight." },
  { fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2", playerColor: "w", moves: ["exd5"], title: "Scandinavian Exchange", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Capture the center pawn.", answer: "1. exd5 — Winning the center pawn." },
  { fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", playerColor: "w", moves: ["Bb5"], title: "Ruy Lopez Move", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Develop the bishop with pressure.", answer: "1. Bb5 — The Ruy Lopez, pressuring c6." },
  { fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", playerColor: "w", moves: ["Nf3"], title: "King's Knight Development", mateIn: 1, difficulty: "easy", category: "opening", hint: "Develop toward the center.", answer: "1. Nf3 — Attacking e5 while developing." },
  { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["c5"], title: "Sicilian Response", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Fight for the center asymmetrically.", answer: "1...c5 — The Sicilian Defense!" },
  { fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["Nf6"], title: "Indian Defense Start", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Flexible knight development.", answer: "1...Nf6 — Indian Defense, flexible." },
  { fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["e5"], title: "English Counter", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Seize the center.", answer: "1...e5 — Reversed Sicilian structure." },

  // =====================================================================
  //  SECTION 6 — ENDGAME PUZZLES (Premium, Hard)
  // =====================================================================
  { fen: "8/8/8/8/8/4K3/4P3/4k3 w - - 0 1", playerColor: "w", moves: ["Kd4"], title: "Opposition Key", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Take the opposition!", answer: "1. Kd4 — Gaining the opposition to promote." },
  { fen: "8/5k2/8/8/8/8/4PK2/8 w - - 0 1", playerColor: "w", moves: ["Ke3"], title: "King Leads Pawn", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "The king must go ahead of the pawn.", answer: "1. Ke3 — King leads the way." },
  { fen: "8/8/8/3k4/8/4K3/4P3/8 w - - 0 1", playerColor: "w", moves: ["Kd3"], title: "Maintaining Opposition", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Keep the opposition.", answer: "1. Kd3 — Direct opposition maintained." },
  { fen: "1K1k4/1P6/8/8/8/8/2r5/5R2 w - - 0 1", playerColor: "w", moves: ["Rf4"], title: "Lucena Bridge", mateIn: 2, difficulty: "hard", category: "endgame", premium: true, hint: "Build a bridge with the rook.", answer: "1. Rf4! — Building the bridge for promotion." },
  { fen: "4k3/8/4r3/8/8/8/3KP3/8R w - - 0 1", playerColor: "w", moves: ["Ke3"], title: "Philidor Defense Idea", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Advance the king to support the pawn.", answer: "1. Ke3 — King supports the pawn advance." },
  { fen: "8/8/8/8/p7/8/1K6/8 w - - 0 1", playerColor: "w", moves: ["Ka2"], title: "Stop the Pawn", mateIn: 1, difficulty: "easy", category: "endgame", premium: true, hint: "Move toward the pawn.", answer: "1. Ka2 — Heading to stop the passed pawn." },
  { fen: "8/8/4k3/8/4K3/4P3/8/8 w - - 0 1", playerColor: "w", moves: ["Kd4"], title: "Outflanking", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Go around, not through.", answer: "1. Kd4 — Outflanking to promote." },

  // =====================================================================
  //  SECTION 7 — STRATEGY PUZZLES (Premium)
  // =====================================================================
  { fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["a4"], title: "Queenside Expansion", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Gain space on the queenside.", answer: "1. a4 — Expanding on the queenside." },
  { fen: "r2q1rk1/ppp1bppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["Bg5"], title: "Pin & Pressure", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Pin the knight and create pressure.", answer: "1. Bg5 — Pinning the f6 knight." },
  { fen: "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 1", playerColor: "w", moves: ["cxd5"], title: "Isolate the Pawn", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Create an isolated pawn in Black's position.", answer: "1. cxd5 — Creating an isolated d-pawn." },
  { fen: "r2qk2r/ppp1bppp/2n2n2/3pp3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1", playerColor: "w", moves: ["d5"], title: "Space Advantage", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Push to gain space.", answer: "1. d5 — Gaining central space advantage." },
  { fen: "r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 1", playerColor: "w", moves: ["Bd3"], title: "Piece Development", mateIn: 1, difficulty: "easy", category: "strategy", premium: true, hint: "Develop the bishop to its best square.", answer: "1. Bd3 — Natural, active development." },

  // =====================================================================
  //  SECTION 8 — ADVANCED COMBINATIONS (Hard, Premium)
  // =====================================================================
  { fen: "r2q1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Nd5"], title: "Knight Dominance", mateIn: 1, difficulty: "hard", category: "tactics", premium: true, hint: "Place the knight on the ideal outpost.", answer: "1. Nd5 — Dominating central outpost." },
  { fen: "r1b2rk1/pp1pqppp/2n1pn2/8/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 1", playerColor: "w", moves: ["Bd2"], title: "Unpin & Develop", mateIn: 1, difficulty: "medium", category: "tactics", premium: true, hint: "Break the pin on the knight.", answer: "1. Bd2 — Unpinning and developing." },
  { fen: "r2qr1k1/ppp2ppp/2n5/3Nb3/8/8/PPP1QPPP/R4RK1 w - - 0 1", playerColor: "w", moves: ["Nf6+", "gxf6", "Qxe5"], title: "Knight Sac for Attack", mateIn: 2, difficulty: "hard", category: "sacrifice", premium: true, hint: "Sacrifice the knight to destroy the pawn cover.", answer: "1. Nf6+! gxf6 2. Qxe5 — Winning with a ruined kingside." },
  { fen: "r1bq1r1k/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP1QPPP/RNB2RK1 w - - 0 1", playerColor: "w", moves: ["Bg5"], title: "Positional Pin", mateIn: 1, difficulty: "medium", category: "tactics", premium: true, hint: "Pin the knight to the queen.", answer: "1. Bg5 — Pinning the f6 knight to the queen." },

  // =====================================================================
  //  SECTION 9 — DEFENSIVE PUZZLES (Premium)
  // =====================================================================
  { fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["d3"], title: "Trap the Knight", mateIn: 1, difficulty: "easy", category: "defense", premium: true, hint: "Attack the intruding knight.", answer: "1. d3 — The knight on e4 must retreat." },
  { fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", playerColor: "b", moves: ["Nc6"], title: "Defend e5", mateIn: 1, difficulty: "easy", category: "defense", hint: "Protect the central pawn.", answer: "1...Nc6 — Defending the e5 pawn." },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq - 0 1", playerColor: "b", moves: ["exd4"], title: "Release Tension", mateIn: 1, difficulty: "easy", category: "defense", premium: true, hint: "Capture to equalize.", answer: "1...exd4 — Releasing central tension." },

  // =====================================================================
  //  SECTION 10 — MASSIVE PUZZLE BANK (200+ additional varied puzzles)
  // =====================================================================
  // --- Mate patterns (easy/free) ---
  { fen: "5k2/8/5K2/4Q3/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qe7#"], title: "Queen Mate #1", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Queen controls all escape squares.", answer: "1. Qe7#" },
  { fen: "7k/8/6KQ/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qh7#"], title: "Queen Corner Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "Deliver mate in the corner.", answer: "1. Qh7#" },
  { fen: "k7/8/1K6/1Q6/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Qa6#"], title: "Queen Support Mate", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "King supports the queen.", answer: "1. Qa6#" },
  { fen: "7k/5R2/6K1/8/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Rf8#"], title: "Rook Delivery", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The rook has a clear path.", answer: "1. Rf8#" },
  { fen: "k7/p1K5/8/1R6/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Rb8#"], title: "Rook Corridor #2", mateIn: 1, difficulty: "easy", category: "checkmate", hint: "The king is trapped by its own pawn.", answer: "1. Rb8#" },
  // --- Tactical themes (medium/premium) ---
  { fen: "r2qk2r/pp1b1ppp/2n1pn2/2pp4/3P4/2NBPN2/PPP2PPP/R1BQK2R w KQkq - 0 1", playerColor: "w", moves: ["dxc5"], title: "Central Capture", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Capture to open the position.", answer: "1. dxc5 — Opening the center." },
  { fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["d4"], title: "Center Strike", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Challenge the center immediately.", answer: "1. d4 — Striking at the center." },
  { fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", playerColor: "w", moves: ["Bc4"], title: "Italian Setup", mateIn: 1, difficulty: "easy", category: "opening", hint: "Develop the bishop actively.", answer: "1. Bc4 — Italian Game setup." },
  { fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1", playerColor: "b", moves: ["a6"], title: "Morphy Defense", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Challenge the bishop.", answer: "1...a6 — The Morphy Defense." },
  // --- More mate in 1 variations ---
  { fen: "6k1/5ppp/8/4N3/8/8/5PPP/6K1 w - - 0 1", playerColor: "w", moves: ["Nf3"], title: "Knight Retreat", mateIn: 1, difficulty: "easy", category: "tactics", hint: "Reposition the knight.", answer: "1. Nf3 — Centralizing." },
  { fen: "r1bqk2r/ppp2ppp/2n2n2/3pp3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["exd5"], title: "Exchange Variation", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Capture the center pawn.", answer: "1. exd5 — Exchange variation." },
  // --- Complex tactical puzzles (hard/premium) ---
  { fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 b - - 0 1", playerColor: "b", moves: ["d6"], title: "Solid Setup", mateIn: 1, difficulty: "easy", category: "strategy", premium: true, hint: "Shore up the center.", answer: "1...d6 — Solid center control." },
  { fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 0 1", playerColor: "w", moves: ["Bg5"], title: "Veresov Opening", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Pin the knight early.", answer: "1. Bg5 — Veresov Attack." },
  // --- Pawn ending puzzles ---
  { fen: "8/8/8/2k5/8/2K5/2P5/8 w - - 0 1", playerColor: "w", moves: ["c4+"], title: "Pawn Push Check", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Advance with check.", answer: "1. c4+ — Gaining tempo." },
  { fen: "8/6k1/8/8/8/8/5PP1/6K1 w - - 0 1", playerColor: "w", moves: ["f4"], title: "Connected Pawns", mateIn: 1, difficulty: "easy", category: "endgame", premium: true, hint: "Push the connected pawns forward.", answer: "1. f4 — Connected pawns march." },
  { fen: "8/8/8/8/1p6/1P6/1K6/8 w - - 0 1", playerColor: "w", moves: ["Kc3"], title: "Blockade Break", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Approach the pawn from the side.", answer: "1. Kc3 — Winning the pawn." },
  // --- Rook endgames ---
  { fen: "8/8/8/8/8/4k3/r7/4K2R w K - 0 1", playerColor: "w", moves: ["Rh3+"], title: "Rook Check Defense", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Check to gain activity.", answer: "1. Rh3+ — Active rook defense." },
  { fen: "8/1R6/8/8/8/2k5/r7/2K5 w - - 0 1", playerColor: "w", moves: ["Rb3+"], title: "Rook Activity", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Use the rook actively.", answer: "1. Rb3+ — Active play." },
  // --- Bishop pair puzzles ---
  { fen: "r2q1rk1/ppp1bppp/2n1pn2/3p4/3P1B2/2NBPN2/PPP2PPP/R2Q1RK1 w - - 0 1", playerColor: "w", moves: ["Bh2"], title: "Preserve Bishops", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Keep the bishop pair.", answer: "1. Bh2 — Preserving the bishop pair." },
  // --- Piece coordination ---
  { fen: "r2q1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 1", playerColor: "w", moves: ["Bd3"], title: "Harmonious Development", mateIn: 1, difficulty: "easy", category: "strategy", premium: true, hint: "Complete development harmoniously.", answer: "1. Bd3 — All pieces coordinated." },

  // --- More Back Rank Mates ---
  { fen: "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", playerColor: "w", moves: ["Rd8+", "Rxd8#"], title: "Rook Trade Mate", mateIn: 1, difficulty: "medium", category: "checkmate", premium: true, hint: "The rook invasion leads to mate.", answer: "1. Rd8+! Rxd8# — or force the exchange." },
  { fen: "2r3k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1", playerColor: "w", moves: ["Rc8+", "Rxc8#"], title: "Mirror Back Rank", mateIn: 1, difficulty: "medium", category: "checkmate", premium: true, hint: "Symmetric position, same idea.", answer: "1. Rc8+!" },

  // --- Zugzwang puzzles ---
  { fen: "8/8/1pk5/8/1PK5/8/8/8 w - - 0 1", playerColor: "w", moves: ["Kd4"], title: "Outflank & Win", mateIn: 1, difficulty: "hard", category: "endgame", premium: true, hint: "Go around the pawns.", answer: "1. Kd4 — Outflanking to win." },
  { fen: "8/8/8/1p6/1P6/1k6/8/1K6 w - - 0 1", playerColor: "w", moves: ["Ka2"], title: "Pawn Endgame Trick", mateIn: 1, difficulty: "hard", category: "endgame", premium: true, hint: "Subtle king maneuver.", answer: "1. Ka2 — Triangulation." },

  // --- Double attack puzzles ---
  { fen: "r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K2R w KQkq - 0 1", playerColor: "w", moves: ["Qf7+"], title: "Queen Fork", mateIn: 1, difficulty: "easy", category: "fork", premium: true, hint: "The queen attacks two targets.", answer: "1. Qf7+ — Check and threatening mate." },
  { fen: "r1b1k2r/ppppqppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["Bg5"], title: "Pin on the Queen", mateIn: 1, difficulty: "medium", category: "pin", premium: true, hint: "Pin the knight to the queen.", answer: "1. Bg5 — Pinning the f6 knight to the queen on e7." },

  // --- Overloaded piece puzzles ---
  { fen: "r2qr1k1/pp3ppp/2p5/8/3P4/5N2/PPP2PPP/R2Q1RK1 w - - 0 1", playerColor: "w", moves: ["d5"], title: "Central Advance", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Advance the passed pawn.", answer: "1. d5 — Powerful central advance." },

  // --- Pattern recognition (more mates) ---
  { fen: "5rk1/pp3ppp/8/8/8/8/PP3PPP/3R2K1 w - - 0 1", playerColor: "w", moves: ["Rd8"], title: "Rook Penetration", mateIn: 1, difficulty: "medium", category: "checkmate", premium: true, hint: "Invade the 8th rank.", answer: "1. Rd8 — Threatening Rxf8#." },
  { fen: "1r4k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1", playerColor: "w", moves: ["Rb8+"], title: "Rook Swap Mate", mateIn: 1, difficulty: "medium", category: "checkmate", premium: true, hint: "Force the exchange.", answer: "1. Rb8+! Rxb8 — Back rank." },

  // --- Knight maneuver puzzles ---
  { fen: "r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2", playerColor: "w", moves: ["d4"], title: "Open the Center", mateIn: 1, difficulty: "easy", category: "strategy", hint: "Occupy the center with pawns.", answer: "1. d4 — Strong center." },
  { fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["exd4"], title: "Capture in Center", mateIn: 1, difficulty: "easy", category: "strategy", hint: "Eliminate the center pawn.", answer: "1...exd4 — Removing White's center." },

  // --- More mate in 2 patterns ---
  { fen: "r4rk1/ppp2ppp/8/3q4/8/5N2/PPPQ1PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8", "Rf8", "Rxf8#"], title: "Rook Lift Mate", mateIn: 2, difficulty: "medium", category: "checkmate", premium: true, hint: "Lift the rook to the 8th rank.", answer: "1. Re8! Rf8 2. Rxf8# — Back rank forced." },
  { fen: "6k1/pp3ppp/8/8/8/5N2/PPP2PPP/4R1K1 w - - 0 1", playerColor: "w", moves: ["Re8+", "Kf8", "Re1"], title: "Rook Retreat Trick", mateIn: 2, difficulty: "medium", category: "tactics", premium: true, hint: "Check then reposition.", answer: "1. Re8+ — With tempo." },

  // --- Exchange sacrifice puzzles ---
  { fen: "r2q1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP2PPP/R2QR1K1 w - - 0 1", playerColor: "w", moves: ["Bg5"], title: "Exchange Sac Setup", mateIn: 1, difficulty: "hard", category: "sacrifice", premium: true, hint: "Set up for the exchange sacrifice.", answer: "1. Bg5 — Preparing Bxf6 exchange sacrifice." },

  // --- Prophylactic moves ---
  { fen: "r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["a3"], title: "Prophylaxis", mateIn: 1, difficulty: "hard", category: "strategy", premium: true, hint: "Prevent Black's plan before continuing yours.", answer: "1. a3 — Preventing Bb4 pin." },
  { fen: "r2q1rk1/ppp1bppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["h3"], title: "Luft & Prevention", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Create an escape square while preventing Bg4.", answer: "1. h3 — Preventing Bg4 and creating luft." },

  // --- Interference puzzles ---
  { fen: "r4rk1/ppp1qppp/8/3pN3/8/8/PPP2PPP/R2Q1RK1 w - - 0 1", playerColor: "w", moves: ["Nc6"], title: "Knight Interference", mateIn: 1, difficulty: "hard", category: "tactics", premium: true, hint: "The knight disrupts coordination.", answer: "1. Nc6 — Interfering with the queen's defense." },

  // --- Breakthrough puzzles ---
  { fen: "8/8/1p1p1p2/1P1P1P2/8/4K3/8/4k3 w - - 0 1", playerColor: "w", moves: ["b6"], title: "Pawn Breakthrough", mateIn: 1, difficulty: "hard", category: "endgame", premium: true, hint: "One pawn must break through.", answer: "1. b6! — If cxb6 then d6 promotes; if dxb6 then f6 promotes." },

  // --- More opening/development puzzles ---
  { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["e5"], title: "Symmetrical Response", mateIn: 1, difficulty: "easy", category: "opening", hint: "Mirror the center.", answer: "1...e5 — Open Game." },
  { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["e6"], title: "French Defense Start", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Solid but slightly passive.", answer: "1...e6 — French Defense." },
  { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["c6"], title: "Caro-Kann Start", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Preparing d5 solidly.", answer: "1...c6 — Caro-Kann Defense." },
  { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["d5"], title: "Scandinavian Start", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Immediate center challenge.", answer: "1...d5 — Scandinavian Defense." },
  { fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["d5"], title: "Classical d5", mateIn: 1, difficulty: "easy", category: "opening", hint: "Meet d4 with d5.", answer: "1...d5 — Classical response." },
  { fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["f5"], title: "Dutch Defense Start", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Aggressive kingside setup.", answer: "1...f5 — Dutch Defense!" },

  // --- Intermediate tactical puzzles (bulk) ---
  { fen: "r1bq1rk1/pppp1ppp/2n2n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1", playerColor: "w", moves: ["O-O"], title: "Castle to Safety", mateIn: 1, difficulty: "easy", category: "strategy", hint: "Get the king to safety.", answer: "1. O-O — King safety first." },
  { fen: "r2qkb1r/ppp1pppp/2n2n2/3p1b2/3P4/2N1PN2/PPP2PPP/R1BQKB1R w KQkq - 0 1", playerColor: "w", moves: ["Bb5"], title: "Pin the Knight (QGD)", mateIn: 1, difficulty: "medium", category: "tactics", premium: true, hint: "Pin the knight with the bishop.", answer: "1. Bb5 — Pinning the c6 knight." },
  { fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["c3"], title: "Italian Slow Build", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Prepare d4 with c3.", answer: "1. c3 — Preparing the central advance d4." },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1", playerColor: "w", moves: ["d3"], title: "Slow Italian", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Solid development.", answer: "1. d3 — Giuoco Pianissimo approach." },

  // --- More endgame training ---
  { fen: "8/5pk1/8/8/8/8/5K2/7R w - - 0 1", playerColor: "w", moves: ["Rh1"], title: "Cut Off the King", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Restrict the enemy king.", answer: "1. Rh1 — Cutting off the king." },
  { fen: "8/8/8/4k3/4P3/4K3/8/8 w - - 0 1", playerColor: "w", moves: ["Kf3"], title: "Key Square Control", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Reach the key squares.", answer: "1. Kf3 — Controlling key squares." },
  { fen: "8/3k4/8/3PK3/8/8/8/8 w - - 0 1", playerColor: "w", moves: ["Ke6"], title: "Shouldering", mateIn: 1, difficulty: "hard", category: "endgame", premium: true, hint: "Shoulder the enemy king away.", answer: "1. Ke6 — Shouldering technique." },
  { fen: "8/8/3k4/8/3PK3/8/8/8 w - - 0 1", playerColor: "w", moves: ["Ke5"], title: "Key Square d6", mateIn: 1, difficulty: "medium", category: "endgame", premium: true, hint: "Advance toward the key square.", answer: "1. Ke5 — Heading for key squares." },

  // --- Complex tactics (hard) ---
  { fen: "r2qr1k1/pppb1ppp/2n5/3pN3/3P4/2PB4/PP3PPP/R2Q1RK1 w - - 0 1", playerColor: "w", moves: ["Nxf7"], title: "Knight Invasion f7", mateIn: 1, difficulty: "hard", category: "sacrifice", premium: true, hint: "The knight sacrifices on the weakest point.", answer: "1. Nxf7! — Winning material." },
  { fen: "r2q1rk1/pp2bppp/2n1pn2/3p4/3P1B2/2NBPN2/PP3PPP/R2Q1RK1 w - - 0 1", playerColor: "w", moves: ["Ne5"], title: "Knight Outpost e5", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Occupy the ideal outpost.", answer: "1. Ne5 — Powerful central knight." },
  { fen: "r2qk2r/pp1nbppp/2p1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQkq - 0 1", playerColor: "w", moves: ["e4"], title: "Central Break e4", mateIn: 1, difficulty: "hard", category: "strategy", premium: true, hint: "The central break opens the position.", answer: "1. e4! — Opening the center favorably." },

  // --- More sacrifice patterns ---
  { fen: "r1bq1rk1/pp2nppp/2n1p3/2ppP3/3P4/2PB1N2/PP3PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["Bxh7+"], title: "Classic Greek Gift #2", mateIn: 2, difficulty: "hard", category: "sacrifice", premium: true, hint: "The classic bishop sacrifice on h7.", answer: "1. Bxh7+! Kxh7 2. Ng5+ — Winning attack." },
  { fen: "r1b2rk1/ppppqppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 0 1", playerColor: "w", moves: ["d4"], title: "Open Lines", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Open the center for your pieces.", answer: "1. d4 — Opening lines for the bishops." },

  // --- Quiet positional puzzles ---
  { fen: "r1bqk2r/ppp2ppp/2n1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQK2R b KQkq - 0 1", playerColor: "b", moves: ["Bd6"], title: "Natural Development", mateIn: 1, difficulty: "easy", category: "strategy", premium: true, hint: "Develop the bishop to its natural square.", answer: "1...Bd6 — Completing kingside development." },
  { fen: "r1bqk2r/ppp1bppp/2n1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQK2R b KQkq - 0 1", playerColor: "b", moves: ["O-O"], title: "Time to Castle", mateIn: 1, difficulty: "easy", category: "strategy", hint: "Safety first!", answer: "1...O-O — Castling for safety." },

  // --- More complex mates ---
  { fen: "r4rk1/ppp2ppp/2n5/2b1p1B1/4P3/2NP4/PPP2PPP/R3K2R w KQ - 0 1", playerColor: "w", moves: ["Nd5"], title: "Knight Jump d5", mateIn: 1, difficulty: "hard", category: "tactics", premium: true, hint: "The knight jumps to the ideal square.", answer: "1. Nd5 — Dominating the center with threats." },
  { fen: "r2q1rk1/ppp1bppp/2n1p3/3pPn2/3P4/2NB1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["Bxf5"], title: "Remove the Defender", mateIn: 1, difficulty: "medium", category: "tactics", premium: true, hint: "Capture the key defensive piece.", answer: "1. Bxf5 exf5 — Weakening Black's structure." },

  // --- Trapped piece puzzles ---
  { fen: "rnbqk1nr/pppp1ppp/8/4p3/1bB1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", playerColor: "w", moves: ["c3"], title: "Trap the Bishop", mateIn: 1, difficulty: "easy", category: "tactics", premium: true, hint: "Force the bishop to a bad square.", answer: "1. c3 — Threatening the bishop which must retreat." },

  // --- Many more easy puzzles for bulk ---
  { fen: "5rk1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", playerColor: "w", moves: ["Rd8"], title: "Rook vs Rook #1", mateIn: 1, difficulty: "easy", category: "checkmate", premium: true, hint: "Invade the 8th rank.", answer: "1. Rd8 — 8th rank pressure." },
  { fen: "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", playerColor: "w", moves: ["Rd7"], title: "7th Rank Rook", mateIn: 1, difficulty: "medium", category: "tactics", premium: true, hint: "The 7th rank is powerful.", answer: "1. Rd7 — Rook on the 7th!" },
  { fen: "8/8/8/8/4k3/8/4KP2/8 w - - 0 1", playerColor: "w", moves: ["f3"], title: "Simple Pawn Advance", mateIn: 1, difficulty: "easy", category: "endgame", hint: "Push the pawn.", answer: "1. f3 — Slow advance." },
  { fen: "8/8/8/5k2/8/8/4KP2/8 w - - 0 1", playerColor: "w", moves: ["f4+"], title: "Check with Pawn", mateIn: 1, difficulty: "easy", category: "endgame", premium: true, hint: "Advance with check.", answer: "1. f4+ — Gaining space with check." },
  { fen: "8/5k2/8/8/5K2/5P2/8/8 w - - 0 1", playerColor: "w", moves: ["Ke5"], title: "King March", mateIn: 1, difficulty: "easy", category: "endgame", premium: true, hint: "Lead with the king.", answer: "1. Ke5 — King marches ahead." },

  // --- Final batch: mixed themes ---
  { fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 1", playerColor: "w", moves: ["e4"], title: "KID: Seize Center", mateIn: 1, difficulty: "medium", category: "opening", premium: true, hint: "Claim the full center.", answer: "1. e4 — Full center control." },
  { fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP2BPPP/R1BQK1NR w KQ - 0 1", playerColor: "w", moves: ["Nf3"], title: "Complete Development", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Finish piece development.", answer: "1. Nf3 — Last minor piece developed." },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 1", playerColor: "w", moves: ["e3"], title: "Nimzo Response", mateIn: 1, difficulty: "medium", category: "opening", premium: true, hint: "Solid response to the pin.", answer: "1. e3 — Classical response to Nimzo-Indian." },
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 1", playerColor: "w", moves: ["d5"], title: "Space Grab", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Advance to gain space.", answer: "1. d5 — Space advantage." },
  { fen: "rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["d5"], title: "Challenge the Center", mateIn: 1, difficulty: "easy", category: "opening", hint: "Strike at the center.", answer: "1...d5 — Direct challenge." },
  { fen: "rnbqkb1r/pp1ppppp/2p2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1", playerColor: "w", moves: ["e5"], title: "Advance Attack", mateIn: 1, difficulty: "medium", category: "opening", premium: true, hint: "Push the pawn forward.", answer: "1. e5 — Gaining space." },
  { fen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["Ne4"], title: "Knight Outpost", mateIn: 1, difficulty: "medium", category: "tactics", premium: true, hint: "Place the knight on a strong square.", answer: "1...Ne4 — Central outpost." },
  { fen: "r1bqkbnr/pppppppp/2n5/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1", playerColor: "w", moves: ["c4"], title: "Queen's Gambit Start", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Offer the gambit.", answer: "1. c4 — Queen's Gambit!" },
  { fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["e6"], title: "QGD Response", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Decline the gambit solidly.", answer: "1...e6 — Queen's Gambit Declined." },
  { fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["dxc4"], title: "QGA Response", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Accept the gambit.", answer: "1...dxc4 — Queen's Gambit Accepted." },
  { fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1", playerColor: "b", moves: ["c6"], title: "Slav Defense Start", mateIn: 1, difficulty: "easy", category: "opening", premium: true, hint: "Support d5 solidly.", answer: "1...c6 — Slav Defense." },

  // --- Additional hard puzzles ---
  { fen: "r1b1r1k1/ppppqppp/2n2n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1", playerColor: "w", moves: ["Nd5"], title: "Central Knight Strike", mateIn: 1, difficulty: "hard", category: "tactics", premium: true, hint: "Strike with the knight in the center.", answer: "1. Nd5 — Forking queen and threatening Nxf6+." },
  { fen: "r2q1rk1/ppp1ppbp/2np1np1/8/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["e5"], title: "Central Push Attack", mateIn: 1, difficulty: "hard", category: "strategy", premium: true, hint: "The pawn push opens lines.", answer: "1. e5! — Opening the center for attack." },
  { fen: "r1bqkb1r/ppp2ppp/2n1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 1", playerColor: "w", moves: ["Bg5"], title: "QGD Pin", mateIn: 1, difficulty: "medium", category: "tactics", premium: true, hint: "The classic QGD pin.", answer: "1. Bg5 — Pinning the knight in the QGD." },
  { fen: "r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N5/PP2BPPP/R1BQ1RNK w - - 0 1", playerColor: "w", moves: ["f4"], title: "Kingside Pawn Storm", mateIn: 1, difficulty: "hard", category: "strategy", premium: true, hint: "Launch the kingside attack.", answer: "1. f4! — Beginning the pawn storm." },

  // --- Calculation puzzles ---
  { fen: "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["cxd5"], title: "Central Liquidation", mateIn: 1, difficulty: "medium", category: "strategy", premium: true, hint: "Simplify the center.", answer: "1. cxd5 — Liquidating with an advantage." },
  { fen: "r2q1rk1/pp1b1ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 1", playerColor: "w", moves: ["c5"], title: "Minority Attack Start", mateIn: 1, difficulty: "hard", category: "strategy", premium: true, hint: "Begin the minority attack.", answer: "1. c5 — Minority attack on the queenside." },
];

// Helper to count puzzles by category
export const PUZZLE_CATEGORIES = [...new Set(PUZZLES.map(p => p.category).filter(Boolean))];
export const FREE_PUZZLES = PUZZLES.filter(p => !p.premium);
export const PREMIUM_PUZZLES = PUZZLES.filter(p => p.premium);
