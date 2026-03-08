import { useState, useMemo, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, CheckCircle2, XCircle, Eye, SkipForward, Target, Star } from "lucide-react";
import { PUZZLES } from "@/lib/puzzles-data";
import { hasAccess } from "@/lib/premium-tiers";

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
  const { user, profile, isPremium, subscriptionTier, loading } = useAuth();
  const navigate = useNavigate();

  // Pro+ gets advanced puzzles sorted by rating, Premium gets basic set
  const personalizedPuzzles = useMemo(() => {
    if (!profile) return PUZZLES;
    const rating = profile.rating;
    const isProPlus = hasAccess(subscriptionTier, "pro");

    return [...PUZZLES].sort((a, b) => {
      const diffA = a.moves.length;
      const diffB = b.moves.length;
      if (isProPlus) {
        // Pro+ gets harder puzzles prioritized based on rating
        if (rating >= 1600) return diffB - diffA;
        return diffA - diffB;
      }
      // Basic premium gets easier puzzles
      if (rating < 1300) return diffA - diffB;
      return 0;
    });
  }, [profile, subscriptionTier]);

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
      const expectedSan = puzzle.moves[moveIndex];
      try {
        const move = g.move({ from: from as Square, to: to as Square, promotion: "q" });
        if (move && move.san === expectedSan) {
          setGame(g);
          const nextIdx = moveIndex + 1;
          if (nextIdx >= puzzle.moves.length) {
            setStatus("correct");
            setSolved((s) => s + 1);
          } else {
            const opponentSan = puzzle.moves[nextIdx];
            setTimeout(() => {
              const g2 = new Chess(g.fen());
              try {
                g2.move(opponentSan);
                setGame(g2);
                setMoveIndex(nextIdx + 1);
              } catch {
                setMoveIndex(nextIdx + 1);
              }
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
          <p className="text-muted-foreground mb-4">
            Get puzzles tailored to your skill level. Premium members receive custom puzzle sets matched to their rating.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Required tier: <span className="text-primary font-semibold">Premium ($4.99/mo)</span> or higher.
            <br />
            <Star className="w-3 h-3 inline mr-1 text-blue-400" />
            <span className="text-blue-400 font-semibold">Pro</span> members get advanced difficulty puzzles.
          </p>
          <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">
            <Crown className="w-4 h-4 mr-2" /> View Plans
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const board = game.board();
  const isProPlus = hasAccess(subscriptionTier, "pro");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <div className="text-center mb-6">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
            <Target className="w-3 h-3 mr-1" /> Skill Level: {profile?.rating || 1200}
          </Badge>
          {isProPlus && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2 ml-2">
              <Star className="w-3 h-3 mr-1" /> Advanced Mode
            </Badge>
          )}
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
