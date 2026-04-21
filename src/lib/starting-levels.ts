// Starting-level options shown at signup. The choice seeds the player's
// initial bot_rating; all further progression is purely gameplay-driven.

export interface StartingLevel {
  key: "beginner" | "intermediate" | "advanced" | "expert" | "master";
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  description: string;
  rating: number;
  icon: string;
  /** Tailwind accent classes for the option card. */
  color: string;
  borderColor: string;
}

export const STARTING_LEVELS: StartingLevel[] = [
  {
    key: "beginner",
    level: 1,
    label: "Beginner",
    description: "Just learning the basics.",
    rating: 800,
    icon: "🌱",
    color: "text-emerald-400",
    borderColor: "border-emerald-400/30",
  },
  {
    key: "intermediate",
    level: 2,
    label: "Intermediate",
    description: "Comfortable with openings and tactics.",
    rating: 1200,
    icon: "♟",
    color: "text-cyan-300",
    borderColor: "border-cyan-300/30",
  },
  {
    key: "advanced",
    level: 3,
    label: "Advanced",
    description: "Solid club-player level.",
    rating: 1600,
    icon: "⚔️",
    color: "text-blue-400",
    borderColor: "border-blue-400/30",
  },
  {
    key: "expert",
    level: 4,
    label: "Expert",
    description: "Tournament-ready strength.",
    rating: 2000,
    icon: "🎯",
    color: "text-purple-400",
    borderColor: "border-purple-400/40",
  },
  {
    key: "master",
    level: 5,
    label: "Master",
    description: "Title-track and elite play.",
    rating: 2200,
    icon: "👑",
    color: "text-yellow-400",
    borderColor: "border-yellow-400/50",
  },
];

export const DEFAULT_STARTING_LEVEL_KEY: StartingLevel["key"] = "intermediate";

export function getStartingLevel(key: string): StartingLevel {
  return STARTING_LEVELS.find((l) => l.key === key) ?? STARTING_LEVELS[1];
}
