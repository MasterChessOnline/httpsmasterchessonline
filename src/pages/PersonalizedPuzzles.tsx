import { useState, useMemo, useCallback, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Brain, CheckCircle2, XCircle, Eye, SkipForward, Target } from "lucide-react";
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

const PersonalizedPuzzles = () => {
  const { user, profile, isPremium, loading } = useAuth();
  const navigate = useNavigate();

  // Filter puzzles by difficulty based on rating
  const personalizedPuzzles = useMemo(() => {
    if (!profile) return PUZZLES;
    const rating = profile.rating;
    // Sort by difficulty matching player level
    return [...PUZZLES].sort((a, b) => {
      const diffA = a.solution.length; // More moves = harder
      const diffB = b.solution.length;
      // Lower rated players get easier puzzles first
      if (rating < 1300) return diffA - diffB;
      if (rating < 1600) return 0; // Mixed
      return diffB - diffA; // Higher rated get harder first
    });
  }, [profile]);

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = personalizedPuzzles[puzzleIdx];
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct" | "wrong" | "revealed">("playing");
  const [solved, setSolved] = useState(0);

  const resetPuzzle = useCallback((idx: number) => {
    const p = personalizedPuzzles[idx];
    setGame(new Chess(p.fen));
    setSelectedSquare(null);
    setMoveIndex(0);
    setStatus("playing");
  }, [personalizedPuzzles]);

  const handleSquareClick = useCallback((square: string) => {
    if (status !== "playing") return;
    if (selectedSquare) {
      const from = selectedSquare;
      const to = square;
      const g = new Chess(game.fen());
      const expectedMove = puzzle.solution[moveIndex];
      try {
        const move = g.move({ from: from as Square, to: to as Square, promotion: "q" });
        if (move && `${move.from}${move.to}` === expectedMove) {
          setGame(g);
          const nextIdx = moveIndex + 1;
          if (nextIdx >= puzzle.solution.length) {
            setStatus("correct");
            setSolved((s) => s + 1);
          } else {
            // Auto-reply opponent move
            const opponentMove = puzzle.solution[nextIdx];
            setTimeout(() => {
              const g2 = new Chess(g.fen());
              g2.move({ from: opponentMove.slice(0, 2) as Square, to: opponentMove.slice(2, 4) as Square, promotion: "q" });
              setGame(g2);
              setMoveIndex(nextIdx + 1);
            }, 400);
            setMoveIndex(nextIdx);
          }
        } else {
          setStatus("wrong");
        }
      } catch {
        setStatus("wrong");
      }
      setSelectedSquare(null);
    } else {
      setSelectedSquare(square);
    }
  }, [selectedSquare, game, puzzle, moveIndex, status]);

  if (loading) return <div className="min-h-screen bg-background" />;

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-16 max-w-2xl text-center">
          <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Personalized Puzzle Training
          </h1>
          <p className="text-muted-foreground mb-8">
            Get puzzles tailored to your skill level. Premium members receive custom puzzle sets matched to their rating and weaknesses.
          </p>
          <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">
            <Crown className="w-4 h-4 mr-2" /> Upgrade to Premium
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const board = game.board();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <div className="text-center mb-6">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
            <Target className="w-3 h-3 mr-1" /> Skill Level: {profile?.rating || 1200}
          </Badge>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Personalized <span className="text-gradient-gold">Puzzles</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Puzzle {puzzleIdx + 1}/{personalizedPuzzles.length} · Solved: {solved}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden shadow-lg w-full max-w-[400px] aspect-square">
            {RANKS.map((rank) =>
              FILES.map((file) => {
                const square = `${file}${rank}`;
                const isLight = (file.charCodeAt(0) - 97 + rank) % 2 === 1;
                const piece = board[8 - rank][file.charCodeAt(0) - 97];
                const isSelected = selectedSquare === square;
                const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                const display = pieceKey ? PIECE_DISPLAY[pieceKey] : null;

                return (
                  <button
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl transition-all ${
                      isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]"
                    } ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
                  >
                    {display && <span className={display.className}>{display.symbol}</span>}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3">
            {status === "correct" && (
              <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="w-3 h-3 mr-1" /> Correct!</Badge>
            )}
            {status === "wrong" && (
              <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Incorrect</Badge>
            )}
            {status === "revealed" && (
              <Badge variant="outline"><Eye className="w-3 h-3 mr-1" /> Solution shown</Badge>
            )}
          </div>

          <div className="flex gap-2">
            {status === "playing" && (
              <Button variant="outline" size="sm" onClick={() => setStatus("revealed")}>
                <Eye className="w-3.5 h-3.5 mr-1" /> Reveal
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                const next = (puzzleIdx + 1) % personalizedPuzzles.length;
                setPuzzleIdx(next);
                resetPuzzle(next);
              }}
            >
              <SkipForward className="w-3.5 h-3.5 mr-1" /> Next
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-sm">
            {puzzle.title} — {game.turn() === "w" ? "White" : "Black"} to move
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalizedPuzzles;
