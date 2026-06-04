import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { usePieceGlyphs } from "@/lib/piece-glyphs";
import { useMoveInputMode, dragEnabled, clickEnabled } from "@/hooks/use-move-input-mode";
import { playCheckSound, playGameOverSound } from "@/lib/chess-sounds";
import { triggerHaptic } from "@/lib/haptics";

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

function ChessBoardImpl({
  game, flipped, selectedSquare, legalMoves, lastMove,
  isGameOver, isPlayerTurn, hintSquare, hintToSquare, premove, onSquareClick, overlay, className,
}: ChessBoardProps) {
  const { get: getGlyph, style: pieceStyle } = usePieceGlyphs();
  const [moveInput] = useMoveInputMode();
  const allowDrag = dragEnabled(moveInput);
  void clickEnabled(moveInput); // click is always allowed for accessibility
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();

  // ── Annotations: right-click square highlights + drag arrows ──
  // Pure visual aid; cleared on left-click or when a new move is made.
  const [highlights, setHighlights] = useState<Set<string>>(new Set());
  const [arrows, setArrows] = useState<Array<{ from: string; to: string; color: string }>>([]);
  const dragStartRef = useRef<{ square: string; modifiers: { shift: boolean; ctrl: boolean } } | null>(null);

  // ── Drag & drop pieces (HTML5) ──
  const [dragFrom, setDragFrom] = useState<string | null>(null);

  // ── Hover ghost preview ──
  const [hoverSquare, setHoverSquare] = useState<string | null>(null);
  const selectedPiece = selectedSquare ? game.get(selectedSquare as Square) : null;
  const selectedPieceData = selectedPiece ? getGlyph(`${selectedPiece.color}${selectedPiece.type}`) : null;

  // ── Detect if the last move was a capture (for spark burst) ──
  const lastWasCapture = useMemo(() => {
    try {
      const h = game.history({ verbose: true });
      const last = h[h.length - 1] as any;
      return !!(last && last.captured);
    } catch { return false; }
  }, [lastMove?.from, lastMove?.to]);

  const arrowColor = (mods: { shift: boolean; ctrl: boolean }) => {
    if (mods.ctrl) return "hsl(220 90% 60%)"; // blue
    if (mods.shift) return "hsl(140 70% 45%)"; // green
    return "hsl(35 95% 55%)"; // gold/orange (default)
  };

  // Subtle indicator: which king is currently in check?
  const inCheck = game.inCheck();
  const checkedKingSquare = inCheck ? findKingSquare(board, game.turn()) : null;
  const isCheckmate = game.isCheckmate();

  // ── Board shake on check + checkmate sound/effect triggers ──
  const shakeControls = useAnimation();
  const prevCheckRef = useRef(false);
  const prevMateRef = useRef(false);
  const [mateBurstKey, setMateBurstKey] = useState(0);
  const [mateBurstSquare, setMateBurstSquare] = useState<string | null>(null);

  useEffect(() => {
    // Check transition: false → true triggers shake + sound + haptic
    if (inCheck && !prevCheckRef.current) {
      shakeControls.start({
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
      try { playCheckSound(); } catch {}
      triggerHaptic("check");
    }
    prevCheckRef.current = inCheck;
  }, [inCheck, shakeControls]);

  useEffect(() => {
    if (isCheckmate && !prevMateRef.current) {
      // Big particle burst on losing king's square + boom sound + mate haptic
      const losingKing = findKingSquare(board, game.turn());
      setMateBurstSquare(losingKing);
      setMateBurstKey(k => k + 1);
      shakeControls.start({
        x: [0, -14, 14, -10, 10, -5, 5, 0],
        transition: { duration: 0.7, ease: "easeInOut" },
      });
      try { playGameOverSound(); } catch {}
      triggerHaptic("mate");
    }
    prevMateRef.current = isCheckmate;
  }, [isCheckmate, board, game, shakeControls]);

  // Haptic on opponent's last move (capture vs move), only when board changes
  const prevHistoryLenRef = useRef(0);
  useEffect(() => {
    try {
      const h = game.history({ verbose: true });
      if (h.length > prevHistoryLenRef.current) {
        const last = h[h.length - 1] as any;
        triggerHaptic(last?.captured ? "capture" : "move");
      }
      prevHistoryLenRef.current = h.length;
    } catch { /* ignore */ }
  }, [lastMove?.from, lastMove?.to, game]);

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

  // ── Drag-and-drop a piece onto a target square ──
  // Reuses onSquareClick so the parent's legal-move / premove logic stays authoritative.
  const handlePieceDragStart = (e: React.DragEvent, square: string) => {
    const piece = game.get(square as Square);
    if (!piece) { e.preventDefault(); return; }
    setDragFrom(square);
    onSquareClick(square as Square);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", square);
    } catch { /* noop */ }
  };
  const handleSquareDragOver = (e: React.DragEvent) => {
    if (!dragFrom) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = "move"; } catch { /* noop */ }
  };
  const handleSquareDrop = (e: React.DragEvent, square: string) => {
    if (!dragFrom) return;
    e.preventDefault();
    const from = dragFrom;
    setDragFrom(null);
    if (from === square) return;
    onSquareClick(square as Square);
  };
  const handlePieceDragEnd = () => { setDragFrom(null); };

  const fileLabelClass = "flex-1 text-center text-[10px] sm:text-[12px] font-mono font-bold text-foreground/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]";
  const rankLabelClass = "flex-1 flex items-center justify-center text-[10px] sm:text-[12px] font-mono font-bold text-foreground/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]";

  return (
    <div className={className ?? "w-full max-w-[min(100vw-1.5rem,calc(100dvh-22rem),560px)] mx-auto touch-manipulation"}>
      {/* Coordinate labels top */}
      <div className="flex ml-4 sm:ml-7 mr-4 sm:mr-7 mb-0.5">
        {displayFiles.map((f) => (
          <span key={`top-${f}`} className={fileLabelClass}>{f}</span>
        ))}
      </div>

      <div className="flex">
        {/* Rank labels left */}
        <div className="flex flex-col w-4 sm:w-7 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={`l-${r}`} className={rankLabelClass}>{r}</span>
          ))}
        </div>


        {/* Board */}
        <motion.div
          animate={shakeControls}
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
                    onMouseEnter={() => setHoverSquare(square)}
                    onMouseLeave={() => setHoverSquare((s) => (s === square ? null : s))}
                    onContextMenu={(e) => handleContextMenu(e, square)}
                    onDragOver={handleSquareDragOver}
                    onDrop={(e) => handleSquareDrop(e, square)}
                    tabIndex={0}
                  >
                    {/* Animated glowing last-move ring */}
                    {isLastMv && (
                      <span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none rounded-[2px] animate-pulse"
                        style={{ boxShadow: "inset 0 0 0 2px hsl(43 95% 60% / 0.55), 0 0 18px hsl(43 95% 60% / 0.35)" }}
                      />
                    )}
                    {/* Right-click highlight ring */}
                    {isHighlighted && (
                      <span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none ring-4 ring-inset"
                        style={{ boxShadow: "inset 0 0 0 4px hsl(35 95% 55% / 0.7)" }}
                      />
                    )}
                    {/* Check indicator on the king — pulsing red glow */}
                    {isCheckedKing && (
                      <span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none rounded-sm animate-pulse"
                        style={{
                          background:
                            "radial-gradient(circle, hsl(0 90% 55% / 0.65) 0%, hsl(0 90% 50% / 0.3) 45%, transparent 72%)",
                          boxShadow: "inset 0 0 0 3px hsl(0 90% 55% / 0.7)",
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
                    {/* Hover ghost preview — translucent piece on legal target while a piece is selected */}
                    {isLegal && hoverSquare === square && selectedPieceData && selectedSquare !== square && (
                      <span
                        aria-hidden
                        className="absolute inset-[6%] z-[5] pointer-events-none flex items-center justify-center opacity-40 motion-reduce:hidden"
                      >
                        {selectedPieceData.svgUrl ? (
                          <img
                            src={selectedPieceData.svgUrl}
                            alt=""
                            className="w-full h-full object-contain"
                            style={selectedPieceData.pixelated ? { imageRendering: "pixelated" } : undefined}
                          />
                        ) : (
                          <span
                            className="text-[min(7vw,3.4rem)] sm:text-[min(6vw,3.2rem)] leading-none"
                            style={{ color: selectedPieceData.white ? "var(--piece-white,#fff)" : "var(--piece-black,hsl(220,15%,8%))" }}
                          >
                            {selectedPieceData.symbol}
                          </span>
                        )}
                      </span>
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
                        animate={{ x: 0, y: 0, scale: 1, opacity: dragFrom === square ? 0.4 : 1 }}
                        transition={
                          slideOffset
                            ? { type: "spring", stiffness: 260, damping: 18, mass: 0.95, restDelta: 0.001 }
                            : { type: "spring", stiffness: 500, damping: 25 }
                        }
                        whileHover={
                          isPlayerTurn && !isGameOver
                            ? { scale: 1.15, y: -3, filter: pd.white ? "drop-shadow(0 0 12px rgba(255,215,0,0.6))" : "drop-shadow(0 0 12px rgba(100,180,255,0.5))", transition: { duration: 0.15 } }
                            : undefined
                        }
                        draggable={!isGameOver && allowDrag}
                        onDragStart={(e) => handlePieceDragStart(e as unknown as React.DragEvent, square)}
                        onDragEnd={handlePieceDragEnd}
                        className={`leading-none z-10 cursor-grab active:cursor-grabbing flex items-center justify-center ${
                          pd.svgUrl ? "w-[100%] h-[100%]" : "text-[min(10vw,4.6rem)] sm:text-[min(7.4vw,4.1rem)]"
                        } ${
                          pd.svgUrl
                            ? "[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.45))]"
                            : pd.white
                              ? "[filter:drop-shadow(0_0_2px_rgba(0,0,0,0.95))_drop-shadow(0_0_3px_rgba(0,0,0,0.7))_drop-shadow(0_2px_3px_rgba(0,0,0,0.85))]"
                              : "[filter:drop-shadow(0_0_2px_rgba(255,255,255,0.95))_drop-shadow(0_0_3px_rgba(255,255,255,0.6))_drop-shadow(0_2px_3px_rgba(0,0,0,0.7))]"
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
                            className="w-full h-full object-contain pointer-events-none select-none"
                            style={pd.pixelated ? { imageRendering: "pixelated" as const } : undefined}
                            onError={(e) => {
                              // SVG failed to load — fall back to Unicode glyph so the
                              // square never shows a broken-image icon.
                              const img = e.currentTarget;
                              const parent = img.parentElement;
                              if (!parent || parent.dataset.fallback === "1") return;
                              parent.dataset.fallback = "1";
                              img.style.display = "none";
                              const span = document.createElement("span");
                              span.textContent = pd.symbol;
                              span.style.fontSize = "min(8.6vw, 4rem)";
                              span.style.lineHeight = "1";
                              span.style.color = pd.white ? "#ffffff" : "hsl(220,15%,8%)";
                              span.style.textShadow = pd.white
                                ? "0 0 2px #000, 0 1px 2px rgba(0,0,0,0.9)"
                                : "0 0 2px #fff, 0 1px 2px rgba(255,255,255,0.55)";
                              parent.appendChild(span);
                            }}
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

          {/* Last-move trail + capture spark — gold glow from→to, particle burst on capture */}
          {lastMove && (
            <svg
              key={`trail-${moveCountRef.current}`}
              viewBox="0 0 800 800"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-[15] motion-reduce:hidden"
              aria-hidden
            >
              <defs>
                <linearGradient id="mc-trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(43 95% 60%)" stopOpacity="0" />
                  <stop offset="50%" stopColor="hsl(43 95% 60%)" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="hsl(43 95% 60%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const a = squareToXY(lastMove.from);
                const b = squareToXY(lastMove.to);
                return (
                  <motion.line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="url(#mc-trail-grad)"
                    strokeWidth={10}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{ duration: 0.85, ease: "easeOut" }}
                  />
                );
              })()}
              {lastWasCapture && (() => {
                const c = squareToXY(lastMove.to);
                return Array.from({ length: 8 }).map((_, i) => {
                  const angle = (Math.PI * 2 * i) / 8;
                  const dx = Math.cos(angle) * 55;
                  const dy = Math.sin(angle) * 55;
                  return (
                    <motion.circle
                      key={i}
                      cx={c.x} cy={c.y} r={6}
                      fill="hsl(43 95% 60%)"
                      initial={{ opacity: 1, scale: 0.4 }}
                      animate={{ opacity: 0, scale: 1, cx: c.x + dx, cy: c.y + dy }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  );
                });
              })()}
            </svg>
          )}

          {/* Right-click drag arrows (Shift = green, Ctrl/Cmd = blue, default = gold) */}
          {arrows.length > 0 && (
            <svg
              viewBox="0 0 800 800"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-30"
              aria-hidden
            >
              <defs>
                {arrows.map((a, i) => (
                  <marker
                    key={i}
                    id={`arrowhead-${i}`}
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={a.color} />
                  </marker>
                ))}
              </defs>
              {arrows.map((a, i) => {
                const p1 = squareToXY(a.from);
                const p2 = squareToXY(a.to);
                return (
                  <line
                    key={`${a.from}-${a.to}-${i}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={a.color}
                    strokeWidth={14}
                    strokeLinecap="round"
                    opacity={0.85}
                    markerEnd={`url(#arrowhead-${i})`}
                  />
                );
              })}
            </svg>
          )}

          {/* Checkmate burst — explosion of gold particles on losing king */}
          {mateBurstSquare && (
            <svg
              key={`mate-${mateBurstKey}`}
              viewBox="0 0 800 800"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-[25] motion-reduce:hidden"
              aria-hidden
            >
              {(() => {
                const c = squareToXY(mateBurstSquare);
                return Array.from({ length: 24 }).map((_, i) => {
                  const angle = (Math.PI * 2 * i) / 24;
                  const dist = 180 + (i % 3) * 60;
                  const dx = Math.cos(angle) * dist;
                  const dy = Math.sin(angle) * dist;
                  return (
                    <motion.circle
                      key={i}
                      cx={c.x} cy={c.y} r={10}
                      fill={i % 2 ? "hsl(43 95% 60%)" : "hsl(30 95% 55%)"}
                      initial={{ opacity: 1, scale: 0.3 }}
                      animate={{ opacity: 0, scale: 1.4, cx: c.x + dx, cy: c.y + dy }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                    />
                  );
                });
              })()}
              {/* Center flash */}
              <motion.circle
                cx={squareToXY(mateBurstSquare).x}
                cy={squareToXY(mateBurstSquare).y}
                r={40}
                fill="hsl(43 95% 65%)"
                initial={{ opacity: 0.9, scale: 0.2 }}
                animate={{ opacity: 0, scale: 4 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </svg>
          )}

          {/* Game-over / status overlay */}
          {overlay}
        </motion.div>

        {/* Rank labels right */}
        <div className="flex flex-col w-4 sm:w-7 flex-shrink-0">
          {displayRanks.map((r) => (
            <span key={`r-${r}`} className={rankLabelClass}>{r}</span>
          ))}
        </div>
      </div>

      {/* Coordinate labels bottom */}
      <div className="flex ml-4 sm:ml-7 mr-4 sm:mr-7 mt-0.5">
        {displayFiles.map((f) => (
          <span key={`bot-${f}`} className={fileLabelClass}>{f}</span>
        ))}
      </div>
    </div>
  );
}
