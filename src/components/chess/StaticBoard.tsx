import { useMemo } from "react";
import { getActivePieceStyle } from "@/lib/board-themes";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function fenToBoard(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/");
  return rows.map((row) => {
    const out: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
      else out.push((ch === ch.toUpperCase() ? "w" : "b") + ch.toLowerCase());
    }
    return out;
  });
}

interface StaticBoardProps {
  fen: string;
  flipped?: boolean;
  lastMove?: { from: string; to: string } | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function StaticBoard({
  fen,
  flipped = false,
  lastMove,
  className = "",
  size = "md",
}: StaticBoardProps) {
  const style = useMemo(() => getActivePieceStyle(), []);
  const board = useMemo(() => fenToBoard(fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), [fen]);

  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;

  const sizeClass = {
    sm: "max-w-[200px]",
    md: "max-w-[360px]",
    lg: "max-w-[560px]",
  }[size];

  return (
    <div className={`aspect-square w-full ${sizeClass} ${className}`}>
      <div className="grid grid-cols-8 w-full h-full rounded-lg overflow-hidden ring-1 ring-border/60 shadow-2xl">
        {displayRanks.map((rank, r) =>
          displayFiles.map((file, c) => {
            const sq = `${file}${rank}`;
            const boardR = flipped ? 7 - r : r;
            const boardC = flipped ? 7 - c : c;
            const piece = board[boardR][boardC];
            const isLight = (r + c) % 2 === 0;
            const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
            const svg =
              piece && style.mode === "svg" && style.svgFolder
                ? `/pieces/${style.svgFolder}/${piece[0]}${piece[1].toUpperCase()}.svg`
                : null;

            return (
              <div
                key={sq}
                className="relative flex items-center justify-center select-none"
                style={{
                  background: isLast
                    ? "hsl(var(--primary) / 0.25)"
                    : isLight
                    ? "hsl(var(--board-light))"
                    : "hsl(var(--board-dark))",
                }}
              >
                {svg && (
                  <img
                    src={svg}
                    alt=""
                    draggable={false}
                    className="w-[88%] h-[88%] pointer-events-none"
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
