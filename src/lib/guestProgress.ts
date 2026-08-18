/**
 * Guest progress + conversion funnel counters (localStorage only).
 *
 * Why: an unregistered visitor plays, wins, builds a streak — and then sees a
 * generic "Create free account" button that promises nothing concrete. Here we
 * keep what the guest actually earned so the signup screen can say exactly what
 * they lose by leaving, and so we can see where the funnel leaks:
 *   played -> saw signup -> created account
 *
 * No backend calls: this keeps working while the hosted database is unavailable.
 */

const KEY = "mc_guest_progress";

export interface GuestProgress {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  /** Rough guest rating so the signup screen has a number worth saving. */
  rating: number;
  lastBotBeaten: string | null;
  firstSeen: string;
  lastPlayed: string | null;
  /** Funnel: how many times the signup offer was shown to this guest. */
  signupViews: number;
}

const EMPTY: GuestProgress = {
  games: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
  rating: 700,
  lastBotBeaten: null,
  firstSeen: new Date().toISOString(),
  lastPlayed: null,
  signupViews: 0,
};

function read(): GuestProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<GuestProgress>) };
  } catch {
    return { ...EMPTY };
  }
}

function write(next: GuestProgress): GuestProgress {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("mc:guest-progress", { detail: next }));
  } catch {
    /* private mode — progress is best-effort */
  }
  return next;
}

export function getGuestProgress(): GuestProgress {
  return read();
}

/** Record a finished guest game. Returns the updated progress. */
export function recordGuestResult(
  outcome: "win" | "loss" | "draw",
  botName?: string,
): GuestProgress {
  const p = read();
  p.games += 1;
  p.lastPlayed = new Date().toISOString();
  if (outcome === "win") {
    p.wins += 1;
    p.streak += 1;
    p.bestStreak = Math.max(p.bestStreak, p.streak);
    p.rating += 20;
    if (botName) p.lastBotBeaten = botName;
  } else if (outcome === "loss") {
    p.losses += 1;
    p.streak = 0;
    p.rating = Math.max(400, p.rating - 12);
  } else {
    p.draws += 1;
    p.rating += 4;
  }
  return write(p);
}

/** Funnel step: the signup offer became visible to this guest. */
export function markSignupSeen(): GuestProgress {
  const p = read();
  p.signupViews += 1;
  return write(p);
}

/** One short line describing what the guest would save by signing up. */
export function guestValueLine(p: GuestProgress = read()): string | null {
  if (p.games === 0) return null;
  const bits: string[] = [];
  if (p.wins > 0) bits.push(`${p.wins} ${p.wins === 1 ? "win" : "wins"}`);
  if (p.bestStreak > 1) bits.push(`streak ${p.bestStreak}`);
  bits.push(`rating ${p.rating}`);
  return bits.join(" · ");
}

/** Clear guest progress once a real account exists. */
export function clearGuestProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
