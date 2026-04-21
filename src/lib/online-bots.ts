import { type Difficulty } from "./chess-ai";
import { ONLINE_BOTS, type OnlineBotProfile } from "./online-bots-data";

export { ONLINE_BOTS };
export type { OnlineBotProfile };

// Pick a bot close to the player's rating
export function matchBot(playerRating: number): OnlineBotProfile {
  const sorted = [...ONLINE_BOTS].sort(
    (a, b) => Math.abs(a.rating - playerRating) - Math.abs(b.rating - playerRating)
  );
  // Pick from top 8 closest, randomly — gives variety while staying near level
  const pool = sorted.slice(0, 8);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Get random subset of "online" bots for display
export function getOnlineBots(count: number = 8): OnlineBotProfile[] {
  const shuffled = [...ONLINE_BOTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get difficulty based on rating
export function getDifficultyForRating(rating: number): Difficulty {
  if (rating < 1100) return "beginner";
  if (rating < 1500) return "intermediate";
  return "advanced";
}
