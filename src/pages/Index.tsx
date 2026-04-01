import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Swords, Trophy, GraduationCap, Crown, Users,
  Wifi, Heart, Monitor, Sparkles, ChevronRight
} from "lucide-react";
import { useRef } from "react";
import heroImage from "@/assets/hero-chess.jpg";
import AnimatedCounter from "@/components/AnimatedCounter";

/* ── Floating Chess Pieces ── */
const floatingPieces = [
  { char: "♚", x: "8%", y: "20%", size: 64, delay: 0 },
  { char: "♛", x: "88%", y: "15%", size: 52, delay: 0.5 },
  { char: "♞", x: "12%", y: "75%", size: 44, delay: 1 },
  { char: "♜", x: "85%", y: "70%", size: 48, delay: 1.5 },
  { char: "♝", x: "50%", y: "10%", size: 36, delay: 2 },
];

/* ── Gold Particles ── */
function GoldParticles({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1.5 + Math.random() * 2.5}px`,
            height: `${1.5 + Math.random() * 2.5}px`,
            background: `radial-gradient(circle, hsl(43 90% ${50 + Math.random() * 20}% / ${0.3 + Math.random() * 0.4}), transparent)`,
          }}
          animate={{
            y: [0, -(15 + Math.random() * 25), 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [0.8, 1.2, 0.8],
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

/* ── Stats Bar ── */
const stats = [
  { icon: Users, value: "2.4M+", label: "Active Players" },
  { icon: Trophy, value: "Live", label: "Tournaments" },
  { icon: Crown, value: "Real-time", label: "ELO Tracking" },
];

/* ── Feature Cards ── */
const features = [
  {
    icon: Wifi,
    title: "Play Online",
    desc: "Challenge real opponents worldwide with ELO-based matchmaking.",
    href: "/play/online",
  },
  {
    icon: Monitor,
    title: "Play vs Computer",
    desc: "Practice against AI from beginner to grandmaster level.",
    href: "/play",
  },
  {
    icon: Trophy,
    title: "Tournaments",
    desc: "Compete in daily and weekly tournaments with live standings.",
    href: "/tournaments",
  },
  {
    icon: GraduationCap,
    title: "Learn",
    desc: "Interactive lessons, openings, and game analysis tools.",
    href: "/learn",
    badge: "Coming Soon",
  },
];

const Index = () => {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative min-h-[100svh] overflow-hidden">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <motion.img
            src={heroImage}
            alt="Chess board"
            className="h-[120%] w-full object-cover"
            initial={{ scale: 1.2, filter: "brightness(0.25) saturate(0.8)" }}
            animate={{ scale: 1.05, filter: "brightness(0.4) saturate(1)" }}
            transition={{ duration: 3, ease: "easeOut" }}
            loading="eager"
          />
        </motion.div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

        {/* Floating chess pieces */}
        {floatingPieces.map((p, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/8 font-display select-none pointer-events-none"
            style={{ left: p.x, top: p.y, fontSize: p.size }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: p.delay, duration: 1 }}
          >
            <motion.span
              animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 6 + Math.random() * 3, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            >
              {p.char}
            </motion.span>
          </motion.div>
        ))}

        <GoldParticles count={15} />

        {/* Hero content */}
        <motion.div
          className="relative z-10 container mx-auto flex min-h-[100svh] flex-col items-center justify-center px-6 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Badge */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 backdrop-blur-md"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Free to Play · No Ads</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className="text-foreground">Your Next</span>
            <br />
            <span className="text-gradient-gold">Grandmaster</span>
            <br />
            <span className="text-foreground">Move Awaits</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mx-auto mt-6 max-w-lg text-base sm:text-lg text-muted-foreground/80 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            Play real opponents, join tournaments, track your rating, and improve
            — all on one beautifully crafted platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-3 w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Link to={user ? "/play/online" : "/signup"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto btn-neon bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base font-bold shadow-glow-lg group relative overflow-hidden rounded-xl"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Start Playing Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link to="/play" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-foreground/20 text-foreground hover:bg-foreground/5 px-8 py-5 text-base backdrop-blur-md rounded-xl"
              >
                <Swords className="mr-2 h-4 w-4" /> Play vs Computer
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-foreground/20 text-foreground hover:bg-foreground/5 px-8 py-5 text-base backdrop-blur-md rounded-xl"
              >
                <Heart className="mr-2 h-4 w-4" /> Support Us
              </Button>
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="mx-auto mb-2 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="font-display text-lg sm:text-xl font-bold text-foreground">
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <GoldParticles count={10} />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Sparkles className="h-3 w-3" /> Features
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Everything to <span className="text-gradient-gold">Master Chess</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Built by chess players, for chess players.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, desc, href, badge }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={href}
                  className="group relative block rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 h-full overflow-hidden hover:border-primary/30 transition-all duration-500 card-hover"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        className="inline-flex rounded-xl p-3 bg-primary/10 group-hover:shadow-glow transition-all duration-300"
                        whileHover={{ rotate: 12, scale: 1.15 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="h-5 w-5 text-primary" />
                      </motion.div>
                      {badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
                          {badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-sm font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>

                    <div className="mt-4 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <ChevronRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          VISUAL SHOWCASE
      ════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Left: 3D chess scene */}
            <motion.div
              className="relative aspect-square max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute inset-0 rounded-3xl overflow-hidden border border-border/30">
                <img
                  src={heroImage}
                  alt="Chess board showcase"
                  className="w-full h-full object-cover brightness-[0.6] saturate-[1.1]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />
              </div>

              {/* Floating gold accents */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-md flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Crown className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.div
                className="absolute -bottom-3 -left-3 w-16 h-16 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md flex items-center justify-center"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Trophy className="h-6 w-6 text-primary/70" />
              </motion.div>
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                <Crown className="h-3 w-3" /> Premium Experience
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Designed for <span className="text-gradient-gold">Champions</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every detail is crafted to deliver the ultimate chess experience.
                From real-time ELO tracking to Stockfish-powered analysis,
                MasterChess gives you everything you need to improve.
              </p>

              <div className="space-y-3">
                {[
                  "Stockfish-powered game analysis",
                  "ELO-based matchmaking in under 3 seconds",
                  "Interactive lessons and opening trainers",
                  "Daily tournaments with live leaderboards",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{item}</span>
                  </motion.div>
                ))}
              </div>

              <Link to={user ? "/play/online" : "/signup"} className="inline-block mt-8">
                <Button className="btn-neon bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5 font-bold rounded-xl group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
