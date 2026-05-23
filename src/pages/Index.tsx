import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteRating from "@/components/SiteRating";
import InviteFriendsCard from "@/components/friends/InviteFriendsCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Swords, Trophy, GraduationCap, BookOpen, Users, BarChart3,
  Eye, Target, Crown, Zap,
  ChevronRight, Clock, Play, Brain,
  Volume2, VolumeX, Sparkles, LogIn
} from "lucide-react";
import { getRank } from "@/lib/ranks";
import RankBadge from "@/components/RankBadge";
import heroImage from "@/assets/hero-chess.jpg";
import posterImage from "@/assets/masterchess-poster.jpg";
import { Instagram } from "lucide-react";

import ParallaxCard from "@/components/ParallaxCard";
import DynamicBackground from "@/components/DynamicBackground";
import DailyMissions from "@/components/DailyMissions";
import DailyPuzzleWidget from "@/components/DailyPuzzleWidget";

import TrustStrip from "@/components/TrustStrip";
import ActivityPulse from "@/components/ActivityPulse";
import { useI18n } from "@/i18n/I18nProvider";
import LivePlayerCounter from "@/components/LivePlayerCounter";
import WhyMasterChess from "@/components/landing/WhyMasterChess";
import WhyInvest from "@/components/landing/WhyInvest";
import TestimonialsCarousel from "@/components/landing/TestimonialsCarousel";
import ProofStrip from "@/components/landing/ProofStrip";
import Manifesto from "@/components/landing/Manifesto";
import WallOfReasons from "@/components/landing/WallOfReasons";
import StickyJoinBar from "@/components/landing/StickyJoinBar";
import InstallAppButton from "@/components/InstallAppButton";
import PlayAnywhereSection from "@/components/PlayAnywhereSection";
import FounderNote from "@/components/landing/FounderNote";
import { MarginNote, ScribbleArrow } from "@/components/landing/HumanMargin";

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
const SectionHeader = React.forwardRef<HTMLElement, {
  title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode; delay?: number;
}>(({ title, icon: Icon, action, children, delay = 0 }, ref) => (
  <section ref={ref} className="space-y-5">
    <motion.div
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2.5 tracking-wide">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {title}
      </h2>
      {action}
    </motion.div>
    {children}
  </section>
));
SectionHeader.displayName = "SectionHeader";

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
  const { t } = useI18n();
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [winStreak, setWinStreak] = useState(0);

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
      <Seo title={"MasterChess — Play Chess Online, Tournaments & Analysis"} description={"Play chess online vs players or AI bots, join free tournaments, analyze games with Stockfish, and learn openings — no puzzles, just real chess."} path="/" type="website" />
      <Navbar />

      <main>
      {/* ── HERO with parallax + 4D depth ── */}
      <div ref={heroRef} className="relative pt-16 sm:pt-24 pb-16 px-4 overflow-hidden min-h-[45vh]">
        <motion.div className="absolute inset-0" style={{ y: imgY, scale: heroScale }}>
          <img
            src={heroImage}
            alt="Chess board"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-[120%] object-cover"
            style={{ filter: "brightness(0.28) saturate(0.85)" }}
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/55 to-background" />
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

            <h1 className="relative font-display text-5xl sm:text-7xl lg:text-8xl font-black mb-3 tracking-tight uppercase [text-shadow:0_0_40px_hsl(var(--primary)/0.22),0_0_90px_hsl(var(--primary)/0.14),0_0_160px_hsl(var(--primary)/0.08)]">
              <span className="text-gradient-gold">Master</span>
              <span className="text-foreground">Chess</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-2 font-light tracking-wide uppercase">
              {t("hero.tagline")}
            </p>
          </motion.div>

          {/* Login prompt for guests above Play Online */}
          {!user && (
            <motion.div
              className="mb-3 flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 backdrop-blur-sm text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <span className="text-primary">🔥 {t("hero.signupCta")}</span>
                <span className="text-muted-foreground">—</span>
                <Link to="/signup" className="text-primary hover:text-primary/80 underline underline-offset-2">{t("hero.joinFree")}</Link>
                <span className="text-muted-foreground">{t("common.or", "or")}</span>
                <Link to="/login" className="text-muted-foreground hover:text-foreground underline underline-offset-2">{t("hero.login")}</Link>
              </span>
            </motion.div>
          )}

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
                  className="ripple-btn h-14 px-10 text-base font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg hover:shadow-[0_0_60px_hsl(43_90%_55%/0.5)] transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  {t("hero.playOnline")}
                </Button>
              </motion.div>
            </Link>
            <Link to="/play">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="ripple-btn h-14 px-8 text-base border-border/40 hover:bg-muted/20 hover:border-primary/30 rounded-xl transition-all duration-300"
                >
                  <Swords className="h-5 w-5 mr-2" />
                  vs Bots
                </Button>
              </motion.div>
            </Link>
            <InstallAppButton variant="hero" />
          </motion.div>

          {/* Quick Actions with hover lift */}
          <motion.div
            className="flex justify-center gap-3 sm:gap-4 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { to: "/training", icon: Brain, label: "Training" },
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

          {/* Live player counter — real-time engagement signal */}
          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <LivePlayerCounter />
          </motion.div>
        </motion.div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto px-4 pb-24 space-y-12 max-w-5xl relative z-10">

        {/* Instagram poster + follow CTA — directly under hero, above Daily */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative -mt-4"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-2">
              Follow <span className="text-gradient-gold">MasterChess</span> on Instagram
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
              Behind-the-scenes, results, and the story of how a 13-year-old is building the future of chess.
            </p>

            <a
              href="https://www.instagram.com/masterchess.live?igsh=MWl6ZjIzcGJuMGllaA=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open MasterChess Instagram profile"
              className="block group relative rounded-2xl overflow-hidden border border-primary/30 bg-card/40 backdrop-blur-sm shadow-2xl hover:border-primary/70 transition-all duration-300"
              style={{ boxShadow: "0 25px 60px -15px hsl(43 90% 55% / 0.25)" }}
            >
              <img
                src={posterImage}
                alt="MasterChess — 13 years old, already winning. Founded by Nikola Šakotić."
                loading="lazy"
                className="w-full h-auto object-contain block group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            <div className="mt-6 flex justify-center">
              <a
                href="https://www.instagram.com/masterchess.live?igsh=MWl6ZjIzcGJuMGllaA=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold uppercase tracking-wider text-sm shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
              >
                <Instagram className="h-4 w-4" />
                @masterchess.live
              </a>
            </div>
          </div>
        </motion.section>

        {/* Daily Challenge — directly below the hero, first thing users see */}
        <section id="daily-missions" className="scroll-mt-24 -mt-4">
          <SectionHeader title="Daily Challenge" icon={Target}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DailyPuzzleWidget />
              <DailyMissions compact />
            </div>
          </SectionHeader>
        </section>

        {/* User Preferences */}
        <motion.div
          className="flex items-center justify-between flex-wrap gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <PreferenceToggles />
        </motion.div>

        {/* ─── QUICK MATCH — Arcade-style time control launcher ─── */}
        <SectionHeader title="Quick Match" icon={Zap}
          action={<ActivityPulse />}>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {[
              { tc: "1+0",   label: "Bullet",     icon: "⚡", color: "from-red-500/20 to-orange-500/10",    border: "border-red-500/30 hover:border-red-400/60",       erupt: "0 90% 60%" },
              { tc: "3+0",   label: "Blitz",      icon: "🔥", color: "from-orange-500/20 to-amber-500/10",  border: "border-orange-500/30 hover:border-orange-400/60", erupt: "25 95% 58%" },
              { tc: "5+0",   label: "Blitz",      icon: "💨", color: "from-amber-500/20 to-yellow-500/10",  border: "border-amber-500/30 hover:border-amber-400/60",   erupt: "43 90% 55%" },
              { tc: "10+0",  label: "Rapid",      icon: "⚔️", color: "from-emerald-500/20 to-teal-500/10",  border: "border-emerald-500/30 hover:border-emerald-400/60", erupt: "160 85% 50%" },
              { tc: "15+10", label: "Classical",  icon: "👑", color: "from-blue-500/20 to-indigo-500/10",   border: "border-blue-500/30 hover:border-blue-400/60",     erupt: "220 90% 62%" },
            ].map((tc, i) => (
              <motion.div
                key={tc.tc}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link to={`/play/online?tc=${encodeURIComponent(tc.tc)}`}>
                  <motion.div
                    style={{ ["--erupt-color" as any]: tc.erupt, animationDelay: `${i * 0.4}s` }}
                    className={`erupt-conic erupt-aura erupt-flare relative rounded-xl border ${tc.border} bg-gradient-to-br ${tc.color} backdrop-blur p-3 sm:p-4 text-center transition-all duration-300`}
                    whileHover={{ y: -8, scale: 1.08, rotateZ: -1 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <motion.div
                      className="text-2xl sm:text-3xl mb-1"
                      animate={{ scale: [1, 1.15, 1], rotate: [0, i % 2 ? 6 : -6, 0] }}
                      transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    >
                      {tc.icon}
                    </motion.div>
                    <div className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight relative z-10">{tc.tc}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold relative z-10">{tc.label}</div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Secondary play modes — gamey row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
            {[
              { to: "/play",         icon: Swords,  label: "vs Bots",     sub: "9 personalities" },
              { to: "/friends",      icon: Users,   label: "Challenge",   sub: "A friend" },
              { to: "/tournaments",  icon: Trophy,  label: "Tournaments", sub: "Live now" },
              { to: "/spectate",     icon: Eye,     label: "Spectate",    sub: "Top games" },
            ].map((m, i) => (
              <motion.div
                key={m.to}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.05, duration: 0.4 }}
              >
                <Link to={m.to}>
                  <motion.div
                    className="rounded-xl border border-border/30 glass-4d p-3 flex items-center gap-2.5 group hover:border-primary/40 transition-all duration-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <m.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{m.sub}</div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
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



        {/* Daily section moved to top of main content (above) */}


        {/* ─── Training shortcuts (de-emphasized — for between matches) ─── */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70 font-semibold">Between matches</p>
            <Link to="/guides" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5">
              All guides <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { to: "/openings",    icon: BookOpen,       label: "Openings" },
              { to: "/training",    icon: Brain,          label: "Training" },
              { to: "/analysis",    icon: Eye,            label: "Analysis" },
              { to: "/learn",       icon: GraduationCap,  label: "Lessons" },
            ].map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link to={item.to}>
                  <div className="rounded-lg border border-border/15 bg-muted/5 hover:bg-muted/15 hover:border-border/30 p-2.5 flex items-center gap-2 transition-all duration-200">
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span className="text-xs text-muted-foreground font-medium truncate">{item.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

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

      {/* Proof strip — instant differentiators */}
      <ProofStrip />

      {/* Marketing landing strips */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <WhyInvest />
          
          <WhyMasterChess />
          <Manifesto />
          <WallOfReasons />
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Install MasterChess — Play Anywhere */}
      <PlayAnywhereSection />

      {/* Share MasterChess — site-wide share card */}
      <section className="px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <InviteFriendsCard variant="share" />
        </div>
      </section>

      </main>

      <SiteRating />
      <Footer />
      <StickyJoinBar />
    </div>
  );
};

export default Index;
