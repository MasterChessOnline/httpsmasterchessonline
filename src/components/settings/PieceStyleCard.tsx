import { Check } from "lucide-react";
import type { PieceStyle } from "@/lib/board-themes";

interface Props {
  style: PieceStyle;
  active: boolean;
  onSelect: () => void;
}

function svgUrlFor(style: PieceStyle, white: boolean, type: string): string | null {
  if (style.mode !== "svg" || !style.svgFolder) return null;
  return `/pieces/${style.svgFolder}/${white ? "w" : "b"}${type}.svg`;
}

/**
 * Visual preview card for a piece style — shows 6 actual pieces (real SVG
 * artwork when available, otherwise Unicode glyphs styled by the recipe).
 */
export default function PieceStyleCard({ style, active, onSelect }: Props) {
  const r = style.render;
  const isSvg = style.mode === "svg";

  // Three white + three black so the user sees both contrasts.
  const samples: Array<{ glyph: string; white: boolean; type: string }> = [
    { glyph: style.glyphs.K, white: true, type: "K" },
    { glyph: style.glyphs.Q, white: true, type: "Q" },
    { glyph: style.glyphs.B, white: true, type: "B" },
    { glyph: style.glyphs.n, white: false, type: "N" },
    { glyph: style.glyphs.r, white: false, type: "R" },
    { glyph: style.glyphs.p, white: false, type: "P" },
  ];

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
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md z-10">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}

      {/* Piece preview row — half white, half black to show contrast */}
      <div className="flex items-center justify-between gap-0.5 rounded-lg bg-gradient-to-r from-[hsl(220,10%,82%)] via-[hsl(220,12%,40%)] to-[hsl(220,15%,15%)] px-2 py-2.5 mb-2.5 overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]">
        {samples.map((s, i) => {
          const svgUrl = svgUrlFor(style, s.white, s.type);
          if (svgUrl) {
            return (
              <img
                key={i}
                src={svgUrl}
                alt=""
                draggable={false}
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain shrink-0"
                style={r.pixelated ? { imageRendering: "pixelated" } : undefined}
              />
            );
          }
          return (
            <span
              key={i}
              className="text-xl sm:text-2xl leading-none inline-block shrink-0"
              style={{
                color: s.white ? r.whiteFill : r.blackFill,
                fontWeight: r.fontWeight || 400,
                textShadow: r.glow
                  ? `0 0 8px ${r.glow}`
                  : s.white
                    ? `0 1px 2px ${r.whiteStroke || "rgba(0,0,0,0.85)"}`
                    : r.blackStroke
                      ? `0 0 3px ${r.blackStroke}`
                      : "0 1px 2px rgba(255,255,255,0.15)",
                WebkitTextStroke: s.white && r.whiteStroke
                  ? `0.4px ${r.whiteStroke}`
                  : !s.white && r.blackStroke
                    ? `0.4px ${r.blackStroke}`
                    : undefined,
                filter: r.glow ? `drop-shadow(0 0 4px ${r.glow})` : undefined,
              }}
            >
              {s.glyph}
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
