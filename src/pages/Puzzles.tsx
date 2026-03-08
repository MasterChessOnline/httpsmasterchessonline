import { useState, useMemo, useCallback } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Lightbulb, SkipForward, CheckCircle2, XCircle, Eye } from "lucide-react";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

// Same piece display as Play page
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

// All puzzles are White to move
const PUZZLES = [
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", solution: ["Qxf7#"], title: "Scholar's Mate", hint: "Attack the weak f7 square!", answer: "Qxf7# — The queen captures on f7, delivering checkmate." },
  { fen: "r2qr1k1/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QR1K1 w - - 0 1", solution: ["Bxf7+"], title: "Pin & Win", hint: "Look for a piece that's pinned.", answer: "Bxf7+ — The bishop captures on f7 with check, winning material." },
  { fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", solution: ["Re8#"], title: "Back Rank Mate", hint: "The king is trapped on the back rank.", answer: "Re8# — The rook delivers checkmate on the back rank." },
];

const Puzzles = () => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = PUZZLES[puzzleIdx];
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [solved, setSolved] = useState(false);

  const board = useMemo(() => game.board(), [game.fen()]);

  const loadPuzzle = (idx: number) => {
    const p = PUZZLES[idx];
    setPuzzleIdx(idx);
    setGame(new Chess(p.fen));
    setSelectedSquare(null);
    setLegalMoves([]);
    setFeedback(null);
    setShowHint(false);
    setShowAnswer(false);
    setSolved(false);
  };

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (solved || feedback === "wrong") return;

      if (selectedSquare && legalMoves.includes(square)) {
        const moveCopy = new Chess(game.fen());
        const move = moveCopy.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move && puzzle.solution.includes(move.san)) {
          setGame(moveCopy);
          setFeedback("correct");
          setSolved(true);
        } else {
          setFeedback("wrong");
          setTimeout(() => setFeedback(null), 1500);
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

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
    [game, selectedSquare, legalMoves, puzzle, solved, feedback]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          Tactical <span className="text-gradient-gold">Puzzles</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Find the best move! Puzzle {puzzleIdx + 1} of {PUZZLES.length}
        </p>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          {/* Board */}
          <div className="w-full max-w-[min(90vw,480px)]" role="grid" aria-label="Puzzle chess board">
            {RANKS.map((rank, ri) => (
              <div key={rank} className="flex" role="row">
                {FILES.map((file, fi) => {
                  const square = `${file}${rank}` as Square;
                  const isLight = (ri + fi) % 2 === 0;
                  const piece = board[ri][fi];
                  const isSelected = selectedSquare === square;
                  const isLegal = legalMoves.includes(square);
                  const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                  const pieceDisplay = pieceKey ? PIECE_DISPLAY[pieceKey] : null;

                  return (
                    <button
                      key={square}
                      role="gridcell"
                      aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                      className={`aspect-square w-[12.5%] flex items-center justify-center text-3xl sm:text-5xl select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset
                        ${isLight ? "bg-board-light" : "bg-board-dark"}
                        ${isSelected ? "ring-2 ring-primary ring-inset brightness-125" : ""}
                        ${isLegal ? "cursor-pointer" : "cursor-default"}
                      `}
                      onClick={() => handleSquareClick(square)}
                      tabIndex={0}
                    >
                      {isLegal && !piece && (
                        <span className="block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary/40" />
                      )}
                      {isLegal && pieceDisplay && (
                        <span className={`${pieceDisplay.className} drop-shadow-[0_0_6px_hsl(var(--primary))]`}>
                          {pieceDisplay.symbol}
                        </span>
                      )}
                      {!isLegal && pieceDisplay && (
                        <span className={pieceDisplay.className}>
                          {pieceDisplay.symbol}
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
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h2 className="font-display text-lg font-semibold text-foreground">{puzzle.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                White to move and win
              </p>
            </div>

            <div role="status" aria-live="polite" className="min-h-[40px]">
              {feedback === "correct" && (
                <div className="flex items-center gap-2 text-accent-foreground bg-accent rounded-lg px-4 py-2">
                  <CheckCircle2 className="h-5 w-5" /> Correct!
                </div>
              )}
              {feedback === "wrong" && (
                <div className="flex items-center gap-2 text-destructive-foreground bg-destructive rounded-lg px-4 py-2">
                  <XCircle className="h-5 w-5" /> Try again!
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowHint(!showHint)} aria-label="Show hint">
                <Lightbulb className="mr-2 h-4 w-4" /> Hint
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowAnswer(!showAnswer)} aria-label="Show answer">
                <Eye className="mr-2 h-4 w-4" /> Answer
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => loadPuzzle((puzzleIdx + 1) % PUZZLES.length)}
                aria-label="Next puzzle"
              >
                <SkipForward className="mr-2 h-4 w-4" /> Next
              </Button>
            </div>

            {showHint && (
              <p className="text-sm text-primary bg-primary/10 rounded-lg p-3 border border-primary/20">
                💡 {puzzle.hint}
              </p>
            )}

            {showAnswer && (
              <p className="text-sm text-accent-foreground bg-accent/20 rounded-lg p-3 border border-accent/30">
                ✅ {puzzle.answer}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Puzzles;
