// Public roadmap + changelog content. Feature keys are stored in
// public.feature_votes (one vote per user per key).

export type RoadmapStatus = "planned" | "in_progress" | "released";

export interface RoadmapItem {
  key: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  eta?: string;
}

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    key: "mobile-app",
    title: "Native mobile app",
    description: "Full MasterChess in your pocket with offline puzzles and push game invites.",
    status: "planned",
    eta: "Q4 2026",
  },
  {
    key: "voice-lessons",
    title: "Voice-guided lessons",
    description: "Nikola talks you through each lesson move instead of plain text hints.",
    status: "planned",
  },
  {
    key: "clan-wars",
    title: "Clan Wars season",
    description: "Weekly clan-vs-clan team battles with a live season ladder and trophies.",
    status: "in_progress",
    eta: "Next season",
  },
  {
    key: "swiss-private",
    title: "Private Swiss tournaments",
    description: "Create invite-only Swiss events for your club with automatic pairings.",
    status: "in_progress",
  },
  {
    key: "vertical-clips",
    title: "Vertical game clips",
    description: "Auto-generate 9:16 clips of your best moves for TikTok and Shorts.",
    status: "planned",
  },
  {
    key: "coach-marketplace",
    title: "Coach marketplace",
    description: "Book verified coaches, pay in-app and study together on a shared board.",
    status: "planned",
  },
  {
    key: "puzzle-rush",
    title: "Puzzle Rush mode",
    description: "Three-minute puzzle sprint with a global daily leaderboard.",
    status: "planned",
  },
  {
    key: "board-editor",
    title: "Custom board editor",
    description: "Build your own board theme and share it as a preset with friends.",
    status: "released",
  },
];

export interface ChangelogEntry {
  date: string; // ISO date
  version: string;
  items: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-08-01",
    version: "Roadmap & Community",
    items: [
      "Public roadmap with feature voting.",
      "Discord community hub page.",
      "Floating Play Now button and email capture for new visitors.",
    ],
  },
  {
    date: "2026-07-25",
    version: "Retention pack",
    items: [
      "Daily puzzle email opt-in in Settings.",
      "MasterChess TV for spectating live high-rated games.",
      "PGN Study tool with shareable links.",
    ],
  },
  {
    date: "2026-07-18",
    version: "Tournaments",
    items: [
      "Top-half vs bottom-half Swiss pairings inside each score group.",
      "FIDE ID lookup auto-fills title and blitz rating on registration.",
      "Public live standings without login.",
    ],
  },
  {
    date: "2026-07-10",
    version: "Growth",
    items: [
      "World Chess Map and Chess DNA fingerprints.",
      "Embeddable board widgets for blogs.",
      "Bot Wars hub with 26 bot personalities.",
    ],
  },
];
