import { MoveStep } from "@/components/learn/InteractiveBoard";

/**
 * A single named variation with its own board and moves.
 */
export interface LessonVariation {
  name: string;
  startFen?: string;
  moves: MoveStep[];
}

/**
 * Maps lesson IDs to interactive move sequences.
 * Each entry can have:
 * - A single set of moves (backward compat)
 * - Multiple named variations, each with its own board
 */
export interface LessonMoveData {
  startFen?: string;
  moves: MoveStep[];
  variations?: LessonVariation[];
}

const M = (san: string, explanation: string): MoveStep => ({ san, explanation });

/** Helper to create a named variation */
const V = (name: string, moves: MoveStep[], startFen?: string): LessonVariation => ({
  name,
  startFen,
  moves,
});

export const LESSON_MOVES: Record<string, LessonMoveData> = {
  // ===== OPENING FUNDAMENTALS =====
  "of-1": {
    moves: [
      M("e4", "1.e4 — White stakes a claim in the center, controlling d5 and f5."),
      M("e5", "1...e5 — Black mirrors, controlling d4 and f4."),
      M("d4", "2.d4 — White immediately occupies both central squares!"),
      M("exd4", "2...exd4 — Black captures but opens the center."),
      M("Qxd4", "3.Qxd4 — White recaptures with a central queen (not ideal, but shows center control)."),
    ],
  },
  "of-2": {
    moves: [
      M("e4", "1.e4 — Control the center."),
      M("e5", "1...e5 — Classical response."),
      M("Nf3", "2.Nf3 — Develop the knight toward the center, attacking e5."),
      M("Nc6", "2...Nc6 — Black defends e5 and develops."),
      M("Bc4", "3.Bc4 — Bishop develops to an active diagonal targeting f7."),
      M("Bc5", "3...Bc5 — Black mirrors with an active bishop development."),
    ],
  },
  "of-3": {
    startFen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("O-O", "4.O-O — Castle kingside! King is safe behind pawns, rook is activated."),
      M("O-O", "4...O-O — Black also castles. Both kings are now safe."),
      M("d3", "5.d3 — Support the center and prepare to develop the bishop."),
      M("d6", "5...d6 — Black solidifies the center."),
    ],
  },
  "of-4": {
    moves: [
      M("e4", "1.e4 — Open the game."),
      M("e5", "1...e5 — Classical response."),
      M("Nf3", "2.Nf3 — Attack e5, develop toward center."),
      M("Nc6", "2...Nc6 — Defend e5."),
      M("Bc4", "3.Bc4 — The Italian Game! The bishop targets f7, the weakest square."),
      M("Bc5", "3...Bc5 — The Giuoco Piano (Quiet Game). Both sides develop."),
      M("c3", "4.c3 — Preparing the powerful d4 advance."),
      M("Nf6", "4...Nf6 — Black develops and pressures e4."),
      M("d4", "5.d4! — The key central break! White seizes the center."),
    ],
  },
  "of-5": {
    moves: [
      M("e4", "1.e4 — White claims the center."),
      M("c5", "1...c5 — The Sicilian Defense! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — Develop and prepare d4."),
      M("d6", "2...d6 — Black supports the center and prepares ...Nf6."),
      M("d4", "3.d4 — Open the center."),
      M("cxd4", "3...cxd4 — Black opens the c-file for counterplay."),
      M("Nxd4", "4.Nxd4 — The Open Sicilian. The most critical and popular position."),
    ],
  },
  "of-6": {
    moves: [
      M("e4", "1.e4 — Good: control the center."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3 — Good: develop a NEW piece."),
      M("Nc6", "2...Nc6 — Good: develop a new piece."),
      M("Bc4", "3.Bc4 — Good: another NEW piece developed."),
      M("Nf6", "3...Nf6 — Good: another new piece."),
      M("d3", "4.d3 — Supporting the center, preparing further development."),
      M("Bc5", "4...Bc5 — Every move brings a new piece into the game!"),
    ],
  },
  "of-7": {
    moves: [
      M("e4", "1.e4 — Good start."),
      M("e5", "1...e5."),
      M("Qh5", "2.Qh5?! — Bad! The queen comes out too early. It's vulnerable to attacks."),
      M("Nc6", "2...Nc6 — Black develops with tempo — the queen will need to move again."),
      M("Bc4", "3.Bc4 — Threatening Qxf7# (Scholar's Mate)."),
      M("g6", "3...g6! — Defends calmly. Now the queen must retreat."),
      M("Qf3", "4.Qf3 — The queen retreats. White has wasted two moves on the queen already!"),
      M("Nf6", "4...Nf6 — Black develops naturally and has a better position."),
    ],
  },
  "of-8": {
    moves: [
      M("e4", "1.e4 — Open the game."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3 — Knight developed."),
      M("Nc6", "2...Nc6."),
      M("Bc4", "3.Bc4 — Bishop developed."),
      M("Bc5", "3...Bc5."),
      M("O-O", "4.O-O — Castle! King is safe."),
      M("Nf6", "4...Nf6."),
      M("d3", "5.d3 — Now the last minor piece can develop."),
      M("O-O", "5...O-O."),
      M("Be3", "6.Be3 — All minor pieces developed, rooks are now connected along the first rank!"),
    ],
  },
  "of-9": {
    moves: [
      M("e4", "1.e4 — First pawn move: control the center. Good."),
      M("e5", "1...e5."),
      M("d4", "2.d4 — Second pawn move: claim more center space. Still fine."),
      M("exd4", "2...exd4."),
      M("Qxd4", "3.Qxd4 — Recapture (note: queen comes out early here — not ideal)."),
      M("Nc6", "3...Nc6 — Attacks the queen with tempo!"),
    ],
  },
  "of-10": {
    moves: [
      M("f3", "1.f3? — A terrible first move. Weakens the king and doesn't help development."),
      M("e5", "1...e5 — Black develops normally."),
      M("g4", "2.g4?? — Blunder! Opens the diagonal to the king."),
      M("Qh4#", "2...Qh4# — Checkmate! The fastest possible checkmate (Fool's Mate)."),
    ],
  },
  "of-11": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Qh5", "2.Qh5 — Scholar's Mate attempt begins: threatening Qxe5+ and eyeing f7."),
      M("Nc6", "2...Nc6 — Defends e5 and develops."),
      M("Bc4", "3.Bc4 — Now threatening Qxf7#!"),
      M("g6", "3...g6! — The correct defense. Blocks the queen."),
      M("Qf3", "4.Qf3 — Still eyeing f7..."),
      M("Nf6", "4...Nf6! — Blocks the diagonal AND develops. White's attack is over."),
    ],
  },
  "of-12": {
    moves: [
      M("e4", "1.e4."),
      M("g6", "1...g6 — Preparing the fianchetto."),
      M("d4", "2.d4 — White takes the center."),
      M("Bg7", "2...Bg7 — The fianchetto! The bishop sits on the long diagonal a1-h8."),
      M("Nc3", "3.Nc3."),
      M("d6", "3...d6 — A flexible setup. The Bg7 controls the center from a distance."),
    ],
  },
  "of-13": {
    moves: [
      M("e4", "1.e4 — Opens lines for the bishop and queen. Leads to open, tactical games."),
      M("e5", "1...e5 — The classical response. Symmetric and principled."),
    ],
  },
  "of-14": {
    moves: [
      M("e4", "1.e4 — White's most popular first move."),
      M("e5", "1...e5 — Classical: symmetric center play."),
    ],
  },
  "of-15": {
    moves: [
      M("d4", "1.d4 — The queen's pawn opening. Strategic and solid."),
      M("d5", "1...d5 — The classical response: directly contesting the center."),
      M("c4", "2.c4 — The Queen's Gambit! Challenging Black's center."),
    ],
  },
  "of-16": {
    moves: [
      M("e4", "1.e4 — One tempo spent: useful move, controls center."),
      M("e5", "1...e5 — One tempo: equally useful."),
      M("Nf3", "2.Nf3 — Second tempo: develops AND attacks e5."),
      M("Nc6", "2...Nc6 — Second tempo: develops AND defends."),
      M("Bc4", "3.Bc4 — Third tempo: develops to active square."),
      M("Nf6", "3...Nf6 — Third tempo: develops and attacks e4."),
    ],
  },
  "of-17": {
    startFen: "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("dxc5", "8.dxc5 — Creating a weakness: the isolated d5 pawn."),
      M("Bxc5", "8...Bxc5 — Black recaptures but d5 is now isolated."),
      M("b4", "9.b4! — Attacking the bishop AND preparing to create a second weakness on the queenside."),
      M("Bd6", "9...Bd6 — Bishop retreats."),
      M("a4", "10.a4 — Now Black must worry about both the d5 pawn AND the queenside advance."),
    ],
  },
  "of-18": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("Nc6", "2...Nc6."),
      M("Bb5", "3.Bb5 — The Ruy Lopez."),
      M("a6", "3...a6 — Challenging the bishop."),
      M("Ba4", "4.Ba4 — Bishop retreats but stays active."),
      M("Nf6", "4...Nf6."),
      M("O-O", "5.O-O."),
      M("b5", "5...b5! — Forcing the bishop back."),
      M("Bb3", "6.Bb3 — The bishop looks safe here..."),
      M("Na5", "6...Na5! — Threatens to trap the bishop with ...c5-c4!"),
    ],
  },
  "of-19": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("d6", "2...d6 — Philidor Defense."),
      M("Bc4", "3.Bc4 — Targeting f7."),
      M("Bg4", "3...Bg4? — Looks natural but allows the Legal Trap!"),
      M("Nc3", "4.Nc3."),
      M("g6", "4...g6? — A mistake."),
      M("Nxe5", "5.Nxe5! — The trap begins! Sacrificing the queen."),
      M("Bxd1", "5...Bxd1?? — Taking the bait..."),
      M("Bxf7+", "6.Bxf7+ — Check!"),
      M("Ke7", "6...Ke7 — Only move."),
      M("Nd5#", "7.Nd5# — Checkmate! The Legal Trap in action."),
    ],
  },
  "of-20": {
    moves: [
      M("d4", "1.d4."),
      M("e5", "1...e5?! — The Englund Gambit. Dubious but trappy."),
      M("dxe5", "2.dxe5 — Accepting the gambit."),
      M("Nc6", "2...Nc6 — Developing and eyeing e5."),
      M("Nf3", "3.Nf3 — Defending e5."),
      M("Qe7", "3...Qe7 — Pressure on e5."),
      M("Bf4", "4.Bf4?? — Looks natural but loses!"),
      M("Qb4+", "4...Qb4+! — Fork! Attacks the king AND the bishop. White loses a piece."),
    ],
  },
  "of-21": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5 — Symmetric."),
      M("Nf3", "2.Nf3."),
      M("Nf6", "2...Nf6 — Still symmetric. (Petrov Defense)"),
      M("Nxe5", "3.Nxe5! — White exploits the first-move advantage to win a pawn temporarily."),
      M("d6", "3...d6 — Breaking the symmetry."),
      M("Nf3", "4.Nf3 — The knight retreats. White used the tempo advantage to create an imbalance."),
    ],
  },
  "of-22": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("f4", "2.f4 — The King's Gambit! White offers a pawn."),
      M("exf4", "2...exf4 — Black accepts the gambit."),
      M("Nf3", "3.Nf3 — White develops rapidly. The open f-file and strong center compensate for the pawn."),
    ],
  },
  "of-23": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("f4", "2.f4 — The King's Gambit! Sacrificing the f-pawn."),
      M("exf4", "2...exf4 — Accepted."),
      M("Nf3", "3.Nf3 — Rapid development. White aims to open the f-file."),
      M("d6", "3...d6 — Solid defense."),
      M("Bc4", "4.Bc4 — Targeting f7 while developing."),
    ],
  },
  "of-24": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("Nc6", "2...Nc6."),
      M("Bc4", "3.Bc4."),
      M("Bc5", "3...Bc5."),
      M("b4", "4.b4!? — The Evans Gambit! Offering a pawn for rapid development."),
      M("Bxb4", "4...Bxb4 — Accepting."),
      M("c3", "5.c3 — Gaining tempo on the bishop while preparing d4."),
      M("Ba5", "5...Ba5 — Bishop retreats."),
      M("d4", "6.d4 — White has a powerful center and rapid development!"),
    ],
  },
  "of-25": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("Nc6", "2...Nc6."),
      M("d4", "3.d4 — The Scotch! Immediately opening the center."),
      M("exd4", "3...exd4 — Practically forced."),
      M("Nxd4", "4.Nxd4 — Strong centralized knight. White has open lines and active play."),
    ],
  },
  "of-26": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3 — Attacking e5."),
      M("Nf6", "2...Nf6 — The Petrov! Counter-attacking e4 instead of defending."),
      M("Nxe5", "3.Nxe5 — White takes the pawn."),
      M("d6", "3...d6 — Attacking the knight."),
      M("Nf3", "4.Nf3 — Knight retreats."),
      M("Nxe4", "4...Nxe4 — Now Black has won the pawn back. Equal."),
    ],
  },
  "of-27": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("d6", "2...d6 — The Philidor Defense. Solid but passive."),
      M("d4", "3.d4 — White seizes the center."),
      M("Nf6", "3...Nf6 — Developing."),
      M("Nc3", "4.Nc3 — Note: Black's c8 bishop is blocked by the d6+e5 pawn chain."),
    ],
  },
  "of-28": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nc3", "2.Nc3 — The Vienna Game! Flexible — keeps f4 option open."),
      M("Nf6", "2...Nf6."),
      M("f4", "3.f4 — The Vienna Gambit! Similar ideas to the King's Gambit."),
    ],
  },
  "of-29": {
    moves: [
      M("e4", "1.e4 — Your chosen first move as White."),
      M("e5", "1...e5 — One of many replies to study."),
      M("Nf3", "2.Nf3 — Follow your repertoire's main line."),
      M("Nc6", "2...Nc6 — Into the Italian or Ruy Lopez depending on your choice."),
    ],
  },
  "of-30": {
    moves: [
      M("e4", "1.e4 — Good: control the center."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3 — Good: develop a new piece."),
      M("Nc6", "2...Nc6."),
      M("Bc4", "3.Bc4 — Good: another new piece."),
      M("Bc5", "3...Bc5."),
      M("O-O", "4.O-O — Good: castle early! This is the model opening."),
    ],
  },

  // ===== TACTICAL PATTERNS =====
  "tp-1": {
    startFen: "r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Nxe5", "White captures the pawn, seemingly hanging the knight..."),
      M("Nxe5", "Black takes back."),
      M("d4", "But now d4 attacks BOTH the knight on e5 and the bishop that will come to the diagonal."),
    ],
  },
  "tp-2": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("Nc6", "2...Nc6."),
      M("Bb5", "3.Bb5 — The bishop PINS the knight to the king! The Nc6 cannot move without exposing the king."),
    ],
  },
  "tp-3": {
    startFen: "6k1/8/8/8/8/8/1K4r1/4R3 w - - 0 1",
    moves: [
      M("Re8+", "Re8+ — The rook checks the king! This is a skewer."),
      M("Kf7", "Kf7 — The king must move..."),
      M("Rxg2", "And now White captures the rook behind it! That's the power of a skewer."),
    ],
  },
  "tp-4": {
    startFen: "rn1qkb1r/pbpp1ppp/1p2pn2/8/2BPP3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
    moves: [
      M("e5", "e5! — The pawn moves forward, but the REAL threat is the bishop on c4 now aiming at f7 through the opened diagonal!"),
      M("Nd5", "Nd5 — The knight retreats."),
      M("Bxe6", "Bxe6! — Discovered attack was set up. The bishop captures with tempo."),
    ],
  },
  "tp-5": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1N3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5",
    moves: [
      M("Nxf7", "Nxf7! — Fork: the knight attacks the queen AND the rook."),
      M("Qe7", "Qe7 — The queen retreats."),
      M("Nxh8", "Nxh8 — White wins the rook! The knight fork was devastating."),
    ],
  },
  "tp-6": {
    startFen: "r2qk2r/ppp2ppp/2nb1n2/3pp1B1/2B1P1b1/3P1N2/PPP2PPP/RN1Q1RK1 b kq - 0 7",
    moves: [
      M("Bxf3", "Bxf3! — Deflecting the knight away from defending d4 and e5."),
      M("Qxf3", "Qxf3 — White recaptures."),
      M("d4", "d4! — Now with the knight gone, Black seizes central control."),
    ],
  },
  "tp-7": {
    startFen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 6",
    moves: [
      M("Bd2", "Bd2 — Developing and connecting to the defense."),
      M("Bxc3", "Bxc3 — Removing the guard! The Nc3 was defending e4 and d5."),
      M("Bxc3", "Bxc3 — White recaptures, but the knight that guarded the center is gone."),
    ],
  },
  "tp-8": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/8/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Bxh7+", "Bxh7+! — Sacrifice! The rook on f8 is overloaded: it must defend f7 AND the back rank."),
      M("Kxh7", "Kxh7 — King takes."),
      M("Ng5+", "Ng5+ — Check! Now the king is exposed and the overloaded defenses collapse."),
    ],
  },
  "tp-9": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("b3", "b3? — Looks harmless, but the bishop on a4 is now running low on safe squares..."),
      M("b5", "b5! — Pushing the bishop further."),
      M("Bb3", "Bb3 — The bishop retreats."),
      M("Na5", "Na5! — Attacking the bishop and threatening ...c4, trapping it!"),
    ],
  },
  "tp-10": {
    startFen: "r1bqkb1r/pppp1ppp/2n5/4n3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5",
    moves: [
      M("Qxf7+", "Qxf7+! — Instead of recapturing normally, a zwischenzug (in-between check)!"),
      M("Kd8", "Kd8 — The king must move."),
      M("Qxe6", "Now White captures with an extra pawn and a much better position."),
    ],
  },
  "tp-11": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQ1RK1 b - - 0 6",
    moves: [
      M("exd4", "exd4 — Opening the center."),
      M("cxd4", "cxd4 — White recaptures."),
      M("Nxe4", "Nxe4! — The knight is doomed after d5, so it captures the most valuable target first! Desperado!"),
    ],
  },
  "tp-12": {
    startFen: "r1bq1rk1/pppn1ppp/4pn2/3p2B1/1bBP4/2N1PN2/PPP2PPP/R2QK2R w KQ - 0 7",
    moves: [
      M("Bxh7+", "Bxh7+! — The Greek Gift Sacrifice! The bishop rips open the king's shelter."),
      M("Kxh7", "Kxh7 — Forced to accept."),
      M("Ng5+", "Ng5+ — Check! The knight leaps in."),
      M("Kg8", "Kg8 — Retreating."),
      M("Qh5", "Qh5 — Threatening Qxf7# and Qh7#. The attack is overwhelming!"),
    ],
  },
  "tp-13": {
    startFen: "r1bqk2r/pppp1Npp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 5",
    moves: [
      M("Kf8", "Kf8 — The king moves to escape, but the knight is forking the rooks!"),
      M("Nxh8", "Nxh8 — White captures the rook. The knight fork on f7 was devastating."),
    ],
  },
  "tp-14": {
    startFen: "r1b2rk1/pppp1ppp/2n2n2/2b1p2q/2B1P3/2NP1N2/PPP2PPP/R1BQ1R1K w - - 0 8",
    moves: [
      M("Bg5", "Bg5 — Pinning the f6 knight. Setting up a battery on the h-file."),
      M("Nd4", "Nd4 — Black tries to break free."),
      M("Nd5", "Nd5! — A powerful centralized knight adding to the battery pressure."),
    ],
  },
  "tp-15": {
    startFen: "rn3rk1/pbppq1pp/1p2p3/8/3PP3/3B1N2/PPP3PP/R2Q1RK1 w - - 0 11",
    moves: [
      M("d5", "d5! — Opening the diagonal for the bishop. Setting up a discovered attack."),
      M("exd5", "exd5 — Black captures."),
      M("Bg5", "Bg5! — Discovered attack on the queen! The bishop attacks the queen while the d-file opens."),
    ],
  },
  "tp-16": {
    startFen: "6k1/pp3ppp/8/3r4/8/8/PP3PPP/3R2K1 w - - 0 1",
    moves: [
      M("Rd4", "Rd4 — The rook centralizes. Even though there's a rook on d5, White's rook 'sees through' it via X-ray."),
      M("Rd8", "Rd8 — Black retreats."),
      M("Rd7", "Rd7! — The rook invades the 7th rank, attacking pawns from behind."),
    ],
  },
  "tp-17": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/4N3/2B1P3/8/PPPP1PPP/RNBQ1RK1 w - - 0 6",
    moves: [
      M("Nxf7", "Nxf7! — Clearance sacrifice! The knight clears e5 for the queen."),
      M("Rxf7", "Rxf7 — Black captures."),
      M("Bxf7+", "Bxf7+ — Check! The bishop captures with tempo."),
      M("Kxf7", "Kxf7."),
      M("Qf3+", "Qf3+ — The queen uses the cleared diagonal/file for a devastating attack!"),
    ],
  },
  "tp-18": {
    startFen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2NBBN2/PPP2PPP/R2Q1RK1 w - - 0 8",
    moves: [
      M("Bb5", "Bb5 — Interfering! The bishop places itself between the queen and the knight, disrupting their coordination."),
      M("Bd7", "Bd7 — Trying to maintain the connection."),
      M("Bxc6", "Bxc6 — Capturing and breaking up the coordination permanently."),
    ],
  },
  "tp-19": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "Re8+ — Back rank mate! The king is trapped by its own pawns with no escape square."),
    ],
  },
  "tp-20": {
    startFen: "r1bqkb1r/pp1n1ppp/2p1pn2/3pN3/3P1B2/2N5/PPP1PPPP/R2QKB1R w KQkq - 0 6",
    moves: [
      M("e4", "e4! — The pawn advances, creating a fork threat!"),
      M("dxe4", "dxe4 — Black captures."),
      M("Nxe4", "Nxe4 — The knight recaptures, now threatening both the f6 knight and the bishop on f8."),
    ],
  },
  "tp-21": {
    startFen: "r1b2rk1/pppp1Npp/8/2b1n3/2B1n2q/3p4/PPP2PPP/RNBQR1K1 w - - 0 10",
    moves: [
      M("Bf7+", "Bf7+! — A stunning queen sacrifice setup. Drawing the king forward."),
      M("Kh8", "Kh8 — King retreats."),
      M("Ng5", "Ng5 — Threatening Nf7# and Qxh7#. The combination is unstoppable!"),
    ],
  },
  "tp-22": {
    startFen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/4P3/2NP1N2/PPP1BPPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Be3", "Be3 — Developing."),
      M("d5", "d5 — Black strikes in the center."),
      M("exd5", "exd5."),
      M("Nxd5", "Nxd5."),
      M("Rf3", "Rf3! — The rook lift! Moving from f1 to f3, ready to swing to g3 or h3 for a kingside attack."),
    ],
  },
  "tp-23": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Bxh7+", "Bxh7+?! — Sometimes the exchange sacrifice is better: Rxf6! giving up rook for knight but destroying the kingside."),
    ],
  },
  "tp-24": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3 — The knight attacks e5 (one threat) AND develops (gains activity). Double purpose!"),
      M("Nc6", "2...Nc6 — Defends e5 and develops. Also a double-purpose move."),
      M("Bc4", "3.Bc4 — Develops AND creates a threat on f7. Two jobs in one move!"),
    ],
  },
  "tp-25": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3 — Check forcing moves first: this attacks a pawn (threat)."),
      M("Nc6", "2...Nc6."),
      M("Bc4", "3.Bc4 — Another forcing move: creates the threat of Bxf7+ or Qf3 attacking f7."),
      M("Nf6", "3...Nf6 — Counter-threat: attacking e4."),
    ],
  },
  "tp-26": {
    moves: [
      M("e4", "1.e4."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("Nc6", "2...Nc6."),
      M("Bc4", "3.Bc4."),
      M("Bc5", "3...Bc5."),
      M("Bxf7+", "4.Bxf7+?! — A sacrifice (tactic 1: deflection of the king)."),
      M("Kxf7", "4...Kxf7."),
      M("Ng5+", "5.Ng5+ — Check (tactic 2: fork threat). Multiple tactics chained = combination!"),
    ],
  },
  "tp-27": {
    startFen: "6k1/5ppp/8/8/2B5/8/5PPP/4r1K1 w - - 0 1",
    moves: [
      M("Bf7+", "Bf7+! — Counter-attack! Instead of losing, White gives check first."),
      M("Kh8", "Kh8 — King moves."),
      M("Be8", "Be8 — Now the bishop blocks and defends. A defensive tactic saved the game!"),
    ],
  },
  "tp-28": {
    moves: [
      M("e4", "1.e4 — Study classic patterns through play."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3."),
      M("Nc6", "2...Nc6."),
      M("Bc4", "3.Bc4 — Italian Game: rich in tactical patterns to study."),
      M("Bc5", "3...Bc5."),
    ],
  },
  "tp-29": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bxf7+", "Bxf7+? — Before capturing, count! Attackers on f7: Bishop. Defenders: King, Rf8. 1 attacker vs 2 defenders = bad!"),
      M("Rxf7", "Rxf7 — Black easily defends. The 'tactic' fails because we didn't count properly."),
    ],
  },
  "tp-30": {
    moves: [
      M("e4", "1.e4 — Before each move, ask: Does this hang anything?"),
      M("e5", "1...e5 — Does my opponent have checks, captures, or threats?"),
      M("Nf3", "2.Nf3 — Is my king safe? ✓ All three checks passed. Good move!"),
      M("Nc6", "2...Nc6."),
    ],
  },

  // ===== ENDGAME MASTERY =====
  "em-1": {
    startFen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Kf3", "Kf3 — King leads the pawn! Getting in front is key."),
      M("Ke6", "Ke6 — Black tries to block."),
      M("Ke4", "Ke4 — White gains the opposition! Kings face each other, Black to move."),
      M("Kd6", "Kd6 — Black must give way."),
      M("Kf5", "Kf5 — White's king advances past the pawn."),
      M("Ke7", "Ke7 — Black tries to block again."),
      M("Ke5", "Ke5 — Opposition again! White controls the key squares."),
    ],
  },
  "em-2": {
    startFen: "1K1k4/1P6/8/8/8/8/2r5/5R2 w - - 0 1",
    moves: [
      M("Rf4", "Rf4! — Building the bridge. The rook prepares to shield the king from checks."),
      M("Rc1", "Rc1 — Black gets ready to check."),
      M("Ka7", "Ka7 — The king steps out from in front of the pawn."),
      M("Ra1+", "Ra1+ — Check!"),
      M("Kb6", "Kb6 — King advances."),
      M("Rb1+", "Rb1+ — Another check."),
      M("Ka6", "Ka6."),
      M("Ra1+", "Ra1+."),
      M("Ra4", "Ra4! — The bridge! The rook blocks the checks. The pawn will promote."),
    ],
  },
  "em-3": {
    startFen: "4k3/8/4r3/8/8/8/3KP3/8R w - - 0 1",
    moves: [
      M("e4", "e4 — White advances the pawn."),
      M("Re6", "Re6! — The Philidor position! Black's rook stays on the 6th rank, preventing the white king from advancing."),
      M("Ke3", "Ke3 — White tries to push forward."),
      M("Re6", "Re6 — The rook holds the 6th rank. This is the key defensive technique."),
    ],
  },
  "em-4": {
    startFen: "8/8/8/1k2P3/8/8/8/4K3 w - - 0 1",
    moves: [
      M("Ke2", "Ke2 — White begins marching the king to support the passed pawn."),
      M("Kc6", "Kc6 — Black tries to catch the pawn."),
      M("Ke3", "Ke3 — Steadily advancing."),
      M("Kd7", "Kd7 — Can Black get into the 'square of the pawn'?"),
      M("Ke4", "Ke4 — The king supports the pawn's advance."),
      M("Ke7", "Ke7 — Black barely enters the square!"),
      M("e6", "e6 — Push! But with the king in the square, Black can stop it."),
    ],
  },
  "em-5": {
    startFen: "8/pp3k2/2p2b2/3p4/3P4/2P2N2/PP3K2/8 w - - 0 1",
    moves: [
      M("Ne5+", "Ne5+ — The knight challenges the bishop. In this closed position, the knight is well-placed."),
      M("Ke7", "Ke7 — King retreats."),
      M("Nxc6+", "Nxc6+ — The knight captures a pawn with check! Knights do well in closed positions."),
    ],
  },

  // ===== CHECKMATE PATTERNS =====
  "cm-1": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8#", "Re8# — Back rank mate! The king is trapped by its own pawns on f7, g7, h7."),
    ],
  },
  "cm-2": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    moves: [
      M("Qxf7#", "Qxf7# — Scholar's Mate! The queen takes f7 with support from the bishop on c4."),
    ],
  },
  "cm-3": {
    startFen: "r1b3kr/ppp2Npp/8/8/3n4/8/PPPnQPPP/R1B1K2R w KQ - 0 1",
    moves: [
      M("Qe8+", "Qe8+! — Forcing the rook to capture (or Nf8)."),
      M("Rxe8", "Rxe8 — Forced."),
      M("Nf7#", "Nf7# — Smothered mate! The king is completely boxed in by its own pieces."),
    ],
  },
  "cm-4": {
    startFen: "6k1/5ppp/6N1/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "Re8+ — The rook checks on the back rank."),
      M("Kf8", "Kf8."),
      M("Nxh7#", "Nxh7#? — Actually let's look at a cleaner example..."),
    ],
  },
  "cm-5": {
    startFen: "r1b2rk1/ppppNppp/2n2n2/4p3/2B1P2q/8/PPPP1PPP/RNBQ1R1K w - - 0 8",
    moves: [
      M("Ng6", "Ng6! — The knight forks the queen and the rook, and also threatens Nxf8#."),
      M("hxg6", "hxg6 — Black captures."),
      M("Qxh4", "The queen is now free to capture! The knight did its job."),
    ],
  },
  "cm-25": {
    startFen: "k7/8/8/8/8/8/8/KRR5 w - - 0 1",
    moves: [
      M("Rb2", "Rb2 — The first rook takes a rank."),
      M("Ka7", "Ka7 — King moves."),
      M("Rc7+", "Rc7+ — Check! The second rook checks from the next rank."),
      M("Ka6", "Ka6 — King retreats."),
      M("Rb6#", "Rb6# — Checkmate! The ladder technique: two rooks alternating to drive the king to the edge."),
    ],
  },
  "cm-28": {
    startFen: "k7/8/8/8/8/8/8/KQ6 w - - 0 1",
    moves: [
      M("Qb3", "Qb3 — Restricting the king. Don't rush — avoid stalemate!"),
      M("Ka7", "Ka7."),
      M("Qb5", "Qb5 — Slowly restricting. The queen builds a shrinking box."),
      M("Ka8", "Ka8 — Trapped on the edge."),
      M("Kb2", "Kb2 — Bring the king closer to assist!"),
      M("Ka7", "Ka7."),
      M("Kc3", "Kc3 — Marching the king up. Patience is key."),
    ],
  },
  "cm-29": {
    startFen: "k7/8/8/8/8/8/8/KR6 w - - 0 1",
    moves: [
      M("Kb2", "Kb2 — First bring the king closer. The rook alone can't checkmate."),
      M("Kb7", "Kb7."),
      M("Kc3", "Kc3 — Advancing steadily."),
      M("Kc6", "Kc6."),
      M("Kd4", "Kd4 — The key is to use the king to push the opponent's king to the edge."),
    ],
  },

  // ===== POSITIONAL PLAY =====
  "pp-1": {
    moves: [
      M("e4", "1.e4 — A strong center pawn."),
      M("e5", "1...e5."),
      M("d4", "2.d4 — Two pawns in the center! This is the ideal pawn structure."),
      M("exd4", "2...exd4 — But central tension must be managed."),
      M("Qxd4", "3.Qxd4 — White maintains one central pawn on e4."),
    ],
  },
  "pp-2": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/3PP3/2NB1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("e5", "e5! — Pushing Black's knight away and creating an outpost on d4/e5."),
      M("Nd7", "Nd7 — The knight retreats."),
      M("Bf4", "Bf4 — White controls the outpost. A knight on e5 would be untouchable!"),
    ],
  },
  "pp-6": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2b5/3P4/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 9",
    moves: [
      M("Bg5", "Bg5 — Pinning the knight. Active piece play with the IQP!"),
      M("Be7", "Be7 — Breaking the pin."),
      M("d5", "d5! — The IQP advances! This pawn break opens lines for all of White's pieces."),
      M("exd5", "exd5."),
      M("Nxd5", "Nxd5 — Knight lands on the powerful central square. IQP's dynamic strength!"),
    ],
  },
  "pp-15": {
    startFen: "6k1/pp1R1ppp/8/8/8/8/PPP2PPP/6K1 w - - 0 1",
    moves: [
      M("Rxf7", "Rxf7! — The rook on the 7th rank devours a pawn."),
      M("Kg8", "Kg8."),
      M("Rxb7", "Rxb7 — And another! Two pawns fallen to the 7th rank rook. Devastating power."),
    ],
  },

  // ===== QUEEN'S GAMBIT =====
  "qg-1": {
    moves: [
      M("d4", "1.d4 — The Queen's Pawn opening."),
      M("d5", "1...d5 — Black mirrors."),
      M("c4", "2.c4 — The Queen's Gambit! Challenging Black's center. Not a true gambit — White can regain the pawn."),
      M("e6", "2...e6 — Declining: the QGD. Solid and classical."),
      M("Nc3", "3.Nc3 — Developing and pressuring d5."),
      M("Nf6", "3...Nf6 — Defending d5 and developing."),
    ],
  },
  "qg-5": {
    startFen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    moves: [
      M("e3", "5.e3 — Supporting the center. The Semi-Slav setup."),
      M("Nbd7", "5...Nbd7 — Developing."),
      M("Bd3", "6.Bd3 — Active development."),
      M("dxc4", "6...dxc4 — The Meran variation! Black takes and plans ...b5."),
      M("Bxc4", "7.Bxc4 — Recapture."),
      M("b5", "7...b5 — The Meran! Black holds the pawn and expands on the queenside."),
    ],
  },

  // ===== RUY LOPEZ =====
  "rl-1": {
    moves: [
      M("e4", "1.e4 — Start."),
      M("e5", "1...e5."),
      M("Nf3", "2.Nf3 — Attacking e5."),
      M("Nc6", "2...Nc6 — Defending e5."),
      M("Bb5", "3.Bb5 — The Ruy Lopez! The bishop pressures the Nc6, the defender of e5."),
      M("a6", "3...a6 — The Morphy Defense, asking the bishop its intentions."),
      M("Ba4", "4.Ba4 — Maintaining the pressure."),
      M("Nf6", "4...Nf6 — Counter-attacking e4."),
      M("O-O", "5.O-O — Castle! A critical moment in the Ruy Lopez."),
    ],
  },

  // ===== KING'S INDIAN =====
  "ki-1": {
    moves: [
      M("d4", "1.d4."),
      M("Nf6", "1...Nf6 — Flexible: doesn't commit the pawns yet."),
      M("c4", "2.c4 — White grabs space."),
      M("g6", "2...g6 — Preparing the fianchetto. The King's Indian!"),
      M("Nc3", "3.Nc3 — Developing."),
      M("Bg7", "3...Bg7 — The powerful fianchettoed bishop."),
      M("e4", "4.e4 — White builds a massive center."),
      M("d6", "4...d6 — Black will attack this center later with ...e5 or ...c5."),
      M("Nf3", "5.Nf3."),
      M("O-O", "5...O-O — Castled and ready to fight!"),
    ],
  },

  // ===== SICILIAN DEEP DIVE =====
  "sd-1": {
    moves: [
      M("e4", "1.e4."),
      M("c5", "1...c5 — The Sicilian."),
      M("Nf3", "2.Nf3 — Heading for the Open Sicilian."),
      M("d6", "2...d6 — The Najdorf/Dragon/Classical move order."),
      M("d4", "3.d4 — Opening the center!"),
      M("cxd4", "3...cxd4 — Black takes."),
      M("Nxd4", "4.Nxd4 — The Open Sicilian! The most important position in chess theory."),
      M("Nf6", "4...Nf6 — Developing and attacking e4."),
      M("Nc3", "5.Nc3 — Supporting e4."),
    ],
  },

  // ===== NIMZO-INDIAN =====
  "ni-1": {
    moves: [
      M("d4", "1.d4."),
      M("Nf6", "1...Nf6 — Flexible."),
      M("c4", "2.c4 — Standard."),
      M("e6", "2...e6 — Preparing Bb4."),
      M("Nc3", "3.Nc3 — Now Black can pin!"),
      M("Bb4", "3...Bb4 — The Nimzo-Indian! Pinning the knight and fighting for e4 control."),
      M("Qc2", "4.Qc2 — The Classical: preventing doubled pawns after ...Bxc3."),
      M("O-O", "4...O-O — Safe and flexible."),
    ],
  },

  // ===== ATTACKING CHESS =====
  "ac-1": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 6 5",
    moves: [
      M("d4", "d4! — When you have better development, open the center to attack!"),
      M("exd4", "exd4."),
      M("e5", "e5 — Gaining space and driving the knight away."),
      M("d3", "d3 — Black is under pressure."),
      M("exf6", "exf6 — Opening lines toward the king. The attack is underway!"),
    ],
  },
  "ac-4": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P1B2/2NBPN2/PPP2PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("Bxh7+", "Bxh7+! — The classic bishop sacrifice on h7!"),
      M("Kxh7", "Kxh7 — Forced."),
      M("Ng5+", "Ng5+ — The knight leaps in with check!"),
      M("Kg8", "Kg8 — The king retreats."),
      M("Qh5", "Qh5 — Threatening Qxf7# and Qh7#. The attack is overwhelming."),
    ],
  },

  // ===== DEFENSIVE TECHNIQUES =====
  "dt-1": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 6 5",
    moves: [
      M("d3", "d3 — A solid, defensive move. Not every position calls for aggression."),
      M("d6", "d6 — Both sides develop carefully."),
      M("Be3", "Be3 — Defending d4 and developing. Quiet preparation."),
    ],
  },
  "dt-10": {
    startFen: "6k1/5ppp/8/8/2B5/8/5PPP/4r1K1 w - - 0 1",
    moves: [
      M("Bf7+", "Bf7+! — Perpetual check setup! Check!"),
      M("Kh8", "Kh8 — King hides."),
      M("Bg6", "Bg6 — Threatening Bf7+ again. The bishop shuffles back and forth giving perpetual check = draw!"),
    ],
  },

  // ===== PAWN ENDGAMES =====
  "pe-1": {
    startFen: "8/8/4k3/8/4K3/4P3/8/8 w - - 0 1",
    moves: [
      M("Kf4", "Kf4 — King advances. We need to get opposition."),
      M("Kd5", "Kd5 — Black tries to block."),
      M("Kf5", "Kf5 — We have the opposition! Black must give way."),
      M("Kd6", "Kd6 — Forced to step aside."),
      M("e4", "e4 — Now the pawn advances with the king ahead."),
      M("Ke7", "Ke7."),
      M("Ke5", "Ke5 — Opposition again! The king leads the pawn to promotion."),
    ],
  },
  "pe-5": {
    startFen: "8/8/1k6/8/8/8/5P2/4K3 w - - 0 1",
    moves: [
      M("f4", "f4 — Push the pawn. Can Black's king reach the 'square of the pawn'?"),
      M("Kc6", "Kc6 — The king starts chasing."),
      M("f5", "f5 — Draw the square from f5 to f8 to c8 to c5. Black's king is on c6 — INSIDE the square!"),
      M("Kd7", "Kd7 — The king enters the square. It will catch the pawn!"),
    ],
  },
  "pe-16": {
    startFen: "8/8/8/pp1K4/PP6/8/8/3k4 w - - 0 1",
    moves: [
      M("a5", "a5!! — The breakthrough sacrifice! Giving up a pawn to create a passer."),
      M("bxa5", "bxa5 — Black captures."),
      M("b5", "b5! — Now this pawn is unstoppable! The a-pawn is too far away to be saved."),
    ],
  },

  // ===== SCANDINAVIAN =====
  "sc-1": {
    moves: [
      M("e4", "1.e4."),
      M("d5", "1...d5 — The Scandinavian! Immediately challenging the center."),
      M("exd5", "2.exd5 — White captures."),
      M("Qxd5", "2...Qxd5 — The queen recaptures. She'll need to move again soon."),
      M("Nc3", "3.Nc3 — Attacking the queen and developing."),
      M("Qa5", "3...Qa5 — The main line. Queen goes to a safe, active square."),
    ],
  },

  // ===== DUTCH DEFENSE =====
  "du-1": {
    moves: [
      M("d4", "1.d4."),
      M("f5", "1...f5 — The Dutch Defense! Aggressive claim on e4."),
      M("c4", "2.c4 — White continues normally."),
      M("Nf6", "2...Nf6 — Developing."),
      M("g3", "3.g3 — Fianchetto setup."),
      M("g6", "3...g6 — The Leningrad Dutch! Fianchetto vs fianchetto."),
      M("Bg2", "4.Bg2 — Long diagonal."),
      M("Bg7", "4...Bg7 — A powerful bishop on the long diagonal."),
    ],
  },

  // ===== CHESS PSYCHOLOGY =====
  "cp-1": {
    moves: [
      M("e4", "1.e4 — Every grandmaster started with this simple move."),
      M("e5", "1...e5 — And learned the fundamentals, step by step."),
      M("Nf3", "2.Nf3 — Growth mindset: every game is a learning opportunity."),
      M("Nc6", "2...Nc6 — Whether you win or lose, you improve."),
    ],
  },

  // ===== CALCULATION =====
  "ct-1": {
    moves: [
      M("e4", "1.e4 — Before playing, visualize: what will the board look like after this move?"),
      M("e5", "1...e5 — Now think ahead: what are the candidate moves for White?"),
      M("Nf3", "2.Nf3 — This was one candidate. Can you calculate what happens after Nc6?"),
      M("Nc6", "2...Nc6 — Good. Now calculate 3.Bc4: what threats does it create?"),
    ],
  },
  "ct-5": {
    moves: [
      M("e4", "1.e4 — Your move. Now calculate opponent's BEST response."),
      M("e5", "1...e5 — This is strong. Now calculate YOUR best reply to e5."),
      M("Nf3", "2.Nf3 — Attacks e5. Calculate: what are Black's best options?"),
      M("Nc6", "2...Nc6 — Defends e5. You've calculated 2 moves deep successfully!"),
    ],
  },

  // ============= AUTO-GENERATED OPENING BOARDS =============
  // Each entry maps a lesson ID to an interactive opening sequence.
  // Boards demonstrate the specific opening line covered in that lesson.

  "ki-14": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("d5", "7.d5 — Locking the center, both sides will attack on opposite wings."),
      M("Nbd7", "7...Nbd7 — Preparing ...Nh5 and ...f5."),
      M("O-O", "8.O-O Nh5 9.Re1 — Modern theory."),
    ],
  },
  "ki-15": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("d5", "7.d5 — Mar del Plata! Center is locked. Now both sides race on opposite wings."),
      M("Nbd7", "7...Nbd7 8.O-O Nh5 — Black prepares ...f5"),
      M("O-O", "8.O-O Nh5 9.Ne1 — Knights reroute."),
    ],
  },
  "ki-16": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("d5", "7.d5 Nbd7 8.b4 — The Bayonet Attack! White rushes the queenside."),
    ],
  },
  "ki-17": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("d5", "7.d5 Nbd7 8.b4 — White's queenside steamroller."),
      M("Nbd7", "7...Nbd7"),
      M("b4", "8.b4 — The Bayonet! White rushes the queenside."),
    ],
  },
  "ki-18": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("d5", "7.d5 a5 8.Bg5 — Petrosian's positional approach."),
      M("a5", "7...a5 — Restraining b4."),
      M("Bg5", "8.Bg5 — Pinning the f6 knight."),
    ],
  },
  "ki-19": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("dxe5", "7.dxe5 dxe5 8.Qxd8 — Trading queens leads to a deceptively complex endgame."),
      M("dxe5", "7...dxe5"),
      M("Qxd8", "8.Qxd8 Rxd8 9.Bg5 — Endgame structure."),
    ],
  },
  "ki-20": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
    ],
  },
  "ki-21": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("c5", "Modern Benoni: 1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6"),
    ],
  },
  "ki-22": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("d5", "Grünfeld: 3...d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7"),
    ],
  },
  "ki-23": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
    ],
  },
  "ki-24": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("g3", "5.g3 — Quiet fianchetto setup."),
    ],
  },
  "ki-25": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("Bg5", "6.Bg5!? — The Averbakh System! Pin first, develop later."),
      M("c5", "6...c5 — Counterstrike against d4."),
    ],
  },
  "ki-26": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("d5", "7.d5 Nbd7 8.O-O Nh5 9.g3 — Modern flexible setup."),
    ],
  },
  "ki-27": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
    ],
  },
  "ki-28": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
    ],
  },
  "ki-29": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
      M("g3", "5.g3 d6 6.Bg2 Nbd7 — Smyslov's flexible plan."),
    ],
  },
  "ki-30": {
    moves: [
      M("d4", "1.d4 — White claims the center and prepares a strategic battle."),
      M("Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."),
      M("c4", "2.c4 — The Queen's Pawn opening; White grabs more space."),
      M("g6", "2...g6 — Preparing the King's Indian fianchetto."),
      M("Nc3", "3.Nc3 — White develops naturally."),
      M("Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."),
      M("e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."),
      M("d6", "4...d6 — Black supports a future ...e5 break."),
      M("Nf3", "5.Nf3 — Classical setup."),
      M("O-O", "5...O-O — Black castles into the King's Indian fortress."),
      M("Be2", "6.Be2 — The Classical Mar del Plata setup."),
      M("e5", "6...e5! — The thematic strike. Black challenges the center."),
    ],
  },
  "ck-8": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("Nc3", "3.Nc3 dxe4 4.Nxe4 Nf6 — Classical Caro-Kann."),
      M("dxe4", "3...dxe4"),
      M("Nxe4", "4.Nxe4"),
      M("Nf6", "4...Nf6 — Nf6 variation."),
      M("Nxf6+", "5.Nxf6+ exf6 — Solid pawn structure for Black."),
    ],
  },
  "ck-9": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("Nc3", "3.Nc3 dxe4 4.Nxe4 Nf6 — Classical Caro-Kann."),
      M("dxe4", "3...dxe4"),
      M("Nxe4", "4.Nxe4"),
      M("Nf6", "4...Nf6 — Nf6 variation."),
      M("Nxf6+", "5.Nxf6+ exf6 — Solid pawn structure for Black."),
    ],
  },
  "ck-10": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("Nc3", "3.Nc3 dxe4 4.Nxe4 Bf5 — Classical Main Line."),
      M("dxe4", "3...dxe4"),
      M("Nxe4", "4.Nxe4"),
      M("Bf5", "4...Bf5 — The Bishop comes out before locking it in!"),
      M("Ng3", "5.Ng3 Bg6 — Forcing the bishop to a slightly worse square."),
    ],
  },
  "ck-11": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("e5", "3.e5 Bf5 — The Advance Variation."),
      M("Bf5", "3...Bf5 — The Caro's good bishop comes out!"),
      M("Nf3", "4.Nf3 e6 5.Be2 — Short Variation, modern main line."),
    ],
  },
  "ck-12": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("Nc3", "3.Nc3 dxe4 4.Nxe4 Bf5 — The Classical, Capablanca's choice."),
      M("dxe4", "3...dxe4"),
      M("Nxe4", "4.Nxe4"),
      M("Bf5", "4...Bf5 — The bishop comes out before being locked in."),
    ],
  },
  "ck-13": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-14": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("exd5", "3.exd5 cxd5 4.c4 — The Panov-Botvinnik Attack!"),
      M("cxd5", "3...cxd5"),
      M("c4", "4.c4 Nf6 5.Nc3 — IQP positions arise."),
    ],
  },
  "ck-15": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-16": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-17": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-18": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("Nc3", "3.Nc3 g6 — The unusual Gurgenidze System!"),
      M("g6", "3...g6 — Black fianchettoes the bishop, treating the Caro like a Pirc."),
    ],
  },
  "ck-19": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("Nc3", "3.Nc3 dxe4 4.Nxe4 Nf6 — Classical Caro-Kann."),
      M("dxe4", "3...dxe4"),
      M("Nxe4", "4.Nxe4"),
      M("Nf6", "4...Nf6 — Nf6 variation."),
      M("Nxf6+", "5.Nxf6+ exf6 — Solid pawn structure for Black."),
    ],
  },
  "ck-20": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("e5", "3.e5 Bf5 4.Nc3 — Tartakower Variation."),
      M("Bf5", "3...Bf5"),
      M("Nc3", "4.Nc3 e6 — Black plays without ...c5 break."),
    ],
  },
  "ck-21": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("e5", "3.e5 — The Advance! White grabs space."),
      M("Bf5", "3...Bf5 — Same trick: bishop out first."),
      M("Nf3", "4.Nf3 e6 5.Be2 — Short Variation, modern main line."),
    ],
  },
  "ck-22": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("exd5", "3.exd5 — The Exchange. White trades to play against the IQP."),
      M("cxd5", "3...cxd5 4.Bd3 Nc6 5.c3 — Solid setup."),
    ],
  },
  "ck-23": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-24": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-25": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-26": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-27": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("exd5", "3.exd5 cxd5 4.c4 — The Panov-Botvinnik Attack!"),
      M("cxd5", "3...cxd5"),
      M("c4", "4.c4 Nf6 5.Nc3 — Sharp IQP play."),
    ],
  },
  "ck-28": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-29": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
    ],
  },
  "ck-30": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."),
      M("d4", "2.d4 — White accepts the challenge and builds a classical center."),
      M("d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."),
      M("Nc3", "3.Nc3 dxe4 4.Nxe4 Bf5 5.Ng3 — Forcing the bishop back."),
    ],
  },
  "ls-5": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "5.c3 c5 6.Nbd2 Nc6 — The classical London triangle."),
    ],
  },
  "ls-6": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Bd3", "4.Bd3 c5 5.c3 — Eyeing h7."),
    ],
  },
  "ls-8": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
    ],
  },
  "ls-9": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Nbd2", "4.Nbd2 c5 5.c3 Nc6 — Modern flexible setup."),
    ],
  },
  "ls-10": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Nc3", "Variation: 2.Nc3 instead — The Jobava London!"),
    ],
  },
  "ls-11": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Nbd2", "4.Nbd2 5.Ne5 — Preparing the Ne5 outpost."),
    ],
  },
  "ls-12": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
    ],
  },
  "ls-13": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
    ],
  },
  "ls-14": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Nbd2", "5.Nbd2 6.Ne5 — Preparing Ne5 attack."),
      M("c5", "5...c5 6.c3 Nc6"),
    ],
  },
  "ls-15": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Nc3", "Variation: 2.Nc3 instead — The Jobava London!"),
    ],
  },
  "ls-16": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "London vs ...c6: 1.d4 d5 2.Bf4 c6 3.e3 — Solid clamp."),
    ],
  },
  "ls-17": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
    ],
  },
  "ls-18": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
    ],
  },
  "ls-19": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Nc3", "Jobava: 2.Nc3 Nf6 3.Bf4 — Sharp aggressive London!"),
    ],
  },
  "ls-20": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
    ],
  },
  "ls-21": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "Triangle: pawns on c3, d4, e3 — the London skeleton."),
    ],
  },
  "ls-22": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("Qd2", "Long castling London: Qd2, O-O-O — Aggressive plan!"),
    ],
  },
  "ls-23": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "Quiet endgame plans arise from London structures."),
    ],
  },
  "ls-24": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
    ],
  },
  "ls-25": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "Modern London theory: deep but accessible."),
    ],
  },
  "ls-26": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "Against symmetric ...Bd6: trade or play around it."),
    ],
  },
  "ls-27": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "Build a complete London repertoire vs all defenses."),
    ],
  },
  "ls-28": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "Key London ideas: Bd3, Ne5, Qf3-h3 attack."),
    ],
  },
  "ls-29": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "5.c3 — Always c3 to secure d4 and prepare Bd3."),
    ],
  },
  "ls-30": {
    moves: [
      M("d4", "1.d4 — Classical queen's pawn opening."),
      M("d5", "1...d5 — Black mirrors, contesting the center."),
      M("Nf3", "2.Nf3 — Develop and prevent ...e5."),
      M("Nf6", "2...Nf6 — Symmetrical development."),
      M("Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."),
      M("e6", "3...e6 — A solid Black setup."),
      M("e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."),
      M("Bd6", "4...Bd6 — Challenging the London bishop."),
      M("c3", "Strategic plans: kingside attack, central play, or queenside expansion."),
    ],
  },
  "en-4": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
      M("Bg2", "5.Bg2 — The Reversed Dragon! White plays as Black does in the Sicilian Dragon."),
    ],
  },
  "en-5": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
      M("Bg2", "5.Bg2 e4 6.Nh3 — Botvinnik System with both fianchettos!"),
    ],
  },
  "en-6": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
      M("Bg2", "Symmetric: 1.c4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 — Mirror image!"),
    ],
  },
  "en-7": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
      M("e4", "Botvinnik: 1.c4 e5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.e4 — Both sides in fianchetto with central pawns."),
    ],
  },
  "en-8": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-10": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-11": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-12": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
      M("e4", "Mikenas: 1.c4 Nf6 2.Nc3 e6 3.e4 — The aggressive Mikenas-Carls!"),
    ],
  },
  "en-13": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-14": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-16": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-17": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-18": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
      M("d4", "Transposing: 1.c4 e6 2.Nc3 d5 3.d4 — Catalan-like positions."),
    ],
  },
  "en-19": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-20": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-21": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-22": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-23": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-24": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-25": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-26": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-27": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-28": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-29": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "en-30": {
    moves: [
      M("c4", "1.c4 — The English Opening. White stakes a flank claim on d5."),
      M("e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."),
      M("Nc3", "2.Nc3 — Natural development supporting d5 control."),
      M("Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."),
      M("g3", "3.g3 — A trademark English fianchetto setup."),
      M("d5", "3...d5 — Black strikes back in the center."),
      M("cxd5", "4.cxd5 — Capturing to free the c-file."),
      M("Nxd5", "4...Nxd5 — Recapturing centrally."),
    ],
  },
  "sc-5": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "4.d4 Nf6 5.Nf3 c6 — Main Line, queen on a5."),
    ],
  },
  "sc-6": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-7": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-8": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Modern: 2...Nf6 3.d4 Nxd5 — Avoiding queen exposure."),
    ],
  },
  "sc-9": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-10": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Portuguese: 2...Nf6 3.d4 Bg4!? — Sharp gambit line."),
    ],
  },
  "sc-11": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-12": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-13": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-14": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-15": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-16": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d3", "White's Anti-Scandinavian: 2.d3 — Refusing to capture."),
    ],
  },
  "sc-17": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Endgames feature Black's queenside majority potential."),
    ],
  },
  "sc-18": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "4.d4 Nf6 5.Nf3 Bg4 6.h3 — Modern theory."),
    ],
  },
  "sc-19": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Marshall: 4.d4 Nf6 5.Bd3 — Aggressive setup."),
    ],
  },
  "sc-20": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Mieses: 4.d4 Nf6 5.Nf3 Bf5 — Active piece play."),
    ],
  },
  "sc-21": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
    ],
  },
  "sc-22": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Lasker: ...Bg4 setup — Pinning the knight."),
    ],
  },
  "sc-23": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Pytel: ...Qd6 with queenside castling ideas."),
    ],
  },
  "sc-24": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Bronstein's interpretation of the Scandinavian."),
    ],
  },
  "sc-25": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Anderssen's old line: ...Qa5 with ...e5 break."),
    ],
  },
  "sc-26": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "After 4.d4: ...e5 — Aggressive central counterstrike!"),
    ],
  },
  "sc-27": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Black develops with ...Nf6, ...Bf5/g4, ...e6, ...Nbd7"),
    ],
  },
  "sc-28": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Black plays ...g6, ...Bg7 in some lines."),
    ],
  },
  "sc-29": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Key structure: Black has c6+d5 (later) similar to Caro."),
    ],
  },
  "sc-30": {
    moves: [
      M("e4", "1.e4 — White opens with the king's pawn."),
      M("d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."),
      M("exd5", "2.exd5 — White captures. Now Black must decide how to recapture."),
      M("Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."),
      M("Nc3", "3.Nc3 — Attacking the queen with tempo."),
      M("Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."),
      M("d4", "Plans: queenside castling, central pressure, queen rerouting."),
    ],
  },
  "du-4": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-5": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("Bg5", "4.Bg5 — The Leningrad Variation!"),
    ],
  },
  "du-6": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("e4", "2.e4!? — The Staunton Gambit! White sacs a pawn for development."),
      M("fxe4", "2...fxe4"),
      M("Nc3", "3.Nc3 — Rapid development for the pawn."),
    ],
  },
  "du-8": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-9": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-10": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("d5", "Stonewall: ...e6, ...d5, ...c6, ...Bd6 — Locked center!"),
    ],
  },
  "du-11": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("d5", "Stonewall: ...e6, ...d5, ...c6, ...Bd6 — Locked center!"),
    ],
  },
  "du-13": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-14": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("d5", "Stonewall: ...e6, ...d5, ...c6, ...Bd6 — Locked structure!"),
    ],
  },
  "du-15": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-16": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("e4", "Staunton Gambit: 2.e4!? — White sacs a pawn for development."),
    ],
  },
  "du-17": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("Bg5", "Anti-Dutch: 2.Bg5 — Trying to provoke ...h6 weaknesses."),
    ],
  },
  "du-18": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("Nc3", "Anti-Dutch: 2.Nc3 — Aggressive Anti-Dutch."),
    ],
  },
  "du-19": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("d5", "Stonewall: ...e6, ...d5, ...c6, ...Bd6 — Locked center!"),
    ],
  },
  "du-20": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-21": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("Bg5", "4.Bg5 — The Leningrad Variation!"),
    ],
  },
  "du-22": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-23": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-24": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
      M("d5", "Stonewall ML: ...e6, ...d5, ...c6, ...Bd6, ...Nbd7, ...O-O"),
    ],
  },
  "du-25": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-26": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-27": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-28": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-29": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "du-30": {
    moves: [
      M("d4", "1.d4 — White's queen pawn."),
      M("f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."),
      M("g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."),
      M("Nf6", "2...Nf6 — Standard development."),
      M("Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."),
      M("e6", "3...e6 — Preparing the Classical setup."),
      M("Nf3", "4.Nf3 — Fluid development."),
      M("Be7", "4...Be7 — Classical Dutch setup."),
    ],
  },
  "sd-7": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be3", "6.Be3 e6 7.f3 b5 8.Qd2 — English Attack: f3, Qd2, O-O-O, h-pawn storm."),
    ],
  },
  "sd-8": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Nc6", "Move order: 4...Nc6 (Taimanov) or 4...a6 (Kan)."),
    ],
  },
  "sd-9": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Nc6", "Move order: 4...Nc6 (Taimanov) or 4...a6 (Kan)."),
    ],
  },
  "sd-10": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be3", "6.Be3 g6 — The Dragon! Black fianchettoes."),
      M("g6", "6...g6"),
      M("f3", "7.f3 — Yugoslav Attack."),
      M("Bg7", "7...Bg7"),
      M("Qd2", "8.Qd2 — Preparing O-O-O and h4-h5."),
    ],
  },
  "sd-11": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Bg5", "6.Bg5 — The Main Line. Pinning, threatening Bxf6."),
    ],
  },
  "sd-12": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be2", "6.Be2 e5 — The Classical Najdorf."),
    ],
  },
  "sd-13": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Bg5", "6.Bg5 e6 7.f4 Qb6!? — The Poisoned Pawn! Black grabs b2."),
    ],
  },
  "sd-14": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Bc4", "6.Bc4 — The Fischer-Sozin Attack!"),
    ],
  },
  "sd-15": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("h3", "6.h3 — Modern Adams Attack."),
    ],
  },
  "sd-16": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Bg5", "6.Bg5 — The Main Line. Pinning the knight, threatening Bxf6."),
      M("e6", "6...e6"),
      M("e5", "7.e5!? — The famous Polugaevsky sacrifice idea."),
    ],
  },
  "sd-17": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be2", "6.Be2 — The Classical Najdorf. Quiet and solid."),
      M("e5", "6...e5 — Black secures d5 weakness in exchange for activity."),
    ],
  },
  "sd-18": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be3", "6.Be3 — The English Attack! White prepares f3, Qd2, O-O-O and a kingside pawn storm."),
      M("e6", "6...e6 — The Scheveningen-style setup."),
      M("f3", "7.f3 — Supporting e4 and preparing g4."),
      M("b5", "7...b5 — Black's queenside counterplay starts."),
    ],
  },
  "sd-19": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be3", "6.Be3 e5 — Modern Najdorf with ...e5."),
    ],
  },
  "sd-20": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be3", "6.Be3 g6 — The Dragon! Black fianchettoes."),
      M("g6", "6...g6"),
      M("f3", "7.f3 — Yugoslav Attack."),
      M("Bg7", "7...Bg7"),
      M("Qd2", "8.Qd2 — Preparing O-O-O and h4-h5."),
    ],
  },
  "sd-21": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be3", "6.Be3 g6 — The Dragon! Black fianchettoes."),
      M("g6", "6...g6"),
      M("f3", "7.f3 — Yugoslav Attack."),
      M("Bg7", "7...Bg7"),
      M("Qd2", "8.Qd2 — Preparing O-O-O and h4-h5."),
    ],
  },
  "sd-22": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("f3", "6.f3 — Direct preparation for the English Attack."),
    ],
  },
  "sd-23": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("g3", "6.g3 — Quiet fianchetto setup."),
    ],
  },
  "sd-24": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Rg1", "6.Rg1 — The fashionable Topalov idea, preparing g4."),
    ],
  },
  "sd-25": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Qf3", "6.Qf3 — The hypermodern queen development."),
    ],
  },
  "sd-26": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Nc6", "Sveshnikov: 5...Nc6 6.Ndb5 d6 7.Bf4 e5 8.Bg5 — Sharp main line."),
    ],
  },
  "sd-27": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Nc6", "Taimanov: 4...Nc6 5.Nc3 Qc7 — Flexible setup."),
    ],
  },
  "sd-28": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
    ],
  },
  "sd-29": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Be3", "Dragon: 6.Be3 g6 7.f3 Bg7 8.Qd2 — Yugoslav Attack!"),
    ],
  },
  "sd-30": {
    moves: [
      M("e4", "1.e4 — White opens classically."),
      M("c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."),
      M("Nf3", "2.Nf3 — The Open Sicilian setup."),
      M("d6", "2...d6 — Najdorf/Scheveningen move order."),
      M("d4", "3.d4 — White cracks open the center."),
      M("cxd4", "3...cxd4 — Standard exchange."),
      M("Nxd4", "4.Nxd4 — Recapturing centrally."),
      M("Nf6", "4...Nf6 — Attacking e4 with tempo."),
      M("Nc3", "5.Nc3 — Defending e4."),
      M("a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."),
      M("Nc6", "Accelerated Dragon: ...Nc6 + ...g6 — Avoiding Yugoslav."),
    ],
  },
  "ni-8": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "4.e3 — The Rubinstein System. Solid and flexible."),
      M("O-O", "4...O-O 5.Bd3 d5 — Modern main line."),
    ],
  },
  "ni-9": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "4.e3 — Rubinstein. Solid and flexible."),
    ],
  },
  "ni-10": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("Qc2", "4.Qc2 — Classical Nimzo, avoiding doubled pawns."),
    ],
  },
  "ni-11": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("a3", "4.a3 Bxc3+ 5.bxc3 — Sämisch: doubled pawns for the bishop pair."),
    ],
  },
  "ni-12": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("Bg5", "4.Bg5 — Leningrad! Pinning the f6 knight."),
    ],
  },
  "ni-13": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("Nf3", "4.Nf3 — Reshevsky's flexible move order."),
    ],
  },
  "ni-14": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "4.e3 c5 5.Bd3 Nc6 6.Nf3 Bxc3+ — Hübner!"),
    ],
  },
  "ni-15": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("a3", "4.a3 Bxc3+ 5.bxc3 d5 — Modern Sämisch theory."),
    ],
  },
  "ni-16": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("Qc2", "4.Qc2 O-O 5.a3 Bxc3+ 6.Qxc3 — Classical main line."),
    ],
  },
  "ni-17": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "4.e3 O-O 5.Bd3 d5 6.Nf3 c5 — Rubinstein main line."),
    ],
  },
  "ni-18": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("Qc2", "4.Qc2 — The Classical! Avoiding doubled pawns."),
      M("O-O", "4...O-O 5.a3 Bxc3+ 6.Qxc3"),
    ],
  },
  "ni-19": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "4.e3 O-O 5.Bd3 c5 6.Nf3 d5 — Bronstein move order."),
    ],
  },
  "ni-20": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "Black's ...d5 setup — Classical strategy."),
    ],
  },
  "ni-21": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "Black's ...c5 setup — Hypermodern strategy."),
    ],
  },
  "ni-22": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "Black's ...b6 setup — Fianchetto strategy."),
    ],
  },
  "ni-23": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("Qc2", "Endgame patterns favor the side without doubled pawns."),
    ],
  },
  "ni-24": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "Key structures: doubled c-pawns, IQP, hanging pawns."),
    ],
  },
  "ni-25": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "Plans: targeting doubled pawns, central control, kingside attack."),
    ],
  },
  "ni-26": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
      M("e3", "Tactical patterns: ...Bxc3 trades, ...Ne4 jumps, ...d5 breaks."),
    ],
  },
  "ni-27": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
    ],
  },
  "ni-28": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
    ],
  },
  "ni-29": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
    ],
  },
  "ni-30": {
    moves: [
      M("d4", "1.d4 — Queen's pawn opening."),
      M("Nf6", "1...Nf6 — Hypermodern development."),
      M("c4", "2.c4 — Standard QGD setup."),
      M("e6", "2...e6 — Preparing ...Bb4 or ...d5."),
      M("Nc3", "3.Nc3 — Inviting the Nimzo-Indian."),
      M("Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."),
    ],
  },

  // ============= AUTO-GENERATED LESSON BOARDS (Phase 2-4) =============
  // Endgame, tactics, basics, strategy, middlegame lesson boards.

  "core-b1": {
    moves: [
    ],
  },
  "core-b2": {
    moves: [
    ],
  },
  "core-b3": {
    moves: [
    ],
  },
  "core-b4": {
    startFen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 4",
    moves: [
      M("Bb5+", "1.Bb5+ — Check! Black must respond immediately."),
    ],
  },
  "core-b5": {
    startFen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
    ],
  },
  "core-b6": {
    startFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    moves: [
      M("Nf3", "2.Nf3 — Develop with central focus."),
      M("Nc6", "2...Nc6"),
    ],
  },
  "core-b7": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Threatening f7! Material can be won by tactics."),
    ],
  },
  "core-b8": {
    moves: [
    ],
  },
  "core-b9": {
    startFen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 4",
    moves: [
      M("Bb5+", "1.Bb5+ — Check! Black must respond immediately."),
    ],
  },
  "core-b10": {
    moves: [
    ],
  },
  "core-b11": {
    moves: [
    ],
  },
  "core-b12": {
    startFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    moves: [
      M("Nc6", "2...Nc6 3.Bc4 — Knights before bishops."),
      M("Bc4", "3.Bc4"),
    ],
  },
  "core-b13": {
    startFen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 4",
    moves: [
      M("Bb5+", "1.Bb5+ — Check! Black must respond immediately."),
    ],
  },
  "core-b14": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
    ],
  },
  "core-b15": {
    moves: [
    ],
  },
  "core-b16": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Threatening f7! Material can be won by tactics."),
    ],
  },
  "core-b17": {
    moves: [
      M("e4", "1.e4 — Control the center."),
      M("e5", "1...e5"),
      M("Nf3", "2.Nf3 — Develop knights."),
      M("Nc6", "2...Nc6"),
      M("Bc4", "3.Bc4 — Develop bishops."),
      M("Bc5", "3...Bc5"),
      M("O-O", "4.O-O — Castle early!"),
    ],
  },
  "core-b18": {
    startFen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    moves: [
    ],
  },
  "core-i1": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: [
      M("Bb5", "1.Bb5 — Pinning the knight."),
      M("a6", "1...a6 2.Bxc6 — Setting up tactical motifs."),
    ],
  },
  "core-i2": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: [
      M("Bb5", "1.Bb5 — Pinning the knight."),
      M("a6", "1...a6 2.Bxc6 — Setting up tactical motifs."),
    ],
  },
  "core-i3": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    moves: [
      M("a6", "1...a6 — Challenging the pinning bishop."),
      M("Bxc6", "2.Bxc6 — Trade or retreat?"),
    ],
  },
  "core-i4": {
    startFen: "8/8/8/3k4/8/3K4/3R4/3q4 w - - 0 1",
    moves: [
      M("Rxd1", "1.Rxd1+ — But there's a skewer ready!"),
    ],
  },
  "core-i5": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4",
    moves: [
      M("Nxe5", "1.Nxe5! — Knight moves, opening a discovered attack."),
      M("Nxe5", "1...Nxe5 2.d4 — Central break exploits the discovery."),
    ],
  },
  "core-i6": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: [
      M("Bb5", "1.Bb5 — Pinning the knight."),
      M("a6", "1...a6 2.Bxc6 — Setting up tactical motifs."),
    ],
  },
  "core-i7": {
    startFen: "r1bqkb1r/pppp1Bpp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
    ],
  },
  "core-i8": {
    startFen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bxf7+", "1.Bxf7+! — Removing the defender of e5."),
      M("Rxf7", "1...Rxf7 2.Nxe5 — The defender gone, the pawn falls."),
    ],
  },
  "core-i9": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: [
      M("Bb5", "1.Bb5 — Pinning the knight."),
      M("a6", "1...a6 2.Bxc6 — Setting up tactical motifs."),
    ],
  },
  "core-i10": {
    startFen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
    moves: [
      M("Nf7#", "1.Nf7+ Kg8 — Knight checks."),
    ],
  },
  "core-i11": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8#", "1.Re8# — Back rank mate in one!"),
    ],
  },
  "core-i12": {
    startFen: "r1bq1rk1/pp3ppp/2n2n2/2bpp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 7",
    moves: [
    ],
  },
  "core-i13": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 5",
    moves: [
      M("Nd5", "1.Nd5! — Clearance: the knight clears the c-file with tempo."),
      M("Nxd5", "1...Nxd5 2.exd5 — The line is open!"),
    ],
  },
  "core-i14": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Threatening f7."),
      M("d5", "1...d5! — A zwischenzug! Black ignores the threat."),
      M("exd5", "2.exd5 Na5 — The intermezzo bought time."),
    ],
  },
  "core-i15": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    moves: [
      M("Ra8#", "1.Ra8+ — The back rank weakness!"),
    ],
  },
  "core-i16": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8#", "1.Re8# — Back rank mate in one!"),
    ],
  },
  "core-a1": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    moves: [
      M("Bc2", "1.Bc2 — Around the IQP, pieces find active squares."),
      M("Re8", "1...Re8 — Black presses against d4."),
    ],
  },
  "core-a2": {
    startFen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "core-a3": {
    startFen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("Be2", "1.Be2 — d6 is a backward pawn — a chronic weakness."),
    ],
  },
  "core-a4": {
    startFen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    moves: [
      M("cxd5", "1.cxd5 cxd5 — Doubled c-pawns can be both weakness and strength."),
    ],
  },
  "core-a5": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4"),
    ],
  },
  "core-a6": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  "core-a7": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  "core-a8": {
    startFen: "r1bq1rk1/pp3ppp/2n2n2/3p4/3N4/2N5/PPP2PPP/R1BQ1RK1 w - - 0 1",
    moves: [
    ],
  },
  "core-a9": {
    startFen: "r4rk1/pp2qppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 1",
    moves: [
    ],
  },
  "core-a10": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 1",
    moves: [
      M("b4", "1.b4 — The Minority Attack! White's two pawns attack three."),
      M("a5", "1...a5 2.b5 — Creating a weakness on c6."),
    ],
  },
  "core-a11": {
    startFen: "r1bqkbnr/pp1n1ppp/2p1p3/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 2 5",
    moves: [
      M("Nf3", "2.Nf3 — Pawn chains: attack the base!"),
    ],
  },
  "core-a12": {
    startFen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "core-a13": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
    ],
  },
  "core-a14": {
    startFen: "r1bqk1nr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 4",
    moves: [
      M("d3", "4.d3 — The bishop pair shines in open positions."),
    ],
  },
  "core-a15": {
    startFen: "r1bqkbnr/pp1npppp/2p5/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 1 4",
    moves: [
      M("Nf3", "3.Nf3 — Black's c8 bishop is locked in (bad bishop)."),
    ],
  },
  "core-a16": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("a3", "1.a3 — Prophylaxis: prevent ...Bb4 ideas before they arise."),
    ],
  },
  "em-6": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "em-7": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "em-8": {
    startFen: "1K6/1P6/8/8/8/8/r7/2k4R w - - 0 1",
    moves: [
      M("Rh4", "1.Rh4 — Building the bridge! The rook prepares to shield the king from checks."),
    ],
  },
  "em-9": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "em-10": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "em-11": {
    startFen: "8/8/1p1k4/1P6/1K6/8/8/8 w - - 0 1",
    moves: [
      M("Kc4", "1.Kc4 — Triangulation! Lose a tempo to put Black in zugzwang."),
      M("Kc7", "1...Kc7 2.Kd4 — Returning with Black to move."),
    ],
  },
  "em-12": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "em-13": {
    startFen: "8/8/4k3/8/4P3/8/4K3/4R2r w - - 0 1",
    moves: [
    ],
  },
  "em-14": {
    startFen: "8/8/8/8/8/k7/p7/4K2Q w - - 0 1",
    moves: [
      M("Qa8+", "1.Qa8+ — Force the king onto the pawn."),
      M("Kb2", "1...Kb2 2.Qb7+ — Approaching with the king."),
    ],
  },
  "em-15": {
    startFen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
    moves: [
      M("Bd3", "1.Bd3 — Two bishops sweep diagonals to corner the king."),
      M("Kd5", "1...Kd5 2.Be2 — Patient W-maneuver."),
    ],
  },
  "em-16": {
    startFen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
    moves: [
      M("Bd3", "1.Bd3 — Two bishops sweep diagonals to corner the king."),
      M("Kd5", "1...Kd5 2.Be2 — Patient W-maneuver."),
    ],
  },
  "em-17": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "em-18": {
    startFen: "4k3/R7/4K3/4P3/8/8/8/r7 b - - 0 1",
    moves: [
      M("Ra6+", "1...Ra6! — The Philidor Defense! Rook on the 6th rank prevents White's king from advancing."),
    ],
  },
  "em-19": {
    startFen: "8/4k3/8/4N3/4K3/8/8/8 w - - 0 1",
    moves: [
      M("Nf3", "1.Nf3 — Knights are clumsy but precise in endgames."),
      M("Kd6", "1...Kd6 2.Nd2 — Knight maneuvers carefully."),
    ],
  },
  "em-20": {
    startFen: "8/8/3k4/3p4/8/3B4/4b3/3K4 w - - 0 1",
    moves: [
      M("Kc2", "1.Kc2 — Opposite-colored bishops favor the defender."),
      M("Bf3", "1...Bf3 2.Kd2 — Activity over material."),
    ],
  },
  "em-21": {
    startFen: "8/p4k2/1p3p2/2p2P2/2P5/1P3K2/P4B2/8 w - - 0 1",
    moves: [
      M("Be3", "1.Be3 — A 'good' bishop attacks fixed enemy pawns."),
    ],
  },
  "em-22": {
    startFen: "8/k7/P7/K7/8/8/8/7r w - - 0 1",
    moves: [
      M("Kb5", "1.Kb5 — White tries to escort the a-pawn."),
      M("Rh5+", "1...Rh5+ — The Vančura Defense! Rook checks from the side."),
      M("Kc6", "2.Kc6 Rh6+ — More checks; Black holds."),
    ],
  },
  "em-23": {
    startFen: "8/8/4k3/8/4B3/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Bd5+", "1.Bd5+ — Bishop and pawn coordinate."),
      M("Kd6", "1...Kd6 2.Kd4 — King escorts the pawn."),
    ],
  },
  "em-24": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "em-25": {
    startFen: "8/8/8/4k3/8/4K3/8/4R3 w - - 0 1",
    moves: [
    ],
  },
  "em-26": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "em-27": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "em-28": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "em-29": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "em-30": {
    startFen: "1K6/1P6/8/8/8/8/r7/2k4R w - - 0 1",
    moves: [
      M("Rh4", "1.Rh4 — Building the bridge! The rook prepares to shield the king from checks."),
    ],
  },
  "pp-3": {
    startFen: "r4rk1/pp2qppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 1",
    moves: [
    ],
  },
  "pp-4": {
    startFen: "r1bq1rk1/pp2ppbp/2np2p1/2p5/2P1P3/2NP1N2/PP2BPPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  "pp-5": {
    startFen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "pp-7": {
    startFen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "pp-8": {
    startFen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("Be2", "1.Be2 — d6 is a backward pawn — a chronic weakness."),
    ],
  },
  "pp-9": {
    startFen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    moves: [
      M("cxd5", "1.cxd5 cxd5 — Doubled c-pawns can be both weakness and strength."),
    ],
  },
  "pp-10": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Bg5", "1.Bg5 — Trade pieces when ahead in material or to simplify."),
    ],
  },
  "pp-11": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 1",
    moves: [
      M("b4", "1.b4 — The Minority Attack! White's two pawns attack three."),
      M("a5", "1...a5 2.b5 — Creating a weakness on c6."),
    ],
  },
  "pp-12": {
    startFen: "r1bqkbnr/pp1npppp/2p5/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 1 4",
    moves: [
      M("Nf3", "3.Nf3 — Black's c8 bishop is locked in (bad bishop)."),
    ],
  },
  "pp-13": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ng5", "1.Ng5 — Kingside attack starts!"),
      M("h6", "1...h6 2.h4 — Pawn storm!"),
    ],
  },
  "pp-14": {
    startFen: "r4rk1/pp2qppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 1",
    moves: [
    ],
  },
  "pp-16": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP2BPPP/R2Q1RK1 w - - 0 8",
    moves: [
      M("a3", "1.a3 — Pieces work together: bishop, knight, queen aligned."),
    ],
  },
  "pp-17": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("a3", "1.a3 — Prophylaxis: prevent ...Bb4 ideas before they arise."),
    ],
  },
  "pp-18": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/3pP3/3P4/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("a3", "1.a3 — Preparing b4 queenside expansion."),
      M("a5", "1...a5 2.b3 — Slow positional pressure."),
    ],
  },
  "pp-19": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("b4", "1.b4 — The Minority Attack! White's two pawns attack three."),
      M("a5", "1...a5 2.b5 — Creating a weakness on c6."),
    ],
  },
  "pp-20": {
    startFen: "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("c5", "1.c5 — A central pawn break to clarify the structure!"),
    ],
  },
  "pp-21": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ng5", "1.Ng5 — Kingside attack starts!"),
      M("h6", "1...h6 2.h4 — Pawn storm!"),
    ],
  },
  "pp-22": {
    startFen: "r1bq1rk1/ppp2pbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ng5", "1.Ng5 — Kingside attack starts!"),
      M("h6", "1...h6 2.h4 — Pawn storm!"),
    ],
  },
  "pp-23": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nb5", "1.Nb5 — Heading to a powerful outpost on d6 or c7."),
    ],
  },
  "pp-24": {
    startFen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "pp-25": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("a3", "1.a3 — Pieces work together: bishop, knight, queen aligned."),
    ],
  },
  "pp-26": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2ppN3/3P4/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 8",
    moves: [
      M("Nb5", "1.Nb5 — Heading to a powerful outpost on d6 or c7."),
    ],
  },
  "pp-27": {
    startFen: "r1bq1rk1/pp2ppbp/2np1np1/2p5/2P1P3/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 7",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "pp-28": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4"),
    ],
  },
  "pp-29": {
    startFen: "r2q1rk1/pbpnbppp/1p2pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Nxd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  "pp-30": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
    ],
  },
  "cm-6": {
    startFen: "r1bq1rk1/pp3ppp/2n2n2/2bpp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 7",
    moves: [
    ],
  },
  "cm-7": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8#", "1.Re8# — Back rank mate in one!"),
    ],
  },
  "cm-8": {
    startFen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
    moves: [
      M("Nf7#", "1.Nf7+ Kg8 — Knight checks."),
    ],
  },
  "cm-9": {
    startFen: "r1bq2k1/pppp1pBp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RN1Q1R1K w - - 0 8",
    moves: [
      M("Bxf6", "1.Bxf6 — Setup; the famous windmill arises in similar structures."),
    ],
  },
  "cm-10": {
    startFen: "r4rk1/pp3ppp/2n5/2bqp3/8/2N5/PPPQBPPP/R4RK1 w - - 0 1",
    moves: [
      M("Nxd5", "1.Nxd5! — The queen is overloaded defending two things."),
    ],
  },
  "cm-11": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    moves: [
      M("a6", "1...a6 — Challenging the pinning bishop."),
      M("Bxc6", "2.Bxc6 — Trade or retreat?"),
    ],
  },
  "cm-12": {
    startFen: "rn1qkbnr/pp2pppp/8/2pP4/4P1b1/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 4",
    moves: [
      M("h3", "1.h3 — Threatens to trap the bishop."),
      M("Bh5", "1...Bh5 2.g4 Bg6 — Forcing the bishop to a worse square."),
    ],
  },
  "cm-13": {
    startFen: "6k1/5ppp/8/8/8/8/Q4PPP/6K1 w - - 0 1",
    moves: [
      M("Qa8#", "1.Qa8+ Kh7 2.Qe4+ Kg8 3.Qa8+ — Perpetual check, draw!"),
    ],
  },
  "cm-14": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    moves: [
      M("Ra8#", "1.Ra8+ — The back rank weakness!"),
    ],
  },
  "cm-15": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    moves: [
      M("Ra8#", "1.Ra8+ — The back rank weakness!"),
    ],
  },
  "cm-16": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 1",
    moves: [
      M("cxd5", "1.cxd5 exd5 2.Nb5 — Tactical possibilities arise from active piece play."),
    ],
  },
  "cm-17": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "cm-18": {
    startFen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
    moves: [
      M("Nf7#", "1.Nf7+ Kg8 — Knight checks."),
    ],
  },
  "cm-19": {
    startFen: "6k1/5pp1/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "1.Re8+ Kh7 2.Rh8# — Mate in 2!"),
      M("Kh7", "1...Kh7"),
      M("Rh8+", "2.Rh8# — Checkmate!"),
    ],
  },
  "cm-20": {
    startFen: "r1b3k1/ppppRppp/2n2N2/2b1p3/4P3/8/PPPP1PPP/RNB2K2 w - - 0 8",
    moves: [
      M("Re8#", "1.Re8# — Back rank mate in one!"),
    ],
  },
  "cm-21": {
    startFen: "6k1/5pp1/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "1.Re8+ Kh7 2.Rh8# — Mate in 2!"),
      M("Kh7", "1...Kh7"),
      M("Rh8+", "2.Rh8# — Checkmate!"),
    ],
  },
  "cm-22": {
    startFen: "6k1/5pp1/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "1.Re8+ Kh7 2.Rh8# — Mate in 2!"),
      M("Kh7", "1...Kh7"),
      M("Rh8+", "2.Rh8# — Checkmate!"),
    ],
  },
  "cm-23": {
    startFen: "6k1/5pp1/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "1.Re8+ Kh7 2.Rh8# — Mate in 2!"),
      M("Kh7", "1...Kh7"),
      M("Rh8+", "2.Rh8# — Checkmate!"),
    ],
  },
  "cm-24": {
    startFen: "6k1/5pp1/7p/8/8/8/5PPP/Q5K1 w - - 0 1",
    moves: [
      M("Qa8+", "1.Qa8+ — Forcing the king."),
      M("Kh7", "1...Kh7"),
      M("Qe4+", "2.Qe4+ g6 3.Qxg6+ fxg6 4.... — Mating net."),
    ],
  },
  "cm-26": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: [
      M("Bb5", "1.Bb5 — Pinning the knight."),
      M("a6", "1...a6 2.Bxc6 — Setting up tactical motifs."),
    ],
  },
  "cm-27": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8#", "1.Re8# — Back rank mate in one!"),
    ],
  },
  "cm-30": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8#", "1.Re8# — Back rank mate in one!"),
    ],
  },
  "cm-31": {
    startFen: "6k1/5pp1/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "1.Re8+ Kh7 2.Rh8# — Mate in 2!"),
      M("Kh7", "1...Kh7"),
      M("Rh8+", "2.Rh8# — Checkmate!"),
    ],
  },
  "cm-32": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    moves: [
      M("a6", "1...a6 — Challenging the pinning bishop."),
      M("Bxc6", "2.Bxc6 — Trade or retreat?"),
    ],
  },
  "sm-1": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("a3", "1.a3 — Prophylaxis: prevent ...Bb4 ideas before they arise."),
    ],
  },
  "sm-2": {
    startFen: "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("c5", "1.c5 — A central pawn break to clarify the structure!"),
    ],
  },
  "sm-3": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Bg5", "1.Bg5 — Trade pieces when ahead in material or to simplify."),
    ],
  },
  "sm-4": {
    startFen: "r1bqk1nr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 4",
    moves: [
      M("d3", "4.d3 — The bishop pair shines in open positions."),
    ],
  },
  "sm-5": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 1",
    moves: [
      M("b4", "1.b4 — The Minority Attack! White's two pawns attack three."),
      M("a5", "1...a5 2.b5 — Creating a weakness on c6."),
    ],
  },
  "sm-6": {
    startFen: "r1bqkbnr/pp1n1ppp/2p1p3/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 2 5",
    moves: [
      M("Nf3", "2.Nf3 — Pawn chains: attack the base!"),
    ],
  },
  "sm-7": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    moves: [
      M("Bc2", "1.Bc2 — Around the IQP, pieces find active squares."),
      M("Re8", "1...Re8 — Black presses against d4."),
    ],
  },
  "sm-8": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    moves: [
      M("Bc2", "1.Bc2 — Around the IQP, pieces find active squares."),
      M("Re8", "1...Re8 — Black presses against d4."),
    ],
  },
  "sm-9": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "sm-10": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "sm-11": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
    ],
  },
  "sm-12": {
    startFen: "r4rk1/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/R4RK1 w - - 0 1",
    moves: [
    ],
  },
  "sm-13": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    moves: [
      M("Bc2", "1.Bc2 — Around the IQP, pieces find active squares."),
      M("Re8", "1...Re8 — Black presses against d4."),
    ],
  },
  "sm-14": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "sm-15": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Be2", "1.Be2 — d6 is a backward pawn — a chronic weakness."),
    ],
  },
  "sm-16": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("cxd5", "1.cxd5 cxd5 — Doubled c-pawns can be both weakness and strength."),
    ],
  },
  "sm-17": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4"),
    ],
  },
  "sm-18": {
    startFen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "sm-19": {
    startFen: "r1bq1rk1/pp2ppbp/2np2p1/2p5/2P1P3/2NP1N2/PP2BPPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  "sm-20": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "sm-21": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nxd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  "sm-22": {
    startFen: "rn1q1rk1/1b2bppp/pp1ppn2/2p5/2P1P3/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 9",
    moves: [
      M("Nb5", "1.Nb5 — Heading to a powerful outpost on d6 or c7."),
    ],
  },
  "sm-23": {
    startFen: "r4rk1/pp2qppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 1",
    moves: [
    ],
  },
  "sm-24": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 1",
    moves: [
      M("b4", "1.b4 — The Minority Attack! White's two pawns attack three."),
      M("a5", "1...a5 2.b5 — Creating a weakness on c6."),
    ],
  },
  "sm-25": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Bg5", "1.Bg5 — Trade pieces when ahead in material or to simplify."),
    ],
  },
  "sm-26": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "sm-27": {
    startFen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("a3", "1.a3 — Prophylaxis: prevent ...Bb4 ideas before they arise."),
    ],
  },
  "sm-28": {
    startFen: "r1bqkbnr/pp1n1ppp/2p1p3/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 2 5",
    moves: [
      M("Nf3", "2.Nf3 — Pawn chains: attack the base!"),
    ],
  },
  "sm-29": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 6 5",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "sm-30": {
    startFen: "r1bqk1nr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 4",
    moves: [
      M("d3", "4.d3 — The bishop pair shines in open positions."),
    ],
  },
  "ac-2": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-3": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-5": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-6": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-7": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-8": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "ac-9": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("h3", "1.h3 — Preparing g4-g5 pawn storm!"),
      M("Nh5", "1...Nh5 2.g4 — Aggressive expansion."),
    ],
  },
  "ac-10": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "ac-11": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-12": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-13": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "ac-14": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "ac-15": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "ac-16": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-17": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-18": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-19": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-20": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 b - - 0 8",
    moves: [
      M("c5", "1...c5! — The best defense is a counterattack!"),
      M("dxc5", "2.dxc5 Nxc5 — Black equalizes activity."),
    ],
  },
  "ac-21": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b5/2B1p3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 7",
    moves: [
      M("dxe4", "1.dxe4 — King safety first; never leave the king exposed."),
    ],
  },
  "ac-22": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-23": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-24": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-25": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-26": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-27": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-28": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "ac-29": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "ac-30": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "dt-2": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-3": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-4": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-5": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ne5", "1.Ne5 — Activate every piece to its best square!"),
    ],
  },
  "dt-6": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("h3", "1.h3 — Preparing g4-g5 pawn storm!"),
      M("Nh5", "1...Nh5 2.g4 — Aggressive expansion."),
    ],
  },
  "dt-7": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4",
    moves: [
      M("Bc5", "3...Bc5 — Open positions favor the bishops and quick development."),
    ],
  },
  "dt-8": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-9": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "dt-11": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "dt-12": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-13": {
    startFen: "rnbqkb1r/pp1n1ppp/4p3/2ppP3/3P4/2P5/PP1N1PPP/R1BQKBNR w KQkq - 0 5",
    moves: [
    ],
  },
  "dt-14": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "dt-15": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-16": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-17": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-18": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-19": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-20": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-21": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-22": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-23": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-24": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP1QPPP/R1B2RK1 w - - 0 9",
    moves: [
      M("Nh4", "1.Nh4 — Knight reroutes to f5 — patient maneuvering."),
      M("Re8", "1...Re8 2.Nf5 — Long-term piece improvement."),
    ],
  },
  "dt-25": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-26": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-27": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-28": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "dt-29": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Re1", "1.Re1 — Form a plan based on pawn structure!"),
    ],
  },
  "dt-30": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "pe-2": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "pe-3": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "pe-4": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "pe-6": {
    startFen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Kd3", "1.Kd3 — King leads the pawn (golden rule of K+P endings)."),
      M("Kd5", "1...Kd5 — Black tries to block."),
      M("Ke3", "2.Ke3 — White maintains opposition."),
      M("Ke5", "2...Ke5 3.e3 — Patient triangulation."),
    ],
  },
  "pe-7": {
    startFen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Kd3", "1.Kd3 — King leads the pawn (golden rule of K+P endings)."),
      M("Kd5", "1...Kd5 — Black tries to block."),
      M("Ke3", "2.Ke3 — White maintains opposition."),
      M("Ke5", "2...Ke5 3.e3 — Patient triangulation."),
    ],
  },
  "pe-8": {
    startFen: "8/k7/P7/K7/8/8/8/7r w - - 0 1",
    moves: [
      M("Kb5", "1.Kb5 — White tries to escort the a-pawn."),
      M("Rh5+", "1...Rh5+ — The Vančura Defense! Rook checks from the side."),
      M("Kc6", "2.Kc6 Rh6+ — More checks; Black holds."),
    ],
  },
  "pe-9": {
    startFen: "8/8/3k4/3P4/3K4/8/8/8 w - - 0 1",
    moves: [
      M("Kc4", "1.Kc4 — Triangulation! Lose a tempo to put Black in zugzwang."),
      M("Kc7", "1...Kc7 2.Kd4 — Returning with Black to move."),
    ],
  },
  "pe-10": {
    startFen: "8/8/3k4/3P4/3K4/8/8/8 w - - 0 1",
    moves: [
      M("Kc4", "1.Kc4 — Triangulation! Lose a tempo to put Black in zugzwang."),
      M("Kc7", "1...Kc7 2.Kd4 — Returning with Black to move."),
    ],
  },
  "pe-11": {
    startFen: "8/8/3k4/3P4/3K4/8/8/8 w - - 0 1",
    moves: [
      M("Kc4", "1.Kc4 — Triangulation! Lose a tempo to put Black in zugzwang."),
      M("Kc7", "1...Kc7 2.Kd4 — Returning with Black to move."),
    ],
  },
  "pe-12": {
    startFen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Kd3", "1.Kd3 — King leads the pawn (golden rule of K+P endings)."),
      M("Kd5", "1...Kd5 — Black tries to block."),
      M("Ke3", "2.Ke3 — White maintains opposition."),
      M("Ke5", "2...Ke5 3.e3 — Patient triangulation."),
    ],
  },
  "pe-13": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-14": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-15": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-17": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-18": {
    startFen: "8/8/8/4k3/8/4K3/8/4R3 w - - 0 1",
    moves: [
    ],
  },
  "pe-19": {
    startFen: "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
    moves: [
      M("Ra7", "1.Ra7 — The first rook cuts off the 7th rank."),
      M("Kd8", "1...Kd8 2.Rh8# — Two-rook mate (ladder)."),
    ],
  },
  "pe-20": {
    startFen: "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
    moves: [
      M("Qd5", "1.Qd5 — Knight's-move technique. Squeeze the king to the edge."),
    ],
  },
  "pe-21": {
    startFen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
    moves: [
      M("Bd3", "1.Bd3 — Two bishops sweep diagonals to corner the king."),
      M("Kd5", "1...Kd5 2.Be2 — Patient W-maneuver."),
    ],
  },
  "pe-22": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-23": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-24": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "pe-25": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-26": {
    startFen: "8/8/3k4/3P4/3K4/8/8/8 w - - 0 1",
    moves: [
      M("Kc4", "1.Kc4 — Triangulation! Lose a tempo to put Black in zugzwang."),
      M("Kc7", "1...Kc7 2.Kd4 — Returning with Black to move."),
    ],
  },
  "pe-27": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "pe-28": {
    startFen: "8/8/4k3/8/4P3/8/4K3/4R2r w - - 0 1",
    moves: [
    ],
  },
  "pe-29": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "pe-30": {
    startFen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  "cp-2": {
    startFen: "r1bqkbnr/pp1npppp/2p5/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 1 4",
    moves: [
      M("Nf3", "3.Nf3 — Black's c8 bishop is locked in (bad bishop)."),
    ],
  },
  "cp-3": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("a3", "1.a3 — Prophylaxis: prevent ...Bb4 ideas before they arise."),
    ],
  },
  "cp-4": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Bg5", "1.Bg5 — Trade pieces when ahead in material or to simplify."),
    ],
  },
  "cp-5": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ng5", "1.Ng5 — Kingside attack starts!"),
      M("h6", "1...h6 2.h4 — Pawn storm!"),
    ],
  },
  "cp-6": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("a3", "1.a3 — Preparing b4 queenside expansion."),
      M("a5", "1...a5 2.b3 — Slow positional pressure."),
    ],
  },
  "cp-7": {
    startFen: "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("c5", "1.c5 — A central pawn break to clarify the structure!"),
    ],
  },
  "cp-8": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("a3", "1.a3 — Pieces work together: bishop, knight, queen aligned."),
    ],
  },
  "cp-9": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "cp-10": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
    ],
  },
  "cp-11": {
    startFen: "r4rk1/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/R4RK1 w - - 0 1",
    moves: [
    ],
  },
  "cp-12": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    moves: [
      M("Bc2", "1.Bc2 — Around the IQP, pieces find active squares."),
      M("Re8", "1...Re8 — Black presses against d4."),
    ],
  },
  "cp-13": {
    startFen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("Be2", "1.Be2 — d6 is a backward pawn — a chronic weakness."),
    ],
  },
  "cp-14": {
    startFen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    moves: [
      M("cxd5", "1.cxd5 cxd5 — Doubled c-pawns can be both weakness and strength."),
    ],
  },
  "cp-15": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4"),
    ],
  },
  "cp-16": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  "cp-17": {
    startFen: "r1bq1rk1/pp3ppp/2n2n2/3p4/3N4/2N5/PPP2PPP/R1BQ1RK1 w - - 0 1",
    moves: [
    ],
  },
  "cp-18": {
    startFen: "r4rk1/pp2qppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 1",
    moves: [
    ],
  },
  "cp-19": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 1",
    moves: [
      M("b4", "1.b4 — The Minority Attack! White's two pawns attack three."),
      M("a5", "1...a5 2.b5 — Creating a weakness on c6."),
    ],
  },
  "cp-20": {
    startFen: "r1bqkbnr/pp1n1ppp/2p1p3/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 2 5",
    moves: [
      M("Nf3", "2.Nf3 — Pawn chains: attack the base!"),
    ],
  },
  "cp-21": {
    startFen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  "cp-22": {
    startFen: "r1bqk1nr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 4",
    moves: [
      M("d3", "4.d3 — The bishop pair shines in open positions."),
    ],
  },
  "cp-23": {
    startFen: "r1bqkbnr/pp1npppp/2p5/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 1 4",
    moves: [
      M("Nf3", "3.Nf3 — Black's c8 bishop is locked in (bad bishop)."),
    ],
  },
  "cp-24": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("a3", "1.a3 — Prophylaxis: prevent ...Bb4 ideas before they arise."),
    ],
  },
  "cp-25": {
    startFen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Bg5", "1.Bg5 — Trade pieces when ahead in material or to simplify."),
    ],
  },
  "cp-26": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ng5", "1.Ng5 — Kingside attack starts!"),
      M("h6", "1...h6 2.h4 — Pawn storm!"),
    ],
  },
  "cp-27": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("a3", "1.a3 — Preparing b4 queenside expansion."),
      M("a5", "1...a5 2.b3 — Slow positional pressure."),
    ],
  },
  "cp-28": {
    startFen: "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("c5", "1.c5 — A central pawn break to clarify the structure!"),
    ],
  },
  "cp-29": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("a3", "1.a3 — Pieces work together: bishop, knight, queen aligned."),
    ],
  },
  "cp-30": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  "ct-2": {
    startFen: "8/8/8/3k4/8/3K4/3R4/3q4 w - - 0 1",
    moves: [
      M("Rxd1", "1.Rxd1+ — But there's a skewer ready!"),
    ],
  },
  "ct-3": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-4": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4",
    moves: [
      M("Nxe5", "1.Nxe5! — Knight moves, opening a discovered attack."),
      M("Nxe5", "1...Nxe5 2.d4 — Central break exploits the discovery."),
    ],
  },
  "ct-6": {
    startFen: "r1bqkb1r/pppp1Bpp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
    ],
  },
  "ct-7": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-8": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-9": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-10": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-11": {
    startFen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bxf7+", "1.Bxf7+! — Removing the defender of e5."),
      M("Rxf7", "1...Rxf7 2.Nxe5 — The defender gone, the pawn falls."),
    ],
  },
  "ct-12": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-13": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-14": {
    startFen: "r1bq1rk1/pp3ppp/2n2n2/2bpp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 7",
    moves: [
    ],
  },
  "ct-15": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 5",
    moves: [
      M("Nd5", "1.Nd5! — Clearance: the knight clears the c-file with tempo."),
      M("Nxd5", "1...Nxd5 2.exd5 — The line is open!"),
    ],
  },
  "ct-16": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Threatening f7."),
      M("d5", "1...d5! — A zwischenzug! Black ignores the threat."),
      M("exd5", "2.exd5 Na5 — The intermezzo bought time."),
    ],
  },
  "ct-17": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Threatening f7."),
      M("d5", "1...d5! — A zwischenzug! Black ignores the threat."),
      M("exd5", "2.exd5 Na5 — The intermezzo bought time."),
    ],
  },
  "ct-18": {
    startFen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    moves: [
      M("Ra8#", "1.Ra8+ — The back rank weakness!"),
    ],
  },
  "ct-19": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-20": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 1",
    moves: [
      M("cxd5", "1.cxd5 exd5 2.Nb5 — Tactical possibilities arise from active piece play."),
    ],
  },
  "ct-21": {
    startFen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
    moves: [
      M("Nf7#", "1.Nf7+ Kg8 — Knight checks."),
    ],
  },
  "ct-22": {
    startFen: "r4rk1/1b3ppp/p2qpn2/1pn5/2p5/2N1P1B1/PPQ1BPPP/R4RK1 w - - 0 1",
    moves: [
    ],
  },
  "ct-23": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-24": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-25": {
    startFen: "r4rk1/pp3ppp/2n5/2bqp3/8/2N5/PPPQBPPP/R4RK1 w - - 0 1",
    moves: [
      M("Nxd5", "1.Nxd5! — The queen is overloaded defending two things."),
    ],
  },
  "ct-26": {
    startFen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    moves: [
      M("a6", "1...a6 — Challenging the pinning bishop."),
      M("Bxc6", "2.Bxc6 — Trade or retreat?"),
    ],
  },
  "ct-27": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-28": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-29": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "ct-30": {
    startFen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  "cb-1": {
    moves: [
    ],
  },
  "cb-2": {
    moves: [
    ],
  },
  "cb-3": {
    moves: [
    ],
  },
  "cb-4": {
    moves: [
    ],
  },
  "cb-5": {
    moves: [
    ],
  },
  "cb-6": {
    moves: [
    ],
  },
  "cb-7": {
    moves: [
    ],
  },
  "cb-8": {
    startFen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 4",
    moves: [
      M("Bb5+", "1.Bb5+ — Check! Black must respond immediately."),
    ],
  },
  "cb-9": {
    startFen: "r3k2r/pppq1ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQ1PPP/R3K2R w KQkq - 0 1",
    moves: [
      M("O-O", "1.O-O — Kingside castling: king to g1, rook to f1."),
      M("O-O-O", "1...O-O-O — Queenside castling: king to c8, rook to d8."),
    ],
  },
  "cb-10": {
    startFen: "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
    moves: [
      M("exd6", "1.exd6 — En passant! The d-pawn just advanced two; we capture as if it moved one."),
    ],
  },
  "cb-11": {
    moves: [
    ],
  },
  "cb-12": {
    startFen: "r1bqk2r/pppp1Qpp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
    moves: [
    ],
  },
  "cb-13": {
    startFen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 4",
    moves: [
      M("Bb5+", "1.Bb5+ — Check! Black must respond immediately."),
    ],
  },
  "cb-14": {
    startFen: "r3k2r/pppq1ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQ1PPP/R3K2R w KQkq - 0 1",
    moves: [
      M("O-O", "1.O-O — Kingside castling: king to g1, rook to f1."),
      M("O-O-O", "1...O-O-O — Queenside castling: king to c8, rook to d8."),
    ],
  },
  "cb-15": {
    startFen: "r1bqk2r/pppp1Qpp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
    moves: [
    ],
  },
  "cb-16": {
    startFen: "r1bqk2r/pppp1Qpp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
    moves: [
    ],
  },
  "cb-17": {
    moves: [
    ],
  },
  "cb-18": {
    moves: [
    ],
  },
  "cb-19": {
    moves: [
    ],
  },
  "cb-20": {
    startFen: "r3k2r/pppq1ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQ1PPP/R3K2R w KQkq - 0 1",
    moves: [
      M("O-O", "1.O-O — Kingside castling: king to g1, rook to f1."),
      M("O-O-O", "1...O-O-O — Queenside castling: king to c8, rook to d8."),
    ],
  },
  "mg-1": {
    startFen: "r1bqkb1r/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 7",
    moves: [
      M("Bd3", "1.Bd3 — Transform the structure: trade or push?"),
    ],
  },
  "mg-2": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Nxd5", "1.Nxd5! — A piece sac to expose the king!"),
      M("exd5", "1...exd5 2.Bxh7+ — The attack rolls on!"),
    ],
  },
  "mg-3": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Re1", "1.Re1 — Model middlegame setup."),
    ],
  },
  "mg-4": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "mg-5": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "mg-6": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
      M("Ne5", "1.Ne5 — Classical attacking buildup: knight + bishop on h7."),
    ],
  },
  "mg-7": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  "mg-8": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("h3", "1.h3 — Preparing g4-g5 pawn storm!"),
      M("Nh5", "1...Nh5 2.g4 — Aggressive expansion."),
    ],
  },
  "mg-9": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4",
    moves: [
      M("Bc5", "3...Bc5 — Open positions favor the bishops and quick development."),
    ],
  },
  "mg-10": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
    ],
  },
  "mg-11": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "mg-12": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 b - - 0 8",
    moves: [
      M("c5", "1...c5! — The best defense is a counterattack!"),
      M("dxc5", "2.dxc5 Nxc5 — Black equalizes activity."),
    ],
  },
  "mg-13": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b5/2B1p3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 7",
    moves: [
      M("dxe4", "1.dxe4 — King safety first; never leave the king exposed."),
    ],
  },
  "mg-14": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "mg-15": {
    startFen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  "mg-16": {
    startFen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ne5", "1.Ne5 — Activate every piece to its best square!"),
    ],
  },
  "mg-17": {
    startFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4",
    moves: [
      M("Bc5", "3...Bc5 — Open positions favor the bishops and quick development."),
    ],
  },
  "mg-18": {
    startFen: "rnbqkb1r/pp1n1ppp/4p3/2ppP3/3P4/2P5/PP1N1PPP/R1BQKBNR w KQkq - 0 5",
    moves: [
    ],
  },
  "mg-19": {
    startFen: "r1bq1rk1/pppp1ppp/2n2n2/2b5/2B1p3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 7",
    moves: [
      M("dxe4", "1.dxe4 — King safety first; never leave the king exposed."),
    ],
  },
  "mg-20": {
    startFen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP1QPPP/R1B2RK1 w - - 0 9",
    moves: [
      M("Nh4", "1.Nh4 — Knight reroutes to f5 — patient maneuvering."),
      M("Re8", "1...Re8 2.Nf5 — Long-term piece improvement."),
    ],
  },
  "re-1": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "re-2": {
    startFen: "1K6/1P6/8/8/8/8/r7/2k4R w - - 0 1",
    moves: [
      M("Rh4", "1.Rh4 — Building the bridge! The rook prepares to shield the king from checks."),
    ],
  },
  "re-3": {
    startFen: "4k3/R7/4K3/4P3/8/8/8/r7 b - - 0 1",
    moves: [
      M("Ra6+", "1...Ra6! — The Philidor Defense! Rook on the 6th rank prevents White's king from advancing."),
    ],
  },
  "re-4": {
    startFen: "8/8/4k3/8/4P3/8/4K3/4R2r w - - 0 1",
    moves: [
    ],
  },
  "re-5": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "re-6": {
    startFen: "8/8/8/4k3/8/4K3/8/4R3 w - - 0 1",
    moves: [
    ],
  },
  "re-7": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "re-8": {
    startFen: "8/8/4k3/8/4P3/8/4K3/4R2r w - - 0 1",
    moves: [
    ],
  },
  "re-9": {
    startFen: "8/8/4k3/8/4P3/8/4K3/4R2r w - - 0 1",
    moves: [
    ],
  },
  "re-10": {
    startFen: "8/8/4k3/8/4P3/8/4K3/4R2r w - - 0 1",
    moves: [
    ],
  },
  "re-11": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "re-12": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "re-13": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "re-14": {
    startFen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Kd3", "1.Kd3 — King leads the pawn (golden rule of K+P endings)."),
      M("Kd5", "1...Kd5 — Black tries to block."),
      M("Ke3", "2.Ke3 — White maintains opposition."),
      M("Ke5", "2...Ke5 3.e3 — Patient triangulation."),
    ],
  },
  "re-15": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "re-16": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "re-17": {
    startFen: "8/k7/P7/K7/8/8/8/7r w - - 0 1",
    moves: [
      M("Kb5", "1.Kb5 — White tries to escort the a-pawn."),
      M("Rh5+", "1...Rh5+ — The Vančura Defense! Rook checks from the side."),
      M("Kc6", "2.Kc6 Rh6+ — More checks; Black holds."),
    ],
  },
  "re-18": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  "re-19": {
    startFen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  "re-20": {
    startFen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
};

// ===== VARIATIONS DATA =====
// Add variations to lessons that naturally discuss multiple lines.
// The UI will render one InteractiveBoard per variation.

// Helper to add variations to existing entries
function addVariations(id: string, variations: LessonVariation[]) {
  if (LESSON_MOVES[id]) {
    LESSON_MOVES[id].variations = variations;
  } else {
    LESSON_MOVES[id] = { moves: [], variations };
  }
}

// === OPENING FUNDAMENTALS ===

addVariations("of-4", [
  V("Italian Game: Giuoco Piano", [
    M("e4", "1.e4 — Open the game."),
    M("e5", "1...e5."),
    M("Nf3", "2.Nf3 — Attack e5."),
    M("Nc6", "2...Nc6 — Defend."),
    M("Bc4", "3.Bc4 — The Italian! Targeting f7."),
    M("Bc5", "3...Bc5 — Giuoco Piano (Quiet Game)."),
    M("c3", "4.c3 — Preparing d4."),
    M("Nf6", "4...Nf6."),
    M("d4", "5.d4! — The central break!"),
  ]),
  V("Italian Game: Two Knights Defense", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("Nf3", "2.Nf3."),
    M("Nc6", "2...Nc6."),
    M("Bc4", "3.Bc4."),
    M("Nf6", "3...Nf6 — The Two Knights! Counter-attacking e4 immediately."),
    M("Ng5", "4.Ng5 — Threatening Nxf7! Aggressive."),
    M("d5", "4...d5! — The best defense. Counter in the center."),
    M("exd5", "5.exd5."),
    M("Na5", "5...Na5 — Attacking the bishop. The Traxler (4...Bc5) is a wild alternative."),
  ]),
]);

