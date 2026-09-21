// /endgames/daily — one endgame per day plus a personal streak.
// The retention loop: come back tomorrow, keep the streak alive.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DrillBoard } from "@/pages/Endgames";
import { getDailyDrill, getStreak, isDoneToday, markDailyDone, todayKey } from "@/lib/daily-endgame";
import { Flame, Trophy, CalendarDays } from "lucide-react";

export default function DailyEndgame() {
  const drill = useMemo(() => getDailyDrill(), []);
  const [streak, setStreak] = useState(() => getStreak());
  const [done, setDone] = useState(() => isDoneToday());

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        path="/endgames/daily"
        title="Daily Endgame — One Position Every Day | MasterChess"
        description="A new chess endgame every day. Solve it, keep your streak alive. Free, no account needed."
      />
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6">
          <Badge className="mb-3 bg-primary/15 text-primary">
            <CalendarDays className="mr-1 h-3 w-3" /> {dateLabel}
          </Badge>
          <h1 className="font-display text-3xl font-black sm:text-4xl">Daily Endgame</h1>
          <p className="mt-2 text-muted-foreground">
            One endgame a day. Win it and your streak grows — miss a day and it resets.
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" /> Streak
            </div>
            <div className="mt-1 text-2xl font-bold">{streak.count}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" /> Best
            </div>
            <div className="mt-1 text-2xl font-bold">{streak.best || streak.count}</div>
          </Card>
          <Card className="col-span-2 p-4 sm:col-span-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Today</div>
            <div className="mt-1 text-sm font-semibold">
              {done ? "Solved — see you tomorrow" : "Not solved yet"}
            </div>
          </Card>
        </div>

        <Card className="border-primary/20 p-4">
          <DrillBoard
            key={todayKey()}
            drill={drill}
            onSolved={() => {
              setStreak(markDailyDone());
              setDone(true);
            }}
          />
        </Card>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/endgames/${drill.id}`}>Read the method</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/endgames">All endgame drills</Link>
          </Button>
          <Button asChild>
            <Link to="/play-guest">Play a full game</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
