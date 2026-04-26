import { motion } from "framer-motion";
import { Flame, Lock, Check, Gift } from "lucide-react";
import {
  STREAK_REWARDS,
  TIER_STYLES,
  getNextReward,
  getUnlockedReward,
  type StreakReward,
} from "@/lib/streak-rewards";

interface Props {
  currentStreak: number;
}

/**
 * Visual rewards ladder for the daily-streak system.
 * Shows every milestone, marks unlocked ones with a checkmark, the next
 * one with a progress bar, and the rest as locked.
 */
export default function StreakRewardsCard({ currentStreak }: Props) {
  const unlocked = getUnlockedReward(currentStreak);
  const next = getNextReward(currentStreak);

  const progressTowardNext = next
    ? Math.min(
        100,
        Math.round((currentStreak / next.days) * 100),
      )
    : 100;

  return (
    <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-2 border border-primary/30">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Streak Rewards
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Keep your streak alive to unlock more.
            </p>
          </div>
        </div>
        {unlocked && (
          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${TIER_STYLES[unlocked.tier].text} ${TIER_STYLES[unlocked.tier].bg} ${TIER_STYLES[unlocked.tier].border}`}
          >
            <span>{unlocked.icon}</span>
            <span>{unlocked.title}</span>
          </div>
        )}
      </div>

      {/* Next-reward progress */}
      {next ? (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{next.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  Next: {next.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {currentStreak} / {next.days} days · +{next.xp} XP
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-primary tabular-nums shrink-0">
              {progressTowardNext}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressTowardNext}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary/70 to-primary"
            />
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-fuchsia-300/40 bg-fuchsia-300/10 p-3 text-center">
          <p className="text-sm font-bold text-fuchsia-200">
            🐉 All rewards unlocked. You are a legend.
          </p>
        </div>
      )}

      {/* Ladder */}
      <ul className="space-y-1.5">
        {STREAK_REWARDS.map((r) => {
          const isUnlocked = currentStreak >= r.days;
          const isNext = next?.days === r.days;
          const styles = TIER_STYLES[r.tier];
          return (
            <RewardRow
              key={r.days}
              reward={r}
              isUnlocked={isUnlocked}
              isNext={isNext}
              styles={styles}
            />
          );
        })}
      </ul>
    </div>
  );
}

function RewardRow({
  reward,
  isUnlocked,
  isNext,
  styles,
}: {
  reward: StreakReward;
  isUnlocked: boolean;
  isNext: boolean;
  styles: (typeof TIER_STYLES)[StreakReward["tier"]];
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-all ${
        isUnlocked
          ? `${styles.border} ${styles.bg} ${styles.glow}`
          : isNext
            ? "border-primary/30 bg-primary/5"
            : "border-border/30 bg-muted/10"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg shrink-0 ${
          isUnlocked
            ? `${styles.bg} ${styles.border} border`
            : "bg-muted/30 text-muted-foreground/50"
        }`}
      >
        {isUnlocked ? reward.icon : <Lock className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-bold leading-tight ${
              isUnlocked ? styles.text : "text-muted-foreground"
            }`}
          >
            {reward.title}
          </p>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {reward.days}d
          </span>
        </div>
        <p
          className={`text-[11px] truncate ${isUnlocked ? "text-foreground/80" : "text-muted-foreground/70"}`}
        >
          {reward.description}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span
          className={`text-xs font-bold tabular-nums ${isUnlocked ? "text-primary" : "text-muted-foreground/60"}`}
        >
          +{reward.xp}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">XP</span>
      </div>
      {isUnlocked && (
        <div className="ml-1 rounded-full bg-primary/20 p-1">
          <Check className="h-3 w-3 text-primary" />
        </div>
      )}
      {!isUnlocked && isNext && (
        <Flame className="h-4 w-4 text-primary animate-pulse" />
      )}
    </li>
  );
}
