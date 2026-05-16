import { useMemo } from "react";
import { getActivePieceStyle } from "@/lib/board-themes";

/**
 * Tiny self-contained chess-board renderer for thumbnails.
 * 100% local — no external services. Reads colors from the active board theme
 * via CSS vars (--board-light / --board-dark) and pieces from the active piece set.
 */
export default function MiniFenBoard({
  fen,
  size = 120,
  className = "",
  alt,
}: {
  fen: string;
  size?: number;
  className?: string;
  alt?: string;
}) {
  const board = useMemo(() => fenToBoard(fen), [fen]);
  const style = getActivePieceStyle();
  const cell = size / 8;

  return (
    <div
      role="img"
      aria-label={alt || "Chess position"}
      className={`grid grid-cols-8 rounded-md overflow-hidden ring-1 ring-border/40 ${className}`}
      style={{ width: size, height: size }}
    >
      {board.map((row, r) =>
        row.map((piece, c) => {
          const isLight = (r + c) % 2 === 0;
          const bg = isLight ? "hsl(var(--board-light))" : "hsl(var(--board-dark))";
          const key = `${r}-${c}`;
          const svgUrl =
            piece && style.mode === "svg" && style.svgFolder
              ? `/pieces/${style.svgFolder}/${piece[0]}${piece[1].toUpperCase()}.svg`
              : null;
          return (
            <div
              key={key}
              className="flex items-center justify-center"
              style={{ background: bg, width: cell, height: cell }}
            >
              {piece && svgUrl && (
                <img
                  src={svgUrl}
                  alt=""
                  draggable={false}
                  style={{
                    width: cell * 0.9,
                    height: cell * 0.9,
                    imageRendering: style.render.pixelated ? "pixelated" : "auto",
                  }}
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                />
              )}
              {piece && !svgUrl && (
                <span
                  style={{
                    fontSize: cell * 0.78,
                    lineHeight: 1,
                    color: piece[0] === "w" ? style.render.whiteFill : style.render.blackFill,
                    textShadow:
                      piece[0] === "w"
                        ? "0 0 1px rgba(0,0,0,0.5)"
                        : "0 0 1px rgba(255,255,255,0.25)",
                  }}
                >
                  {piece[0] === "w"
                    ? style.glyphs[piece[1].toUpperCase() as "K"]
                    : style.glyphs[piece[1] as "k"]}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function fenToBoard(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/");
  return rows.map((row) => {
    const out: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch, 10); i++) out.push(null);
      } else {
        const color = ch === ch.toUpperCase() ? "w" : "b";
        out.push(color + ch.toLowerCase());
      }
    }
    while (out.length < 8) out.push(null);
    return out.slice(0, 8);
  });
}
