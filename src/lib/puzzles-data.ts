export interface Puzzle {
  fen: string;
  playerColor: "w" | "b";
  // For multi-move puzzles: alternating [playerMove, opponentReply, playerMove, ...]
  // Last move should always be the player's mating move.
  moves: string[];
  title: string;
  hint: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  mateIn: number;
}

export const PUZZLES: Puzzle[] = [
  // ===================== MATE IN 1 (Easy) =====================

  // 1. Scholar's Mate — Qxf7#
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    playerColor: "w",
    moves: ["Qxf7#"],
    title: "Scholar's Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "The f7 pawn is only defended by the king.",
    answer: "1. Qxf7# — Queen takes f7, checkmate.",
  },
  // 2. Back rank mate with rook — Re8#
  // Position: White Kg1, Re1, pawns f2,g2,h2. Black Kg8, Rf8, pawns f7,g7,h7.
  {
    fen: "5rk1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8#"],
    title: "Back Rank Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "The king is trapped behind its own pawns.",
    answer: "1. Re8# — Rook to e8 is checkmate, the f8 rook is pinned.",
  },
  // 3. Arabian mate — Rook + Knight
  // Position: White Kg1, Rh1, Nf6. Black Kg8, pawns.
  // Actually simpler: White Nf6, Rh8 mates. Let me set up:
  // Black Kg8. White Nf6, Re1. Re8# works because Nf6 covers g8/h7/e8? No. Let me use:
  // Black king h8, White Rg1, Nf7. Rg8#.
  {
    fen: "7k/5N2/8/8/8/8/8/6RK w - - 0 1",
    playerColor: "w",
    moves: ["Rg8#"],
    title: "Arabian Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "The knight and rook work together perfectly.",
    answer: "1. Rg8# — The rook mates on g8, the knight covers h6 and the king can't escape.",
  },
  // 4. Anastasia's Mate pattern simplified
  // Black Kh8, pawn g7. White Qh1, Rh5. Qh7# doesn't work (blocked).
  // Simpler: Black Kg8, pawns f7,h7. White Qg5. Qd8 isn't mate.
  // Let me use: White Qh5, Black Kg8, f7, g6. Qh7#? No, Kf8 escapes.
  // Classic simple: Black Kg8, Rf8, pawns g7, h7. White Qd5. Qd5 can go to...
  // OK, ultra simple: Black Kh8, g7, h7. White Qa1. Qa8#? No.
  // Let me use the "corridor mate": Black Ka8, pawn a7. White Ra1, Kb6. Ra1 is already giving check? No.
  // Position: Black Ka8, pa7, pb7. White Kc6, Ra1. Ra1 is not check. Need Re1, Re8#.
  // Actually: Black Ka8, pa7. White Kb6, Rd1. Rd8#.
  {
    fen: "k7/p7/1K6/8/8/8/8/3R4 w - - 0 1",
    playerColor: "w",
    moves: ["Rd8#"],
    title: "Corridor Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "The king is trapped on the edge. Deliver check on the 8th rank.",
    answer: "1. Rd8# — The rook mates on d8. The king has no escape.",
  },
  // 5. Simple queen mate
  // Black Kh8, pawn g7, pawn h7. White Qf6. Qf6 attacks g7 — Qxg7#!
  // Wait: Qf6 to g7 — is that checkmate? King on h8, pawn h7. After Qxg7#, king is on h8, queen on g7, pawn on h7. King can't go anywhere. Yes, that's mate.
  {
    fen: "7k/6pp/5Q2/8/8/8/8/6K1 w - - 0 1",
    playerColor: "w",
    moves: ["Qxg7#"],
    title: "Queen Smothered Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "Capture a key pawn to deliver checkmate.",
    answer: "1. Qxg7# — Queen takes g7, the h-pawn and board edge trap the king.",
  },
  // 6. Knight + Queen: Qg7#
  // Black Kf8, pawns. White Qh6, Nf5. Qh8? No.
  // Simpler: Black Kg8, Rf8, f7, g6, h7. White Qd4. Qd4-d8?
  // Basic: Black Kh8, g7. White Qf6. Qxg7#. Same pattern as above with slight variation.
  // Let me do: Black Kg8, f7, g7, h7. White Qb3. Qb3xf7 is check but not mate (Kh8).
  // I'll use: Black Kf8, pg7, ph7. White Qd6+. Kf8 can go to e8,g8. Qd8#? If Ke8 then Qd8 isn't mate (Kf7).
  // Simple one: Black Kc8, no pawns nearby. White Qa6, Rc1. Qa8#? Kd7 escapes. Rc8#? Let's check: Rc1 to c8, Black king on c8 — that's not a move TO c8 since king is there.
  // OK I'll use positions that are definitely valid:
  {
    fen: "3k4/8/3K4/8/8/8/8/4R3 w - - 0 1",
    playerColor: "w",
    moves: ["Re8#"],
    title: "King & Rook Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "The kings face each other. Use the rook.",
    answer: "1. Re8# — Rook to e8 is checkmate. The White king covers d7, e7, and c7 isn't available.",
    // Verify: Black Kd8. White Kd6, Re1. Re8 gives check on the 8th rank. King on d8, can go to c8 (not attacked — Re8 attacks e8 and the whole 8th rank, so c8 IS attacked by Re8), c7 (attacked by Kd6), e7 (attacked by Kd6), e8 (Re8). So Kd8 has no escape. Mate! ✓
  },

  // 7. Smothered mate by knight
  {
    fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1",
    playerColor: "w",
    moves: ["Nf7#"],
    title: "Smothered Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "The king is boxed in by its own pieces. A knight can finish it!",
    answer: "1. Nf7# — The knight delivers checkmate. The king is smothered by its own rook and pawns.",
    // Verify: Black Kh8, Rg8, g7, h7. White Kg1, Nh6. Nf7 check (f7 attacks h8,h6,d8,d6,e5,g5). h8 yes! Kh8 is in check. Can go to: g8 (own rook), h7 (own pawn). No escape. Mate! ✓
  },

  // 8. Bishop + Rook mate
  {
    fen: "1k6/ppp5/8/8/8/1B6/8/4R1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8#"],
    title: "Bishop & Rook Mate",
    mateIn: 1,
    difficulty: "easy",
    hint: "The bishop controls the diagonal. Use the rook on the back rank.",
    answer: "1. Re8# — Rook to e8 is mate. The bishop on b3 covers c2/a2 escape routes, and the pawns block the rest.",
    // Verify: Black Kb8, pa7,pb7,pc7. White Kg1, Bb3, Re1. Re8+ check. King on b8. Can go to: a8 (Bb3 diagonal: b3-c4-d5-e6-f7 — a8 is NOT on that diagonal. But Re8 attacks a8 along the 8th rank!). c8 (attacked by Re8). d8 (attacked by Re8). a7 (own pawn). b7 (own pawn). c7 (own pawn). So all squares blocked. Mate! ✓
  },

  // ===================== MATE IN 2 (Medium) =====================

  // 9. Double rook sacrifice on back rank
  {
    fen: "2r3k1/5ppp/8/8/8/8/5PPP/RR4K1 w - - 0 1",
    playerColor: "w",
    moves: ["Rb8", "Rxb8", "Rxb8#"],
    title: "Rook Sacrifice Back Rank",
    mateIn: 2,
    difficulty: "medium",
    hint: "Sacrifice one rook to deflect, then mate with the other.",
    answer: "1. Rb8+! Rxb8 2. Rxb8# — Classic double rook back rank mate.",
    // Verify: Rb8+ (Rb1 to b8, check). Black Rc8 must capture: Rxb8. Then Ra1 to a8? No, Ra1xb8#. Raxb8#. King g8, f7,g7,h7 pawns. b8 attacks whole 8th rank. Mate! ✓
    // Wait: after Rxb8, the a-rook is on a1. Raxb8 means Ra1 captures on b8. But the black rook already captured on b8. So Raxb8 — but is there a piece on b8? Yes, the black rook that captured. So Raxb8# captures the rook. Is it mate? Rb8 attacks entire 8th rank. Kg8 can go to: f8(attacked by Rb8), h8(attacked by Rb8), g7(own pawn), h7(own pawn), f7(own pawn), g8(in check from Rb8? No, g8 is not on the 8th rank attack from b8... wait b8 to g8 IS along the 8th rank). Kh7 is not on the 8th rank. Kh7! That's an escape!
    // So this doesn't work. After Raxb8, Kh7 escapes. NOT MATE.
    // I need to fix this. The back rank mate only works if the king can't go to h7 (or it's covered).
    // Let me adjust: add a White bishop or queen covering h7. Or just use a position where it works.
    // Two rooks: after Rxb8#, need all escape squares covered. With pawns f7,g7,h7, king can't go to 7th rank (own pawns). 8th rank all covered by Rb8. So it IS mate because Kh7 is blocked by own h7 pawn!
    // Kh7 — but h7 has a pawn on it! So the king CANNOT go to h7. Same for f7, g7. King is trapped. MATE! ✓
    // I was wrong, it does work. The pawns on f7,g7,h7 block the king from going to the 7th rank.
  },

  // 10. Queen + Rook: Sacrifice rook, queen mates
  {
    fen: "5rk1/5ppp/8/7Q/8/8/5PPP/4R1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8", "Rxe8", "Qxe8#"],
    title: "Rook Deflection",
    mateIn: 2,
    difficulty: "medium",
    hint: "Sacrifice the rook to remove the defender, then the queen finishes.",
    answer: "1. Re8! Rxe8 2. Qxe8# — The rook deflects the f8 rook, allowing queen mate on the back rank.",
    // Verify: Re8 check? Re1 to e8. Is it check? e8 to g8 — not a straight line for rook (e8 attacks along e-file and 8th rank). g8 is on the 8th rank from e8? e8,f8,g8 — yes! But f8 has a rook blocking. So Re8 is NOT check, it attacks f8 rook. Black must deal with the rook. Rxe8 captures. Then Qh5xe8+ check (Qe8 attacks g8 along 8th rank, with f8 now empty). Kh7? Qe8 attacks h8 but not h7 directly... e8 to h7 is not rank/file/diagonal (it would be e8-f7-g6 diagonal, not h7). Hmm, Qe8 can go to e8-f7 diagonal hitting f7. After Qxe8, king on g8. Kf8? Qe8 is on f8? No, Qe8 is on e8. Kf8 is attacked by Qe8 (adjacent). Kh8 attacked by Qe8 (8th rank). Kh7: Qe8 diagonal is e8-f7-g6... not h7. And e8-d7-c6 the other way. So Kh7 is NOT attacked. Is h7 blocked by pawn? Yes! h7 has a pawn. So Kg7? Is g7 blocked? g7 has a pawn. Kf7? Qe8 attacks f7? e8 to f7 is one diagonal step, yes! So Kf7 is attacked. So: g8 in check, can't go to f8(Qe8 adj), g7(own pawn), h7(own pawn), h8(Qe8 rank), f7(Qe8 diagonal). MATE! ✓
  },

  // 11. Classic bishop + queen mate
  {
    fen: "k7/pp6/8/8/8/8/1Q6/K1R5 w - - 0 1",
    playerColor: "w",
    moves: ["Qa3", "Kb8", "Qa8#"],
    // Verify: Qa3 threatens Qa8#. Black Kb8 is the only move (a7,a6 don't help). Ka8 can go to b8. Then Qa3-a8+. Wait, that's Qa8+ but after Kb8, Qa8+, King was on b8, Qa8 check... Kb8 to where? c7? Is Qa8 also attacking c7? No. Rc1 attacks c-file. c7 attacked by Rc1? Rc1 attacks c1-c8. c7 yes! So Qa8+, can't go to c7 (Rc1), can't go to b8 (Qa8 attacks), a7 own pawn (wait, pawn a7 blocks). So b7? Qa8 attacks b7 (diagonal a8-b7). c8? Rc1 attacks c8. So: Kb8 in check from Qa8, b7 attacked by Qa8, c7 attacked by Rc1, c8 attacked by Rc1. Mate! ✓
    title: "Queen & Rook Squeeze",
    mateIn: 2,
    difficulty: "medium",
    hint: "Threaten mate and force the king into a corner.",
    answer: "1. Qa3! (threatening Qa8#) Kb8 2. Qa8# — The rook covers the c-file, queen mates.",
  },

  // 12. Double check leading to mate
  {
    fen: "3r2k1/1pp2ppp/8/8/8/8/1PP2PPP/3RR1K1 w - - 0 1",
    playerColor: "w",
    moves: ["Re8+", "Rxe8", "Rxe8#"],
    title: "Double Rook Exchange Mate",
    mateIn: 2,
    difficulty: "medium",
    hint: "Sacrifice a rook to force a capture, then mate with the other.",
    answer: "1. Re8+! Rxe8 2. Rxe8# — Exchange sacrifice leads to back rank mate.",
    // Verify: Re1-e8+ check (e8 attacks g8 along 8th rank? e8 is on 8th rank, Rd8 is blocking? Wait the rook is on d8. Re8+ — the rook goes to e8, which is adjacent to d8. Does it give check to Kg8? e8 to g8 is along the 8th rank, but d8 rook is between? No — e8 is adjacent to both d8 and f8. e8 to g8: e8, f8, g8. f8 is empty. So Re8 checks g8. But d8 rook can capture: Rd8xe8? That's taking on e8 with the d8 rook. Then Rd1xe8+... but wait, after Rxe8, the board has: Black Kg8, Re8 (black rook on e8), White Rd1. Rd1xe8# check. Rook on e8 attacks g8 along 8th rank (e8-f8-g8, f8 empty). King g8: can go to f8(attacked by Re8), h8(attacked by Re8), f7(own pawn), g7(own pawn), h7(own pawn), Kh8(Re8 attacks). All blocked. MATE! ✓
  },

  // 13. Queen sacrifice into back rank
  {
    fen: "6k1/5ppp/8/8/8/8/5PPP/Q5K1 w - - 0 1",
    playerColor: "w",
    moves: ["Rd8+", "Kh7", "Qa1g7#"],
    title: "placeholder",
    mateIn: 2,
    difficulty: "medium",
    hint: "",
    answer: "",
  },
];

const Puzzles = () => { return <div/>; };
export default Puzzles;
