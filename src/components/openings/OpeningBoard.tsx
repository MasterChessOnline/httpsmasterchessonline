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
  const game = useMemo(() => {
    const g = new Chess();
    try { g.load(fen); } catch { /* keep default */ }
    return g;
  }, [fen]);

  const board = game.board();
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;

  return (
    <div className="w-full max-w-[min(85vw,480px)] mx-auto">
      <div className="flex ml-6 mr-1 mb-0.5">
        {displayFiles.map((f) => (
          <span key={f} className="flex-1 text-center text-[10px] font-mono text-muted-foreground/60">{f}</span>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col w-6 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={r} className="flex-1 flex items-center justify-center text-[10px] font-mono text-muted-foreground/60">{r}</span>
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
                const pd = pieceKey ? PIECE_UNICODE[pieceKey] : null;

                let bgClass = isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
                if (isWrong) bgClass = "bg-destructive/40";
                else if (isCorrect) bgClass = "bg-emerald-500/40";
                else if (isSelected) bgClass = "bg-primary/40";
                else if (isLastMv) bgClass = isLight ? "bg-primary/20" : "bg-primary/25";
                else if (isHighlight) bgClass = "bg-blue-500/20";

                return (
                  <button
                    key={square}
                    className={`
                      aspect-square w-[12.5%] flex items-center justify-center select-none
                      transition-colors duration-150 focus:outline-none relative
                      ${bgClass} cursor-pointer
                    `}
                    onClick={() => onSquareClick?.(square)}
                  >
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
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`text-[min(6vw,2.8rem)] leading-none ${
                          pd.white
                            ? "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            : "text-[hsl(220,20%,12%)] drop-shadow-[0_0_3px_rgba(255,255,255,0.35)]"
                        }`}
                      >
                        {pd.symbol}
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

        <div className="flex flex-col w-5 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={r} className="flex-1 flex items-center justify-center text-[10px] font-mono text-muted-foreground/40">{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
