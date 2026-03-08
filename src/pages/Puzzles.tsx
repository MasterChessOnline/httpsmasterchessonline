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
  // --- Easy ---
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", solution: ["Qxf7#"], title: "Scholar's Mate", hint: "Attack the weak f7 square!", answer: "Qxf7# — The queen captures on f7, delivering checkmate.", difficulty: "easy" },
  { fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", solution: ["Re8#"], title: "Back Rank Mate", hint: "The king is trapped on the back rank.", answer: "Re8# — The rook delivers checkmate on the back rank.", difficulty: "easy" },
  { fen: "rnbqkbnr/ppppp2p/6p1/5p1Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 0 3", solution: ["Qh6#"], title: "Fool's Mate Variant", hint: "The king has no escape squares.", answer: "Qh6# — Checkmate! The weakened kingside allows an immediate queen mate.", difficulty: "easy" },
  { fen: "r1b1k2r/ppppqppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5", solution: ["Bxf7+"], title: "Fork the King", hint: "A bishop sacrifice wins the queen.", answer: "Bxf7+ — Bishop takes f7 with check, and the queen on e7 falls.", difficulty: "easy" },
  { fen: "r2qk2r/ppp1bppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 7", solution: ["Nxf7"], title: "Knight Raid", hint: "The knight can fork king and rook.", answer: "Nxf7 — The knight forks king and rook, winning the exchange.", difficulty: "easy" },
  { fen: "rn1qkbnr/ppp2ppp/8/3pp3/4P1b1/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 4", solution: ["Nxe5"], title: "Free Pawn Grab", hint: "A central pawn is undefended.", answer: "Nxe5 — The knight captures the undefended e5 pawn, attacking the bishop.", difficulty: "easy" },
  // --- Medium ---
  { fen: "r2qr1k1/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QR1K1 w - - 0 1", solution: ["Bxf7+"], title: "Pin & Win", hint: "Look for a piece that's pinned.", answer: "Bxf7+ — The bishop captures on f7 with check, winning material.", difficulty: "medium" },
  { fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6", solution: ["Bg5"], title: "Pin the Knight", hint: "Pin a piece to the queen.", answer: "Bg5 — The bishop pins the f6 knight to the queen on d8.", difficulty: "medium" },
  { fen: "r2q1rk1/pppb1ppp/2n1pn2/3p4/3P1B2/2NBPN2/PPP2PPP/R2QK2R w KQ - 0 7", solution: ["Bxh7+"], title: "Greek Gift", hint: "Sacrifice a bishop on h7!", answer: "Bxh7+ — The classic Greek Gift sacrifice, exposing the king.", difficulty: "medium" },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4", solution: ["Nxe5"], title: "Central Tactics", hint: "A central pawn can be taken safely.", answer: "Nxe5 — Captures the pawn; if Nxe5, d4 forks knight and bishop.", difficulty: "medium" },
  { fen: "r1b1kb1r/1pqp1ppp/p1n1pn2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 0 7", solution: ["Ndb5"], title: "Knight Outpost", hint: "Jump to a strong outpost square.", answer: "Ndb5 — The knight lands on b5 attacking the queen and threatening Nd6+.", difficulty: "medium" },
  { fen: "r2qkb1r/pp2pppp/2p2n2/3p1b2/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 0 5", solution: ["Ne5"], title: "Centralize & Attack", hint: "Plant a knight in the center.", answer: "Ne5 — Strong central knight eyes c6 and pressures the position.", difficulty: "medium" },
  { fen: "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 6", solution: ["Bxh7+"], title: "Another Greek Gift", hint: "The h7 pawn looks vulnerable.", answer: "Bxh7+ — Classic bishop sacrifice to expose the castled king.", difficulty: "medium" },
  // --- Hard ---
  { fen: "r1b2rk1/2q1bppp/p2p1n2/np2p3/3PP3/2N1BN1P/PPB2PP1/R2QR1K1 w - - 0 12", solution: ["d5"], title: "Pawn Break", hint: "A central pawn advance locks in an advantage.", answer: "d5 — Closes the center, trapping the c8 bishop and seizing space.", difficulty: "hard" },
  { fen: "r2q1rk1/1b1nbppp/pp1ppn2/8/2PNP3/1PN1BP2/P5PP/R2Q1RK1 w - - 0 12", solution: ["Nd5"], title: "Knight Domination", hint: "Plant a knight on the ideal square.", answer: "Nd5 — An unassailable knight on d5 dominates the position.", difficulty: "hard" },
  { fen: "2r1r1k1/pp1q1ppp/2n1pn2/2bp4/8/2PBPN2/PP1N1PPP/R2Q1RK1 w - - 0 11", solution: ["e4"], title: "Central Explosion", hint: "Open the center with a pawn push.", answer: "e4 — Opens lines for the bishops and challenges Black's center.", difficulty: "hard" },
  { fen: "r4rk1/pp1qppbp/2np1np1/8/2PP4/2N2NP1/PP2PPBP/R2Q1RK1 w - - 0 9", solution: ["d5"], title: "Space Advantage", hint: "Push a pawn to gain territory.", answer: "d5 — Gains space and displaces the c6 knight.", difficulty: "hard" },
  { fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 8", solution: ["Nd5"], title: "Sicilian Squeeze", hint: "A knight sacrifice threatens devastation.", answer: "Nd5 — The knight lands on d5 with tremendous pressure on e7 and c7.", difficulty: "hard" },
  { fen: "r2qk2r/pb1nbppp/1pp1pn2/3p4/2PP4/1PN1PN2/PB3PPP/R2QKB1R w KQkq - 0 8", solution: ["cxd5"], title: "Open the File", hint: "Exchange to open a central file.", answer: "cxd5 — Opens the c-file and creates an isolated d-pawn to target.", difficulty: "hard" },
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
