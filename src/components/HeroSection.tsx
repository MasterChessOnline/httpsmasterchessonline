import { ArrowRight, Zap, Trophy, Crown, Target, BookOpen, Sword, Users, Flame, Wifi, BarChart3, GraduationCap, Shield, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-chess.jpg";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedGradientBg from "@/components/AnimatedGradientBg";
import { useRef, useState, useEffect } from "react";

const FloatingPiece = ({ piece, delay, x, y, size }: { piece: string; delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute text-primary/10 font-display select-none pointer-events-none"
    style={{ left: x, top: y, fontSize: size }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 1 }}
  >
    <motion.span
      animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut", delay }}
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

const headlines = ["Master", "Dominate", "Conquer", "Elevate"];

const HeroSection = () => {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setHeadlineIdx(i => (i + 1) % headlines.length), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <motion.img src={heroImage} alt="Chess board" className="h-[120%] w-full object-cover"
          initial={{ scale: 1.3, filter: "brightness(0.2) saturate(0.8)" }}
          animate={{ scale: 1.05, filter: "brightness(0.5) saturate(1)" }}
          transition={{ duration: 4, ease: "easeOut" }} loading="eager" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/70 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

      <FloatingPiece piece="♚" delay={0.5} x="5%" y="15%" size={80} />
      <FloatingPiece piece="♛" delay={0.8} x="85%" y="20%" size={60} />
      <FloatingPiece piece="♞" delay={1.1} x="10%" y="70%" size={50} />
      <FloatingPiece piece="♜" delay={1.4} x="90%" y="65%" size={55} />

      <AnimatedGradientBg />

      <motion.div className="relative z-10 container mx-auto flex min-h-[100svh] flex-col items-center justify-center px-6 text-center" style={{ opacity }}>
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
          <LiveTicker />
        </motion.div>

        <motion.div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 backdrop-blur-md"
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
                exit={{ y: -50, opacity: 0, rotateX: 40 }} transition={{ duration: 0.5 }}>
                {headlines[headlineIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          <motion.span className="text-foreground" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
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
            <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg font-bold shadow-glow-lg group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <Wifi className="mr-2 h-5 w-5" /> Play Online
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Link to="/play">
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md">
              <Swords className="mr-2 h-4 w-4" /> Play vs Bot
            </Button>
          </Link>
          <Link to="/learn">
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md">
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
              className="text-center group rounded-xl border border-border/30 bg-background/30 backdrop-blur-md px-3 py-3 hover:border-primary/30 transition-all"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.03 }}>
              <Icon className={`h-4 w-4 ${color} mx-auto mb-1.5`} />
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
