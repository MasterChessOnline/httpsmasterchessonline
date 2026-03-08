import { useEffect, useRef, useState, useCallback } from "react";

export interface EngineLine {
  depth: number;
  score: number; // in centipawns from white's perspective
  mate: number | null;
  pv: string; // principal variation (space-separated UCI moves)
  pvSan?: string[];
}

interface UseStockfishOptions {
  fen: string;
  enabled: boolean;
  depth: number; // max depth
  multiPv: number; // number of lines (e.g. 3)
}

export function useStockfish({ fen, enabled, depth, multiPv }: UseStockfishOptions) {
  const workerRef = useRef<Worker | null>(null);
  const [lines, setLines] = useState<EngineLine[]>([]);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentDepth, setCurrentDepth] = useState(0);

  // Initialize engine
  useEffect(() => {
    const worker = new Worker("/stockfish.js");
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const msg = e.data as string;
      if (msg === "uciok") {
        worker.postMessage(`setoption name MultiPV value ${multiPv}`);
        worker.postMessage("isready");
      }
      if (msg === "readyok") {
        setIsReady(true);
      }
    };

    worker.postMessage("uci");

    return () => {
      worker.postMessage("quit");
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Update MultiPV when it changes
  useEffect(() => {
    if (!workerRef.current || !isReady) return;
    workerRef.current.postMessage("stop");
    workerRef.current.postMessage(`setoption name MultiPV value ${multiPv}`);
  }, [multiPv, isReady]);

  // Analyze position
  useEffect(() => {
    if (!workerRef.current || !isReady || !enabled) return;

    const worker = workerRef.current;
    const collected = new Map<number, EngineLine>();

    setBestMove(null);
    setLines([]);
    setCurrentDepth(0);
    setIsSearching(true);

    const handler = (e: MessageEvent) => {
      const msg = e.data as string;

      if (msg.startsWith("info") && msg.includes(" pv ")) {
        const parsed = parseInfoLine(msg);
        if (parsed) {
          collected.set(parsed.pvIndex, parsed.line);
          setCurrentDepth(parsed.line.depth);
          // Build sorted array
          const arr: EngineLine[] = [];
          for (let i = 1; i <= multiPv; i++) {
            const l = collected.get(i);
            if (l) arr.push(l);
          }
          setLines(arr);
        }
      }

      if (msg.startsWith("bestmove")) {
        const parts = msg.split(" ");
        setBestMove(parts[1] || null);
        setIsSearching(false);
      }
    };

    worker.addEventListener("message", handler);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);

    return () => {
      worker.removeEventListener("message", handler);
      worker.postMessage("stop");
    };
  }, [fen, enabled, depth, isReady, multiPv]);

  const stop = useCallback(() => {
    workerRef.current?.postMessage("stop");
    setIsSearching(false);
  }, []);

  return { lines, bestMove, isReady, isSearching, currentDepth, stop };
}

function parseInfoLine(msg: string): { pvIndex: number; line: EngineLine } | null {
  const depthMatch = msg.match(/\bdepth (\d+)/);
  const multipvMatch = msg.match(/\bmultipv (\d+)/);
  const scoreMatch = msg.match(/\bscore (cp|mate) (-?\d+)/);
  const pvMatch = msg.match(/\bpv (.+)$/);

  if (!depthMatch || !scoreMatch || !pvMatch) return null;

  const depthVal = parseInt(depthMatch[1]);
  const pvIndex = multipvMatch ? parseInt(multipvMatch[1]) : 1;
  const scoreType = scoreMatch[1];
  const scoreVal = parseInt(scoreMatch[2]);

  return {
    pvIndex,
    line: {
      depth: depthVal,
      score: scoreType === "cp" ? scoreVal : 0,
      mate: scoreType === "mate" ? scoreVal : null,
      pv: pvMatch[1].trim(),
    },
  };
}
