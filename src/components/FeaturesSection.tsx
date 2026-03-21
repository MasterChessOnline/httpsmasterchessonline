import { Swords, GraduationCap, Trophy, Gamepad2, Brain, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  {
    icon: Swords,
    title: "Free Online Games",
    description: "Play instantly against other users or AI. ELO-based matchmaking from bullet to classical.",
    href: "/play/online",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Trophy,
    title: "Free Tournaments",
    description: "Compete in daily and weekly tournaments with live leaderboards. No entry fee required.",
    href: "/tournaments",
    gradient: "from-emerald/30 to-emerald/5",
  },
  {
    icon: Gamepad2,
    title: "Premium Tournaments",
    description: "Unlock exclusive tournaments with bigger prizes and elite competition for Premium members.",
    href: "/premium",
    badge: "Premium",
    gradient: "from-primary/25 to-primary/5",
  },
  {
    icon: Brain,
    title: "Personalized Daily Training",
    description: "AI-driven exercises based on your activity. Track your streak and earn rewards every day.",
    href: "/learn",
    gradient: "from-accent/30 to-accent/5",
  },
  {
    icon: BookOpen,
    title: "Story Mode Challenges",
    description: "Complete lessons and tournaments as part of a progressive story. Unlock rewards as you advance.",
    href: "/learn",
    badge: "Coming Soon",
    gradient: "from-primary/15 to-primary/5",
  },
  {
    icon: GraduationCap,
    title: "Learn & Improve",
    description: "Structured courses covering openings, tactics, and endgames for every level.",
    href: "/learn",
    gradient: "from-emerald/20 to-emerald/5",
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
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">Features</span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Everything to <span className="text-gradient-gold">Master Chess</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Play for free, compete in tournaments, and unlock premium content.
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
          {features.map(({ icon: Icon, title, description, href, badge, gradient }) => (
            <motion.div key={title} variants={cardVariants}>
              <Link
                to={href}
                className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 block h-full card-cinematic shimmer glow-border overflow-hidden"
              >
                {/* Gradient accent */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <motion.div
                      className="inline-flex rounded-xl p-3 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
                      whileHover={{ rotate: 12, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    {badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
                        {badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-primary text-sm">→</span>
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
