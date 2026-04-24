// Library of canonical FEN positions and move sequences for endgames, tactics,
// basics, strategy, and middlegame lessons.
// Each entry is { startFen, moves: [[san, explanation], ...] }
// The matcher picks an entry by keyword in the lesson title or content.

const M = (san, expl) => [san, expl];

// ============================================================
// ENDGAME POSITIONS — canonical theoretical endings
// ============================================================
export const ENDGAME_POSITIONS = [
  {
    keys: /lucena|building.*bridge|rook.*pawn.*7th/i,
    fen: "1K6/1P6/8/8/8/8/r7/2k4R w - - 0 1",
    moves: [
      M("Rh4", "1.Rh4 — Building the bridge! The rook prepares to shield the king from checks."),
      M("Kd7", "1...Kd7 — Black approaches but cannot stop promotion."),
      M("Kc7", "2.Kc7 — Wrong move (illustrative). Better: stay near the pawn and use the rook."),
    ],
  },
  {
    keys: /philidor.*position|philidor.*defense|3rd rank defense|sixth rank/i,
    fen: "4k3/R7/4K3/4P3/8/8/8/r7 b - - 0 1",
    moves: [
      M("Ra6", "1...Ra6! — The Philidor Defense! Rook on the 6th rank prevents White's king from advancing."),
      M("e6", "2.e6 — White pushes, but..."),
      M("Ra1", "2...Ra1! — Now Black checks from behind. The rook drops to the 1st rank."),
      M("Kd6", "3.Kd6 Rd1+ — Endless checks. Draw!"),
    ],
  },
  {
    keys: /vancura|vančura|rook.*a-?pawn|pawn.*a-?file/i,
    fen: "8/k7/P7/K7/8/8/8/7r w - - 0 1",
    moves: [
      M("Kb5", "1.Kb5 — White tries to escort the a-pawn."),
      M("Rh5+", "1...Rh5+ — The Vančura Defense! Rook checks from the side."),
      M("Kc6", "2.Kc6 Rh6+ — More checks; Black holds."),
    ],
  },
  {
    keys: /opposition|key squares|pawn.*square/i,
    fen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd6", "1.Kd6 — Direct opposition won't work; key squares matter!"),
      M("Kd8", "1...Kd8 — Black grabs opposition."),
      M("e6", "2.e6 Ke8 3.e7 — Stalemate trap looms."),
    ],
  },
  {
    keys: /king.*pawn.*king|k\+p.*v.*k|kpk/i,
    fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Kd3", "1.Kd3 — King leads the pawn (golden rule of K+P endings)."),
      M("Kd5", "1...Kd5 — Black tries to block."),
      M("Ke3", "2.Ke3 — White maintains opposition."),
      M("Ke5", "2...Ke5 3.e3 — Patient triangulation."),
    ],
  },
  {
    keys: /king.*rook.*king|krk|mate.*rook|ladder mate/i,
    fen: "8/8/8/4k3/8/4K3/8/4R3 w - - 0 1",
    moves: [
      M("Re4+", "1.Re4+ — Cut off the king's rank!"),
      M("Kf5", "1...Kf5 2.Re1 — Repositioning."),
      M("Kf6", "2...Kf6 3.Kf4 — King supports the rook to deliver mate."),
    ],
  },
  {
    keys: /two rooks.*mate|mate.*two rooks/i,
    fen: "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
    moves: [
      M("Ra7", "1.Ra7 — The first rook cuts off the 7th rank."),
      M("Kd8", "1...Kd8 2.Rh8# — Two-rook mate (ladder)."),
    ],
  },
  {
    keys: /queen.*king.*king|kqk/i,
    fen: "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
    moves: [
      M("Qd5", "1.Qd5 — Knight's-move technique. Squeeze the king to the edge."),
      M("Kf6", "1...Kf6 2.Qe5+ Kf7 — Closing in."),
    ],
  },
  {
    keys: /bishop.*knight.*mate|two bishops.*mate/i,
    fen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
    moves: [
      M("Bd3", "1.Bd3 — Two bishops sweep diagonals to corner the king."),
      M("Kd5", "1...Kd5 2.Be2 — Patient W-maneuver."),
    ],
  },
  {
    keys: /passed pawn|outside passed|protected passed/i,
    fen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4 — King supports promotion."),
    ],
  },
  {
    keys: /rook endgame|rook.*ending|7th rank/i,
    fen: "4k3/p4ppp/8/8/8/8/PR3PPP/4K3 w - - 0 1",
    moves: [
      M("Rb7", "1.Rb7! — The rook on the 7th — 'Tarrasch's pig'."),
      M("Kf8", "1...Kf8 2.Ra7 — Targeting the a7 pawn."),
    ],
  },
  {
    keys: /rook.*pawn.*rook|r\+p.*v.*r/i,
    fen: "8/8/4k3/8/4P3/8/4K3/4R2r w - - 0 1",
    moves: [
      M("Re3", "1.Re3 — Defending the pawn from behind."),
      M("Rh4", "1...Rh4 2.Kd3 — Activating the king."),
    ],
  },
  {
    keys: /opposite.*color.*bishop|opposite-?colored bishops|drawish bishop/i,
    fen: "8/8/3k4/3p4/8/3B4/4b3/3K4 w - - 0 1",
    moves: [
      M("Kc2", "1.Kc2 — Opposite-colored bishops favor the defender."),
      M("Bf3", "1...Bf3 2.Kd2 — Activity over material."),
    ],
  },
  {
    keys: /same.*color.*bishop|good bishop.*bad bishop/i,
    fen: "8/p4k2/1p3p2/2p2P2/2P5/1P3K2/P4B2/8 w - - 0 1",
    moves: [
      M("Be3", "1.Be3 — A 'good' bishop attacks fixed enemy pawns."),
      M("Bd6", "1...Bd6 2.Kf4 — Active king is decisive."),
    ],
  },
  {
    keys: /knight.*endgame|knight.*pawn ending/i,
    fen: "8/4k3/8/4N3/4K3/8/8/8 w - - 0 1",
    moves: [
      M("Nf3", "1.Nf3 — Knights are clumsy but precise in endgames."),
      M("Kd6", "1...Kd6 2.Nd2 — Knight maneuvers carefully."),
    ],
  },
  {
    keys: /pawn breakthrough|breakthrough.*pawn/i,
    fen: "8/pp6/8/PP6/8/8/8/4K1k1 w - - 0 1",
    moves: [
      M("b6!", "1.b6! — The classical breakthrough sacrifice!"),
      M("axb6", "1...axb6 2.a6! bxa6 3.b6 — A passed pawn is born!"),
    ],
  },
  {
    keys: /queen vs pawn|kqkp/i,
    fen: "8/8/8/8/8/k7/p7/4K2Q w - - 0 1",
    moves: [
      M("Qa8+", "1.Qa8+ — Force the king onto the pawn."),
      M("Kb2", "1...Kb2 2.Qb7+ — Approaching with the king."),
    ],
  },
  {
    keys: /zugzwang|tempo|triangulation/i,
    fen: "8/8/3k4/3P4/3K4/8/8/8 w - - 0 1",
    moves: [
      M("Kc4", "1.Kc4 — Triangulation! Lose a tempo to put Black in zugzwang."),
      M("Kc7", "1...Kc7 2.Kd4 — Returning with Black to move."),
    ],
  },
  {
    keys: /minor piece.*endgame|bishop.*endgame|fortress/i,
    fen: "8/8/4k3/8/4B3/4K3/4P3/8 w - - 0 1",
    moves: [
      M("Bd5+", "1.Bd5+ — Bishop and pawn coordinate."),
      M("Kd6", "1...Kd6 2.Kd4 — King escorts the pawn."),
    ],
  },
  {
    keys: /endgame.*technique|conversion|winning.*endgame/i,
    fen: "8/8/4k3/2p1p3/2P1P3/8/4K3/8 w - - 0 1",
    moves: [
      M("Kd3", "1.Kd3 — Centralize the king first."),
      M("Kd6", "1...Kd6 2.Kc3 — Slow, methodical play wins."),
    ],
  },
];

