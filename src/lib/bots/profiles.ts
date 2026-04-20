import { type Difficulty } from "../chess-ai";

export interface BotProfile {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  difficulty: Difficulty;
  personality: string;
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
    id: "board-buddy-bella",
    name: "Board Buddy Bella",
    avatar: "🌼",
    rating: 500,
    difficulty: "beginner",
    personality: "friendly",
    country: "Canada",
    countryFlag: "🇨🇦",
    style: "Simple, cheerful play",
    bio: "Loves clean openings and happy little chess adventures.",
    drawAcceptThreshold: 16,
    resignThreshold: 9999,
    taunts: {
      greeting: "Hi! Let's play a fun one 🌼",
      onCheck: "Oh! That's check already? 😅",
      onCapture: "Nice grab!",
      onBlunder: "I think I dropped something 😵",
      onWin: "Yay! I actually won 🌼",
      onLose: "Good game — I'm learning fast 📚",
      onDraw: "A draw is still a good game 🤝",
      onDrawOffer: "Sure, a draw sounds nice 🤝",
      onDrawDecline: "Let's keep going a little longer 😊",
    },
  },
  {
    id: "learner-luca",
    name: "Learner Luca",
    avatar: "🛹",
    rating: 750,
    difficulty: "beginner",
    personality: "curious",
    country: "Italy",
    countryFlag: "🇮🇹",
    style: "Fast learner, still hangs pieces",
    bio: "Always trying something new, even when it backfires.",
    drawAcceptThreshold: 22,
    resignThreshold: 5000,
    taunts: {
      greeting: "Let's test some ideas 🛹",
      onCheck: "Check! I saw that one 😎",
      onCapture: "Got it!",
      onBlunder: "Okay... that was not the plan 😬",
      onWin: "That worked way better than expected 🛹",
      onLose: "You got me — GG 🤝",
      onDraw: "Balanced enough for a draw 🤝",
      onDrawOffer: "Yeah, I'll take the draw 👍",
      onDrawDecline: "No draw yet — I still have tricks!",
    },
  },
  {
    id: "tactic-tariq",
    name: "Tactic Tariq",
    avatar: "⚡",
    rating: 1100,
    difficulty: "intermediate",
    personality: "sharp",
    country: "Morocco",
    countryFlag: "🇲🇦",
    style: "Looks for forks and loose pieces",
    bio: "If something is hanging, Tariq will usually find it.",
    drawAcceptThreshold: 32,
    resignThreshold: 2400,
    taunts: {
      greeting: "Keep your pieces defended ⚡",
      onCheck: "Check — tactics first.",
      onCapture: "That piece was loose ⚡",
      onBlunder: "Missed a tactic there...",
      onWin: "Clean tactic, clean win ⚡",
      onLose: "You calculated better. Respect 🤝",
      onDraw: "Neither side cracked. Draw.",
      onDrawOffer: "Equal enough — draw accepted.",
      onDrawDecline: "I still see tactical chances ⚡",
    },
  },
  {
    id: "bishop-bianca",
    name: "Bishop Bianca",
    avatar: "🕊️",
    rating: 1350,
    difficulty: "intermediate",
    personality: "positional",
    country: "Romania",
    countryFlag: "🇷🇴",
    style: "Develops smoothly and plays for squares",
    bio: "Prefers harmony, diagonals, and long-term pressure.",
    drawAcceptThreshold: 38,
    resignThreshold: 2200,
    taunts: {
      greeting: "Let's play good chess 🕊️",
      onCheck: "A quiet check can still sting.",
      onCapture: "Improving the position.",
      onBlunder: "That diagonal slipped away...",
      onWin: "Position over panic 🕊️",
      onLose: "You handled the pressure well 🤝",
      onDraw: "A fair positional draw.",
      onDrawOffer: "This looks level — draw accepted.",
      onDrawDecline: "Not yet. There is still play.",
    },
  },
  {
    id: "counter-carla",
    name: "Counter Carla",
    avatar: "🦂",
    rating: 1650,
    difficulty: "advanced",
    personality: "resourceful",
    country: "Spain",
    countryFlag: "🇪🇸",
    style: "Absorbs pressure and strikes back",
    bio: "Happy to defend for a while if it means one strong counterpunch.",
    drawAcceptThreshold: 44,
    resignThreshold: 1700,
    taunts: {
      greeting: "Push if you want — I'll hit back 🦂",
      onCheck: "Counterplay arrives with check.",
      onCapture: "That was the turning point.",
      onBlunder: "Too loose. I know better than that.",
      onWin: "One mistake was enough 🦂",
      onLose: "Your attack held together. Nicely done 🤝",
      onDraw: "Pressure met resistance. Draw.",
      onDrawOffer: "I can live with equality. Draw accepted.",
      onDrawDecline: "Still enough tension to play on 🦂",
    },
  },
  {
    id: "fortress-finn",
    name: "Fortress Finn",
    avatar: "🧱",
    rating: 1900,
    difficulty: "advanced",
    personality: "solid",
    country: "Finland",
    countryFlag: "🇫🇮",
    style: "Compact defense and accurate endgames",
    bio: "Very hard to break down once the structure is set.",
    drawAcceptThreshold: 52,
    resignThreshold: 1400,
    taunts: {
      greeting: "You'll have to earn every inch 🧱",
      onCheck: "A direct question for your king.",
      onCapture: "Structure first, material second.",
      onBlunder: "That was beneath my standard.",
      onWin: "The wall never cracked 🧱",
      onLose: "Strong conversion. Well played 🤝",
      onDraw: "No weaknesses, no winner. Draw.",
      onDrawOffer: "A stable draw. Accepted.",
      onDrawDecline: "The position still has life.",
    },
  },
  {
    id: "endgame-emir",
    name: "Endgame Emir",
    avatar: "🎯",
    rating: 2150,
    difficulty: "expert",
    personality: "clinical",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    style: "Simplifies toward winning endings",
    bio: "Thrives once the board gets lighter and every tempo matters.",
    drawAcceptThreshold: 60,
    resignThreshold: 1000,
    taunts: {
      greeting: "If we trade pieces, I usually like my chances 🎯",
      onCheck: "A useful check, not a flashy one.",
      onCapture: "Reducing to something clean.",
      onBlunder: "Rare miss. Noted.",
      onWin: "Technique did the rest 🎯",
      onLose: "You outplayed the ending. Respect 🤝",
      onDraw: "Exact enough for a draw.",
      onDrawOffer: "The endgame is level. Draw accepted.",
      onDrawDecline: "I still think there's more to squeeze.",
    },
  },
  {
    id: "attack-anya",
    name: "Attack Anya",
    avatar: "🔥",
    rating: 2300,
    difficulty: "expert",
    personality: "aggressive",
    country: "Ukraine",
    countryFlag: "🇺🇦",
    style: "Initiative-heavy attacking play",
    bio: "If the king is even slightly airy, Anya will come for it.",
    drawAcceptThreshold: 62,
    resignThreshold: 900,
    taunts: {
      greeting: "Let's not make this a quiet game 🔥",
      onCheck: "Check — and more is coming.",
      onCapture: "Open lines. That's what I wanted.",
      onBlunder: "Too much fire, not enough control.",
      onWin: "Attack converted 🔥",
      onLose: "You defended everything. Impressive 🤝",
      onDraw: "The attack burned out. Draw.",
      onDrawOffer: "Fine — no breakthrough today.",
      onDrawDecline: "No draw. I still smell the king 🔥",
    },
  },
  {
    id: "gm-nova",
    name: "GM Nova",
    avatar: "🌌",
    rating: 2600,
    difficulty: "master",
    personality: "universal",
    country: "Argentina",
    countryFlag: "🇦🇷",
    style: "Universal grandmaster play",
    bio: "Comfortable in every phase, with very few weaknesses.",
    drawAcceptThreshold: 74,
    resignThreshold: 700,
    taunts: {
      greeting: "Let's see how long your position holds 🌌",
      onCheck: "A precise check.",
      onCapture: "Everything was calculated.",
      onBlunder: "A rare inaccuracy.",
      onWin: "Pressure became inevitability 🌌",
      onLose: "Excellent game. You deserved it 🤝",
      onDraw: "Accurate chess from both sides.",
      onDrawOffer: "Correct result. Draw accepted.",
      onDrawDecline: "I still have practical chances.",
    },
  },
  {
    id: "aleksej-pavlovic",
    name: "Aleksej Pavlović",
    avatar: "👑",
    rating: 3000,
    difficulty: "master",
    personality: "elite",
    country: "Serbia",
    countryFlag: "🇷🇸",
    style: "World #1 precision — universal and relentless",
    bio: "Serbian 3000-rated GM. The cleanest and toughest bot on the site.",
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
  beginner: "board-buddy-bella",
  intermediate: "tactic-tariq",
  advanced: "counter-carla",
  expert: "endgame-emir",
  master: "aleksej-pavlovic",
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
