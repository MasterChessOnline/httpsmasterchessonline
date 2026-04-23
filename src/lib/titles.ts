// MasterChess Title System — unlocked at fixed rating thresholds.
// Titles never get removed once earned (we cache the highest in `highest_title_key`).

export interface ChessTitle {
  key: string;
  /** Short label shown next to username (e.g. "MC-IM"). */
  label: string;
  /** Long descriptive name (e.g. "International Master"). */
  fullName: string;
  minRating: number;
  /** Tailwind text color class, used for the badge. */
  color: string;
  /** Tailwind bg color class. */
  bgColor: string;
  /** Tailwind border color class. */
  borderColor: string;
  /** Emoji shown before the label. */
  icon: string;
  /** Whether this title shows a glow/animation effect. */
  prestigious?: boolean;
}

export const TITLES: ChessTitle[] = [
  {
    key: "unranked",
    label: "Unranked",
    fullName: "Unranked",
    minRating: 0,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-border/40",
    icon: "♟",
  },
  {
    key: "soldier",
    label: "Chess Soldier",
    fullName: "Chess Soldier",
    minRating: 1000,
    color: "text-amber-700",
    bgColor: "bg-amber-700/10",
    borderColor: "border-amber-700/30",
    icon: "🪖",
  },
  {
    key: "tactical-fighter",
    label: "Tactical Fighter",
    fullName: "Tactical Fighter",
    minRating: 1400,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    icon: "⚔️",
  },
  {
    key: "position-master",
    label: "Position Master",
    fullName: "Position Master",
    minRating: 1700,
    color: "text-cyan-300",
    bgColor: "bg-cyan-300/10",
    borderColor: "border-cyan-300/30",
    icon: "🧠",
  },
  {
    key: "mc-cm",
    label: "MC-CM",
    fullName: "MasterChess Candidate Master",
    minRating: 1800,
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
    borderColor: "border-amber-600/40",
    icon: "🟤",
  },
  {
    key: "mc-fm",
    label: "MC-FM",
    fullName: "MasterChess FIDE Master",
    minRating: 2000,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/40",
    icon: "🔵",
  },
  {
    key: "mc-im",
    label: "MC-IM",
    fullName: "MasterChess International Master",
    minRating: 2200,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/40",
    icon: "🟣",
  },
  {
    key: "mc-gm",
    label: "MC-GM",
    fullName: "MasterChess Grandmaster",
    minRating: 2400,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/15",
    borderColor: "border-yellow-400/50",
    icon: "👑",
    prestigious: true,
  },
  {
    key: "mc-super-gm",
    label: "MC-Super GM",
    fullName: "MasterChess Super Grandmaster",
    minRating: 2600,
    color: "text-orange-400",
    bgColor: "bg-orange-400/15",
    borderColor: "border-orange-400/50",
    icon: "🔥",
    prestigious: true,
  },
  {
    key: "mc-legend",
    label: "MC-Legend",
    fullName: "MasterChess Legend",
    minRating: 2800,
    color: "text-fuchsia-300",
    bgColor: "bg-fuchsia-300/15",
    borderColor: "border-fuchsia-300/60",
    icon: "💎",
    prestigious: true,
  },
];

/**
 * Bot-mode title thresholds — higher than online because bot ratings
 * inflate faster (no human variance, infinite replay). To earn a title vs bots,
 * you need a noticeably bigger rating segment.
 */
export const BOT_TITLE_OFFSETS: Record<string, number> = {
  unranked: 0,
  soldier: 100,            // 1000 → 1100
  "tactical-fighter": 100, // 1400 → 1500
  "position-master": 150,  // 1700 → 1850
  "mc-cm": 150,            // 1800 → 1950
  "mc-fm": 150,            // 2000 → 2150
  "mc-im": 200,            // 2200 → 2400
  "mc-gm": 200,            // 2400 → 2600
  "mc-super-gm": 200,      // 2600 → 2800
  "mc-legend": 200,        // 2800 → 3000
};

export type RatingMode = "online" | "bot";

/** Get the threshold for a title in a given mode. */
export function getThreshold(title: ChessTitle, mode: RatingMode = "online"): number {
  if (mode === "online") return title.minRating;
  return title.minRating + (BOT_TITLE_OFFSETS[title.key] ?? 0);
}

/** TITLES list with thresholds resolved for the requested mode. */
export function getTitlesForMode(mode: RatingMode = "online"): ChessTitle[] {
  if (mode === "online") return TITLES;
  return TITLES.map((t) => ({ ...t, minRating: getThreshold(t, "bot") }));
}

/** Highest title earned for a given rating (or current peak). */
export function getTitle(rating: number, mode: RatingMode = "online"): ChessTitle {
  const list = getTitlesForMode(mode);
  let earned: ChessTitle = list[0];
  for (const t of list) {
    if (rating >= t.minRating) earned = t;
  }
  return earned;
}

/** Title that comes after the one currently held (for progress display). */
export function getNextTitle(rating: number, mode: RatingMode = "online"): ChessTitle | null {
  const list = getTitlesForMode(mode);
  const current = getTitle(rating, mode);
  const idx = list.findIndex((t) => t.key === current.key);
  return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
}

/** Progress (0..100) toward the next title. */
export function getTitleProgress(rating: number, mode: RatingMode = "online"): number {
  const current = getTitle(rating, mode);
  const next = getNextTitle(rating, mode);
  if (!next) return 100;
  const span = next.minRating - current.minRating;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, ((rating - current.minRating) / span) * 100));
}

/** Resolve a stored title key back to a title (for "highest ever earned"). */
export function getTitleByKey(key: string | null | undefined): ChessTitle | null {
  if (!key) return null;
  return TITLES.find((t) => t.key === key) ?? null;
}

/**
 * Compare two title keys and return the one with the higher minRating.
 * Used to ensure titles never downgrade.
 */
export function maxTitleKey(a: string | null | undefined, b: string | null | undefined): string {
  const ta = getTitleByKey(a) ?? TITLES[0];
  const tb = getTitleByKey(b) ?? TITLES[0];
  return ta.minRating >= tb.minRating ? ta.key : tb.key;
}
