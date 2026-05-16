import { useEffect } from "react";

/**
 * Daily play-reminder notifier.
 *
 * - Picks a *different* message for each day of the year from a curated pool
 *   so reminders never feel repetitive.
 * - Fires a notification when the player opens the app and ≥20h have passed
 *   since the last reminder (catch-up).
 * - While the tab/app is open, schedules the next reminder for 19:00 local
 *   time so we ping evenings even without a server.
 * - Only runs when Notification permission is `granted` and a service worker
 *   is registered (so the notification works on iOS PWA + Android).
 *
 * Real-time server push (sent when the app is closed) needs VAPID + an edge
 * function — this complements that with reliable client-side reminders.
 */

const LAST_KEY = "mc.daily.reminder.lastShownAt";
const MIN_INTERVAL_MS = 20 * 60 * 60 * 1000; // 20h
const REMINDER_HOUR = 19; // 7 PM local time

type ReminderKind = "play" | "streak" | "tournament" | "rating" | "puzzle" | "comeback";

const POOL: Array<{ kind: ReminderKind; title: string; body: string; url: string }> = [
  // Play
  { kind: "play",       title: "Time for a game ♟", body: "Your opponents are waiting. One quick blitz?", url: "/play/online" },
  { kind: "play",       title: "Quick match?",       body: "A 3-minute blitz is all it takes to keep sharp.", url: "/play/online" },
  { kind: "play",       title: "The board is set",   body: "Open MasterChess and play a game right now.",  url: "/play" },
  { kind: "play",       title: "Bring the heat 🔥",  body: "Challenge a real player and climb the leaderboard.", url: "/play/online" },

  // Streak
  { kind: "streak",     title: "Keep your streak alive", body: "Don't break the chain — play one game today.", url: "/daily-plan" },
  { kind: "streak",     title: "Streak check 🎯",   body: "A single move keeps your daily streak going.",   url: "/daily-plan" },
  { kind: "streak",     title: "Your streak is calling", body: "Tap in for today's daily plan and stay on fire.", url: "/daily-plan" },

  // Tournament
  { kind: "tournament", title: "Tournaments live now", body: "Join an open arena and fight for the crown.", url: "/tournaments" },
  { kind: "tournament", title: "A new arena opens",  body: "Sign up for today's tournament before it locks.", url: "/tournaments" },
  { kind: "tournament", title: "Crown time 👑",      body: "Free tournaments running — your seat is open.", url: "/tournaments" },

  // Rating
  { kind: "rating",     title: "Climb the ladder",   body: "A few rated games and your ELO is on the move.", url: "/play/online" },
  { kind: "rating",     title: "Push your rating",   body: "Today is a great day to gain ELO points.",      url: "/leaderboard" },

  // Training / lessons (no puzzles — house rule)
  { kind: "puzzle",     title: "Sharpen your play",  body: "Try a Guess the Move challenge — pure feel.",   url: "/guess-the-move" },
  { kind: "puzzle",     title: "Train like a GM",    body: "Play Like a Grandmaster — match the best moves.", url: "/play-like-gm" },
  { kind: "puzzle",     title: "Opening repertoire", body: "Drill your openings for 5 minutes.",            url: "/openings" },

  // Comeback
  { kind: "comeback",   title: "We miss you on the board", body: "Hop back in — your next win is one game away.", url: "/" },
  { kind: "comeback",   title: "Your throne awaits ♛",     body: "MasterChess is faster than ever. Come back and play.", url: "/play" },
];

function pickMessageForToday() {
  const now = new Date();
  // Day-of-year so every calendar day picks a different entry, but the same
  // day always picks the same one (idempotent across re-renders/re-opens).
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return POOL[dayOfYear % POOL.length];
}

async function fireReminder() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const last = Number(localStorage.getItem(LAST_KEY) || 0);
  if (Date.now() - last < MIN_INTERVAL_MS) return;

  const msg = pickMessageForToday();
  try {
    const reg =
      (await navigator.serviceWorker?.ready) ||
      (await navigator.serviceWorker?.getRegistration?.());
    if (reg) {
      await reg.showNotification(msg.title, {
        body: msg.body,
        icon: "/app-icon-192.png",
        badge: "/app-icon-192.png",
        vibrate: [80, 40, 80],
        tag: `mc-daily-${msg.kind}`,
        data: { url: msg.url },
      } as NotificationOptions);
    } else {
      new Notification(msg.title, { body: msg.body, icon: "/app-icon-192.png" });
    }
    localStorage.setItem(LAST_KEY, String(Date.now()));
  } catch {}
}

function msUntilNextReminder() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(REMINDER_HOUR, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export default function DailyReminderNotifier() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    let timer: number | undefined;

    const scheduleNext = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        fireReminder().then(scheduleNext);
      }, msUntilNextReminder());
    };

    // Catch-up on app open (only if it's been long enough since last ping).
    fireReminder();
    scheduleNext();

    const onVisible = () => {
      if (document.visibilityState === "visible") fireReminder();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
