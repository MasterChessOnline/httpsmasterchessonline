// Ranked Division System — visual tier based on rating.
// Spec: Bronze 0-999, Silver 1000-1399, Gold 1400-1799, Platinum 1800-2099,
// Diamond 2100-2399, Master 2400-2599, Grandmaster 2600+.

export interface Rank {
  key: string;
  label: string;
  icon: string;
  minRating: number;
  maxRating: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const RANKS: Rank[] = [
  { key: "bronze",      label: "Bronze",      icon: "🥉", minRating: 0,    maxRating: 999,  color: "text-amber-700",   bgColor: "bg-amber-700/10",   borderColor: "border-amber-700/30" },
  { key: "silver",      label: "Silver",      icon: "🥈", minRating: 1000, maxRating: 1399, color: "text-slate-300",   bgColor: "bg-slate-300/10",   borderColor: "border-slate-300/30" },
  { key: "gold",        label: "Gold",        icon: "🥇", minRating: 1400, maxRating: 1799, color: "text-yellow-400",  bgColor: "bg-yellow-400/10",  borderColor: "border-yellow-400/30" },
  { key: "platinum",    label: "Platinum",    icon: "💎", minRating: 1800, maxRating: 2099, color: "text-cyan-300",    bgColor: "bg-cyan-300/10",    borderColor: "border-cyan-300/30" },
  { key: "diamond",     label: "Diamond",     icon: "💠", minRating: 2100, maxRating: 2399, color: "text-blue-400",    bgColor: "bg-blue-400/10",    borderColor: "border-blue-400/30" },
  { key: "master",      label: "Master",      icon: "👑", minRating: 2400, maxRating: 2599, color: "text-purple-400",  bgColor: "bg-purple-400/10",  borderColor: "border-purple-400/30" },
  { key: "grandmaster", label: "Grandmaster", icon: "🏆", minRating: 2600, maxRating: 9999, color: "text-yellow-300",  bgColor: "bg-yellow-300/10",  borderColor: "border-yellow-300/40" },
];

export function getRank(rating: number): Rank {
  return RANKS.find(r => rating >= r.minRating && rating <= r.maxRating) || RANKS[0];
}

export function getRankProgress(rating: number): number {
  const rank = getRank(rating);
  if (rank.key === "grandmaster") return 100;
  const range = rank.maxRating - rank.minRating + 1;
  return Math.min(100, ((rating - rank.minRating) / range) * 100);
}

export function getNextRank(rating: number): Rank | null {
  const current = getRank(rating);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}
