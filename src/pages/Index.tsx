import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeFaqSection from "@/components/HomeFaqSection";
import SupporterCTA from "@/components/SupporterCTA";
import DiscoverStrip from "@/components/DiscoverStrip";
import SiteRating from "@/components/SiteRating";
import ReviewsCta from "@/components/ReviewsCta";
import DailyKingBanner from "@/components/DailyKingBanner";
import SeasonBanner from "@/components/SeasonBanner";
import InviteFriendsCard from "@/components/friends/InviteFriendsCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Swords,
  Trophy,
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Eye,
  Target,
  Crown,
  Zap,
  ChevronRight,
  Clock,
  Play,
  Brain,
  Volume2,
  VolumeX,
  Sparkles,
  LogIn,
} from "lucide-react";
import { getRank } from "@/lib/ranks";
import RankBadge from "@/components/RankBadge";
import heroImage from "@/assets/hero-chess.jpg";
import posterImage from "@/assets/masterchess-poster.jpg";
import nikolaAvatar from "@/assets/nikola-bot-avatar.jpg";
import serbiaFlag from "@/assets/serbia-flag.png.asset.json";
import { Instagram } from "lucide-react";

import ParallaxCard from "@/components/ParallaxCard";
// Heavy animated background — desktop only, lazy-loaded to keep mobile bundle/CPU light.
const ChessUniverseBackground = React.lazy(() => import("@/components/ChessUniverseBackground"));
import DailyMissions from "@/components/DailyMissions";
import DailyMysteryBox from "@/components/DailyMysteryBox";
import DailyPuzzleWidget from "@/components/DailyPuzzleWidget";
import DailyRewards7Strip from "@/components/DailyRewards7Strip";
import ShopHomeStrip from "@/components/ShopHomeStrip";

import TrustStrip from "@/components/TrustStrip";
import ActivityPulse from "@/components/ActivityPulse";
import { useI18n } from "@/i18n/I18nProvider";
import LivePlayerCounter from "@/components/LivePlayerCounter";
import InstallAppButton from "@/components/InstallAppButton";

import FounderNote from "@/components/landing/FounderNote";
import { MarginNote, ScribbleArrow } from "@/components/landing/HumanMargin";
import AnimatedLogoHero from "@/components/AnimatedLogoHero";
import LazyMount from "@/components/LazyMount";
import WinStreakFlame from "@/components/WinStreakFlame";
import BeatNikolaTeaser from "@/components/BeatNikolaTeaser";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import SocialFollowStrip from "@/components/SocialFollowStrip";
import HomeDonationTopStrip from "@/components/HomeDonationTopStrip";
import HeroDonationCard from "@/components/HeroDonationCard";

// Below-the-fold heavy sections — code-split to shrink initial JS bundle
// and stabilize first paint on mobile.
const HomeSpinWheelSection = React.lazy(() => import("@/components/HomeSpinWheelSection"));
const LiveActivityFeed = React.lazy(() => import("@/components/LiveActivityFeed"));
const WhyMasterChess = React.lazy(() => import("@/components/landing/WhyMasterChess"));
const WhyInvest = React.lazy(() => import("@/components/landing/WhyInvest"));
const TestimonialsCarousel = React.lazy(() => import("@/components/landing/TestimonialsCarousel"));
const ProofStrip = React.lazy(() => import("@/components/landing/ProofStrip"));
const Manifesto = React.lazy(() => import("@/components/landing/Manifesto"));
const WallOfReasons = React.lazy(() => import("@/components/landing/WallOfReasons"));
const StickyJoinBar = React.lazy(() => import("@/components/landing/StickyJoinBar"));

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
const SectionHeader = React.forwardRef<
  HTMLElement,
  {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    action?: React.ReactNode;
    delay?: number;
  }
