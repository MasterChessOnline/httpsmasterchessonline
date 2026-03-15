export interface StoryChapter {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  aiRating: number;
  startingFen?: string; // custom position, or undefined for standard
  objective: string;
  reward: {
    badge?: string;
    title?: string;
    videoTip?: string;
  };
  dayUnlock: number; // days since user started story (0 = always available)
  isFree: boolean;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  // === ARC 1: THE OPENING JOURNEY ===
  {
    key: "ch1_first_steps",
    title: "First Steps",
    subtitle: "Arc 1 · The Opening Journey",
    description: "Learn to control the center with your pawns. Beat DailyChess_12's Beginner Bot in a standard opening.",
    difficulty: "beginner",
    aiRating: 400,
    objective: "Win the game by controlling the center",
    reward: { badge: "🏅 First Steps", title: "Apprentice" },
    dayUnlock: 0,
    isFree: true, // Teaser level for free users
  },
  {
    key: "ch2_knights_quest",
    title: "The Knight's Quest",
    subtitle: "Arc 1 · The Opening Journey",
    description: "Knights are tricky! Navigate your knights to outmaneuver the Bot's defenses.",
    difficulty: "beginner",
    aiRating: 500,
    objective: "Develop both knights effectively and win",
    reward: { badge: "🐴 Knight Rider" },
    dayUnlock: 0,
    isFree: false,
  },
  {
    key: "ch3_bishop_pair",
    title: "The Bishop Pair",
    subtitle: "Arc 1 · The Opening Journey",
    description: "Harness the power of two bishops on open diagonals.",
    difficulty: "beginner",
    aiRating: 550,
    objective: "Use your bishops to create threats and win",
    reward: { badge: "⛪ Bishop Master", videoTip: "Opening Principles by DailyChess_12" },
    dayUnlock: 1,
    isFree: false,
  },
  {
    key: "ch4_castle_walls",
    title: "Castle Walls",
    subtitle: "Arc 1 · The Opening Journey",
    description: "Learn the importance of king safety. Castle early and protect your monarch.",
    difficulty: "beginner",
    aiRating: 600,
    startingFen: "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    objective: "Castle within 10 moves and win the game",
    reward: { badge: "🏰 Fortress Builder", title: "Defender" },
    dayUnlock: 2,
    isFree: false,
  },

  // === ARC 2: TACTICAL BATTLES ===
  {
    key: "ch5_fork_fury",
    title: "Fork Fury",
    subtitle: "Arc 2 · Tactical Battles",
    description: "Master the knight fork! Find the devastating double attack.",
    difficulty: "intermediate",
    aiRating: 800,
    startingFen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    objective: "Execute a fork and win material",
    reward: { badge: "⚡ Fork Master" },
    dayUnlock: 3,
    isFree: false,
  },
  {
    key: "ch6_pin_pressure",
    title: "Pin & Pressure",
    subtitle: "Arc 2 · Tactical Battles",
    description: "Use pins to immobilize your opponent's pieces and create winning threats.",
    difficulty: "intermediate",
    aiRating: 900,
    objective: "Create a pin and exploit it to win",
    reward: { badge: "📌 Pinning Expert", videoTip: "Tactical Patterns by DailyChess_12" },
    dayUnlock: 4,
    isFree: false,
  },
  {
    key: "ch7_skewer_strike",
    title: "Skewer Strike",
    subtitle: "Arc 2 · Tactical Battles",
    description: "The reverse pin! Drive a high-value piece away to capture what's behind it.",
    difficulty: "intermediate",
    aiRating: 1000,
    objective: "Find a skewer to win material",
    reward: { badge: "🗡️ Skewer Specialist" },
    dayUnlock: 5,
    isFree: false,
  },
  {
    key: "ch8_discovered_attack",
    title: "Discovered Attack",
    subtitle: "Arc 2 · Tactical Battles",
    description: "Move one piece to unleash another's hidden power.",
    difficulty: "intermediate",
    aiRating: 1100,
    objective: "Execute a discovered attack and win",
    reward: { badge: "💥 Discovery", title: "Tactician" },
    dayUnlock: 6,
    isFree: false,
  },

  // === ARC 3: THE MIDDLEGAME ===
  {
    key: "ch9_pawn_storm",
    title: "Pawn Storm",
    subtitle: "Arc 3 · The Middlegame",
    description: "Launch an aggressive pawn advance against the enemy king.",
    difficulty: "intermediate",
    aiRating: 1200,
    objective: "Create a winning pawn storm attack",
    reward: { badge: "🌊 Storm Bringer" },
    dayUnlock: 7,
    isFree: false,
  },
  {
    key: "ch10_exchange_sacrifice",
    title: "Exchange Sacrifice",
    subtitle: "Arc 3 · The Middlegame",
    description: "Sometimes giving up material leads to a greater reward. Sacrifice the exchange!",
    difficulty: "advanced",
    aiRating: 1300,
    objective: "Sacrifice material for a winning attack",
    reward: { badge: "🔥 Sacrificer", videoTip: "Middlegame Strategy by DailyChess_12" },
    dayUnlock: 8,
    isFree: false,
  },
  {
    key: "ch11_positional_squeeze",
    title: "Positional Squeeze",
    subtitle: "Arc 3 · The Middlegame",
    description: "Restrict your opponent's pieces and slowly crush them with superior positioning.",
    difficulty: "advanced",
    aiRating: 1400,
    objective: "Win through superior piece activity",
    reward: { badge: "🐍 Constrictor" },
    dayUnlock: 9,
    isFree: false,
  },

  // === ARC 4: ENDGAME MASTERY ===
  {
    key: "ch12_king_activation",
    title: "King Activation",
    subtitle: "Arc 4 · Endgame Mastery",
    description: "In the endgame, the king becomes a fighting piece. March it forward!",
    difficulty: "advanced",
    aiRating: 1500,
    startingFen: "8/5pk1/6p1/8/8/6P1/5PK1/8 w - - 0 1",
    objective: "Activate your king and promote a pawn",
    reward: { badge: "👑 King's March", title: "Endgame Specialist" },
    dayUnlock: 10,
    isFree: false,
  },
  {
    key: "ch13_rook_endgame",
    title: "Rook Endgame",
    subtitle: "Arc 4 · Endgame Mastery",
    description: "Master the most common endgame type. Rook endings are drawn rook endings… unless you know the theory!",
    difficulty: "advanced",
    aiRating: 1600,
    startingFen: "8/8/8/4k3/R7/4K3/4P3/1r6 w - - 0 1",
    objective: "Win the rook endgame",
    reward: { badge: "♜ Rook Master", videoTip: "Endgame Essentials by DailyChess_12" },
    dayUnlock: 11,
    isFree: false,
  },

  // === ARC 5: THE FINAL BOSS ===
  {
    key: "ch14_grandmaster_trial",
    title: "The Grandmaster Trial",
    subtitle: "Arc 5 · The Final Boss",
    description: "Face DailyChess_12 at maximum strength. Only the best will prevail!",
    difficulty: "advanced",
    aiRating: 1800,
    objective: "Defeat the strongest version of DailyChess_12",
    reward: { badge: "🏆 Story Champion", title: "Grandmaster Challenger" },
    dayUnlock: 12,
    isFree: false,
  },
];

export const TOTAL_CHAPTERS = STORY_CHAPTERS.length;

export function getArcName(chapter: StoryChapter): string {
  return chapter.subtitle.split(" · ")[1] || "";
}

export function getArcColor(subtitle: string): string {
  if (subtitle.includes("Opening")) return "text-green-400";
  if (subtitle.includes("Tactical")) return "text-yellow-400";
  if (subtitle.includes("Middlegame")) return "text-orange-400";
  if (subtitle.includes("Endgame")) return "text-blue-400";
  if (subtitle.includes("Final")) return "text-red-400";
  return "text-primary";
}
