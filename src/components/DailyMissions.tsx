import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Swords,
  Trophy,
  Bot,
  BookOpen,
  Flame,
  Target,
  Gift,
  Loader2,
} from "lucide-react";
import { forwardRef, useState } from "react";
import { useDailyMissions, type MissionWithProgress } from "@/hooks/use-daily-missions";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  swords: Swords,
  trophy: Trophy,
  bot: Bot,
  "book-open": BookOpen,
  flame: Flame,
  target: Target,
};

interface MissionRowProps {
  mission: MissionWithProgress;
  onClaim: (key: string) => void;
  busy: boolean;
}

const MissionRow = forwardRef<HTMLDivElement, MissionRowProps>(function MissionRow(
  { mission, onClaim, busy },
  ref,
) {
  const Icon = ICONS[mission.icon] ?? Target;
  const claimable = mission.completed && !mission.claimed;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
        mission.claimed
          ? "border-primary/40 bg-primary/10"
          : claimable
          ? "border-primary/60 bg-primary/15 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          : "border-border/40 bg-muted/20 hover:border-primary/30"
      }`}
    >
      {mission.claimed ? (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      ) : claimable ? (
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="shrink-0"
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </motion.div>
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary/80 shrink-0" />
          <span
            className={`text-sm font-medium truncate ${
              mission.claimed ? "text-primary/70 line-through" : "text-foreground"
            }`}
          >
            {mission.title}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          {mission.description}
        </p>
        {!mission.claimed && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mission.percent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary/70 to-primary"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs font-bold text-primary">+{mission.xp_reward} XP</span>
        {claimable && (
          <button
            onClick={() => onClaim(mission.key)}
            disabled={busy}
            className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Claim"}
          </button>
        )}
        {!mission.claimed && !claimable && (
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {mission.current_value}/{mission.target_value}
          </span>
        )}
      </div>
    </motion.div>
  );
});

interface DailyMissionsProps {
  /** When true, render compact widget (≤3 visible). Default false = full list. */
  compact?: boolean;
}

export default function DailyMissions({ compact = false }: DailyMissionsProps) {
  const { user } = useAuth();
  const { missions, loading, claimMission, completedCount, totalCount, claimableXp } =
    useDailyMissions();
  const [claiming, setClaiming] = useState<string | null>(null);

  const handleClaim = async (key: string) => {
    setClaiming(key);
    const ok = await claimMission(key);
    setClaiming(null);
    if (ok) {
      const m = missions.find((x) => x.key === key);
      toast.success(`+${m?.xp_reward ?? 0} XP earned!`, {
        description: m?.title,
        icon: "🏆",
      });
    } else {
      toast.error("Failed to claim");
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 backdrop-blur-sm p-5">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-primary" /> Daily Missions
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Sign in to unlock daily missions and rewards.
        </p>
        <Link
          to="/login"
          className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const visible = compact ? missions.slice(0, 3) : missions;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 backdrop-blur-sm p-5 relative overflow-hidden">
      {claimableXp > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_60%)]"
        />
      )}

      <div className="flex items-center justify-between mb-4 relative">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Daily Missions
        </h2>
        <div className="flex items-center gap-2">
          {claimableXp > 0 && (
            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary"
            >
              <Gift className="h-3 w-3" /> +{claimableXp} XP
            </motion.span>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
        </div>
      ) : (
        <div className="space-y-2 relative">
          <AnimatePresence>
            {visible.map((m) => (
              <MissionRow
                key={m.key}
                mission={m}
                onClaim={handleClaim}
                busy={claiming === m.key}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {compact && missions.length > 3 && (
        <Link
          to="/missions"
          className="mt-3 block text-center text-xs font-semibold text-primary hover:text-primary/80 transition"
        >
          View all missions →
        </Link>
      )}
    </div>
  );
}
