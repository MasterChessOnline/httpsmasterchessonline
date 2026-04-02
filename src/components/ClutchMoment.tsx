import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface ClutchMomentProps {
  moveHistory: string[];
  playerColor: "w" | "b";
  show: boolean;
}

function findClutchMove(moves: string[], playerColor: "w" | "b"): { move: string; moveNumber: number } | null {
  if (moves.length < 4) return null;
  const playerMoves = moves
    .map((m, i) => ({ san: m, idx: i }))
    .filter((_, i) => (playerColor === "w" ? i % 2 === 0 : i % 2 === 1));

  // Find the most impactful move: checkmate, checks, captures with check, or captures
  const ranked = playerMoves.map(m => {
    let score = 0;
    if (m.san.includes("#")) score = 100;
    else if (m.san.includes("+") && m.san.includes("x")) score = 80;
    else if (m.san.includes("+")) score = 60;
    else if (m.san.includes("x") && m.san.startsWith("Q")) score = 50;
    else if (m.san.includes("x")) score = 30;
    else if (m.san.includes("O-O")) score = 20;
    // Prefer later moves (they're more decisive)
    score += m.idx * 0.5;
    return { ...m, score };
  });

  ranked.sort((a, b) => b.score - a.score);
  if (ranked.length === 0) return null;

  const best = ranked[0];
  return { move: best.san, moveNumber: Math.floor(best.idx / 2) + 1 };
}

export default function ClutchMoment({ moveHistory, playerColor, show }: ClutchMomentProps) {
  const clutch = findClutchMove(moveHistory, playerColor);
  if (!clutch || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Zap className="w-5 h-5 text-primary" />
          </motion.div>
          <h4 className="text-sm font-bold text-primary">Game-Changing Move</h4>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="font-mono text-lg font-bold text-primary">{clutch.move}</span>
          </div>
          <div>
            <p className="text-xs text-foreground font-medium">Move {clutch.moveNumber}</p>
            <p className="text-[10px] text-muted-foreground">This move shifted the game in your favor</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
