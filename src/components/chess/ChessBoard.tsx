import { useState, useCallback, useMemo, useRef } from "react";
import { Chess, Square } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import { usePieceGlyphs } from "@/lib/piece-glyphs";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];


// Calculate the visual offset (in %) between two squares
function getSlideOffset(
  from: string,
  to: string,
  flipped: boolean
): { x: string; y: string } {
  const fromFile = FILES.indexOf(from[0]);
  const fromRank = RANKS.indexOf(parseInt(from[1]));
  const toFile = FILES.indexOf(to[0]);
  const toRank = RANKS.indexOf(parseInt(to[1]));

  let dx = fromFile - toFile;
  let dy = fromRank - toRank;

  if (flipped) {
    dx = -dx;
    dy = -dy;
  }

  // Each square is 100% of its own width/height
  return { x: `${dx * 100}%`, y: `${dy * 100}%` };
}

interface ChessBoardProps {
  game: Chess;
  flipped: boolean;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: string; to: string } | null;
  isGameOver: boolean;
  isPlayerTurn: boolean;
  hintSquare?: Square | null;
  premove?: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
  overlay?: React.ReactNode;
}

// Locate the square of the king of the given color
function findKingSquare(board: ReturnType<Chess["board"]>, color: "w" | "b"): string | null {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (sq && sq.type === "k" && sq.color === color) {
        return `${FILES[f]}${RANKS[r]}`;
      }
    }
  }
  return null;
}

export default function ChessBoard({
  game, flipped, selectedSquare, legalMoves, lastMove,
  isGameOver, isPlayerTurn, hintSquare, premove, onSquareClick, overlay,
}: ChessBoardProps) {
  const { get: getGlyph, style: pieceStyle } = usePieceGlyphs();
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();


  // Subtle indicator: which king is currently in check?
  const inCheck = game.inCheck();
  const checkedKingSquare = inCheck ? findKingSquare(board, game.turn()) : null;

  // Track a move counter to generate unique keys for slide animations
  const moveCountRef = useRef(0);
  const prevLastMoveRef = useRef<string | null>(null);
  const lastMoveKey = lastMove ? `${lastMove.from}${lastMove.to}` : null;
  if (lastMoveKey !== prevLastMoveRef.current) {
    prevLastMoveRef.current = lastMoveKey;
    if (lastMoveKey) moveCountRef.current++;
  }

  return (
    <div className="w-full max-w-[min(90vw,520px)] mx-auto">
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
          className="flex-1 rounded-lg overflow-hidden shadow-card border border-border/30 relative"
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
                const isPremove = premove && (premove.from === square || premove.to === square);
                const isCheckedKing = checkedKingSquare === square;
                const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                const pd = pieceKey ? PIECE_UNICODE[pieceKey] : null;

                // Did this piece just arrive here via a move?
                const justMoved = lastMove?.to === square && pd;
                const slideOffset = justMoved ? getSlideOffset(lastMove.from, lastMove.to, flipped) : null;

                let bgClass = isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
                if (isPremove) bgClass = "bg-blue-500/30";
                else if (isSelected) bgClass = "bg-primary/40";
                else if (isLastMv) bgClass = isLight ? "bg-primary/20" : "bg-primary/25";
                else if (isHint) bgClass = "bg-accent/40";

                return (
                  <button
                    key={square}
                    role="gridcell"
                    aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                    className={`aspect-square w-[12.5%] flex items-center justify-center select-none transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset relative overflow-visible
                      ${bgClass}
                      ${isSelected ? "shadow-[inset_0_0_16px_hsl(43_80%_55%/0.3)]" : ""}
                      ${isLegal || (isPlayerTurn && !isGameOver) ? "cursor-pointer active:scale-95" : "cursor-default"}
                    `}
                    onClick={() => onSquareClick(square)}
                    tabIndex={0}
                  >
                    {/* Subtle check indicator on the king (warm amber radial — not red) */}
                    {isCheckedKing && (
                      <span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none rounded-sm"
                        style={{
                          background:
                            "radial-gradient(circle, hsl(38 92% 55% / 0.45) 0%, hsl(38 92% 55% / 0.18) 45%, transparent 70%)",
                        }}
                      />
                    )}
                    {/* Legal move dot */}
                    {isLegal && !piece && (
                      <span className="block h-[26%] w-[26%] rounded-full bg-foreground/20" />
                    )}
                    {/* Legal capture ring */}
                    {isLegal && pd && (
                      <span className="absolute inset-[6%] rounded-full border-[3px] border-foreground/25" />
                    )}
                    {/* Piece with slide animation */}
                    {pd && (
                      <motion.span
                        key={slideOffset ? `slide-${moveCountRef.current}` : `${square}-${pieceKey}`}
                        initial={
                          slideOffset
                            ? { x: slideOffset.x, y: slideOffset.y, scale: 1 }
                            : false
                        }
                        animate={{ x: 0, y: 0, scale: 1 }}
                        transition={
                          slideOffset
                            ? { type: "spring", stiffness: 300, damping: 24, mass: 0.8 }
                            : { type: "spring", stiffness: 500, damping: 25 }
                        }
                        whileHover={
                          isPlayerTurn && !isGameOver
                            ? { scale: 1.15, y: -3, filter: pd.white ? "drop-shadow(0 0 12px rgba(255,215,0,0.6))" : "drop-shadow(0 0 12px rgba(100,180,255,0.5))", transition: { duration: 0.15 } }
                            : undefined
                        }
                        className={`text-[min(7vw,3.4rem)] sm:text-[min(6vw,3.2rem)] leading-none z-10 cursor-pointer ${
                          pd.white
                            ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                            : "drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                        } ${isSelected ? "drop-shadow-[0_0_10px_hsl(43_80%_55%/0.6)] scale-110" : ""}`}
                        style={{
                          position: "relative",
                          color: pd.white
                            ? "var(--piece-white, #ffffff)"
                            : "var(--piece-black, hsl(220,15%,8%))",
                          fontWeight: "var(--piece-weight, 400)" as any,
                          WebkitTextStroke: pd.white
                            ? "0.5px var(--piece-white-stroke, transparent)"
                            : "0.5px var(--piece-black-stroke, transparent)",
                          textShadow: "0 0 8px var(--piece-glow, transparent)",
                        }}
                      >
                        {pd.symbol}
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {/* Game-over / status overlay */}
          {overlay}
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
