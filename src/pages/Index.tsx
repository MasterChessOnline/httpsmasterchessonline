import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, Swords, Trophy, GraduationCap, BookOpen, Users, BarChart3, Eye, Target, Shield, MessageCircle, Crown } from "lucide-react";
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

const Section = ({ title, icon: Icon, children, delay = 0 }: { title: string; icon: React.ElementType; children: React.ReactNode; delay?: number }) => (
  <motion.section
    className="space-y-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
  >
    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2.5">
      <Icon className="h-5 w-5 text-primary" /> {title}
    </h2>
    {children}
  </motion.section>
);

const Index = () => {
  const { user, profile } = useAuth();
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [activeTournaments, setActiveTournaments] = useState(0);
  const [liveGamesCount, setLiveGamesCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Recent games
      if (user) {
        const { data: games } = await supabase
          .from("online_games")
          .select("id, result, time_control_label, pgn, created_at, white_player_id, black_player_id")
          .eq("status", "finished")
          .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(5);
        if (games) setRecentGames(games);
      }

      // Top players
      const { data: leaders } = await supabase
        .from("profiles")
        .select("user_id, display_name, rating, games_won, games_played")
        .order("rating", { ascending: false })
        .limit(5);
      if (leaders) setTopPlayers(leaders);

      // Active tournaments
      const { count: tCount } = await supabase
        .from("tournaments")
        .select("id", { count: "exact", head: true })
        .in("status", ["registering", "active"]);
      setActiveTournaments(tCount || 0);

      // Live games
      const { count: gCount } = await supabase
        .from("online_games")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      setLiveGamesCount(gCount || 0);
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* Dashboard-like sections below hero */}
      <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">

        {/* Quick Play */}
        <Section title="Quick Play" icon={Swords}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/play/online" className="rounded-xl border border-border/40 bg-card/80 p-4 text-center hover:border-primary/30 transition-all group">
              <Wifi className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground">Play Online</p>
              <p className="text-[10px] text-muted-foreground mt-1">{liveGamesCount} games live</p>
            </Link>
            <Link to="/play" className="rounded-xl border border-border/40 bg-card/80 p-4 text-center hover:border-primary/30 transition-all group">
              <Swords className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground">Play vs Bot</p>
              <p className="text-[10px] text-muted-foreground mt-1">9 difficulty levels</p>
            </Link>
            <Link to="/tournaments" className="rounded-xl border border-border/40 bg-card/80 p-4 text-center hover:border-primary/30 transition-all group">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground">Tournaments</p>
              <p className="text-[10px] text-muted-foreground mt-1">{activeTournaments} active</p>
            </Link>
            <Link to="/friends" className="rounded-xl border border-border/40 bg-card/80 p-4 text-center hover:border-primary/30 transition-all group">
              <Users className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground">Play Friend</p>
              <p className="text-[10px] text-muted-foreground mt-1">Challenge a friend</p>
            </Link>
          </div>
        </Section>

        {/* Rating Overview (logged-in) */}
        {user && profile && (
          <Section title="Your Rating" icon={BarChart3}>
            <div className="rounded-xl border border-border/40 bg-card/80 p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-4">
                <RankBadge rating={profile.rating} size="lg" />
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{profile.rating} ELO</p>
                  <p className="text-xs text-muted-foreground">{getRank(profile.rating).label} · {profile.games_played} games played</p>
                </div>
              </div>
              <div className="flex gap-6 sm:ml-auto text-center">
                <div>
                  <p className="font-mono text-lg font-bold text-emerald">{profile.games_won}</p>
                  <p className="text-[10px] text-muted-foreground">Wins</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-muted-foreground">{profile.games_drawn}</p>
                  <p className="text-[10px] text-muted-foreground">Draws</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-destructive">{profile.games_lost}</p>
                  <p className="text-[10px] text-muted-foreground">Losses</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Recent Games */}
        {user && recentGames.length > 0 && (
          <Section title="Recent Games" icon={Eye}>
            <div className="space-y-1.5">
              {recentGames.map(g => {
                const isWhite = g.white_player_id === user.id;
                const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                const drew = g.result === "1/2-1/2";
                const moveCount = g.pgn ? g.pgn.split(" ").filter(Boolean).length : 0;
                return (
                  <Link key={g.id} to="/history"
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                    <div className={`w-2 h-8 rounded-full ${won ? "bg-emerald" : drew ? "bg-muted-foreground/30" : "bg-destructive/60"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {won ? "Victory" : drew ? "Draw" : "Defeat"} · {g.time_control_label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{moveCount} moves · {new Date(g.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold ${won ? "text-emerald" : drew ? "text-muted-foreground" : "text-destructive"}`}>
                      {g.result || "?"}
                    </span>
                  </Link>
                );
              })}
              <Link to="/history">
                <Button variant="outline" size="sm" className="w-full mt-2">View All Games</Button>
              </Link>
            </div>
          </Section>
        )}

        {/* Learn & Community side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section title="Learn" icon={GraduationCap}>
            <div className="space-y-2">
              <Link to="/lessons" className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Interactive Lessons</p>
                  <p className="text-[10px] text-muted-foreground">Step-by-step guided training</p>
                </div>
              </Link>
              <Link to="/openings" className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                <Target className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Opening Trainer</p>
                  <p className="text-[10px] text-muted-foreground">Master popular openings</p>
                </div>
              </Link>
              <Link to="/learn" className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">All Courses</p>
                  <p className="text-[10px] text-muted-foreground">Beginner to Advanced</p>
                </div>
              </Link>
            </div>
          </Section>

          <Section title="Community" icon={Users}>
            <div className="space-y-2">
              <Link to="/friends" className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Friends</p>
                  <p className="text-[10px] text-muted-foreground">Add friends & challenge them</p>
                </div>
              </Link>
              <Link to="/chat" className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Chat</p>
                  <p className="text-[10px] text-muted-foreground">Message your friends</p>
                </div>
              </Link>
              <Link to="/clubs" className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Clubs</p>
                  <p className="text-[10px] text-muted-foreground">Join chess communities</p>
                </div>
              </Link>
            </div>
          </Section>
        </div>

        {/* Leaderboard */}
        <Section title="Top Players" icon={Trophy}>
          <div className="space-y-1.5">
            {topPlayers.map((p, i) => {
              const winRate = p.games_played > 0 ? Math.round((p.games_won / p.games_played) * 100) : 0;
              return (
                <Link key={p.user_id} to={`/profile/${p.user_id}`}
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 hover:border-primary/30 transition-all">
                  <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.display_name || "Anonymous"}</p>
                    <p className="text-[10px] text-muted-foreground">{p.games_played} games · {winRate}% win rate</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">{p.rating}</span>
                </Link>
              );
            })}
            <Link to="/leaderboard">
              <Button variant="outline" size="sm" className="w-full mt-2">Full Leaderboard</Button>
            </Link>
          </div>
        </Section>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
