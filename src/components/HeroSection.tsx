import { ArrowRight, Zap, Trophy, Crown, Target, BookOpen, Sword, Users, Flame, Wifi, BarChart3, GraduationCap, Shield, Swords, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/chess-cinematic-board.jpg";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedGradientBg from "@/components/AnimatedGradientBg";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const FloatingPiece = ({ piece, delay, x, y, size }: { piece: string; delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute text-primary/10 font-display select-none pointer-events-none"
    style={{ left: x, top: y, fontSize: size, transformStyle: "preserve-3d", filter: `drop-shadow(0 0 20px hsl(43 90% 55% / 0.12))` }}
    initial={{ opacity: 0, y: 30, rotateY: -15 }}
    animate={{ opacity: 1, y: 0, rotateY: 0 }}
    transition={{ delay, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
  >
    <motion.span
      className="inline-block"
      animate={{ y: [0, -18, 0], rotateY: [0, 10, -10, 0], rotateX: [0, 3, -3, 0] }}
      transition={{ duration: 7 + Math.random() * 4, repeat: Infinity, ease: "easeInOut", delay }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {piece}
    </motion.span>
  </motion.div>
);

const activities = [
  "GrandMaster_Alex won a Blitz game in 23 moves",
  "ChessNinja42 earned a 15-day streak badge 🔥",
  "Tournament: Weekly Blitz starting in 2 hours",
  "Sarah_K reached 1400 ELO rating! 📈",
  "DarkKnight99 won 5 games in a row! 🏆",
];

const LiveTicker = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex(i => (i + 1) % activities.length), 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-2 overflow-hidden h-5">
      <div className="w-2 h-2 rounded-full bg-emerald animate-pulse flex-shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span key={index} className="text-xs text-muted-foreground/70 whitespace-nowrap"
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}>
          {activities[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const LiveStreamBadge = () => {
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.functions.invoke("youtube-live-check");
        if (data) setIsLive(!!data.isLive);
      } catch {}
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);
  if (!isLive) return null;
  return (
    <Link to="/live">
      <motion.div
        className="flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/15 px-3 py-1 backdrop-blur-sm cursor-pointer hover:bg-destructive/25 transition-colors"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
        </span>
        <Radio className="w-3 h-3 text-destructive" />
        <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Live Now</span>
      </motion.div>
    </Link>
  );
};



const HeroSection = () => {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setHeadlineIdx(i => (i + 1) % headlines.length), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] overflow-hidden" style={{ perspective: "1200px" }}>
      {/* Parallax hero image with 3D depth */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <motion.img src={heroImage} alt="Chess board" className="h-[120%] w-full object-cover"
          initial={{ scale: 1.3, filter: "brightness(0.15) saturate(0.7)" }}
          animate={{ scale: 1.05, filter: "brightness(0.45) saturate(1.1)" }}
          transition={{ duration: 4.5, ease: "easeOut" }} loading="eager" />
      </motion.div>

      {/* Layered gradients for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/60 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      {/* Vignette overlay */}
      <div className="absolute inset-0 vignette" />

      {/* 3D floating chess pieces */}
      <FloatingPiece piece="♚" delay={0.5} x="5%" y="15%" size={80} />
      <FloatingPiece piece="♛" delay={0.8} x="85%" y="20%" size={60} />
      <FloatingPiece piece="♞" delay={1.1} x="10%" y="70%" size={50} />
      <FloatingPiece piece="♜" delay={1.4} x="90%" y="65%" size={55} />

      <AnimatedGradientBg />

      {/* Cinematic ambient glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(43 90% 55% / 0.06), transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(30 60% 40% / 0.04), transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <motion.div className="relative z-10 container mx-auto flex min-h-[100svh] flex-col items-center justify-center px-6 text-center" style={{ opacity, scale }}>
        <motion.div className="mb-6 flex items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
          <LiveTicker />
          <LiveStreamBadge />
        </motion.div>

        <motion.div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 backdrop-blur-md glass-border"
          initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Crown className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">Play · Learn · Compete</span>
        </motion.div>

        <motion.h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[5.5rem]"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}>
          <span className="relative inline-block overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span key={headlineIdx} className="text-gradient-gold inline-block"
                initial={{ y: 50, opacity: 0, rotateX: -40 }} animate={{ y: 0, opacity: 1, rotateX: 0 }}
                exit={{ y: -50, opacity: 0, rotateX: 40 }} transition={{ duration: 0.5 }}
                style={{ textShadow: "0 0 40px hsl(43 90% 55% / 0.2)" }}>
                {headlines[headlineIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          <motion.span className="text-foreground" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            style={{ textShadow: "0 2px 20px hsl(30 8% 2% / 0.5)" }}>
            Your Chess Game
          </motion.span>
        </motion.h1>

        <motion.p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground/90 leading-relaxed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.3 }}>
          Play against players worldwide, learn with interactive lessons, and climb the ranks.
          Your next great game starts here.
        </motion.p>

        <motion.div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.6 }}>
          <Link to={user ? "/play/online" : "/play"}>
            <Button size="lg" className="btn-neon bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg font-bold shadow-glow-lg group relative overflow-hidden shimmer gold-reflection">
              <span className="relative z-10 flex items-center">
                <Wifi className="mr-2 h-5 w-5" /> Play Online
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Link to="/play">
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md glass-border">
              <Swords className="mr-2 h-4 w-4" /> Play vs Bot
            </Button>
          </Link>
          <Link to="/learn">
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md glass-border">
              <BookOpen className="mr-2 h-4 w-4" /> Learn Chess
            </Button>
          </Link>
        </motion.div>

        <motion.div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-3xl"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 2 }}>
          {[
            { icon: Users, label: "Online Now", value: "2,847", color: "text-emerald" },
            { icon: Zap, label: "Games Today", value: "14,203", color: "text-primary" },
            { icon: Trophy, label: "Tournaments", value: "Daily", color: "text-primary" },
            { icon: Target, label: "Analysis", value: "Stockfish", color: "text-primary" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label}
              className="text-center group rounded-xl glass-elevated px-3 py-3 depth-card light-sweep gold-edge"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.03 }}>
              <Icon className={`h-4 w-4 ${color} mx-auto mb-1.5 transition-all group-hover:drop-shadow-[0_0_10px_hsl(43_90%_55%/0.5)]`} />
              <div className="font-display text-lg font-bold text-foreground">{value}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
