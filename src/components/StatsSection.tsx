import { Users, Gamepad2, Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";

const stats = [
  { icon: Users, label: "Real-time Play", value: "Live" },
  { icon: Gamepad2, label: "Fast Matchmaking", value: "Instant" },
  { icon: Brain, label: "Free Courses", value: "25+" },
  { icon: TrendingUp, label: "No Ads", value: "100%" },
];

const StatsSection = () => {
  return (
    <section className="relative border-t border-border/50 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />

      {/* Horizontal accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)" }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      />

      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 text-center glass-border group card-cinematic shimmer overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
              <motion.div
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="h-5 w-5 text-primary mx-auto mb-3" />
              </motion.div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter value={value} />
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
