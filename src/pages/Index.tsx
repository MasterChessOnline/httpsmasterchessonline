import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Swords, Trophy, GraduationCap, BookOpen, Users, BarChart3,
  Eye, Target, Crown, Zap,
  ChevronRight, Clock, Play, Brain,
  Volume2, VolumeX, Sparkles
} from "lucide-react";
import { getRank } from "@/lib/ranks";
import RankBadge from "@/components/RankBadge";
import heroImage from "@/assets/hero-chess.jpg";

import ParallaxCard from "@/components/ParallaxCard";
import DynamicBackground from "@/components/DynamicBackground";
import DailyMissions from "@/components/DailyMissions";
import ShareInviteDialog from "@/components/ShareInviteDialog";

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

/* ── Section Header — clear hierarchy ── */
const SectionHeader = ({ title, icon: Icon, action, children, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode; delay?: number;
}) => (
  <motion.section
    className="space-y-5"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="flex items-center justify-between">
      <h2 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2.5 tracking-wide">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {title}
      </h2>
      {action}
    </div>
    {children}
  </motion.section>
);

/* ── User Preference Toggles ── */
const PreferenceToggles = () => {
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("chess-sound") !== "off");
  const [animationsOn, setAnimationsOn] = useState(() => localStorage.getItem("chess-animations") !== "off");

  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, value ? "on" : "off");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => toggle("chess-sound", !soundOn, setSoundOn)}
        className={`ripple-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
          soundOn
            ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
            : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/30"
        }`}
        aria-label={soundOn ? "Mute sound" : "Enable sound"}
      >
        {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        Sound {soundOn ? "On" : "Off"}
      </button>
      <button
        onClick={() => toggle("chess-animations", !animationsOn, setAnimationsOn)}
        className={`ripple-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
          animationsOn
            ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
            : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/30"
        }`}
        aria-label={animationsOn ? "Disable animations" : "Enable animations"}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Animations {animationsOn ? "On" : "Off"}
      </button>
      <Link to="/settings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/30 bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all duration-200">
        More Settings
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
};

