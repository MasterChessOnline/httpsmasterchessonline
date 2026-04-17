import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, CheckCircle2, Circle, Swords, Eye, BookOpen, Target, Sparkles, Trophy, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { COURSES } from "@/lib/courses-data";
import { calculateXP } from "@/lib/gamification";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PlanTask {
  id: string;
  title: string;
  desc: string;
  icon: typeof Swords;
  href: string;
  xp: number;
  done: boolean;
  cta: string;
}

const STORAGE_KEY = (uid: string, date: string) => `masterchess.dailyplan.${uid}.${date}`;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DailyPlan() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { streak, getCourseProgress } = useLessonProgress();
  const [gamesToday, setGamesToday] = useState(0);
  const [analyzedToday, setAnalyzedToday] = useState(false);
  const [manualDone, setManualDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Hydrate today's manual checks from local storage
  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(STORAGE_KEY(user.id, todayStr()));
    if (raw) {
      try { setManualDone(JSON.parse(raw)); } catch {}
    }
  }, [user]);

  // Fetch today's real game count
  useEffect(() => {
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    supabase
      .from("online_games")
      .select("id, status, created_at, white_player_id, black_player_id")
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .eq("status", "finished")
      .gte("created_at", start.toISOString())
      .then(({ data }) => setGamesToday(data?.length ?? 0));
  }, [user]);

  const totalCompletedLessons = COURSES.reduce(
    (s, c) => s + getCourseProgress(c.id, c.lessons.length).completed,
    0
  );

  const xpInfo = profile ? calculateXP(profile, {
    lessonsCompleted: totalCompletedLessons,
    streakDays: streak.current_streak,
    storyChaptersCompleted: 0,
    tournamentsPlayed: 0,
    achievementsEarned: 0,
  }) : null;

  const tasks: PlanTask[] = useMemo(() => [
    {
      id: "play-2",
      title: "Play 2 rated games",
      desc: "Real games are the #1 way to improve. Play any time control.",
      icon: Swords,
      href: "/play/online",
      xp: 30,
      done: gamesToday >= 2,
      cta: gamesToday >= 2 ? "Done" : `Play (${gamesToday}/2)`,
    },
    {
      id: "analyze",
      title: "Analyze 1 game",
      desc: "Review your last game — find your turning point.",
      icon: Eye,
      href: "/game-review",
      xp: 20,
      done: analyzedToday || !!manualDone["analyze"],
      cta: "Review",
    },
    {
      id: "lesson",
      title: "Complete 1 short lesson",
      desc: "Concept-based learning. No puzzles, just ideas.",
      icon: BookOpen,
      href: "/learn",
      xp: 15,
      done: !!manualDone["lesson"],
      cta: "Open Learn",
    },
    {
      id: "opening",
      title: "Review 1 opening line",
      desc: "Spend 5 minutes in your repertoire or the opening trainer.",
      icon: Target,
      href: "/openings",
      xp: 15,
      done: !!manualDone["opening"],
      cta: "Train",
    },
  ], [gamesToday, analyzedToday, manualDone]);

  const completed = tasks.filter(t => t.done).length;
  const totalXP = tasks.filter(t => t.done).reduce((s, t) => s + t.xp, 0);
  const pct = Math.round((completed / tasks.length) * 100);
  const allDone = completed === tasks.length;

  const toggleManual = (id: string) => {
    if (!user) return;
    const next = { ...manualDone, [id]: !manualDone[id] };
    setManualDone(next);
    localStorage.setItem(STORAGE_KEY(user.id, todayStr()), JSON.stringify(next));
  };

  if (loading || !user || !profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Daily <span className="text-gradient-gold">Training Plan</span></h1>
              <p className="text-sm text-muted-foreground">Your personalized path. No puzzles — just real practice.</p>
            </div>
          </div>
        </motion.div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatTile icon={CheckCircle2} label="Today" value={`${completed}/${tasks.length}`} accent="emerald-500" />
          <StatTile icon={Flame} label="Streak" value={`${streak.current_streak}d`} accent="orange-500" />
          <StatTile icon={Sparkles} label="XP today" value={`+${totalXP}`} accent="primary" />
          <StatTile icon={Trophy} label="Level" value={`${xpInfo?.level ?? 1}`} accent="primary" />
        </div>

        {/* Progress */}
        <Card className="glass-4d border-primary/20 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Today's progress</p>
            <p className="text-sm text-muted-foreground">{pct}%</p>
          </div>
          <Progress value={pct} className="h-2" />
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-sm text-emerald-400"
            >
              <CheckCircle2 className="w-4 h-4" />
              All done. See you tomorrow, champion.
            </motion.div>
          )}
        </Card>

        {/* Tasks */}
        <div className="space-y-3">
          {tasks.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`glass-4d p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${
                t.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40 hover:border-primary/30"
              }`}>
                <button
                  onClick={() => {
                    // Allow manual mark for non-tracked tasks
                    if (t.id === "lesson" || t.id === "opening" || t.id === "analyze") toggleManual(t.id);
                  }}
                  className="shrink-0"
                  aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                >
                  {t.done ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <Circle className="w-7 h-7 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  t.done ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-primary/10 border border-primary/20"
                }`}>
                  <t.icon className={`w-5 h-5 ${t.done ? "text-emerald-400" : "text-primary"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">+{t.xp} XP</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{t.desc}</p>
                </div>

                <Button asChild variant={t.done ? "outline" : "default"} size="sm" className="shrink-0 w-full sm:w-auto">
                  <Link to={t.href}>
                    {t.cta} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coach link */}
        <Card className="glass-4d border-primary/30 p-5 mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Stuck or need a plan?</p>
            <p className="text-sm text-muted-foreground">Ask MasterCoach what to focus on next based on your rating.</p>
          </div>
          <Button asChild className="shrink-0 w-full sm:w-auto">
            <Link to="/coach">Talk to Coach <ChevronRight className="w-3.5 h-3.5" /></Link>
          </Button>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function StatTile({ icon: Icon, label, value, accent }: { icon: typeof Flame; label: string; value: string; accent: string }) {
  const colorClass = accent === "primary" ? "text-primary" : `text-${accent}`;
  return (
    <Card className="glass-4d border-border/40 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}
