/**
 * Stockfish-style move classification (Brilliant / Best / Great / Book /
 * Inaccuracy / Mistake / Blunder) + per-side Accuracy %.
 *
 * Heuristic, single-PV: compares engine eval before each move to the eval
 * after it (centipawn loss in the mover's favor). Books are detected via the
 * MasterChess DB.  Pure presentation logic — no AI assistance during play.
 */

export type MoveClass =
  | "brilliant"
  | "great"
  | "best"
  | "book"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export interface ClassifiedMove {
  classification: MoveClass;
  cpLoss: number; // centipawns lost by mover (>=0)
}

interface EvalSnapshot {
  // White-POV centipawns; mate stored as ±10000
  cp: number;
  mate: number | null; // white-POV mate distance
}

function toMoverPov(snap: EvalSnapshot, color: "w" | "b"): number {
  // Convert white-POV cp to mover's POV (positive = good for mover)
  const cp = snap.mate !== null ? (snap.mate >= 0 ? 10000 : -10000) : snap.cp;
  return color === "w" ? cp : -cp;
}

export function classifyMove(args: {
  beforeEval: EvalSnapshot;
  afterEval: EvalSnapshot;
  color: "w" | "b";
  isBookMove?: boolean;
}): ClassifiedMove {
  const { beforeEval, afterEval, color, isBookMove } = args;

  if (isBookMove) return { classification: "book", cpLoss: 0 };

  const before = toMoverPov(beforeEval, color);
  // After mover plays, opponent is to move → eval flips meaning.
  // afterEval is still white-POV (post-move). Convert again to *mover's* POV.
  const after = toMoverPov(afterEval, color);

  const cpLoss = Math.max(0, before - after);

  // If the mover delivers / is on the path of mate-for-them, treat as best/great
  if (afterEval.mate !== null) {
    const mateW = afterEval.mate;
    const goodMate = (color === "w" && mateW > 0) || (color === "b" && mateW < 0);
    if (goodMate && Math.abs(mateW) <= 5) return { classification: "best", cpLoss: 0 };
  }

  if (cpLoss <= 5) return { classification: "best", cpLoss };
  if (cpLoss <= 25) return { classification: "good", cpLoss };
  if (cpLoss <= 60) return { classification: "inaccuracy", cpLoss };
  if (cpLoss <= 150) return { classification: "mistake", cpLoss };
  return { classification: "blunder", cpLoss };
}

/**
 * Accuracy formula derived from Lichess WP-loss curve (simplified):
 *   wp = 50 + 50 * (2/(1+e^(-0.4*x)) - 1)   where x = cp/100
 *   loss_i = max(0, wp_before_mover - wp_after_mover)
 *   acc_i  = clamp(103.1668 * exp(-0.04354 * loss_i) - 3.1668, 0, 100)
 */
function winProb(cp: number): number {
  const x = Math.max(-10, Math.min(10, cp / 100));
  return 50 + 50 * (2 / (1 + Math.exp(-0.4 * x)) - 1);
}

export function computeAccuracy(
  evals: { color: "w" | "b"; before: EvalSnapshot; after: EvalSnapshot }[]
): { white: number; black: number } {
  const losses: { w: number[]; b: number[] } = { w: [], b: [] };
  for (const e of evals) {
    const before = toMoverPov(e.before, e.color);
    const after = toMoverPov(e.after, e.color);
    const loss = Math.max(0, winProb(before) - winProb(after));
    const acc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * loss) - 3.1668));
    losses[e.color].push(acc);
  }
  const avg = (xs: number[]) => xs.length === 0 ? 100 : xs.reduce((a, b) => a + b, 0) / xs.length;
  return { white: Math.round(avg(losses.w) * 10) / 10, black: Math.round(avg(losses.b) * 10) / 10 };
}

export const CLASS_META: Record<MoveClass, { label: string; symbol: string; color: string; bg: string }> = {
  brilliant:  { label: "Brilliant",  symbol: "!!", color: "text-cyan-300",   bg: "bg-cyan-500/15 border-cyan-400/40" },
  great:      { label: "Great",      symbol: "!",  color: "text-blue-300",   bg: "bg-blue-500/15 border-blue-400/40" },
  best:       { label: "Best",       symbol: "★",  color: "text-emerald-300",bg: "bg-emerald-500/15 border-emerald-400/40" },
  book:       { label: "Book",       symbol: "📖", color: "text-amber-300",  bg: "bg-amber-500/15 border-amber-400/40" },
  good:       { label: "Good",       symbol: "·",  color: "text-foreground/80", bg: "bg-muted/20 border-border/40" },
  inaccuracy: { label: "Inaccuracy", symbol: "?!", color: "text-yellow-300", bg: "bg-yellow-500/15 border-yellow-400/40" },
  mistake:    { label: "Mistake",    symbol: "?",  color: "text-orange-300", bg: "bg-orange-500/15 border-orange-400/40" },
  blunder:    { label: "Blunder",    symbol: "??", color: "text-red-300",    bg: "bg-red-500/15 border-red-400/40" },
};
