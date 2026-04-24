// Library of standard opening positions per course.
// Each course has a "trunk" (main moves shared by all lessons) and the per-lesson
// generator picks a continuation based on title keywords.

export const COURSE_TRUNKS = {
  // King's Indian: 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5
  "kings-indian": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["d4", "1.d4 — White claims the center and prepares a strategic battle."],
      ["Nf6", "1...Nf6 — Black opts for a hypermodern setup, attacking the center from afar."],
      ["c4", "2.c4 — The Queen's Pawn opening; White grabs more space."],
      ["g6", "2...g6 — Preparing the King's Indian fianchetto."],
      ["Nc3", "3.Nc3 — White develops naturally."],
      ["Bg7", "3...Bg7 — The KID bishop is born — eyeing the long diagonal."],
      ["e4", "4.e4 — White builds a 'big center' with pawns on c4, d4, e4."],
      ["d6", "4...d6 — Black supports a future ...e5 break."],
      ["Nf3", "5.Nf3 — Classical setup."],
      ["O-O", "5...O-O — Black castles into the King's Indian fortress."],
      ["Be2", "6.Be2 — The Classical Mar del Plata setup."],
      ["e5", "6...e5! — The thematic strike. Black challenges the center."],
    ],
  },
  // Caro-Kann: 1.e4 c6 2.d4 d5
  "caro-kann": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["e4", "1.e4 — White opens with the king's pawn."],
      ["c6", "1...c6 — The Caro-Kann! Black prepares ...d5 with rock-solid structure."],
      ["d4", "2.d4 — White accepts the challenge and builds a classical center."],
      ["d5", "2...d5 — Black contests the center directly. Now White must decide: exchange, advance, or defend."],
    ],
  },
  // London System: 1.d4 d5 2.Nf3 Nf6 3.Bf4
  "london-system": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["d4", "1.d4 — Classical queen's pawn opening."],
      ["d5", "1...d5 — Black mirrors, contesting the center."],
      ["Nf3", "2.Nf3 — Develop and prevent ...e5."],
      ["Nf6", "2...Nf6 — Symmetrical development."],
      ["Bf4", "3.Bf4 — The London System! The bishop comes outside the pawn chain."],
      ["e6", "3...e6 — A solid Black setup."],
      ["e3", "4.e3 — Solid pawn structure, preparing Bd3 and c3."],
      ["Bd6", "4...Bd6 — Challenging the London bishop."],
    ],
  },
  // English: 1.c4
  "english-opening": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["c4", "1.c4 — The English Opening. White stakes a flank claim on d5."],
      ["e5", "1...e5 — The Reversed Sicilian. Black plays as White does in the Sicilian."],
      ["Nc3", "2.Nc3 — Natural development supporting d5 control."],
      ["Nf6", "2...Nf6 — Symmetrical development, attacking e4 by tempo."],
      ["g3", "3.g3 — A trademark English fianchetto setup."],
      ["d5", "3...d5 — Black strikes back in the center."],
      ["cxd5", "4.cxd5 — Capturing to free the c-file."],
      ["Nxd5", "4...Nxd5 — Recapturing centrally."],
    ],
  },
  // Scandinavian: 1.e4 d5
  "scandinavian-defense": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["e4", "1.e4 — White opens with the king's pawn."],
      ["d5", "1...d5! — The Scandinavian Defense! Black challenges the e4 pawn immediately."],
      ["exd5", "2.exd5 — White captures. Now Black must decide how to recapture."],
      ["Qxd5", "2...Qxd5 — The Main Line. Black accepts losing time on the queen."],
      ["Nc3", "3.Nc3 — Attacking the queen with tempo."],
      ["Qa5", "3...Qa5 — The classical retreat, eyeing the long diagonal."],
    ],
  },
  // Dutch: 1.d4 f5
  "dutch-defense": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["d4", "1.d4 — White's queen pawn."],
      ["f5", "1...f5! — The Dutch Defense! Black aggressively fights for e4."],
      ["g3", "2.g3 — The Fianchetto Variation, the main weapon vs the Dutch."],
      ["Nf6", "2...Nf6 — Standard development."],
      ["Bg2", "3.Bg2 — Aiming at the long diagonal and Black's potential weaknesses."],
      ["e6", "3...e6 — Preparing the Classical setup."],
      ["Nf3", "4.Nf3 — Fluid development."],
      ["Be7", "4...Be7 — Classical Dutch setup."],
    ],
  },
  // Sicilian Deep Dive: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 (Najdorf trunk)
  "sicilian-deep-dive": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["e4", "1.e4 — White opens classically."],
      ["c5", "1...c5 — The Sicilian! Black fights for d4 asymmetrically."],
      ["Nf3", "2.Nf3 — The Open Sicilian setup."],
      ["d6", "2...d6 — Najdorf/Scheveningen move order."],
      ["d4", "3.d4 — White cracks open the center."],
      ["cxd4", "3...cxd4 — Standard exchange."],
      ["Nxd4", "4.Nxd4 — Recapturing centrally."],
      ["Nf6", "4...Nf6 — Attacking e4 with tempo."],
      ["Nc3", "5.Nc3 — Defending e4."],
      ["a6", "5...a6 — The Najdorf! The most popular Sicilian, controlling b5 and preparing flexible play."],
    ],
  },
  // Nimzo-Indian: 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4
  "nimzo-indian": {
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trunk: [
      ["d4", "1.d4 — Queen's pawn opening."],
      ["Nf6", "1...Nf6 — Hypermodern development."],
      ["c4", "2.c4 — Standard QGD setup."],
      ["e6", "2...e6 — Preparing ...Bb4 or ...d5."],
      ["Nc3", "3.Nc3 — Inviting the Nimzo-Indian."],
      ["Bb4", "3...Bb4! — The Nimzo-Indian Defense! The bishop pins the knight, threatening to double White's pawns."],
    ],
  },
};

