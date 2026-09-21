// Daily Endgame — one drill per day, plus a local streak.
// Deterministic per UTC date so every visitor gets the same position that day.
import { ENDGAME_DRILLS, type EndgameDrill } from "@/lib/endgame-drills";

const STREAK_KEY = "mc_daily_endgame_streak";

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647;
  return h;
}

export function getDailyDrill(day = todayKey()): EndgameDrill {
  return ENDGAME_DRILLS[hash(day) % ENDGAME_DRILLS.length];
}

type StreakState = { last: string; count: number; best: number };

export function getStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return { best: 0, ...(JSON.parse(raw) as StreakState) };
  } catch {
    /* ignore */
  }
  return { last: "", count: 0, best: 0 };
}

export function isDoneToday(): boolean {
  return getStreak().last === todayKey();
}

/** Call after the player solves today's drill. Returns the new streak state. */
export function markDailyDone(): StreakState {
  const state = getStreak();
  const today = todayKey();
  if (state.last === today) return state;

  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const count = state.last === yesterday ? state.count + 1 : 1;
  const next: StreakState = { last: today, count, best: Math.max(count, state.best || 0) };
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}