addVariations("of-5", [
  V("Sicilian: Open (Najdorf)", [
    M("e4", "1.e4."),
    M("c5", "1...c5 — The Sicilian."),
    M("Nf3", "2.Nf3."),
    M("d6", "2...d6."),
    M("d4", "3.d4."),
    M("cxd4", "3...cxd4."),
    M("Nxd4", "4.Nxd4."),
    M("Nf6", "4...Nf6."),
    M("Nc3", "5.Nc3."),
    M("a6", "5...a6 — The Najdorf! The most popular Sicilian."),
  ]),
  V("Sicilian: Dragon", [
    M("e4", "1.e4."),
    M("c5", "1...c5."),
    M("Nf3", "2.Nf3."),
    M("d6", "2...d6."),
    M("d4", "3.d4."),
    M("cxd4", "3...cxd4."),
    M("Nxd4", "4.Nxd4."),
    M("Nf6", "4...Nf6."),
    M("Nc3", "5.Nc3."),
    M("g6", "5...g6 — The Dragon! Fianchetto the bishop for maximum aggression."),
  ]),
  V("Sicilian: Closed (Alapin)", [
    M("e4", "1.e4."),
    M("c5", "1...c5."),
    M("c3", "2.c3 — The Alapin! Avoiding the Open Sicilian. Preparing d4."),
    M("Nf6", "2...Nf6."),
    M("e5", "3.e5 — Gaining space."),
    M("Nd5", "3...Nd5 — Knight to a strong central square."),
  ]),
]);

