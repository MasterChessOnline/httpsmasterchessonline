import { Flame, Snowflake } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDailyStreak } from "@/hooks/use-daily-streak";

/**
 * Animated burning-fire streak indicator for the navbar.
 * - Active streak: flickering orange/gold flame.
 * - Missed 1 day with freeze available: frozen blue snowflake (streak preserved).
 * - Missed 2+ days: hidden (resets to 0 on next activity).
 */
export default function StreakIndicator() {
  const { data, loading } = useDailyStreak();

  if (loading || !data || data.current_streak <= 0) return null;

  // Detect "frozen" state — last activity was yesterday OR freeze was just used today.
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const isFrozen =
    data.freeze_used_date === today ||
    (data.last_active_date !== today &&
      data.last_active_date === yesterday &&
      data.freeze_available === false);

  const big = data.current_streak >= 7;
  const legendary = data.current_streak >= 30;

  if (isFrozen) {
    return (
      <Link
        to="/missions"
        title={`Streak frozen at ${data.current_streak} days — play today to keep it alive!`}
        className="hidden sm:flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-gradient-to-br from-sky-500/15 to-card/50 backdrop-blur-sm px-2.5 py-1.5 hover:border-sky-300/70 transition-all duration-300"
      >
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="inline-flex"
        >
          <Snowflake className="h-4 w-4 text-sky-300 drop-shadow-[0_0_6px_rgb(125_211_252/0.7)]" />
        </motion.span>
        <span className="font-display text-xs font-bold text-sky-200 tabular-nums">
          {data.current_streak}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/missions"
      title={`Daily streak: ${data.current_streak} day${data.current_streak === 1 ? "" : "s"} in a row${data.freeze_available ? " · 1 freeze available" : ""}`}
      className="hidden sm:flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-card/50 backdrop-blur-sm px-2.5 py-1.5 hover:border-orange-400/70 transition-all duration-300"
      style={{
        boxShadow: legendary
          ? "0 0 18px rgb(251 146 60 / 0.55), inset 0 0 12px rgb(251 191 36 / 0.25)"
          : big
          ? "0 0 12px rgb(251 146 60 / 0.4)"
          : undefined,
      }}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        {/* Outer glow pulse */}
        <motion.span
          aria-hidden
          animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.4, 0.1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-orange-500/50 blur-md"
        />
        {/* Flickering flame */}
        <motion.span
          animate={{
            scale: [1, 1.18, 0.95, 1.12, 1],
            rotate: [0, -7, 6, -4, 0],
            y: [0, -1, 0, -1.5, 0],
          }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
          className="relative inline-flex"
        >
          <Flame
            className="h-4 w-4 fill-orange-400 text-orange-500 drop-shadow-[0_0_6px_rgb(251_146_60/0.95)]"
          />
        </motion.span>
        {/* Inner bright core flicker */}
        <motion.span
          aria-hidden
          animate={{ opacity: [0.9, 0.4, 1, 0.5, 0.9] }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
          className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-yellow-200 blur-[1px]"
        />
      </span>
      <span className="font-display text-xs font-bold text-orange-100 tabular-nums">
        {data.current_streak}
      </span>
    </Link>
  );
}
