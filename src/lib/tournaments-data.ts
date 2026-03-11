export interface TournamentTrophy {
  place: 1 | 2 | 3;
  label: string;
  emoji: string;
}

export type TournamentFormat = "swiss" | "round-robin" | "single-elimination";

export interface Tournament {
  id: string;
  name: string;
  topic: string;
  description: string;
  timeControl: string;
  maxPlayers: number;
  currentPlayers: number;
  status: "live" | "registering" | "upcoming" | "completed";
  startDate: string;
  prize: string;
  category: "blitz" | "rapid" | "classical" | "themed";
  format: TournamentFormat;
  rounds: number;
  ratingRange?: string;
  trophies: TournamentTrophy[];
}

export const FORMAT_LABELS: Record<TournamentFormat, { label: string; description: string }> = {
  swiss: { label: "Swiss", description: "Players paired by score each round — everyone plays all rounds" },
  "round-robin": { label: "Round Robin", description: "Every player faces every other player once" },
  "single-elimination": { label: "Single Elimination", description: "Lose once and you're out — last player standing wins" },
};

const TOP3: TournamentTrophy[] = [
  { place: 1, label: "Gold Trophy", emoji: "🥇" },
  { place: 2, label: "Silver Trophy", emoji: "🥈" },
  { place: 3, label: "Bronze Trophy", emoji: "🥉" },
];

