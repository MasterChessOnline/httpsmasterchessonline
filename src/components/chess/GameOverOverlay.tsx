import { motion } from "framer-motion";
import { Crown, Handshake } from "lucide-react";

interface GameOverOverlayProps {
  /** "checkmate" | "draw" | "resign" | "timeout" */
  type: "checkmate" | "draw" | "resign" | "timeout";
  /** "white" | "black" | null (null = draw) */
  winner: "white" | "black" | null;
  /** optional reason line, e.g. "by stalemate", "by agreement" */
  reason?: string;
}

/**
 * Clean, minimal end-of-game overlay shown over the board.
 * - No red, no flashing, no aggressive effects.
 * - Translucent dark backdrop + soft gold accents.
 */
export default function GameOverOverlay({ type, winner, reason }: GameOverOverlayProps) {
  const headline =
    type === "checkmate"
      ? "Checkmate"
      : type === "draw"
      ? "Draw"
      : type === "timeout"
      ? "Time out"
      : "Resignation";

  const subline =
    type === "draw"
      ? reason || "Game drawn"
      : winner
      ? `${winner === "white" ? "White" : "Black"} wins`
      : reason || "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {/* Soft backdrop — no red, no harsh tint */}
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />

      {/* Centered card */}
      <motion.div
        initial={{ scale: 0.92, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}
        className="relative px-6 py-5 sm:px-8 sm:py-6 rounded-2xl border border-primary/30 bg-card/95 shadow-2xl text-center min-w-[200px] max-w-[85%]"
      >
        <div className="flex justify-center mb-2">
          {type === "draw" ? (
            <div className="w-9 h-9 rounded-full bg-muted/60 border border-border flex items-center justify-center">
              <Handshake className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {headline}
        </h3>
        {subline && (
          <p className="mt-1 text-sm text-muted-foreground">{subline}</p>
        )}
        {type !== "draw" && reason && (
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">{reason}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
