import { motion, AnimatePresence } from "framer-motion";
import { Award, Crown, Flame, Shield, Sword, TrendingUp, Zap, X } from "lucide-react";
import { TIER_COLORS, type BadgeRow } from "@/lib/progression";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  zap: Zap,
  crown: Crown,
  sword: Sword,
  shield: Shield,
  award: Award,
  "trending-up": TrendingUp,
};

interface BadgeUnlockToastProps {
  badges: BadgeRow[];
  onDismiss: () => void;
}

/** Stacked celebratory cards shown when one or more badges unlock after a game. */
export default function BadgeUnlockToast({ badges, onDismiss }: BadgeUnlockToastProps) {
  if (badges.length === 0) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="badge-unlock"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-card p-4 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.5)] relative"
      >
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted/50 transition"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            🎉 {badges.length === 1 ? "Badge Unlocked" : `${badges.length} Badges Unlocked`}
          </p>
        </div>
        <div className="space-y-2">
          {badges.map((badge, i) => {
            const tier = TIER_COLORS[badge.tier] ?? TIER_COLORS.bronze;
            const Icon = ICON_MAP[badge.icon] ?? Award;
            return (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.1 }}
                className={`flex items-center gap-3 rounded-xl border p-3 ${tier.bg} ${tier.border}`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-full border ${tier.border} ${tier.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${tier.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-foreground leading-tight">{badge.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug break-words">{badge.description}</p>
                </div>
                <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider ${tier.text}`}>
                  {badge.tier}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