addVariations("of-13", [
  V("1.e4 — King's Pawn", [
    M("e4", "1.e4 — Opens lines for bishop and queen. Leads to open tactical games."),
    M("e5", "1...e5 — Classical symmetric response."),
    M("Nf3", "2.Nf3 — Natural development, attacking e5."),
  ]),
  V("1.d4 — Queen's Pawn", [
    M("d4", "1.d4 — Strategic and solid. Leads to positional games."),
    M("d5", "1...d5 — Classical response, contesting the center."),
    M("c4", "2.c4 — The Queen's Gambit! Challenging Black's center."),
  ]),
  V("1.c4 — English Opening", [
    M("c4", "1.c4 — The English! Flexible: can transpose to many systems."),
    M("e5", "1...e5 — Reversed Sicilian structure."),
    M("Nc3", "2.Nc3 — Develops toward the center."),
  ]),
]);

addVariations("of-14", [
  V("1...e5 — Classical", [
    M("e4", "1.e4."),
    M("e5", "1...e5 — The most natural response. Symmetric and principled."),
    M("Nf3", "2.Nf3 — Leads to Italian, Ruy Lopez, Scotch, etc."),
  ]),
  V("1...c5 — Sicilian Defense", [
    M("e4", "1.e4."),
    M("c5", "1...c5 — The Sicilian! Most popular and fighting response."),
    M("Nf3", "2.Nf3 — Heading for the Open Sicilian."),
  ]),
  V("1...e6 — French Defense", [
    M("e4", "1.e4."),
    M("e6", "1...e6 — The French! Solid, strategic. Plans ...d5 next."),
    M("d4", "2.d4."),
    M("d5", "2...d5 — Challenging the center."),
  ]),
  V("1...c6 — Caro-Kann", [
    M("e4", "1.e4."),
    M("c6", "1...c6 — The Caro-Kann! Solid as a rock. Prepares ...d5 with active bishop."),
    M("d4", "2.d4."),
    M("d5", "2...d5 — Center challenged with the bishop still free."),
  ]),
]);

