// Animated rating-change card shown after a game.
// Honors user settings: showRatingChange, showExpectedScore, ratingAnimation.

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getSetting } from "@/lib/user-settings";
import type { RatingCalcResult } from "@/lib/rating-system";

interface RatingChangeProps {
  result: RatingCalcResult;
  ratingType?: "online" | "bot";
}

export default function RatingChange({ result, ratingType = "online" }: RatingChangeProps) {
  const showChange = getSetting("showRatingChange", true);
  const showExpected = getSetting("showExpectedScore", true);
  const animate = getSetting("ratingAnimation", true);
  const [displayRating, setDisplayRating] = useState(result.oldRating);

  useEffect(() => {
    if (!animate) { setDisplayRating(result.newRating); return; }
    const start = result.oldRating;
    const end = result.newRating;
    const duration = 900;
    const startTime = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayRating(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result.oldRating, result.newRating, animate]);

  if (!showChange) return null;

  const positive = result.change > 0;
  const neutral = result.change === 0;
  const Icon = positive ? TrendingUp : neutral ? Minus : TrendingDown;
  const color = positive ? "text-emerald-400" : neutral ? "text-muted-foreground" : "text-rose-400";
  const bg = positive ? "bg-emerald-500/10 border-emerald-500/30" : neutral ? "bg-muted/30 border-border" : "bg-rose-500/10 border-rose-500/30";

  return (
    <AnimatePresence>
      <motion.div
        initial={animate ? { opacity: 0, y: 10, scale: 0.96 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <Card className={`p-5 border ${bg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {ratingType === "bot" ? "Bot Rating" : "Online Rating"}
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${color}`}>
              <Icon className="h-4 w-4" />
              {positive ? "+" : ""}{result.change}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold tabular-nums">{displayRating}</div>
            <div className="text-sm text-muted-foreground mb-1">
              from <span className="tabular-nums">{result.oldRating}</span>
            </div>
          </div>
          <div className={`mt-2 text-sm ${color}`}>{result.performanceLabel}</div>
          {showExpected && (
            <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
              <span>Expected score</span>
              <span className="tabular-nums">{(result.expected * 100).toFixed(0)}%</span>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
