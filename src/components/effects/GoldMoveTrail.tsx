/**
 * GoldMoveTrail
 *
 * Sloj koji crta zlatni "trail" od polja-from do polja-to nakon poteza,
 * i dodaje pulse-glow oko polja-to. Pozicionira se apsolutno PREKO board
 * containera. Roditelj treba da:
 *   - bude `position: relative`
 *   - prosledi `lastMove` ({ from, to })
 *   - prosledi `boardSize` u px (ili automatski dimenzije)
 *   - `orientation` ('white'|'black') ako je tabla rotirana za crnog
 *
 * Ne dira logiku poteza, samo vizuelni feedback.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface Props {
  lastMove: { from: string; to: string } | null;
  boardSize: number;
  orientation?: "white" | "black";
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function squareToXY(sq: string, size: number, orientation: "white" | "black"): { x: number; y: number } {
  const file = FILES.indexOf(sq[0]);
  const rank = parseInt(sq[1], 10) - 1;
  const cell = size / 8;
  if (orientation === "white") {
    return { x: file * cell + cell / 2, y: (7 - rank) * cell + cell / 2 };
  }
  return { x: (7 - file) * cell + cell / 2, y: rank * cell + cell / 2 };
}

export default function GoldMoveTrail({ lastMove, boardSize, orientation = "white" }: Props) {
  const geo = useMemo(() => {
    if (!lastMove || !boardSize) return null;
    const cell = boardSize / 8;
    const a = squareToXY(lastMove.from, boardSize, orientation);
    const b = squareToXY(lastMove.to, boardSize, orientation);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { a, b, length, angle, cell };
  }, [lastMove?.from, lastMove?.to, boardSize, orientation]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {geo && lastMove && (
          <motion.div
            key={`${lastMove.from}-${lastMove.to}-${Date.now()}`}
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Zlatni trail – tanka linija sa glow-om */}
            <motion.div
              className="absolute origin-left"
              style={{
                left: geo.a.x,
                top: geo.a.y - 2,
                width: geo.length,
                height: 4,
                transform: `rotate(${geo.angle}deg)`,
                background:
                  "linear-gradient(90deg, transparent, hsl(45 95% 60% / 0.95), hsl(45 100% 75% / 0.6), transparent)",
                boxShadow:
                  "0 0 12px hsl(45 95% 55% / 0.7), 0 0 24px hsl(45 100% 65% / 0.4)",
                borderRadius: 9999,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, times: [0, 0.2, 0.6, 1] }}
            />
            {/* Pulse oko ciljnog polja */}
            <motion.div
              className="absolute rounded-md"
              style={{
                left: geo.b.x - geo.cell / 2,
                top: geo.b.y - geo.cell / 2,
                width: geo.cell,
                height: geo.cell,
                boxShadow:
                  "inset 0 0 0 2px hsl(45 95% 60% / 0.9), 0 0 18px hsl(45 100% 60% / 0.5)",
              }}
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: [1.15, 1, 1.04, 1], opacity: [0.9, 0.9, 0.6, 0] }}
              transition={{ duration: 1.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
