// Global overlay that listens for reward events and renders a celebration
// toast + plays the matching premium sound. Mount once at app root.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Sparkles, Trophy, Crown, Flame, Zap } from "lucide-react";
import { onReward, playRewardSound, type RewardPayload } from "@/lib/reward-fx";

interface ActiveToast extends RewardPayload {
  id: number;
}

const ICON: Record<RewardPayload["kind"], React.ElementType> = {
  coin: Coins,
  xp: Zap,
  level: Sparkles,
  rank: Crown,
  achievement: Trophy,
  streak: Flame,
};

const ACCENT: Record<RewardPayload["kind"], string> = {
  coin: "43 95% 60%",
  xp: "217 91% 65%",
  level: "271 91% 65%",
  rank: "43 95% 60%",
  achievement: "38 92% 50%",
  streak: "25 85% 55%",
};

export default function RewardFXLayer() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    return onReward((p) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { ...p, id }]);
      playRewardSound(p.kind, p.rare);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, p.rare ? 3800 : 2600);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] flex flex-col items-center justify-start pt-24 gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICON[t.kind];
          const c = ACCENT[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ y: -40, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="relative rounded-2xl border px-5 py-3 backdrop-blur-xl flex items-center gap-3 min-w-[260px] max-w-[420px]"
              style={{
                background: `linear-gradient(135deg, hsla(${c} / 0.22), hsl(220 15% 8% / 0.92))`,
                borderColor: `hsla(${c} / 0.55)`,
                boxShadow: `0 24px 60px -10px hsla(${c} / 0.5), inset 0 1px 0 hsla(${c} / 0.3)`,
              }}
            >
              {/* Sparkle ring for rare events */}
              {t.rare &&
                Array.from({ length: 10 }).map((_, i) => {
                  const angle = (i / 10) * Math.PI * 2;
                  return (
                    <motion.span
                      key={i}
                      className="absolute left-6 top-1/2 -translate-y-1/2"
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos(angle) * 50,
                        y: Math.sin(angle) * 28,
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                      }}
                      transition={{ duration: 1.4, delay: i * 0.03 }}
                    >
                      <Sparkles className="h-3 w-3" style={{ color: `hsl(${c})` }} />
                    </motion.span>
                  );
                })}

              <motion.div
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `hsla(${c} / 0.18)`,
                  border: `1px solid hsla(${c} / 0.5)`,
                  boxShadow: `0 0 24px -4px hsla(${c} / 0.65)`,
                }}
                animate={{ rotate: t.rare ? [0, -8, 8, 0] : 0, scale: [1, 1.08, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Icon className="h-5 w-5" style={{ color: `hsl(${c})` }} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] uppercase tracking-[0.22em] font-bold"
                  style={{ color: `hsl(${c})` }}
                >
                  {t.kind === "achievement" && t.rare ? "Rare Achievement" : t.kind}
                </div>
                <div className="font-display text-sm sm:text-base font-bold text-foreground leading-tight truncate">
                  {t.title}
                </div>
                {t.subtitle && (
                  <div className="text-[11px] text-muted-foreground truncate">{t.subtitle}</div>
                )}
              </div>

              {typeof t.amount === "number" && (
                <motion.div
                  className="font-display text-xl font-black shrink-0"
                  style={{ color: `hsl(${c})`, textShadow: `0 0 18px hsla(${c} / 0.7)` }}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  +{t.amount}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
