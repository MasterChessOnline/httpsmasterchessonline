import { motion } from "framer-motion";
import { ShieldCheck, Users, Radio, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "No Ads. Ever.",
    body: "Distraction-free interface built for serious play. No banners, no popups, no nonsense.",
  },
  {
    icon: Users,
    title: "Pure Human Play",
    body: "Zero AI assistance and zero eval bars during games. Just you against another human mind.",
  },
  {
    icon: Radio,
    title: "Streamer-First",
    body: "Distraction-free Streamer Mode, overlay-ready embeds, and live integration with DailyChess_12.",
  },
  {
    icon: Sparkles,
    title: "Free Forever",
    body: "Tournaments, opening trainer, Stockfish analysis and bots — all free, no paywall, no tiers.",
  },
];

export default function WhyMasterChess() {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Why <span className="text-primary">MasterChess</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Built by chess players for chess players — every decision protects your game.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className="relative rounded-2xl border border-primary/15 glass-4d p-4 sm:p-5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground mb-1">{p.title}</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
