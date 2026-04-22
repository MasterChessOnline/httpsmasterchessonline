// Progression layer: streaks, rating protection, badges, seasons.
// Built on top of rating-system.ts. Pure functions + supabase IO.

import { supabase } from "@/integrations/supabase/client";
import type { GameResult, RatingType } from "./rating-system";

// ----------------------------------------------------------------
// RATING PROTECTION
// ----------------------------------------------------------------
// On a losing streak (3+ losses in a row), reduce loss magnitude
// progressively to soften extreme drops. Caps protection at 50%.
export function applyRatingProtection(
  rawChange: number,
  lossStreak: number,
  result: GameResult,
): number {
  if (result !== "loss" || rawChange >= 0) return rawChange;
  if (lossStreak < 3) return rawChange;
  // 3 losses → 15% reduction, 5 → 30%, 7+ → 50%
  const reductionPct = Math.min(0.5, (lossStreak - 2) * 0.075 + 0.075);
  const protectedChange = Math.round(rawChange * (1 - reductionPct));
  // Always lose at least 1 point so result remains meaningful
  return Math.min(-1, protectedChange);
}

// ----------------------------------------------------------------
// WIN STREAK BONUS (applied on top of normal Elo)
// ----------------------------------------------------------------
export function getStreakBonus(currentStreak: number, result: GameResult): number {
  if (result !== "win") return 0;
  // Milestones: streak of 3 = +1, 5 = +2, 10 = +3, 20 = +5
  if (currentStreak >= 20) return 5;
  if (currentStreak >= 10) return 3;
  if (currentStreak >= 5) return 2;
  if (currentStreak >= 3) return 1;
  return 0;
}

// ----------------------------------------------------------------
// STREAK STATE — read & write
// ----------------------------------------------------------------
export interface StreakState {
  current_streak: number;
  best_streak: number;
  loss_streak: number;
  last_result: GameResult | null;
}

export async function getStreakState(
  userId: string,
  ratingType: RatingType,
): Promise<StreakState> {
  const { data } = await supabase
    .from("win_streaks" as any)
    .select("current_streak, best_streak, loss_streak, last_result")
    .eq("user_id", userId)
    .eq("rating_type", ratingType)
    .maybeSingle();
  if (!data) return { current_streak: 0, best_streak: 0, loss_streak: 0, last_result: null };
  return data as unknown as StreakState;
}

