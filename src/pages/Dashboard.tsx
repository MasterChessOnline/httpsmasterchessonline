import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveTournament } from "@/hooks/use-active-tournament";
import { useTournamentReminder } from "@/hooks/use-tournament-reminder";
import { useStoryProgress } from "@/hooks/use-story-progress";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { TOTAL_CHAPTERS } from "@/lib/story-data";
import { COURSES } from "@/lib/courses-data";
import { calculateXP } from "@/lib/gamification";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DailyChallenges from "@/components/DailyChallenges";
import DailyMissions from "@/components/DailyMissions";
import XPLevelBadge from "@/components/XPLevelBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Swords, Flame, BookOpen, Bell,
  TrendingUp, Sparkles, Award, Users, Zap, Star, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { activeTournament } = useActiveTournament(user?.id);
  useTournamentReminder(user?.id, () => {});
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const { completedCount: storyCompleted, totalStars: storyStars } = useStoryProgress(user?.id);
  const storyPct = Math.round((storyCompleted / TOTAL_CHAPTERS) * 100);
  const { streak: learningStreak, getCourseProgress } = useLessonProgress();
  const totalCourseLessons = COURSES.reduce((s, c) => s + c.lessons.length, 0);
  const totalCompleted = COURSES.reduce((s, c) => s + getCourseProgress(c.id, c.lessons.length).completed, 0);
  const overallLearningPct = totalCourseLessons > 0 ? Math.round((totalCompleted / totalCourseLessons) * 100) : 0;

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("tournament_registrations")
      .select("tournament_id, tournaments(name, starts_at, status, time_control_label)")
      .eq("user_id", user.id)
      .limit(5)
      .then(({ data }) => setUpcomingTournaments(data || []));

    supabase
      .from("online_games")
      .select("id, result, status, created_at, time_control_label, white_player_id, black_player_id")
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentGames(data || []));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-5xl mx-auto space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!user || !profile) return null;

  const winRate = profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0;
  const xp = calculateXP(profile, {
    lessonsCompleted: totalCompleted,
    streakDays: learningStreak.current_streak,
    storyChapters: storyCompleted,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Welcome + XP Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <XPLevelBadge xp={xp} size="lg" />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Welcome, <span className="text-gradient-gold">{profile.display_name || "Player"}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {xp.toLocaleString()} XP earned · Keep playing to level up!
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/play">
                <Button size="sm"><Swords className="mr-2 h-4 w-4" /> Play Now</Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="sm" variant="outline"><BarChart3 className="mr-2 h-4 w-4" /> Leaderboard</Button>
              </Link>
            </div>
          </motion.div>

          {/* Active tournament banner */}
          {activeTournament && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-primary/30 bg-primary/10 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/20 p-2.5"><Trophy className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{activeTournament.tournament_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeTournament.tournament_status === "active"
                      ? `🔴 Live · Round ${activeTournament.current_round}/${activeTournament.total_rounds}`
                      : "Starting soon"} · {activeTournament.time_control_label}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate(`/tournaments/${activeTournament.tournament_id}`)}>
                <Zap className="h-3 w-3 mr-1" /> Go to Lobby
              </Button>
            </motion.div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "ELO Rating", value: profile.rating, icon: TrendingUp },
              { label: "Games", value: profile.games_played, icon: Swords },
              { label: "Win Rate", value: `${winRate}%`, icon: Trophy },
              { label: "Streak", value: learningStreak.current_streak, icon: Flame },
              { label: "Total XP", value: xp.toLocaleString(), icon: Sparkles },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-3 sm:p-4 text-center"
              >
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1.5 text-primary" />
                <p className="font-mono text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Improve */}
              <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Quick Improve
                </h2>
                <p className="text-sm text-muted-foreground mb-4">1 lesson + 1 quick game = sharper skills in 10 min.</p>
                <div className="flex gap-2">
                  <Link to="/learn" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full"><BookOpen className="mr-2 h-4 w-4" /> 1 Lesson</Button>
                  </Link>
                  <Link to="/play" className="flex-1">
                    <Button size="sm" className="w-full"><Swords className="mr-2 h-4 w-4" /> 1 Quick Game</Button>
                  </Link>
                </div>
              </div>

              {/* Recent games */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <Swords className="h-5 w-5 text-primary" /> Recent Games
                  </h2>
                  {recentGames.length > 0 && <Link to="/history" className="text-xs text-primary hover:underline">View All →</Link>}
                </div>
                {recentGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No games yet. <Link to="/play/online" className="text-primary hover:underline">Play your first game!</Link>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentGames.map(g => {
                      const isWhite = g.white_player_id === user.id;
                      const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                      const drew = g.result === "1/2-1/2";
                      return (
                        <div key={g.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${won ? "bg-green-500/15 text-green-400" : drew ? "bg-muted text-muted-foreground" : "bg-red-500/15 text-red-400"}`}>
                              {won ? "WIN" : drew ? "DRAW" : "LOSS"}
                            </span>
                            <span className="text-sm text-foreground">{isWhite ? "White" : "Black"} · {g.time_control_label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-primary font-semibold">+{won ? 25 : drew ? 10 : 10} XP</span>
                            <p className="text-[10px] text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Progress tracking */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Progress
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-mono text-primary font-bold">{totalCompleted}/{totalCourseLessons}</span>
                    </div>
                    <Progress value={overallLearningPct} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Story Mode</span>
                      <span className="font-mono text-primary font-bold">{storyCompleted}/{TOTAL_CHAPTERS}</span>
                    </div>
                    <Progress value={storyPct} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">ELO → {Math.ceil(profile.rating / 100) * 100 + 100}</span>
                      <span className="font-mono text-primary font-bold">{profile.rating}</span>
                    </div>
                    <Progress value={((profile.rating % 100) / 100) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Tournaments */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" /> Tournaments
                </h2>
                {upcomingTournaments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No tournaments. <Link to="/tournaments" className="text-primary hover:underline">Browse tournaments</Link>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingTournaments.map((reg: any) => (
                      <div key={reg.tournament_id} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">{reg.tournaments?.name}</p>
                          <p className="text-xs text-muted-foreground">{reg.tournaments?.time_control_label}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{reg.tournaments?.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Daily Missions */}
              <DailyMissions />

              {/* Quick Actions */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { to: "/learn", icon: BookOpen, label: "Browse Lessons" },
                    { to: "/tournaments", icon: Trophy, label: "Join Tournament" },
                    { to: "/achievements", icon: Award, label: "Achievements" },
                    { to: "/friends", icon: Users, label: "Friends" },
                    { to: `/profile/${user.id}`, icon: TrendingUp, label: "View Profile" },
                    { to: "/analysis", icon: Sparkles, label: "Analyze Game" },
                    { to: "/leaderboard", icon: BarChart3, label: "Leaderboard" },
                  ].map(a => (
                    <Link to={a.to} key={a.label} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <a.icon className="mr-2 h-4 w-4 text-primary" /> {a.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Daily Challenges (puzzles) */}
              <DailyChallenges />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
