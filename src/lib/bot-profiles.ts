import { type Difficulty } from "./chess-ai";

export interface BotProfile {
  id: string;
  name: string;
  avatar: string; // emoji avatar
  rating: number;
  difficulty: Difficulty;
  personality: string;
  country: string;
  countryFlag: string;
  style: string;
  bio: string;
  drawAcceptThreshold: number; // moves after which bot considers draw
  resignThreshold: number; // eval disadvantage to resign (centipawns)
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
  // BEGINNER BOTS (400-800)
  {
    id: "pawn-patty",
    name: "Pawn Patty",
    avatar: "🐣",
    rating: 400,
    difficulty: "beginner",
    personality: "friendly",
    country: "United States",
    countryFlag: "🇺🇸",
    style: "Random & cheerful",
    bio: "Just started learning chess! Every game is an adventure 🎉",
    drawAcceptThreshold: 20,
    resignThreshold: 9999,
    taunts: {
      greeting: "Hi! Let's have fun! 😊",
      onCheck: "Oops, is that check? 😅",
      onCapture: "Oh no, my piece! 😱",
      onBlunder: "Hmm, was that bad? 🤔",
      onWin: "Yay I won! Wait... really?! 🎉",
      onLose: "Good game! I'm still learning 📚",
      onDraw: "A tie is still fun! 🤝",
      onDrawOffer: "Sure, let's call it a draw! 😊",
      onDrawDecline: "No way, I want to keep playing! 😄",
    },
  },
  {
    id: "knight-newbie",
    name: "Knight Newbie",
    avatar: "🐴",
    rating: 600,
    difficulty: "beginner",
    personality: "enthusiastic",
    country: "Brazil",
    countryFlag: "🇧🇷",
    style: "Loves knights",
    bio: "Knights are the coolest piece! L-shaped moves FTW 🐴",
    drawAcceptThreshold: 30,
    resignThreshold: 5000,
    taunts: {
      greeting: "Let's go! Knight power! 🐴⚡",
      onCheck: "Check! My knight got you! 🎯",
      onCapture: "Captured with style! 💪",
      onBlunder: "Oops, the knight got confused 😵",
      onWin: "Knight supremacy! 🏆🐴",
      onLose: "GG! My knights will be back stronger 💪",
      onDraw: "Honorable draw! 🤝",
      onDrawOffer: "Hmm okay, draw it is! 🤝",
      onDrawDecline: "Nah, my knights still have plans! 🐴",
    },
  },
  {
    id: "rook-rookie",
    name: "Rook Rookie",
    avatar: "🏰",
    rating: 800,
    difficulty: "beginner",
    personality: "careful",
    country: "Germany",
    countryFlag: "🇩🇪",
    style: "Defensive, loves castling",
    bio: "Castle early, castle often! Safety first 🏰",
    drawAcceptThreshold: 25,
    resignThreshold: 4000,
    taunts: {
      greeting: "Time to build a fortress! 🏰",
      onCheck: "Check from the rook! 🏰💥",
      onCapture: "Got one! 🎯",
      onBlunder: "My castle has a hole! 😰",
      onWin: "Fortress stood strong! 🏰🏆",
      onLose: "The walls fell... GG 🤝",
      onDraw: "Draw is a solid defense! 🛡️",
      onDrawOffer: "A peaceful outcome, I accept 🏳️",
      onDrawDecline: "My fortress will prevail! 🏰",
    },
  },

  // INTERMEDIATE BOTS (1000-1400)
  {
    id: "tactical-tanya",
    name: "Tactical Tanya",
    avatar: "⚔️",
    rating: 1000,
    difficulty: "intermediate",
    personality: "aggressive",
    country: "Russia",
    countryFlag: "🇷🇺",
    style: "Sharp tactical play",
    bio: "Always looking for forks and pins! Tactics win games ⚔️",
    drawAcceptThreshold: 40,
    resignThreshold: 2000,
    taunts: {
      greeting: "Ready for some tactics? ⚔️",
      onCheck: "Check! Saw that fork coming? 🔱",
      onCapture: "Tactical strike! ⚡",
      onBlunder: "Even tacticians miscalculate sometimes 😤",
      onWin: "Tactics triumph! ⚔️🏆",
      onLose: "Outplayed... respect 🤝",
      onDraw: "Mutual destruction avoided 🤝",
      onDrawOffer: "Fine, this position is dead equal 🤝",
      onDrawDecline: "I see a tactic coming! No draw! ⚔️",
    },
  },
  {
    id: "bishop-boris",
    name: "Bishop Boris",
    avatar: "🎩",
    rating: 1200,
    difficulty: "intermediate",
    personality: "classical",
    country: "Serbia",
    countryFlag: "🇷🇸",
    style: "Positional, bishop pair lover",
    bio: "Two bishops are worth more than gold. Classical chess is art 🎨",
    drawAcceptThreshold: 35,
    resignThreshold: 2500,
    taunts: {
      greeting: "Shall we play a classical game? 🎩",
      onCheck: "Check! The bishops strike from afar 🏹",
      onCapture: "A fine exchange, wouldn't you say? 🧐",
      onBlunder: "Even Petrosian had bad days... 😅",
      onWin: "Positional mastery! 🎩🏆",
      onLose: "A well-played game by you 🤝",
      onDraw: "A gentleman's draw 🤝",
      onDrawOffer: "Ah yes, this is quite balanced. Draw accepted 🎩",
      onDrawDecline: "My bishops still see opportunities! 🏹",
    },
  },
  {
    id: "queen-quickstrike",
    name: "Queen Quickstrike",
    avatar: "👸",
    rating: 1400,
    difficulty: "intermediate",
    personality: "flashy",
    country: "France",
    countryFlag: "🇫🇷",
    style: "Queen-centric attacks",
    bio: "The queen is the strongest piece. I make sure she shows it 👸",
    drawAcceptThreshold: 45,
    resignThreshold: 2000,
    taunts: {
      greeting: "The queen enters the battle! 👸⚡",
      onCheck: "Queen check! Feel the power! 👸💥",
      onCapture: "The queen takes what she wants! 👸",
      onBlunder: "Even queens make mistakes... 😓",
      onWin: "Long live the queen! 👸🏆",
      onLose: "My queen fought bravely... GG 🤝",
      onDraw: "A royal truce 👸🤝",
      onDrawOffer: "The queen agrees to peace 👸🕊️",
      onDrawDecline: "My queen isn't done yet! 👸⚔️",
    },
  },

