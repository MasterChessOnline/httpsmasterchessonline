// Compact public progress bar for the donation goal.
// Two variants: 'card' (homepage) and 'inline' (footer).
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useDonationProgress } from "@/hooks/use-donation-progress";

function fmt(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface Props {
  variant?: "card" | "inline";
}

export default function DonationProgressBar({ variant = "card" }: Props) {
  const { totalCents, donorCount, goal, loading } = useDonationProgress();

  // Fallback if no active goal seeded yet
  const targetCents = goal?.targetCents ?? 10000;
  const currency = goal?.currency ?? "usd";
  const pct = Math.min(100, (totalCents / Math.max(1, targetCents)) * 100);
  const pctLabel = pct < 1 && totalCents > 0 ? "<1%" : `${pct.toFixed(0)}%`;

  if (variant === "inline") {
    return (
      <Link
        to="/supporter"
        className="block group rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 hover:bg-primary/10 transition-colors"
        aria-label="Support MasterChess — view fundraising progress"
      >
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest mb-1.5">
          <span className="flex items-center gap-1 text-primary">
            <Heart className="h-3 w-3" /> Goal
          </span>
          <span className="text-muted-foreground">
            {loading ? "—" : `${fmt(totalCents, currency)} / ${fmt(targetCents, currency)}`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Link>
    );
  }

  return (
    <div data-donation-card className="mt-6 rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm p-4 sm:p-5 max-w-xl mx-auto">

      <div className="flex items-end justify-between mb-2 gap-3">
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-1">
            <Heart className="h-3 w-3" /> Community goal
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold mt-1">
            {loading ? "—" : fmt(totalCents, currency)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {fmt(targetCents, currency)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold text-primary">{loading ? "—" : pctLabel}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {donorCount} {donorCount === 1 ? "supporter" : "supporters"}
          </div>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-zinc-800/60 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-700 shadow-[0_0_18px_-2px_hsl(43_90%_55%/0.6)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      {goal?.title && (
        <p className="mt-3 text-xs text-muted-foreground">{goal.title}</p>
      )}
    </div>
  );
}
