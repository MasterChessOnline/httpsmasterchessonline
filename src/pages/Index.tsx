import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wifi, Swords, Trophy, GraduationCap, BookOpen, Users, BarChart3,
  Eye, Target, Shield, MessageCircle, Crown, Zap, TrendingUp, Flame,
  ChevronRight, Play, Clock, Award, Star
} from "lucide-react";
import { getRank } from "@/lib/ranks";
import RankBadge from "@/components/RankBadge";

interface RecentGame {
  id: string;
  result: string | null;
  time_control_label: string;
  pgn: string;
  created_at: string;
  white_player_id: string;
  black_player_id: string;
}

interface TopPlayer {
  user_id: string;
  display_name: string | null;
  rating: number;
  games_won: number;
  games_played: number;
}

const Section = ({ title, icon: Icon, children, action, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode; delay?: number;
}) => (
  <motion.section
    className="space-y-3"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h2>
      {action}
    </div>
    {children}
  </motion.section>
);

const Index = () => {
  const { user, profile } = useAuth();
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [activeTournaments, setActiveTournaments] = useState(0);
  const [liveGamesCount, setLiveGamesCount] = useState(0);
  const [winStreak, setWinStreak] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data: games } = await supabase
          .from("online_games")
          .select("id, result, time_control_label, pgn, created_at, white_player_id, black_player_id")
          .eq("status", "finished")
          .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(10);
        if (games) {
          setRecentGames(games);
          // Calculate win streak
          let streak = 0;
          for (const g of games) {
            const isWhite = g.white_player_id === user.id;
            const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
            if (won) streak++;
            else break;
          }
          setWinStreak(streak);
        }
      }

      const { data: leaders } = await supabase.from("profiles")
        .select("user_id, display_name, rating, games_won, games_played")
        .order("rating", { ascending: false }).limit(5);
      if (leaders) setTopPlayers(leaders);

      const { count: tCount } = await supabase.from("tournaments")
        .select("id", { count: "exact", head: true })
        .in("status", ["registering", "active"]);
      setActiveTournaments(tCount || 0);

      const { count: gCount } = await supabase.from("online_games")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      setLiveGamesCount(gCount || 0);
    };
    fetchData();
  }, [user]);

  const winRate = profile && profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="pt-20 sm:pt-24 pb-6 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.h1
            className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome to <span className="text-gradient-gold">MasterChess</span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Play, learn, and compete — your competitive chess platform
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 space-y-10 max-w-5xl">

        {/* ── Quick Start Panel ── */}
        <Section title="Quick Start" icon={Zap}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: "/play/online", icon: Wifi, label: "Play Online", sub: `${liveGamesCount} live`, color: "text-emerald-500" },
              { to: "/play", icon: Swords, label: "Play vs Bot", sub: "AI Training", color: "text-blue-500" },
              { to: "/tournaments", icon: Trophy, label: "Tournaments", sub: `${activeTournaments} active`, color: "text-amber-500" },
              { to: "/friends", icon: Users, label: "Play Friend", sub: "Challenge", color: "text-purple-500" },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="rounded-xl border border-border/40 bg-card/80 p-4 text-center hover:border-primary/30 hover:bg-card transition-all group">
                <item.icon className={`h-7 w-7 ${item.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
              </Link>
            ))}
          </div>
        </Section>

        {/* ── Performance Snapshot (logged in) ── */}
        {user && profile && (
          <Section title="Your Performance" icon={BarChart3}>
            <div className="rounded-xl border border-border/40 bg-card/80 p-5">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="flex items-center gap-4">
                  <RankBadge rating={profile.rating} size="lg" />
                  <div>
                    <p className="font-display text-3xl font-bold text-foreground">{profile.rating}</p>
                    <p className="text-xs text-muted-foreground">{getRank(profile.rating).label} · ELO</p>
                  </div>
                </div>
                <div className="flex gap-5 sm:ml-auto text-center">
                  <div>
                    <p className="font-mono text-xl font-bold text-emerald-500">{profile.games_won}</p>
                    <p className="text-[10px] text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <p className="font-mono text-xl font-bold text-muted-foreground">{profile.games_drawn}</p>
                    <p className="text-[10px] text-muted-foreground">Draws</p>
                  </div>
                  <div>
                    <p className="font-mono text-xl font-bold text-destructive">{profile.games_lost}</p>
                    <p className="text-[10px] text-muted-foreground">Losses</p>
                  </div>
                  <div>
                    <p className="font-mono text-xl font-bold text-primary">{winRate}%</p>
                    <p className="text-[10px] text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </div>
              {/* Last 5 results + streak */}
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground">Last 5:</span>
                <div className="flex gap-1">
                  {recentGames.slice(0, 5).map(g => {
                    const isWhite = g.white_player_id === user.id;
                    const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                    const drew = g.result === "1/2-1/2";
                    return (
                      <span key={g.id} className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${won ? "bg-emerald-500/20 text-emerald-500" : drew ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                        {won ? "W" : drew ? "D" : "L"}
                      </span>
                    );
                  })}
                </div>
                {winStreak > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <Flame className="h-3.5 w-3.5" /> {winStreak} win streak
                  </span>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* ── Trending Highlights ── */}
        <Section title="Trending" icon={TrendingUp}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/40 bg-card/80 p-4 text-center">
              <Eye className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="font-mono text-lg font-bold text-foreground">{liveGamesCount}</p>
              <p className="text-[10px] text-muted-foreground">Games Live</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/80 p-4 text-center">
              <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="font-mono text-lg font-bold text-foreground">{topPlayers.length > 0 ? topPlayers[0].rating : "—"}</p>
              <p className="text-[10px] text-muted-foreground">Top Rating</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/80 p-4 text-center">
              <Trophy className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="font-mono text-lg font-bold text-foreground">{activeTournaments}</p>
              <p className="text-[10px] text-muted-foreground">Tournaments</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/80 p-4 text-center">
              <Star className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="font-mono text-lg font-bold text-foreground">{topPlayers.reduce((sum, p) => sum + p.games_played, 0)}</p>
              <p className="text-[10px] text-muted-foreground">Total Games</p>
            </div>
          </div>
        </Section>

        {/* ── Daily Improvement ── */}
        {user && (
          <Section title="Daily Improvement" icon={Target}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/openings" className="rounded-xl border border-border/40 bg-card/80 p-4 hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Opening Practice</p>
                    <p className="text-[10px] text-muted-foreground">Master popular openings</p>
                  </div>
                </div>
              </Link>
              <Link to="/lessons" className="rounded-xl border border-border/40 bg-card/80 p-4 hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Lessons</p>
                    <p className="text-[10px] text-muted-foreground">Step-by-step training</p>
                  </div>
                </div>
              </Link>
              <Link to="/play" className="rounded-xl border border-border/40 bg-card/80 p-4 hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Swords className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Practice vs Bot</p>
                    <p className="text-[10px] text-muted-foreground">Train against AI</p>
                  </div>
                </div>
              </Link>
            </div>
          </Section>
        )}

        {/* ── Recent Games ── */}
        {user && recentGames.length > 0 && (
          <Section title="Recent Games" icon={Clock}
            action={<Link to="/history" className="text-xs text-primary hover:underline flex items-center gap-0.5">View All <ChevronRight className="h-3 w-3" /></Link>}>
            <div className="space-y-1.5">
              {recentGames.slice(0, 5).map(g => {
                const isWhite = g.white_player_id === user.id;
                const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                const drew = g.result === "1/2-1/2";
                const moveCount = g.pgn ? g.pgn.split(" ").filter(Boolean).length : 0;
                return (
                  <Link key={g.id} to="/history"
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                    <div className={`w-2 h-8 rounded-full ${won ? "bg-emerald-500" : drew ? "bg-muted-foreground/30" : "bg-destructive/60"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {won ? "Victory" : drew ? "Draw" : "Defeat"} · {g.time_control_label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{moveCount} moves · {new Date(g.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold ${won ? "text-emerald-500" : drew ? "text-muted-foreground" : "text-destructive"}`}>
                      {g.result || "?"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Navigation Hub ── */}
        <Section title="Explore" icon={ChevronRight}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { to: "/play/online", icon: Wifi, label: "Play" },
              { to: "/learn", icon: GraduationCap, label: "Learn" },
              { to: "/leaderboard", icon: Award, label: "Leaderboard" },
              { to: user ? `/profile/${user.id}` : "/login", icon: Users, label: "Profile" },
              { to: "/settings", icon: Shield, label: "Settings" },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="rounded-xl border border-border/40 bg-card/80 p-3 text-center hover:border-primary/30 transition-all group">
                <item.icon className="h-5 w-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-medium text-foreground">{item.label}</p>
              </Link>
            ))}
          </div>
        </Section>

        {/* ── Learn & Community ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section title="Learn" icon={GraduationCap}>
            <div className="space-y-2">
              {[
                { to: "/lessons", icon: BookOpen, label: "Interactive Lessons", sub: "Step-by-step guided training" },
                { to: "/openings", icon: Target, label: "Opening Trainer", sub: "Master popular openings" },
                { to: "/learn", icon: GraduationCap, label: "All Courses", sub: "Beginner to Advanced" },
              ].map(item => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                  <item.icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>

          <Section title="Community" icon={Users}>
            <div className="space-y-2">
              {[
                { to: "/friends", icon: Users, label: "Friends", sub: "Add friends & challenge them" },
                { to: "/chat", icon: MessageCircle, label: "Chat", sub: "Message your friends" },
                { to: "/clubs", icon: Shield, label: "Clubs", sub: "Join chess communities" },
              ].map(item => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                  <item.icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Top Players ── */}
        <Section title="Leaderboard" icon={Trophy}
          action={<Link to="/leaderboard" className="text-xs text-primary hover:underline flex items-center gap-0.5">Full Ranking <ChevronRight className="h-3 w-3" /></Link>}>
          <div className="space-y-1.5">
            {topPlayers.map((p, i) => {
              const wr = p.games_played > 0 ? Math.round((p.games_won / p.games_played) * 100) : 0;
              return (
                <Link key={p.user_id} to={`/profile/${p.user_id}`}
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                    {i === 0 ? <Crown className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.display_name || "Anonymous"}</p>
                    <p className="text-[10px] text-muted-foreground">{p.games_played} games · {wr}% win rate</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">{p.rating}</span>
                </Link>
              );
            })}
          </div>
        </Section>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
