export interface DonorRank {
  key: string;
  label: string;
  icon: string;
  minCents: number;
  color: string;
  bgColor: string;
  borderColor: string;
  glow: string;
}

export const DONOR_RANKS: DonorRank[] = [
  { key: "pawn",   label: "Pawn",   icon: "♟️", minCents: 100,   color: "text-stone-400",  bgColor: "bg-stone-400/10",  borderColor: "border-stone-400/30", glow: "" },
  { key: "knight", label: "Knight", icon: "♞",  minCents: 500,   color: "text-emerald-400", bgColor: "bg-emerald-400/10", borderColor: "border-emerald-400/30", glow: "shadow-emerald-500/20" },
  { key: "bishop", label: "Bishop", icon: "♝",  minCents: 1000,  color: "text-blue-400",   bgColor: "bg-blue-400/10",   borderColor: "border-blue-400/30", glow: "shadow-blue-500/20" },
  { key: "rook",   label: "Rook",   icon: "♜",  minCents: 2500,  color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/30", glow: "shadow-purple-500/30" },
  { key: "queen",  label: "Queen",  icon: "♛",  minCents: 5000,  color: "text-pink-400",   bgColor: "bg-pink-400/10",   borderColor: "border-pink-400/30", glow: "shadow-pink-500/30" },
  { key: "king",   label: "King",   icon: "♚",  minCents: 10000, color: "text-yellow-400", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/30", glow: "shadow-yellow-500/40" },
];

export function getDonorRank(totalCents: number): DonorRank | null {
  if (totalCents < DONOR_RANKS[0].minCents) return null;
  let rank = DONOR_RANKS[0];
  for (const r of DONOR_RANKS) {
    if (totalCents >= r.minCents) rank = r;
  }
  return rank;
}

export function getNextDonorRank(totalCents: number): DonorRank | null {
  for (const r of DONOR_RANKS) {
    if (totalCents < r.minCents) return r;
  }
  return null;
}

export function getDonorProgress(totalCents: number): number {
  const current = getDonorRank(totalCents);
  const next = getNextDonorRank(totalCents);
  if (!current || !next) return current ? 100 : 0;
  const range = next.minCents - current.minCents;
  return Math.min(100, ((totalCents - current.minCents) / range) * 100);
}

// Reward unlocks for donation amounts (cumulative cents)
export const DONATION_REWARDS = [
  { minCents: 100,  label: "Shoutout on stream", icon: "📣" },
  { minCents: 500,  label: "Highlighted message in chat", icon: "✨" },
  { minCents: 1000, label: "Play a game vs streamer", icon: "⚔️" },
  { minCents: 2000, label: "Personal game analysis", icon: "🔍" },
  { minCents: 5000, label: "Custom chess lesson", icon: "🎓" },
  { minCents: 10000, label: "Lifetime VIP + mentor session", icon: "👑" },
];

// AI chess reactions for donations
export const AI_REACTIONS = [
  "Brilliant move by {username}! 🎯",
  "{username} plays a crushing sacrifice! 💥",
  "A stunning combination from {username}! ♟️",
  "{username} delivers checkmate with style! 👑",
  "Grandmaster-level generosity from {username}! 🏆",
  "{username} opens with a royal gambit! ♚",
  "Outstanding positional play by {username}! 📐",
  "{username} controls the board! 🎮",
];

export function getRandomReaction(username: string): string {
  const template = AI_REACTIONS[Math.floor(Math.random() * AI_REACTIONS.length)];
  return template.replace("{username}", username);
}
