import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { useDonationProgress } from "@/hooks/use-donation-progress";

const DISMISS_KEY = "mc:donate-top:dismissed-until";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export default function HomeDonationTopStrip() {
  const { totalCents, goal, loading } = useDonationProgress();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
      setHidden(Date.now() < until);
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden || loading || !goal || goal.targetCents <= 0) return null;

  const pct = Math.min(100, Math.round((totalCents / goal.targetCents) * 100));
  if (pct >= 100) return null;

  const raised = Math.floor(totalCents / 100);
  const target = Math.floor(goal.targetCents / 100);
  const cur = (goal.currency || "usd").toUpperCase() === "EUR" ? "€" : "$";

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
    } catch {}
    setHidden(true);
  };

  return (
    <div
      role="region"
      aria-label="Support MasterChess"
      className="w-full border-b border-amber-500/40 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950"
      style={{
        backgroundImage: "linear-gradient(135deg, #2a1f05 0%, #3d2b08 50%, #2a1f05 100%)",
      }}
    >
      {/* Desktop: single row */}
      <div className="hidden sm:flex mx-auto max-w-7xl px-4 h-11 items-center gap-3">
        <Heart className="h-4 w-4 text-amber-400 fill-amber-400/60 shrink-0" aria-hidden />

        <span className="text-sm font-semibold text-amber-100 whitespace-nowrap">
          Support MasterChess
        </span>

        {/* Progress bar */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-black/40 overflow-hidden border border-amber-500/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-amber-200/90 whitespace-nowrap font-medium">
            {cur}{raised} / {target} · {pct}%
          </span>
        </div>

        <Link
          to="/supporter"
          className="shrink-0 inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-black shadow-md hover:bg-amber-400 hover:shadow-amber-500/30 transition-all"
        >
          Donate →
        </Link>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss for a week"
          className="shrink-0 p-1 text-amber-200/40 hover:text-amber-100 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Mobile: two rows for visibility */}
      <div className="sm:hidden mx-auto max-w-7xl px-3 py-2.5 flex flex-col gap-1.5">
        {/* Top row: label + donate + dismiss */}
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-amber-400 fill-amber-400/60 shrink-0" aria-hidden />
          <span className="text-xs font-bold text-amber-100 whitespace-nowrap">
            Support MasterChess
          </span>
          <div className="flex-1" />
          <Link
            to="/supporter"
            className="shrink-0 inline-flex items-center justify-center rounded-md bg-amber-500 px-3 py-1 text-[11px] font-bold text-black shadow-sm"
          >
            Donate →
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss for a week"
            className="shrink-0 p-0.5 text-amber-200/40 hover:text-amber-100 transition"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Bottom row: progress bar + numbers */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-black/40 overflow-hidden border border-amber-500/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-amber-200/80 whitespace-nowrap font-medium">
            {cur}{raised}/{target} · {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