addVariations("of-15", [
  V("1...d5 — Classical QGD", [
    M("d4", "1.d4."),
    M("d5", "1...d5 — Directly contesting the center."),
    M("c4", "2.c4 — The Queen's Gambit!"),
    M("e6", "2...e6 — QGD: solid and classical."),
  ]),
  V("1...Nf6 — Indian Systems", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6 — Flexible! Can lead to King's Indian, Nimzo, Queen's Indian."),
    M("c4", "2.c4."),
    M("g6", "2...g6 — King's Indian Defense: hypermodern and dynamic."),
  ]),
  V("1...f5 — Dutch Defense", [
    M("d4", "1.d4."),
    M("f5", "1...f5 — The Dutch! Aggressive claim on e4. Risky but dynamic."),
    M("c4", "2.c4."),
    M("Nf6", "2...Nf6 — Developing toward the center."),
  ]),
]);

addVariations("of-22", [
  V("King's Gambit", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("f4", "2.f4 — The King's Gambit! White offers the f-pawn."),
    M("exf4", "2...exf4 — Accepted."),
    M("Nf3", "3.Nf3 — Rapid development, open f-file coming."),
  ]),
  V("Queen's Gambit", [
    M("d4", "1.d4."),
    M("d5", "1...d5."),
    M("c4", "2.c4 — The Queen's Gambit! Not a true gambit — White can regain the pawn."),
    M("dxc4", "2...dxc4 — Accepted."),
    M("e3", "3.e3 — White will recapture the pawn naturally."),
  ]),
  V("Evans Gambit", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("Nf3", "2.Nf3."),
    M("Nc6", "2...Nc6."),
    M("Bc4", "3.Bc4."),
    M("Bc5", "3...Bc5."),
    M("b4", "4.b4!? — The Evans Gambit! Sacrifice for rapid development."),
  ]),
]);