const Index = () => {
  const { user, profile } = useAuth();
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [winStreak, setWinStreak] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

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
    };
    fetchData();
  }, [user]);

  const winRate = profile && profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative">
      <DynamicBackground />
      <Navbar />

      {/* ── HERO with parallax + 4D depth ── */}
      <div ref={heroRef} className="relative pt-16 sm:pt-24 pb-16 px-4 overflow-hidden min-h-[45vh]">
        <motion.div className="absolute inset-0" style={{ y: imgY, scale: heroScale }}>
          <img
            src={heroImage}
            alt="Chess board"
            className="absolute inset-0 w-full h-[120%] object-cover"
            style={{ filter: "brightness(0.28) saturate(0.8)" }}
            loading="eager"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        {/* Scan-line futuristic overlay */}
        <div className="absolute inset-0 scan-line pointer-events-none" />

        <motion.div className="container mx-auto max-w-4xl text-center relative z-10 pt-8" style={{ opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, hsl(43 90% 55% / 0.15), hsl(30 60% 40% / 0.1))', border: '1px solid hsl(43 90% 55% / 0.2)' }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Crown className="h-7 w-7 text-primary" />
            </motion.div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
              <span className="text-gradient-gold">Master</span>
              <span className="text-foreground">Chess</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-8 font-light tracking-wide">
              Play, learn, and compete — your next great game starts here
            </p>
          </motion.div>

          {/* CTA Buttons with ripple + glow */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link to="/play/online">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="ripple-btn h-12 px-8 text-base font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg hover:shadow-[0_0_40px_hsl(43_90%_55%/0.4)] transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Play Online
                </Button>
              </motion.div>
            </Link>
            <Link to="/play">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="ripple-btn h-12 px-8 text-base border-border/40 hover:bg-muted/20 hover:border-primary/30 rounded-xl transition-all duration-300"
                >
                  <Swords className="h-5 w-5 mr-2" />
                  Play vs AI
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Quick Actions with hover lift */}
          <motion.div
            className="flex justify-center gap-3 sm:gap-4 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { to: "/learn", icon: Brain, label: "Training" },
              { to: "/analysis", icon: Eye, label: "Analysis" },
              { to: "/tournaments", icon: Trophy, label: "Compete" },
            ].map(item => (
              <Link key={item.to} to={item.to}>
                <motion.div
                  className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border border-border/20 glass-4d group"
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <item.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* Invite friends — masterchess.live */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => setInviteOpen(true)}
              className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 hover:from-primary/20 hover:to-primary/20 hover:border-primary/60 backdrop-blur-md transition-all shadow-glow"
              aria-label="Invite friends to masterchess.live"
            >
              <Crown className="h-4 w-4 text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform" />
              <span className="text-xs sm:text-sm font-display uppercase tracking-widest text-foreground">
                Invite friends
              </span>
              <span className="hidden sm:inline text-xs font-mono text-primary/90">
                masterchess.live
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      <ShareInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite friends to MasterChess"
        url="https://masterchess.live"
        message="Join me on MasterChess — play, learn and compete:"
        emailSubject="Join me on MasterChess"
      />

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto px-4 pb-24 space-y-12 max-w-5xl relative z-10">

        {/* User Preferences */}
        <motion.div
          className="flex items-center justify-between flex-wrap gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <PreferenceToggles />
        </motion.div>

        {/* ─── Start Playing Section — Parallax Cards ─── */}
        <SectionHeader title="Start Playing" icon={Swords}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/play/online" className="group">
              <ParallaxCard className="rounded-xl" glowColor="hsl(43 90% 55% / 0.15)">
                <div className="rounded-xl border border-primary/20 glass-4d p-6 hover:border-primary/40 transition-all duration-300 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Play className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Play Online</h3>
                      <p className="text-xs text-muted-foreground">Find an opponent instantly</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["Bullet", "Blitz", "Rapid"].map(tc => (
                      <span key={tc} className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">{tc}</span>
                    ))}
                  </div>
                </div>
              </ParallaxCard>
            </Link>
            <Link to="/play" className="group">
              <ParallaxCard className="rounded-xl" glowColor="hsl(30 60% 40% / 0.12)">
                <div className="rounded-xl border border-border/30 glass-4d p-6 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="h-10 w-10 rounded-lg bg-muted/30 flex items-center justify-center"
                      whileHover={{ rotate: -10, scale: 1.1 }}
                    >
                      <Swords className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Play vs AI</h3>
                      <p className="text-xs text-muted-foreground">Practice against bots (800–3000 ELO)</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["Easy", "Medium", "Hard", "Master"].map(d => (
                      <span key={d} className="text-[10px] px-2 py-1 rounded-md bg-muted/20 text-muted-foreground font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              </ParallaxCard>
            </Link>
          </div>
        </SectionHeader>

        {/* Performance Snapshot */}
        {user && profile && (
          <SectionHeader title="Your Performance" icon={BarChart3}>
            <ParallaxCard className="rounded-xl" intensity={4} glowColor="hsl(43 90% 55% / 0.08)">
              <div className="rounded-xl border border-border/30 glass-4d p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-5">
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
                        <p className="text-[11px] text-muted-foreground">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {recentGames.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">Last 5:</span>
                    <div className="flex gap-1.5">
                      {recentGames.slice(0, 5).map(g => {
                        const isWhite = g.white_player_id === user.id;
                        const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                        const drew = g.result === "1/2-1/2";
                        return (
                          <motion.span
                            key={g.id}
                            whileHover={{ scale: 1.2, y: -2 }}
                            className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center cursor-default ${won ? "bg-primary/20 text-primary" : drew ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}
                          >
                            {won ? "W" : drew ? "D" : "L"}
                          </motion.span>
                        );
                      })}
                    </div>
                    {winStreak > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-primary ml-auto">
                        🔥 {winStreak} win streak
                      </span>
                    )}
                  </div>
                )}
              </div>
            </ParallaxCard>
          </SectionHeader>
        )}

        {/* Daily Missions widget — only for logged-in users */}
        {user && (
          <SectionHeader title="Today's Missions" icon={Target}>
            <DailyMissions compact />
          </SectionHeader>
        )}

        {/* ─── Explore Modes — interactive cards ─── */}
        <SectionHeader title="Explore" icon={Zap}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: "/tournaments", icon: Trophy, label: "Tournaments", desc: "Compete to win" },
              { to: "/friends", icon: Users, label: "Play Friend", desc: "Challenge a friend" },
              { to: "/guess-the-move", icon: Target, label: "Guess the Move", desc: "Find the best move" },
              { to: "/play-like-gm", icon: Crown, label: "Play Like a GM", desc: "GM-style challenges" },
            ].map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link to={item.to}>
                  <motion.div
                    className="rounded-xl border border-border/30 glass-4d p-4 sm:p-5 text-center group block hover:border-primary/30 transition-all duration-300"
                    whileHover={{ y: -6, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-semibold text-foreground mb-0.5">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionHeader>

        {/* ─── Learn & Improve ─── */}
        <SectionHeader title="Learn & Improve" icon={GraduationCap}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { to: "/openings", icon: BookOpen, label: "Opening Explorer", desc: "Master popular openings with move trees & stats" },
              { to: "/learn", icon: GraduationCap, label: "Lessons", desc: "Step-by-step interactive training" },
              { to: "/analysis", icon: Eye, label: "Game Analysis", desc: "Review & analyze your games with AI" },
            ].map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link to={item.to}>
                  <motion.div
                    className="flex items-center gap-4 rounded-xl border border-border/30 glass-4d p-4 group transition-all duration-300 hover:border-primary/30"
                    whileHover={{ x: 6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <motion.div
                      className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors"
                      whileHover={{ rotate: 8 }}
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionHeader>

        {/* Recent Games */}
        {user && recentGames.length > 0 && (
          <SectionHeader title="Recent Games" icon={Clock}
            action={<Link to="/history" className="text-xs text-primary hover:underline flex items-center gap-0.5 font-medium">View All <ChevronRight className="h-3 w-3" /></Link>}>
            <div className="space-y-2">
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
                    <Link to="/history">
                      <motion.div
                        className="flex items-center gap-3 rounded-xl border border-border/20 glass-4d p-3.5 group transition-all duration-300 hover:border-primary/20"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <div className={`w-2 h-8 rounded-full shrink-0 ${won ? "bg-primary" : drew ? "bg-muted-foreground/30" : "bg-destructive/60"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {won ? "Victory" : drew ? "Draw" : "Defeat"} · {g.time_control_label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{moveCount} moves · {new Date(g.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-bold ${won ? "text-primary" : drew ? "text-muted-foreground" : "text-destructive"}`}>
                          {g.result || "?"}
                        </span>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </SectionHeader>
        )}

        {/* Top Players */}
        {topPlayers.length > 0 && (
          <SectionHeader title="Leaderboard" icon={Trophy}
            action={<Link to="/leaderboard" className="text-xs text-primary hover:underline flex items-center gap-0.5 font-medium">View All <ChevronRight className="h-3 w-3" /></Link>}>
            <div className="space-y-2">
              {topPlayers.map((p, i) => (
                <motion.div
                  key={p.user_id}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link to={`/profile/${p.user_id}`}>
                    <motion.div
                      className="flex items-center gap-3 rounded-xl border border-border/20 glass-4d p-3.5 group transition-all duration-300 hover:border-primary/20"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? "bg-primary/20 text-primary border border-primary/30" :
                        i === 1 ? "bg-muted text-foreground" :
                        "bg-muted/30 text-muted-foreground"
                      }`}>
                        {i === 0 ? <Crown className="h-4 w-4" /> : `#${i + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.display_name || "Anonymous"}</p>
                        <p className="text-[11px] text-muted-foreground">{p.games_played} games · {p.games_won} wins</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{p.rating}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </SectionHeader>
        )}


        {/* Quick Links */}
        <SectionHeader title="Quick Links" icon={ChevronRight}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: "/community", icon: Users, label: "Community" },
              { to: "/leaderboard", icon: BarChart3, label: "Leaderboard" },
              { to: user ? `/profile/${user.id}` : "/login", icon: Crown, label: "Profile" },
              { to: "/settings", icon: Zap, label: "Settings" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link to={item.to}>
                  <motion.div
                    className="rounded-xl border border-border/20 glass-4d p-4 text-center group block transition-all duration-300 hover:border-primary/20"
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="h-5 w-5 text-primary mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionHeader>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
