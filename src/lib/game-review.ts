/**
 * Stockfish-style move classification + per-side Accuracy %.
 *
 * Categories (Stockfish-style, expanded):
 *   Brilliant · Great · Best · Book · Good · Forced · Sacrifice ·
 *   Inaccuracy · Dubious · Mistake · Blunder · Missed Win · Missed Draw
 *
 * Heuristic, single-PV: compares engine eval before each move to the eval
 * after it (winning-percentage loss in the mover's favor). Books are
 * detected via the MasterChess DB by the caller. Pure presentation logic —
 * no AI assistance during play.
 */

export type MoveClass =
  | "brilliant"
  | "great"
  | "best"
  | "book"
  | "good"
  | "forced"
  | "sacrifice"
  | "inaccuracy"
  | "dubious"
  | "mistake"
  | "blunder"
  | "missed_win"
  | "missed_draw";

export interface ClassifiedMove {
  classification: MoveClass;
  cpLoss: number; // centipawns lost by mover (>=0)
}

interface EvalSnapshot {
  cp: number;          // white-POV centipawns
  mate: number | null; // white-POV mate distance
}

function toMoverPov(snap: EvalSnapshot, color: "w" | "b"): number {
  const cp = snap.mate !== null ? (snap.mate >= 0 ? 10000 : -10000) : snap.cp;
  return color === "w" ? cp : -cp;
}

/**
 * Win-probability curve (Lichess-style, simplified).
 * Returns 0–100.
 */
function winProb(cp: number): number {
  const x = Math.max(-10, Math.min(10, cp / 100));
  return 50 + 50 * (2 / (1 + Math.exp(-0.4 * x)) - 1);
}

export function classifyMove(args: {
  beforeEval: EvalSnapshot;
  afterEval: EvalSnapshot;
  color: "w" | "b";
  isBookMove?: boolean;
  /** Number of legal moves the mover had. 1 ⇒ forced. */
  legalCount?: number;
  /** Material delta in pawn units (positive = mover gave up material on this move). */
  materialSacrificed?: number;
}): ClassifiedMove {
  const { beforeEval, afterEval, color, isBookMove, legalCount, materialSacrificed } = args;

  if (isBookMove) return { classification: "book", cpLoss: 0 };

  // Only-legal-move trumps everything else.
  if (legalCount === 1) return { classification: "forced", cpLoss: 0 };

  const before = toMoverPov(beforeEval, color);
  const after = toMoverPov(afterEval, color);
  const cpLoss = Math.max(0, before - after);

  // Mover is delivering / on path of mate-for-them → treat as best.
  if (afterEval.mate !== null) {
    const mateW = afterEval.mate;
    const goodMate = (color === "w" && mateW > 0) || (color === "b" && mateW < 0);
    if (goodMate && Math.abs(mateW) <= 5) return { classification: "best", cpLoss: 0 };
  }

  const wpBefore = winProb(before);
  const wpAfter = winProb(after);
  const wpLoss = Math.max(0, wpBefore - wpAfter);

  const stillWinning = after >= 300;
  const stillCompletelyWinning = after >= 600;

  // Missed-win / missed-draw special cases (highest narrative weight).
  // Threw away a winning position.
  if (before >= 500 && after < 150 && after > -150 && wpLoss >= 10) {
    return { classification: "missed_win", cpLoss };
  }
  // Threw away a drawn/balanced position into a losing one.
  if (Math.abs(before) < 120 && after <= -300 && wpLoss >= 15) {
    return { classification: "missed_draw", cpLoss };
  }

  // Base classification by winning-% loss.
  let classification: MoveClass;
  if (wpLoss < 2) classification = "best";
  else if (wpLoss < 5) classification = "good";
  else if (wpLoss < 10) classification = "inaccuracy";
  else if (wpLoss < 20) classification = "mistake";
  else classification = "blunder";

  // Safety caps: still totally winning can't be "blunder/mistake".
  if (stillCompletelyWinning && classification !== "best") classification = "good";
  else if (stillWinning && (classification === "blunder" || classification === "mistake")) {
    classification = "inaccuracy";
  }

  // Sacrifice: gave up >= a minor piece BUT position holds or improves.
  // Detected when the mover loses ≥3 pawns of material yet eval doesn't tank.
  if (materialSacrificed !== undefined && materialSacrificed >= 3 && after >= -80 && wpLoss < 12) {
    return { classification: "sacrifice", cpLoss };
  }

  // Dubious: a borderline mistake that complicates the position.
  // (Mistake-tier loss but in a still-fightable position with sharp swing.)
  if (classification === "mistake" && after >= -250 && Math.abs(before - after) >= 80) {
    classification = "dubious";
  }

  // Brilliant / Great upgrades.
  if (classification === "best") {
    const swing = after - before;
    if (before <= -200 && after >= 50 && swing >= 250) classification = "brilliant";
    else if (before <= 30 && after >= 200 && swing >= 150) classification = "great";
  }

  return { classification, cpLoss };
}

