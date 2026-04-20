import { type Difficulty } from "../chess-ai";
import type { Playstyle, OpeningRepertoire } from "./playstyles";

export interface BotProfile {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  difficulty: Difficulty;
  personality: string;
  /** How the bot picks moves: aggressive, positional, etc. */
  playstyle: Playstyle;
  /** Preferred opening systems — bot will try to follow these. */
  openings: OpeningRepertoire[];
  /** 0..1 — chance the bot plays the engine-best move. Lower = more human. */
  accuracy: number;
  /** 0..1 — chance per move the bot blunders (drops material / misses tactic). */
  blunderRate: number;
  /** 0..1 — chance per move the bot makes a small inaccuracy. */
  inaccuracyRate: number;
  /** How many plies of opening theory the bot will follow before going its own way. */
  bookDepth: number;
  country: string;
  countryFlag: string;
  style: string;
  bio: string;
  drawAcceptThreshold: number;
  resignThreshold: number;
  taunts: {
    greeting: string;
    onCheck: string;
    onCapture: string;
    onBlunder: string;
    onWin: string;
    onLose: string;
    onDraw: string;
    onDrawOffer: string;
    onDrawDecline: string;
  };
}

export const BOT_PROFILES: BotProfile[] = [
  {
    id: "rookie-rosa",
    name: "Rookie Rosa",
    avatar: "🌷",
    rating: 500,
    difficulty: "beginner",
    personality: "friendly",
    playstyle: "universal",
    openings: ["italian", "scandinavian"],
    accuracy: 0.45,
    blunderRate: 0.18,
    inaccuracyRate: 0.30,
    bookDepth: 4,
    country: "Portugal",
    countryFlag: "🇵🇹",
    style: "Simple, cheerful play",
    bio: "Just learning — every game is a new adventure.",
    drawAcceptThreshold: 16,
    resignThreshold: 9999,
    taunts: {
      greeting: "Hi! Let's have fun 🌷",
      onCheck: "Oh! Already check? 😅",
      onCapture: "Got one!",
      onBlunder: "Oops, I dropped that 😵",
      onWin: "Yay, I won! 🌷",
      onLose: "Good game — I'm learning 📚",
      onDraw: "A draw works for me 🤝",
      onDrawOffer: "Sure, draw sounds good 🤝",
      onDrawDecline: "Let's keep going 😊",
    },
  },
  {
    id: "pawn-pablo",
    name: "Pawn Pablo",
    avatar: "🌵",
    rating: 800,
    difficulty: "beginner",
    personality: "curious",
    playstyle: "gambit",
    openings: ["kings-gambit", "italian", "scandinavian"],
    accuracy: 0.55,
    blunderRate: 0.13,
    inaccuracyRate: 0.25,
    bookDepth: 6,
    country: "Mexico",
    countryFlag: "🇲🇽",
    style: "Loves pushing pawns",
    bio: "Believes every pawn deserves a chance to shine.",
    drawAcceptThreshold: 22,
    resignThreshold: 5500,
    taunts: {
      greeting: "Vamos! Let's play 🌵",
      onCheck: "Check! Did you see that? 😎",
      onCapture: "Mine now!",
      onBlunder: "Hmm, that wasn't great 😬",
      onWin: "What a game! 🌵",
      onLose: "You played well — GG 🤝",
      onDraw: "Fair enough — draw 🤝",
      onDrawOffer: "Sí, draw accepted 👍",
      onDrawDecline: "Not yet — still fighting!",
    },
  },
  {
    id: "tactic-tanvi",
    name: "Tactic Tanvi",
    avatar: "⚡",
    rating: 1150,
    difficulty: "intermediate",
    personality: "sharp",
    playstyle: "tactical",
    openings: ["sicilian", "italian", "scandinavian"],
    accuracy: 0.68,
    blunderRate: 0.07,
    inaccuracyRate: 0.18,
    bookDepth: 8,
    country: "India",
    countryFlag: "🇮🇳",
    style: "Always hunting for forks and pins",
    bio: "If something's loose, Tanvi spots it.",
    drawAcceptThreshold: 32,
    resignThreshold: 2400,
    taunts: {
      greeting: "Defend your pieces ⚡",
      onCheck: "Check — tactics first.",
      onCapture: "Hanging piece, gone ⚡",
      onBlunder: "Missed that one...",
      onWin: "Clean tactic, clean win ⚡",
      onLose: "You calculated better 🤝",
      onDraw: "Neither cracked. Draw.",
      onDrawOffer: "Equal — draw accepted.",
      onDrawDecline: "Still tactical chances ⚡",
    },
  },
  {
    id: "calm-camille",
    name: "Calm Camille",
    avatar: "🕊️",
    rating: 1400,
    difficulty: "intermediate",
    personality: "positional",
    playstyle: "positional",
    openings: ["french", "london", "queens-gambit"],
    accuracy: 0.74,
    blunderRate: 0.05,
    inaccuracyRate: 0.15,
    bookDepth: 10,
    country: "France",
    countryFlag: "🇫🇷",
    style: "Smooth development, plays for squares",
    bio: "Prefers harmony and long-term pressure.",
    drawAcceptThreshold: 38,
    resignThreshold: 2100,
    taunts: {
      greeting: "Bonjour — let's play 🕊️",
      onCheck: "A quiet check still stings.",
      onCapture: "Improving the position.",
      onBlunder: "That diagonal slipped...",
      onWin: "Position over panic 🕊️",
      onLose: "Well handled 🤝",
      onDraw: "A fair draw.",
      onDrawOffer: "Level — draw accepted.",
      onDrawDecline: "Not yet, there's still play.",
    },
  },
  {
    id: "counter-kira",
    name: "Counter Kira",
    avatar: "🦂",
    rating: 1700,
    difficulty: "advanced",
    personality: "resourceful",
    playstyle: "defensive",
    openings: ["caro-kann", "french", "kings-indian"],
    accuracy: 0.82,
    blunderRate: 0.025,
    inaccuracyRate: 0.10,
    bookDepth: 12,
    country: "Japan",
    countryFlag: "🇯🇵",
    style: "Defends, then strikes back",
    bio: "Happy to absorb pressure for one big counterpunch.",
    drawAcceptThreshold: 44,
    resignThreshold: 1700,
    taunts: {
      greeting: "Push if you want — I hit back 🦂",
      onCheck: "Counterplay with check.",
      onCapture: "That was the turning point.",
      onBlunder: "Too loose. I know better.",
      onWin: "One mistake was enough 🦂",
      onLose: "Your attack held 🤝",
      onDraw: "Pressure met resistance.",
      onDrawOffer: "Equality — accepted.",
      onDrawDecline: "Still tension to play 🦂",
    },
  },
  {
    id: "fortress-felix",
    name: "Fortress Felix",
    avatar: "🧱",
    rating: 1950,
    difficulty: "advanced",
    personality: "solid",
    playstyle: "defensive",
    openings: ["caro-kann", "london", "queens-gambit"],
    accuracy: 0.87,
    blunderRate: 0.015,
    inaccuracyRate: 0.08,
    bookDepth: 14,
    country: "Germany",
    countryFlag: "🇩🇪",
    style: "Compact defense, accurate endgames",
    bio: "Very hard to break down once set up.",
    drawAcceptThreshold: 52,
    resignThreshold: 1400,
    taunts: {
      greeting: "Earn every inch 🧱",
      onCheck: "A direct question for your king.",
      onCapture: "Structure first.",
      onBlunder: "Beneath my standard.",
      onWin: "The wall held 🧱",
      onLose: "Strong conversion 🤝",
      onDraw: "No weaknesses, no winner.",
      onDrawOffer: "Stable — accepted.",
      onDrawDecline: "Position still has life.",
    },
  },
  {
    id: "endgame-eito",
    name: "Endgame Eito",
    avatar: "🎯",
    rating: 2200,
    difficulty: "expert",
    personality: "clinical",
    playstyle: "positional",
    openings: ["english", "queens-gambit", "ruy-lopez"],
    accuracy: 0.92,
    blunderRate: 0.008,
    inaccuracyRate: 0.05,
    bookDepth: 16,
    country: "South Korea",
    countryFlag: "🇰🇷",
    style: "Simplifies into winning endings",
    bio: "Thrives when every tempo matters.",
    drawAcceptThreshold: 60,
    resignThreshold: 1000,
    taunts: {
      greeting: "Trade pieces — I like my chances 🎯",
      onCheck: "A useful check.",
      onCapture: "Reducing to clean play.",
      onBlunder: "Rare miss. Noted.",
      onWin: "Technique did the rest 🎯",
      onLose: "You outplayed the ending 🤝",
      onDraw: "Exact enough.",
      onDrawOffer: "Level endgame — accepted.",
      onDrawDecline: "More to squeeze here.",
    },
  },
  {
    id: "attack-amara",
    name: "Attack Amara",
    avatar: "🔥",
    rating: 2350,
    difficulty: "expert",
    personality: "aggressive",
    playstyle: "aggressive",
    openings: ["sicilian", "kings-indian", "kings-gambit"],
    accuracy: 0.93,
    blunderRate: 0.006,
    inaccuracyRate: 0.04,
    bookDepth: 16,
    country: "Nigeria",
    countryFlag: "🇳🇬",
    style: "Initiative-heavy attacker",
    bio: "If your king feels airy, Amara is coming.",
    drawAcceptThreshold: 62,
    resignThreshold: 900,
    taunts: {
      greeting: "Let's not make this quiet 🔥",
      onCheck: "Check — more is coming.",
      onCapture: "Open lines — exactly what I wanted.",
      onBlunder: "Too much fire, not enough control.",
      onWin: "Attack converted 🔥",
      onLose: "You defended everything 🤝",
      onDraw: "Attack burned out.",
      onDrawOffer: "No breakthrough today.",
      onDrawDecline: "I still smell the king 🔥",
    },
  },
  {
    id: "gm-nova",
    name: "GM Nova",
    avatar: "🌌",
    rating: 2650,
    difficulty: "master",
    personality: "universal",
    playstyle: "universal",
    openings: ["ruy-lopez", "queens-gambit", "english", "sicilian"],
    accuracy: 0.96,
    blunderRate: 0.002,
    inaccuracyRate: 0.025,
    bookDepth: 20,
    country: "Argentina",
    countryFlag: "🇦🇷",
    style: "Universal grandmaster play",
    bio: "Comfortable in every phase, very few weaknesses.",
    drawAcceptThreshold: 74,
    resignThreshold: 700,
    taunts: {
      greeting: "Let's see how long you hold 🌌",
      onCheck: "A precise check.",
      onCapture: "All calculated.",
      onBlunder: "A rare inaccuracy.",
      onWin: "Pressure became inevitability 🌌",
      onLose: "Excellent game 🤝",
      onDraw: "Accurate from both sides.",
      onDrawOffer: "Correct result — accepted.",
      onDrawDecline: "Practical chances remain.",
    },
  },
  {
    id: "milos-moskovljevic",
    name: "Miloš Moskovljević",
    avatar: "👑",
    rating: 3000,
    difficulty: "master",
    personality: "elite",
    playstyle: "universal",
    openings: ["ruy-lopez", "queens-gambit", "sicilian", "english", "kings-indian"],
    accuracy: 0.99,
    blunderRate: 0.0005,
    inaccuracyRate: 0.01,
    bookDepth: 24,
    country: "Serbia",
    countryFlag: "🇷🇸",
    style: "World-class precision — universal and relentless",
    bio: "Serbian 3000-rated GM. The toughest opponent on the site.",
    drawAcceptThreshold: 90,
    resignThreshold: 450,
    taunts: {
      greeting: "Pokažite šta znate. 👑",
      onCheck: "Šah. Precizno. 🎯",
      onCapture: "Izračunato. 👑",
      onBlunder: "Greška. Veoma retko. 😤",
      onWin: "Pobeda. Kao i obično. 👑🏆",
      onLose: "Izvanredna partija. Svaka čast. 🤝",
      onDraw: "Dostojan remi. 👑🤝",
      onDrawOffer: "Pozicija je ravna — prihvatam. 👑",
      onDrawDecline: "Igram do kraja. 👑",
    },
  },
];

const DEFAULT_BOT_IDS: Record<Difficulty, string> = {
  beginner: "rookie-rosa",
  intermediate: "tactic-tanvi",
  advanced: "counter-kira",
  expert: "endgame-eito",
  master: "milos-moskovljevic",
};

export function getBotByDifficulty(difficulty: Difficulty): BotProfile[] {
  return BOT_PROFILES.filter((bot) => bot.difficulty === difficulty);
}

export function getBotById(id: string): BotProfile | undefined {
  return BOT_PROFILES.find((bot) => bot.id === id);
}

export function getDefaultBot(difficulty: Difficulty): BotProfile {
  const preferredBot = getBotById(DEFAULT_BOT_IDS[difficulty]);
  if (preferredBot) return preferredBot;

  const difficultyBots = getBotByDifficulty(difficulty);
  if (difficultyBots.length > 0) return difficultyBots[0];

  return BOT_PROFILES[0];
}

export function getRandomBot(difficulty: Difficulty): BotProfile {
  const bots = getBotByDifficulty(difficulty);
  if (bots.length === 0) return getDefaultBot("beginner");
  return bots[Math.floor(Math.random() * bots.length)] ?? getDefaultBot(difficulty);
}
