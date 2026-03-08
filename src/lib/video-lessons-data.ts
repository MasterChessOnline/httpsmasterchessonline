export interface VideoLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  premium: boolean;
}

export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: "v1",
    title: "Opening Principles Every Player Must Know",
    description: "Master the fundamentals: center control, development, and king safety in the opening.",
    duration: "12:34",
    category: "openings",
    thumbnail: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "beginner",
    premium: false,
  },
  {
    id: "v2",
    title: "The Italian Game: A Complete Repertoire",
    description: "Deep dive into the Italian Game with analysis of key variations and typical plans.",
    duration: "28:15",
    category: "openings",
    thumbnail: "https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "intermediate",
    premium: true,
  },
  {
    id: "v3",
    title: "Endgame Mastery: King & Pawn vs King",
    description: "Essential endgame technique — opposition, key squares, and the rule of the square.",
    duration: "18:42",
    category: "endgames",
    thumbnail: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "beginner",
    premium: false,
  },
  {
    id: "v4",
    title: "Advanced Rook Endgames: Lucena & Philidor",
    description: "Critical rook endgame positions that separate club players from experts.",
    duration: "35:20",
    category: "endgames",
    thumbnail: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "advanced",
    premium: true,
  },
  {
    id: "v5",
    title: "Tactical Patterns: Pins, Forks & Skewers",
    description: "Recognize and exploit the most common tactical motifs in your games.",
    duration: "22:08",
    category: "tactics",
    thumbnail: "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "beginner",
    premium: false,
  },
  {
    id: "v6",
    title: "Sacrificial Attacks on the Kingside",
    description: "Learn the art of the sacrifice — Greek Gift, double bishop sacrifice, and Bxh7+.",
    duration: "41:55",
    category: "tactics",
    thumbnail: "https://images.unsplash.com/photo-1611195974226-a6a9be4a5c53?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "advanced",
    premium: true,
  },
  {
    id: "v7",
    title: "Positional Chess: Pawn Structures",
    description: "Understanding isolated, doubled, and backward pawns and how to play with or against them.",
    duration: "30:12",
    category: "strategy",
    thumbnail: "https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "intermediate",
    premium: true,
  },
  {
    id: "v8",
    title: "The Sicilian Defense: Najdorf Variation",
    description: "Complete guide to the most popular and sharp Sicilian line.",
    duration: "45:30",
    category: "openings",
    thumbnail: "https://images.unsplash.com/photo-1538340141413-b93b456a023f?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "advanced",
    premium: true,
  },
  {
    id: "v9",
    title: "Clock Management in Online Chess",
    description: "Time management techniques for blitz and rapid games.",
    duration: "15:45",
    category: "strategy",
    thumbnail: "https://images.unsplash.com/photo-1495548054858-0e78bb53e694?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    difficulty: "intermediate",
    premium: true,
  },
];
