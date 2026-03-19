import { Users, Gamepad2, Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";

const stats = [
  { icon: Users, label: "Players Online", value: "2.4K+" },
  { icon: Gamepad2, label: "Games Played", value: "150K+" },
  { icon: Brain, label: "Puzzles Solved", value: "80K+" },
  { icon: TrendingUp, label: "Avg. Rating Gain", value: "+120" },
];

const StatsSection = () => {
  return (
    <section className="relative border-t border-border/50 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />

      <div className="container mx-auto px-6 relative">
        <ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 text-center glass-border group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: "hsl(43 80% 55% / 0.3)" }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
                <Icon className="h-5 w-5 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-widest">{label}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default StatsSection;