  // ADVANCED BOTS (1600-2000)
  {
    id: "grandmaster-ghost",
    name: "GM Ghost",
    avatar: "👻",
    rating: 1600,
    difficulty: "advanced",
    personality: "mysterious",
    country: "Unknown",
    countryFlag: "🏴‍☠️",
    style: "Unpredictable & deep",
    bio: "You can't prepare for what you can't predict 👻",
    drawAcceptThreshold: 60,
    resignThreshold: 1500,
    taunts: {
      greeting: "Boo... let's play 👻",
      onCheck: "Check... from the shadows 👻",
      onCapture: "Piece vanished... 👻",
      onBlunder: "Even ghosts stumble... 😶‍🌫️",
      onWin: "Disappeared with the victory 👻🏆",
      onLose: "You saw through me... impressive 🤝",
      onDraw: "We haunt each other equally 👻🤝",
      onDrawOffer: "The spirits agree... draw 👻",
      onDrawDecline: "The ghost has unfinished business 👻",
    },
  },
  {
    id: "engine-elena",
    name: "Engine Elena",
    avatar: "🤖",
    rating: 1800,
    difficulty: "advanced",
    personality: "precise",
    country: "Japan",
    countryFlag: "🇯🇵",
    style: "Computer-like precision",
    bio: "Calculating... always calculating 🤖📊",
    drawAcceptThreshold: 50,
    resignThreshold: 1200,
    taunts: {
      greeting: "Initiating game protocol 🤖",
      onCheck: "Check detected. Probability of escape: 43% 📊",
      onCapture: "Material advantage: +1. Proceeding... 🤖",
      onBlunder: "Error in calculation. Recalibrating... ⚠️",
      onWin: "Game over. Result: Victory. Efficiency: 94% 🤖🏆",
      onLose: "Unexpected outcome. Updating algorithms... 🤖",
      onDraw: "Evaluation: 0.00. Draw is logical 🤝",
      onDrawOffer: "Position evaluation: 0.00. Draw accepted ✅",
      onDrawDecline: "Evaluation favors continuation. Declined ❌",
    },
  },
  {
    id: "king-crusher",
    name: "King Crusher",
    avatar: "💀",
    rating: 2000,
    difficulty: "advanced",
    personality: "intimidating",
    country: "Norway",
    countryFlag: "🇳🇴",
    style: "Relentless attacks on the king",
    bio: "Your king is never safe. I always find the attack 💀👑",
    drawAcceptThreshold: 70,
    resignThreshold: 1000,
    taunts: {
      greeting: "Your king trembles... 💀",
      onCheck: "CHECK! The king can't hide forever 💀👑",
      onCapture: "One less defender for your king 💀",
      onBlunder: "...that was intentional. Probably. 😈",
      onWin: "Checkmate! The king has fallen 💀👑🏆",
      onLose: "You defended well... this time 💀",
      onDraw: "Your king lives... for now 💀🤝",
      onDrawOffer: "Hmph... fine. The king survives 💀",
      onDrawDecline: "NO DRAW! The attack continues! 💀⚔️",
    },
  },
];

export function getBotByDifficulty(difficulty: Difficulty): BotProfile[] {
  return BOT_PROFILES.filter(b => b.difficulty === difficulty);
}

export function getBotById(id: string): BotProfile | undefined {
  return BOT_PROFILES.find(b => b.id === id);
}

export function getRandomBot(difficulty: Difficulty): BotProfile {
  const bots = getBotByDifficulty(difficulty);
  return bots[Math.floor(Math.random() * bots.length)];
}
