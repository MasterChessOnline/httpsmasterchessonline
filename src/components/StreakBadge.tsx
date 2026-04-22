import { Flame, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface StreakBadgeProps {
  streak: number;
  best?: number;
  size?: "sm" | "md" | "lg";
  showBest?: boolean;
}

/**
 * Visual indicator of a player's current win streak.
 * Hides when streak < 2. Color/intensity scales with streak length.
 */
export default function StreakBadge({ streak, best, size = "md", showBest = false }: StreakBadgeProps) {
  if (streak < 2) {
    if (showBest && best && best >= 2) {
      // Show grayed-out best record
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          <Flame className="h-3 w-3 opacity-60" />
          Best {best}
        </span>
      );
    }
    return null;
  }

  let tier: "warm" | "hot" | "fire" | "legendary" = "warm";
  if (streak >= 20) tier = "legendary";
  else if (streak >= 10) tier = "fire";
  else if (streak >= 5) tier = "hot";

  const styles: Record<typeof tier, { bg: string; border: string; text: string; Icon: typeof Flame }> = {
    warm:      { bg: "bg-amber-500/15",   border: "border-amber-500/50",   text: "text-amber-300",   Icon: Flame },
    hot:       { bg: "bg-orange-500/20",  border: "border-orange-500/60",  text: "text-orange-300",  Icon: Flame },
    fire:      { bg: "bg-rose-500/20",    border: "border-rose-500/70",    text: "text-rose-200",    Icon: Zap },
    legendary: { bg: "bg-fuchsia-500/25", border: "border-fuchsia-400/80", text: "text-fuchsia-200", Icon: Crown },
  };
  const s = styles[tier];

  const sizeCls =
    size === "lg" ? "text-sm px-3 py-1.5 gap-1.5" :
    size === "sm" ? "text-[10px] px-2 py-0.5 gap-1" :
    "text-xs px-2.5 py-1 gap-1";
  const iconSize = size === "lg" ? "h-4 w-4" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className={`inline-flex items-center rounded-full border font-bold tabular-nums ${sizeCls} ${s.bg} ${s.border} ${s.text}`}
      style={tier === "legendary" || tier === "fire"
        ? { boxShadow: `0 0 14px hsl(var(--primary) / 0.25)` }
        : undefined}
    >
      <s.Icon className={iconSize} />
      <span>{streak} streak</span>
    </motion.span>
  );
}
