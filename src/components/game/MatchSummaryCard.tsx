import { useMemo } from "react";
import { Chess } from "chess.js";
import { Share2, Trophy, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { detectOpening } from "@/lib/openings-detector";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  pgn: string;
  result: string | null;
  whiteName: string;
  blackName: string;
  ratingDelta?: { white?: number; black?: number };
  shareUrl?: string;
}

/**
 * End-of-game summary card: opening name + ECO, material momentum sparkline,
 * share button. No engine eval — the sparkline is raw material balance.
 */
export default function MatchSummaryCard({ pgn, result, whiteName, blackName, ratingDelta, shareUrl }: Props) {
  const { opening, sparkline } = useMemo(() => {
    const c = new Chess();
    try { c.loadPgn(pgn); } catch { return { opening: null, sparkline: [] as number[] }; }
    const moves = c.history().slice(0, 16);
    const op = detectOpening(moves);

    const replay = new Chess();
    const balances: number[] = [0];
    const PV: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    for (const san of c.history()) {
      replay.move(san);
      let bal = 0;
      for (const ch of replay.fen().split(" ")[0]) {
        if (ch === "/" || /[1-8]/.test(ch)) continue;
        const v = PV[ch.toLowerCase()] ?? 0;
        bal += ch === ch.toUpperCase() ? v : -v;
      }
      balances.push(bal);
    }
    return { opening: op, sparkline: balances };
  }, [pgn]);

  const max = Math.max(8, ...sparkline.map(Math.abs));
  const points = sparkline.map((v, i) => {
    const x = (i / Math.max(1, sparkline.length - 1)) * 100;
    const y = 50 - (v / max) * 45;
    return `${x},${y}`;
  }).join(" ");

  const handleShare = async () => {
    const url = shareUrl ?? window.location.href;
    const text = `${whiteName} vs ${blackName} — ${result ?? "in progress"}${opening ? ` · ${opening.name}` : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "MasterChess match", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success("Match link copied");
      }
    } catch { /* user cancelled */ }
  };

  const winLabel = result === "1-0" ? `${whiteName} won` : result === "0-1" ? `${blackName} won` : result === "1/2-1/2" ? "Draw" : "Match";

  return (
    <motion.div
      className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-md p-5 shadow-glow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">
            <Trophy className="h-3 w-3" /> Match summary
          </div>
          <div className="font-display text-lg font-bold">{winLabel}</div>
          <div className="text-xs text-muted-foreground">
            <span className="text-foreground/90">{whiteName}</span>
            {typeof ratingDelta?.white === "number" && (
              <span className={`ml-1 font-mono ${ratingDelta.white >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                {ratingDelta.white >= 0 ? "+" : ""}{ratingDelta.white}
              </span>
            )}
            <span className="mx-2 text-muted-foreground/60">vs</span>
            <span className="text-foreground/90">{blackName}</span>
            {typeof ratingDelta?.black === "number" && (
              <span className={`ml-1 font-mono ${ratingDelta.black >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                {ratingDelta.black >= 0 ? "+" : ""}{ratingDelta.black}
              </span>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleShare} className="shrink-0">
          <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
        </Button>
      </div>

      {opening && (
        <Link
          to={opening.trainerId ? `/openings/${opening.trainerId}` : "/opening-explorer"}
          className="mb-4 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          <Crown className="h-4 w-4 text-primary" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">You played</div>
            <div className="font-semibold text-sm truncate">
              {opening.name} <span className="font-mono text-[10px] text-primary/80">{opening.eco}</span>
            </div>
          </div>
          <span className="text-xs text-primary">Explore →</span>
        </Link>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Material momentum</span>
          <span className="text-muted-foreground/60">no engine</span>
        </div>
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="h-16 w-full">
          <line x1="0" y1="25" x2="100" y2="25" stroke="hsl(var(--border))" strokeWidth="0.3" />
          <polyline
            points={points}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="flex justify-between text-[9px] text-muted-foreground/70 mt-1">
          <span>{whiteName} ↑</span>
          <span>{blackName} ↑</span>
        </div>
      </div>
    </motion.div>
  );
}
