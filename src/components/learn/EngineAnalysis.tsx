import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Cpu, Loader2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStockfishEngine, type MultiPvLine } from "@/lib/stockfish-engine";

interface Props {
  fen: string;
  /** Hide the toggle — when caller controls visibility. */
  alwaysOn?: boolean;
  depth?: number;
  lines?: number;
}

function formatScore(line: MultiPvLine, whiteToMove: boolean): string {
  if (line.mate !== null) {
    const m = whiteToMove ? line.mate : -line.mate;
    return `M${Math.abs(m)}${m < 0 ? " (–)" : ""}`;
  }
  const cp = whiteToMove ? line.eval : -line.eval;
  const v = (cp / 100).toFixed(2);
  return cp >= 0 ? `+${v}` : v;
}

function uciLineToSan(fen: string, uci: string[], maxPly = 6): string {
  try {
    const c = new Chess(fen);
    const out: string[] = [];
    for (const u of uci.slice(0, maxPly)) {
      if (!u || u.length < 4) break;
      const move = c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] as any });
      if (!move) break;
      out.push(move.san);
    }
    return out.join(" ");
  } catch {
    return uci.slice(0, maxPly).join(" ");
  }
}

export default function EngineAnalysis({ fen, alwaysOn = false, depth = 14, lines = 2 }: Props) {
  const [enabled, setEnabled] = useState(alwaysOn);
  const [loading, setLoading] = useState(false);
  const [pvLines, setPvLines] = useState<MultiPvLine[]>([]);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const myReq = ++reqIdRef.current;

    (async () => {
      setLoading(true);
      try {
        const engine = getStockfishEngine();
        await engine.init();
        const result = await engine.getMultiPV(fen, lines, depth);
        if (cancelled || reqIdRef.current !== myReq) return;
        setPvLines(result);
      } catch {
        if (!cancelled) setPvLines([]);
      } finally {
        if (!cancelled && reqIdRef.current === myReq) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fen, enabled, depth, lines]);

  const whiteToMove = (() => {
    try { return new Chess(fen).turn() === "w"; } catch { return true; }
  })();

  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          Stockfish Engine
        </div>
        {!alwaysOn && (
          <Button
            variant={enabled ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setEnabled((v) => !v)}
          >
            <Power className="w-3 h-3 mr-1" />
            {enabled ? "On" : "Off"}
          </Button>
        )}
      </div>

      {!enabled ? (
        <p className="text-xs text-muted-foreground italic">
          Turn on the engine to see top moves and evaluation for the current position.
        </p>
      ) : loading && pvLines.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…
        </div>
      ) : pvLines.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No engine output.</p>
      ) : (
        <ul className="space-y-1.5">
          {pvLines.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span className="font-mono font-bold text-primary min-w-[52px]">
                {formatScore(line, whiteToMove)}
              </span>
              <span className="font-mono text-foreground flex-1 break-words">
                {uciLineToSan(fen, line.pv, 6) || "—"}
              </span>
              <span className="text-[10px] text-muted-foreground">d{line.depth}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
