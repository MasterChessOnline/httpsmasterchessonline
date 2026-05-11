import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";

interface Props {
  show: boolean;
  title: string;
  subtitle?: string;
  onDone?: () => void;
  durationMs?: number;
}

/**
 * Full-screen achievement overlay with confetti-style sparkle ring.
 * Auto-dismisses after `durationMs` (default 2200ms).
 */
export default function AchievementToast({ show, title, subtitle, onDone, durationMs = 2200 }: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), durationMs);
    return () => clearTimeout(t);
  }, [show, durationMs, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card to-card px-8 py-6 shadow-[0_20px_80px_-10px_hsl(var(--primary)/0.55)]"
            initial={{ scale: 0.7, y: -30, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 16 }}
          >
            {/* sparkle ring */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const x = Math.cos(angle) * 90;
              const y = Math.sin(angle) * 60;
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 text-primary"
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{ x, y, opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
                  transition={{ duration: 1.4, delay: i * 0.04, ease: "easeOut" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.span>
              );
            })}
            <div className="flex items-center gap-3 relative">
              <div className="rounded-xl bg-primary/20 border border-primary/40 p-3">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] font-semibold text-primary/80">
                  Achievement
                </div>
                <div className="font-display text-xl font-bold text-foreground">{title}</div>
                {subtitle && (
                  <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