export const TOURNAMENTS: Tournament[] = [
  // === BLITZ — SWISS ===
  {
    id: "t1", name: "Daily Blitz Arena", topic: "Open Play",
    description: "Fast-paced 3+0 blitz. 7 rounds of Swiss pairings — climb as high as you can!",
    timeControl: "3+0", maxPlayers: 128, currentPlayers: 97, status: "live",
    startDate: "Today", prize: "Top 3 Trophies + Rating Points", category: "blitz",
    format: "swiss", rounds: 7, trophies: TOP3,
  },
  {
    id: "t2", name: "Bullet Brawl", topic: "Speed Chess",
    description: "1-minute madness over 7 rounds. Pure instinct and speed decide the champion.",
    timeControl: "1+0", maxPlayers: 256, currentPlayers: 213, status: "live",
    startDate: "Today", prize: "Top 3 Trophies + Rating Points", category: "blitz",
    format: "swiss", rounds: 7, trophies: TOP3,
  },
  {
    id: "t3", name: "Blitz Tactics Cup", topic: "Tactical Showdown",
    description: "3+2 blitz with 9 Swiss rounds. Sharp tactical play rewarded!",
    timeControl: "3+2", maxPlayers: 64, currentPlayers: 41, status: "registering",
    startDate: "Tomorrow", prize: "Top 3 Trophies + 1000 Rating", category: "blitz",
    format: "swiss", rounds: 9, trophies: TOP3,
  },
  {
    id: "t4", name: "Lightning Blitz Championship", topic: "Blitz Swiss",
    description: "5+3 blitz — 8 rounds of Swiss system with ELO-rated pairings.",
    timeControl: "5+3", maxPlayers: 128, currentPlayers: 0, status: "upcoming",
    startDate: "Mar 15", prize: "Top 3 Trophies + Rating Points", category: "blitz",
    format: "swiss", rounds: 8, trophies: TOP3,
  },
  {
    id: "t16", name: "Blitz Under 1400", topic: "Rating Restricted",
    description: "Blitz tournament for players rated under 1400. 7 Swiss rounds.",
    timeControl: "3+2", maxPlayers: 64, currentPlayers: 32, status: "registering",
    startDate: "Tomorrow", prize: "Top 3 Trophies", category: "blitz",
    format: "swiss", rounds: 7, ratingRange: "Under 1400", trophies: TOP3,
  },
  {
    id: "t17", name: "Blitz Open 1400-1800", topic: "Rating Restricted",
    description: "Competitive blitz for intermediate players. 8 Swiss rounds with increment.",
    timeControl: "5+2", maxPlayers: 64, currentPlayers: 48, status: "registering",
    startDate: "Saturday", prize: "Top 3 Trophies + Rating", category: "blitz",
    format: "swiss", rounds: 8, ratingRange: "1400–1800", trophies: TOP3,
  },
  {
    id: "t18", name: "Elite Blitz 1800+", topic: "Rating Restricted",
    description: "High-rated blitz showdown. 9 rounds of intense competition.",
    timeControl: "3+2", maxPlayers: 32, currentPlayers: 18, status: "registering",
    startDate: "Sunday", prize: "Top 3 Trophies + 1500 Rating", category: "blitz",
    format: "swiss", rounds: 9, ratingRange: "1800+", trophies: TOP3,
  },

  // === BLITZ — SINGLE ELIMINATION ===
  {
    id: "t21", name: "Blitz Knockout Cup", topic: "Elimination",
    description: "16-player single-elimination blitz bracket. One loss and you're out!",
    timeControl: "3+2", maxPlayers: 16, currentPlayers: 12, status: "registering",
    startDate: "Tomorrow", prize: "Top 3 Trophies + 1200 Rating", category: "blitz",
    format: "single-elimination", rounds: 4, trophies: TOP3,
  },
  {
    id: "t22", name: "Bullet Elimination Frenzy", topic: "Speed Knockout",
    description: "32-player bullet elimination. 5 rounds of pure survival — fastest fingers win.",
    timeControl: "1+0", maxPlayers: 32, currentPlayers: 28, status: "registering",
    startDate: "Saturday", prize: "Top 3 Trophies + 800 Rating", category: "blitz",
    format: "single-elimination", rounds: 5, trophies: TOP3,
  },

  // === BLITZ — ROUND ROBIN ===
  {
    id: "t23", name: "Blitz Round Robin Elite", topic: "Round Robin",
    description: "8-player round robin blitz. Play every opponent once — consistency is king.",
    timeControl: "5+3", maxPlayers: 8, currentPlayers: 6, status: "registering",
    startDate: "Sunday", prize: "Top 3 Trophies + 1500 Rating", category: "blitz",
    format: "round-robin", rounds: 7, ratingRange: "1600+", trophies: TOP3,
  },

  // === RAPID — SWISS ===
  {
    id: "t5", name: "Weekend Rapid Open", topic: "Open Rapid",
    description: "10+5 rapid over 9 Swiss rounds. Think deep and play strong.",
    timeControl: "10+5", maxPlayers: 256, currentPlayers: 184, status: "registering",
    startDate: "Saturday", prize: "Top 3 Trophies + 1500 Rating", category: "rapid",
    format: "swiss", rounds: 9, trophies: TOP3,
  },
  {
    id: "t6", name: "Rapid Royale", topic: "Swiss System",
    description: "15+10 rapid — 7 rounds of Swiss pairings with full rating tracking.",
    timeControl: "15+10", maxPlayers: 128, currentPlayers: 88, status: "registering",
    startDate: "Sunday", prize: "Top 3 Trophies + 2000 Rating", category: "rapid",
    format: "swiss", rounds: 7, trophies: TOP3,
  },
  {
    id: "t7", name: "Rapid Rising Stars", topic: "Under 1500",
    description: "Rapid tournament for players rated under 1500. 7 Swiss rounds.",
    timeControl: "10+0", maxPlayers: 64, currentPlayers: 52, status: "live",
    startDate: "Today", prize: "Top 3 Trophies + Rating", category: "rapid",
    format: "swiss", rounds: 7, ratingRange: "Under 1500", trophies: TOP3,
  },
  {
    id: "t8", name: "Rapid Champions League", topic: "Elite Rapid",
    description: "Top-rated 15+5 rapid. 9 rounds of elite competition for serious players.",
    timeControl: "15+5", maxPlayers: 32, currentPlayers: 0, status: "upcoming",
    startDate: "Mar 20", prize: "Top 3 Trophies + 3000 Rating", category: "rapid",
    format: "swiss", rounds: 9, ratingRange: "1600+", trophies: TOP3,
  },
  {
    id: "t19", name: "Rapid Under 1200", topic: "Rating Restricted",
    description: "Beginner-friendly rapid. 7 rounds to build confidence and earn trophies.",
    timeControl: "10+5", maxPlayers: 64, currentPlayers: 29, status: "registering",
    startDate: "Saturday", prize: "Top 3 Trophies", category: "rapid",
    format: "swiss", rounds: 7, ratingRange: "Under 1200", trophies: TOP3,
  },
  {
    id: "t20", name: "Rapid Grand Prix", topic: "Open Rapid",
    description: "15+10 rapid Grand Prix — 8 rounds. All ratings welcome.",
    timeControl: "15+10", maxPlayers: 128, currentPlayers: 67, status: "registering",
    startDate: "Next Saturday", prize: "Top 3 Trophies + 2500 Rating", category: "rapid",
    format: "swiss", rounds: 8, trophies: TOP3,
  },

  // === RAPID — SINGLE ELIMINATION ===
  {
    id: "t24", name: "Rapid Knockout Championship", topic: "Elimination",
    description: "32-player single-elimination rapid. Each match decides who advances — no second chances.",
    timeControl: "10+5", maxPlayers: 32, currentPlayers: 24, status: "registering",
    startDate: "Next Sunday", prize: "Top 3 Trophies + 2000 Rating", category: "rapid",
    format: "single-elimination", rounds: 5, trophies: TOP3,
  },

  // === RAPID — ROUND ROBIN ===
  {
    id: "t25", name: "Rapid Round Robin Masters", topic: "Round Robin",
    description: "6-player rapid round robin. Face every opponent — the most complete player wins.",
    timeControl: "15+10", maxPlayers: 6, currentPlayers: 4, status: "registering",
    startDate: "Mar 16", prize: "Top 3 Trophies + 2500 Rating", category: "rapid",
    format: "round-robin", rounds: 5, ratingRange: "1500+", trophies: TOP3,
  },

  // === CLASSICAL — SWISS ===
  {
    id: "t9", name: "Monthly Classical", topic: "Classical Chess",
    description: "30+15 classical over 7 Swiss rounds. Deep thinking rewarded.",
    timeControl: "30+15", maxPlayers: 64, currentPlayers: 38, status: "registering",
    startDate: "Mar 12", prize: "Top 3 Trophies + 2500 Rating", category: "classical",
    format: "swiss", rounds: 7, trophies: TOP3,
  },
  {
    id: "t10", name: "Grand Classical Open", topic: "Long Format",
    description: "45+30 classical — 7 rounds for those who love deep analysis.",
    timeControl: "45+30", maxPlayers: 32, currentPlayers: 0, status: "upcoming",
    startDate: "Mar 25", prize: "Top 3 Trophies + 5000 Rating", category: "classical",
    format: "swiss", rounds: 7, trophies: TOP3,
  },

  // === CLASSICAL — ROUND ROBIN ===
  {
    id: "t26", name: "Classical Round Robin Invitational", topic: "Round Robin",
    description: "4-player classical round robin. Every game matters in this intimate competition.",
    timeControl: "30+15", maxPlayers: 4, currentPlayers: 3, status: "registering",
    startDate: "Mar 18", prize: "Top 3 Trophies + 3000 Rating", category: "classical",
    format: "round-robin", rounds: 3, ratingRange: "1700+", trophies: TOP3,
  },

  // === THEMED — SWISS ===
  {
    id: "t11", name: "King's Indian Attack", topic: "Opening Theme",
    description: "All games start from the KIA position. 7 Swiss rounds.",
    timeControl: "5+3", maxPlayers: 64, currentPlayers: 45, status: "registering",
    startDate: "Tomorrow", prize: "Top 3 Trophies", category: "themed",
    format: "swiss", rounds: 7, trophies: TOP3,
  },
  {
    id: "t12", name: "Sicilian Showdown", topic: "Sicilian Defense",
    description: "Every game begins with 1.e4 c5. 9 rounds of Sicilian mastery!",
    timeControl: "5+3", maxPlayers: 128, currentPlayers: 92, status: "live",
    startDate: "Today", prize: "Top 3 Trophies + 800 Rating", category: "themed",
    format: "swiss", rounds: 9, trophies: TOP3,
  },
  {
    id: "t13", name: "Endgame Masters", topic: "Endgame Only",
    description: "Games start from famous endgame positions. 7 Swiss rounds.",
    timeControl: "10+5", maxPlayers: 64, currentPlayers: 28, status: "registering",
    startDate: "Mar 14", prize: "Top 3 Trophies + 1000 Rating", category: "themed",
    format: "swiss", rounds: 7, trophies: TOP3,
  },
  {
    id: "t14", name: "Ruy Lopez Festival", topic: "Ruy Lopez",
    description: "Classic Ruy Lopez opening. 7 Swiss rounds of timeless chess.",
    timeControl: "10+5", maxPlayers: 64, currentPlayers: 0, status: "upcoming",
    startDate: "Mar 18", prize: "Top 3 Trophies", category: "themed",
    format: "swiss", rounds: 7, trophies: TOP3,
  },
  {
    id: "t15", name: "Queen's Gambit Cup", topic: "Queen's Gambit",
    description: "1.d4 d5 2.c4 — Accept or decline? 8 Swiss rounds to prove your skill.",
    timeControl: "10+5", maxPlayers: 128, currentPlayers: 0, status: "upcoming",
    startDate: "Mar 22", prize: "Top 3 Trophies + 1200 Rating", category: "themed",
    format: "swiss", rounds: 8, trophies: TOP3,
  },

  // === THEMED — SINGLE ELIMINATION ===
  {
    id: "t27", name: "Sicilian Knockout", topic: "Sicilian Defense",
    description: "Single-elimination Sicilian Defense bracket. 16 players, one champion.",
    timeControl: "5+3", maxPlayers: 16, currentPlayers: 14, status: "registering",
    startDate: "Mar 15", prize: "Top 3 Trophies + 1000 Rating", category: "themed",
    format: "single-elimination", rounds: 4, trophies: TOP3,
  },
];
