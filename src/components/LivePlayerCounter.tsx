// Live "currently playing" counter — REAL data from active games table.
// Polls every 30s. Falls back gracefully if Supabase is offline.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function LivePlayerCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { count: c } = await (supabase as any)
          .from("online_games")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", since)
          .eq("status", "active");
        if (!cancelled) setCount(typeof c === "number" ? Math.max(c, 0) : 0);
      } catch {
        if (!cancelled) setCount(0);
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Hide entirely when we have no data or zero players — empty rooms hurt conversion.
  if (count === null || count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-emerald-400">{count.toLocaleString()} playing now</span>
    </motion.div>
  );
}
