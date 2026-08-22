/**
 * Small self-playing board for the first screen.
 *
 * Purpose is purely visual: an Instagram visitor should understand "this is a
 * chess site" without reading anything. It replays one short famous game move
 * by move, loops forever, and is intentionally NOT interactive — the real
 * playable board lives right below the hero.
 */
import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { motion } from "framer-motion";
import { getPieceArtwork } from "@/lib/piece-glyphs";

// Morphy — Opera Game (short, pretty, ends in a mate).
const MOVES = [
  "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5",
  "Bc4", "Nf6", "Qb3", "Qe7", "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5",
  "Bxb5+", "Nbd7", "0-0-0", "Rd8", "Rxd7", "Rxd7", "Rd1", "Qe6", "Bxd7+", "Nxd7",
  "Qb8+", "Nxb8", "Rd8#",
];

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function Square({ piece, light }: { piece: string | null; light: boolean }) {
  const art = piece ? getPieceArtwork(piece) : null;
  return (
    <div
      className={`relative flex items-center justify-center ${
        light ? "bg-primary/15" : "bg-foreground/[0.06]"
      }`}
      style={{ aspectRatio: "1 / 1" }}
    >
      {piece && art && (
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="select-none leading-none"
          style={{ fontSize: "min(4.4vw, 26px)" }}
        >
          {art.svgUrl ? (
            <img
              src={art.svgUrl}
              alt=""
              className="w-[86%] h-[86%] object-contain"
              style={art.pixelated ? { imageRendering: "pixelated" } : undefined}
            />
          ) : (
            <span className={art.white ? "text-foreground" : "text-foreground/70"}>{art.symbol}</span>
          )}
        </motion.span>
      )}
    </div>
  );
}

export default function MiniAnimatedBoard({ className = "" }: { className?: string }) {
  const [ply, setPly] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setPly((p) => (p + 1) % (MOVES.length + 6)), 1100);
    return () => window.clearInterval(id);
  }, []);

  const board = useMemo(() => {
    const game = new Chess();
    for (let i = 0; i < Math.min(ply, MOVES.length); i++) {
      try {
        game.move(MOVES[i]);
      } catch {
        break;
      }
    }
    return game.board();
  }, [ply]);

  return (
    <div
      className={`mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl border border-primary/25 shadow-[0_20px_60px_-24px_hsl(43_90%_55%/0.55)] ${className}`}
      aria-hidden="true"
    >
      <div className="grid grid-cols-8">
        {board.map((row, r) =>
          row.map((sq, c) => (
            <Square
              key={`${FILES[c]}${8 - r}`}
              piece={sq ? `${sq.color}${sq.type}` : null}
              light={(r + c) % 2 === 0}
            />
          )),
        )}
      </div>
    </div>
  );
}