>(({ title, icon: Icon, action, children, delay = 0 }, ref) => (
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
      <Link
        to="/settings"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/30 bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all duration-200"
      >
        More Settings
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
};

const Index = () => {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const { allowHeavy } = useDeviceCapability();
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [winStreak, setWinStreak] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  // Parallax / scale only on capable devices. On mobile/low-end this caused
  // scroll lag because the hero image was constantly transformed.
  const imgY = useTransform(scrollYProgress, [0, 1], allowHeavy ? ["0%", "25%"] : ["0%", "0%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], allowHeavy ? [1, 0.95] : [1, 1]);

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

      const { data: leaders } = await supabase
        .from("profiles")
        .select("user_id, display_name, rating, games_won, games_played")
        .order("rating", { ascending: false })
        .limit(5);
      if (leaders) setTopPlayers(leaders);
    };
    fetchData();
  }, [user]);

  const winRate =
    profile && profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Heavy animated bg: skip entirely on mobile/low-end to protect LCP & INP. */}
      {allowHeavy && (
        <React.Suspense fallback={null}>
          <ChessUniverseBackground />
        </React.Suspense>
      )}
      <Seo
        title={"MasterChess — Play Chess Online, Tournaments & Analysis"}
        description={
          "Play chess online vs players or AI bots, join free tournaments, analyze games with Stockfish, and learn openings — no puzzles, just real chess."
        }
        path="/"
        type="website"
      />
      <HomeDonationTopStrip />
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
              decoding="async"
              // React requires lowercase DOM attribute; uppercase prop name triggers a warning.
              {...({ fetchpriority: "high" } as any)}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/55 to-background" />
          {/* Scan-line futuristic overlay — desktop only (pure decoration). */}
          {allowHeavy && <div className="absolute inset-0 scan-line pointer-events-none" />}

          <motion.div
            className="container mx-auto max-w-4xl text-center relative z-10 pt-8"
            style={{ opacity: heroOpacity }}
          >
            <AnimatedLogoHero tagline={t("hero.tagline")} />

            {/* Prominent donation card inside hero */}
            <HeroDonationCard />

            {/* Above-fold rule: ONE big CTA. The signup card was moved below fold
                to remove friction for first-time visitors. */}


            {/* CTA Buttons with ripple + glow */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {/* Guests → instant /play-guest (no signup wall). Logged-in users → real online matchmaking. */}
              <Link to={user ? "/play/online" : "/play-guest"}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="ripple-btn h-14 px-10 text-base font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg hover:shadow-[0_0_60px_hsl(43_90%_55%/0.5)] transition-all duration-300"
                  >
                    <Play className="h-5 w-5 mr-2 fill-current" />
                    {user ? t("hero.playOnline") : "Play Now"}
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

            {/* Play vs Nikola — direct challenge against the creator */}
            <motion.div
              className="mt-4 mx-auto max-w-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <Link
                to="/beat-nikola"
                className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-primary/40 bg-gradient-to-r from-amber-500/10 via-background/70 to-amber-500/10 p-3 sm:p-4 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)] hover:border-primary/70 hover:shadow-[0_0_40px_-6px_hsl(var(--primary)/0.7)] transition-all"
              >
                <img
                  src={nikolaAvatar}
                  alt="Nikola Šakotić — creator of MasterChess, 3500 rated"
                  width={64}
                  height={64}
                  loading="lazy"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-primary/50 shadow-lg shrink-0"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-primary flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-sm overflow-hidden shrink-0 shadow-sm ring-1 ring-foreground/10">
                      <img src={serbiaFlag.url} alt="Serbia" className="w-full h-full object-cover" />
                    </span>
                    Nikola Sakotić · Creator · 3500
                  </p>
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-tight">
                    Play against the MasterChess creator himself
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                    I built this entire site. I know every opening, every trap, every endgame. Think you can beat me?
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold px-4 py-2 shadow-md group-hover:scale-105 transition-transform shrink-0">
                  Challenge me →
                </span>
              </Link>
            </motion.div>

            {/* Handwritten margin note — small human signal under the CTAs */}
            <div className="mt-4 flex justify-center items-center gap-2 text-primary/70">
              <ScribbleArrow className="hidden sm:block text-primary/50" />
              <MarginNote rotate={-2} className="text-base sm:text-lg">
                real chess, real people — no bots pretending to be human
              </MarginNote>
            </div>

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
              ].map((item) => (
                <Link key={item.to} to={item.to}>
                  <motion.div
                    className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border border-border/20 glass-4d group"
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* Live player counter + streak flame */}
            <motion.div
              className="mt-6 flex justify-center items-center gap-3 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <LivePlayerCounter />
              {winStreak >= 3 && <WinStreakFlame streak={winStreak} />}
              <BeatNikolaTeaser />
            </motion.div>
          </motion.div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="container mx-auto px-4 pb-24 space-y-12 max-w-5xl relative z-10">
          {/* Daily Challenge — the single daily ritual on home */}
          <section id="daily-missions" className="scroll-mt-24 space-y-4">
            <SectionHeader title="Daily Challenge" icon={Target}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LazyMount minHeight={180}><DailyPuzzleWidget /></LazyMount>
                <LazyMount minHeight={180}><DailyMissions compact /></LazyMount>
              </div>
            </SectionHeader>
          </section>

          {/* Daily King — single recognition banner */}
          <LazyMount minHeight={120}><DailyKingBanner /></LazyMount>

          {/* ─── QUICK MATCH — Arcade-style time control launcher ─── */}
          <SectionHeader title="Quick Match" icon={Zap} action={<ActivityPulse />}>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {[
                {
                  tc: "1+0",
                  label: "Bullet",
                  icon: "⚡",
                  color: "from-red-500/20 to-orange-500/10",
                  border: "border-red-500/30 hover:border-red-400/60",
                  erupt: "0 90% 60%",
                },
                {
                  tc: "3+0",
                  label: "Blitz",
                  icon: "🔥",
                  color: "from-orange-500/20 to-amber-500/10",
                  border: "border-orange-500/30 hover:border-orange-400/60",
                  erupt: "25 95% 58%",
                },
                {
                  tc: "5+0",
                  label: "Blitz",
                  icon: "💨",
                  color: "from-amber-500/20 to-yellow-500/10",
                  border: "border-amber-500/30 hover:border-amber-400/60",
                  erupt: "43 90% 55%",
                },
                {
                  tc: "10+0",
                  label: "Rapid",
                  icon: "⚔️",
                  color: "from-emerald-500/20 to-teal-500/10",
                  border: "border-emerald-500/30 hover:border-emerald-400/60",
                  erupt: "160 85% 50%",
                },
                {
                  tc: "15+10",
                  label: "Classical",
                  icon: "👑",
                  color: "from-blue-500/20 to-indigo-500/10",
                  border: "border-blue-500/30 hover:border-blue-400/60",
                  erupt: "220 90% 62%",
                },
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
                      <div className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight relative z-10">
                        {tc.tc}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold relative z-10">
                        {tc.label}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Secondary play modes — gamey row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              {[
                { to: "/play", icon: Swords, label: "vs Bots", sub: "9 personalities" },
                { to: "/friends", icon: Users, label: "Challenge", sub: "A friend" },
                { to: "/tournaments", icon: Trophy, label: "Tournaments", sub: "Live now" },
                { to: "/spectate", icon: Eye, label: "Spectate", sub: "Top games" },
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
              <ParallaxCard className="rounded-xl" intensity={allowHeavy ? 4 : 0} glowColor="hsl(43 90% 55% / 0.08)">
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
                      ].map((s) => (
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
                        {recentGames.slice(0, 5).map((g) => {
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
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70 font-semibold">
                Between matches
              </p>
              <Link
                to="/guides"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
              >
                All guides <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { to: "/openings", icon: BookOpen, label: "Openings" },
                { to: "/training", icon: Brain, label: "Training" },
                { to: "/analysis", icon: Eye, label: "Analysis" },
                { to: "/learn", icon: GraduationCap, label: "Lessons" },
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
            <SectionHeader
              title="Recent Games"
              icon={Clock}
              action={
                <Link
                  to="/history"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5 font-medium"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              }
            >
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
                          <div
                            className={`w-2 h-8 rounded-full shrink-0 ${won ? "bg-primary" : drew ? "bg-muted-foreground/30" : "bg-destructive/60"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {won ? "Victory" : drew ? "Draw" : "Defeat"} · {g.time_control_label}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {moveCount} moves · {new Date(g.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-bold ${won ? "text-primary" : drew ? "text-muted-foreground" : "text-destructive"}`}
                          >
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
            <SectionHeader
              title="Leaderboard"
              icon={Trophy}
              action={
                <Link
                  to="/leaderboard"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5 font-medium"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              }
            >
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
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : i === 1
                                ? "bg-muted text-foreground"
                                : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {i === 0 ? <Crown className="h-4 w-4" /> : `#${i + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {p.display_name || "Anonymous"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {p.games_played} games · {p.games_won} wins
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold text-primary">{p.rating}</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </SectionHeader>
          )}

        </div>

        {/* Share MasterChess — site-wide share card */}
        <section className="px-4 pb-16">
          <div className="max-w-2xl mx-auto">
            <InviteFriendsCard variant="share" />
          </div>
        </section>

        {/* Supporter / tip CTA — keeps the project ad-free */}
        <SupporterCTA />

        {/* FAQ — bottom of home, adds FAQPage rich snippet to Google */}
        <HomeFaqSection />
      </main>

      <Footer />

      <React.Suspense fallback={null}>
        <StickyJoinBar />
      </React.Suspense>
    </div>
  );
};

export default Index;
