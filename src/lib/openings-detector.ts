// ──────────────────────────────────────────────────────────────────────────
// Lightweight, offline opening detector. Given the SAN move list of an
// in-progress (or finished) game, returns the deepest matching opening from
// our local catalogue. Used live during play (instant, no network) and as a
// first pass for the post-game coach review (the AI gets the name + ECO so
// it can give richer advice without needing to "guess" what was played).
// ──────────────────────────────────────────────────────────────────────────

export interface OpeningEntry {
  /** ECO code, e.g. "C50" */
  eco: string;
  /** Human-readable name, e.g. "Italian Game: Giuoco Piano" */
  name: string;
  /** SAN moves that uniquely identify this line, e.g. ["e4","e5","Nf3","Nc6","Bc4","Bc5"] */
  moves: string[];
  /** Optional id used to deep-link into our existing /openings trainer */
  trainerId?: string;
}

/**
 * Curated list of the most common openings up to ~6 plies.
 * The detector picks the entry whose `moves` is the LONGEST prefix of the
 * actual game — so longer/more specific lines win over generic parents.
 */
export const OPENINGS: OpeningEntry[] = [
  // ── King's pawn (1.e4) ──────────────────────────────────────────────
  { eco: "B00", name: "King's Pawn Opening", moves: ["e4"] },
  { eco: "C20", name: "Open Game", moves: ["e4", "e5"] },
  { eco: "C40", name: "King's Knight Opening", moves: ["e4", "e5", "Nf3"] },
  { eco: "C44", name: "King's Pawn Game", moves: ["e4", "e5", "Nf3", "Nc6"] },
  { eco: "C50", name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], trainerId: "italian-game" },
  { eco: "C50", name: "Italian Game: Giuoco Piano", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], trainerId: "italian-game" },
  { eco: "C55", name: "Italian Game: Two Knights Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"], trainerId: "italian-game" },
  { eco: "C60", name: "Ruy López (Spanish)", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], trainerId: "ruy-lopez" },
  { eco: "C65", name: "Ruy López: Berlin Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"], trainerId: "ruy-lopez" },
  { eco: "C68", name: "Ruy López: Exchange Variation", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Bxc6"], trainerId: "ruy-lopez" },
  { eco: "C84", name: "Ruy López: Closed", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O"], trainerId: "ruy-lopez" },
  { eco: "C42", name: "Petrov's Defense", moves: ["e4", "e5", "Nf3", "Nf6"] },
  { eco: "C30", name: "King's Gambit", moves: ["e4", "e5", "f4"] },
  { eco: "C45", name: "Scotch Game", moves: ["e4", "e5", "Nf3", "Nc6", "d4"] },
  { eco: "C46", name: "Four Knights Game", moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"] },
  { eco: "C23", name: "Bishop's Opening", moves: ["e4", "e5", "Bc4"] },
  { eco: "C25", name: "Vienna Game", moves: ["e4", "e5", "Nc3"] },

  // Sicilian
  { eco: "B20", name: "Sicilian Defense", moves: ["e4", "c5"], trainerId: "sicilian-defense" },
  { eco: "B23", name: "Sicilian: Closed", moves: ["e4", "c5", "Nc3"], trainerId: "sicilian-defense" },
  { eco: "B27", name: "Sicilian: Open", moves: ["e4", "c5", "Nf3"], trainerId: "sicilian-defense" },
  { eco: "B30", name: "Sicilian: Old Sicilian", moves: ["e4", "c5", "Nf3", "Nc6"], trainerId: "sicilian-defense" },
  { eco: "B40", name: "Sicilian: French Variation", moves: ["e4", "c5", "Nf3", "e6"], trainerId: "sicilian-defense" },
  { eco: "B50", name: "Sicilian: Old Sicilian / Najdorf intro", moves: ["e4", "c5", "Nf3", "d6"], trainerId: "sicilian-defense" },
  { eco: "B90", name: "Sicilian: Najdorf", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"], trainerId: "sicilian-defense" },
  { eco: "B70", name: "Sicilian: Dragon", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"], trainerId: "sicilian-defense" },
  { eco: "B80", name: "Sicilian: Scheveningen", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6"], trainerId: "sicilian-defense" },

  // French / Caro-Kann / Pirc / Modern
  { eco: "C00", name: "French Defense", moves: ["e4", "e6"], trainerId: "french-defense" },
  { eco: "C02", name: "French: Advance Variation", moves: ["e4", "e6", "d4", "d5", "e5"], trainerId: "french-defense" },
  { eco: "C10", name: "French: Rubinstein", moves: ["e4", "e6", "d4", "d5", "Nc3", "dxe4"], trainerId: "french-defense" },
  { eco: "C11", name: "French: Classical", moves: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"], trainerId: "french-defense" },
  { eco: "C15", name: "French: Winawer", moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"], trainerId: "french-defense" },
  { eco: "B10", name: "Caro-Kann Defense", moves: ["e4", "c6"], trainerId: "caro-kann" },
  { eco: "B12", name: "Caro-Kann: Advance", moves: ["e4", "c6", "d4", "d5", "e5"], trainerId: "caro-kann" },
  { eco: "B18", name: "Caro-Kann: Classical", moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"], trainerId: "caro-kann" },
  { eco: "B07", name: "Pirc Defense", moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"] },
  { eco: "B06", name: "Modern Defense", moves: ["e4", "g6"] },
  { eco: "B01", name: "Scandinavian Defense", moves: ["e4", "d5"] },
  { eco: "B02", name: "Alekhine's Defense", moves: ["e4", "Nf6"] },

  // ── Queen's pawn (1.d4) ─────────────────────────────────────────────
  { eco: "A40", name: "Queen's Pawn Opening", moves: ["d4"] },
  { eco: "D00", name: "Queen's Pawn Game", moves: ["d4", "d5"] },
  { eco: "D02", name: "London System (early)", moves: ["d4", "d5", "Nf3", "Nf6", "Bf4"] },
  { eco: "D02", name: "London System", moves: ["d4", "Nf6", "Bf4"] },
  { eco: "D06", name: "Queen's Gambit", moves: ["d4", "d5", "c4"], trainerId: "queens-gambit" },
  { eco: "D20", name: "Queen's Gambit Accepted", moves: ["d4", "d5", "c4", "dxc4"], trainerId: "queens-gambit" },
  { eco: "D30", name: "Queen's Gambit Declined", moves: ["d4", "d5", "c4", "e6"], trainerId: "queens-gambit" },
  { eco: "D10", name: "Slav Defense", moves: ["d4", "d5", "c4", "c6"] },
  { eco: "D43", name: "Semi-Slav Defense", moves: ["d4", "d5", "c4", "c6", "Nc3", "Nf6", "Nf3", "e6"] },
  { eco: "A45", name: "Indian Game", moves: ["d4", "Nf6"] },
  { eco: "E00", name: "Catalan Opening", moves: ["d4", "Nf6", "c4", "e6", "g3"] },
  { eco: "E20", name: "Nimzo-Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"], trainerId: "nimzo-indian" },
  { eco: "E60", name: "King's Indian Defense", moves: ["d4", "Nf6", "c4", "g6"], trainerId: "kings-indian" },
  { eco: "E80", name: "King's Indian: Sämisch", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "f3"], trainerId: "kings-indian" },
  { eco: "D70", name: "Grünfeld Defense", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"] },
  { eco: "E12", name: "Queen's Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"] },
  { eco: "A50", name: "Benoni Defense (early)", moves: ["d4", "Nf6", "c4", "c5"] },
  { eco: "A57", name: "Benko Gambit", moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"] },
  { eco: "A40", name: "Dutch Defense", moves: ["d4", "f5"] },

  // ── Flank openings ──────────────────────────────────────────────────
  { eco: "A04", name: "Réti Opening", moves: ["Nf3"] },
  { eco: "A10", name: "English Opening", moves: ["c4"] },
  { eco: "A00", name: "Bird's Opening", moves: ["f4"] },
  { eco: "A00", name: "Larsen's Opening", moves: ["b3"] },
  { eco: "A00", name: "Sokolsky / Polish Opening", moves: ["b4"] },
  { eco: "A00", name: "Grob Opening", moves: ["g4"] },
  { eco: "A00", name: "Nimzowitsch-Larsen Attack", moves: ["b3", "e5"] },
  { eco: "A04", name: "King's Indian Attack", moves: ["Nf3", "d5", "g3"] },
];

/**
 * Returns the most specific matching opening for the supplied SAN move list,
 * or null when nothing matches (e.g. weird transpositions of a fresh game).
 */
export function detectOpening(sanMoves: string[]): OpeningEntry | null {
  if (!sanMoves || sanMoves.length === 0) return null;

  // Trim trailing junk (chess.js sometimes returns "" for illegal entries).
  const moves = sanMoves.filter(Boolean);
  if (moves.length === 0) return null;

  let best: OpeningEntry | null = null;
  let bestLen = 0;

  for (const op of OPENINGS) {
    if (op.moves.length > moves.length) continue;
    let ok = true;
    for (let i = 0; i < op.moves.length; i++) {
      if (op.moves[i] !== moves[i]) { ok = false; break; }
    }
    if (ok && op.moves.length > bestLen) {
      best = op;
      bestLen = op.moves.length;
    }
  }
  return best;
}

/** Convenience helper: format "C50 · Italian Game". */
export function formatOpeningLabel(op: OpeningEntry | null): string {
  if (!op) return "Unknown opening";
  return `${op.eco} · ${op.name}`;
}
