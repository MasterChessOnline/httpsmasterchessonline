// One consistent "Create free account" block for every page a guest can reach.
// Kept intentionally boring and repeatable: same words, same button, everywhere —
// that repetition is what actually converts drive-by ad traffic.
import { Link } from "react-router-dom";
import { UserPlus, Trophy, Timer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateFreeAccountCta({
  className = "",
  reason = "generic",
  title = "Create your free account",
  subtitle = "Keep your rating, your games and your streak. Takes 10 seconds, no card, no download.",
}: {
  className?: string;
  reason?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <aside
      className={`rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 text-center ${className}`}
    >
      <h2 className="text-xl md:text-2xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">{subtitle}</p>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground mb-5">
        <span className="inline-flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-primary" /> Saved rating</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" /> Play real people</span>
        <span className="inline-flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-primary" /> Tournaments</span>
      </div>

      <Button asChild size="lg" className="gap-2">
        <Link to={`/signup?from=${encodeURIComponent(reason)}`}>
          <UserPlus className="h-4 w-4" /> Create free account
        </Link>
      </Button>

      <p className="text-[11px] text-muted-foreground mt-3">
        Already have one? <Link to="/login" className="text-primary hover:underline">Log in</Link>
      </p>
    </aside>
  );
}
