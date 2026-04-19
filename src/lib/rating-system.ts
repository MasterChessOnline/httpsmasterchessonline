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
  const change = Math.round(rawChange);
  const newRating = Math.max(400, playerRating + change);

  let performanceLabel = "Expected result";
  const delta = actualScore - expected;
  if (delta > 0.25) performanceLabel = "You outperformed your rating";
  else if (delta < -0.25) performanceLabel = "Below expected performance";
  else if (delta > 0.05) performanceLabel = "Slightly above expectations";
  else if (delta < -0.05) performanceLabel = "Slightly below expectations";

  return { oldRating: playerRating, newRating, change, expected, actualScore, performanceLabel, k };
}

/** Apply a bot-game result: updates profiles.bot_rating + bot stats and logs to rating_history. */
export async function applyBotRatingChange(opts: {
  userId: string;
  currentRating: number;
  botRating: number;
  botLabel: string;
  gamesPlayed: number;
  result: GameResult;
}): Promise<RatingCalcResult> {
  const calc = calculateRatingChange({
    playerRating: opts.currentRating,
    opponentRating: opts.botRating,
    result: opts.result,
    gamesPlayed: opts.gamesPlayed,
    // Stronger bots give a slight bonus on wins
    difficultyMultiplier: opts.result === "win" && opts.botRating > opts.currentRating ? 1.1 : 1,
  });

  // Update profile counters
  const updates: Record<string, any> = {
    bot_rating: calc.newRating,
    bot_games_played: opts.gamesPlayed + 1,
  };
  if (opts.result === "win") updates.bot_games_won = (await getBotStat(opts.userId, "bot_games_won")) + 1;
  else if (opts.result === "loss") updates.bot_games_lost = (await getBotStat(opts.userId, "bot_games_lost")) + 1;
  else updates.bot_games_drawn = (await getBotStat(opts.userId, "bot_games_drawn")) + 1;

  await supabase.from("profiles").update(updates).eq("user_id", opts.userId);

  await supabase.from("rating_history" as any).insert({
    user_id: opts.userId,
    rating_type: "bot",
    old_rating: calc.oldRating,
    new_rating: calc.newRating,
    rating_change: calc.change,
    opponent_rating: opts.botRating,
    opponent_label: opts.botLabel,
    result: opts.result,
  });

  return calc;
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