// === TACTICAL PATTERNS ===

addVariations("tp-2", [
  V("Absolute Pin (against the King)", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("Nf3", "2.Nf3."),
    M("Nc6", "2...Nc6."),
    M("Bb5", "3.Bb5 — Absolute pin! The Nc6 cannot move — it would expose the king to check."),
  ]),
  V("Relative Pin (against the Queen)", [
    M("d4", "1.d4."),
    M("d5", "1...d5."),
    M("c4", "2.c4."),
    M("e6", "2...e6."),
    M("Nc3", "3.Nc3."),
    M("Nf6", "3...Nf6."),
    M("Bg5", "4.Bg5 — Relative pin! The Nf6 CAN move, but it would lose the queen behind it."),
  ]),
]);

addVariations("tp-5", [
  V("Knight Fork: King & Queen", [
    M("Nxf7", "Nxf7! — The knight attacks the queen AND the rook simultaneously."),
    M("Qe7", "Qe7 — Queen retreats."),
    M("Nxh8", "Nxh8 — White wins the rook!"),
  ], "r1bqk2r/pppp1ppp/2n2n2/2b1N3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5"),
  V("Knight Fork: King & Rook (from c7)", [
    M("Nc7+", "Nc7+ — The classic royal fork from c7! Attacks king and rook."),
    M("Kd8", "Kd8 — King must move."),
    M("Nxa8", "Nxa8 — White wins the rook!"),
  ], "r1bqkb1r/ppNp1ppp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 5"),
]);

