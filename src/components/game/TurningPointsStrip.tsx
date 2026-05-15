import { motion } from "framer-motion";
import { Sparkles, Swords, AlertTriangle, Crown } from "lucide-react";
import { detectTurningPoints, type TurningPoint } from "@/lib/turning-points";
import { useMemo } from "react";

const ICONS: Record<TurningPoint["type"], React.ElementType> = {
  "mate-threat": Crown,
  "blunder-capture": Swords,
  "swing": AlertTriangle,
  "first-check": Sparkles,
};

interface Props {
  pgn: string;
  onJump?: (ply: number) => void;
}

/**
 * Engine-free "turning points" strip. Uses material-swing + first-check
 * heuristics over the PGN to surface up to 3 key moments. NO engine eval.
 */
export default function TurningPointsStrip({ pgn, onJump }: Props) {
  const points = useMemo(() => detectTurningPoints(pgn, 3), [pgn]);
  if (!points.length) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-card/60 backdrop-blur p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary font-semibold">
        <Sparkles className="h-3 w-3" /> Key moments
      </div>
      <div className="flex flex-wrap gap-2">
        {points.map((p) => {
          const Icon = ICONS[p.type];
          return (
            <motion.button
              key={p.ply}
              type="button"
              onClick={() => onJump?.(p.ply)}
              className="group inline-flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition-colors"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-muted-foreground">
                {p.moveNumber}{p.side === "w" ? "." : "..."}
              </span>
              <span className="font-semibold text-foreground">{p.san}</span>
              <span className="text-muted-foreground/80 hidden sm:inline">— {p.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
