import { useState, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Target, Trophy, Zap, RotateCcw, ChevronRight, Star, CheckCircle, XCircle } from "lucide-react";

// Curated positions with best moves
const POSITIONS = [
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", bestMove: "h5f7", title: "Scholar's Mate", hint: "The queen can deliver a devastating blow!", points: 100 },
  { fen: "r2qk2r/ppp2ppp/2n1bn2/3pp1B1/2BPP1b1/2N2N2/PPP2PPP/R2QK2R w KQkq - 4 6", bestMove: "d4e5", title: "Central Break", hint: "Push in the center to open lines.", points: 150 },
  { fen: "r4rk1/ppp2ppp/2n5/3qN3/3P4/2P5/PP3PPP/R2QR1K1 w - - 0 15", bestMove: "e5f7", title: "Royal Fork", hint: "The knight has a devastating square!", points: 200 },
  { fen: "6k1/5ppp/8/8/8/8/1K3PPP/3R4 w - - 0 1", bestMove: "d1d8", title: "Back Rank", hint: "Check the back rank weakness.", points: 100 },
  { fen: "r1b1k2r/ppppqppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5", bestMove: "f3e5", title: "Knight Outpost", hint: "Centralize a piece with tempo.", points: 150 },
  { fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4", bestMove: "e2e3", title: "Nimzo-Indian Setup", hint: "Develop naturally and protect the center.", points: 100 },
  { fen: "r2q1rk1/pp2bppp/2n1bn2/2pp4/4P3/1BN2N2/PPPP1PPP/R1BQR1K1 w - - 0 9", bestMove: "e4d5", title: "Central Tension", hint: "Resolve the center with precision.", points: 150 },
  { fen: "r1bq1rk1/pppnnppp/4p3/3pP3/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQ - 2 7", bestMove: "f3g5", title: "Kingside Attack", hint: "Target the weak squares near the king.", points: 200 },
];

export default function GuessTheMove() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const position = POSITIONS[currentIndex];
  const game = useMemo(() => {
    const g = new Chess(position.fen);
    return g;
  }, [position.fen]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [] as Square[];
    return game.moves({ square: selectedSquare, verbose: true }).map(m => m.to as Square);
  }, [selectedSquare, game]);

  const handleSquareClick = useCallback((sq: Square) => {
    if (result) return;

    if (selectedSquare && legalMoves.includes(sq)) {
      const moveUci = `${selectedSquare}${sq}`;
      setAttempts(a => a + 1);
      if (moveUci === position.bestMove) {
        const bonus = showHint ? Math.floor(position.points / 2) : position.points;
        const streakBonus = streak >= 3 ? 50 : 0;
        setScore(s => s + bonus + streakBonus);
        setStreak(s => s + 1);
        setBestStreak(b => Math.max(b, streak + 1));
        setResult("correct");
      } else {
        setStreak(0);
        setResult("wrong");
      }
      setSelectedSquare(null);
    } else {
      setSelectedSquare(sq === selectedSquare ? null : sq);
    }
  }, [selectedSquare, legalMoves, result, position, showHint, streak]);

  const nextPosition = () => {
    if (currentIndex + 1 >= POSITIONS.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(i => i + 1);
      setResult(null);
      setShowHint(false);
      setSelectedSquare(null);
      setAttempts(0);
    }
  };

  const restart = () => {
    setCurrentIndex(0); setScore(0); setStreak(0); setBestStreak(0);
    setResult(null); setShowHint(false); setSelectedSquare(null);
    setAttempts(0); setCompleted(false);
  };

  const progress = ((currentIndex + (result ? 1 : 0)) / POSITIONS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Guess the Move</h1>
            <p className="text-sm text-muted-foreground">Find the best move in each position</p>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: Trophy, label: "Score", value: score, color: "text-yellow-400" },
            { icon: Zap, label: "Streak", value: streak, color: "text-orange-400" },
            { icon: Star, label: "Best", value: bestStreak, color: "text-purple-400" },
            { icon: Brain, label: "Position", value: `${currentIndex + 1}/${POSITIONS.length}`, color: "text-blue-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card/50 p-3 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <Progress value={progress} className="mb-6 h-2" />

        {completed ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16 space-y-6">
            <Trophy className="w-20 h-20 text-primary mx-auto" />
            <h2 className="text-3xl font-bold">Challenge Complete!</h2>
            <div className="text-5xl font-bold text-primary">{score} pts</div>
            <p className="text-muted-foreground">Best streak: {bestStreak} in a row</p>
            <Button onClick={restart} size="lg"><RotateCcw className="w-4 h-4 mr-2" /> Play Again</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Board */}
            <div>
              <div className="mb-3">
                <Badge variant="outline" className="text-sm">{position.title}</Badge>
                <span className="text-sm text-muted-foreground ml-2">{position.points} pts</span>
                {streak >= 3 && <Badge className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30">🔥 +50 streak bonus</Badge>}
              </div>
              <ChessBoard
                game={game}
                flipped={false}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={null}
                isGameOver={!!result}
                isPlayerTurn={!result}
                onSquareClick={handleSquareClick}
              />
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`rounded-xl border p-4 ${result === "correct" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {result === "correct" ? (
                        <><CheckCircle className="w-5 h-5 text-green-400" /><span className="font-bold text-green-400">Correct!</span></>
                      ) : (
                        <><XCircle className="w-5 h-5 text-red-400" /><span className="font-bold text-red-400">Not the best move</span></>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Best move: <span className="font-mono font-bold text-foreground">{position.bestMove.slice(0, 2)} → {position.bestMove.slice(2, 4)}</span>
                    </p>
                    <Button onClick={nextPosition} className="w-full">
                      {currentIndex + 1 >= POSITIONS.length ? "See Results" : "Next Position"} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!result && (
                <div className="rounded-xl border border-border bg-card/50 p-4">
                  <h3 className="font-semibold mb-2">Find the best move</h3>
                  <p className="text-sm text-muted-foreground mb-3">White to play. Click a piece, then click where it should go.</p>
                  {!showHint ? (
                    <Button variant="outline" size="sm" onClick={() => setShowHint(true)}>
                      <Brain className="w-4 h-4 mr-1" /> Show Hint (half points)
                    </Button>
                  ) : (
                    <p className="text-sm text-primary italic">💡 {position.hint}</p>
                  )}
                </div>
              )}

              {/* Scoring info */}
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <h3 className="font-semibold mb-2 text-sm">Scoring</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Correct answer: full points</p>
                  <p>• With hint: half points</p>
                  <p>• 3+ streak: +50 bonus</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
