import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, X, ArrowRight, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import heroBoard from "@/assets/hero-chess.jpg";

/**
 * DB Chess Cup hero banner — premium gold gradient over a chess background,
 * three CTAs (Register / View Tournament / Invite Players), live countdown
 * to the event, modern entrance animation, and a dismiss that auto-resets
 * the day after the tournament so the banner disappears on its own.
 *
 * Tournament date: 5 July 2026, 17:00 CEST.
 */
const DISMISS_KEY = "mc.dbcup.hero.dismissed";
const EVENT_AT = new Date("2026-07-05T15:00:00Z").getTime(); // 17:00 CEST
const HIDE_AFTER = new Date("2026-07-06T00:00:00Z").getTime();

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s, live: diff <= 0 };
}

export default function BrakusHeroBanner() {
  const [hidden, setHidden] = useState(true);
  const { d, h, m, s, live } = useCountdown(EVENT_AT);

  useEffect(() => {
    if (Date.now() >= HIDE_AFTER) return;
    try { if (sessionStorage.getItem(DISMISS_KEY) === "1") return; } catch { /* ignore */ }
    setHidden(false);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dragan-brakus?utm_source=share&utm_medium=hero`
    : "/dragan-brakus";

  const onInvite = async () => {
    const shareData = {
      title: "DB Chess Cup — 5 July 2026",
      text: "Join me in the DB Chess Cup on MasterChess.",
      url: inviteUrl,
    };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
        return;
      }
    } catch { /* user cancelled */ }
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch { /* ignore */ }
  };

  const Pill = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[44px] rounded-md bg-black/45 border border-amber-300/30 px-2 py-1">
      <span className="font-display text-lg sm:text-xl font-black text-amber-100 leading-none tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-[0.18em] text-amber-200/75 mt-0.5">{label}</span>
    </div>
  );

  return (
    <motion.section
      aria-label="DB Chess Cup"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-3 sm:mx-6 mt-3 overflow-hidden rounded-2xl border border-amber-300/40 shadow-[0_24px_70px_-20px_rgba(212,175,55,0.6)]"
    >
      <img
        src={heroBoard}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        loading="eager"
        decoding="async"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(241,200,80,0.95) 0%, rgba(190,140,40,0.82) 32%, rgba(25,18,5,0.88) 72%, rgba(0,0,0,0.95) 100%)",
        }}
      />
      <motion.div
        aria-hidden
        className="absolute -inset-y-10 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent skew-x-12"
        initial={{ x: "0%" }}
        animate={{ x: "400%" }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-amber-200/95 text-[11px] uppercase tracking-[0.28em] font-semibold">
            <Trophy className="h-3.5 w-3.5" aria-hidden /> Featured tournament
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-black text-amber-50 leading-tight">
            🏆 DB Chess Cup
          </h2>
          <p className="text-amber-100/90 text-sm sm:text-base font-semibold">
            5 July 2026 · Official MasterChess Tournament
          </p>
          {!live && (
            <div className="mt-3 flex items-center gap-1.5" aria-label={`Starts in ${d} days ${h} hours ${m} minutes`}>
              <Pill value={d} label="Days" />
              <Pill value={h} label="Hrs" />
              <Pill value={m} label="Min" />
              <Pill value={s} label="Sec" />
            </div>
          )}
          {live && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/25 border border-emerald-300/50 px-3 py-1 text-emerald-100 text-xs font-bold uppercase tracking-wider animate-pulse">
              ● Live now
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <Link
            to="/dragan-brakus/register"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-950 px-4 py-2.5 text-sm font-bold text-amber-100 shadow hover:bg-black transition-colors"
          >
            Register Now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/dragan-brakus"
            className="inline-flex items-center justify-center rounded-lg border border-amber-200/60 bg-white/10 px-4 py-2.5 text-sm font-semibold text-amber-50 hover:bg-white/20 transition-colors"
          >
            View Tournament
          </Link>
          <button
            type="button"
            onClick={onInvite}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200/60 bg-white/5 px-4 py-2.5 text-sm font-semibold text-amber-50 hover:bg-white/15 transition-colors"
          >
            <Share2 className="h-4 w-4" /> Invite Players
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss banner"
            className="self-end sm:self-auto ml-auto rounded-full p-1.5 text-amber-100/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
