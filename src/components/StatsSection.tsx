import { Users, Gamepad2, Brain, TrendingUp, Flame, Globe, Swords, Shield } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { icon: Globe, label: "Countries", value: 120, suffix: "+", color: "from-primary/20 to-primary/5" },
  { icon: Swords, label: "Games Played", value: 500, suffix: "K+", color: "from-emerald/20 to-emerald/5" },
  { icon: Flame, label: "Active Streaks", value: 8500, suffix: "+", color: "from-primary/20 to-primary/5" },
  { icon: Shield, label: "ELO Tracked", value: 100, suffix: "%", color: "from-accent/20 to-accent/5" },
];

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="relative py-20 overflow-hidden section-depth">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />

      {/* Animated gold line */}
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
          {stats.map(({ icon: Icon, label, value, suffix, color }, i) => (
            <motion.div
              key={label}
              className="relative rounded-2xl glass-elevated p-6 text-center group overflow-hidden depth-card light-sweep ambient-reflect"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              {/* Gradient bg on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              
              <div className="relative">
                <motion.div
                  className="mx-auto mb-3 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:shadow-glow transition-shadow duration-500"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                </motion.div>
                <div className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1" style={{ textShadow: "0 0 20px hsl(43 90% 55% / 0.08)" }}>
                  <AnimatedNumber value={value} suffix={suffix} />
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-widest">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
