/**
 * GameEndOverlay
 *
 * Cinematic full-screen overlay za kraj partije:
 *  - Checkmate: zlatna konfeti eksplozija + "KING SLAIN" serif tekst
 *  - Resign / Time / Drawn: glass-break (8 staklenih trouglova razletanje)
 *
 * Nije vezan za nijednu konkretnu tablu — pozove se sa <GameEndOverlay
 * variant="checkmate" winnerLabel="Beli" onClose={...} />.
 *
 * Zvukove parent može da pusti zasebno — overlay se isključivo bavi vizuelom.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo } from "react";

export type GameEndVariant = "checkmate" | "resign" | "timeout" | "draw";

interface Props {
  show: boolean;
  variant: GameEndVariant;
  /** Npr. "Beli", "Crni", "Niko" za remi */
  winnerLabel?: string;
  /** Lokalizovan podnaslov, npr. "by checkmate", "on time" */
  detail?: string;
  onClose?: () => void;
  /** Auto-zatvori posle X ms (default 6000). 0 = ručno. */
  autoCloseMs?: number;
}

function ConfettiPiece({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.span
      className="absolute top-1/3 left-1/2 block w-2 h-3 rounded-sm"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
      animate={{
        x: x,
        y: [0, -120 - Math.random() * 80, 480 + Math.random() * 80],
        rotate: 360 + Math.random() * 360,
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 2.6, delay, ease: [0.2, 0.8, 0.4, 1] }}
    />
  );
}

function GlassShard({ angle, distance, delay }: { angle: number; distance: number; delay: number }) {
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        width: 0,
        height: 0,
        borderLeft: "24px solid transparent",
        borderRight: "24px solid transparent",
        borderBottom: "40px solid hsl(0 0% 90% / 0.65)",
        filter: "drop-shadow(0 0 6px hsl(0 0% 100% / 0.4))",
      }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
      animate={{ x, y, rotate: angle * 1.5, opacity: [1, 1, 0] }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    />
  );
}

export default function GameEndOverlay({
  show, variant, winnerLabel, detail, onClose, autoCloseMs = 6000,
}: Props) {
  useEffect(() => {
    if (!show || !autoCloseMs || !onClose) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [show, autoCloseMs, onClose]);

  const confetti = useMemo(() => {
    const colors = ["hsl(45 95% 55%)", "hsl(45 100% 70%)", "hsl(40 100% 50%)", "hsl(50 90% 75%)"];
    return Array.from({ length: 80 }).map((_, i) => ({
      delay: Math.random() * 0.4,
      x: (Math.random() - 0.5) * 900,
      color: colors[i % colors.length],
    }));
  }, []);

  const shards = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => ({
      angle: (360 / 14) * i + Math.random() * 8,
      distance: 200 + Math.random() * 240,
      delay: Math.random() * 0.1,
    })),
    [],
  );

  const heading =
    variant === "checkmate" ? "KING SLAIN" :
    variant === "resign"    ? "FLAG TAKEN" :
    variant === "timeout"   ? "TIME OUT"   :
                              "STALEMATE";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background:
              variant === "checkmate"
                ? "radial-gradient(ellipse at center, hsl(45 60% 8% / 0.85), hsl(0 0% 0% / 0.92))"
                : "radial-gradient(ellipse at center, hsl(0 0% 5% / 0.85), hsl(0 0% 0% / 0.95))",
          }}
          onClick={onClose}
        >
          {/* particle layer */}
          <div className="pointer-events-none absolute inset-0">
            {variant === "checkmate" && confetti.map((c, i) => (
              <ConfettiPiece key={i} delay={c.delay} x={c.x} color={c.color} />
            ))}
            {(variant === "resign" || variant === "timeout") &&
              shards.map((s, i) => <GlassShard key={i} {...s} />)}
          </div>

          {/* heading */}
          <motion.div
            className="relative text-center px-8"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 22 }}
          >
            <h1
              className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                background: variant === "checkmate"
                  ? "linear-gradient(180deg, hsl(45 100% 75%), hsl(45 95% 50%) 60%, hsl(40 90% 40%))"
                  : "linear-gradient(180deg, hsl(0 0% 95%), hsl(0 0% 60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: variant === "checkmate"
                  ? "0 0 60px hsl(45 100% 60% / 0.45)"
                  : "0 0 40px hsl(0 0% 100% / 0.25)",
                letterSpacing: "0.02em",
              }}
            >
              {heading}
            </h1>
            {(winnerLabel || detail) && (
              <motion.p
                className="mt-4 text-lg sm:text-xl text-foreground/80"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                {winnerLabel && <span className="font-semibold text-primary">{winnerLabel}</span>}
                {winnerLabel && detail ? " · " : ""}
                {detail && <span className="text-muted-foreground">{detail}</span>}
              </motion.p>
            )}
            <motion.p
              className="mt-6 text-xs uppercase tracking-[0.4em] text-muted-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              tap to dismiss
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
