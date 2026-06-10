// Bot playstyles + opening repertoires.
// Each personality biases the engine toward certain moves and openings,
// giving every bot a distinct "human" feel.

export type Playstyle =
  | "aggressive"
  | "defensive"
  | "positional"
  | "tactical"
  | "gambit"
  | "universal";

export interface PlaystyleConfig {
  /** Bonus added when a move gives check or attacks the king area. */
  attackBonus: number;
  /** Bonus for captures (MVV-LVA). */
  captureBonus: number;
  /** Bonus for quiet developing/centralising moves. */
  developmentBonus: number;
  /** Penalty for trading queens early (positional bots like trades, attackers don't). */
  earlyQueenTradePenalty: number;
  /** Bonus for sacrifices (giving material in exchange for activity). */
  sacrificeBonus: number;
  /** Likes to push pawns toward the enemy king. */
  pawnStormBonus: number;
}

export const PLAYSTYLES: Record<Playstyle, PlaystyleConfig> = {
  aggressive: {
    attackBonus: 60,
    captureBonus: 25,
    developmentBonus: 10,
    earlyQueenTradePenalty: -40,
    sacrificeBonus: 35,
    pawnStormBonus: 25,
  },
  defensive: {
    attackBonus: 5,
    captureBonus: 15,
    developmentBonus: 25,
    earlyQueenTradePenalty: 10,
    sacrificeBonus: -30,
    pawnStormBonus: -10,
  },
  positional: {
    attackBonus: 10,
    captureBonus: 10,
    developmentBonus: 35,
    earlyQueenTradePenalty: 5,
    sacrificeBonus: -15,
    pawnStormBonus: 5,
  },
  tactical: {
    attackBonus: 35,
    captureBonus: 30,
    developmentBonus: 15,
    earlyQueenTradePenalty: -10,
    sacrificeBonus: 20,
    pawnStormBonus: 10,
  },
  gambit: {
    attackBonus: 45,
    captureBonus: 20,
    developmentBonus: 20,
    earlyQueenTradePenalty: -25,
    sacrificeBonus: 50,
    pawnStormBonus: 30,
  },
  universal: {
    attackBonus: 20,
    captureBonus: 20,
    developmentBonus: 20,
    earlyQueenTradePenalty: 0,
    sacrificeBonus: 0,
    pawnStormBonus: 10,
  },
};

/** Mini opening books per repertoire — sequences of SAN moves the bot will follow if available. */
export type OpeningRepertoire =
  | "italian"
  | "ruy-lopez"
  | "sicilian"
  | "french"
  | "caro-kann"
  | "queens-gambit"
  | "kings-indian"
  | "london"
  | "kings-gambit"
  | "scandinavian"
  | "english"
  | "universal";

interface OpeningLine {
  /** Move number → list of acceptable SAN moves at that ply (0-indexed plies). */
  plies: string[][];
}

