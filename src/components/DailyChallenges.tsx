import { useState, useEffect } from "react";
import { Target, Swords, BookOpen, Flame, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface Challenge {
  id: string;
  icon: typeof Target;
  title: string;
  description: string;
  target: number;
  reward: string;
  link: string;
  storageKey: string;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: "play2",
    icon: Swords,
    title: "Play 2 Games",
    description: "Play 2 games today to earn bonus XP",
    target: 2,
    reward: "+20 XP",
    link: "/play",
    storageKey: "dc_play",
  },
  {
    id: "lesson1",
    icon: BookOpen,
    title: "Complete 1 Lesson",
    description: "Finish any lesson from the course library",
    target: 1,
    reward: "+15 XP",
    link: "/learn",
    storageKey: "dc_lesson",
  },
  {
    id: "win1",
    icon: Target,
    title: "Win a Game",
    description: "Win at least 1 game against bot or online",
    target: 1,
    reward: "+25 XP",
    link: "/play",
    storageKey: "dc_win",
  },
];

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getProgress(key: string): number {
  try {
    const data = JSON.parse(localStorage.getItem("daily_challenges") || "{}");
    const today = getTodayKey();
    return data[today]?.[key] || 0;
  } catch { return 0; }
}

export default function DailyChallenges() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const p: Record<string, number> = {};
    DAILY_CHALLENGES.forEach(c => { p[c.storageKey] = getProgress(c.storageKey); });
    setProgress(p);
  }, []);

  const completedCount = DAILY_CHALLENGES.filter(c => (progress[c.storageKey] || 0) >= c.target).length;
  const allDone = completedCount === DAILY_CHALLENGES.length;

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> Daily Challenges
        </h2>
        <span className="text-xs text-muted-foreground font-mono">
          {completedCount}/{DAILY_CHALLENGES.length}
        </span>
      </div>

      {allDone && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 mb-4 text-center">
          <Flame className="h-5 w-5 text-green-400 mx-auto mb-1" />
          <p className="text-xs font-semibold text-green-400">All challenges completed! 🎉</p>
        </div>
      )}

      <div className="space-y-3">
        {DAILY_CHALLENGES.map(c => {
          const current = progress[c.storageKey] || 0;
          const done = current >= c.target;
          const pct = Math.min((current / c.target) * 100, 100);

          return (
            <div key={c.id} className={`rounded-lg border p-3 transition-all ${done ? "border-green-500/30 bg-green-500/5" : "border-border/30 bg-muted/10"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-green-500/20" : "bg-primary/10"}`}>
                  {done ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <c.icon className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${done ? "text-green-400 line-through" : "text-foreground"}`}>{c.title}</p>
                    <span className="text-[10px] text-primary font-mono">{c.reward}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.description}</p>
                  <div className="mt-1.5">
                    <Progress value={pct} className="h-1" />
                    <p className="text-[9px] text-muted-foreground mt-0.5">{current}/{c.target}</p>
                  </div>
                </div>
              </div>
              {!done && (
                <Link to={c.link}>
                  <Button size="sm" variant="ghost" className="w-full mt-2 text-xs h-7">
                    Go →
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
