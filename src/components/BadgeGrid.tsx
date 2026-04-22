import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Crown, Flame, Shield, Sword, TrendingUp, Zap, Lock } from "lucide-react";
import {
  fetchBadgeCatalog,
  fetchEarnedBadges,
  TIER_COLORS,
  type BadgeRow,
  type EarnedBadge,
} from "@/lib/progression";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  zap: Zap,
  crown: Crown,
  sword: Sword,
  shield: Shield,
  award: Award,
  "trending-up": TrendingUp,
};

interface BadgeGridProps {
  userId: string;
  /** When true, show only earned badges; when false, show all (locked grayed). */
  earnedOnly?: boolean;
  emptyMessage?: string;
}

export default function BadgeGrid({
  userId,
  earnedOnly = false,
  emptyMessage = "No badges earned yet. Win some games to start your collection!",
}: BadgeGridProps) {
  const [catalog, setCatalog] = useState<BadgeRow[]>([]);
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchBadgeCatalog(), fetchEarnedBadges(userId)])
      .then(([cat, earn]) => {
        if (!alive) return;
        setCatalog(cat);
        setEarned(earn);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  const earnedSet = new Set(earned.map((e) => e.badge_key));
  const visible = earnedOnly ? catalog.filter((b) => earnedSet.has(b.key)) : catalog;

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/40 p-8 text-center">
        <Award className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {visible.map((badge, i) => {
        const isEarned = earnedSet.has(badge.key);
        const tier = TIER_COLORS[badge.tier] ?? TIER_COLORS.bronze;
        const Icon = ICON_MAP[badge.icon] ?? Award;
        return (
          <motion.div
            key={badge.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4) }}
            className={`relative rounded-xl border p-3 text-center transition-all ${
              isEarned
                ? `${tier.bg} ${tier.border} hover:scale-[1.03] cursor-default`
                : "border-border/30 bg-muted/20 opacity-60"
            }`}
            title={badge.description}
          >
            {!isEarned && (
              <div className="absolute top-1.5 right-1.5">
                <Lock className="h-3 w-3 text-muted-foreground/60" />
              </div>
            )}
            <div className={`mx-auto mb-2 w-10 h-10 rounded-full border flex items-center justify-center ${
              isEarned ? `${tier.border} ${tier.bg}` : "border-border/40 bg-background/40"
            }`}>
              <Icon className={`h-5 w-5 ${isEarned ? tier.text : "text-muted-foreground/50"}`} />
            </div>
            <p className={`text-xs font-bold leading-tight ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
              {badge.name}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug break-words">
              {badge.description}
            </p>
            <p className={`mt-1.5 inline-block text-[9px] uppercase tracking-wider font-bold ${
              isEarned ? tier.text : "text-muted-foreground/60"
            }`}>
              {badge.tier}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
