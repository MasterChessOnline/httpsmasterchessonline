// ELO rating landing pages — long-tail SEO ("what is a 1500 elo rating")
export interface EloTier {
  rating: number;
  title: string;          // e.g. "Bronze", "Silver"
  percentile: string;     // e.g. "top 50%"
  category: string;       // "Beginner" | "Intermediate" | etc.
  description: string;
  benchmark: string;      // what they can do
  goal: string;           // path to next tier
  searchVolume: string;
}

export const ELO_TIERS: EloTier[] = [
  { rating: 600,  title: "Pawn",         percentile: "bottom 5%",  category: "Absolute Beginner",
    description: "A 600 ELO player has just learned the rules. They know how pieces move, what check is, and basic mate patterns like queen + king vs king. Most moves are reactive — defending whatever's attacked, capturing whatever they can.",
    benchmark: "Knows piece movement, basic checkmates with queen, and how to castle.",
    goal: "Solve 10 puzzles a day, learn the four-move checkmate defense, and play 3 slow games per week.",
    searchVolume: "8k/mo" },
  { rating: 800,  title: "Pawn",         percentile: "bottom 15%", category: "Beginner",
    description: "An 800 ELO player has played 50+ games and avoids one-move blunders most of the time. They know the basic opening principles (control center, develop minor pieces, castle) but rarely follow named opening theory.",
    benchmark: "Castles within first 10 moves, doesn't lose pieces in single-move tactics, knows how to mate with queen + rook.",
    goal: "Learn one solid opening for White and one for Black. Practice basic tactics: forks, pins, skewers.",
    searchVolume: "11k/mo" },
  { rating: 1000, title: "Pawn",         percentile: "bottom 30%", category: "Casual Player",
    description: "A 1000 ELO player has solid foundations. They spot most one-move tactics, avoid hanging pieces, and follow a basic opening repertoire. Tactical patterns like forks and pins are familiar but not yet automatic.",
    benchmark: "Recognizes the fork, pin, skewer, and discovered attack. Wins won endgames against beginners.",
    goal: "Study the 'Silman's Endgame Course' beginner section. Solve mate-in-2 puzzles daily.",
    searchVolume: "18k/mo" },
  { rating: 1200, title: "Knight",       percentile: "top 50%",    category: "Improving Club Player",
    description: "1200 ELO marks the average online rapid player. At this level, you understand opening principles, calculate 2-3 moves ahead, and recognize most basic tactical motifs. Endgame technique is still developing.",
    benchmark: "Plays a coherent opening, calculates short combinations, knows king + pawn vs king.",
    goal: "Build a real opening repertoire. Study annotated grandmaster games. Practice king + pawn endings until automatic.",
    searchVolume: "23k/mo" },
  { rating: 1400, title: "Knight",       percentile: "top 35%",    category: "Solid Club Player",
    description: "A 1400 player has clear strengths: opening preparation, tactical awareness, basic endgame technique. They can punish blunders by lower-rated opponents and hold their own against most casual players.",
    benchmark: "Plays 5-6 moves of theory in main lines, finds 2-move combinations, converts most winning endgames.",
    goal: "Play longer time controls (15+10 minimum). Analyze every loss. Study positional concepts: weak squares, outposts, pawn structure.",
    searchVolume: "16k/mo" },
  { rating: 1500, title: "Knight",       percentile: "top 25%",    category: "Strong Club Player",
    description: "1500 ELO is a genuine club-level rating. You know multiple openings, calculate 3-4 moves deep, and apply positional principles. Hanging pieces becomes rare. Tournament play is realistic.",
    benchmark: "Recognizes pawn structures, plays prophylaxis, calculates forced lines accurately.",
    goal: "Study one classical game per day with deep notes. Build a serious tournament repertoire. Master the rook endgame.",
    searchVolume: "14k/mo" },
  { rating: 1600, title: "Bishop",       percentile: "top 18%",    category: "Tournament Player",
    description: "1600 ELO is the gateway to serious tournament chess. You play with a plan, recognize key positional themes, and rarely lose to one-move tactics. Your weakness is calculation depth and endgame precision.",
    benchmark: "Holds own against 1800+ in some games, finds positional plans, calculates 4-5 moves.",
    goal: "Hire a coach or join an opening study group. Solve 25 tactics per day at correct difficulty. Study Capablanca's endgames.",
    searchVolume: "9k/mo" },
  { rating: 1800, title: "Bishop",       percentile: "top 8%",     category: "Class A / Strong Tournament Player",
    description: "1800 ELO (USCF Class A or FIDE near-Candidate Master) marks the threshold of strong amateur play. You understand the game deeply: opening transpositions, middlegame plans, technical endgames, and time management.",
    benchmark: "Recognizes most tactical motifs instantly, calculates 5+ moves with side variations, plays endgames technically.",
    goal: "Compete in classical tournaments. Study with a strong coach. Memorize 40+ moves of theory in your main openings.",
    searchVolume: "6k/mo" },
  { rating: 2000, title: "Rook",         percentile: "top 3%",     category: "Expert (USCF) / Strong CM Candidate",
    description: "2000 ELO is the top 3% of all players. USCF calls this 'Expert.' You can challenge titled players in single games and have a fully developed style. Improvement requires deep work, not just play.",
    benchmark: "Beats most untitled players in classical, draws or wins against IM/FM occasionally, knows opening theory deeply.",
    goal: "Aim for FM (2300 FIDE) by playing 30+ rated games per year. Study endgames with tablebases. Refine your worst opening.",
    searchVolume: "7k/mo" },
  { rating: 2200, title: "Queen",        percentile: "top 1%",     category: "FIDE Candidate Master / USCF Master",
    description: "2200 ELO earns titles: USCF National Master, FIDE Candidate Master. Less than 1% of all rated players reach this level. You play at near-professional strength in classical chess.",
    benchmark: "Earns CM title, beats Experts consistently, plays 60+ moves of theory in pet lines.",
    goal: "Earn FIDE Master norms. Compete internationally. Build a deep, original repertoire backed by computer prep.",
    searchVolume: "4k/mo" },
  { rating: 2400, title: "Queen",        percentile: "top 0.5%",   category: "International Master",
    description: "2400 FIDE earns the IM title. About 4,000 IMs in the world. At this level, you defeat amateurs effortlessly and battle GMs as equals on a good day. Chess is a serious second job, if not the first.",
    benchmark: "International Master title, three IM norms required, regular Open tournament prizes.",
    goal: "Earn GM norms (2500 performance in three norms-eligible events). Study opening novelties at engine depth.",
    searchVolume: "3k/mo" },
  { rating: 2500, title: "King",         percentile: "top 0.2%",   category: "Grandmaster",
    description: "2500 FIDE is the threshold for the Grandmaster title — the highest title FIDE awards. About 2,000 GMs in the world. Reaching GM is the dream of every serious player and a lifetime achievement.",
    benchmark: "Three GM norms (2600 performance), 2500 published rating, lifetime title.",
    goal: "Climb the world rankings. The next steps: 2600 (Super-GM territory), 2700 (world top 50), 2800 (legend status).",
    searchVolume: "5k/mo" },
];

export const getEloByRating = (r: number) => ELO_TIERS.find(t => t.rating === r);
