import { useState, useCallback, useMemo, useEffect } from "react";
import { Chess } from "chess.js";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MoveStep {
  san: string;
  explanation: string;
}

interface InteractiveBoardProps {
  startFen?: string;
  moves: MoveStep[];
}

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♚", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wq: { symbol: "♛", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wr: { symbol: "♜", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wb: { symbol: "♝", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wn: { symbol: "♞", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wp: { symbol: "♟", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  bk: { symbol: "♚", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bq: { symbol: "♛", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  br: { symbol: "♜", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bb: { symbol: "♝", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bn: { symbol: "♞", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bp: { symbol: "♟", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

function parseFen(fen: string) {
  const rows = fen.split(" ")[0].split("/");
  const board: (null | { color: string; type: string })[][] = [];
  for (const row of rows) {
    const boardRow: (null | { color: string; type: string })[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch); i++) boardRow.push(null);
      } else {
        boardRow.push({ color: ch === ch.toUpperCase() ? "w" : "b", type: ch.toLowerCase() });
      }
    }
    board.push(boardRow);
  }
  return board;
}

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function InteractiveBoard({ startFen, moves }: InteractiveBoardProps) {
  const baseFen = startFen || DEFAULT_FEN;

  // Pre-compute all FEN positions by applying moves sequentially
  const positions = useMemo(() => {
    const fens: string[] = [baseFen];
    const chess = new Chess(baseFen);
    for (const step of moves) {
      try {
        chess.move(step.san);
        fens.push(chess.fen());
      } catch {
        // If move is invalid, stop here
        break;
      }
    }
    return fens;
  }, [baseFen, moves]);

  const [moveIndex, setMoveIndex] = useState(0); // 0 = start position, 1 = after move 1, etc.
  const totalMoves = positions.length - 1;

  // Reset when lesson changes
  useEffect(() => {
    setMoveIndex(0);
  }, [baseFen, moves]);

  const goToStart = useCallback(() => setMoveIndex(0), []);
  const goToEnd = useCallback(() => setMoveIndex(totalMoves), [totalMoves]);
  const goForward = useCallback(() => setMoveIndex((i) => Math.min(i + 1, totalMoves)), [totalMoves]);
  const goBack = useCallback(() => setMoveIndex((i) => Math.max(i - 1, 0)), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goForward(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goBack(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goForward, goBack]);

  const currentFen = positions[moveIndex] || baseFen;
  const board = parseFen(currentFen);
  const currentExplanation = moveIndex > 0 && moveIndex <= moves.length ? moves[moveIndex - 1].explanation : null;

  // Determine which square was the "to" square of the last move for highlighting
  const lastMoveTo = useMemo(() => {
    if (moveIndex === 0) return null;
    try {
      const chess = new Chess(positions[moveIndex - 1]);
      const result = chess.move(moves[moveIndex - 1].san);
      return result ? result.to : null;
    } catch {
      return null;
    }
  }, [moveIndex, positions, moves]);

  const lastMoveFrom = useMemo(() => {
    if (moveIndex === 0) return null;
    try {
      const chess = new Chess(positions[moveIndex - 1]);
      const result = chess.move(moves[moveIndex - 1].san);
      return result ? result.from : null;
    } catch {
      return null;
    }
  }, [moveIndex, positions, moves]);

  // Format move number for the move list
  const getMoveNumber = (idx: number) => {
    // Determine move number based on who's moving from start position
    const chess = new Chess(baseFen);
    const startTurnIsWhite = chess.turn() === "w";
    if (startTurnIsWhite) {
      return idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : "";
    } else {
      if (idx === 0) return "1...";
      return (idx + 1) % 2 === 0 ? `${Math.floor((idx + 1) / 2) + 1}.` : "";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Board */}
      <div className="rounded-lg overflow-hidden border border-border/50 mb-3">
        {RANKS.map((rank, ri) => (
          <div key={rank} className="flex">
            {FILES.map((file, fi) => {
              const isLight = (ri + fi) % 2 === 0;
              const piece = board[ri]?.[fi];
              const pieceKey = piece ? `${piece.color}${piece.type}` : null;
              const pieceDisplay = pieceKey ? PIECE_DISPLAY[pieceKey] : null;
              const sq = `${file}${rank}`;
              const isHighlighted = sq === lastMoveTo || sq === lastMoveFrom;
              return (
                <div
                  key={sq}
                  className={`aspect-square w-[12.5%] flex items-center justify-center text-2xl sm:text-3xl transition-colors duration-200 ${
                    isHighlighted
                      ? isLight
                        ? "bg-primary/30"
                        : "bg-primary/40"
                      : isLight
                        ? "bg-board-light"
                        : "bg-board-dark"
                  }`}
                >
                  {pieceDisplay && (
                    <span className={pieceDisplay.className}>{pieceDisplay.symbol}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Explanation bubble */}
      <div className="min-h-[60px] rounded-lg border border-border/50 bg-card p-3 mb-3">
        {currentExplanation ? (
          <p className="text-sm text-foreground leading-relaxed">{currentExplanation}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {totalMoves > 0
              ? "Press ▶ or use arrow keys to step through the moves."
              : "This position illustrates the lesson concept."}
          </p>
        )}
      </div>

      {/* Move list */}
      {moves.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card p-3 mb-3 max-h-[100px] overflow-y-auto">
          <div className="flex flex-wrap gap-1 text-sm">
            {moves.map((step, idx) => {
              const moveNum = getMoveNumber(idx);
              const isActive = idx + 1 === moveIndex;
              return (
                <span key={idx} className="inline-flex items-center gap-0.5">
                  {moveNum && (
                    <span className="text-muted-foreground font-medium">{moveNum}</span>
                  )}
                  <button
                    onClick={() => setMoveIndex(idx + 1)}
                    className={`px-1.5 py-0.5 rounded font-mono text-xs transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {step.san}
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation controls */}
      {totalMoves > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToStart}
            disabled={moveIndex === 0}
            className="h-9 w-9"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goBack}
            disabled={moveIndex === 0}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2 min-w-[60px] text-center">
            {moveIndex} / {totalMoves}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goForward}
            disabled={moveIndex === totalMoves}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToEnd}
            disabled={moveIndex === totalMoves}
            className="h-9 w-9"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
