import { useState, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { playChessSound } from "@/lib/chess-sounds";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_UNICODE: Record<string, { symbol: string; white: boolean }> = {
  wk: { symbol: "♚", white: true }, wq: { symbol: "♛", white: true },
  wr: { symbol: "♜", white: true }, wb: { symbol: "♝", white: true },
  wn: { symbol: "♞", white: true }, wp: { symbol: "♟", white: true },
  bk: { symbol: "♚", white: false }, bq: { symbol: "♛", white: false },
  br: { symbol: "♜", white: false }, bb: { symbol: "♝", white: false },
  bn: { symbol: "♞", white: false }, bp: { symbol: "♟", white: false },
};

interface ChessBoardProps {
  game: Chess;
  flipped: boolean;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: string; to: string } | null;
  isGameOver: boolean;
  isPlayerTurn: boolean;
  hintSquare?: Square | null;
  onSquareClick: (square: Square) => void;
}

export default function ChessBoard({
  game, flipped, selectedSquare, legalMoves, lastMove,
  isGameOver, isPlayerTurn, hintSquare, onSquareClick,
}: ChessBoardProps) {
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();

  return (
    <div className="w-full max-w-[min(85vw,520px)] mx-auto">
      {/* Coordinate labels top */}
      <div className="flex ml-6 mr-1 mb-0.5">
        {displayFiles.map((f) => (
          <span key={f} className="flex-1 text-center text-[10px] font-mono text-muted-foreground/60">{f}</span>
        ))}
      </div>

      <div className="flex">
        {/* Rank labels left */}
        <div className="flex flex-col w-6 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={r} className="flex-1 flex items-center justify-center text-[10px] font-mono text-muted-foreground/60">{r}</span>
          ))}
        </div>

        {/* Board */}
        <div
          className="flex-1 rounded-lg overflow-hidden shadow-card border border-border/30"
          role="grid"
          aria-label="Chess board"
        >
          {displayRanks.map((rank) => (
            <div key={rank} className="flex" role="row">
              {displayFiles.map((file) => {
                const square = `${file}${rank}` as Square;
                const origRi = RANKS.indexOf(rank);
                const origFi = FILES.indexOf(file);
                const isLight = (origRi + origFi) % 2 === 0;
                const piece = board[origRi][origFi];
                const isSelected = selectedSquare === square;
                const isLegal = legalMoves.includes(square);
                const isLastMv = lastMove && (lastMove.from === square || lastMove.to === square);
                const isHint = hintSquare === square;
                const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                const pd = pieceKey ? PIECE_UNICODE[pieceKey] : null;

                let bgClass = isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
                if (isSelected) bgClass = "bg-primary/40";
                else if (isLastMv) bgClass = isLight ? "bg-primary/20" : "bg-primary/25";
                else if (isHint) bgClass = "bg-blue-500/30";

                return (
                  <button
                    key={square}
                    role="gridcell"
                    aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                    className={`aspect-square w-[12.5%] flex items-center justify-center select-none transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset relative
                      ${bgClass}
                      ${isLegal || (isPlayerTurn && !isGameOver) ? "cursor-pointer" : "cursor-default"}
                    `}
                    onClick={() => onSquareClick(square)}
                    tabIndex={0}
                  >
                    {/* Legal move dot */}
                    {isLegal && !piece && (
                      <span className="block h-[26%] w-[26%] rounded-full bg-foreground/20" />
                    )}
                    {/* Legal capture ring */}
                    {isLegal && pd && (
                      <span className="absolute inset-[6%] rounded-full border-[3px] border-foreground/25" />
                    )}
                    {/* Piece */}
                    {pd && (
                      <span
                        className={`text-[min(6vw,3.2rem)] leading-none ${
                          pd.white
                            ? "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            : "text-[hsl(220,20%,12%)] drop-shadow-[0_0_3px_rgba(255,255,255,0.35)]"
                        }`}
                      >
                        {pd.symbol}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Rank labels right */}
        <div className="flex flex-col w-5 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={r} className="flex-1 flex items-center justify-center text-[10px] font-mono text-muted-foreground/40">{r}</span>
          ))}
        </div>
      </div>

      {/* Coordinate labels bottom */}
      <div className="flex ml-6 mr-1 mt-0.5">
        {displayFiles.map((f) => (
          <span key={f} className="flex-1 text-center text-[10px] font-mono text-muted-foreground/40">{f}</span>
        ))}
      </div>
    </div>
  );
}
