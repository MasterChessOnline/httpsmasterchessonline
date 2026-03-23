// XP & Level System
// XP sources: games played, wins, puzzles, lessons, streaks, tournaments

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  xpForNext: number;
  icon: string;
}

const LEVEL_TITLES: Record<number, string> = {
  1: "Pawn",
  2: "Apprentice",
  3: "Knight Squire",
  4: "Bishop's Student",
  5: "Rook Guard",
  6: "Tactician",
  7: "Strategist",
  8: "Master Candidate",
  9: "Arena Champion",
  10: "Knight Commander",
  15: "Bishop Master",
  20: "Rook Lord",
  25: "Queen's Elite",
  30: "Grandmaster",
  40: "Legend",
  50: "Chess Immortal",
};

function getTitleForLevel(level: number): string {
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (level >= k) return LEVEL_TITLES[k];
  }
  return "Beginner";
}

// XP needed to reach a given level (cumulative)
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Quadratic scaling: level 2 = 100, level 3 = 250, level 10 = 4500, level 20 = 19000
  return Math.floor(50 * level * level);
}

export function getLevelFromXP(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  return {
    level,
    title: getTitleForLevel(level),
    xpRequired: nextLevelXP - currentLevelXP,
    xpForNext: xp - currentLevelXP,
    icon: level >= 30 ? "👑" : level >= 20 ? "⚔️" : level >= 10 ? "🏰" : level >= 5 ? "♞" : "♟",
  };
}

// Calculate XP from profile stats
export function calculateXP(profile: {
  games_played: number;
  games_won: number;
  games_drawn: number;
  rating: number;
}, extras?: {
  puzzlesSolved?: number;
  lessonsCompleted?: number;
  streakDays?: number;
  tournamentsPlayed?: number;
  storyChapters?: number;
}): number {
  let xp = 0;
  // Games: 10 XP per game, 25 bonus per win, 10 bonus per draw
  xp += profile.games_played * 10;
  xp += profile.games_won * 25;
  xp += profile.games_drawn * 10;
  // Rating bonus: 1 XP per rating point above 800
  xp += Math.max(0, profile.rating - 800);
  // Extras
  if (extras) {
    xp += (extras.puzzlesSolved || 0) * 15;
    xp += (extras.lessonsCompleted || 0) * 30;
    xp += (extras.streakDays || 0) * 20;
    xp += (extras.tournamentsPlayed || 0) * 50;
    xp += (extras.storyChapters || 0) * 40;
  }
  return xp;
}

// Daily missions
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  xpReward: number;
  type: "games" | "wins" | "puzzles" | "lessons" | "analysis";
}

export function getDailyMissions(): DailyMission[] {
  // Rotating missions based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const sets: DailyMission[][] = [
    [
      { id: "play3", title: "Play 3 Games", description: "Complete 3 games today", icon: "⚔️", target: 3, xpReward: 50, type: "games" },
      { id: "win1", title: "Win a Game", description: "Win at least 1 game", icon: "🏆", target: 1, xpReward: 30, type: "wins" },
      { id: "puzzle3", title: "Solve 3 Puzzles", description: "Complete 3 daily puzzles", icon: "🧩", target: 3, xpReward: 40, type: "puzzles" },
    ],
    [
      { id: "play5", title: "Play 5 Games", description: "Complete 5 games today", icon: "⚔️", target: 5, xpReward: 80, type: "games" },
      { id: "lesson1", title: "Complete a Lesson", description: "Finish any lesson", icon: "📖", target: 1, xpReward: 35, type: "lessons" },
      { id: "win2", title: "Win 2 Games", description: "Win at least 2 games", icon: "🏆", target: 2, xpReward: 60, type: "wins" },
    ],
    [
      { id: "play2", title: "Play 2 Games", description: "Complete 2 games today", icon: "⚔️", target: 2, xpReward: 30, type: "games" },
      { id: "puzzle5", title: "Solve 5 Puzzles", description: "Complete 5 daily puzzles", icon: "🧩", target: 5, xpReward: 60, type: "puzzles" },
      { id: "analyze1", title: "Analyze a Game", description: "Use the analysis board", icon: "🔍", target: 1, xpReward: 25, type: "analysis" },
    ],
  ];
  return sets[dayOfYear % sets.length];
}
