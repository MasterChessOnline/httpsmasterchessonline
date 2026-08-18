/**
 * "What now?" strip for content pages.
 *
 * A visitor who finishes reading has exactly one useful next click, and if we
 * don't offer it they leave. This gives three: keep learning, play right now,
 * and keep the progress by creating a free account.
 */
import { Link } from "react-router-dom";
import { ArrowRight, Swords, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface NextStep {
  to: string;
  label: string;
  note?: string;
}

export default function SeoNextSteps({
  steps,
  playTo = "/play-guest",
  playLabel = "Play a free game now",
  className = "",
}: {
  steps: NextStep[];
  playTo?: string;
  playLabel?: string;
  className?: string;
}) {
  const { user } = useAuth();

  return (
    <section className={`mt-10 ${className}`} aria-label="Continue">
      <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">
        Continue
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to={playTo}
          className="group rounded-xl border border-primary/30 bg-primary/10 p-4 transition-all hover:border-primary/60"
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <Swords className="h-4 w-4 text-primary" />
            {playLabel}
            <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">No account needed — starts in seconds.</p>
        </Link>

        {!user && (
          <Link
            to="/signup"
            className="group rounded-xl border border-border/40 p-4 transition-all hover:border-primary/40"
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <UserPlus className="h-4 w-4 text-primary" />
              Create free account
              <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep your rating, history and streak.</p>
          </Link>
        )}

        {steps.map((s) => (
          <Link
            key={s.to + s.label}
            to={s.to}
            className="group rounded-xl border border-border/40 p-4 transition-all hover:border-primary/40"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {s.label}
              <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </div>
            {s.note && <p className="text-xs text-muted-foreground mt-1">{s.note}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
