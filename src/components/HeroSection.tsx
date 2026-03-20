import { ArrowRight, Users, Trophy, Zap, Crown, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-chess.jpg";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedCounter from "@/components/AnimatedCounter";
import TypingAnimation from "@/components/TypingAnimation";
import AnimatedGradientBg from "@/components/AnimatedGradientBg";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Background image with Ken Burns */}
      <div className="absolute inset-0">
        <motion.img
          src={heroImage}
          alt="Chess board with golden pieces"
          className="h-full w-full object-cover"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 8, ease: "easeOut" }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      {/* Animated gradient orbs & particles */}
      <AnimatedGradientBg />

      <div className="relative z-10 container mx-auto flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 backdrop-blur-md"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">Free to play · No ads</span>
        </motion.div>

        {/* Headline with typing animation */}
        <motion.h1
          className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <span className="text-gradient-gold">
            <TypingAnimation
              texts={["Learn Chess", "Play Chess", "Master Chess"]}
              speed={100}
              deleteSpeed={50}
              pauseDuration={2500}
            />
          </span>
          <br />
          <motion.span
            className="text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            on MasterChessOnline
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground/90 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          Free online games, lessons, and training.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <Link to={user ? "/play/online" : "/play"}>
            <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg font-bold shadow-glow-lg group animate-glow-pulse">
              Play Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/learn">
            <Button size="lg" variant="outline" className="btn-glow border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md">
              <BookOpen className="mr-2 h-4 w-4" /> Start Training
            </Button>
          </Link>
          <Link to="/analysis">
            <Button size="lg" variant="outline" className="btn-glow border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md">
              <Target className="mr-2 h-4 w-4" /> Analyze Games
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.1 }}
        >
          {[
            { icon: Zap, label: "Fast Matchmaking", value: "Instant" },
            { icon: Trophy, label: "Free Tournaments", value: "Daily" },
            { icon: Crown, label: "ELO Rating", value: "Unlimited" },
            { icon: Target, label: "Game Analysis", value: "Stockfish" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center group">
              <motion.div
                className="mx-auto mb-3 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="h-5 w-5 text-primary" />
              </motion.div>
              <div className="font-display text-xl font-bold text-foreground sm:text-2xl">
                <AnimatedCounter value={value} />
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <div className="w-5 h-8 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1">
          <motion.div
            className="w-1 h-2 rounded-full bg-primary"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
