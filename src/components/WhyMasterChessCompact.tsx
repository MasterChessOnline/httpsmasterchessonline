/**
 * The answer to "why this site and not the big ones?" — one sentence plus three
 * concrete reasons. Used on Home, the Instagram landing and Signup so the promise
 * is identical everywhere a new visitor can land.
 */
import { Zap, ShieldCheck, Gift } from "lucide-react";

const REASONS = [
  {
    icon: Zap,
    title: "Play in one tap",
    body: "No signup, no email, no download. Make a move on the board above and the game has already started.",
  },
  {
    icon: ShieldCheck,
    title: "Pure human chess",
    body: "Zero engine help in games against people — no eval bar, no best-move arrows, no hints. Review comes after the game.",
  },
  {
    icon: Gift,
    title: "Everything is free",
    body: "Tournaments, analysis, lessons, ratings and puzzles. No premium tier hiding features, no ads on the board.",
  },
];

export default function WhyMasterChessCompact({ className = "" }: { className?: string }) {
  return (
    <section className={`mx-auto max-w-3xl px-4 ${className}`} aria-label="Why MasterChess">
      <h2 className="text-center font-display text-lg sm:text-xl font-bold text-foreground">
        Why MasterChess?
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-xs sm:text-sm text-muted-foreground">
        The fastest way to play real chess against real people — free forever, and
        honest about it.
      </p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {REASONS.map((r) => (
          <div
            key={r.title}
            className="rounded-xl border border-border/30 bg-card/60 p-3.5 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 shrink-0 rounded-lg border border-primary/30 bg-primary/15 flex items-center justify-center">
                <r.icon className="h-4 w-4 text-primary" />
              </span>
              <h3 className="text-sm font-bold text-foreground">{r.title}</h3>
            </div>
            <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
