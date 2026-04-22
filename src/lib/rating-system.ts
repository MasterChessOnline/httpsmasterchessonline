// FIDE-style Elo rating engine.
// Used for both online rating (vs humans) and bot rating (vs AI).

import { supabase } from "@/integrations/supabase/client";

export type GameResult = "win" | "loss" | "draw";
export type RatingType = "online" | "bot";

/** Expected score 0..1 for player A vs player B. */
export function expectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/** K-factor following simplified FIDE bands. */
export function getKFactor(rating: number, gamesPlayed: number): number {
  if (gamesPlayed < 30) return 40;        // new player — fast adjustment
  if (rating < 2400) return 20;
  return 10;                               // master-level — stable
}

export interface RatingCalcInput {
  playerRating: number;
  opponentRating: number;
  result: GameResult;
  gamesPlayed: number;
  /** Optional bonus multiplier for bot games scaled by bot strength. */
  difficultyMultiplier?: number;
}

export interface RatingCalcResult {
  oldRating: number;
  newRating: number;
  change: number;
  expected: number;            // 0..1
  actualScore: number;         // 1, 0.5, 0
  performanceLabel: string;    // "You outperformed your rating", etc.
  k: number;
}

export function calculateRatingChange(input: RatingCalcInput): RatingCalcResult {
  const { playerRating, opponentRating, result, gamesPlayed, difficultyMultiplier = 1 } = input;
  const expected = expectedScore(playerRating, opponentRating);
  const actualScore = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
  const k = getKFactor(playerRating, gamesPlayed);
  const rawChange = k * (actualScore - expected) * difficultyMultiplier;
  let change = Math.round(rawChange);

  // Guarantee a visible rating swing on every result.
  // Wins: at least +1. Losses: at least -1.
  if (result === "win" && change < 1) change = 1;
  else if (result === "loss" && change > -1) change = -1;
  else if (result === "draw") {
    // Structured draw rules:
    //   vs stronger opponent → small gain (+2 to +5)
    //   vs equal opponent    → 0 to ±5 (whatever Elo computed)
    //   vs weaker opponent   → small loss (-2 to -8)
    const diff = opponentRating - playerRating;
    if (diff >= 50) {
      // Stronger opponent — clamp gain to +2..+5
      change = Math.max(2, Math.min(5, change || 2));
    } else if (diff <= -50) {
      // Weaker opponent — clamp loss to -2..-8
      change = Math.max(-8, Math.min(-2, change || -2));
    } else {
      // Roughly equal (within 50 Elo) — clamp to ±5
      change = Math.max(-5, Math.min(5, change));
    }
  }

  const newRating = Math.max(400, playerRating + change);

  let performanceLabel = "Expected result";
  const delta = actualScore - expected;
  if (delta > 0.25) performanceLabel = "You outperformed your rating";
  else if (delta < -0.25) performanceLabel = "Below expected performance";
  else if (delta > 0.05) performanceLabel = "Slightly above expectations";
  else if (delta < -0.05) performanceLabel = "Slightly below expectations";

  return { oldRating: playerRating, newRating, change, expected, actualScore, performanceLabel, k };
}

/** Apply a bot-game result: updates profiles.bot_rating + bot stats and logs to rating_history.
 *  Optionally factors in streak bonus (extra Elo for win streaks) and rating protection
 *  (reduced loss on losing streaks). Caller passes pre-fetched streak counters. */
export async function applyBotRatingChange(opts: {
  userId: string;
  currentRating: number;
  botRating: number;
  botLabel: string;
  gamesPlayed: number;
  result: GameResult;
  streakBonus?: number;       // extra rating points for win-streak milestones
  lossStreak?: number;        // current consecutive losses (for protection calc)
}): Promise<RatingCalcResult> {
  const calc = calculateRatingChange({
    playerRating: opts.currentRating,
    opponentRating: opts.botRating,
    result: opts.result,
    gamesPlayed: opts.gamesPlayed,
    // Stronger bots give a slight bonus on wins
    difficultyMultiplier: opts.result === "win" && opts.botRating > opts.currentRating ? 1.1 : 1,
  });

  // Apply optional streak bonus (wins) and rating protection (losses).
  let adjustedChange = calc.change;
  if (opts.result === "win" && opts.streakBonus && opts.streakBonus > 0) {
    adjustedChange += opts.streakBonus;
  }
  if (opts.result === "loss" && opts.lossStreak && opts.lossStreak >= 3) {
    const reductionPct = Math.min(0.5, (opts.lossStreak - 2) * 0.075 + 0.075);
    const protectedChange = Math.round(adjustedChange * (1 - reductionPct));
    adjustedChange = Math.min(-1, protectedChange);
  }

  const adjustedNew = Math.max(400, opts.currentRating + adjustedChange);
  const finalCalc: RatingCalcResult = {
    ...calc,
    change: adjustedChange,
    newRating: adjustedNew,
  };

  // Update profile counters
  const updates: Record<string, any> = {
    bot_rating: finalCalc.newRating,
    bot_games_played: opts.gamesPlayed + 1,
  };
  if (opts.result === "win") updates.bot_games_won = (await getBotStat(opts.userId, "bot_games_won")) + 1;
  else if (opts.result === "loss") updates.bot_games_lost = (await getBotStat(opts.userId, "bot_games_lost")) + 1;
  else updates.bot_games_drawn = (await getBotStat(opts.userId, "bot_games_drawn")) + 1;

  await supabase.from("profiles").update(updates).eq("user_id", opts.userId);

  await supabase.from("rating_history" as any).insert({
    user_id: opts.userId,
    rating_type: "bot",
    old_rating: finalCalc.oldRating,
    new_rating: finalCalc.newRating,
    rating_change: finalCalc.change,
    opponent_rating: opts.botRating,
    opponent_label: opts.botLabel,
    result: opts.result,
  });

  return finalCalc;
}

/** Log an online-game rating change to history (online rating itself is updated by the DB function update_elo_ratings). */
export async function logOnlineRatingChange(opts: {
  userId: string;
  oldRating: number;
  newRating: number;
  opponentRating: number;
  opponentLabel?: string;
  result: GameResult;
}) {
  await supabase.from("rating_history" as any).insert({
    user_id: opts.userId,
    rating_type: "online",
    old_rating: opts.oldRating,
    new_rating: opts.newRating,
    rating_change: opts.newRating - opts.oldRating,
    opponent_rating: opts.opponentRating,
    opponent_label: opts.opponentLabel ?? null,
    result: opts.result,
  });
}

async function getBotStat(userId: string, col: string): Promise<number> {
  const { data } = await supabase.from("profiles").select(col).eq("user_id", userId).maybeSingle();
  return ((data as any)?.[col] as number) ?? 0;
}
