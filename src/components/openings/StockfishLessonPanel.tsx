import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Brain, Power, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { getStockfishEngine, type MultiPvLine } from "@/lib/stockfish-engine";

interface Props {
  /** FEN of the position currently displayed on the board. */
  fen: string;
  /** SAN of the move that produced `fen` (i.e. the move just played), if any. */
  playedSan?: string | null;
  /** FEN of the position BEFORE `playedSan`, used to compute the comment for that move. */
  fenBeforePlayed?: string | null;
}

function formatEval(cp: number, mate: number | null): string {
  if (mate !== null) return `M${mate}`;
  const v = cp / 100;
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}

function evalToBarPct(cp: number, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 96 : 4;
  const x = cp / 100;
  return Math.max(4, Math.min(96, 50 + 50 * (2 / (1 + Math.exp(-0.4 * x)) - 1)));
}

function uciToSan(fen: string, uci: string): string {
  try {
    const g = new Chess(fen);
    const m = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as any });
    return m?.san ?? uci;
  } catch {
    return uci;
  }
}

function pvToSan(startFen: string, uciPv: string[], maxPlies = 6): string[] {
  const out: string[] = [];
  try {
    const g = new Chess(startFen);
    for (const u of uciPv.slice(0, maxPlies)) {
      const m = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] as any });
      if (!m) break;
      out.push(m.san);
    }
  } catch { /* */ }
  return out;
}

