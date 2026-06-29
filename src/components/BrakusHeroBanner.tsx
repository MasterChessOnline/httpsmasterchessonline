import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, X, ArrowRight } from "lucide-react";
import heroBoard from "@/assets/hero-chess.jpg";

/**
 * Dragan Brakus Cup hero banner — premium gold gradient over a chess
 * background, two CTAs (Register / Details). Auto-dismisses after the
 * tournament ends; users can also dismiss it manually for the session.
 *
 * Tournament date: 1 July 2026. We hide the banner from 2 July 2026 (UTC)
 * onwards so it disappears the day after the event without any code change.
 */
const DISMISS_KEY = "mc.brakus.hero.dismissed";
const HIDE_AFTER = new Date("2026-07-02T00:00:00Z").getTime();

export default function BrakusHeroBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (Date.now() >= HIDE_AFTER) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setHidden(false);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      aria-label="Dragan Brakus Cup"
      className="relative mx-3 sm:mx-6 mt-3 overflow-hidden rounded-2xl border border-amber-300/40 shadow-[0_20px_60px_-20px_rgba(212,175,55,0.55)]"
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
            "linear-gradient(120deg, rgba(212,175,55,0.92) 0%, rgba(180,130,30,0.78) 35%, rgba(20,15,5,0.85) 75%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-amber-200/90 text-[11px] uppercase tracking-[0.25em] font-semibold">
            <Trophy className="h-3.5 w-3.5" aria-hidden /> Featured tournament
          </div>
          <h2 className="mt-1 font-display text-xl sm:text-2xl md:text-3xl font-black text-amber-50 leading-tight">
            🏆 Dragan Brakus Cup
          </h2>
          <p className="text-amber-100/85 text-sm font-medium">
            1 July 2026 · Official tournament hosted on MasterChess.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
            View Details
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss banner"
            className="ml-1 rounded-full p-1.5 text-amber-100/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
