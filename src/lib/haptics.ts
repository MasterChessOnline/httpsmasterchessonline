// Lightweight haptics layer. Gated by the user's Settings toggle ("haptics"),
// no-op on devices without Vibration API (most desktops, iOS Safari outside PWA).
// Each event has a tuned pattern in ms. Patterns can use [vibrate, pause, vibrate, ...].

import { getSetting } from "@/lib/user-settings";

export type HapticEvent =
  | "move"
  | "capture"
  | "check"
  | "mate"
  | "win"
  | "loss"
  | "draw"
  | "illegal"
  | "select"
  | "notify"
  | "clockLow"
  | "clockCritical";

const PATTERNS: Record<HapticEvent, number | number[]> = {
  move: 8,
  capture: 14,
  check: [10, 30, 10],
  mate: [30, 40, 30, 40, 60],
  win: [40, 50, 40, 50, 80],
  loss: [60, 60, 60],
  draw: [20, 40, 20],
  illegal: 40,
  select: 5,
  notify: [12, 40, 12],
  clockLow: 18,
  clockCritical: [22, 30, 22],
};

let lastFireAt = 0;
const MIN_INTERVAL_MS = 30; // throttle: don't spam vibrator

export function hapticsEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.vibrate !== "function") return false;
  // Default ON for mobile-capable devices
  return getSetting("haptics" as any, true) !== false;
}

export function triggerHaptic(event: HapticEvent): void {
  if (!hapticsEnabled()) return;
  const now = Date.now();
  if (now - lastFireAt < MIN_INTERVAL_MS) return;
  lastFireAt = now;
  try {
    navigator.vibrate(PATTERNS[event]);
  } catch {
    /* silently ignore — non-critical */
  }
}

/** React hook returning the trigger fn — stable identity. */
export function useHaptics() {
  return triggerHaptic;
}
