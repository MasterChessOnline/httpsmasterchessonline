// Thin ribbon under the navbar pointing at today's Daily Endgame.
// Hides once today's drill is solved, and is dismissable for the session.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flame, X } from "lucide-react";
import { getDailyDrill, getStreak, isDoneToday } from "@/lib/daily-endgame";

const DISMISS_KEY = "mc-daily-endgame-ribbon-dismissed";

export default function DailyEndgameRibbon() {
  const [hidden, setHidden] = useState(true);
  const [streak, setStreak] = useState(0);
  const location = useLocation();
  const drill = getDailyDrill();

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
      setStreak(getStreak().count);
      setHidden(dismissed || isDoneToday());
    } catch {
      setHidden(false);
    }
  }, [location.pathname]);

  const onEndgamePage = location.pathname.startsWith("/endgames");
  const inGame = typeof document !== "undefined" && document.body.dataset.gameActive === "true";
  if (hidden || onEndgamePage || inGame) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 lg:top-16">
      <div className="pointer-events-auto border-b border-primary/30 bg-primary/90 text-primary-foreground shadow-lg">
        <div className="container mx-auto flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold sm:text-sm">
          <Flame className="h-4 w-4 shrink-0" />
          <Link to="/endgames/daily" className="flex-1 truncate hover:underline">
            Endgame of the day: <span className="font-bold">{drill.title}</span>
            {streak > 0 && <span className="hidden sm:inline"> · {streak}-day streak</span>}
          </Link>
          <Link
            to="/endgames/daily"
            className="rounded-md bg-background/90 px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-background sm:text-xs"
          >
            Solve it
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              try {
                sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {
                /* ignore */
              }
              setHidden(true);
            }}
            className="ml-1 rounded p-1 hover:bg-background/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
