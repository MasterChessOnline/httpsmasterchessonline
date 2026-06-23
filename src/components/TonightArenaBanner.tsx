// TonightArenaBanner — fixed daily ritual at 20:00 local time.
// Why: multiplayer cold-start problem. Random matchmaking is empty;
// a fixed time bring everyone to the board together. Share button
// turns each visitor into a recruiter for tonight's session.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Share2, Check, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function nextArenaDate(): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(20, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    // Already past 20:00 → schedule for tomorrow
    target.setDate(target.getDate() + 1);
  }
  return target;
}

function formatRemaining(ms: number): { h: string; m: string; s: string; live: boolean } {
  if (ms <= 0) return { h: "00", m: "00", s: "00", live: true };
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return {
    h: h.toString().padStart(2, "0"),
    m: m.toString().padStart(2, "0"),
    s: s.toString().padStart(2, "0"),
    live: false,
  };
}

export default function TonightArenaBanner() {
  const { toast } = useToast();
  const [target, setTarget] = useState<Date>(() => nextArenaDate());
  const [now, setNow] = useState<number>(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = nextArenaDate();
      setTarget((prev) => (prev.getTime() === t.getTime() ? prev : t));
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = useMemo(
    () => formatRemaining(target.getTime() - now),
    [target, now]
  );

  // After arena starts, keep showing "LIVE" for first 90 minutes
  const arenaIsLive = useMemo(() => {
    const startMs = target.getTime() - 24 * 3600 * 1000;
    const sinceStart = now - startMs;
    return remaining.live && sinceStart < 90 * 60 * 1000;
  }, [target, now, remaining.live]);

  const dayLabel = useMemo(() => {
    const tonight = new Date();
    tonight.setHours(20, 0, 0, 0);
    if (target.getTime() === tonight.getTime()) return "Tonight";
    return "Tomorrow";
  }, [target]);

  const share = async () => {
    const url = `${window.location.origin}/tournaments`;
    const text = `${dayLabel} 20:00 — MasterChess Daily Blitz Arena. Free, no signup pressure. Come play me. ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "MasterChess Daily Arena", text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Invite copied", description: "Paste it in Instagram, WhatsApp or your school group." });
      }
    } catch {}
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Tonight's Daily Arena"
      className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-background backdrop-blur-sm p-5 sm:p-6"
    >
      {/* subtle glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400/90 flex items-center gap-1.5">
              {arenaIsLive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live now
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" /> {dayLabel} · 20:00
                </>
              )}
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground leading-tight">
              Daily Blitz Arena
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Everyone plays at the same time. Bring a friend, climb the board.
            </p>
          </div>
        </div>

        {/* Countdown */}
        {!arenaIsLive && (
          <div className="flex items-center gap-2 sm:ml-auto" role="timer" aria-live="polite">
            {[
              { v: remaining.h, l: "h" },
              { v: remaining.m, l: "m" },
              { v: remaining.s, l: "s" },
            ].map(({ v, l }) => (
              <div
                key={l}
                className="min-w-[44px] text-center rounded-lg border border-amber-500/25 bg-background/60 px-2.5 py-1.5"
              >
                <div className="font-mono font-bold text-base sm:text-lg text-foreground tabular-nums">{v}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground -mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex items-center gap-2 sm:ml-2">
          <Link
            to="/tournaments"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-display font-bold text-xs uppercase tracking-wider px-3.5 py-2 transition-colors shadow-glow-sm"
          >
            {arenaIsLive ? <Swords className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}
            {arenaIsLive ? "Join now" : "Join arena"}
          </Link>
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10 text-foreground font-display font-bold text-xs uppercase tracking-wider px-3 py-2 transition-colors"
            aria-label="Share tonight's arena"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Invite"}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
