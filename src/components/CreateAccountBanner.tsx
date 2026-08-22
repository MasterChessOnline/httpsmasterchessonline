import { Link } from "react-router-dom";
import { Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { trackSignupCta } from "@/lib/funnel";

interface Props {
  /** Where the banner sits — used for funnel attribution. */
  surface: string;
  /** Headline that says what the player gets right here. */
  headline?: string;
  className?: string;
}

/**
 * "Create free account" surface with a reason attached.
 *
 * A bare "Create an account" converts badly; naming the reward (500 coins,
 * online play, a real rating) is what makes an ad visitor register. Renders
 * nothing for signed-in players, so it can be dropped on any page.
 */
export default function CreateAccountBanner({ surface, headline, className = "" }: Props) {
  const { user } = useAuth();
  if (user) return null;

  return (
    <div
      className={`rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 via-card to-card p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
            {headline ?? "Create your free account"}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            {[
              "500 coins instantly",
              "Play online",
              "Your own rating & profile",
              "100% free",
            ].map((b) => (
              <li key={b} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <Button
          asChild
          size="lg"
          className="h-12 shrink-0 bg-emerald-500 font-display font-bold uppercase tracking-widest text-black hover:bg-emerald-400"
        >
          <Link to="/signup" onClick={() => trackSignupCta(surface)}>
            <Crown className="mr-2 h-4 w-4" /> Create Free Account
          </Link>
        </Button>
      </div>
    </div>
  );
}
