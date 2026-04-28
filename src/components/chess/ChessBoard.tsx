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
  hintToSquare?: Square | null;
  premove?: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
  overlay?: React.ReactNode;
  className?: string;
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
  isGameOver, isPlayerTurn, hintSquare, hintToSquare, premove, onSquareClick, overlay, className,
}: ChessBoardProps) {
  const { get: getGlyph, style: pieceStyle } = usePieceGlyphs();
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();

  // ── Annotations: right-click square highlights + drag arrows ──
  // Pure visual aid; cleared on left-click or when a new move is made.
  const [highlights, setHighlights] = useState<Set<string>>(new Set());
  const [arrows, setArrows] = useState<Array<{ from: string; to: string; color: string }>>([]);
  const dragStartRef = useRef<{ square: string; modifiers: { shift: boolean; ctrl: boolean } } | null>(null);

  const arrowColor = (mods: { shift: boolean; ctrl: boolean }) => {
    if (mods.ctrl) return "hsl(220 90% 60%)"; // blue
    if (mods.shift) return "hsl(140 70% 45%)"; // green
    return "hsl(35 95% 55%)"; // gold/orange (default)
  };

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
    // Clear annotations whenever a new move lands
    if (highlights.size || arrows.length) {
      setHighlights(new Set());
      setArrows([]);
    }
  }

  // Convert square name (e.g. "e4") to centroid coords in the SVG viewBox (0–800)
  const squareToXY = (sq: string): { x: number; y: number } => {
    const f = displayFiles.indexOf(sq[0]);
    const r = displayRanks.indexOf(parseInt(sq[1]));
    return { x: f * 100 + 50, y: r * 100 + 50 };
  };

  const handleContextMenu = (e: React.MouseEvent, square: string) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: React.MouseEvent, square: string) => {
    if (e.button === 2) {
      // Start tracking right-click drag
      dragStartRef.current = { square, modifiers: { shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey } };
    } else if (e.button === 0) {
      // Left-click clears all annotations
      if (highlights.size || arrows.length) {
        setHighlights(new Set());
        setArrows([]);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent, square: string) => {
    if (e.button !== 2 || !dragStartRef.current) return;
    const start = dragStartRef.current;
    dragStartRef.current = null;
    const color = arrowColor(start.modifiers);
    if (start.square === square) {
      // Toggle square highlight
      setHighlights(prev => {
        const next = new Set(prev);
        if (next.has(square)) next.delete(square);
        else next.add(square);
        return next;
      });
    } else {
      // Toggle arrow
      setArrows(prev => {
        const exists = prev.findIndex(a => a.from === start.square && a.to === square);
        if (exists >= 0) return prev.filter((_, i) => i !== exists);
        return [...prev, { from: start.square, to: square, color }];
      });
    }
  };


  return (
    <div className={className ?? "w-full max-w-[min(90vw,520px)] mx-auto"}>
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
          onContextMenu={(e) => e.preventDefault()}
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
                const isHintTo = hintToSquare === square;
                const isPremove = premove && (premove.from === square || premove.to === square);
                const isCheckedKing = checkedKingSquare === square;
                const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                const pd = pieceKey ? getGlyph(pieceKey) : null;

                // Did this piece just arrive here via a move?
                const justMoved = lastMove?.to === square && pd;
                const slideOffset = justMoved ? getSlideOffset(lastMove.from, lastMove.to, flipped) : null;

                // When the player is queueing a premove (it's not their turn) we
                // visualize selection + legal targets in BLUE instead of gold,
                // so the user can clearly see which move is queued.
                const premoveMode = !isPlayerTurn && !isGameOver;
                let bgClass = isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
                if (isPremove) bgClass = "bg-blue-500/45";
                else if (isSelected) bgClass = premoveMode ? "bg-blue-500/40" : "bg-primary/40";
                else if (isLastMv) bgClass = isLight ? "bg-primary/20" : "bg-primary/25";
                else if (isHint || isHintTo) bgClass = "bg-accent/50";

                const isHighlighted = highlights.has(square);

                return (
                  <button
                    key={square}
                    role="gridcell"
                    aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                    className={`aspect-square w-[12.5%] flex items-center justify-center select-none transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset relative overflow-visible
                      ${bgClass}
                      ${isSelected ? "shadow-[inset_0_0_16px_hsl(43_80%_55%/0.3)]" : ""}
                      ${isLegal || (isPlayerTurn && !isGameOver) || (premoveMode && (piece || isLegal)) ? "cursor-pointer active:scale-95" : "cursor-default"}
                    `}
                    onClick={() => onSquareClick(square)}
                    onMouseDown={(e) => handleMouseDown(e, square)}
                    onMouseUp={(e) => handleMouseUp(e, square)}
                    onContextMenu={(e) => handleContextMenu(e, square)}
                    tabIndex={0}
                  >
                    {/* Right-click highlight ring */}
                    {isHighlighted && (
                      <span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none ring-4 ring-inset"
                        style={{ boxShadow: "inset 0 0 0 4px hsl(35 95% 55% / 0.7)" }}
                      />
                    )}
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
                    {/* Hint indicator — pulsing accent ring on suggested from/to squares */}
                    {(isHint || isHintTo) && (
                      <span
                        aria-hidden
                        className="absolute inset-[8%] rounded-full border-[3px] border-accent animate-pulse pointer-events-none z-20"
                      />
                    )}
                    {/* Legal move dot */}
                    {isLegal && !piece && (
                      <span className={`block h-[26%] w-[26%] rounded-full ${premoveMode ? "bg-blue-500/70" : "bg-foreground/20"}`} />
                    )}
                    {/* Legal capture ring */}
                    {isLegal && pd && (
                      <span className={`absolute inset-[6%] rounded-full border-[3px] ${premoveMode ? "border-blue-500/70" : "border-foreground/25"}`} />
                    )}
                    {/* Piece — SVG artwork or Unicode glyph depending on the active set */}
                    {pd && (
                      <motion.span
                        key={slideOffset ? `slide-${moveCountRef.current}` : `${square}-${pieceKey}-${pieceStyle.key}`}
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
                        className={`leading-none z-10 cursor-pointer flex items-center justify-center ${
                          pd.svgUrl ? "w-[88%] h-[88%]" : "text-[min(7vw,3.4rem)] sm:text-[min(6vw,3.2rem)]"
                        } ${
                          pd.white
                            ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
                            : "drop-shadow-[0_1px_2px_rgba(255,255,255,0.18)]"
                        } ${isSelected ? "drop-shadow-[0_0_10px_hsl(43_80%_55%/0.6)] scale-110" : ""}`}
                        style={{
                          position: "relative",
                          ...(pd.svgUrl
                            ? {}
                            : {
                                color: pd.white
                                  ? "var(--piece-white, #ffffff)"
                                  : "var(--piece-black, hsl(220,15%,8%))",
                                fontWeight: "var(--piece-weight, 400)" as any,
                                WebkitTextStroke: pd.white
                                  ? "0.5px var(--piece-white-stroke, transparent)"
                                  : "0.5px var(--piece-black-stroke, transparent)",
                                textShadow: "0 0 8px var(--piece-glow, transparent)",
                              }),
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
                        ) : (
                          pd.symbol
                        )}
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