// Per-lesson continuations: keyword in title → extra moves
// Falls back to "explore from trunk" if no match.
export const TITLE_CONTINUATIONS = [
  // === SICILIAN ===
  { match: /najdorf.*english attack|6\.?be3/i, extra: [["Be3", "6.Be3 — The English Attack! White prepares f3, Qd2, O-O-O and a kingside pawn storm."], ["e6", "6...e6 — The Scheveningen-style setup."], ["f3", "7.f3 — Supporting e4 and preparing g4."], ["b5", "7...b5 — Black's queenside counterplay starts."]] },
  { match: /najdorf.*bg5|6\.?bg5/i, extra: [["Bg5", "6.Bg5 — The Main Line. Pinning the knight, threatening Bxf6."], ["e6", "6...e6"], ["e5", "7.e5!? — The famous Polugaevsky sacrifice idea."]] },
  { match: /najdorf.*be2|classical najdorf/i, extra: [["Be2", "6.Be2 — The Classical Najdorf. Quiet and solid."], ["e5", "6...e5 — Black secures d5 weakness in exchange for activity."]] },
  { match: /poisoned pawn/i, extra: [["Bg5", "6.Bg5 e6 7.f4 Qb6!? — The Poisoned Pawn! Black grabs b2."], ["e6", "6...e6"], ["f4", "7.f4"], ["Qb6", "7...Qb6 — The dangerous pawn grab."]] },
  { match: /dragon/i, extra: [["Be3", "6.Be3 g6 — The Dragon! Black fianchettoes."], ["g6", "6...g6"], ["f3", "7.f3 — Yugoslav Attack."], ["Bg7", "7...Bg7"], ["Qd2", "8.Qd2 — Preparing O-O-O and h4-h5."]] },
  { match: /scheveningen/i, extra: [["Be2", "6.Be2 e6 — The Scheveningen 'Small Center' structure."], ["e6", "6...e6"]] },
  { match: /sveshnikov/i, extra: [["Nc6", "Move order shifts to Sveshnikov: 5...Nc6 6.Ndb5 d6 7.Bf4 e5"], ["Ndb5", "6.Ndb5 — Threatening Nd6+"], ["d6", "6...d6"], ["Bf4", "7.Bf4 e5 8.Bg5 — Sveshnikov main line."]] },
  { match: /taimanov|kan/i, extra: [["Nc6", "Move order: 4...Nc6 (Taimanov) or 4...a6 (Kan)."], ["Nc3", "5.Nc3 Qc7 — Flexible Taimanov setup."]] },
  // === CARO-KANN ===
  { match: /classical.*nf6|nf6.*classical|short variation/i, extra: [["Nc3", "3.Nc3 dxe4 4.Nxe4 Nf6 — Classical Caro-Kann."], ["dxe4", "3...dxe4"], ["Nxe4", "4.Nxe4"], ["Nf6", "4...Nf6 — Nf6 variation."], ["Nxf6+", "5.Nxf6+ exf6 — Solid pawn structure for Black."]] },
  { match: /classical.*bf5|bf5.*main|main line caro/i, extra: [["Nc3", "3.Nc3 dxe4 4.Nxe4 Bf5 — Classical Main Line."], ["dxe4", "3...dxe4"], ["Nxe4", "4.Nxe4"], ["Bf5", "4...Bf5 — The Bishop comes out before locking it in!"], ["Ng3", "5.Ng3 Bg6 — Forcing the bishop to a slightly worse square."]] },
  { match: /advance|bf5 advance|short.*advance/i, extra: [["e5", "3.e5 Bf5 — The Advance Variation."], ["Bf5", "3...Bf5 — The Caro's good bishop comes out!"], ["Nf3", "4.Nf3 e6 5.Be2 — Short Variation, modern main line."]] },
  { match: /bayonet|advance.*g4/i, extra: [["e5", "3.e5 Bf5 4.h4 — The Bayonet Attack!"], ["Bf5", "3...Bf5"], ["h4", "4.h4 h6 5.g4 — Aggressive kingside expansion."], ["h6", "4...h6"], ["g4", "5.g4 Bd7 — Driving the bishop back."]] },
  { match: /panov|attack.*c4/i, extra: [["exd5", "3.exd5 cxd5 4.c4 — The Panov-Botvinnik Attack!"], ["cxd5", "3...cxd5"], ["c4", "4.c4 Nf6 5.Nc3 — IQP positions arise."]] },
  { match: /exchange.*caro|caro.*exchange/i, extra: [["exd5", "3.exd5 cxd5 — The Exchange Variation."], ["cxd5", "3...cxd5"], ["Bd3", "4.Bd3 Nc6 5.c3 — Quiet but slightly better for White."]] },
  { match: /two knights.*caro|caro.*two knights/i, extra: [["Nc3", "3.Nc3 dxe4 4.Nxe4 — Two Knights vs Caro."], ["dxe4", "3...dxe4"]] },
  { match: /tartakower/i, extra: [["e5", "3.e5 Bf5 4.Nc3 — Tartakower Variation."], ["Bf5", "3...Bf5"], ["Nc3", "4.Nc3 e6 — Black plays without ...c5 break."]] },
  { match: /gurgenidze/i, extra: [["Nc3", "3.Nc3 g6 — The unusual Gurgenidze System!"], ["g6", "3...g6 — Black fianchettoes the bishop, treating the Caro like a Pirc."]] },
  // === LONDON ===
  { match: /london.*main|standard london/i, extra: [["c3", "5.c3 — The classical London triangle: d4-e3-c3."], ["Nbd7", "5...Nbd7"], ["Bd3", "6.Bd3 — Eyeing h7."]] },
  { match: /london.*queenside|jobava/i, extra: [["Nc3", "Variation: 2.Nc3 instead — The Jobava London!"], ["Nf6", "2...Nf6 3.Bf4 — Aggressive London."]] },
  { match: /london.*kingside|attack.*london/i, extra: [["Nbd2", "5.Nbd2 6.Ne5 — Preparing Ne5 attack."], ["c5", "5...c5 6.c3 Nc6"]] },
  { match: /london.*dxc4|capture.*center/i, extra: [["c3", "5.c3 c5 6.dxc5 — Trading central tension."]] },
  // === ENGLISH ===
  { match: /reversed sicilian/i, extra: [["Bg2", "5.Bg2 Nb6 6.Nf3 — Reversed Sicilian setup with reversed colors!"]] },
  { match: /symmetric.*english|symmetrical/i, extra: [["c5", "1...c5 — Symmetric English."], ["Nc3", "2.Nc3 Nc6 3.g3 g6 — Double fianchetto setup."]] },
  { match: /botvinnik.*english|english.*botvinnik/i, extra: [["Bg2", "5.Bg2 e4 6.Nh3 — Botvinnik System with both fianchettos!"]] },
  { match: /english.*hedgehog|hedgehog/i, extra: [["e6", "Hedgehog setup: ...e6, ...b6, ...Bb7, ...d6"]] },
  // === SCANDINAVIAN ===
  { match: /scandinavian.*nf6|portuguese|icelandic/i, extra: [["Nf6", "2...Nf6 — The modern Scandinavian! Black avoids ...Qxd5."], ["d4", "3.d4 Nxd5 (or 3.c4 c6 — Icelandic Gambit)"]] },
  { match: /qxd5.*main|main line.*scandinavian/i, extra: [["d4", "4.d4 Nf6 5.Nf3 c6 — Solid Scandinavian Main Line."]] },
  { match: /qd6/i, extra: [["Qd6", "3...Qd6 — The Tiviakov System! Queen sidesteps to d6."]] },
  { match: /qd8/i, extra: [["Qd8", "3...Qd8 — The conservative retreat. Solid but passive."]] },
  // === DUTCH ===
  { match: /leningrad/i, extra: [["g6", "Leningrad System: ...g6, ...Bg7, ...d6 — Aggressive setup!"]] },
  { match: /stonewall/i, extra: [["d5", "Stonewall: ...e6, ...d5, ...c6, ...Bd6 — Locked center!"]] },
  { match: /classical dutch|classical.*dutch/i, extra: [["d6", "Classical Dutch: ...e6, ...Be7, ...d6, ...Nbd7"]] },
  { match: /staunton gambit/i, extra: [["e4", "2.e4!? — The Staunton Gambit! White sacs a pawn for development."], ["fxe4", "2...fxe4"], ["Nc3", "3.Nc3 — Rapid development for the pawn."]] },
  // === KING'S INDIAN ===
  { match: /mar del plata|kingside attack|f5-?f4/i, extra: [["d5", "7.d5 — Mar del Plata! Center is locked. Now both sides race on opposite wings."], ["Nbd7", "7...Nbd7 8.O-O Nh5 — Black prepares ...f5"], ["O-O", "8.O-O Nh5 9.Ne1 — Knights reroute."]] },
  { match: /samisch|sämisch/i, extra: [["f3", "5.f3 — The Sämisch Variation. White builds a granite center."], ["O-O", "5...O-O 6.Be3 — White's plan: long castle and pawn storm."]] },
  { match: /bayonet.*kid|b4|queenside.*c5/i, extra: [["d5", "7.d5 Nbd7 8.b4 — The Bayonet Attack! White rushes the queenside."]] },
  { match: /four pawns/i, extra: [["f4", "5.f4 — The Four Pawns Attack! White's center is huge but vulnerable."]] },
  { match: /fianchetto.*kid|kid.*fianchetto/i, extra: [["g3", "5.g3 O-O 6.Bg2 — The Fianchetto Variation. Solid and strategic."]] },
  { match: /benoni/i, extra: [["c5", "Modern Benoni: 1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6"]] },
  { match: /grünfeld|grunfeld/i, extra: [["d5", "Grünfeld: 3...d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7"]] },
  // === NIMZO-INDIAN ===
  { match: /rubinstein|4\.?e3/i, extra: [["e3", "4.e3 — The Rubinstein System. Solid and flexible."], ["O-O", "4...O-O 5.Bd3 d5 — Modern main line."]] },
  { match: /classical.*nimzo|qc2|4\.?qc2/i, extra: [["Qc2", "4.Qc2 — The Classical! Avoiding doubled pawns."], ["O-O", "4...O-O 5.a3 Bxc3+ 6.Qxc3"]] },
  { match: /sämisch.*nimzo|samisch.*nimzo|f3.*nimzo/i, extra: [["a3", "4.a3 Bxc3+ 5.bxc3 — Sämisch Nimzo: doubled c-pawns for the bishop pair!"]] },
  { match: /leningrad.*nimzo|bg5/i, extra: [["Bg5", "4.Bg5 — The Leningrad Variation!"]] },
  { match: /huebner|hubner/i, extra: [["e3", "4.e3 c5 5.Bd3 Nc6 6.Nf3 Bxc3+ — The Hübner System."]] },
];
