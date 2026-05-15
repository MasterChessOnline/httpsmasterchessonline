import { useState, useCallback, useMemo, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { OpeningMove } from "@/lib/openings-data";
import { playChessSound } from "@/lib/chess-sounds";
import { motion } from "framer-motion";
import { usePieceGlyphs } from "@/lib/piece-glyphs";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

interface OpeningBoardProps {
  fen: string;
  lastMove?: { from: string; to: string } | null;
  highlightSquares?: string[];
  flipped?: boolean;
  onSquareClick?: (square: Square) => void;
  selectedSquare?: Square | null;
  legalMoves?: Square[];
  wrongSquare?: Square | null;
  correctSquare?: Square | null;
}

export default function OpeningBoard({
  fen,
  lastMove,
  highlightSquares = [],
  flipped = false,
  onSquareClick,
  selectedSquare,
  legalMoves = [],
  wrongSquare,
  correctSquare,
}: OpeningBoardProps) {
  const { get: getGlyph } = usePieceGlyphs();
  const [dragFrom, setDragFrom] = useState<Square | null>(null);
  const game = useMemo(() => {
    const g = new Chess();
    try { g.load(fen); } catch { /* keep default */ }
    return g;
  }, [fen]);

  const board = game.board();
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;

  // Haptic feedback on every move change (mobile)
  const moveSig = lastMove ? `${lastMove.from}-${lastMove.to}` : null;
  useEffect(() => {
    if (!moveSig) return;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(15);
      }
    } catch { /* ignore */ }
  }, [moveSig]);

  return (
    <div className="w-full max-w-[min(85vw,480px)] mx-auto">
      <div className="flex ml-7 mr-1 mb-1">
        {displayFiles.map((f) => (
          <span key={f} className="flex-1 text-center text-[13px] sm:text-[12px] font-mono font-bold text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">{f}</span>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col w-7 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={r} className="flex-1 flex items-center justify-center text-[13px] sm:text-[12px] font-mono font-bold text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">{r}</span>
          ))}
        </div>

        <div className="flex-1 rounded-lg overflow-hidden shadow-card border border-border/30">
          {displayRanks.map((rank) => (
            <div key={rank} className="flex">
              {displayFiles.map((file) => {
                const square = `${file}${rank}` as Square;
                const origRi = RANKS.indexOf(rank);
                const origFi = FILES.indexOf(file);
                const isLight = (origRi + origFi) % 2 === 0;
                const piece = board[origRi][origFi];
                const isSelected = selectedSquare === square;
                const isLegal = legalMoves.includes(square);
                const isLastMv = lastMove && (lastMove.from === square || lastMove.to === square);
                const isHighlight = highlightSquares.includes(square);
                const isWrong = wrongSquare === square;
                const isCorrect = correctSquare === square;
                const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                const pd = pieceKey ? getGlyph(pieceKey) : null;

                let bgClass = isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
                if (isWrong) bgClass = "bg-destructive/40";
                else if (isCorrect) bgClass = "bg-emerald-500/40";
                else if (isSelected) bgClass = "bg-primary/40";
                else if (isLastMv) bgClass = isLight ? "bg-primary/20" : "bg-primary/25";
                else if (isHighlight) bgClass = "bg-blue-500/20";

                const moveKey = lastMove ? `${lastMove.from}-${lastMove.to}` : "none";
                return (
                  <button
                    key={square}
                    className={`
                      aspect-square w-[12.5%] flex items-center justify-center select-none
                      transition-colors duration-150 focus:outline-none relative
                      ${bgClass} cursor-pointer
                    `}
                    onClick={() => onSquareClick?.(square)}
                    onDragOver={(e) => { if (dragFrom) { e.preventDefault(); } }}
                    onDrop={(e) => {
                      if (!dragFrom) return;
                      e.preventDefault();
                      const from = dragFrom;
                      setDragFrom(null);
                      if (from !== square) onSquareClick?.(square);
                    }}
                  >
                    {isLastMv && (
                      <span
                        key={`flash-${square}-${moveKey}`}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 animate-square-flash rounded-[2px]"
                      />
                    )}
                    {isLegal && !piece && (
                      <span className="block h-[26%] w-[26%] rounded-full bg-foreground/20" />
                    )}
                    {isLegal && pd && (
                      <span className="absolute inset-[6%] rounded-full border-[3px] border-foreground/25" />
                    )}
                    {pd && (
                      <motion.span
                        key={`${square}-${pieceKey}`}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: dragFrom === square ? 0.4 : 1 }}
                        transition={{ duration: 0.15 }}
                        draggable
                        onDragStart={(e) => {
                          setDragFrom(square);
                          onSquareClick?.(square);
                          try { (e as unknown as React.DragEvent).dataTransfer.effectAllowed = "move"; } catch { /* noop */ }
                        }}
                        onDragEnd={() => setDragFrom(null)}
                        className={`leading-none flex items-center justify-center cursor-grab active:cursor-grabbing ${
                          pd.svgUrl ? "w-[90%] h-[90%]" : "text-[min(7vw,3rem)] font-black"
                        } ${
                          pd.white
                            ? "[filter:drop-shadow(0_0_1.5px_#000)_drop-shadow(0_0_1.5px_#000)_drop-shadow(0_1px_2px_rgba(0,0,0,0.9))]"
                            : "[filter:drop-shadow(0_0_1.5px_#fff)_drop-shadow(0_0_1.5px_#fff)_drop-shadow(0_1px_2px_rgba(255,255,255,0.55))]"
                        }`}
                        style={pd.svgUrl ? undefined : {
                          color: pd.white ? "#ffffff" : "#000000",
                          WebkitTextStroke: pd.white ? "2px #000000" : "2px #ffffff",
                        }}
                      >
                        {pd.svgUrl ? (
                          <img
                            src={pd.svgUrl}
                            alt=""
                            draggable={false}
                            className="w-full h-full object-contain pointer-events-none"
                            style={pd.pixelated ? { imageRendering: "pixelated" } : undefined}
                          />
                        ) : pd.symbol}
                      </motion.span>
                    )}
                    {isWrong && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 border-2 border-destructive rounded-sm"
                      />
                    )}
                    {isCorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 border-2 border-emerald-500 rounded-sm"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-col w-6 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={r} className="flex-1 flex items-center justify-center text-[13px] sm:text-[12px] font-mono font-bold text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
