import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Flame, Share2, RotateCcw, TrendingUp } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getGuestProgress, markSignupSeen } from "@/lib/guestProgress";
import { track } from "@/lib/track";

/**
 * The post-game offer for paid-traffic and homepage visitors.
 *
 * Why it exists: "Create free account" promises nothing. After a guest has
 * actually played, we can name exactly what an account keeps — the rating they
 * just moved, the win they just took, the streak they are building — which is
 * what turns a paid click into a registration.
 */
interface AdRewardCtaProps {
  outcome: "win" | "loss" | "draw" | null;
  onPlayAgain: () => void;
  onShare: () => void;
  /** Where the visitor came from, for funnel reporting. */
  surface?: string;
  className?: string;
}

export default function AdRewardCta({
  outcome,
  onPlayAgain,
  onShare,
  surface = "hero",
  className = "",
}: AdRewardCtaProps) {
  const progress = useMemo(() => getGuestProgress(), []);

  useEffect(() => {
    markSignupSeen();
    track("signup_offer_seen", { surface, outcome: outcome ?? "unknown", games: progress.games });
  }, [surface, outcome, progress.games]);

  const rewards: { icon: typeof Crown; label: string }[] = [
    { icon: TrendingUp, label: `Keep your rating — ${progress.rating}` },
    {
      icon: Crown,
      label:
        progress.wins > 0
          ? `Save ${progress.wins} ${progress.wins === 1 ? "win" : "wins"} to your record`
          : "Save every game to your record",
    },
    {
      icon: Flame,
      label:
        progress.bestStreak > 1
          ? `Protect your ${progress.bestStreak}-game streak`
          : "Start a daily streak and daily missions",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 ${className}`}
    >
      <p className="font-display text-sm sm:text-base font-bold text-foreground">
        {outcome === "win"
          ? "Nice win — don't lose it"
          : outcome === "loss"
            ? "You are 1 game from your first win"
            : "Your progress is only on this device"}
      </p>

      <ul className="mt-3 space-y-1.5">
        {rewards.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
            {label}
          </li>
        ))}
      </ul>

      <Link
        to="/signup"
        className="mt-4 block"
        onClick={() => track("signup_cta_click", { surface, outcome: outcome ?? "unknown" })}
      >
        <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
          <Crown className="h-4 w-4 mr-2" />
          Create free account — 10 seconds
        </Button>
      </Link>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11 rounded-xl border-primary/30" onClick={onShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="ghost" className="h-11 rounded-xl" onClick={onPlayAgain}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Play again
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Free forever · no download · play again right away
      </p>
    </motion.div>
  );
}
