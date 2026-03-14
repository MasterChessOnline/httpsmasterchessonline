export interface MarketplaceLesson {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  coach: string;
  coachTitle: string;
  duration: string;
  price: number;
  priceId: string;
  level: "beginner" | "intermediate" | "advanced";
  topics: string[];
  icon: string;
}

export const MARKETPLACE_LESSONS: MarketplaceLesson[] = [
  {
    id: "opening-mastery",
    title: "Opening Mastery",
    description: "Master opening fundamentals, repertoire building, and strategic plans.",
    longDescription:
      "In this private 1-on-1 session you'll work with DailyChess_12 to build a solid opening repertoire tailored to your style. We cover key principles, common traps, and how to transition into favorable middle-game positions.",
    coach: "DailyChess_12",
    coachTitle: "FIDE-Rated Coach",
    duration: "1 Hour",
    price: 19.99,
    priceId: "price_1TB0eyFlIJYoBTqwLhtcf8aq",
    level: "intermediate",
    topics: ["Opening principles", "Repertoire building", "Pawn structures", "Transpositions"],
    icon: "book-open",
  },
  {
    id: "tactical-training",
    title: "Tactical Training",
    description: "Sharpen your tactical skills — forks, pins, sacrifices, and combinations.",
    longDescription:
      "Take your pattern recognition to the next level. This session focuses on spotting tactical motifs in real game positions, calculating forced sequences, and converting advantages with precision.",
    coach: "DailyChess_12",
    coachTitle: "FIDE-Rated Coach",
    duration: "1 Hour",
    price: 19.99,
    priceId: "price_1TB0fKFlIJYoBTqw0rsBfzaa",
    level: "intermediate",
    topics: ["Forks & pins", "Discovered attacks", "Sacrifices", "Combination patterns"],
    icon: "swords",
  },
  {
    id: "endgame-mastery",
    title: "Endgame Mastery",
    description: "Master endgame theory — king & pawn, rook endings, and practical technique.",
    longDescription:
      "Endgames decide tournaments. Learn essential theoretical positions, practical techniques for converting advantages, and the art of defending difficult endings with confidence.",
    coach: "DailyChess_12",
    coachTitle: "FIDE-Rated Coach",
    duration: "1 Hour",
    price: 19.99,
    priceId: "price_1TB0fdFlIJYoBTqwy3NALptR",
    level: "advanced",
    topics: ["King & pawn endings", "Rook endings", "Opposition & triangulation", "Practical technique"],
    icon: "target",
  },
];