export async function updateStreakState(
  userId: string,
  ratingType: RatingType,
  result: GameResult,
): Promise<StreakState> {
  const prev = await getStreakState(userId, ratingType);
  let current = prev.current_streak;
  let lossStreak = prev.loss_streak;
  if (result === "win") {
    current = current + 1;
    lossStreak = 0;
  } else if (result === "loss") {
    current = 0;
    lossStreak = lossStreak + 1;
  } else {
    current = 0;
    // draws don't extend the loss streak
  }
  const best = Math.max(prev.best_streak, current);
  const next: StreakState = {
    current_streak: current,
    best_streak: best,
    loss_streak: lossStreak,
    last_result: result,
  };

  // Upsert
  await supabase
    .from("win_streaks" as any)
    .upsert(
      {
        user_id: userId,
        rating_type: ratingType,
        current_streak: next.current_streak,
        best_streak: next.best_streak,
        loss_streak: next.loss_streak,
        last_result: next.last_result,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,rating_type" },
    );

  return next;
}

// ----------------------------------------------------------------
// BADGES
// ----------------------------------------------------------------
export interface BadgeRow {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "milestone" | "skill" | "prestige" | string;
  tier: "bronze" | "silver" | "gold" | "diamond" | "legendary" | string;
  requirement_type: string;
  requirement_value: number;
}

export interface EarnedBadge {
  badge_key: string;
  earned_at: string;
}

export async function fetchBadgeCatalog(): Promise<BadgeRow[]> {
  const { data } = await supabase
    .from("badges_catalog" as any)
    .select("*")
    .order("requirement_value", { ascending: true });
  return (data as unknown as BadgeRow[]) ?? [];
}

export async function fetchEarnedBadges(userId: string): Promise<EarnedBadge[]> {
  const { data } = await supabase
    .from("player_badges" as any)
    .select("badge_key, earned_at")
    .eq("user_id", userId);
  return (data as unknown as EarnedBadge[]) ?? [];
}

/**
 * Evaluate which badges should be newly earned given a finished game,
 * insert them, and return the newly-earned badge rows for UI display.
 */
export async function evaluateBadges(opts: {
  userId: string;
  rating: number;
  gamesPlayed: number;
  result: GameResult;
  playerRating: number;
  opponentRating: number;
  currentStreak: number;
}): Promise<BadgeRow[]> {
  const [catalog, earned] = await Promise.all([
    fetchBadgeCatalog(),
    fetchEarnedBadges(opts.userId),
  ]);
  const earnedKeys = new Set(earned.map((e) => e.badge_key));
  const ratingDiff = opts.opponentRating - opts.playerRating;

  const newlyEarned: BadgeRow[] = [];

  for (const badge of catalog) {
    if (earnedKeys.has(badge.key)) continue;
    let qualifies = false;
    switch (badge.requirement_type) {
      case "win_streak":
        qualifies = opts.result === "win" && opts.currentStreak >= badge.requirement_value;
        break;
      case "games_played":
        qualifies = opts.gamesPlayed >= badge.requirement_value;
        break;
      case "giant_slayer":
        qualifies = opts.result === "win" && ratingDiff >= badge.requirement_value;
        break;
      case "win_rate": // we use this as "rating reached" for simplicity
        qualifies = opts.rating >= badge.requirement_value;
        break;
    }
    if (qualifies) newlyEarned.push(badge);
  }

  if (newlyEarned.length > 0) {
    const rows = newlyEarned.map((b) => ({
      user_id: opts.userId,
      badge_key: b.key,
      context: {
        rating: opts.rating,
        opponent_rating: opts.opponentRating,
        streak: opts.currentStreak,
      },
    }));
    await supabase.from("player_badges" as any).insert(rows);
  }
  return newlyEarned;
}

// ----------------------------------------------------------------
// SEASONS
// ----------------------------------------------------------------
export interface SeasonRow {
  id: string;
  season_number: number;
  name: string;
  starts_at: string;
  ends_at: string;
  status: "active" | "ended" | "upcoming" | string;
}

export async function fetchActiveSeason(): Promise<SeasonRow | null> {
  const { data } = await supabase
    .from("seasons" as any)
    .select("*")
    .eq("status", "active")
    .order("season_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as unknown as SeasonRow) ?? null;
}

export function getSeasonProgress(season: SeasonRow): {
  daysRemaining: number;
  pctElapsed: number;
} {
  const start = new Date(season.starts_at).getTime();
  const end = new Date(season.ends_at).getTime();
  const now = Date.now();
  const total = end - start;
  const elapsed = Math.max(0, Math.min(total, now - start));
  const pctElapsed = total > 0 ? (elapsed / total) * 100 : 100;
  const msRemaining = Math.max(0, end - now);
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  return { daysRemaining, pctElapsed };
}

// Tier color helpers
export const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  bronze:    { text: "text-amber-700",   bg: "bg-amber-700/10",   border: "border-amber-700/40" },
  silver:    { text: "text-slate-300",   bg: "bg-slate-300/10",   border: "border-slate-300/40" },
  gold:      { text: "text-amber-400",   bg: "bg-amber-400/15",   border: "border-amber-400/50" },
  diamond:   { text: "text-cyan-300",    bg: "bg-cyan-300/15",    border: "border-cyan-300/50" },
  legendary: { text: "text-fuchsia-300", bg: "bg-fuchsia-300/15", border: "border-fuchsia-300/60" },
};