function classifyDrop(dropCp: number): { label: string; cls: string } {
  if (dropCp <= 20) return { label: "Best move", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
  if (dropCp <= 60) return { label: "Excellent", cls: "text-emerald-300 border-emerald-500/20 bg-emerald-500/5" };
  if (dropCp <= 120) return { label: "Inaccuracy", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" };
  if (dropCp <= 250) return { label: "Mistake", cls: "text-orange-300 border-orange-500/30 bg-orange-500/10" };
  return { label: "Blunder", cls: "text-red-300 border-red-500/30 bg-red-500/10" };
}

export default function StockfishLessonPanel({ fen, playedSan, fenBeforePlayed }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [depth, setDepth] = useState([14]);
  const [lines, setLines] = useState<MultiPvLine[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [moveComment, setMoveComment] = useState<{
    text: string;
    label: string;
    cls: string;
    bestSan?: string;
    bestEval?: { cp: number; mate: number | null };
    playedEval?: { cp: number; mate: number | null };
  } | null>(null);

  const engineRef = useRef(getStockfishEngine());
  const abortRef = useRef(0);

  // Init engine when enabled
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    engineRef.current.init().then(() => {
      if (cancelled) return;
      setReady(true);
      engineRef.current.newGame();
    });
    return () => { cancelled = true; };
  }, [enabled]);

  // Analyze current position
  useEffect(() => {
    if (!enabled || !ready) return;
    const id = ++abortRef.current;
    setAnalyzing(true);
    const engine = engineRef.current;
    engine.getMultiPV(fen, 3, depth[0]).then((res) => {
      if (abortRef.current !== id) return;
      setLines(res);
      setAnalyzing(false);
    });
  }, [enabled, ready, fen, depth]);

  // Compute comment for the move that produced `fen`
  useEffect(() => {
    if (!enabled || !ready || !playedSan || !fenBeforePlayed) {
      setMoveComment(null);
      return;
    }
    const id = ++abortRef.current;
    const engine = engineRef.current;
    (async () => {
      try {
        // Top engine lines BEFORE the played move
        const before = await engine.getMultiPV(fenBeforePlayed, 3, Math.min(14, depth[0]));
        if (abortRef.current !== id) return;
        if (!before.length) { setMoveComment(null); return; }

        const bestUci = before[0].pv[0] || "";
        const bestSan = bestUci ? uciToSan(fenBeforePlayed, bestUci) : "?";
        const bestCp = before[0].mate !== null ? (before[0].mate > 0 ? 10000 : -10000) : before[0].eval;

        // Was the played move the engine's top choice?
        const isBest = bestSan === playedSan;
        let playedCp = bestCp;
        let playedMate: number | null = before[0].mate;

        if (!isBest) {
          // Evaluate the position after the played move (eval from opponent POV → flip sign)
          const evalAfter = await engine.evaluate(fen, Math.min(12, depth[0]));
          if (abortRef.current !== id) return;
          playedCp = evalAfter.mate !== null
            ? (evalAfter.mate > 0 ? -10000 : 10000)
            : -evalAfter.evaluation;
          playedMate = evalAfter.mate !== null ? -evalAfter.mate : null;
        }

        const dropCp = Math.max(0, bestCp - playedCp);
        const { label, cls } = isBest
          ? { label: "Best move", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" }
          : classifyDrop(dropCp);

        let text: string;
        if (isBest) {
          text = `${playedSan} is Stockfish's top choice (${formatEval(bestCp, before[0].mate)}).`;
        } else {
          text = `Engine prefers ${bestSan} (${formatEval(bestCp, before[0].mate)}). ${playedSan} drops the eval to ${formatEval(playedCp, playedMate)}.`;
        }

        setMoveComment({
          text,
          label,
          cls,
          bestSan,
          bestEval: { cp: bestCp, mate: before[0].mate },
          playedEval: { cp: playedCp, mate: playedMate },
        });
      } catch {
        setMoveComment(null);
      }
    })();
  }, [enabled, ready, playedSan, fenBeforePlayed, depth, fen]);

  const evalLine = lines[0];
  const evalText = useMemo(() => evalLine ? formatEval(evalLine.eval, evalLine.mate) : "0.00", [evalLine]);
  const evalPct = useMemo(() => evalLine ? evalToBarPct(evalLine.eval, evalLine.mate) : 50, [evalLine]);
  const whiteToMove = fen.split(" ")[1] === "w";

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Stockfish Analysis
        </h3>
        <Button
          size="sm"
          variant={enabled ? "default" : "outline"}
          onClick={() => setEnabled((v) => !v)}
          className="gap-1 h-7"
        >
          <Power className="h-3.5 w-3.5" />
          {enabled ? "On" : "Off"}
        </Button>
      </div>

      {!enabled && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Turn Stockfish on to get a live position score and engine comments on every move in this variation.
        </p>
      )}

      {enabled && !ready && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading engine…
        </div>
      )}

      {enabled && ready && (
        <div className="space-y-3">
          {/* Eval bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Evaluation</span>
              <span className="text-xs font-mono font-bold text-foreground">{evalText}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden bg-black/70 border border-border/50">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${whiteToMove ? evalPct : 100 - evalPct}%`, marginLeft: whiteToMove ? 0 : `${evalPct}%` }}
              />
            </div>
          </div>

          {/* Depth control */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground shrink-0">Depth</span>
            <Slider value={depth} onValueChange={setDepth} min={8} max={20} step={1} />
            <Badge variant="secondary" className="text-[10px]">{depth[0]}</Badge>
          </div>

          {/* Move comment */}
          {moveComment && (
            <div className={`rounded-lg border p-2.5 ${moveComment.cls}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-wide font-bold">{moveComment.label}</span>
                {playedSan && <span className="font-mono text-xs">{playedSan}</span>}
              </div>
              <p className="text-xs leading-snug">{moveComment.text}</p>
            </div>
          )}

          {/* Top lines */}
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Top lines</div>
            <div className="space-y-1">
              {analyzing && lines.length === 0 && (
                <div className="text-xs text-muted-foreground">Analyzing…</div>
              )}
              {lines.map((line, i) => {
                const sanPv = pvToSan(fen, line.pv, 6);
                const positive = line.mate !== null ? line.mate > 0 : line.eval > 0;
                return (
                  <div key={i} className={`flex items-center gap-2 text-xs p-1.5 rounded ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}>
                    <span className={`font-bold font-mono min-w-[52px] ${positive ? "text-emerald-400" : "text-red-400"}`}>
                      {formatEval(line.eval, line.mate)}
                    </span>
                    <span className="text-muted-foreground truncate font-mono">{sanPv.join(" ") || line.pv.slice(0, 4).join(" ")}</span>
                    {i === 0 && <Zap className="w-3 h-3 text-primary ml-auto shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