export function computeAccuracy(
  evals: { color: "w" | "b"; before: EvalSnapshot; after: EvalSnapshot }[]
): { white: number; black: number } {
  const accs: { w: number[]; b: number[] } = { w: [], b: [] };
  for (const e of evals) {
    const before = toMoverPov(e.before, e.color);
    const after = toMoverPov(e.after, e.color);
    const loss = Math.max(0, winProb(before) - winProb(after));
    const acc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * loss) - 3.1668));
    accs[e.color].push(acc);
  }
  const avg = (xs: number[]) => xs.length === 0 ? 100 : xs.reduce((a, b) => a + b, 0) / xs.length;
  return { white: Math.round(avg(accs.w) * 10) / 10, black: Math.round(avg(accs.b) * 10) / 10 };
}

export const CLASS_META: Record<MoveClass, { label: string; symbol: string; color: string; bg: string }> = {
  brilliant:   { label: "Brilliant",   symbol: "!!", color: "text-cyan-300",    bg: "bg-cyan-500/15 border-cyan-400/40" },
  great:       { label: "Great",       symbol: "!",  color: "text-blue-300",    bg: "bg-blue-500/15 border-blue-400/40" },
  best:        { label: "Best",        symbol: "★",  color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-400/40" },
  book:        { label: "Book",        symbol: "📖", color: "text-amber-300",   bg: "bg-amber-500/15 border-amber-400/40" },
  good:        { label: "Good",        symbol: "·",  color: "text-foreground/80", bg: "bg-muted/20 border-border/40" },
  forced:      { label: "Forced",      symbol: "□",  color: "text-slate-300",   bg: "bg-slate-500/15 border-slate-400/40" },
  sacrifice:   { label: "Sacrifice",   symbol: "✦",  color: "text-fuchsia-300", bg: "bg-fuchsia-500/15 border-fuchsia-400/40" },
  inaccuracy:  { label: "Inaccuracy",  symbol: "?!", color: "text-yellow-300",  bg: "bg-yellow-500/15 border-yellow-400/40" },
  dubious:     { label: "Dubious",     symbol: "?!", color: "text-amber-200",   bg: "bg-amber-400/10 border-amber-300/40" },
  mistake:     { label: "Mistake",     symbol: "?",  color: "text-orange-300",  bg: "bg-orange-500/15 border-orange-400/40" },
  blunder:     { label: "Blunder",     symbol: "??", color: "text-red-300",     bg: "bg-red-500/15 border-red-400/40" },
  missed_win:  { label: "Missed Win",  symbol: "⚐",  color: "text-rose-300",    bg: "bg-rose-500/15 border-rose-400/40" },
  missed_draw: { label: "Missed Draw", symbol: "≈",  color: "text-pink-300",    bg: "bg-pink-500/15 border-pink-400/40" },
};
