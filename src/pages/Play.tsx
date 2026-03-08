import { useState, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RotateCcw, Flag, ChevronLeft, ChevronRight } from "lucide-react";

const PIECE_UNICODE: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const Play = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const board = useMemo(() => game.board(), [game.fen()]);

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (game.isGameOver()) return;

      // If a piece is selected and we click a legal move target
      if (selectedSquare && legalMoves.includes(square)) {
        const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move) {
          setGame(new Chess(game.fen()));
          setMoveHistory((prev) => [...prev, move.san]);
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Select a piece
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map((m) => m.to as Square));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [game, selectedSquare, legalMoves]
  );

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
  };

  const statusText = game.isCheckmate()
    ? `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`
    : game.isDraw()
    ? "Draw!"
    : game.isCheck()
    ? `${game.turn() === "w" ? "White" : "Black"} is in check`
    : `${game.turn() === "w" ? "White" : "Black"} to move`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          Play <span className="text-gradient-gold">Chess</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Click a piece to select it, then click a highlighted square to move.
        </p>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          {/* Board */}
          <div
            className="w-full max-w-[min(90vw,480px)]"
            role="grid"
            aria-label="Chess board"
          >
            {RANKS.map((rank, ri) => (
              <div key={rank} className="flex" role="row">
                {FILES.map((file, fi) => {
                  const square = `${file}${rank}` as Square;
                  const isLight = (ri + fi) % 2 === 0;
                  const piece = board[ri][fi];
                  const isSelected = selectedSquare === square;
                  const isLegal = legalMoves.includes(square);
                  const pieceKey = piece ? `${piece.color}${piece.type}` : null;

                  return (
                    <button
                      key={square}
                      role="gridcell"
                      aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                      className={`aspect-square w-[12.5%] flex items-center justify-center text-2xl sm:text-4xl select-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset
                        ${isLight ? "bg-board-light" : "bg-board-dark"}
                        ${isSelected ? "ring-2 ring-primary ring-inset brightness-110" : ""}
                        ${isLegal ? "cursor-pointer" : ""}
                      `}
                      onClick={() => handleSquareClick(square)}
                      tabIndex={0}
                    >
                      {isLegal && !piece && (
                        <span className="block h-3 w-3 rounded-full bg-primary/50" />
                      )}
                      {pieceKey && (
                        <span className={isLegal ? "drop-shadow-[0_0_6px_hsl(var(--primary))]" : ""}>
                          {PIECE_UNICODE[pieceKey]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-full max-w-xs space-y-4">
            <div
              className="rounded-lg border border-border/50 bg-card p-4"
              role="status"
              aria-live="polite"
            >
              <p className="font-display text-lg font-semibold text-foreground">{statusText}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetGame} variant="outline" className="flex-1" aria-label="New game">
                <RotateCcw className="mr-2 h-4 w-4" /> New Game
              </Button>
            </div>

            {/* Move history */}
            <div className="rounded-lg border border-border/50 bg-card p-4 max-h-64 overflow-y-auto">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Moves</h3>
              {moveHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground">No moves yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {moveHistory.map((move, i) =>
                    i % 2 === 0 ? (
                      <div key={i} className="contents">
                        <span className="text-muted-foreground">
                          {Math.floor(i / 2) + 1}. {move}
                        </span>
                        <span className="text-foreground">{moveHistory[i + 1] || ""}</span>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Play;
