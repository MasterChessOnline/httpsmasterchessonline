import { Zap, Sparkles, Smartphone, Shield, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const comparisons = [
  { feature: "Play Online", us: true, competitor1: true, competitor2: true },
  { feature: "100% Free", us: true, competitor1: false, competitor2: true },
  { feature: "No Ads", us: true, competitor1: false, competitor2: false },
  { feature: "Stockfish Analysis", us: true, competitor1: false, competitor2: true },
  { feature: "Story Mode", us: true, competitor1: false, competitor2: false },
  { feature: "Modern Design", us: true, competitor1: false, competitor2: false },
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
    <section className="relative py-28 overflow-hidden section-depth">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
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
              Why Choose <span className="text-gradient-gold">MasterChessOnline</span>?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              See how we compare to the biggest chess platforms
            </p>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto mb-20 rounded-2xl glass-elevated overflow-hidden ambient-reflect">
            <div className="grid grid-cols-4 gap-0 text-center text-sm border-b border-border/50 bg-card/80">
              <div className="p-4 font-display font-semibold text-muted-foreground text-left">Feature</div>
              <div className="p-4 font-display font-bold text-gradient-gold">MasterChess</div>
              <div className="p-4 font-display font-semibold text-muted-foreground">Chess.com</div>
              <div className="p-4 font-display font-semibold text-muted-foreground">Lichess</div>
            </div>
            {comparisons.map(({ feature, us, competitor1, competitor2 }, i) => (
              <motion.div
                key={feature}
                className="grid grid-cols-4 gap-0 text-center text-sm border-b border-border/30 last:border-b-0 hover:bg-primary/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="p-3 text-left text-muted-foreground">{feature}</div>
                <div className="p-3"><span className="text-lg">{us ? "✅" : "❌"}</span></div>
                <div className="p-3"><span className="text-lg">{competitor1 ? "✅" : "❌"}</span></div>
                <div className="p-3"><span className="text-lg">{competitor2 ? "✅" : "❌"}</span></div>
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
