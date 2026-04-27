// Game Review eval panel — runs Stockfish on every move once, then shows
// a clean vertical eval bar synchronised with the currently selected move.
// No verdicts, no AI commentary, no "Brilliant" tags — just the engine.
import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getStockfishEngine } from "@/lib/stockfish-engine";

interface EvalPoint {
  /** Centipawns from White's POV. Clamped to ±1500 for display. */
  cp: number;
  /** Mate in N from White's POV (positive = white mates), or null. */
  mate: number | null;
}

interface Props {
  /** SAN list for the loaded game. */
  moves: { san: string }[];
  /** Currently displayed ply (-1 = starting position, 0..moves.length-1 = after that move). */
  currentMove: number;
  /** Analysis depth per position (default 14 — fast & accurate enough for review). */
  depth?: number;
}

const CLAMP = 1500;

function fmtEval(cp: number, mate: number | null): string {
  if (mate !== null) return mate > 0 ? `M${mate}` : `-M${Math.abs(mate)}`;
  const v = cp / 100;
  return (v >= 0 ? "+" : "") + v.toFixed(2);
}

/** Convert centipawn from current side-to-move POV → White POV. */
function toWhitePov(fen: string, cp: number, mate: number | null): { cp: number; mate: number | null } {
  const whiteToMove = new Chess(fen).turn() === "w";
  if (whiteToMove) return { cp, mate };
  return { cp: -cp, mate: mate === null ? null : -mate };
}

export default function EvalReviewPanel({ moves, currentMove, depth = 14 }: Props) {
  const [evals, setEvals] = useState<(EvalPoint | null)[]>([]);
  const [analysing, setAnalysing] = useState(false);
  const [done, setDone] = useState(0);
  const [started, setStarted] = useState(false);
  const cancelRef = useRef(false);

  // Reset when a new game is loaded.
  useEffect(() => {
    cancelRef.current = true;
    setEvals(new Array(moves.length + 1).fill(null));
    setStarted(false);
    setAnalysing(false);
    setDone(0);
  }, [moves]);

  const runAnalysis = async () => {
    if (analysing || moves.length === 0) return;
    cancelRef.current = false;
    setStarted(true);
    setAnalysing(true);
    setDone(0);

    const engine = getStockfishEngine();
    try {
      await engine.init();
      engine.newGame();

      const game = new Chess();
      const fens: string[] = [game.fen()]; // ply 0 = start
      for (const m of moves) {
        try {
          game.move(m.san);
          fens.push(game.fen());
        } catch {
          break;
        }
      }

      const next: (EvalPoint | null)[] = new Array(fens.length).fill(null);
      for (let i = 0; i < fens.length; i++) {
        if (cancelRef.current) return;
        const fen = fens[i];
        const { evaluation, mate } = await engine.evaluate(fen, depth);
        const wp = toWhitePov(fen, evaluation, mate);
        next[i] = {
          cp: Math.max(-CLAMP, Math.min(CLAMP, wp.cp)),
          mate: wp.mate,
        };
        // Push incremental updates so the bar fills as we go.
        setEvals([...next]);
        setDone(i + 1);
      }
    } catch (err) {
      console.error("EvalReviewPanel analysis failed", err);
    } finally {
      if (!cancelRef.current) setAnalysing(false);
    }
  };

  useEffect(() => () => { cancelRef.current = true; }, []);

  // Pick the eval matching the currently displayed ply (currentMove = -1 → ply 0).
  const idx = Math.max(0, Math.min(currentMove + 1, evals.length - 1));
  const point = evals[idx];

  const evalPercent = useMemo(() => {
    if (!point) return 50;
    if (point.mate !== null) return point.mate > 0 ? 100 : 0;
    // Smooth sigmoid mapping so small advantages don't peg the bar.
    const v = point.cp / 100;
    const pct = 50 + 50 * (2 / (1 + Math.exp(-0.4 * v)) - 1);
    return Math.max(2, Math.min(98, pct));
  }, [point]);

  const total = moves.length + 1;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!started) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card/80 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/15 border border-primary/30 p-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-foreground">Stockfish Eval</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pure engine evaluation for every move. No labels, no coaching — just the bar.
            </p>
          </div>
        </div>
        <Button onClick={runAnalysis} className="w-full" disabled={moves.length === 0}>
          <Sparkles className="h-4 w-4 mr-2" /> Run Stockfish
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Stockfish Eval</h3>
          <p className="text-[11px] text-muted-foreground">
            Move {Math.max(0, currentMove + 1)} of {moves.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-bold text-foreground tabular-nums">
            {point ? fmtEval(point.cp, point.mate) : "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">White POV</p>
        </div>
      </div>

      {/* Vertical eval bar */}
      <div className="flex items-stretch gap-3 h-[280px]">
        <div className="w-8 rounded-md overflow-hidden relative flex flex-col border border-border/40">
          <motion.div
            className="bg-[hsl(220,15%,18%)]"
            animate={{ flexBasis: `${100 - evalPercent}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            style={{ flexShrink: 0 }}
          />
          <motion.div
            className="bg-[hsl(60,10%,90%)]"
            animate={{ flexBasis: `${evalPercent}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            style={{ flexShrink: 0 }}
          />
          {/* Midline */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/40 pointer-events-none" />
        </div>

        {/* Per-move sparkline */}
        <div className="flex-1 relative rounded-md border border-border/40 bg-[hsl(220,15%,10%)]/40 overflow-hidden">
          <div className="absolute inset-0 flex">
            {evals.map((p, i) => {
              const pct = !p
                ? 50
                : p.mate !== null
                ? (p.mate > 0 ? 100 : 0)
                : 50 + 50 * (2 / (1 + Math.exp(-0.4 * (p.cp / 100))) - 1);
              const isCurrent = i === idx;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end relative">
                  <div
                    className={`w-full ${isCurrent ? "bg-primary" : "bg-[hsl(60,10%,90%)]/70"}`}
                    style={{ height: `${pct}%` }}
                  />
                  <div
                    className={`w-full ${isCurrent ? "bg-primary/40" : "bg-[hsl(220,15%,22%)]"}`}
                    style={{ height: `${100 - pct}%`, position: "absolute", top: 0, left: 0 }}
                  />
                </div>
              );
            })}
          </div>
          {/* Midline */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/30 pointer-events-none" />
        </div>
      </div>

      {analysing && (
        <div className="space-y-1.5">
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span>Analysing… {done} / {total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
