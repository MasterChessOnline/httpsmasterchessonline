// Prime-time hour: one fixed hour every day (20:00 local) when players are told
// to show up together, so the matchmaking queue is not empty. Pure client-side
// clock math — no fake players, no fake counts.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Swords } from "lucide-react";

const PRIME_HOUR = 20; // 20:00 local time

function msUntilNextPrime(now: Date) {
  const next = new Date(now);
  next.setHours(PRIME_HOUR, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function PrimeTimeBanner({ className = "" }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isLive = now.getHours() === PRIME_HOUR;
  const remaining = isLive
    ? new Date(now).setHours(PRIME_HOUR + 1, 0, 0, 0) - now.getTime()
    : msUntilNextPrime(now);

  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 flex items-center gap-3 ${
        isLive
          ? "border-primary/40 bg-primary/10"
          : "border-border/50 bg-card/70"
      } ${className}`}
    >
      <div className="h-9 w-9 shrink-0 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
        <Clock className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-bold text-foreground">
          {isLive ? "Prime Time is live — 20:00" : "Prime Time — every day at 20:00"}
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          {isLive
            ? `Most players are in the queue right now. Ends in ${fmt(remaining)}.`
            : `Everyone queues at the same hour, so you get a real opponent fast. Starts in ${fmt(remaining)}.`}
        </p>
      </div>
      <Link
        to="/play/online"
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
      >
        <Swords className="h-3.5 w-3.5" /> Play
      </Link>
    </div>
  );
}
