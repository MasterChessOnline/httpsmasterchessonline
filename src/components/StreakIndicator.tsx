import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDailyStreak } from "@/hooks/use-daily-streak";

/**
 * Compact streak indicator for the navbar.
 * Shows a flame + current streak count. Hidden when user has 0 streak.
 */
export default function StreakIndicator() {
  const { data, loading } = useDailyStreak();

  if (loading || !data || data.current_streak <= 0) return null;

  const big = data.current_streak >= 7;

  return (
    <Link
      to="/missions"
      title={`Streak: ${data.current_streak} dana zaredom`}
      className="hidden sm:flex items-center gap-1 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-card/50 backdrop-blur-sm px-2.5 py-1.5 hover:border-primary/50 hover:from-primary/25 transition-all duration-300"
    >
      <motion.span
        animate={
          big
            ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }
            : { scale: [1, 1.08, 1] }
        }
        transition={{ repeat: Infinity, duration: big ? 1.6 : 2.2 }}
        className="inline-flex"
      >
        <Flame className="h-4 w-4 text-primary drop-shadow-[0_0_4px_hsl(43_90%_55%/0.6)]" />
      </motion.span>
      <span className="font-display text-xs font-bold text-primary tabular-nums">
        {data.current_streak}
      </span>
    </Link>
  );
}
