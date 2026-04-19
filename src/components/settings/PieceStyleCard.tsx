import { Check } from "lucide-react";
import type { PieceStyle } from "@/lib/board-themes";

interface Props {
  style: PieceStyle;
  active: boolean;
  onSelect: () => void;
}

// Six representative pieces (king, queen, rook, bishop, knight, pawn) — one of each.
const SAMPLE_GLYPHS = ["♔", "♕", "♗", "♞", "♜", "♟"];

/**
 * Visual preview card for a piece style — renders 6 actual pieces in
 * the chosen color/weight combo so the user picks by sight.
 */
export default function PieceStyleCard({ style, active, onSelect }: Props) {
  const r = style.render;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative rounded-xl border p-3 text-left transition-all ${
        active
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-border/50 bg-card/60 hover:border-primary/30 hover:bg-card/80"
      }`}
    >
      {active && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}

      {/* Piece preview row — half white, half black to show contrast */}
      <div className="flex items-center justify-around gap-0.5 rounded-lg bg-gradient-to-r from-[hsl(220,10%,82%)] via-[hsl(220,12%,40%)] to-[hsl(220,15%,15%)] px-2 py-3 mb-2.5 transition-transform duration-300 group-hover:scale-[1.03]">
        {SAMPLE_GLYPHS.map((g, i) => {
          const white = i < 3;
          return (
            <span
              key={i}
              className="text-2xl leading-none"
              style={{
                color: white ? r.whiteFill : r.blackFill,
                fontWeight: r.fontWeight || 400,
                textShadow: r.glow
                  ? `0 0 8px ${r.glow}`
                  : white
                    ? `0 1px 2px ${r.whiteStroke || "rgba(0,0,0,0.85)"}`
                    : r.blackStroke
                      ? `0 0 3px ${r.blackStroke}`
                      : "0 1px 2px rgba(255,255,255,0.15)",
                WebkitTextStroke: white && r.whiteStroke
                  ? `0.4px ${r.whiteStroke}`
                  : !white && r.blackStroke
                    ? `0.4px ${r.blackStroke}`
                    : undefined,
                filter: r.glow ? `drop-shadow(0 0 4px ${r.glow})` : undefined,
              }}
            >
              {g}
            </span>
          );
        })}
      </div>

      <p className={`text-xs font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>
        {style.label}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">
        {style.description}
      </p>
    </button>
  );
}
