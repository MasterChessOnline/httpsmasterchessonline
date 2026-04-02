// Play Personality System — analyzes user's game history to determine playstyle

export interface PlayPersonality {
  style: string;
  icon: string;
  description: string;
  color: string;
}

const PERSONALITIES: PlayPersonality[] = [
  {
    style: "Aggressive",
    icon: "⚔️",
    description: "You strike fast and push for tactical attacks. You thrive in sharp positions.",
    color: "text-red-400",
  },
  {
    style: "Defensive",
    icon: "🛡️",
    description: "You build solid fortresses and wait for your opponent to overextend.",
    color: "text-blue-400",
  },
  {
    style: "Positional",
    icon: "♟️",
    description: "You accumulate small advantages and squeeze your opponents with precision.",
    color: "text-emerald-400",
  },
  {
    style: "Tactical",
    icon: "🎯",
    description: "You spot combinations and sacrifices that others miss. Sharp and creative.",
    color: "text-amber-400",
  },
  {
    style: "Balanced",
    icon: "⚖️",
    description: "You adapt to any position. A versatile player with no clear weakness.",
    color: "text-purple-400",
  },
];

export function analyzePersonality(profile: {
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  rating: number;
}): PlayPersonality {
  if (profile.games_played < 1) return PERSONALITIES[4]; // Balanced default

  const winRate = profile.games_won / Math.max(profile.games_played, 1);
  const drawRate = profile.games_drawn / Math.max(profile.games_played, 1);

  // Heuristic assignment based on stats
  if (winRate > 0.6 && drawRate < 0.1) return PERSONALITIES[0]; // Aggressive
  if (drawRate > 0.3) return PERSONALITIES[1]; // Defensive
  if (profile.rating >= 1600 && winRate > 0.5) return PERSONALITIES[2]; // Positional
  if (winRate > 0.5 && drawRate < 0.15) return PERSONALITIES[3]; // Tactical
  return PERSONALITIES[4]; // Balanced
}