addVariations("tp-12", [
  V("The Greek Gift: Bxh7+", [
    M("Bxh7+", "Bxh7+! — The Greek Gift! Ripping open the king's shelter."),
    M("Kxh7", "Kxh7 — Forced to accept."),
    M("Ng5+", "Ng5+ — Knight leaps in with check!"),
    M("Kg8", "Kg8 — Retreating."),
    M("Qh5", "Qh5 — Threatening Qxf7# and Qh7#. Devastating!"),
  ], "r1bq1rk1/pppn1ppp/4pn2/3p2B1/1bBP4/2N1PN2/PPP2PPP/R2QK2R w KQ - 0 7"),
  V("Greek Gift: Conditions Check", [
    M("Bxh7+", "Bxh7+! — Before sacrificing, verify: Knight can reach g5? Queen can reach h5? No Nf6 to block?"),
    M("Kxh7", "Kxh7."),
    M("Ng5+", "Ng5+ — ✓ Knight reaches g5 with check."),
    M("Kg6", "Kg6 — What if the king goes forward?"),
    M("Qd3+", "Qd3+ — Check! Driving the king further into danger."),
  ], "r1bq1rk1/pppn1ppp/4p3/3p2B1/1bBP4/2N1PN2/PPP2PPP/R2QK2R w KQ - 0 7"),
]);

