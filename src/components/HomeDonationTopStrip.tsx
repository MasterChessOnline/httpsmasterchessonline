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
      className="w-full border-b border-primary/30 bg-gradient-to-r from-black/90 via-[#1a1408]/90 to-black/90 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 h-10 sm:h-11 flex items-center gap-2 sm:gap-3">
        <Heart className="h-4 w-4 text-primary fill-primary/40 shrink-0" aria-hidden />

        {/* Label — full on desktop, short on mobile */}
        <span className="hidden sm:inline text-xs sm:text-sm font-medium text-foreground/90 whitespace-nowrap">
          Support MasterChess
        </span>
        <span className="sm:hidden text-xs font-medium text-foreground/90 whitespace-nowrap">
          Support us
        </span>

        {/* Progress bar — flexible */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-yellow-400 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] sm:text-xs tabular-nums text-foreground/80 whitespace-nowrap">
            {cur}{raised}/{target}
            <span className="hidden sm:inline"> · {pct}%</span>
          </span>
        </div>

        <Link
          to="/supporter"
          className="shrink-0 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
        >
          Donate
        </Link>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss for a week"
          className="shrink-0 p-1 text-foreground/50 hover:text-foreground/90 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
