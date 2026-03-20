import { Zap, Sparkles, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const reasons = [
  {
    icon: Zap,
    title: "Faster Than Chess.com",
    description: "Instant matchmaking, zero bloat. Jump into games in seconds with our lightweight platform.",
  },
  {
    icon: Sparkles,
    title: "Cleaner Than Lichess",
    description: "Modern, clean design with intuitive navigation. No clutter, just chess.",
  },
  {
    icon: Smartphone,
    title: "Built for Modern Players",
    description: "Mobile-first, responsive design with smooth animations and real-time features.",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="relative border-t border-border/50 py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container mx-auto px-6 relative">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              Why Us
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Why Choose <span className="text-gradient-gold">MasterChessOnline</span>?
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {reasons.map(({ icon: Icon, title, description }, i) => (
            <ScrollReveal key={title} delay={i * 0.1}>
              <motion.div
                className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-8 text-center h-full glass-border"
                whileHover={{ y: -8, borderColor: "hsl(43 80% 55% / 0.3)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
                <div className="relative">
                  <motion.div
                    className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-glow"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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
