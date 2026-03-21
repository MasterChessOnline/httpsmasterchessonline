import { Swords, GraduationCap, Trophy, Gamepad2, Brain, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  {
    icon: Swords,
    title: "Play Online",
    description: "Instant matchmaking with ELO-based pairing. Bullet, Blitz, Rapid, or Classical.",
    href: "/play/online",
    gradient: "from-primary/20 to-primary/5",
    accent: "bg-primary/10",
    stat: "< 3s",
    statLabel: "Match found",
  },
  {
    icon: Trophy,
    title: "Daily Tournaments",
    description: "Compete in free daily and weekly tournaments. Live leaderboards and ELO rewards.",
    href: "/tournaments",
    gradient: "from-emerald/30 to-emerald/5",
    accent: "bg-emerald/10",
    stat: "24/7",
    statLabel: "Active events",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Stockfish-powered game analysis. See your mistakes, blunders, and best moves instantly.",
    href: "/analysis",
    gradient: "from-accent/30 to-accent/5",
    accent: "bg-accent/10",
    stat: "Depth 20+",
    statLabel: "Analysis",
  },
  {
    icon: GraduationCap,
    title: "Learn & Improve",
    description: "Structured courses from openings to endgames. Interactive lessons with progress tracking.",
    href: "/learn",
    gradient: "from-emerald/20 to-emerald/5",
    accent: "bg-emerald/10",
    stat: "25+",
    statLabel: "Courses",
  },
  {
    icon: BookOpen,
    title: "Story Mode",
    description: "Progress through a chess adventure. Complete challenges, earn stars, unlock rewards.",
    href: "/story",
    gradient: "from-primary/15 to-primary/5",
    accent: "bg-primary/10",
    badge: "Popular",
    stat: "50+",
    statLabel: "Chapters",
  },
  {
    icon: Gamepad2,
    title: "Opening Trainer",
    description: "Master chess openings with interactive drills. Build your repertoire move by move.",
    href: "/openings",
    gradient: "from-primary/25 to-primary/5",
    accent: "bg-primary/10",
    stat: "100+",
    statLabel: "Openings",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const FeaturesSection = () => {
  return (
    <section className="relative border-t border-border/50 py-28 overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/3 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-3 w-3" />
              Features
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Everything to <span className="text-gradient-gold">Master Chess</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Built by chess players, for chess players. Every feature you need.
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map(({ icon: Icon, title, description, href, badge, gradient, accent, stat, statLabel }) => (
            <motion.div key={title} variants={cardVariants}>
              <Link
                to={href}
                className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 block h-full overflow-hidden hover:border-primary/30 transition-all duration-500"
              >
                {/* Gradient accent on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <motion.div
                      className={`inline-flex rounded-xl p-3 ${accent} group-hover:shadow-glow transition-all duration-300`}
                      whileHover={{ rotate: 12, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    {badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20 animate-pulse">
                        {badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">{description}</p>

                  {/* Stat highlight */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div>
                      <span className="text-lg font-display font-bold text-gradient-gold">{stat}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider ml-2">{statLabel}</span>
                    </div>
                    <motion.div
                      className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
