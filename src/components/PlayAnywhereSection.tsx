import { motion } from "framer-motion";
import { Smartphone, Apple, Monitor, Tablet, Laptop, Zap, WifiOff, Maximize2 } from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";

const DEVICES = [
  { icon: Smartphone, label: "Android" },
  { icon: Apple,      label: "iPhone" },
  { icon: Monitor,    label: "Windows" },
  { icon: Laptop,     label: "macOS" },
  { icon: Tablet,     label: "Tablet" },
];

const BENEFITS = [
  { icon: Zap,        title: "Install in one click",  desc: "Native-style launch from your home screen." },
  { icon: Maximize2,  title: "Play like a real app",   desc: "No browser bar, full-screen board." },
  { icon: WifiOff,    title: "Works offline",          desc: "Openings, training & past games cached locally." },
];

export default function PlayAnywhereSection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Glow backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-widest mb-4">
            <Smartphone className="h-3 w-3" />
            Play Anywhere
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            One app. <span className="text-gradient-gold">Every screen.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Install MasterChess directly from your browser — no app store required.
            Fast, fullscreen, and ready offline.
          </p>
        </motion.div>

        {/* Device pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10"
        >
          {DEVICES.map((d, i) => (
            <motion.div
              key={d.label}
              whileHover={{ y: -3, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-card/70 backdrop-blur-md text-sm font-medium text-foreground/90 shadow-sm"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <d.icon className="h-4 w-4 text-primary" />
              {d.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mb-10">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
              className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{b.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <InstallAppButton variant="hero" />
          <p className="text-[11px] text-muted-foreground">
            Free · No account needed · 100% browser-based
          </p>
        </motion.div>
      </div>
    </section>
  );
}
