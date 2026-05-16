import { Zap, Sparkles, Smartphone, Shield, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import chessPiecesBg from "@/assets/chess-pieces-dramatic.jpg";

const promises = [
  { feature: "Real human play, no bots in your matchmaking", value: "Always" },
  { feature: "100% Free forever — every feature unlocked", value: "$0" },
  { feature: "Zero ads, zero popups, zero distractions", value: "0" },
  { feature: "Stockfish analysis on every single game", value: "All games" },
  { feature: "Story Mode + Opening Trainer + Daily Missions", value: "Built-in" },
  { feature: "Cinematic 4D design — feels premium", value: "Native" },
];

const reasons = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant matchmaking and ultra-responsive board. No lag, no waiting.",
    stat: "<1s",
    statLabel: "Load time",
  },
  {
    icon: Shield,
    title: "100% Free Forever",
    description: "No paywall for features. Stockfish analysis, tournaments, lessons — all free.",
    stat: "$0",
    statLabel: "Cost",
  },
  {
    icon: Sparkles,
    title: "Beautiful Design",
    description: "Cinematic UI that makes chess feel premium. Dark theme with golden accents.",
    stat: "5★",
    statLabel: "Design rating",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="relative py-28 overflow-hidden section-depth grain-texture">
      {/* Chess pieces background */}
      <img src={chessPiecesBg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" style={{ opacity: 0.05, filter: "brightness(0.3) saturate(0.5)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.03), transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 relative">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              Why Us
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Why <span className="text-gradient-gold">MasterChess</span> is different
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Built from scratch for players who want real chess — not another feed.
            </p>
          </div>
        </ScrollReveal>

        {/* Promise list (no competitors, no comparisons) */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto mb-20 rounded-2xl glass-elevated overflow-hidden ambient-reflect">
            {promises.map(({ feature, value }, i) => (
              <motion.div
                key={feature}
                className="grid grid-cols-[1fr,auto] gap-4 items-center px-5 py-4 border-b border-border/30 last:border-b-0 hover:bg-primary/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <span className="text-emerald-400 text-lg">✓</span>
                  {feature}
                </div>
                <div className="text-xs font-display font-bold text-gradient-gold uppercase tracking-wider">
                  {value}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Reason Cards */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {reasons.map(({ icon: Icon, title, description, stat, statLabel }, i) => (
            <ScrollReveal key={title} delay={i * 0.1}>
              <motion.div
                className="relative rounded-2xl glass-elevated p-8 text-center h-full overflow-hidden group depth-card light-sweep ambient-reflect"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                  <motion.div
                    className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:shadow-glow transition-shadow duration-500"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="text-2xl font-display font-bold text-gradient-gold" style={{ textShadow: "0 0 15px hsl(43 90% 55% / 0.1)" }}>{stat}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{statLabel}</div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
