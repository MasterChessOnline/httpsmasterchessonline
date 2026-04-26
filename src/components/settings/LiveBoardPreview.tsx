import { motion } from "framer-motion";
import type { BoardTheme, PieceStyle } from "@/lib/board-themes";

const FILES = ["a","b","c","d","e","f","g","h"];
const RANKS = [8,7,6,5,4,3,2,1];

// Initial position mapped to piece keys ("K", "Q", "R", "B", "N", "P" for white;
// lowercase for black). The actual artwork rendered comes from the chosen set.
const POSITION: Record<string, keyof PieceStyle["glyphs"]> = {
  a8: "r", b8: "n", c8: "b", d8: "q", e8: "k", f8: "b", g8: "n", h8: "r",
  a7: "p", b7: "p", c7: "p", d7: "p", e7: "p", f7: "p", g7: "p", h7: "p",
  a2: "P", b2: "P", c2: "P", d2: "P", e2: "P", f2: "P", g2: "P", h2: "P",
  a1: "R", b1: "N", c1: "B", d1: "Q", e1: "K", f1: "B", g1: "N", h1: "R",
};

interface Props {
  theme: BoardTheme;
  piece: PieceStyle;
}

function svgUrlFor(piece: PieceStyle, key: keyof PieceStyle["glyphs"]): string | null {
  if (piece.mode !== "svg" || !piece.svgFolder) return null;
  // upper-case key = white, lower-case = black
  const isWhite = key === key.toString().toUpperCase();
  const type = key.toString().toUpperCase();
  return `/pieces/${piece.svgFolder}/${isWhite ? "w" : "b"}${type}.svg`;
}

/**
 * Live mini-chessboard that re-renders the moment the user changes
 * board theme or piece style — instant visual feedback.
 */
export default function LiveBoardPreview({ theme, piece }: Props) {
  const r = piece.render;
  const isSvg = piece.mode === "svg";

  return (
    <motion.div
      key={`${theme.key}-${piece.key}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live preview</p>
          <p className="text-sm font-display font-semibold text-foreground">
            {theme.label} <span className="text-muted-foreground">·</span> {piece.label}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-border/30" style={{ backgroundColor: `hsl(${theme.light})` }} />
          <span className="w-3 h-3 rounded-sm border border-border/30" style={{ backgroundColor: `hsl(${theme.dark})` }} />
        </div>
      </div>

      <div
        className="grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl mx-auto"
        style={{
          maxWidth: 320,
          transform: "perspective(900px) rotateX(6deg)",
          boxShadow: `0 20px 50px -20px hsl(${theme.dark} / 0.6), 0 0 0 1px hsl(${theme.dark} / 0.4)`,
        }}
      >
        {RANKS.map((rank) =>
          FILES.map((file) => {
            const sq = `${file}${rank}`;
            const isLight = (FILES.indexOf(file) + RANKS.indexOf(rank)) % 2 === 0;
            const pieceKey = POSITION[sq];
            const glyph = pieceKey ? piece.glyphs[pieceKey] : undefined;
            const white = pieceKey ? pieceKey === pieceKey.toString().toUpperCase() : false;
            const svgUrl = pieceKey ? svgUrlFor(piece, pieceKey) : null;
            return (
              <div
                key={sq}
                className="aspect-square flex items-center justify-center text-2xl sm:text-[28px] leading-none select-none"
                style={{
                  backgroundColor: isLight ? `hsl(${theme.light})` : `hsl(${theme.dark})`,
                }}
              >
                {svgUrl ? (
                  <img
                    src={svgUrl}
                    alt=""
                    draggable={false}
                    className="w-[88%] h-[88%] object-contain pointer-events-none"
                    style={r.pixelated ? { imageRendering: "pixelated" } : undefined}
                  />
                ) : glyph && !isSvg ? (
                  <span
                    style={{
                      color: white ? r.whiteFill : r.blackFill,
                      fontWeight: r.fontWeight || 400,
                      display: "inline-block",
                      textShadow: r.glow
                        ? `0 0 10px ${r.glow}`
                        : white
                          ? `0 1px 2px ${r.whiteStroke || "rgba(0,0,0,0.85)"}`
                          : r.blackStroke
                            ? `0 0 4px ${r.blackStroke}`
                            : "0 1px 2px rgba(255,255,255,0.15)",
                      filter: r.glow ? `drop-shadow(0 0 6px ${r.glow})` : undefined,
                      WebkitTextStroke: white && r.whiteStroke
                        ? `0.5px ${r.whiteStroke}`
                        : !white && r.blackStroke
                          ? `0.5px ${r.blackStroke}`
                          : undefined,
                    }}
                  >
                    {glyph}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <p className="text-[11px] text-center text-muted-foreground mt-3">
        Updates everywhere instantly — no reload needed
      </p>
    </motion.div>
  );
}
