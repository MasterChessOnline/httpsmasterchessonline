// Big animated banner that floats over the chessboard for the three
// "high-signal" states: CHECK (transient), CHECKMATE, DRAW.
// CHECK is shown briefly each time the side-to-move is in check.
// CHECKMATE and DRAW persist until a new game starts.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type GameStatusKind = "check" | "checkmate" | "draw" | null;

interface Props {
  /** "check" while it's a transient check; "checkmate"/"draw" when the game ends. */
  kind: GameStatusKind;
  /** Optional subtitle, e.g. "White wins" / "by stalemate". */
  subtitle?: string;
}

const COPY: Record<NonNullable<GameStatusKind>, { label: string; tone: string }> = {
  check:     { label: "CHECK",     tone: "text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" },
  checkmate: { label: "CHECKMATE", tone: "text-red-400 drop-shadow-[0_0_24px_rgba(248,113,113,0.7)]" },
  draw:      { label: "DRAW",      tone: "text-sky-300 drop-shadow-[0_0_20px_rgba(125,211,252,0.6)]" },
};

const GameStatusOverlay = ({ kind, subtitle }: Props) => {
  // CHECK auto-hides after ~1.4s so it doesn't cover the board permanently.
  const [showCheck, setShowCheck] = useState(false);
  useEffect(() => {
    if (kind !== "check") { setShowCheck(false); return; }
    setShowCheck(true);
    const t = setTimeout(() => setShowCheck(false), 1400);
    return () => clearTimeout(t);
  }, [kind, subtitle]);

  const visible =
    kind === "checkmate" || kind === "draw" ? kind :
    kind === "check" && showCheck ? "check" : null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={visible + (subtitle ?? "")}
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="px-6 py-4 rounded-2xl bg-background/70 backdrop-blur-md border border-border/40 text-center"
          >
            <p className={`font-display font-black tracking-widest text-4xl sm:text-5xl ${COPY[visible].tone}`}>
              {COPY[visible].label}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameStatusOverlay;
