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

const previewMissions: MissionWithProgress[] = [
  {
    id: "preview-easy",
    key: "preview-easy",
    title: "Warm Up",
    description: "Play 1 online game today.",
    icon: "swords",
    mission_type: "games_played",
    target_value: 1,
    xp_reward: 25,
    sort_order: 1,
    difficulty: "easy",
    current_value: 0,
    completed: false,
    claimed: false,
    percent: 0,
  },
  {
    id: "preview-medium",
    key: "preview-medium",
    title: "Player of the Day",
    description: "Play 3 online games today.",
    icon: "swords",
    mission_type: "games_played",
    target_value: 3,
    xp_reward: 60,
    sort_order: 2,
    difficulty: "medium",
    current_value: 0,
    completed: false,
    claimed: false,
    percent: 0,
  },
  {
    id: "preview-hard",
    key: "preview-hard",
    title: "Triple Threat",
    description: "Win 3 games today.",
    icon: "trophy",
    mission_type: "games_won",
    target_value: 3,
    xp_reward: 110,
    sort_order: 3,
    difficulty: "hard",
    current_value: 0,
    completed: false,
    claimed: false,
    percent: 0,
  },
  {
    id: "preview-elite",
    key: "preview-elite",
    title: "Conqueror",
    description: "Win 5 games today.",
    icon: "trophy",
    mission_type: "games_won",
    target_value: 5,
    xp_reward: 200,
    sort_order: 4,
    difficulty: "elite",
    current_value: 0,
    completed: false,
    claimed: false,
    percent: 0,
  },
];

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
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              mission.difficulty === "easy"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : mission.difficulty === "medium"
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                : mission.difficulty === "hard"
                ? "bg-orange-500/15 text-orange-300 border border-orange-500/30"
                : "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30"
            }`}
          >
            {mission.difficulty}
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
  const {
    missions,
    loading,
    claimMission,
    completedCount,
    totalCount,
    claimableXp,
    xpClaimedToday,
  } = useDailyMissions();
  const [claiming, setClaiming] = useState<string | null>(null);
  // Hide already-claimed missions — once claimed it's gone for today.
  const liveMissions = missions.filter((m) => !m.claimed);
  const visible = compact
    ? (user ? liveMissions : previewMissions).slice(0, 4)
    : (user ? liveMissions : previewMissions);

  const handleClaim = async (key: string) => {
    setClaiming(key);
    const res = await claimMission(key);
    setClaiming(null);
    if (res.ok) {
      const m = missions.find((x) => x.key === key);
      toast.success(`+${res.xp ?? m?.xp_reward ?? 0} XP earned!`, {
        description: `${m?.title ?? "Mission"} — Total ${res.total ?? 0} XP`,
        icon: "🏆",
      });
      (res.newBadges ?? []).forEach((b) =>
        toast.success(`New achievement unlocked!`, {
          description: b,
          icon: "🏅",
        }),
      );
    } else {
      toast.error("Failed to claim");
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 backdrop-blur-sm p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Daily Missions
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">0/4</span>
        </div>
        <div className="space-y-2 relative mb-4">
          {visible.map((m) => (
            <MissionRow key={m.key} mission={m} onClaim={() => undefined} busy={false} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-3">Sign in to save progress and claim XP rewards.</p>
        <Link
          to="/login"
          className="inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 backdrop-blur-sm p-5 relative overflow-hidden">
      {claimableXp > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_60%)]"
        />
      )}

      <div className="flex items-center justify-between mb-2 relative">
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

      <p className="mb-3 text-[11px] text-muted-foreground">
        <span className="text-primary font-semibold">+{xpClaimedToday} XP</span> claimed today · resets every 24 h
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-6 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-primary" />
          <p className="text-sm font-semibold text-foreground">All missions claimed!</p>
          <p className="text-[11px] text-muted-foreground">New rotation tomorrow at 00:00 UTC.</p>
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

      {compact && liveMissions.length > 4 && (
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
