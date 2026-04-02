import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Wifi, Swords, Trophy, GraduationCap, BookOpen, Users, BarChart3,
  Eye, Target, Shield, Crown, Zap, TrendingUp, Flame,
  ChevronRight, Clock, Award, Star, Play, Brain
} from "lucide-react";
import { getRank } from "@/lib/ranks";
import RankBadge from "@/components/RankBadge";
import heroImage from "@/assets/hero-chess.jpg";

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

/* ── Gold Particles — enhanced with varied glow ── */
function GoldParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            background: `radial-gradient(circle, hsl(43 90% ${50 + Math.random() * 20}% / ${0.4 + Math.random() * 0.3}), transparent)`,
          }}
          animate={{
            y: [0, -(20 + Math.random() * 30), 0],
            opacity: [0.15, 0.6, 0.15],
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: 4 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Floating Chess Pieces — 3D background elements ── */
function FloatingChessPieces() {
  const pieces = [
    { char: "♚", x: "5%", y: "15%", size: 72, delay: 0 },
    { char: "♛", x: "90%", y: "10%", size: 56, delay: 0.8 },
    { char: "♞", x: "8%", y: "70%", size: 48, delay: 1.2 },
    { char: "♜", x: "88%", y: "65%", size: 52, delay: 1.6 },
    { char: "♝", x: "45%", y: "8%", size: 40, delay: 2.0 },
  ];
  return (
    <>
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.07] select-none pointer-events-none"
          style={{ left: p.x, top: p.y, fontSize: p.size, filter: "drop-shadow(0 0 20px hsl(43 90% 55% / 0.15))" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: p.delay, duration: 1.2 }}
        >
          <motion.span
            className="inline-block"
            animate={{ y: [0, -14, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 6 + Math.random() * 3, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          >
            {p.char}
          </motion.span>
        </motion.div>
      ))}
    </>
  );
}

/* ── Section Component — with scroll reveal ── */
const Section = ({ title, icon: Icon, children, action, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode; delay?: number;
}) => (
  <motion.section
    className="space-y-4"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="flex items-center justify-between">
      <h2 className="font-display text-sm sm:text-base font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
        <Icon className="h-4 w-4 text-primary" /> {title}
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

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
    <div className="min-h-screen bg-background grid-bg relative">
      <Navbar />

      {/* ── HERO — Premium Gold with 3D elements ── */}
      <div ref={heroRef} className="relative pt-24 sm:pt-32 pb-16 px-4 overflow-hidden min-h-[50vh]">
        {/* Parallax background image */}
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-[120%] object-cover"
            style={{ filter: "brightness(0.15) saturate(0.7)" }}
            loading="eager"
          />
        </motion.div>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />

        {/* 3D floating chess pieces */}
        <FloatingChessPieces />
        <GoldParticles />

        {/* Gold ambient glow orbs */}
        <motion.div
          className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(43 90% 55% / 0.08), transparent)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-60 h-60 rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(30 60% 40% / 0.06), transparent)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(43 70% 65% / 0.05), transparent)' }} />

        <motion.div className="container mx-auto max-w-4xl text-center relative z-10" style={{ opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Crown icon with glow */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'linear-gradient(135deg, hsl(43 90% 55% / 0.15), hsl(30 60% 40% / 0.1))', border: '1px solid hsl(43 90% 55% / 0.2)', boxShadow: '0 0 30px hsl(43 90% 55% / 0.1)' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crown className="h-8 w-8 text-primary" />
            </motion.div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black mb-3 tracking-tight uppercase">
              <span className="text-gradient-gold">Master</span>
              <span className="text-foreground">Chess</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-md mx-auto mb-10 font-light tracking-wide">
              Your next grandmaster move awaits
            </p>
          </motion.div>

          {/* Main CTA with shine effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link to="/play/online">
              <Button
                size="lg"
                className="h-14 px-12 text-base font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 btn-neon animate-glow-pulse rounded-2xl shimmer relative overflow-hidden shadow-glow-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Enter Chess
              </Button>
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="flex justify-center gap-4 mt-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { to: "/play", icon: Swords, label: "Play" },
              { to: "/learn", icon: Brain, label: "Training" },
              { to: "/analysis", icon: Eye, label: "Analysis" },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl glass-neon hover:border-primary/30 transition-all group card-hover"
              >
                <item.icon className="h-5 w-5 text-primary group-hover:drop-shadow-[0_0_8px_hsl(43_90%_55%/0.5)] transition-all" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto px-4 pb-24 space-y-10 max-w-5xl">

        {/* Performance Snapshot */}
        {user && profile && (
          <Section title="Your Performance" icon={BarChart3}>
            <div className="rounded-xl glass-elevated p-5 relative overflow-hidden inner-glow light-sweep ambient-reflect">
              <div className="relative flex flex-col sm:flex-row items-center gap-5">
                <div className="flex items-center gap-4">
                  <RankBadge rating={profile.rating} size="lg" />
                  <div>
                    <p className="font-display text-3xl font-bold text-primary">{profile.rating}</p>
                    <p className="text-xs text-muted-foreground">{getRank(profile.rating).label} · ELO</p>
                  </div>
                </div>
                <div className="flex gap-5 sm:ml-auto text-center">
                  {[
                    { v: profile.games_won, l: "Wins", c: "text-primary" },
                    { v: profile.games_drawn, l: "Draws", c: "text-muted-foreground" },
                    { v: profile.games_lost, l: "Losses", c: "text-destructive" },
                    { v: `${winRate}%`, l: "Win Rate", c: "text-accent" },
                  ].map(s => (
                    <div key={s.l}>
                      <p className={`font-mono text-xl font-bold ${s.c}`}>{s.v}</p>
                      <p className="text-[10px] text-muted-foreground">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Last 5 + streak */}
              <div className="mt-4 flex items-center gap-3 flex-wrap relative">
                <span className="text-xs text-muted-foreground">Last 5:</span>
                <div className="flex gap-1">
                  {recentGames.slice(0, 5).map(g => {
                    const isWhite = g.white_player_id === user.id;
                    const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                    const drew = g.result === "1/2-1/2";
                    return (
                      <motion.span
                        key={g.id}
                        className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${won ? "bg-primary/20 text-primary" : drew ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {won ? "W" : drew ? "D" : "L"}
                      </motion.span>
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

        {/* Trending Highlights */}
        <Section title="Trending" icon={TrendingUp}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Eye, value: liveGamesCount, label: "Games Live", color: "text-primary" },
              { icon: Crown, value: topPlayers.length > 0 ? topPlayers[0].rating : "—", label: "Top Rating", color: "text-accent" },
              { icon: Trophy, value: activeTournaments, label: "Tournaments", color: "text-primary" },
              { icon: Star, value: topPlayers.reduce((sum, p) => sum + p.games_played, 0), label: "Total Games", color: "text-accent" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="rounded-xl glass-elevated p-4 text-center group relative overflow-hidden depth-card light-sweep"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="relative">
                  <item.icon className={`h-5 w-5 ${item.color} mx-auto mb-1.5 group-hover:drop-shadow-[0_0_8px_hsl(43_90%_55%/0.4)] transition-all`} />
                  <p className="font-mono text-lg font-bold text-foreground">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Quick Play Modes */}
        <Section title="Quick Play" icon={Zap}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: "/play/online", icon: Wifi, label: "Play Online", sub: `${liveGamesCount} live` },
              { to: "/play", icon: Swords, label: "Play vs AI", sub: "800-3000 ELO" },
              { to: "/tournaments", icon: Trophy, label: "Tournaments", sub: `${activeTournaments} active` },
              { to: "/friends", icon: Users, label: "Play Friend", sub: "Challenge" },
            ].map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link to={item.to}
                  className="rounded-xl glass-elevated p-5 text-center group block depth-card light-sweep gold-edge">
                  <item.icon className="h-7 w-7 text-primary mx-auto mb-2 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_hsl(43_90%_55%/0.5)] transition-all" />
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Daily Focus */}
        {user && (
          <Section title="Daily Focus" icon={Target}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { to: "/openings", icon: BookOpen, label: "Opening Practice", sub: "Master popular openings" },
                { to: "/learn", icon: GraduationCap, label: "Lessons", sub: "Step-by-step training" },
                { to: "/play", icon: Swords, label: "Practice vs Bot", sub: "Train against AI" },
              ].map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link to={item.to} className="flex items-center gap-3 rounded-xl glass-elevated p-4 group depth-card gold-edge">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:shadow-glow transition-shadow duration-300">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Recent Games */}
        {user && recentGames.length > 0 && (
          <Section title="Recent Games" icon={Clock}
            action={<Link to="/history" className="text-xs text-primary hover:underline flex items-center gap-0.5">View All <ChevronRight className="h-3 w-3" /></Link>}>
            <div className="space-y-1.5">
              {recentGames.slice(0, 5).map((g, i) => {
                const isWhite = g.white_player_id === user.id;
                const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                const drew = g.result === "1/2-1/2";
                const moveCount = g.pgn ? g.pgn.split(" ").filter(Boolean).length : 0;
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <Link to="/history"
                      className="flex items-center gap-3 rounded-xl glass-elevated p-3 group depth-card">
                      <div className={`w-2 h-8 rounded-full ${won ? "bg-primary" : drew ? "bg-muted-foreground/30" : "bg-destructive/60"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {won ? "Victory" : drew ? "Draw" : "Defeat"} · {g.time_control_label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{moveCount} moves · {new Date(g.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold ${won ? "text-primary" : drew ? "text-muted-foreground" : "text-destructive"}`}>
                        {g.result || "?"}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Top Players */}
        <Section title="Leaderboard" icon={Trophy}
          action={<Link to="/leaderboard" className="text-xs text-primary hover:underline flex items-center gap-0.5">View All <ChevronRight className="h-3 w-3" /></Link>}>
          <div className="space-y-1.5">
            {topPlayers.map((p, i) => (
              <motion.div
                key={p.user_id}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link to={`/profile/${p.user_id}`}
                  className="flex items-center gap-3 rounded-xl glass-elevated p-3 group depth-card">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-primary/20 text-primary border border-primary/30" :
                    i === 1 ? "bg-muted text-foreground" :
                    "bg-muted/30 text-muted-foreground"
                  }`}>
                    {i === 0 ? <Crown className="h-4 w-4" /> : `#${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.display_name || "Anonymous"}</p>
                    <p className="text-[10px] text-muted-foreground">{p.games_played} games · {p.games_won} wins</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">{p.rating}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Navigation Hub */}
        <Section title="Explore" icon={ChevronRight}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { to: "/play/online", icon: Swords, label: "Play" },
              { to: "/learn", icon: GraduationCap, label: "Learn" },
              { to: "/leaderboard", icon: Award, label: "Leaderboard" },
              { to: user ? `/profile/${user.id}` : "/login", icon: Users, label: "Profile" },
              { to: "/settings", icon: Shield, label: "Settings" },
            ].map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link to={item.to}
                  className="rounded-xl glass-elevated p-4 text-center group block depth-card light-sweep gold-edge">
                  <item.icon className="h-5 w-5 text-primary mx-auto mb-1.5 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_hsl(43_90%_55%/0.5)] transition-all" />
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
