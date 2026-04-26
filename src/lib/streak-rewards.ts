// Daily-streak reward tiers. Pure data + helpers — no IO.
// Each tier represents a streak milestone the player can reach.

export interface StreakReward {
  days: number;
  title: string;
  description: string;
  xp: number;
  icon: string; // emoji
  tier: "bronze" | "silver" | "gold" | "diamond" | "legendary";
}

export const STREAK_REWARDS: StreakReward[] = [
  { days: 3,   title: "Spark",       description: "First flame — keep it lit.",            xp: 50,   icon: "🔥", tier: "bronze" },
  { days: 7,   title: "Week Warrior", description: "A full week of dedication.",            xp: 150,  icon: "⚔️", tier: "bronze" },
  { days: 14,  title: "Fortnight",    description: "Two weeks strong — habit forming.",     xp: 300,  icon: "🛡️", tier: "silver" },
  { days: 30,  title: "Iron Will",    description: "A whole month of daily chess.",         xp: 750,  icon: "🏅", tier: "silver" },
  { days: 60,  title: "Relentless",   description: "Two months — true commitment.",         xp: 1500, icon: "💎", tier: "gold" },
  { days: 100, title: "Centurion",    description: "100 days. Few make it this far.",       xp: 3000, icon: "👑", tier: "gold" },
  { days: 200, title: "Unstoppable",  description: "200 days of pure discipline.",          xp: 6000, icon: "⚡", tier: "diamond" },
  { days: 365, title: "Year of Fire", description: "A full year. You are chess.",           xp: 15000, icon: "🐉", tier: "legendary" },
];

/** Returns the highest reward tier the user has already unlocked, or null. */
export function getUnlockedReward(currentStreak: number): StreakReward | null {
  let best: StreakReward | null = null;
  for (const r of STREAK_REWARDS) {
    if (currentStreak >= r.days) best = r;
  }
  return best;
}

/** Returns the next reward the user is working toward, or null if all unlocked. */
export function getNextReward(currentStreak: number): StreakReward | null {
  return STREAK_REWARDS.find((r) => currentStreak < r.days) ?? null;
}

export const TIER_STYLES: Record<
  StreakReward["tier"],
  { text: string; bg: string; border: string; glow: string }
> = {
  bronze:    { text: "text-amber-700",   bg: "bg-amber-700/10",   border: "border-amber-700/40",   glow: "shadow-[0_0_20px_hsl(30_60%_40%/0.25)]" },
  silver:    { text: "text-slate-300",   bg: "bg-slate-300/10",   border: "border-slate-300/40",   glow: "shadow-[0_0_20px_hsl(0_0%_75%/0.25)]" },
  gold:      { text: "text-amber-400",   bg: "bg-amber-400/15",   border: "border-amber-400/50",   glow: "shadow-[0_0_24px_hsl(43_90%_55%/0.35)]" },
  diamond:   { text: "text-cyan-300",    bg: "bg-cyan-300/15",    border: "border-cyan-300/50",    glow: "shadow-[0_0_24px_hsl(190_85%_60%/0.35)]" },
  legendary: { text: "text-fuchsia-300", bg: "bg-fuchsia-300/15", border: "border-fuchsia-300/60", glow: "shadow-[0_0_28px_hsl(300_85%_65%/0.4)]" },
};
