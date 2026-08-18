// The "come back tomorrow" hook. Deliberately works for guests too (localStorage
// only), because most first-time visitors never sign up on visit #1 — the streak
// is what brings them back, and the streak is what signup then protects.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Gift, Target, Sparkles } from "lucide-react";
import { getGuestProgress } from "@/lib/guestProgress";

const KEY = "mc_daily_checkin";
const todayKey = () => new Date().toISOString().slice(0, 10);

interface CheckIn {
  lastDay: string | null;
  streak: number;
  best: number;
}

function read(): CheckIn {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { lastDay: null, streak: 0, best: 0, ...JSON.parse(raw) };
  } catch { /* private mode */ }
  return { lastDay: null, streak: 0, best: 0 };
}

function checkIn(): CheckIn {
  const t = todayKey();
  const cur = read();
  if (cur.lastDay === t) return cur;
  const y = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak = cur.lastDay === y ? cur.streak + 1 : 1;
  const next: CheckIn = { lastDay: t, streak, best: Math.max(cur.best, streak) };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  return next;
}

/** One rotating daily task, seeded by the date so everyone gets the same one. */
const TASKS = [
  { label: "Beat a bot in under 30 moves", to: "/play", cta: "Play a bot" },
  { label: "Solve today's puzzle", to: "/puzzles", cta: "Solve it" },
  { label: "Win one online game", to: "/play/online", cta: "Find opponent" },
  { label: "Finish today's mate-in-2", to: "/daily-mate", cta: "Try it" },
  { label: "Play one game in the lobby", to: "/lobby", cta: "Open lobby" },
  { label: "Learn one new opening line", to: "/openings", cta: "Open trainer" },
  { label: "Beat Newbie Nina without losing a piece", to: "/play-guest", cta: "Start now" },
];

function dayIndex() {
  const d = new Date();
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86_400_000);
}

export default function DailyHookCard({ className = "" }: { className?: string }) {
  const [state, setState] = useState<CheckIn>(() => read());
  const guest = useMemo(() => getGuestProgress(), []);

  useEffect(() => {
    setState(checkIn());
  }, []);

  const task = TASKS[dayIndex() % TASKS.length];
  const day = Math.max(1, state.streak);
  const dots = Array.from({ length: 7 }, (_, i) => i < ((day - 1) % 7) + 1);

  // Concrete milestone so the dots mean something. Day 3 unlocks a harder bot,
  // day 7 pays out a badge + coins.
  const milestone =
    day < 3
      ? { at: 3, text: `Day 3 unlocks a new bot — ${3 - day} day${3 - day === 1 ? "" : "s"} to go` }
      : day < 7
        ? { at: 7, text: `Day 7 pays out a badge + 500 coins — ${7 - day} day${7 - day === 1 ? "" : "s"} to go` }
        : { at: 7, text: "Week complete — badge + 500 coins unlocked. Keep the chain going." };

  return (
    <section className={`mx-auto max-w-3xl px-4 ${className}`}>
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 rounded-xl border border-primary/30 bg-primary/15 flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary" />
            <span className="absolute -bottom-1.5 -right-1.5 rounded-md bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {day}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-sm sm:text-base font-bold text-foreground">
              Day {day} streak — keep it alive
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
              Come back tomorrow and the streak grows. Miss a day and it resets to 1.
            </p>
          </div>
        </div>

        {/* 7-day dot ladder — visual proof that tomorrow matters */}
        <div className="mt-3 flex items-center gap-1.5">
          {dots.map((filled, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${filled ? "bg-primary" : "bg-muted/50"}`}
            />
          ))}
          <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Gift className="h-3 w-3 text-primary" /> day {milestone.at}
          </span>
        </div>

        <p className="mt-2 text-[11px] font-semibold text-primary/90">{milestone.text}</p>

        {/* Prime time — one shared hour makes the lobby feel alive */}
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 text-primary" />
          Prime time is <strong className="font-semibold text-foreground">20:00</strong> — most
          opponents are online then.
        </p>


        <div className="mt-4 rounded-xl border border-border/50 bg-background/50 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Target className="h-3.5 w-3.5" /> Today's mission
          </div>
          <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-foreground">{task.label}</p>
            <Link
              to={task.to}
              className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {task.cta}
            </Link>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          {guest.games > 0 ? (
            <>
              {guest.games} game{guest.games === 1 ? "" : "s"} · rating {guest.rating} —{" "}
              <Link to="/signup?from=daily-streak" className="text-primary hover:underline">
                save your streak with a free account
              </Link>
            </>
          ) : (
            <>
              Streak is saved on this device.{" "}
              <Link to="/signup?from=daily-streak" className="text-primary hover:underline">
                Create a free account
              </Link>{" "}
              to keep it everywhere.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