// ============================================================
// TACTICS POSITIONS
// ============================================================
export const TACTICS_POSITIONS = [
  {
    keys: /fork|double attack/i,
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: [
      M("Bb5", "1.Bb5 — Pinning the knight."),
      M("a6", "1...a6 2.Bxc6 — Setting up tactical motifs."),
    ],
  },
  {
    keys: /pin|absolute pin|relative pin/i,
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    moves: [
      M("a6", "1...a6 — Challenging the pinning bishop."),
      M("Bxc6", "2.Bxc6 — Trade or retreat?"),
    ],
  },
  {
    keys: /skewer|x-ray/i,
    fen: "8/8/8/3k4/8/3K4/3R4/3q4 w - - 0 1",
    moves: [
      M("Rxd1+", "1.Rxd1+ — But there's a skewer ready!"),
      M("Kxd1", "Setup illustrates the pattern."),
    ],
  },
  {
    keys: /discovered (attack|check)|discovery/i,
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4",
    moves: [
      M("Nxe5", "1.Nxe5! — Knight moves, opening a discovered attack."),
      M("Nxe5", "1...Nxe5 2.d4 — Central break exploits the discovery."),
    ],
  },
  {
    keys: /double check/i,
    fen: "r1bqkb1r/pppp1Bpp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      M("Kxf7", "1...Kxf7 — Forced; double check would be devastating."),
    ],
  },
  {
    keys: /removing the defender|deflection|undermining/i,
    fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bxf7+", "1.Bxf7+! — Removing the defender of e5."),
      M("Rxf7", "1...Rxf7 2.Nxe5 — The defender gone, the pawn falls."),
    ],
  },
  {
    keys: /decoy|attraction|sacrifice.*king/i,
    fen: "r1bq1rk1/pp3ppp/2n2n2/2bpp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Bxf7+", "1.Bxf7+! — Decoy! Lure the king into the open."),
      M("Kxf7", "1...Kxf7 2.Ng5+ — Now the knight strikes."),
    ],
  },
  {
    keys: /clearance|interference|line opening/i,
    fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 5",
    moves: [
      M("Nd5", "1.Nd5! — Clearance: the knight clears the c-file with tempo."),
      M("Nxd5", "1...Nxd5 2.exd5 — The line is open!"),
    ],
  },
  {
    keys: /zwischenzug|in.?between move|intermezzo/i,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Threatening f7."),
      M("d5", "1...d5! — A zwischenzug! Black ignores the threat."),
      M("exd5", "2.exd5 Na5 — The intermezzo bought time."),
    ],
  },
  {
    keys: /back rank|back-rank|smothered.*back/i,
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    moves: [
      M("Ra8+", "1.Ra8+ — The back rank weakness!"),
      M("Kh7", "1...Kh7 — Forced; otherwise mate."),
    ],
  },
  {
    keys: /smothered mate/i,
    fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
    moves: [
      M("Nf7+", "1.Nf7+ Kg8 — Knight checks."),
      M("Nh6+", "2.Nh6+ Kh8 3.Qg8+! Rxg8 4.Nf7# — Smothered mate!"),
    ],
  },
  {
    keys: /windmill|mill/i,
    fen: "r4rk1/1b3ppp/p2qpn2/1pn5/2p5/2N1P1B1/PPQ1BPPP/R4RK1 w - - 0 1",
    moves: [
      M("Bxf6", "1.Bxf6 — Setup; the famous windmill arises in similar structures."),
    ],
  },
  {
    keys: /overloaded|overloading/i,
    fen: "r4rk1/pp3ppp/2n5/2bqp3/8/2N5/PPPQBPPP/R4RK1 w - - 0 1",
    moves: [
      M("Nxd5", "1.Nxd5! — The queen is overloaded defending two things."),
    ],
  },
  {
    keys: /trapped piece|trap.*queen|trap.*rook/i,
    fen: "rn1qkbnr/pp2pppp/8/2pP4/4P1b1/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 4",
    moves: [
      M("h3", "1.h3 — Threatens to trap the bishop."),
      M("Bh5", "1...Bh5 2.g4 Bg6 — Forcing the bishop to a worse square."),
    ],
  },
  {
    keys: /perpetual check|perpetual/i,
    fen: "6k1/5ppp/8/8/8/8/Q4PPP/6K1 w - - 0 1",
    moves: [
      M("Qa8+", "1.Qa8+ Kh7 2.Qe4+ Kg8 3.Qa8+ — Perpetual check, draw!"),
    ],
  },
  {
    keys: /tactical pattern|combination|tactics application/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 1",
    moves: [
      M("cxd5", "1.cxd5 exd5 2.Nb5 — Tactical possibilities arise from active piece play."),
    ],
  },
  {
    keys: /calculation|visualization|forcing moves/i,
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    moves: [
      M("O-O", "1...O-O — Calculate: which side has more forcing moves?"),
      M("h3", "2.h3 — Setting up calculation exercises."),
    ],
  },
  {
    keys: /mate.*one|mate.*1|simple mate/i,
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8#", "1.Re8# — Back rank mate in one!"),
    ],
  },
  {
    keys: /mate.*two|mate.*2|mate in two/i,
    fen: "6k1/5pp1/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: [
      M("Re8+", "1.Re8+ Kh7 2.Rh8# — Mate in 2!"),
      M("Kh7", "1...Kh7"),
      M("Rh8#", "2.Rh8# — Checkmate!"),
    ],
  },
  {
    keys: /mate.*three|mate.*3|mate in three/i,
    fen: "6k1/5pp1/7p/8/8/8/5PPP/Q5K1 w - - 0 1",
    moves: [
      M("Qa8+", "1.Qa8+ — Forcing the king."),
      M("Kh7", "1...Kh7"),
      M("Qe4+", "2.Qe4+ g6 3.Qxg6+ fxg6 4.... — Mating net."),
    ],
  },
];

