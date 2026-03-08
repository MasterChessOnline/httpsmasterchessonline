import { useState, useMemo, useCallback, useEffect } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Lightbulb, SkipForward, CheckCircle2, XCircle, Eye } from "lucide-react";
import { PUZZLES } from "@/lib/puzzles-data";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

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

const Puzzles = () => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = PUZZLES[puzzleIdx];
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [moveIndex, setMoveIndex] = useState(0); // which move in the sequence
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [solved, setSolved] = useState(false);
  const [opponentThinking, setOpponentThinking] = useState(false);

  const board = useMemo(() => game.board(), [game.fen()]);
  const boardFlipped = puzzle.playerColor === "b";
  const displayFiles = boardFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = boardFlipped ? [...RANKS].reverse() : RANKS;

  const loadPuzzle = (idx: number) => {
    const p = PUZZLES[idx];
    setPuzzleIdx(idx);
    setGame(new Chess(p.fen));
    setMoveIndex(0);
    setSelectedSquare(null);
    setLegalMoves([]);
    setFeedback(null);
    setShowHint(false);
    setShowAnswer(false);
    setSolved(false);
    setOpponentThinking(false);
  };

  // Auto-play opponent's response after correct player move
  useEffect(() => {
    if (!opponentThinking) return;
    const opponentMove = puzzle.moves[moveIndex];
    if (!opponentMove) { setOpponentThinking(false); return; }

    const timer = setTimeout(() => {
      const newGame = new Chess(game.fen());
      const move = newGame.move(opponentMove);
      if (move) {
        setGame(newGame);
        setMoveIndex((prev) => prev + 1);
      }
      setOpponentThinking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [opponentThinking]);

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (solved || feedback === "wrong" || opponentThinking) return;

      if (selectedSquare && legalMoves.includes(square)) {
        const moveCopy = new Chess(game.fen());
        const move = moveCopy.move({ from: selectedSquare, to: square, promotion: "q" });

        if (move) {
          const expectedMove = puzzle.moves[moveIndex];
          if (move.san === expectedMove) {
            setGame(moveCopy);
            const nextMoveIndex = moveIndex + 1;
            setMoveIndex(nextMoveIndex);

            // Check if this was the last move (puzzle solved)
            if (nextMoveIndex >= puzzle.moves.length) {
              setFeedback("correct");
              setSolved(true);
            } else {
              // Trigger opponent's auto-response
              setFeedback(null);
              setOpponentThinking(true);
            }
          } else {
            setFeedback("wrong");
            setTimeout(() => setFeedback(null), 1500);
          }
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
    [game, selectedSquare, legalMoves, puzzle, solved, feedback, moveIndex, opponentThinking]
  );

  const difficultyColors: Record<string, string> = {
    easy: "text-green-400 bg-green-400/10 border-green-400/30",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    hard: "text-red-400 bg-red-400/10 border-red-400/30",
  };

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
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-lg font-semibold text-foreground">{puzzle.title}</h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${difficultyColors[puzzle.difficulty]}`}>
                  {puzzle.difficulty}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {puzzle.playerColor === "w" ? "White" : "Black"} to move — Mate in {puzzle.mateIn}
              </p>
              {opponentThinking && (
                <p className="text-xs text-primary mt-1 animate-pulse">Opponent responding…</p>
              )}
              {moveIndex > 0 && !solved && !opponentThinking && (
                <p className="text-xs text-primary mt-1">
                  Good! Find the next move… ({Math.ceil((puzzle.moves.length - moveIndex) / 2)} move{Math.ceil((puzzle.moves.length - moveIndex) / 2) > 1 ? "s" : ""} left)
                </p>
              )}
            </div>

            <div role="status" aria-live="polite" className="min-h-[40px]">
              {feedback === "correct" && (
                <div className="flex items-center gap-2 text-accent-foreground bg-accent rounded-lg px-4 py-2">
                  <CheckCircle2 className="h-5 w-5" /> Correct! Checkmate!
                </div>
              )}
              {feedback === "wrong" && (
                <div className="flex items-center gap-2 text-destructive-foreground bg-destructive rounded-lg px-4 py-2">
                  <XCircle className="h-5 w-5" /> Not the best move. Try again!
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowHint(!showHint)}>
                <Lightbulb className="mr-2 h-4 w-4" /> Hint
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowAnswer(!showAnswer)}>
                <Eye className="mr-2 h-4 w-4" /> Answer
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => loadPuzzle((puzzleIdx + 1) % PUZZLES.length)}
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

            {/* Puzzle navigator */}
            <div className="rounded-lg border border-border/50 bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">All Puzzles</p>
              <div className="flex flex-wrap gap-1">
                {PUZZLES.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => loadPuzzle(i)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-all border ${
                      i === puzzleIdx
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Puzzles;
