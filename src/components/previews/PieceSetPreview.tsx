import type { PieceStyle } from "@/lib/board-themes";

interface Props {
  style: PieceStyle;
  /** show 1 row of each color (compact) or full 6+6 (rich). default compact */
  rich?: boolean;
  className?: string;
}

const WHITES: Array<{ glyph: keyof PieceStyle["glyphs"]; type: string }> = [
  { glyph: "K", type: "K" }, { glyph: "Q", type: "Q" }, { glyph: "R", type: "R" },
  { glyph: "B", type: "B" }, { glyph: "N", type: "N" }, { glyph: "P", type: "P" },
];
const BLACKS: Array<{ glyph: keyof PieceStyle["glyphs"]; type: string }> = [
  { glyph: "k", type: "K" }, { glyph: "q", type: "Q" }, { glyph: "r", type: "R" },
  { glyph: "b", type: "B" }, { glyph: "n", type: "N" }, { glyph: "p", type: "P" },
];

function svgUrl(style: PieceStyle, white: boolean, type: string): string | null {
  if (style.mode !== "svg" || !style.svgFolder) return null;
  return `/pieces/${style.svgFolder}/${white ? "w" : "b"}${type}.svg`;
}

/**
 * Universal piece-set preview — separated white row & black row on
 * contrasting backgrounds so the user can SEE every piece clearly.
 */
export default function PieceSetPreview({ style, rich = false, className = "" }: Props) {
  const r = style.render;
  const isSvg = style.mode === "svg";

  const renderRow = (
    row: Array<{ glyph: keyof PieceStyle["glyphs"]; type: string }>,
    white: boolean,
    bg: string,
  ) => (
    <div
      className="flex items-center justify-around gap-1 px-2 py-1.5 rounded-md"
      style={{ background: bg }}
    >
      {row.map((s, i) => {
        const url = svgUrl(style, white, s.type);
        if (url) {
          return (
            <img
              key={i}
              src={url}
              alt=""
              draggable={false}
              className={`shrink-0 object-contain ${rich ? "h-7 w-7 sm:h-8 sm:w-8" : "h-5 w-5 sm:h-6 sm:w-6"}`}
              style={r.pixelated ? { imageRendering: "pixelated" } : undefined}
            />
          );
        }
        const glyph = style.glyphs[s.glyph];
        return (
          <span
            key={i}
            className={`leading-none inline-block shrink-0 ${rich ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}
            style={{
              color: white ? r.whiteFill : r.blackFill,
              fontWeight: r.fontWeight || 400,
              textShadow: r.glow
                ? `0 0 8px ${r.glow}`
                : white
                  ? `0 1px 2px ${r.whiteStroke || "rgba(0,0,0,0.7)"}`
                  : `0 1px 2px ${r.blackStroke || "rgba(255,255,255,0.15)"}`,
              WebkitTextStroke: white && r.whiteStroke
                ? `0.4px ${r.whiteStroke}`
                : !white && r.blackStroke
                  ? `0.4px ${r.blackStroke}`
                  : undefined,
              filter: r.glow ? `drop-shadow(0 0 4px ${r.glow})` : undefined,
            }}
          >
            {glyph}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {renderRow(WHITES, true, "linear-gradient(180deg, hsl(40 20% 88%), hsl(40 15% 78%))")}
      {renderRow(BLACKS, false, "linear-gradient(180deg, hsl(220 12% 22%), hsl(220 14% 12%))")}
    </div>
  );
}