// ============================================================
// BASICS POSITIONS
// ============================================================
export const BASICS_POSITIONS = [
  {
    keys: /chessboard|board.*square|64 squares/i,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: [],
  },
  {
    keys: /starting position|setup|initial position/i,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: [],
  },
  {
    keys: /pawn move|how pawns move/i,
    fen: "8/2p5/8/8/3P4/8/8/8 w - - 0 1",
    moves: [
      M("d5", "1.d5 — Pawns move forward; can advance two squares from start."),
    ],
  },
  {
    keys: /knight.*move|how knight|knight L/i,
    fen: "8/8/8/4N3/8/8/8/8 w - - 0 1",
    moves: [
      M("Nf7", "1.Nf7 — Knights move in an L-shape and can jump over pieces."),
    ],
  },
  {
    keys: /bishop.*move|how bishop|diagonal/i,
    fen: "8/8/8/4B3/8/8/8/8 w - - 0 1",
    moves: [
      M("Ba1", "1.Ba1 — Bishops slide diagonally."),
    ],
  },
  {
    keys: /rook.*move|how rook|file.*rank/i,
    fen: "8/8/8/4R3/8/8/8/8 w - - 0 1",
    moves: [
      M("Re8", "1.Re8 — Rooks move on ranks and files."),
    ],
  },
  {
    keys: /queen.*move|how queen/i,
    fen: "8/8/8/4Q3/8/8/8/8 w - - 0 1",
    moves: [
      M("Qa1", "1.Qa1 — The queen combines rook + bishop power."),
    ],
  },
  {
    keys: /king.*move|how king/i,
    fen: "8/8/8/4K3/8/8/8/8 w - - 0 1",
    moves: [
      M("Kd5", "1.Kd5 — The king moves one square in any direction."),
    ],
  },
  {
    keys: /castling|castle|kingside|queenside castle/i,
    fen: "r3k2r/pppq1ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQ1PPP/R3K2R w KQkq - 0 1",
    moves: [
      M("O-O", "1.O-O — Kingside castling: king to g1, rook to f1."),
      M("O-O-O", "1...O-O-O — Queenside castling: king to c8, rook to d8."),
    ],
  },
  {
    keys: /en passant/i,
    fen: "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
    moves: [
      M("exd6", "1.exd6 — En passant! The d-pawn just advanced two; we capture as if it moved one."),
    ],
  },
  {
    keys: /promotion|promote.*pawn/i,
    fen: "8/4P3/8/8/8/8/8/4K2k w - - 0 1",
    moves: [
      M("e8=Q", "1.e8=Q — Promotion! The pawn becomes a queen."),
    ],
  },
  {
    keys: /check[^m]|in check/i,
    fen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 4",
    moves: [
      M("Bb5+", "1.Bb5+ — Check! Black must respond immediately."),
    ],
  },
  {
    keys: /checkmate|mate$|checkmating/i,
    fen: "r1bqk2r/pppp1Qpp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
    moves: [],
  },
  {
    keys: /stalemate/i,
    fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1",
    moves: [],
  },
  {
    keys: /center control|control.*center/i,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    moves: [
      M("Nf3", "2.Nf3 — Develop with central focus."),
      M("Nc6", "2...Nc6"),
    ],
  },
  {
    keys: /development|develop pieces|piece development/i,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    moves: [
      M("Nc6", "2...Nc6 3.Bc4 — Knights before bishops."),
      M("Bc4", "3.Bc4"),
    ],
  },
  {
    keys: /piece value|material value|count piece/i,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: [],
  },
  {
    keys: /material advantage|win material/i,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Threatening f7! Material can be won by tactics."),
    ],
  },
  {
    keys: /fork.*beginner|first tactic/i,
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 2 3",
    moves: [
      M("Nf3", "2.Nf3 — Sets up tactics around the e5/d4 squares."),
    ],
  },
  {
    keys: /opening principle|first move|early game/i,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
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
];

