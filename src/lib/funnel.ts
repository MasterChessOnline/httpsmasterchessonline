// FUNNEL INSTRUMENTATION
//
// The goal of an ad campaign is not the signup — it is the *second* game and
// the next-day return. This module keeps the small amount of local state that
// lets us report those steps: Ad → Landing → Signup → First Game → Second Game
// → Day-1 Return. Everything is fired through `track()`, so GA4 / GTM / the
// pixels all receive the same funnel events.

import { track } from "@/lib/track";
import { reportFunnel } from "@/lib/monitoring";

/** Sends the step to GA/GTM *and* to our own database (plan section 54). */
function emit(name: string, params: Record<string, unknown> = {}): void {
  track(name, params);
  void reportFunnel(name, params);
}

const GAMES_KEY = "mc_funnel_games";
const LAST_DAY_KEY = "mc_funnel_last_day";
const CTA_KEY = "mc_funnel_cta";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readNumber(key: string): number {
  try {
    return Number(localStorage.getItem(key) || 0) || 0;
  } catch {
    return 0;
  }
}

/** Total games this browser has finished (guest games included). */
export function gamesPlayed(): number {
  return readNumber(GAMES_KEY);
}

/**
 * Call once per finished game. Emits `first_game` and `second_game` — the two
 * activation milestones that actually predict retention.
 */
export function markGameFinished(meta: Record<string, unknown> = {}): number {
  const next = gamesPlayed() + 1;
  try {
    localStorage.setItem(GAMES_KEY, String(next));
  } catch {
    /* ignore */
  }
  emit("game_finished", { ...meta, games_total: next });
  if (next === 1) emit("first_game", meta);
  if (next === 2) emit("second_game", meta);
  return next;
}

/** Records the visit day and emits `day_1_return` the first time they come back. */
export function markVisit(): void {
  try {
    const last = localStorage.getItem(LAST_DAY_KEY);
    const now = today();
    if (last && last !== now) {
      const gapDays = Math.round(
        (Date.parse(now) - Date.parse(last)) / 86_400_000,
      );
      emit(gapDays === 1 ? "day_1_return" : "return_visit", {
        gap_days: gapDays,
        games_total: gamesPlayed(),
      });
    }
    localStorage.setItem(LAST_DAY_KEY, now);
  } catch {
    /* ignore */
  }
}

/** Every "Create free account" surface reports where the click came from. */
export function trackSignupCta(surface: string): void {
  try {
    localStorage.setItem(CTA_KEY, surface);
  } catch {
    /* ignore */
  }
  emit("signup_cta_click", { surface, games_total: gamesPlayed() });
}

/** The surface that sent the player to /signup, for signup attribution. */
export function lastSignupSurface(): string | null {
  try {
    return localStorage.getItem(CTA_KEY);
  } catch {
    return null;
  }
}
