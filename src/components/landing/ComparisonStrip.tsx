import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

type Cell = true | false | "partial";

const rows: { label: string; us: Cell; chesscom: Cell; lichess: Cell }[] = [
  { label: "No ads anywhere",         us: true,      chesscom: false,   lichess: true },
  { label: "100% free, no premium",   us: true,      chesscom: "partial", lichess: true },
  { label: "Streamer-first UI & embeds", us: true,   chesscom: false,   lichess: "partial" },
  { label: "No AI eval bar in live play", us: true,  chesscom: false,   lichess: false },
  { label: "Daily Stockfish-verified mates", us: true, chesscom: "partial", lichess: "partial" },
];

const renderCell = (v: Cell) => {
  if (v === true) return <Check className="h-4 w-4 text-primary mx-auto" aria-label="Yes" />;
  if (v === false) return <X className="h-4 w-4 text-muted-foreground/50 mx-auto" aria-label="No" />;
  return <Minus className="h-4 w-4 text-muted-foreground mx-auto" aria-label="Partial" />;
};

export default function ComparisonStrip() {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          How we compare
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Honest side-by-side. We keep what matters, drop what doesn't.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-primary/15 glass-4d overflow-hidden"
      >
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] text-[11px] sm:text-xs">
          <div className="px-3 py-3 font-display font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Feature</div>
          <div className="px-2 py-3 text-center font-display font-bold text-primary">MasterChess</div>
          <div className="px-2 py-3 text-center font-medium text-muted-foreground">Chess.com</div>
          <div className="px-2 py-3 text-center font-medium text-muted-foreground">Lichess</div>

          {rows.map((r) => (
            <div key={r.label} className="contents">
              <div className="px-3 py-3 border-t border-border/30 text-foreground/90">{r.label}</div>
              <div className="px-2 py-3 border-t border-border/30 bg-primary/[0.04] flex items-center justify-center">{renderCell(r.us)}</div>
              <div className="px-2 py-3 border-t border-border/30 flex items-center justify-center">{renderCell(r.chesscom)}</div>
              <div className="px-2 py-3 border-t border-border/30 flex items-center justify-center">{renderCell(r.lichess)}</div>
            </div>
          ))}
        </div>
      </motion.div>
      <p className="text-[10px] text-muted-foreground/70 text-center mt-2">
        Comparison reflects publicly observable features at time of writing. Trademarks belong to their owners.
      </p>
    </section>
  );
}
