export interface TournamentTrophy {
  place: 1 | 2 | 3;
  label: string;
  emoji: string;
}

export type TournamentFormat = "swiss" | "round-robin" | "single-elimination";
export type TournamentAccess = "free" | "premium" | "vip";
export type TournamentSchedule = "daily" | "weekly" | "monthly" | "special";

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
  access: TournamentAccess;
  schedule: TournamentSchedule;
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
  // ============ FREE DAILY TOURNAMENTS ============
  {
    id: "fd1", name: "Daily Blitz Arena", topic: "Open Play",
    description: "Free daily 3+0 blitz. 7 rounds of Swiss — open to everyone!",
    timeControl: "3+0", maxPlayers: 256, currentPlayers: 142, status: "live",
    startDate: "Today 12:00", prize: "Top 3 Trophies + Rating Points", category: "blitz",
    format: "swiss", rounds: 7, trophies: TOP3, access: "free", schedule: "daily",
  },
  {
    id: "fd2", name: "Daily Rapid Challenge", topic: "Open Rapid",
    description: "Free daily 10+5 rapid. 5 rounds — perfect for the lunch break.",
    timeControl: "10+5", maxPlayers: 128, currentPlayers: 87, status: "live",
    startDate: "Today 14:00", prize: "Top 3 Trophies + Rating Points", category: "rapid",
    format: "swiss", rounds: 5, trophies: TOP3, access: "free", schedule: "daily",
  },
  {
    id: "fd3", name: "Daily Bullet Brawl", topic: "Speed Chess",
    description: "Free daily 1-minute madness. 7 rounds — pure instinct and speed.",
    timeControl: "1+0", maxPlayers: 256, currentPlayers: 213, status: "live",
    startDate: "Today 18:00", prize: "Top 3 Trophies + Rating Points", category: "blitz",
    format: "swiss", rounds: 7, trophies: TOP3, access: "free", schedule: "daily",
  },
  {
    id: "fd4", name: "Daily Evening Blitz", topic: "Open Play",
    description: "5+3 blitz to wind down your day. Free for all players.",
    timeControl: "5+3", maxPlayers: 128, currentPlayers: 0, status: "upcoming",
    startDate: "Today 20:00", prize: "Top 3 Trophies", category: "blitz",
    format: "swiss", rounds: 7, trophies: TOP3, access: "free", schedule: "daily",
  },

  // ============ FREE WEEKLY TOURNAMENTS ============
  {
    id: "fw1", name: "Weekend Rapid Open", topic: "Weekly Feature",
    description: "Free weekly 10+5 rapid over 9 Swiss rounds. The biggest free tournament of the week!",
    timeControl: "10+5", maxPlayers: 512, currentPlayers: 347, status: "registering",
    startDate: "Saturday 10:00", prize: "Top 3 Trophies + 1500 Rating", category: "rapid",
    format: "swiss", rounds: 9, trophies: TOP3, access: "free", schedule: "weekly",
  },
  {
    id: "fw2", name: "Sunday Blitz Marathon", topic: "Weekly Blitz",
    description: "Free weekly 3+2 blitz marathon. 11 rounds — endurance is key!",
    timeControl: "3+2", maxPlayers: 256, currentPlayers: 189, status: "registering",
    startDate: "Sunday 14:00", prize: "Top 3 Trophies + 1000 Rating", category: "blitz",
    format: "swiss", rounds: 11, trophies: TOP3, access: "free", schedule: "weekly",
  },
  {
    id: "fw3", name: "Weekly Knockout Cup", topic: "Elimination",
    description: "Free weekly 32-player single-elimination. One loss and you're out!",
    timeControl: "5+3", maxPlayers: 32, currentPlayers: 24, status: "registering",
    startDate: "Saturday 16:00", prize: "Top 3 Trophies + 1200 Rating", category: "blitz",
    format: "single-elimination", rounds: 5, trophies: TOP3, access: "free", schedule: "weekly",
  },
  {
    id: "fw4", name: "Weekly Themed: Sicilian Showdown", topic: "Sicilian Defense",
    description: "Free weekly themed tournament. Every game begins with 1.e4 c5!",
    timeControl: "5+3", maxPlayers: 128, currentPlayers: 92, status: "live",
    startDate: "Today", prize: "Top 3 Trophies + 800 Rating", category: "themed",
    format: "swiss", rounds: 9, trophies: TOP3, access: "free", schedule: "weekly",
  },
  {
    id: "fw5", name: "Weekly Under 1400 Rapid", topic: "Rating Restricted",
    description: "Free weekly rapid for players under 1400. A friendly competition!",
    timeControl: "10+5", maxPlayers: 64, currentPlayers: 38, status: "registering",
    startDate: "Saturday 12:00", prize: "Top 3 Trophies", category: "rapid",
    format: "swiss", rounds: 7, ratingRange: "Under 1400", trophies: TOP3, access: "free", schedule: "weekly",
  },

  // ============ FREE OPEN (SPECIAL/MONTHLY) ============
  {
    id: "fo1", name: "Blitz Tactics Cup", topic: "Tactical Showdown",
    description: "Free open 3+2 blitz with 9 Swiss rounds. Sharp tactical play rewarded!",
    timeControl: "3+2", maxPlayers: 64, currentPlayers: 41, status: "registering",
    startDate: "Tomorrow", prize: "Top 3 Trophies + 1000 Rating", category: "blitz",
    format: "swiss", rounds: 9, trophies: TOP3, access: "free", schedule: "special",
  },
  {
    id: "fo2", name: "Monthly Classical", topic: "Classical Chess",
    description: "Free monthly 30+15 classical over 7 Swiss rounds. Deep thinking rewarded.",
    timeControl: "30+15", maxPlayers: 64, currentPlayers: 38, status: "registering",
    startDate: "Mar 20", prize: "Top 3 Trophies + 2500 Rating", category: "classical",
    format: "swiss", rounds: 7, trophies: TOP3, access: "free", schedule: "monthly",
  },
  {
    id: "fo3", name: "King's Indian Attack", topic: "Opening Theme",
    description: "Free themed: All games start from the KIA position. 7 Swiss rounds.",
    timeControl: "5+3", maxPlayers: 64, currentPlayers: 45, status: "registering",
    startDate: "Tomorrow", prize: "Top 3 Trophies", category: "themed",
    format: "swiss", rounds: 7, trophies: TOP3, access: "free", schedule: "special",
  },
  {
    id: "fo4", name: "Endgame Masters", topic: "Endgame Only",
    description: "Free themed: Games start from famous endgame positions. 7 Swiss rounds.",
    timeControl: "10+5", maxPlayers: 64, currentPlayers: 28, status: "registering",
    startDate: "Mar 14", prize: "Top 3 Trophies + 1000 Rating", category: "themed",
    format: "swiss", rounds: 7, trophies: TOP3, access: "free", schedule: "special",
  },
  {
    id: "fo5", name: "Rapid Rising Stars", topic: "Under 1500",
    description: "Free rapid for players under 1500. 7 Swiss rounds.",
    timeControl: "10+0", maxPlayers: 64, currentPlayers: 52, status: "live",
    startDate: "Today", prize: "Top 3 Trophies + Rating", category: "rapid",
    format: "swiss", rounds: 7, ratingRange: "Under 1500", trophies: TOP3, access: "free", schedule: "special",
  },

  // ============ PREMIUM EXCLUSIVE ============
  {
    id: "pe1", name: "Premium Rapid Cup", topic: "Premium Exclusive",
    description: "Exclusive 10+5 rapid for Premium members. ELO tracking + special badges.",
    timeControl: "10+5", maxPlayers: 32, currentPlayers: 18, status: "registering",
    startDate: "Saturday 11:00", prize: "Premium Badge + 1500 Rating", category: "rapid",
    format: "swiss", rounds: 7, trophies: TOP3, access: "premium", schedule: "weekly",
  },
  {
    id: "pe2", name: "Premium Blitz Arena", topic: "Premium Exclusive",
    description: "Members-only 3+2 blitz arena. Advanced analytics after each game.",
    timeControl: "3+2", maxPlayers: 16, currentPlayers: 12, status: "registering",
    startDate: "Sunday 15:00", prize: "Pro Trophy + Analytics Report", category: "blitz",
    format: "swiss", rounds: 9, trophies: TOP3, access: "premium", schedule: "weekly",
  },
  {
    id: "pe3", name: "Premium Classical Invitational", topic: "Premium Exclusive",
    description: "Monthly classical tournament for Premium members. Deep preparation rewarded.",
    timeControl: "15+10", maxPlayers: 16, currentPlayers: 8, status: "registering",
    startDate: "Mar 22", prize: "Exclusive Trophy + 2000 Rating", category: "classical",
    format: "round-robin", rounds: 7, trophies: TOP3, access: "premium", schedule: "monthly",
  },
  {
    id: "pe4", name: "Premium Themed: Queen's Gambit", topic: "Queen's Gambit",
    description: "Premium-only themed tournament. 1.d4 d5 2.c4 — Accept or decline?",
    timeControl: "10+5", maxPlayers: 32, currentPlayers: 0, status: "upcoming",
    startDate: "Mar 25", prize: "Premium Collectible + 1200 Rating", category: "themed",
    format: "swiss", rounds: 8, trophies: TOP3, access: "premium", schedule: "special",
  },

  // ============ VIP & GRANDMASTER ============
  {
    id: "vip1", name: "VIP Blitz Championship", topic: "VIP Exclusive",
    description: "Elite-only 5+3 blitz with premium rewards and exclusive collectibles.",
    timeControl: "5+3", maxPlayers: 16, currentPlayers: 10, status: "registering",
    startDate: "Saturday 18:00", prize: "Exclusive Collectibles + 2000 Rating", category: "blitz",
    format: "swiss", rounds: 9, trophies: TOP3, access: "vip", schedule: "weekly",
  },
  {
    id: "vip2", name: "VIP Rapid Masters", topic: "VIP Exclusive",
    description: "Elite rapid tournament with the best players. 8-player round robin.",
    timeControl: "15+10", maxPlayers: 8, currentPlayers: 6, status: "registering",
    startDate: "Sunday 16:00", prize: "VIP Trophy + 3000 Rating", category: "rapid",
    format: "round-robin", rounds: 7, ratingRange: "1600+", trophies: TOP3, access: "vip", schedule: "weekly",
  },
  {
    id: "vip3", name: "Grandmaster Invitational", topic: "GM Only",
    description: "Private rapid tournament for Grandmaster tier members with legendary trophies.",
    timeControl: "10+5", maxPlayers: 8, currentPlayers: 3, status: "upcoming",
    startDate: "Mar 30", prize: "Legendary Trophies + 5000 Rating", category: "rapid",
    format: "round-robin", rounds: 7, trophies: TOP3, access: "vip", schedule: "monthly",
  },
];
