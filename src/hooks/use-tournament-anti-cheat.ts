import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type SignalType =
  | "tab_switch"
  | "fast_moves"
  | "perfect_accuracy"
  | "engine_match"
  | "manual";

interface Options {
  tournamentId: string | null | undefined;
  gameId?: string | null;
  enabled?: boolean;
}

/**
 * Reports anti-cheat signals to the backend during a tournament game.
 * - Auto-detects tab switches (visibility hidden) and reports them.
 * - Exposes `report()` for manual signals (engine match, fast moves, etc.).
 * - Strict-mode tournaments will auto-remove players above the severity threshold.
 */
export function useTournamentAntiCheat({
  tournamentId,
  gameId,
  enabled = true,
}: Options) {
  const lastTabSwitchRef = useRef<number>(0);

  const report = async (
    signal_type: SignalType,
    severity?: "low" | "medium" | "high" | "critical",
    details?: Record<string, unknown>,
  ) => {
    if (!tournamentId) return;
    try {
      await supabase.functions.invoke("tournament-anti-cheat", {
        body: {
          tournament_id: tournamentId,
          game_id: gameId ?? null,
          signal_type,
          severity,
          details,
        },
      });
    } catch {
      // Silently ignore — anti-cheat must never break gameplay
    }
  };

  // Tab-switch detection (throttled to 1 report / 5 s)
  useEffect(() => {
    if (!enabled || !tournamentId) return;

    const handler = () => {
      if (document.visibilityState !== "hidden") return;
      const now = Date.now();
      if (now - lastTabSwitchRef.current < 5000) return;
      lastTabSwitchRef.current = now;
      void report("tab_switch", "low", { at: new Date().toISOString() });
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tournamentId, gameId]);

  return { report };
}
