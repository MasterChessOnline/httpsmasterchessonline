import { ArrowRight, Zap, Trophy, Crown, Target, BookOpen, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/hero-chess.jpg";
import { useAuth } from "@/contexts/AuthContext";
import TypingAnimation from "@/components/TypingAnimation";
import AnimatedGradientBg from "@/components/AnimatedGradientBg";
import { useRef } from "react";

const HeroSection = () => {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] overflow-hidden">
      {/* Parallax background image */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <motion.img
          src={heroImage}
          alt="Chess board with golden pieces"
          className="h-[120%] w-full object-cover"
          initial={{ scale: 1.2, filter: "brightness(0.3)" }}
          animate={{ scale: 1.05, filter: "brightness(0.6)" }}
          transition={{ duration: 3, ease: "easeOut" }}
          loading="eager"
        />
      </motion.div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      <div className="absolute inset-0 vignette" />

      {/* Animated gradient orbs */}
      <AnimatedGradientBg />

      {/* Horizontal gold line accents */}
      <motion.div
        className="absolute top-[20%] left-0 w-full h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.15) 30%, hsl(var(--primary) / 0.3) 50%, hsl(var(--primary) / 0.15) 70%, transparent 100%)" }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
      />
      <motion.div
        className="absolute bottom-[15%] left-0 w-full h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.1) 30%, hsl(var(--primary) / 0.2) 50%, hsl(var(--primary) / 0.1) 70%, transparent 100%)" }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 2, delay: 1.8 }}
      />

      <motion.div
        className="relative z-10 container mx-auto flex min-h-[100svh] flex-col items-center justify-center px-6 text-center"
        style={{ opacity }}
      >
        {/* Badge */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 backdrop-blur-md shimmer"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">Free to play · No ads</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[5.5rem]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-reveal">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            on{" "}
            <span className="relative">
              <span className="text-gradient-gold">MasterChessOnline</span>
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2, duration: 1 }}
              />
            </span>
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground/90 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          Free online games, lessons, and training — all in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <Link to={user ? "/play/online" : "/play"}>
            <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg font-bold shadow-glow-lg group animate-glow-pulse relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Play Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
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

        {/* Stats row */}
        <motion.div
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.1 }}
        >
          {[
            { icon: Zap, label: "Matchmaking", value: "Instant", color: "text-primary" },
            { icon: Trophy, label: "Tournaments", value: "Daily", color: "text-primary" },
            { icon: Crown, label: "ELO Rating", value: "Free", color: "text-primary" },
            { icon: Target, label: "Analysis", value: "Stockfish", color: "text-primary" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              className="text-center group rounded-xl border border-border/30 bg-background/30 backdrop-blur-md px-4 py-4 hover:border-primary/30 transition-all duration-300"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <motion.div
                className="mx-auto mb-2 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </motion.div>
              <div className="font-display text-lg font-bold text-foreground sm:text-xl">{value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-foreground/15 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 rounded-full bg-primary"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