// ============================================================
// STRATEGY POSITIONS
// ============================================================
export const STRATEGY_POSITIONS = [
  {
    keys: /isolated.*pawn|iqp|isolani/i,
    fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    moves: [
      M("Bc2", "1.Bc2 — Around the IQP, pieces find active squares."),
      M("Re8", "1...Re8 — Black presses against d4."),
    ],
  },
  {
    keys: /backward pawn/i,
    fen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("Be2", "1.Be2 — d6 is a backward pawn — a chronic weakness."),
    ],
  },
  {
    keys: /doubled pawn/i,
    fen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    moves: [
      M("cxd5", "1.cxd5 cxd5 — Doubled c-pawns can be both weakness and strength."),
    ],
  },
  {
    keys: /passed pawn|outside pawn/i,
    fen: "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
    moves: [
      M("d5+", "1.d5+ — A passed pawn must be pushed!"),
      M("Kd6", "1...Kd6 2.Kd4"),
    ],
  },
  {
    keys: /weak square|weak color complex|hole/i,
    fen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Nd5", "1.Nd5 — Knight occupies a strong central square (the 'hole')."),
    ],
  },
  {
    keys: /outpost|knight outpost/i,
    fen: "r1bq1rk1/pp3ppp/2n2n2/3p4/3N4/2N5/PPP2PPP/R1BQ1RK1 w - - 0 1",
    moves: [
      M("Nb5", "1.Nb5 — Heading to a powerful outpost on d6 or c7."),
    ],
  },
  {
    keys: /open file|half-?open file|file.*rook/i,
    fen: "r4rk1/pp2qppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/2R2RK1 w - - 0 1",
    moves: [
      M("Rfc1", "1.Rfc1 — Doubling on the c-file: the open file belongs to the rooks!"),
    ],
  },
  {
    keys: /minority attack/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 1",
    moves: [
      M("b4", "1.b4 — The Minority Attack! White's two pawns attack three."),
      M("a5", "1...a5 2.b5 — Creating a weakness on c6."),
    ],
  },
  {
    keys: /pawn chain|chain.*structure/i,
    fen: "r1bqkbnr/pp1n1ppp/2p1p3/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 2 5",
    moves: [
      M("Nf3", "2.Nf3 — Pawn chains: attack the base!"),
    ],
  },
  {
    keys: /space advantage|space|cramped/i,
    fen: "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
    moves: [
      M("c3", "3.c3 — White has a big space advantage; restrict Black further."),
    ],
  },
  {
    keys: /bishop pair|two bishops/i,
    fen: "r1bqk1nr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 4",
    moves: [
      M("d3", "4.d3 — The bishop pair shines in open positions."),
    ],
  },
  {
    keys: /good knight.*bad bishop|bad bishop/i,
    fen: "r1bqkbnr/pp1npppp/2p5/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 1 4",
    moves: [
      M("Nf3", "3.Nf3 — Black's c8 bishop is locked in (bad bishop)."),
    ],
  },
  {
    keys: /prophylaxis|prophylactic/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("a3", "1.a3 — Prophylaxis: prevent ...Bb4 ideas before they arise."),
    ],
  },
  {
    keys: /piece exchange|trading.*pieces|simplification/i,
    fen: "r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    moves: [
      M("Bg5", "1.Bg5 — Trade pieces when ahead in material or to simplify."),
    ],
  },
  {
    keys: /attack.*kingside|kingside attack/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ng5", "1.Ng5 — Kingside attack starts!"),
      M("h6", "1...h6 2.h4 — Pawn storm!"),
    ],
  },
  {
    keys: /queenside.*play|queenside attack|expansion/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    moves: [
      M("a3", "1.a3 — Preparing b4 queenside expansion."),
      M("a5", "1...a5 2.b3 — Slow positional pressure."),
    ],
  },
  {
    keys: /center break|central break|pawn break/i,
    fen: "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6",
    moves: [
      M("c5", "1.c5 — A central pawn break to clarify the structure!"),
    ],
  },
  {
    keys: /piece coordination|coordinate.*pieces/i,
    fen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("a3", "1.a3 — Pieces work together: bishop, knight, queen aligned."),
    ],
  },
  {
    keys: /initiative|tempo/i,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: [
      M("Ng5", "1.Ng5 — Seizing the initiative with active threats."),
    ],
  },
  {
    keys: /positional sacrifice|exchange sacrifice/i,
    fen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Rxc5", "1.Rxc5! — A positional exchange sacrifice for long-term play."),
    ],
  },
  {
    keys: /endgame transition|simplifying.*endgame/i,
    fen: "r4rk1/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/R4RK1 w - - 0 1",
    moves: [
      M("Qxc6", "1.Qxc6! — Simplify to a winning endgame!"),
    ],
  },
];

