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
import { getTodaysPuzzle, getTodayDateString } from "@/lib/daily-puzzles";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Crown, Trophy, Swords, Flame, BookOpen, Bell,
  TrendingUp, Calendar, Sparkles, Target, Award, Users, Zap, Star, CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
  time: string;
  type: "tournament" | "lesson" | "streak" | "achievement";
}

const Dashboard = () => {
  const { user, profile, isPremium, subscriptionTier, loading } = useAuth();
  const navigate = useNavigate();
  const { activeTournament } = useActiveTournament(user?.id);
  useTournamentReminder(user?.id, (name, min) => {
    // The browser notification is handled inside the hook
    // This callback can be used for in-app toasts if desired
  });
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [puzzleStreak, setPuzzleStreak] = useState(0);
  const [dailySolved, setDailySolved] = useState(false);
  const { completedCount: storyCompleted, totalStars: storyStars } = useStoryProgress(user?.id);
  const storyPct = Math.round((storyCompleted / TOTAL_CHAPTERS) * 100);
  const { streak: learningStreak, getCourseProgress } = useLessonProgress();
  const totalCourseLessons = COURSES.reduce((s, c) => s + c.lessons.length, 0);
  const totalCompleted = COURSES.reduce((s, c) => s + getCourseProgress(c.id, c.lessons.length).completed, 0);
  const overallLearningPct = totalCourseLessons > 0 ? Math.round((totalCompleted / totalCourseLessons) * 100) : 0;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Fetch upcoming tournaments user is registered for
    supabase
      .from("tournament_registrations")
      .select("tournament_id, tournaments(name, starts_at, status, time_control_label)")
      .eq("user_id", user.id)
      .limit(5)
      .then(({ data }) => {
        setUpcomingTournaments(data || []);
      });

    // Fetch recent games
    supabase
      .from("online_games")
      .select("id, result, status, created_at, time_control_label, white_player_id, black_player_id")
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRecentGames(data || []);
      });

    // Calculate puzzle streak (consecutive days with solves)
    supabase
      .from("puzzle_solves")
      .select("puzzle_date")
      .eq("user_id", user.id)
      .eq("solved", true)
      .order("puzzle_date", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setPuzzleStreak(0);
          return;
        }
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dates = [...new Set(data.map(d => d.puzzle_date))].sort().reverse();
        for (let i = 0; i < dates.length; i++) {
          const expected = new Date(today);
          expected.setDate(expected.getDate() - i);
          const dateStr = expected.toISOString().split("T")[0];
          if (dates[i] === dateStr) {
            streak++;
          } else {
            break;
          }
        }
        setPuzzleStreak(streak);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-5xl mx-auto space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user || !profile) return null;

  const winRate = profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100)
    : 0;

  const notifications: Notification[] = [
    {
      id: "1",
      icon: Trophy,
      title: "Daily Tournament Starting Soon",
      description: "A new blitz tournament starts in 30 minutes. Join now!",
      time: "30m",
      type: "tournament",
    },
    {
      id: "2",
      icon: Flame,
      title: puzzleStreak > 0 ? `${puzzleStreak}-day streak! Keep going!` : "Start your streak today!",
      description: puzzleStreak > 0
        ? "Complete today's puzzles to extend your streak."
        : "Solve daily puzzles to build your training streak.",
      time: "Today",
      type: "streak",
    },
    {
      id: "3",
      icon: BookOpen,
      title: "New Lesson Available",
      description: "DailyChess_12 posted a new opening guide on YouTube.",
      time: "2h",
      type: "lesson",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Welcome header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome back, <span className="text-gradient-gold">{profile.display_name || "Player"}</span>
              </h1>
              <p className="text-muted-foreground mt-1">Here's your chess journey at a glance.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/play/online">
                <Button size="sm">
                  <Swords className="mr-2 h-4 w-4" /> Play Now
                </Button>
              </Link>
              <Link to="/learn">
                <Button size="sm" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" /> Learn
                </Button>
              </Link>
            </div>
          </div>

          {/* Active tournament banner */}
          {activeTournament && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/20 p-2.5">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{activeTournament.tournament_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeTournament.tournament_status === "active"
                      ? `🔴 Live · Round ${activeTournament.current_round}/${activeTournament.total_rounds}`
                      : `Starting soon`}
                    {" · "}{activeTournament.time_control_label}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate(`/tournaments/${activeTournament.tournament_id}`)}>
                <Zap className="h-3 w-3 mr-1" /> Go to Lobby
              </Button>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "ELO Rating", value: profile.rating, icon: TrendingUp, color: "text-primary" },
              { label: "Games Played", value: profile.games_played, icon: Swords, color: "text-primary" },
              { label: "Win Rate", value: `${winRate}%`, icon: Trophy, color: "text-primary" },
              { label: "Day Streak", value: puzzleStreak, icon: Flame, color: "text-primary" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Membership status */}
              <div className={`rounded-xl border p-5 ${isPremium ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card/80"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? "bg-primary/20" : "bg-muted"}`}>
                      <Crown className={`h-5 w-5 ${isPremium ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {isPremium ? `Premium ${subscriptionTier ? `(${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)})` : ""}` : "Free Plan"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isPremium
                          ? "Full access to all premium features"
                          : "Upgrade to unlock exclusive content & tournaments"}
                      </p>
                    </div>
                  </div>
                  {!isPremium && (
                    <Link to="/premium">
                      <Button size="sm" className="shadow-glow">
                        <Sparkles className="mr-2 h-4 w-4" /> Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Progress tracking */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Progress Tracking
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Games to next milestone</span>
                      <span className="text-foreground font-medium">{profile.games_played} / {Math.ceil((profile.games_played + 1) / 10) * 10}</span>
                    </div>
                    <Progress value={(profile.games_played % 10) * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Daily training streak</span>
                      <span className="text-foreground font-medium">{puzzleStreak} / 7 days</span>
                    </div>
                    <Progress value={Math.min((puzzleStreak / 7) * 100, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">ELO progress</span>
                      <span className="text-foreground font-medium">{profile.rating} / {Math.ceil(profile.rating / 100) * 100 + 100}</span>
                    </div>
                    <Progress value={((profile.rating % 100) / 100) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Recent games */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Swords className="h-5 w-5 text-primary" /> Recent Games
                </h2>
                {recentGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No games yet.{" "}
                    <Link to="/play/online" className="text-primary hover:underline">Play your first game!</Link>
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
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${won ? "bg-accent/20 text-accent-foreground" : drew ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                              {won ? "WIN" : drew ? "DRAW" : "LOSS"}
                            </span>
                            <span className="text-sm text-foreground">{isWhite ? "White" : "Black"} · {g.time_control_label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Learning Progress */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Learning Progress
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Courses Completion</span>
                      <span className="font-mono text-primary font-bold">{totalCompleted}/{totalCourseLessons}</span>
                    </div>
                    <Progress value={overallLearningPct} className="h-2.5" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" /> {learningStreak.current_streak} day streak
                    </span>
                    <span>{overallLearningPct}% complete</span>
                  </div>
                  <Link to="/learn">
                    <Button size="sm" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" /> {totalCompleted > 0 ? "Continue Learning" : "Start Learning"}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Story Mode progress */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Story Mode
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Adventure Progress</span>
                      <span className="font-mono text-primary font-bold">{storyCompleted}/{TOTAL_CHAPTERS}</span>
                    </div>
                    <Progress value={storyPct} className="h-2.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {storyStars} stars earned
                    </span>
                    <span className="text-xs text-muted-foreground">{storyPct}% complete</span>
                  </div>
                  <Link to="/story">
                    <Button size="sm" className="w-full">
                      <Swords className="mr-2 h-4 w-4" /> {storyCompleted > 0 ? "Continue Adventure" : "Start Adventure"}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* AI Analysis CTA */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> DailyChess_12 Analysis
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Play a game against the DailyChess_12 Bot and get instant AI feedback on your mistakes, strengths, and a performance score.
                </p>
                <div className="flex gap-2">
                  <Link to="/play">
                    <Button size="sm">
                      <Swords className="mr-2 h-4 w-4" /> Play vs Bot
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Upcoming tournaments */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" /> Upcoming Tournaments
                </h2>
                {upcomingTournaments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No tournaments registered.{" "}
                    <Link to="/tournaments" className="text-primary hover:underline">Browse tournaments</Link>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingTournaments.map((reg: any) => (
                      <div key={reg.tournament_id} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">{reg.tournaments?.name}</p>
                          <p className="text-xs text-muted-foreground">{reg.tournaments?.time_control_label}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {reg.tournaments?.starts_at ? new Date(reg.tournaments.starts_at).toLocaleDateString() : "TBD"}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{reg.tournaments?.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> Notifications
                </h2>
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <n.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link to="/learn" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4 text-primary" /> Browse Lessons
                    </Button>
                  </Link>
                  <Link to="/tournaments" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Trophy className="mr-2 h-4 w-4 text-primary" /> Join Tournament
                    </Button>
                  </Link>
                  <Link to="/achievements" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Award className="mr-2 h-4 w-4 text-primary" /> View Achievements
                    </Button>
                  </Link>
                  <Link to="/friends" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4 text-primary" /> Friends
                    </Button>
                  </Link>
                  <Link to={`/profile/${user.id}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4 text-primary" /> View Profile
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Booked classes placeholder */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Booked Classes
                </h2>
                <p className="text-sm text-muted-foreground text-center py-4">
                  No classes booked yet.{" "}
                  <Link to="/learn" className="text-primary hover:underline">Book a lesson</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
