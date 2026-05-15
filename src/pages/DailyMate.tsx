import { useEffect, useMemo, useState, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import ShareBar from "@/components/ShareBar";
import ChessBoard from "@/components/chess/ChessBoard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crosshair, Flame, Trophy, RotateCcw, Lightbulb, Check, X } from "lucide-react";
import { getTodaysMate, secondsUntilNextMate } from "@/lib/daily-mates";
import { loadStreak } from "@/components/DailyMateWidget";
import { toast } from "sonner";

const STORAGE_KEY = "mc.dailyMate.streak.v1";
const SOLVED_KEY = "mc.dailyMate.solved.v1";

function todayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function recordSolved() {
  try {
    const today = todayKey();
    const existing = loadStreak();
    if (existing.lastSolvedDay === today) return existing; // already counted
    // Yesterday continues streak; otherwise reset to 1
    const yest = new Date();
    yest.setUTCDate(yest.getUTCDate() - 1);
    const yKey = `${yest.getUTCFullYear()}-${String(yest.getUTCMonth() + 1).padStart(2, "0")}-${String(yest.getUTCDate()).padStart(2, "0")}`;
    const newStreak = existing.lastSolvedDay === yKey ? existing.streak + 1 : 1;
    const next = { streak: newStreak, lastSolvedDay: today };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(SOLVED_KEY, today);
    return next;
  } catch {
    return loadStreak();
  }
}

export default function DailyMate() {
  const puzzle = useMemo(() => getTodaysMate(), []);
  const [game, setGame] = useState<Chess>(() => new Chess(puzzle.fen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(loadStreak());
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilNextMate());

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(secondsUntilNextMate()), 1000);
    return () => clearInterval(t);
  }, []);

  const flipped = puzzle.side === "b";
  const isPlayerTurn = !solved && !failed && game.turn() === puzzle.side;

  const reset = useCallback(() => {
    setGame(new Chess(puzzle.fen));
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setSolved(false);
    setFailed(false);
  }, [puzzle.fen]);

  // Defender plays after a small delay
  useEffect(() => {
    if (solved || failed) return;
    if (game.turn() === puzzle.side) return;
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;
    const t = setTimeout(() => {
      // Defender picks any legal move (random; chess.js will be checkmated if puzzle is correct)
      const m = moves[Math.floor(Math.random() * moves.length)];
      const next = new Chess(game.fen());
      next.move({ from: m.from, to: m.to, promotion: m.promotion });
      setLastMove({ from: m.from, to: m.to });
      setGame(next);
    }, 380);
    return () => clearTimeout(t);
  }, [game, puzzle.side, solved, failed]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!isPlayerTurn) return;
    if (selectedSquare && legalMoves.includes(square)) {
      const next = new Chess(game.fen());
      const move = next.move({ from: selectedSquare, to: square, promotion: "q" });
      if (!move) return;
      setLastMove({ from: selectedSquare, to: square });
      setGame(next);
      setSelectedSquare(null);
      setLegalMoves([]);
      // Check first-move correctness on the FIRST player move
      const isFirstMove = game.fen() === puzzle.fen;
      if (isFirstMove && !puzzle.firstMoves.includes(move.san) && !puzzle.firstMoves.includes(move.san.replace("+", "").replace("#", ""))) {
        setFailed(true);
        toast.error("Wrong first move — try again.");
        return;
      }
      // Mate check
      if (next.isCheckmate()) {
        setSolved(true);
        const nextStreak = recordSolved();
        setStreak(nextStreak);
        toast.success(`Solved! Streak: ${nextStreak.streak} day${nextStreak.streak === 1 ? "" : "s"}`);
      }
      return;
    }
    const piece = game.get(square);
    if (piece && piece.color === puzzle.side) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [isPlayerTurn, selectedSquare, legalMoves, game, puzzle.fen, puzzle.firstMoves, puzzle.side]);

  const hh = Math.floor(secondsLeft / 3600);
  const mm = Math.floor((secondsLeft % 3600) / 60);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Seo
        title={`Daily Mate in ${puzzle.matesIn} — solve today's chess puzzle | MasterChess`}
        description={`Today's daily mate-in-${puzzle.matesIn} chess puzzle. Find the forced mate, build your streak, and challenge your friends.`}
        path="/daily-mate"
      />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs mb-2 gap-1">
            <Crosshair className="w-3 h-3" /> Daily Mate Challenge
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-1">
            Mate in <span className="text-gradient-gold">{puzzle.matesIn}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {puzzle.side === "w" ? "White" : "Black"} to play. New puzzle in {hh}h {mm}m.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          <Card className="p-3 border-border/40">
            <div className="aspect-square">
              <ChessBoard
                game={game}
                flipped={flipped}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isGameOver={solved || failed}
                isPlayerTurn={isPlayerTurn}
                onSquareClick={handleSquareClick}
              />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-4 border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-display text-sm font-bold">Your streak</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{streak.streak}<span className="text-sm text-muted-foreground font-normal"> day{streak.streak === 1 ? "" : "s"}</span></div>
              <p className="text-xs text-muted-foreground mt-1">Solve every UTC day to keep it alive.</p>
            </Card>

            {solved && (
              <Card className="p-4 border-emerald-500/40 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span className="font-display text-sm font-bold text-emerald-300">Solved!</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Tomorrow's puzzle drops at 00:00 UTC.</p>
                <ShareBar
                  url="https://masterchess.live/daily-mate"
                  title={`I solved today's mate-in-${puzzle.matesIn} on MasterChess. Can you?`}
                  compact
                />
              </Card>
            )}

            {failed && (
              <Card className="p-4 border-rose-500/40 bg-rose-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-rose-400" />
                  <span className="font-display text-sm font-bold text-rose-300">Not the key move</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Try a different first move — there's only one path.</p>
                <Button size="sm" variant="outline" onClick={reset} className="w-full">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Try again
                </Button>
              </Card>
            )}

            <Card className="p-4 border-border/40">
              <div className="flex items-center justify-between gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowHint((s) => !s)}>
                  <Lightbulb className="w-3.5 h-3.5 mr-1" /> {showHint ? "Hide" : "Show"} hint
                </Button>
                <Button size="sm" variant="ghost" onClick={reset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                </Button>
              </div>
              {showHint && (
                <p className="text-xs text-amber-300 mt-2">
                  Key piece moves to <strong>{puzzle.firstMoves[0].replace(/[^a-h1-8]/g, "").slice(-2) || "the critical square"}</strong>. Look for forcing checks.
                </p>
              )}
            </Card>

            <Card className="p-4 border-border/40">
              <h2 className="font-display text-sm font-bold mb-2">More to do</h2>
              <div className="grid gap-2">
                <Link to="/play/online"><Button variant="outline" size="sm" className="w-full">Play live</Button></Link>
                <Link to="/training"><Button variant="outline" size="sm" className="w-full">Opening trainer</Button></Link>
                <Link to="/leaderboard"><Button variant="outline" size="sm" className="w-full">Leaderboard</Button></Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