// ============================================================
// MIDDLEGAME POSITIONS
// ============================================================
export const MIDDLEGAME_POSITIONS = [
  {
    keys: /attacking.*king|king hunt|attack.*king/i,
    fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6",
    moves: [
      M("Bg5", "1.Bg5 — Pinning, opening lines for an attack on the king."),
    ],
  },
  {
    keys: /pawn storm|pawn avalanche|kingside pawn/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("h3", "1.h3 — Preparing g4-g5 pawn storm!"),
      M("Nh5", "1...Nh5 2.g4 — Aggressive expansion."),
    ],
  },
  {
    keys: /sacrifice.*attack|attacking.*sacrifice|sac/i,
    fen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
      M("Bxh7+", "1.Bxh7+! — The classic Greek Gift sacrifice!"),
      M("Kxh7", "1...Kxh7 2.Ng5+ — Knight comes in for the kill."),
    ],
  },
  {
    keys: /defense|defending|defensive technique/i,
    fen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 b - - 0 1",
    moves: [
      M("h6", "1...h6 — Prophylactic defense against Bxh7+ ideas."),
    ],
  },
  {
    keys: /counterattack|counter-?attack/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 b - - 0 8",
    moves: [
      M("c5", "1...c5! — The best defense is a counterattack!"),
      M("dxc5", "2.dxc5 Nxc5 — Black equalizes activity."),
    ],
  },
  {
    keys: /weak king|exposed king|king safety/i,
    fen: "r1bq1rk1/pppp1ppp/2n2n2/2b5/2B1p3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 7",
    moves: [
      M("dxe4", "1.dxe4 — King safety first; never leave the king exposed."),
    ],
  },
  {
    keys: /piece activity|active pieces|active play/i,
    fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Ne5", "1.Ne5 — Activate every piece to its best square!"),
    ],
  },
  {
    keys: /open position|open game|open lines/i,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4",
    moves: [
      M("Bc5", "3...Bc5 — Open positions favor the bishops and quick development."),
    ],
  },
  {
    keys: /closed position|closed game/i,
    fen: "rnbqkb1r/pp1n1ppp/4p3/2ppP3/3P4/2P5/PP1N1PPP/R1BQKBNR w KQkq - 0 5",
    moves: [
      M("Nf3", "4.Nf3 — Closed positions reward knights and patient maneuvering."),
    ],
  },
  {
    keys: /maneuvering|piece maneuver|reroute/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP1QPPP/R1B2RK1 w - - 0 9",
    moves: [
      M("Nh4", "1.Nh4 — Knight reroutes to f5 — patient maneuvering."),
      M("Re8", "1...Re8 2.Nf5 — Long-term piece improvement."),
    ],
  },
  {
    keys: /middlegame plan|strategic plan|plan formation/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Re1", "1.Re1 — Form a plan based on pawn structure!"),
    ],
  },
  {
    keys: /transformation|structure change/i,
    fen: "r1bqkb1r/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 7",
    moves: [
      M("Bd3", "1.Bd3 — Transform the structure: trade or push?"),
    ],
  },
  {
    keys: /piece sacrifice|sacrifice for attack/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Nxd5", "1.Nxd5! — A piece sac to expose the king!"),
      M("exd5", "1...exd5 2.Bxh7+ — The attack rolls on!"),
    ],
  },
  {
    keys: /typical middlegame|model middlegame/i,
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    moves: [
      M("Re1", "1.Re1 — Model middlegame setup."),
    ],
  },
  {
    keys: /typical attack|standard attack/i,
    fen: "r1bq1rk1/ppp1bppp/2n2n2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 1",
    moves: [
      M("Ne5", "1.Ne5 — Classical attacking buildup: knight + bishop on h7."),
    ],
  },
];