// === ENDGAME MASTERY ===

addVariations("em-1", [
  V("King Leads the Pawn (Win)", [
    M("Kf3", "Kf3 — King leads the pawn! Getting in front."),
    M("Ke6", "Ke6 — Black tries to block."),
    M("Ke4", "Ke4 — Opposition! Black must give way."),
    M("Kd6", "Kd6 — Forced to step aside."),
    M("Kf5", "Kf5 — King advances past the pawn."),
    M("Ke7", "Ke7."),
    M("Ke5", "Ke5 — Opposition again! White controls the key squares."),
  ], "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1"),
  V("Pawn Ahead of King (Draw)", [
    M("e4", "e4? — Pushing the pawn too early without king support."),
    M("Ke6", "Ke6 — Black takes the opposition!"),
    M("Ke4", "Ke4."),
    M("Ke7", "Ke7 — Black maintains opposition. White cannot make progress."),
    M("e5", "e5."),
    M("Ke8", "Ke8! — Opposition! This is a draw — White's king can't advance."),
  ], "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1"),
]);

addVariations("em-4", [
  V("King Inside the Square (Draw)", [
    M("Ke2", "Ke2."),
    M("Kc6", "Kc6 — Heading toward the pawn."),
    M("Ke3", "Ke3."),
    M("Kd7", "Kd7 — The king enters the 'square of the pawn.'"),
    M("Ke4", "Ke4."),
    M("Ke7", "Ke7 — Inside the square! Black will catch the pawn."),
    M("e6", "e6."),
    M("Ke8", "Ke8 — Caught! It's a draw."),
  ], "8/8/8/1k2P3/8/8/8/4K3 w - - 0 1"),
  V("King Outside the Square (Win)", [
    M("e6", "e6! — Push immediately! Draw the square: e6-e8-c8-c6. Black is on b5 — OUTSIDE!"),
    M("Kc6", "Kc6 — Trying to catch up."),
    M("e7", "e7 — The pawn is too fast!"),
    M("Kd7", "Kd7 — Almost there..."),
    M("e8=Q", "e8=Q — Promoted! The king couldn't catch the pawn."),
  ], "8/8/8/1k2P3/8/8/8/4K3 w - - 0 1"),
]);

