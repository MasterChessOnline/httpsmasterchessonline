import { motion } from "framer-motion";
import { Check, Minus, Crown, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Mark = "yes" | "no" | "partial";

const rows: { label: string; mc: Mark; cc: Mark; li: Mark; note?: string }[] = [
  { label: "Premium cinematic UI (Gold & Black)", mc: "yes", cc: "no", li: "no" },
  { label: "Zero ads, zero popups", mc: "yes", cc: "no", li: "yes" },
  { label: "Streamer Mode + overlay embeds", mc: "yes", cc: "partial", li: "no" },
  { label: "Creator integration (DailyChess_12)", mc: "yes", cc: "no", li: "no" },
  { label: "Human-only ELO (no bots in rated)", mc: "yes", cc: "partial", li: "yes" },
  { label: "Gamified Skill Tree + XP levels", mc: "yes", cc: "partial", li: "no" },
  { label: "Referral program with conversion tracking", mc: "yes", cc: "no", li: "no" },
  { label: "10-second time-to-first-game", mc: "yes", cc: "partial", li: "yes" },
  { label: "Mobile-first 2026 design", mc: "yes", cc: "no", li: "partial" },
  { label: "Built-in Chess Moments & community", mc: "yes", cc: "partial", li: "partial" },
];

const Cell = ({ m, gold = false }: { m: Mark; gold?: boolean }) => {
  if (m === "yes")
    return (
      <span
        className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full ${
          gold ? "bg-primary text-primary-foreground shadow-glow" : "bg-emerald-500/15 text-emerald-400"
        }`}
      >
        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
      </span>
    );
  if (m === "partial")
    return (
      <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
        ~
      </span>
    );
  return (
    <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-muted/30 text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
};

export default function VsTheRest() {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-3">
          <Swords className="h-3 w-3" /> Head-to-Head
        </span>
        <h2 className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight">
          MasterChess vs <span className="text-muted-foreground/70">the rest</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
          Same game. Completely different experience. Here is what you get on MasterChess
          that the legacy sites still don't ship.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-primary/20 glass-4d overflow-hidden"
      >
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 items-center px-3 sm:px-5 py-3 border-b border-border/30 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-bold">
            Feature
          </div>
          <div className="flex flex-col items-center min-w-[58px] sm:min-w-[88px]">
            <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="font-display text-[10px] sm:text-xs font-black text-gradient-gold uppercase tracking-wider mt-0.5">
              MasterChess
            </span>
          </div>
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[72px]">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              chess.com
            </span>
          </div>
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[72px]">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              lichess
            </span>
          </div>
        </div>

        {/* Rows */}
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 items-center px-3 sm:px-5 py-3 ${
              i % 2 === 0 ? "bg-primary/[0.02]" : ""
            } border-b border-border/10 last:border-b-0`}
          >
            <div className="text-xs sm:text-sm text-foreground/90 leading-snug pr-2">
              {r.label}
            </div>
            <div className="flex justify-center min-w-[58px] sm:min-w-[88px]">
              <Cell m={r.mc} gold />
            </div>
            <div className="flex justify-center min-w-[50px] sm:min-w-[72px]">
              <Cell m={r.cc} />
            </div>
            <div className="flex justify-center min-w-[50px] sm:min-w-[72px]">
              <Cell m={r.li} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <p className="text-[10px] sm:text-xs text-muted-foreground/70 text-center mt-3 italic">
        ✓ Full · ~ Partial · — Not available. Based on public product surfaces at time of writing.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <Link to="/signup">
          <Button size="lg" className="ripple-btn h-12 px-7 font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg">
            Switch to MasterChess
          </Button>
        </Link>
        <Link to="/play/online">
          <Button size="lg" variant="outline" className="h-12 px-7 rounded-xl border-border/40 hover:border-primary/40">
            Play a game now
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
