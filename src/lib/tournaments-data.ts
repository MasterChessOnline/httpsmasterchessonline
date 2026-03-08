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
}

export const TOURNAMENTS: Tournament[] = [
  // Blitz
  { id: "t1", name: "Daily Blitz Arena", topic: "Open Play", description: "Fast-paced 3-minute games. Highest score wins!", timeControl: "3+0", maxPlayers: 128, currentPlayers: 97, status: "live", startDate: "Today", prize: "500 Rating Points", category: "blitz" },
  { id: "t2", name: "Bullet Brawl", topic: "Speed Chess", description: "1-minute madness. Pure instinct and speed.", timeControl: "1+0", maxPlayers: 256, currentPlayers: 213, status: "live", startDate: "Today", prize: "750 Rating Points", category: "blitz" },
  { id: "t3", name: "Blitz Tactics Cup", topic: "Tactical Showdown", description: "Blitz games focused on sharp tactical positions.", timeControl: "3+2", maxPlayers: 64, currentPlayers: 41, status: "registering", startDate: "Tomorrow", prize: "1000 Rating Points", category: "blitz" },
  { id: "t4", name: "Lightning Round", topic: "Hyperbullet", description: "30-second games for the bravest players.", timeControl: "0.5+0", maxPlayers: 128, currentPlayers: 0, status: "upcoming", startDate: "Mar 15", prize: "500 Rating Points", category: "blitz" },

  // Rapid
  { id: "t5", name: "Weekend Rapid Open", topic: "Open Rapid", description: "10-minute games with 5-second increment. Think and play.", timeControl: "10+5", maxPlayers: 256, currentPlayers: 184, status: "registering", startDate: "Saturday", prize: "1500 Rating Points", category: "rapid" },
  { id: "t6", name: "Rapid Royale", topic: "Swiss System", description: "7-round Swiss format rapid tournament.", timeControl: "15+10", maxPlayers: 128, currentPlayers: 88, status: "registering", startDate: "Sunday", prize: "2000 Rating Points", category: "rapid" },
  { id: "t7", name: "Rapid Rising Stars", topic: "Under 1500", description: "Rapid tournament for players rated under 1500.", timeControl: "10+0", maxPlayers: 64, currentPlayers: 52, status: "live", startDate: "Today", prize: "800 Rating Points", category: "rapid" },
  { id: "t8", name: "Rapid Champions League", topic: "Elite Rapid", description: "Top-rated players compete in rapid format.", timeControl: "15+5", maxPlayers: 32, currentPlayers: 0, status: "upcoming", startDate: "Mar 20", prize: "3000 Rating Points", category: "rapid" },

  // Classical
  { id: "t9", name: "Monthly Classical", topic: "Classical Chess", description: "30-minute games with 15-second increment. Deep thinking.", timeControl: "30+15", maxPlayers: 64, currentPlayers: 38, status: "registering", startDate: "Mar 12", prize: "2500 Rating Points", category: "classical" },
  { id: "t10", name: "Grand Classical Open", topic: "Long Format", description: "45-minute games. For those who love deep analysis.", timeControl: "45+30", maxPlayers: 32, currentPlayers: 0, status: "upcoming", startDate: "Mar 25", prize: "5000 Rating Points", category: "classical" },

  // Themed
  { id: "t11", name: "King's Indian Attack", topic: "Opening Theme", description: "All games start from the King's Indian Attack position.", timeControl: "5+3", maxPlayers: 64, currentPlayers: 45, status: "registering", startDate: "Tomorrow", prize: "600 Rating Points", category: "themed" },
  { id: "t12", name: "Sicilian Showdown", topic: "Sicilian Defense", description: "Every game begins with 1.e4 c5. Master the Sicilian!", timeControl: "5+3", maxPlayers: 128, currentPlayers: 92, status: "live", startDate: "Today", prize: "800 Rating Points", category: "themed" },
  { id: "t13", name: "Endgame Masters", topic: "Endgame Only", description: "Games start from famous endgame positions.", timeControl: "10+5", maxPlayers: 64, currentPlayers: 28, status: "registering", startDate: "Mar 14", prize: "1000 Rating Points", category: "themed" },
  { id: "t14", name: "Ruy Lopez Festival", topic: "Ruy Lopez", description: "All games begin from the Ruy Lopez. Classic chess!", timeControl: "10+5", maxPlayers: 64, currentPlayers: 0, status: "upcoming", startDate: "Mar 18", prize: "800 Rating Points", category: "themed" },
  { id: "t15", name: "Queen's Gambit Cup", topic: "Queen's Gambit", description: "1.d4 d5 2.c4 — Will you accept or decline?", timeControl: "10+5", maxPlayers: 128, currentPlayers: 0, status: "upcoming", startDate: "Mar 22", prize: "1200 Rating Points", category: "themed" },
];
