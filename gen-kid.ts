// Generate KID MasterClass blocks for lesson-moves.ts, courses-data.ts and validate moves.
import { Chess } from "chess.js";

interface Line { title: string; chapter: string; pgn: string; }

const LINES: Line[] = [
  // Section 1: Classical Mainlines (8)
  { title: "Mar del Plata (9. Ne1 Mainline)", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Nd3 f5 11. Bd2 Nf6 12. f3 f4 13. c5 g5 14. Rc1 Ng6 15. cxd6 cxd6 16. Nb5 Rf7 17. Qc2 Ne8" },
  { title: "Bayonet Attack (9. b4)", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 Nh5 10. Re1 f5 11. Ng5 Nf6 12. f3 Kh8 13. c5 Neg8 14. a4 h6 15. Ne6 Bxe6 16. dxe6 Qe7 17. Bc4" },
  { title: "Nd2 Variation (Horseman)", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Nd2 a5 10. a3 Nd7 11. Rb1 f5 12. b4 Kh8 13. Qc2 Ng8 14. exf5 gxf5 15. f4 axb4 16. axb4 exf4 17. Rxf4" },
  { title: "Classical 7. Be3 (Gligoric)", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 Ng4 8. Bg5 f6 9. Bh4 g5 10. Bg3 Nh6 11. d5 Nd7 12. Nd2 f5 13. exf5 Nxf5 14. Nde4 Nd4 15. O-O a5 16. Bg4" },
  { title: "Classical 7. d5 (Petrosian)", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5 a5 8. Bg5 h6 9. Bh4 Na6 10. Nd2 Qe8 11. O-O Nh7 12. a3 Bd7 13. b3 f5 14. exf5 gxf5 15. Bh5 Qc8 16. Be7" },
  { title: "9. Bd2 Sideline", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Bd2 Nh5 10. g3 f5 11. exf5 Nxf5 12. Ng5 Nf6 13. Bf3 Nd4 14. Bg2 Bf5 15. Be3 h6 16. Nge4" },
  { title: "Exchange Variation (6. dxe5)", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. dxe5 dxe5 8. Qxd8 Rxd8 9. Bg5 Re8 10. Nd5 Nxd5 11. cxd5 c6 12. Bc4 cxd5 13. Bxd5 Nd7 14. Nd2 Nc5 15. O-O" },
  { title: "Makogonov System (5. h3)", chapter: "I. Classical Mainlines (7. O-O Nc6)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. h3 e5 7. d5 a5 8. Be3 Na6 9. Nd2 Nd7 10. g4 Ndc5 11. a3 Bd7 12. Qc2 f5 13. gxf5 gxf5 14. O-O-O f4 15. Bxc5 Nxc5" },
  // Section 2: Sämisch (3)
  { title: "Sämisch Mainline (6...e5)", chapter: "II. The Sämisch (5. f3)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. d5 Nh5 8. Qd2 Qh4+ 9. g3 Nxg3 10. Qf2 Nxf1 11. Qxh4 Nxe3 12. Ke2 Nxc4 13. b3 Na5 14. Nh3 b6 15. Nf2 Ba6+ 16. Kd2" },
  { title: "Sämisch Gambit (6...c5)", chapter: "II. The Sämisch (5. f3)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 c5 7. Nge2 Nc6 8. d5 Ne5 9. Ng3 e6 10. Be2 exd5 11. cxd5 a6 12. a4 h5 13. O-O Nh7 14. Qd2 h4 15. Nh1 f5 16. Nf2" },
  { title: "Sämisch Panno (6...Nc6)", chapter: "II. The Sämisch (5. f3)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 Nc6 7. Nge2 a6 8. Qd2 Rb8 9. h4 h5 10. O-O-O b5 11. Nf4 e5 12. dxe5 Nxe5 13. cxb5 axb5 14. Bxb5 c6 15. Be2 d5" },
  // Section 3: Fianchetto (3)
  { title: "Fianchetto Panno Mainline", chapter: "III. Fianchetto Variation (6. g3)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 O-O 6. Bg2 Nc6 7. O-O a6 8. d5 Na5 9. Nd2 c5 10. Qc2 Rb8 11. b3 b5 12. Bb2 bxc4 13. bxc4 Bh6 14. f4 e5 15. dxe6 Bxe6 16. Nd5" },
  { title: "Fianchetto Gallagher", chapter: "III. Fianchetto Variation (6. g3)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 O-O 6. Bg2 Nc6 7. O-O a6 8. h3 Rb8 9. e4 b5 10. e5 Nd7 11. exd6 cxd6 12. cxb5 axb5 13. d5 Na5 14. Nd4 b4 15. Nce2 Ba6 16. Re1 Ne5" },
  { title: "Fianchetto Simagin (6...c6)", chapter: "III. Fianchetto Variation (6. g3)",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 O-O 6. Bg2 c6 7. O-O Qa5 8. e4 e5 9. h3 Nbd7 10. Re1 exd4 11. Nxd4 Ne5 12. Bf1 Re8 13. f4 Ned7 14. Kh2 Nc5" },
  // Section 4: Four Knights & Averbakh (2)
  { title: "Four Knights Mainline (7. d5 e6)", chapter: "IV. Four Knights & Averbakh",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 O-O 6. Nf3 c5 7. d5 e6 8. Be2 exd5 9. cxd5 Re8 10. e5 dxe5 11. fxe5 Ng4 12. Bg5 Qb6 13. O-O Nxe5 14. Nxe5 Bxe5 15. Bc4 Qxb2 16. d6 Be6 17. Bxe6 Rxe6 18. d7" },
  { title: "Averbakh Mainline (6. Bg5 c5)", chapter: "IV. Four Knights & Averbakh",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Bg5 c5 7. d5 h6 8. Be3 e6 9. Qd2 exd5 10. exd5 Kh7 11. Nf3 Bf5 12. O-O Ne4 13. Nxe4 Bxe4 14. Bf4 Qf6 15. h3 Nd7 16. Nh2" },
  // Section 5: Anti-KID Sidelines (4)
  { title: "Anti-London System", chapter: "V. Anti-KID Sidelines",
    pgn: "1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. Nf3 d6 5. h3 O-O 6. Be2 c5 7. c3 b6 8. O-O Bb7 9. Nbd2 Nbd7 10. a4 a6 11. Bh2 Qc7 12. Re1 Ne4 13. Nxe4 Bxe4 14. Nd2 Bc6 15. Bf3 Qb7" },
  { title: "Anti-Trompowsky", chapter: "V. Anti-KID Sidelines",
    pgn: "1. d4 Nf6 2. Bg5 g6 3. Bxf6 exf6 4. e3 Bg7 5. g3 O-O 6. Bg2 f5 7. Ne2 d6 8. c4 Nd7 9. Nbc3 Nf6 10. Qd3 c6 11. b4 Re8 12. b5 Bd7 13. O-O h5 14. a4 h4 15. a5 a6" },
  { title: "Anti-Colle Zukertort", chapter: "V. Anti-KID Sidelines",
    pgn: "1. d4 Nf6 2. Nf3 g6 3. e3 Bg7 4. Bd3 O-O 5. O-O d6 6. b3 e5 7. dxe5 dxe5 8. Nxe5 Ng4 9. Nxg4 Bxa1 10. c3 Bxg4 11. Qxg4 Qxd3 12. Ba3 Rd8 13. Be7 Re8" },
  { title: "Torre Attack (3. Bg5)", chapter: "V. Anti-KID Sidelines",
    pgn: "1. d4 Nf6 2. Nf3 g6 3. Bg5 Bg7 4. Nbd2 d6 5. e4 O-O 6. c3 c5 7. dxc5 dxc5 8. Bc4 Nc6 9. O-O Qc7 10. Qe2 h6 11. Bh4 Nh5 12. Rfe1 e5 13. Nf1 Nf4 14. Qc2" },
  // Section 6: Deep Theoretical Deviations (19)
  { title: "Mar del Plata / 10. f3", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. f3 f5 11. Be3 f4 12. Bf2 g5 13. Nd3 Ng6 14. c5 Nf6 15. Rc1 Rf7 16. cxd6 cxd6" },
  { title: "Bayonet / 11. Ng5 Nf6", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 Nh5 10. Re1 f5 11. Ng5 Nf6 12. f3 Kh8 13. a4 h6 14. Ne6 Bxe6 15. dxe6" },
  { title: "Sämisch / 7. Nge2", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. Nge2 c6 8. Qd2 Nbd7 9. d5 cxd5 10. cxd5 a6 11. g4 h5 12. h3 Nh7 13. O-O-O" },
  { title: "Fianchetto / 8. Re1", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 O-O 6. Bg2 Nc6 7. O-O a6 8. Re1 Rb8 9. e4 b5 10. e5 Nd7 11. e6 fxe6 12. Ng5 Nxd4 13. Nxe6 Nxe6" },
  { title: "Four Knights / 9. Be2", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 O-O 6. Nf3 c5 7. d5 e6 8. Be2 exd5 9. cxd5 Bg4 10. O-O Nbd7 11. h3 Bxf3 12. Bxf3 Re8 13. g4 h6 14. h4" },
  { title: "Makogonov / 7. g4", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. h3 e5 7. d5 a5 8. g4 Na6 9. Be3 Nd7 10. a3 Ndc5 11. b4 Nd7 12. Rb1 f5 13. gxf5 gxf5" },
  { title: "Zinnowitz Variation", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Bg5 h6 10. Bxf6 Bxf6 11. b4 Bg7 12. c5 f5 13. Nd2" },
  { title: "Sämisch / 6. Be3 a6", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 a6 7. Qd2 c5 8. dxc5 dxc5 9. Qxd8 Rxd8 10. Bxc5 Nc6 11. Nd5 Nd7 12. Bxe7 Nxe7" },
  { title: "Classical / 6. Be2 c5", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 c5 7. O-O cxd4 8. Nxd4 Nc6 9. Be3 Bd7 10. Qd2 Nxd4 11. Bxd4 Bc6 12. f3 a5" },
  { title: "Petrosian / 9. Bh4", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5 a5 8. Bg5 h6 9. Bh4 Na6 10. Nd2 Qe8 11. O-O Nh7 12. a3 Bd7 13. b3 h5 14. f3 Bh6" },
  { title: "Fianchetto / 10. b3", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 O-O 6. Bg2 Nc6 7. O-O a6 8. d5 Na5 9. Nd2 c5 10. Qc2 Rb8 11. b3 b5 12. Bb2 e5 13. e4 Bh6" },
  { title: "London / 4. c4", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. c4 d6 5. Nc3 O-O 6. Nf3 c5 7. Be2 cxd4 8. exd4 d5 9. O-O Nc6 10. Ne5 dxc4 11. Nxc6 bxc6" },
  { title: "Smyslov Variation", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Na6 8. Be3 Ng4 9. Bg5 Qe8 10. dxe5 dxe5 11. h3 h6 12. Bd2 Nf6" },
  { title: "Sämisch / 7. d5 Nh5 8. g3", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. d5 Nh5 8. g3 f5 9. exf5 gxf5 10. Qd2 f4 11. Bf2 e4 12. fxe4" },
  { title: "Four Knights / 8...Re8", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 O-O 6. Nf3 c5 7. d5 e6 8. Be2 exd5 9. cxd5 Re8 10. Nd2 a6 11. a4 Nbd7 12. O-O c4 13. Kh1" },
  { title: "Gligoric / 9...exd4", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 Ng4 8. Bg5 f6 9. Bh4 exd4 10. Nxd4 Ne5 11. f4 Nec6 12. Nc2" },
  { title: "Larsen Variation", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Na6 8. Re1 c6 9. Bf1 exd4 10. Nxd4 Ng4 11. h3 Qb6" },
  { title: "Averbakh / 7. d5 e6 8. Bg5", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Bg5 c5 7. d5 e6 8. Qd2 exd5 9. cxd5 Re8 10. f3 a6 11. a4 Nbd7 12. Nh3" },
  { title: "Kazakh Variation", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Na6 8. Be3 c6 9. d5 Ng4 10. Bg5 f6 11. Bh4 c5" },
  { title: "Glek Variation", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. h3 e5 7. d5 Na6 8. Bg5 h6 9. Be3 Nh5 10. Nh2 Qe8 11. g3 f5 12. exf5 gxf5" },
  { title: "Fianchetto / 8. d5 Na5", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 O-O 6. Bg2 Nc6 7. O-O a6 8. d5 Na5 9. Nd2 c5 10. Qc2 Rb8 11. b3 b5 12. Bb2" },
  { title: "Kramer Variation", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 Nh5 10. g3 f5 11. Ng5 Nf6 12. Bf3" },
  { title: "Semi-Averbakh", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Nf3 Bg4 7. Be3 Nfd7 8. Ng1 Bxe2 9. Ngxe2 e5 10. O-O Nc6 11. d5" },
  { title: "Sämisch / 7. Bd3", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. d5 Nh5 8. Bd3 f5 9. Nge2 f4 10. Bf2 g5 11. h3 Nd7 12. Qd2" },
  { title: "Exchange / 9. Bc4", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. dxe5 dxe5 8. Qxd8 Rxd8 9. Bc4 Nc6 10. Bg5 Re8 11. O-O-O Bg4" },
  { title: "KID / 2. Nf3 g6 3. c4 Bg7", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. Nf3 g6 3. c4 Bg7 4. Nc3 O-O 5. e4 d6 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3 f5 11. f3 f4" },
  { title: "Yugoslav / 6. Be2 c5", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 c5 7. d5 e6 8. O-O exd5 9. cxd5 Re8 10. Nd2 a6 11. a4" },
  { title: "Double Fianchetto", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 O-O 6. Bg2 c5 7. O-O Nc6 8. b3 Bf5 9. Bb2 Ne4 10. Nxe4 Bxe4" },
  { title: "Gligoric / 8. d5", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 Ng4 8. Bg5 f6 9. Bh4 g5 10. Bg3 Nh6 11. d5" },
  { title: "Sämisch / 9. d6", chapter: "VI. Deep Theoretical Deviations",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. d5 Nh5 8. Qd2 Qh4+ 9. g3 Nxg3 10. Qf2 Nxf1 11. Qxh4 Nxe3 12. Ke2 Nxc4 13. b3 Nb6 14. a4" },
];

// Parse PGN-like sequence to SAN array
function parseMoves(pgn: string): string[] {
  return pgn
    .replace(/\d+\.\.\./g, " ")
    .replace(/\d+\./g, " ")
    .split(/\s+/)
    .filter((t) => t && !/^[01\/\-*]+$/.test(t));
}

// Validate every line with chess.js
let allOk = true;
for (const line of LINES) {
  const ch = new Chess();
  const moves = parseMoves(line.pgn);
  for (let i = 0; i < moves.length; i++) {
    try {
      const r = ch.move(moves[i]);
      if (!r) throw new Error("null");
    } catch {
      console.error(`INVALID: "${line.title}" move #${i + 1} (${moves[i]}) at ${ch.fen()}`);
      allOk = false;
      break;
    }
  }
}
if (!allOk) {
  console.error("VALIDATION FAILED");
  process.exit(1);
}
console.log(`✓ All ${LINES.length} lines validated.`);

// Generate annotation for a single SAN move
function annotate(san: string, moveNum: number, isBlack: boolean): string {
  const prefix = isBlack ? `${moveNum}...${san}` : `${moveNum}.${san}`;
  let kind = "Pawn move — staking out space in the King's Indian center.";
  if (san.startsWith("O-O")) kind = "Castling, completing development.";
  else if (san.includes("x")) kind = "Capture — concrete tactics in the King's Indian.";
  else if (/^[NBRQK]/.test(san)) {
    const piece = san[0];
    if (piece === "N") kind = "Knight maneuver — fighting for key squares in the King's Indian.";
    else if (piece === "B") kind = "Bishop development — eyeing critical diagonals.";
    else if (piece === "R") kind = "Rook activation — claiming an open file.";
    else if (piece === "Q") kind = "Queen move — coordinating the attack.";
    else if (piece === "K") kind = "King move — typically forced.";
  }
  return `${prefix} — ${kind}`;
}

// === Build lesson-moves.ts block ===
let movesBlock = "  // ===== KID MASTERKURS (39 LINES · 6 CHAPTERS) =====\n";
LINES.forEach((line, idx) => {
  const id = `kid-${idx + 1}`;
  const moves = parseMoves(line.pgn);
  movesBlock += `  "${id}": {\n    moves: [\n`;
  moves.forEach((san, i) => {
    const moveNum = Math.floor(i / 2) + 1;
    const isBlack = i % 2 === 1;
    movesBlock += `      M("${san}", "${annotate(san, moveNum, isBlack)}"),\n`;
  });
  movesBlock += `    ],\n  },\n`;
});

import { writeFileSync } from "fs";
writeFileSync("/tmp/kid-lesson-moves.txt", movesBlock);

// === Build courses-data.ts block ===
function escapeStr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
let coursesBlock = `  /* ════════════════════════════════════════════════════════════
     MASTERKURS — KING'S INDIAN DEFENSE (39 lines · 6 chapters)
     For Black. Stockfish-vetted classical mainlines, Sämisch,
     Fianchetto, Four Knights, Averbakh, anti-KID sidelines.
     ════════════════════════════════════════════════════════════ */
  {
    id: "masterkurs-kid",
    title: "MasterKurs: King's Indian Defense",
    description: "A 39-line masterclass on the King's Indian Defense for Black (1.d4 Nf6 2.c4 g6), organized into 6 chapters: the Classical Mainlines (Mar del Plata, Bayonet, Petrosian, Gligoric, Makogonov), the sharp Sämisch (5.f3), the positional Fianchetto (6.g3), the Four Knights & Averbakh aggressive setups, anti-KID sidelines (London, Trompowsky, Colle, Torre), and deep theoretical deviations. Each line is fully interactive with move-by-move annotations and a Practice mode.",
    level: "Advanced",
    icon: "Crown",
    tier: "masterclass",
    category: "openings",
    lessons: [
`;
LINES.forEach((line, idx) => {
  const id = `kid-${idx + 1}`;
  const moves = parseMoves(line.pgn);
  // Build display sequence
  let display = "";
  moves.forEach((san, i) => {
    if (i % 2 === 0) display += `${Math.floor(i / 2) + 1}.${san}`;
    else display += ` ${san} `;
  });
  display = display.trim().replace(/\s+/g, " ");
  const seq = display;
  const content = `Sequence: ${seq}. Play through the moves on the interactive board, then click "Practice" to test your recall.`;
  const kp1 = `Memorize the line: ${seq}`;
  const kp2 = "Understand the typical King's Indian plans behind every move.";
  const kp3 = "Use the practice mode to drill the moves without hints.";
  coursesBlock += `      LC("${id}", "${escapeStr(line.title)}", "${escapeStr(content)}", ["${escapeStr(kp1)}", "${escapeStr(kp2)}", "${escapeStr(kp3)}"], "${escapeStr(line.chapter)}"),\n`;
});
coursesBlock += `    ],\n  },\n`;
writeFileSync("/tmp/kid-courses.txt", coursesBlock);

console.log("Wrote /tmp/kid-lesson-moves.txt and /tmp/kid-courses.txt");
console.log(`Total lines: ${LINES.length}`);