// Each repertoire holds MANY independent lines. The bot picks one repertoire
// per game (locked in bot-engine.ts), but every game still produces a different
// variation because lines are matched against the actual move history and a
// random candidate is selected at each ply.
export const OPENING_BOOKS: Record<OpeningRepertoire, OpeningLine[]> = {
  italian: [
    // Giuoco Pianissimo
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bc4"], ["Bc5"], ["c3"], ["Nf6"], ["d3"], ["d6"], ["O-O"], ["O-O"]] },
    // Italian Game, Two Knights
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bc4"], ["Nf6"], ["Ng5"], ["d5"], ["exd5"], ["Na5"]] },
    // Evans Gambit
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bc4"], ["Bc5"], ["b4"], ["Bxb4"], ["c3"], ["Ba5"]] },
    // Hungarian Defense
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bc4"], ["Be7"]] },
  ],
  "ruy-lopez": [
    // Closed Ruy Lopez
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bb5"], ["a6"], ["Ba4"], ["Nf6"], ["O-O"], ["Be7"], ["Re1"], ["b5"], ["Bb3"], ["d6"]] },
    // Berlin Defense
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bb5"], ["Nf6"], ["O-O"], ["Nxe4"], ["d4"], ["Nd6"]] },
    // Open Ruy Lopez
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bb5"], ["a6"], ["Ba4"], ["Nf6"], ["O-O"], ["Nxe4"]] },
    // Exchange Variation
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bb5"], ["a6"], ["Bxc6"], ["dxc6"], ["O-O"]] },
    // Marshall Attack setup
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bb5"], ["a6"], ["Ba4"], ["Nf6"], ["O-O"], ["Be7"], ["Re1"], ["b5"], ["Bb3"], ["O-O"], ["c3"], ["d5"]] },
  ],
  sicilian: [
    // Najdorf
    { plies: [["e4"], ["c5"], ["Nf3"], ["d6"], ["d4"], ["cxd4"], ["Nxd4"], ["Nf6"], ["Nc3"], ["a6"], ["Be2", "Be3", "Bg5", "f3"]] },
    // Dragon
    { plies: [["e4"], ["c5"], ["Nf3"], ["d6"], ["d4"], ["cxd4"], ["Nxd4"], ["Nf6"], ["Nc3"], ["g6"], ["Be3"], ["Bg7"]] },
    // Accelerated Dragon
    { plies: [["e4"], ["c5"], ["Nf3"], ["Nc6"], ["d4"], ["cxd4"], ["Nxd4"], ["g6"], ["Nc3"], ["Bg7"]] },
    // Sveshnikov
    { plies: [["e4"], ["c5"], ["Nf3"], ["Nc6"], ["d4"], ["cxd4"], ["Nxd4"], ["Nf6"], ["Nc3"], ["e5"]] },
    // Taimanov
    { plies: [["e4"], ["c5"], ["Nf3"], ["e6"], ["d4"], ["cxd4"], ["Nxd4"], ["Nc6"]] },
    // Kan
    { plies: [["e4"], ["c5"], ["Nf3"], ["e6"], ["d4"], ["cxd4"], ["Nxd4"], ["a6"]] },
    // Scheveningen
    { plies: [["e4"], ["c5"], ["Nf3"], ["d6"], ["d4"], ["cxd4"], ["Nxd4"], ["Nf6"], ["Nc3"], ["e6"]] },
    // Classical
    { plies: [["e4"], ["c5"], ["Nf3"], ["d6"], ["d4"], ["cxd4"], ["Nxd4"], ["Nf6"], ["Nc3"], ["Nc6"]] },
    // Kalashnikov
    { plies: [["e4"], ["c5"], ["Nf3"], ["Nc6"], ["d4"], ["cxd4"], ["Nxd4"], ["e5"]] },
    // Four Knights Sicilian
    { plies: [["e4"], ["c5"], ["Nf3"], ["e6"], ["d4"], ["cxd4"], ["Nxd4"], ["Nf6"], ["Nc3"], ["Nc6"]] },
    // Closed Sicilian (white)
    { plies: [["e4"], ["c5"], ["Nc3"], ["Nc6"], ["g3"], ["g6"], ["Bg2"], ["Bg7"]] },
    // Alapin
    { plies: [["e4"], ["c5"], ["c3"], ["Nf6", "d5", "e6"], ["e5", "exd5"]] },
    // Smith-Morra Gambit
    { plies: [["e4"], ["c5"], ["d4"], ["cxd4"], ["c3"], ["dxc3"], ["Nxc3"]] },
    // Grand Prix
    { plies: [["e4"], ["c5"], ["Nc3"], ["Nc6"], ["f4"], ["g6"]] },
  ],
  french: [
    // Winawer
    { plies: [["e4"], ["e6"], ["d4"], ["d5"], ["Nc3"], ["Bb4"], ["e5"], ["c5"]] },
    // Classical
    { plies: [["e4"], ["e6"], ["d4"], ["d5"], ["Nc3"], ["Nf6"], ["Bg5"], ["Be7"]] },
    // Tarrasch
    { plies: [["e4"], ["e6"], ["d4"], ["d5"], ["Nd2"], ["Nf6", "c5"]] },
    // Advance
    { plies: [["e4"], ["e6"], ["d4"], ["d5"], ["e5"], ["c5"], ["c3"], ["Nc6"]] },
    // Exchange
    { plies: [["e4"], ["e6"], ["d4"], ["d5"], ["exd5"], ["exd5"]] },
  ],
  "caro-kann": [
    // Classical
    { plies: [["e4"], ["c6"], ["d4"], ["d5"], ["Nc3"], ["dxe4"], ["Nxe4"], ["Bf5"]] },
    // Advance
    { plies: [["e4"], ["c6"], ["d4"], ["d5"], ["e5"], ["Bf5"]] },
    // Panov-Botvinnik
    { plies: [["e4"], ["c6"], ["d4"], ["d5"], ["exd5"], ["cxd5"], ["c4"], ["Nf6"]] },
    // Exchange
    { plies: [["e4"], ["c6"], ["d4"], ["d5"], ["exd5"], ["cxd5"], ["Bd3"]] },
    // Two Knights
    { plies: [["e4"], ["c6"], ["Nc3"], ["d5"], ["Nf3"], ["Bg4"]] },
  ],
  "queens-gambit": [
    // QGD Orthodox
    { plies: [["d4"], ["d5"], ["c4"], ["e6"], ["Nc3"], ["Nf6"], ["Bg5"], ["Be7"]] },
    // QGA
    { plies: [["d4"], ["d5"], ["c4"], ["dxc4"], ["Nf3"], ["Nf6"], ["e3"], ["e6"]] },
    // Slav
    { plies: [["d4"], ["d5"], ["c4"], ["c6"], ["Nf3"], ["Nf6"], ["Nc3"], ["dxc4"]] },
    // Semi-Slav
    { plies: [["d4"], ["d5"], ["c4"], ["c6"], ["Nf3"], ["Nf6"], ["Nc3"], ["e6"]] },
    // Tarrasch Defense
    { plies: [["d4"], ["d5"], ["c4"], ["e6"], ["Nc3"], ["c5"]] },
    // Catalan
    { plies: [["d4"], ["Nf6"], ["c4"], ["e6"], ["g3"], ["d5"], ["Bg2"]] },
  ],
  "kings-indian": [
    // Classical KID
    { plies: [["d4"], ["Nf6"], ["c4"], ["g6"], ["Nc3"], ["Bg7"], ["e4"], ["d6"], ["Nf3"], ["O-O"], ["Be2"], ["e5"]] },
    // Saemisch
    { plies: [["d4"], ["Nf6"], ["c4"], ["g6"], ["Nc3"], ["Bg7"], ["e4"], ["d6"], ["f3"], ["O-O"]] },
    // Fianchetto KID
    { plies: [["d4"], ["Nf6"], ["c4"], ["g6"], ["g3"], ["Bg7"], ["Bg2"], ["O-O"]] },
    // Grunfeld
    { plies: [["d4"], ["Nf6"], ["c4"], ["g6"], ["Nc3"], ["d5"], ["cxd5"], ["Nxd5"]] },
    // Benoni
    { plies: [["d4"], ["Nf6"], ["c4"], ["c5"], ["d5"], ["e6"], ["Nc3"], ["exd5"], ["cxd5"], ["d6"]] },
  ],
  london: [
    // London vs ...d5
    { plies: [["d4"], ["d5"], ["Bf4"], ["Nf6"], ["e3"], ["e6"], ["Nf3"], ["Bd6"]] },
    // London vs KID setup
    { plies: [["d4"], ["Nf6"], ["Bf4"], ["g6"], ["e3"], ["Bg7"], ["Nf3"], ["O-O"]] },
    // Jobava London
    { plies: [["d4"], ["Nf6"], ["Nc3"], ["d5"], ["Bf4"]] },
  ],
  "kings-gambit": [
    // KGA
    { plies: [["e4"], ["e5"], ["f4"], ["exf4"], ["Nf3"], ["g5"]] },
    // KGD Falkbeer
    { plies: [["e4"], ["e5"], ["f4"], ["d5"]] },
    // KGA Bishop's Gambit
    { plies: [["e4"], ["e5"], ["f4"], ["exf4"], ["Bc4"]] },
  ],
  scandinavian: [
    // Main line ...Qxd5
    { plies: [["e4"], ["d5"], ["exd5"], ["Qxd5"], ["Nc3"], ["Qa5"]] },
    // Modern ...Nf6
    { plies: [["e4"], ["d5"], ["exd5"], ["Nf6"], ["d4"], ["Nxd5"]] },
    // Icelandic
    { plies: [["e4"], ["d5"], ["exd5"], ["Nf6"], ["c4"], ["e6"]] },
  ],
  english: [
    // Symmetrical
    { plies: [["c4"], ["c5"], ["Nc3"], ["Nc6"], ["g3"], ["g6"], ["Bg2"], ["Bg7"]] },
    // Reversed Sicilian
    { plies: [["c4"], ["e5"], ["Nc3"], ["Nf6"], ["Nf3"], ["Nc6"]] },
    // King's English
    { plies: [["c4"], ["e5"], ["g3"], ["Nf6"], ["Bg2"], ["d5"]] },
    // Anglo-Indian
    { plies: [["c4"], ["Nf6"], ["Nc3"], ["e6"], ["e4"], ["d5"]] },
  ],
  universal: [
    { plies: [["e4"]] },
    { plies: [["d4"]] },
    { plies: [["Nf3"]] },
    { plies: [["c4"]] },
    { plies: [["g3"]] },
  ],
};


/** Map a difficulty/rating to playstyle defaults — used as fallback. */
export function defaultPlaystyleForRating(rating: number): Playstyle {
  if (rating < 900) return "universal";
  if (rating < 1300) return "tactical";
  if (rating < 1700) return "positional";
  if (rating < 2200) return "universal";
  return "universal";
}