// === QUEEN'S GAMBIT ===

addVariations("qg-1", [
  V("Queen's Gambit Declined (2...e6)", [
    M("d4", "1.d4."),
    M("d5", "1...d5."),
    M("c4", "2.c4 — The Queen's Gambit!"),
    M("e6", "2...e6 — Declined! Solid and classical."),
    M("Nc3", "3.Nc3."),
    M("Nf6", "3...Nf6 — Standard development."),
  ]),
  V("Queen's Gambit Accepted (2...dxc4)", [
    M("d4", "1.d4."),
    M("d5", "1...d5."),
    M("c4", "2.c4."),
    M("dxc4", "2...dxc4 — Accepted! Black takes the pawn."),
    M("Nf3", "3.Nf3 — Don't rush to recapture. Develop first!"),
    M("Nf6", "3...Nf6."),
    M("e3", "4.e3 — Preparing Bxc4."),
  ]),
  V("Slav Defense (2...c6)", [
    M("d4", "1.d4."),
    M("d5", "1...d5."),
    M("c4", "2.c4."),
    M("c6", "2...c6 — The Slav! Supports d5 while keeping the bishop free."),
    M("Nf3", "3.Nf3."),
    M("Nf6", "3...Nf6."),
    M("Nc3", "4.Nc3."),
    M("Bf5", "4...Bf5 — Bishop developed outside the chain!"),
  ]),
]);

// === RUY LOPEZ ===

addVariations("rl-1", [
  V("Morphy Defense (3...a6)", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("Nf3", "2.Nf3."),
    M("Nc6", "2...Nc6."),
    M("Bb5", "3.Bb5 — The Ruy Lopez!"),
    M("a6", "3...a6 — The Morphy Defense. Asking the bishop its intentions."),
    M("Ba4", "4.Ba4 — Maintaining the pin."),
    M("Nf6", "4...Nf6."),
    M("O-O", "5.O-O — Castle early."),
  ]),
  V("Berlin Defense (3...Nf6)", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("Nf3", "2.Nf3."),
    M("Nc6", "2...Nc6."),
    M("Bb5", "3.Bb5."),
    M("Nf6", "3...Nf6 — The Berlin! Counter-attacks e4. Kramnik's weapon."),
    M("O-O", "4.O-O."),
    M("Nxe4", "4...Nxe4 — Berlin endgame coming: 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5 8.Qxd8+ Kxd8"),
  ]),
  V("Exchange Variation (4.Bxc6)", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("Nf3", "2.Nf3."),
    M("Nc6", "2...Nc6."),
    M("Bb5", "3.Bb5."),
    M("a6", "3...a6."),
    M("Bxc6", "4.Bxc6 — The Exchange! Damages Black's structure."),
    M("dxc6", "4...dxc6 — Doubled pawns, but Black gets the bishop pair."),
  ]),
]);

// === KING'S INDIAN ===

addVariations("ki-1", [
  V("Classical Variation", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6."),
    M("c4", "2.c4."),
    M("g6", "2...g6 — The KID!"),
    M("Nc3", "3.Nc3."),
    M("Bg7", "3...Bg7 — Fianchetto!"),
    M("e4", "4.e4 — White builds a massive center."),
    M("d6", "4...d6."),
    M("Nf3", "5.Nf3."),
    M("O-O", "5...O-O."),
    M("Be2", "6.Be2 — Classical setup."),
    M("e5", "6...e5! — The key break!"),
  ]),
  V("Sämisch Variation (5.f3)", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6."),
    M("c4", "2.c4."),
    M("g6", "2...g6."),
    M("Nc3", "3.Nc3."),
    M("Bg7", "3...Bg7."),
    M("e4", "4.e4."),
    M("d6", "4...d6."),
    M("f3", "5.f3 — The Sämisch! Aggressive. Prepares Be3+Qd2."),
    M("O-O", "5...O-O."),
  ]),
  V("Fianchetto Variation", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6."),
    M("c4", "2.c4."),
    M("g6", "2...g6."),
    M("Nf3", "3.Nf3 — Avoiding e4. Fianchetto coming."),
    M("Bg7", "3...Bg7."),
    M("g3", "4.g3 — The Fianchetto! Positional approach."),
    M("O-O", "4...O-O."),
    M("Bg2", "5.Bg2 — Dueling fianchettos!"),
  ]),
]);

// === FRENCH DEFENSE ===

addVariations("fr-1", [
  V("Advance Variation (3.e5)", [
    M("e4", "1.e4."),
    M("e6", "1...e6 — The French!"),
    M("d4", "2.d4."),
    M("d5", "2...d5."),
    M("e5", "3.e5 — The Advance! White gains space."),
    M("c5", "3...c5 — Attack the base of the chain!"),
  ]),
  V("Winawer Variation (3...Bb4)", [
    M("e4", "1.e4."),
    M("e6", "1...e6."),
    M("d4", "2.d4."),
    M("d5", "2...d5."),
    M("Nc3", "3.Nc3."),
    M("Bb4", "3...Bb4 — The Winawer! Pinning the knight. Very sharp."),
  ]),
  V("Classical Variation (3...Nf6)", [
    M("e4", "1.e4."),
    M("e6", "1...e6."),
    M("d4", "2.d4."),
    M("d5", "2...d5."),
    M("Nc3", "3.Nc3."),
    M("Nf6", "3...Nf6 — Classical: developing naturally."),
    M("Bg5", "4.Bg5 — Pinning the knight!"),
  ]),
]);

// === CARO-KANN ===

addVariations("ck-1", [
  V("Classical (3...dxe4 4...Bf5)", [
    M("e4", "1.e4."),
    M("c6", "1...c6 — The Caro-Kann!"),
    M("d4", "2.d4."),
    M("d5", "2...d5 — Challenge!"),
    M("Nc3", "3.Nc3."),
    M("dxe4", "3...dxe4."),
    M("Nxe4", "4.Nxe4."),
    M("Bf5", "4...Bf5 — The key move! Bishop outside the chain."),
  ]),
  V("Advance (3.e5)", [
    M("e4", "1.e4."),
    M("c6", "1...c6."),
    M("d4", "2.d4."),
    M("d5", "2...d5."),
    M("e5", "3.e5 — The Advance! White gains space."),
    M("Bf5", "3...Bf5 — Unlike the French, the bishop is active!"),
    M("Nf3", "4.Nf3."),
    M("e6", "4...e6 — Prepare ...c5."),
  ]),
  V("Panov-Botvinnik Attack", [
    M("e4", "1.e4."),
    M("c6", "1...c6."),
    M("d4", "2.d4."),
    M("d5", "2...d5."),
    M("exd5", "3.exd5."),
    M("cxd5", "3...cxd5."),
    M("c4", "4.c4 — The Panov! Creating an IQP structure."),
    M("Nf6", "4...Nf6 — Dynamic middlegame ahead."),
  ]),
]);

// === LONDON SYSTEM ===

addVariations("ls-1", [
  V("Standard London Setup", [
    M("d4", "1.d4 — Start the London."),
    M("d5", "1...d5."),
    M("Bf4", "2.Bf4 — Bishop BEFORE e3! The London move order."),
    M("Nf6", "2...Nf6."),
    M("e3", "3.e3 — Solidify the center."),
    M("e6", "3...e6."),
    M("Nf3", "4.Nf3."),
    M("c5", "4...c5."),
    M("Bd3", "5.Bd3 — London setup complete!"),
  ]),
  V("London vs King's Indian Setup", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6."),
    M("Bf4", "2.Bf4."),
    M("g6", "2...g6 — KID-style."),
    M("e3", "3.e3."),
    M("Bg7", "3...Bg7."),
    M("Nf3", "4.Nf3."),
    M("O-O", "4...O-O."),
    M("Nbd2", "5.Nbd2 — Supports the e4 break!"),
  ]),
]);

// === SICILIAN DEEP DIVE ===

addVariations("sd-1", [
  V("Open Sicilian: Najdorf", [
    M("e4", "1.e4."),
    M("c5", "1...c5."),
    M("Nf3", "2.Nf3."),
    M("d6", "2...d6."),
    M("d4", "3.d4."),
    M("cxd4", "3...cxd4."),
    M("Nxd4", "4.Nxd4."),
    M("Nf6", "4...Nf6."),
    M("Nc3", "5.Nc3."),
    M("a6", "5...a6 — The Najdorf! Bobby Fischer's weapon."),
  ]),
  V("Open Sicilian: Dragon", [
    M("e4", "1.e4."),
    M("c5", "1...c5."),
    M("Nf3", "2.Nf3."),
    M("d6", "2...d6."),
    M("d4", "3.d4."),
    M("cxd4", "3...cxd4."),
    M("Nxd4", "4.Nxd4."),
    M("Nf6", "4...Nf6."),
    M("Nc3", "5.Nc3."),
    M("g6", "5...g6 — The Dragon! Fianchetto for maximum fire."),
  ]),
  V("Open Sicilian: Classical", [
    M("e4", "1.e4."),
    M("c5", "1...c5."),
    M("Nf3", "2.Nf3."),
    M("d6", "2...d6."),
    M("d4", "3.d4."),
    M("cxd4", "3...cxd4."),
    M("Nxd4", "4.Nxd4."),
    M("Nf6", "4...Nf6."),
    M("Nc3", "5.Nc3."),
    M("Nc6", "5...Nc6 — The Classical! Solid development."),
  ]),
]);

// === SCANDINAVIAN ===

addVariations("sc-1", [
  V("Main Line: 2...Qxd5", [
    M("e4", "1.e4."),
    M("d5", "1...d5 — The Scandinavian!"),
    M("exd5", "2.exd5."),
    M("Qxd5", "2...Qxd5 — Queen recaptures."),
    M("Nc3", "3.Nc3 — Attacking the queen."),
    M("Qa5", "3...Qa5 — Main line. Safe and active."),
  ]),
  V("Modern: 2...Nf6", [
    M("e4", "1.e4."),
    M("d5", "1...d5."),
    M("exd5", "2.exd5."),
    M("Nf6", "2...Nf6 — The Modern Scandinavian! Don't take back with queen."),
    M("d4", "3.d4."),
    M("Nxd5", "3...Nxd5 — Knight recaptures. No queen exposure."),
  ]),
]);

// === DUTCH DEFENSE ===

addVariations("du-1", [
  V("Leningrad Dutch", [
    M("d4", "1.d4."),
    M("f5", "1...f5 — The Dutch!"),
    M("c4", "2.c4."),
    M("Nf6", "2...Nf6."),
    M("g3", "3.g3."),
    M("g6", "3...g6 — Leningrad! Fianchetto for maximum aggression."),
    M("Bg2", "4.Bg2."),
    M("Bg7", "4...Bg7 — Powerful bishop on the long diagonal."),
  ]),
  V("Stonewall Dutch", [
    M("d4", "1.d4."),
    M("f5", "1...f5."),
    M("c4", "2.c4."),
    M("e6", "2...e6 — Stonewall setup coming."),
    M("Nf3", "3.Nf3."),
    M("Nf6", "3...Nf6."),
    M("g3", "4.g3."),
    M("d5", "4...d5 — The Stonewall! Pawns on d5, e6, f5 form a wall."),
  ]),
  V("Classical Dutch", [
    M("d4", "1.d4."),
    M("f5", "1...f5."),
    M("c4", "2.c4."),
    M("e6", "2...e6."),
    M("Nf3", "3.Nf3."),
    M("Nf6", "3...Nf6."),
    M("g3", "4.g3."),
    M("Be7", "4...Be7 — Classical: solid development before deciding on setup."),
  ]),
]);

// === NIMZO-INDIAN ===

addVariations("ni-1", [
  V("Classical (4.Qc2)", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6."),
    M("c4", "2.c4."),
    M("e6", "2...e6."),
    M("Nc3", "3.Nc3."),
    M("Bb4", "3...Bb4 — The Nimzo-Indian! Pinning the knight."),
    M("Qc2", "4.Qc2 — Classical: prevents doubled pawns."),
    M("O-O", "4...O-O — Flexible."),
  ]),
  V("Rubinstein (4.e3)", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6."),
    M("c4", "2.c4."),
    M("e6", "2...e6."),
    M("Nc3", "3.Nc3."),
    M("Bb4", "3...Bb4."),
    M("e3", "4.e3 — Rubinstein: accepts doubled pawns for central play."),
    M("O-O", "4...O-O."),
    M("Bd3", "5.Bd3 — Developing naturally."),
  ]),
  V("Kasparov Variation (4.Nf3)", [
    M("d4", "1.d4."),
    M("Nf6", "1...Nf6."),
    M("c4", "2.c4."),
    M("e6", "2...e6."),
    M("Nc3", "3.Nc3."),
    M("Bb4", "3...Bb4."),
    M("Nf3", "4.Nf3 — Kasparov's choice. Flexible development."),
    M("c5", "4...c5 — Challenging d4."),
  ]),
]);

// === POSITIONAL PLAY ===

addVariations("pp-1", [
  V("Ideal Pawn Center (d4+e4)", [
    M("e4", "1.e4."),
    M("e5", "1...e5."),
    M("d4", "2.d4 — Two pawns in the center!"),
    M("exd4", "2...exd4."),
    M("Qxd4", "3.Qxd4 — White maintains one pawn but center was opened."),
  ]),
  V("Pawn Chain: French Structure", [
    M("e4", "1.e4."),
    M("e6", "1...e6."),
    M("d4", "2.d4."),
    M("d5", "2...d5."),
    M("e5", "3.e5 — Pawn chain! Base=d4, head=e5. Black attacks with ...c5."),
    M("c5", "3...c5 — Targeting the base!"),
  ]),
  V("Isolated Queen's Pawn (IQP)", [
    M("d4", "1.d4."),
    M("d5", "1...d5."),
    M("c4", "2.c4."),
    M("e6", "2...e6."),
    M("Nc3", "3.Nc3."),
    M("Nf6", "3...Nf6."),
    M("cxd5", "4.cxd5 — Creates the IQP after exd5."),
    M("exd5", "4...exd5 — The isolated d-pawn! Dynamic in middlegame, weak in endgame."),
  ]),
]);

// === CHECKMATE PATTERNS ===

addVariations("cm-1", [
  V("Back Rank Mate (Rook)", [
    M("Re8#", "Re8# — Back rank mate! King trapped by f7, g7, h7."),
  ], "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1"),
  V("Back Rank Defense: Create Luft", [
    M("h3", "h3 — Create 'luft' (breathing room) for your king. Always consider this prophylactic move!"),
  ], "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1"),
]);

addVariations("cm-3", [
  V("Classic Smothered Mate", [
    M("Qe8+", "Qe8+! — Forcing the rook to capture."),
    M("Rxe8", "Rxe8 — Forced."),
    M("Nf7#", "Nf7# — Smothered mate! Boxed in by own pieces."),
  ], "r1b3kr/ppp2Npp/8/8/3n4/8/PPPnQPPP/R1B1K2R w KQ - 0 1"),
  V("Smothered Mate Setup (Philidor's Legacy)", [
    M("Nf7+", "Nf7+ — Check with the knight."),
    M("Kg8", "Kg8 — Only square."),
    M("Nh6+", "Nh6+ — Double check! King MUST move."),
    M("Kh8", "Kh8 — Forced into the corner."),
    M("Qg8+", "Qg8+! — Sacrifice! Forcing Rxg8."),
    M("Rxg8", "Rxg8 — Forced capture."),
    M("Nf7#", "Nf7# — Smothered mate! Philidor's Legacy!"),
  ], "r1b2rk1/pppp1Npp/8/8/8/2n5/PPP1QPPP/R1B2RK1 w - - 0 1"),
]);

// === ATTACKING CHESS ===

addVariations("ac-1", [
  V("Open the Center When Ahead in Development", [
    M("d4", "d4! — Development advantage? Open the position!"),
    M("exd4", "exd4."),
    M("e5", "e5 — Gaining space, driving pieces back."),
    M("d3", "d3 — Black struggles."),
    M("exf6", "exf6 — Lines opening toward the king!"),
  ], "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 6 5"),
  V("Piece Sacrifice to Open Lines", [
    M("Bxf7+", "Bxf7+! — Sacrifice to expose the king!"),
    M("Rxf7", "Rxf7 — Forced."),
    M("Ng5", "Ng5 — Now the open f-file and the knight create threats."),
  ], "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 6 5"),
]);
