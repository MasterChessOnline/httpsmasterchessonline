/**
 * Backend reachability probe + pending-signup queue.
 *
 * The hosted database was paused for a period, and during that time every
 * signup silently failed — visitors hit a dead end with no explanation. This
 * module lets the UI (a) tell the visitor honestly that saving is temporarily
 * unavailable while gameplay keeps working, and (b) keep the email they typed
 * so it is retried automatically once the backend answers again.
 */

import { supabase } from "@/integrations/supabase/client";

export type BackendState = "unknown" | "online" | "offline";

const PENDING_KEY = "mc_pending_signup";

let cached: { state: BackendState; at: number } = { state: "unknown", at: 0 };
const CACHE_MS = 30_000;

/** Lightweight read against a public table; no writes, no auth needed. */
export async function probeBackend(force = false): Promise<BackendState> {
  const now = Date.now();
  if (!force && cached.state !== "unknown" && now - cached.at < CACHE_MS) {
    return cached.state;
  }
  try {
    // head-only count: cheapest possible round trip.
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .limit(1);
    // A permission error still proves the backend is answering.
    const online = !error || !/fetch|network|timeout|paused/i.test(error.message);
    cached = { state: online ? "online" : "offline", at: now };
  } catch {
    cached = { state: "offline", at: now };
  }
  return cached.state;
}

export interface PendingSignup {
  email: string;
  username?: string;
  queuedAt: string;
}

/** Keep the email a visitor typed when the backend could not accept it. */
export function queuePendingSignup(entry: Omit<PendingSignup, "queuedAt">) {
  try {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ ...entry, queuedAt: new Date().toISOString() } satisfies PendingSignup),
    );
  } catch {
    /* noop */
  }
}

export function getPendingSignup(): PendingSignup | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingSignup) : null;
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* noop */
  }
}

/** True when the failure looks like "backend unavailable" rather than a user error. */
export function isBackendOutage(message?: string | null): boolean {
  if (!message) return false;
  return /failed to fetch|network|timeout|502|503|504|paused|unavailable/i.test(message);
}
