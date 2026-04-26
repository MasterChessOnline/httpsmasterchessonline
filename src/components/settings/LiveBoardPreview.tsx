import { motion } from "framer-motion";
import type { BoardTheme, PieceStyle } from "@/lib/board-themes";

const FILES = ["a","b","c","d","e","f","g","h"];
const RANKS = [8,7,6,5,4,3,2,1];

// Initial position mapped to piece keys ("K", "Q", "R", "B", "N", "P" for white;
// lowercase for black). The actual glyph rendered comes from the chosen piece set.
const POSITION: Record<string, keyof PieceStyle["glyphs"]> = {
  a8: "r", b8: "n", c8: "b", d8: "q", e8: "k", f8: "b", g8: "n", h8: "r",
  a7: "p", b7: "p", c7: "p", d7: "p", e7: "p", f7: "p", g7: "p", h7: "p",
  a2: "P", b2: "P", c2: "P", d2: "P", e2: "P", f2: "P", g2: "P", h2: "P",
  a1: "R", b1: "N", c1: "B", d1: "Q", e1: "K", f1: "B", g1: "N", h1: "R",
};

const COLORFUL_STYLES = new Set(["emoji", "animals"]);

interface Props {
  theme: BoardTheme;
  piece: PieceStyle;
}

/**
 * Live mini-chessboard that re-renders the moment the user changes
 * board theme or piece style — instant visual feedback.
 */
export default function LiveBoardPreview({ theme, piece }: Props) {
  const r = piece.render;
  const colorful = COLORFUL_STYLES.has(piece.key);
  const scale = r.scale ?? 1;

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
          // Subtle 3D tilt for "premium" feel — kept subtle so it stays readable
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
            const white = pieceKey ? pieceKey === pieceKey.toUpperCase() : false;
            return (
              <div
                key={sq}
                className="aspect-square flex items-center justify-center text-2xl sm:text-[28px] leading-none select-none"
                style={{
                  backgroundColor: isLight ? `hsl(${theme.light})` : `hsl(${theme.dark})`,
                }}
              >
                {glyph && (
                  <span
                    style={{
                      color: colorful ? undefined : (white ? r.whiteFill : r.blackFill),
                      fontWeight: r.fontWeight || 400,
                      fontFamily: r.fontFamily || undefined,
                      transform: `scale(${scale})`,
                      display: "inline-block",
                      textShadow: colorful ? undefined : (r.glow
                        ? `0 0 10px ${r.glow}`
                        : white
                          ? `0 1px 2px ${r.whiteStroke || "rgba(0,0,0,0.85)"}`
                          : r.blackStroke
                            ? `0 0 4px ${r.blackStroke}`
                            : "0 1px 2px rgba(255,255,255,0.15)"),
                      filter: r.glow && !colorful ? `drop-shadow(0 0 6px ${r.glow})` : undefined,
                      WebkitTextStroke: !colorful && white && r.whiteStroke
                        ? `0.5px ${r.whiteStroke}`
                        : !colorful && !white && r.blackStroke
                          ? `0.5px ${r.blackStroke}`
                          : undefined,
                    }}
                  >
                    {glyph}
                  </span>
                )}
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
