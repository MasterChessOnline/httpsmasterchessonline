import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { getStockfishEngine } from "@/lib/stockfish-engine";

export interface EngineEvalState {
  evalCp: number;       // From White's perspective (positive = White better), centipawns
  mate: number | null;  // From White's perspective
  bestMoveUci: string | null; // e.g. "e2e4" or "e7e8q"
  bestMoveSan: string | null;
  depth: number;
  loading: boolean;
}

const EMPTY: EngineEvalState = {
  evalCp: 0, mate: null, bestMoveUci: null, bestMoveSan: null, depth: 0, loading: false,
};

/** Reactive Stockfish evaluation for a FEN. Disabled when `enabled` is false. */
export function useEngineEval(fen: string, enabled: boolean, depth = 14): EngineEvalState {
  const [state, setState] = useState<EngineEvalState>(EMPTY);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) { setState(EMPTY); return; }
    let cancelled = false;
    const myReq = ++reqIdRef.current;
    setState((s) => ({ ...s, loading: true }));

    (async () => {
      try {
        const engine = getStockfishEngine();
        await engine.init();
        const lines = await engine.getMultiPV(fen, 1, depth);
        if (cancelled || reqIdRef.current !== myReq) return;
        const top = lines[0];
        if (!top) { setState(EMPTY); return; }

        // Stockfish reports score from side-to-move perspective; convert to White's POV
        const sideToMoveWhite = (() => { try { return new Chess(fen).turn() === "w"; } catch { return true; } })();
        const evalCp = sideToMoveWhite ? top.eval : -top.eval;
        const mate = top.mate === null ? null : (sideToMoveWhite ? top.mate : -top.mate);

        const bestUci = top.pv?.[0] ?? null;
        let bestSan: string | null = null;
        if (bestUci && bestUci.length >= 4) {
          try {
            const c = new Chess(fen);
            const m = c.move({ from: bestUci.slice(0, 2), to: bestUci.slice(2, 4), promotion: bestUci[4] as any });
            bestSan = m?.san ?? null;
          } catch { /* ignore */ }
        }
        setState({ evalCp, mate, bestMoveUci: bestUci, bestMoveSan: bestSan, depth: top.depth, loading: false });
      } catch {
        if (!cancelled) setState(EMPTY);
      }
    })();

    return () => { cancelled = true; };
  }, [fen, enabled, depth]);

  return state;
}
