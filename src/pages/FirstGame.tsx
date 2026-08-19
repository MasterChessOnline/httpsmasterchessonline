import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Swords, RotateCcw } from "lucide-react";
import Seo from "@/components/Seo";
import InstantHeroBoard from "@/components/InstantHeroBoard";
import BeginnerCoachSheet from "@/components/BeginnerCoachSheet";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";

/**
 * FIRST GAME AFTER SIGNUP (/first-game)
 *
 * Ad traffic must never be dropped into live matchmaking: at this stage there
 * is rarely an opponent waiting, and an empty queue is what a brand-new player
 * reads as "dead site". So a fresh registration plays one game against the
 * weakest bot first, and only the post-game screen offers a live opponent.
 */
export default function FirstGame() {
  const [coach, setCoach] = useState(false);

  useEffect(() => {
    track("first_game_view", { surface: "first-game" });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background">
      <Seo
        path="/first-game"
        title="Your first game — MasterChess"
        description="Play your first chess game against a friendly bot, then take on a live opponent."
        noindex
      />

      <section className="px-5 pt-6 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
          Your account is ready. Play one game.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A friendly bot goes first so you can warm up. A live opponent comes right after.
        </p>
        <button
          onClick={() => {
            track("beginner_primer_open", { surface: "first-game" });
            setCoach(true);
          }}
          className="mt-3 text-xs text-primary underline underline-offset-4"
        >
          I've never played chess — show me how the pieces move
        </button>
      </section>

      <InstantHeroBoard
        adMode
        headingLevel="h2"
        renderPostGame={({ playAgain }) => (
          <div className="mt-4 space-y-2">
            <Link
              to="/play/online?auto=1"
              onClick={() => track("live_game_cta_click", { surface: "first-game" })}
            >
              <Button className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                <Swords className="mr-2 h-4 w-4" />
                Play a live opponent
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11 rounded-xl border-primary/30" onClick={playAgain}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Play the bot again
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" className="h-11 w-full rounded-xl">
                  <Crown className="mr-2 h-4 w-4" />
                  My profile
                </Button>
              </Link>
            </div>
          </div>
        )}
      />

      <BeginnerCoachSheet
        open={coach}
        onOpenChange={setCoach}
        surface="first-game"
        onStart={() => {
          document.getElementById("board")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
