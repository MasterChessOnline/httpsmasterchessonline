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

export const OPENING_BOOKS: Record<OpeningRepertoire, OpeningLine[]> = {
  italian: [
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bc4"], ["Bc5", "Nf6"], ["c3", "d3"]] },
  ],
  "ruy-lopez": [
    { plies: [["e4"], ["e5"], ["Nf3"], ["Nc6"], ["Bb5"], ["a6", "Nf6"], ["Ba4", "Bxc6"]] },
  ],
  sicilian: [
    { plies: [["e4"], ["c5"], ["Nf3"], ["d6", "Nc6", "e6"], ["d4"], ["cxd4"], ["Nxd4"]] },
  ],
  french: [
    { plies: [["e4"], ["e6"], ["d4"], ["d5"], ["Nc3", "Nd2", "e5"]] },
  ],
  "caro-kann": [
    { plies: [["e4"], ["c6"], ["d4"], ["d5"], ["Nc3", "Nd2", "e5", "exd5"]] },
  ],
  "queens-gambit": [
    { plies: [["d4"], ["d5"], ["c4"], ["e6", "c6", "dxc4"], ["Nc3", "Nf3"]] },
  ],
  "kings-indian": [
    { plies: [["d4"], ["Nf6"], ["c4"], ["g6"], ["Nc3"], ["Bg7"], ["e4"], ["d6"]] },
  ],
  london: [
    { plies: [["d4"], ["d5", "Nf6"], ["Nf3"], ["Nf6", "d5"], ["Bf4"]] },
  ],
  "kings-gambit": [
    { plies: [["e4"], ["e5"], ["f4"]] },
  ],
  scandinavian: [
    { plies: [["e4"], ["d5"], ["exd5"], ["Qxd5", "Nf6"]] },
  ],
  english: [
    { plies: [["c4"], ["e5", "Nf6", "c5"], ["Nc3"], ["Nf6", "Nc6"]] },
  ],
  universal: [
    { plies: [["e4", "d4", "Nf3", "c4"]] },
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
