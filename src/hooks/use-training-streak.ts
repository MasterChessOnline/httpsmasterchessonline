// Persistent training streak counter for the puzzles flow.
// `current` increments on every fully-solved puzzle, resets on a wrong move
// or timeout. `best` is the all-time high stored in localStorage.

import { useEffect, useState, useCallback } from "react";

const CUR_KEY = "mc:training:streak";
const BEST_KEY = "mc:training:bestStreak";

function readNum(key: string, fallback = 0): number {
  try {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) || fallback : fallback;
  } catch { return fallback; }
}

export function useTrainingStreak() {
  const [current, setCurrent] = useState<number>(() => readNum(CUR_KEY, 0));
  const [best, setBest] = useState<number>(() => readNum(BEST_KEY, 0));

  useEffect(() => {
    try { localStorage.setItem(CUR_KEY, String(current)); } catch {}
  }, [current]);
  useEffect(() => {
    try { localStorage.setItem(BEST_KEY, String(best)); } catch {}
  }, [best]);

  const increment = useCallback(() => {
    setCurrent((c) => {
      const next = c + 1;
      setBest((b) => (next > b ? next : b));
      return next;
    });
  }, []);
  const reset = useCallback(() => setCurrent(0), []);

  return { current, best, increment, reset };
}
