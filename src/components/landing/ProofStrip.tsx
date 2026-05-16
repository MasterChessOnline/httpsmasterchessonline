import { motion } from "framer-motion";

const items = [
  "No ads",
  "No bots in human play",
  "No clutter",
  "Streamer-first",
  "Gold-grade UI",
  "10s to first game",
  "Human-only ELO",
  "Daily tournaments",
  "Skill tree + XP",
  "Real ranks",
  "Built in 2026",
  "Mobile-first board",
];

export default function ProofStrip() {
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-primary/15 bg-gradient-to-r from-background via-primary/5 to-background py-3">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((s, i) => (
          <span
            key={i}
            className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-foreground/80 flex items-center gap-8"
          >
            <span className="text-primary">✦</span>
            <span className="text-gradient-gold">{s}</span>
          </span>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
