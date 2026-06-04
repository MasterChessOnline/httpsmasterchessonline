import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Stat = { online: number; gamesToday: number };

/**
 * Shows authentic live counts only. NO fake numbers, NO ghost activity.
 * If real data is unavailable or zero, the bar hides itself.
 */
export default function LiveSocialProof({ compact = false }: { compact?: boolean }) {
  const [stats, setStats] = useState<Stat | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const since = new Date(Date.now() - 3 * 60 * 1000).toISOString();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [{ count: activeGames }, { count: gamesToday }] = await Promise.all([
          supabase
            .from("online_games")
            .select("id", { count: "exact", head: true })
            .eq("status", "active")
            .gte("last_move_at", since),
          supabase
            .from("online_games")
            .select("id", { count: "exact", head: true })
            .gte("created_at", today.toISOString()),
        ]);
        if (!alive) return;
        // Players online ≈ active games × 2 (lower bound — real, not faked)
        setStats({ online: (activeGames ?? 0) * 2, gamesToday: gamesToday ?? 0 });
      } catch {
        // silent — hide bar
      }
    };
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setIdx((i) => i + 1), 4500);
    return () => window.clearInterval(id);
  }, []);

  if (!stats || (stats.online === 0 && stats.gamesToday === 0)) return null;

  const messages: string[] = [];
  if (stats.online > 0) messages.push(`${stats.online} player${stats.online === 1 ? "" : "s"} online now`);
  if (stats.gamesToday > 0) messages.push(`${stats.gamesToday} game${stats.gamesToday === 1 ? "" : "s"} played today`);
  if (messages.length === 0) return null;

  const current = messages[idx % messages.length];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur px-3 py-1.5 ${
        compact ? "text-[11px]" : "text-xs"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/70 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-muted-foreground"
        >
          <span className="text-foreground font-semibold">LIVE</span> · {current}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
