import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAIMove } from "@/lib/chess-ai";
import { playChessSound } from "@/lib/chess-sounds";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Swords, Shield, Zap, RotateCcw, Trophy, Brain, Target } from "lucide-react";

interface GMStyle {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Crown;
  color: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "master";
}

const GM_STYLES: GMStyle[] = [
  { id: "aggressive", name: "Mikhail Tal", subtitle: "The Magician from Riga", icon: Zap, color: "text-red-400", description: "Sacrifices and wild attacks. Survive the storm!", difficulty: "advanced" },
  { id: "positional", name: "Anatoly Karpov", subtitle: "The Boa Constrictor", icon: Shield, color: "text-blue-400", description: "Slow squeeze. Every move tightens the grip.", difficulty: "master" },
  { id: "tactical", name: "Garry Kasparov", subtitle: "The Beast from Baku", icon: Swords, color: "text-orange-400", description: "Deep calculations and dynamic play.", difficulty: "master" },
  { id: "universal", name: "Magnus Carlsen", subtitle: "The Mozart of Chess", icon: Crown, color: "text-purple-400", description: "Flawless technique in any position.", difficulty: "master" },
  { id: "romantic", name: "Paul Morphy", subtitle: "The Pride of New Orleans", icon: Target, color: "text-green-400", description: "Classical development and open game brilliance.", difficulty: "intermediate" },
  { id: "defensive", name: "Tigran Petrosian", subtitle: "Iron Tigran", icon: Shield, color: "text-cyan-400", description: "Prophylactic mastery. Nothing gets through.", difficulty: "advanced" },
];

export default function PlayLikeGM() {
  const [selectedGM, setSelectedGM] = useState<GMStyle | null>(null);
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [survivalMoves, setSurvivalMoves] = useState(0);
  const gameRef = useRef(game);
  gameRef.current = game;

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [] as Square[];
    return game.moves({ square: selectedSquare, verbose: true }).map(m => m.to as Square);
  }, [selectedSquare, game]);

  const getDifficulty = () => {
    if (!selectedGM) return "beginner";
    return selectedGM.difficulty === "master" ? "master" : selectedGM.difficulty;
  };

  const makeAIMove = useCallback(async () => {
    if (gameRef.current.isGameOver()) return;
    setAiThinking(true);
    await new Promise(r => setTimeout(r, 500 + Math.random() * 800));
    const g = gameRef.current;
    const aiMove = getAIMove(g, getDifficulty() as any);
    if (aiMove) {
      const result = g.move(aiMove);
      if (result) {
        setLastMove({ from: result.from, to: result.to });
        playChessSound(result.captured ? "capture" : "move");
        setGame(new Chess(g.fen()));
        setMoveCount(c => c + 1);
        if (g.isGameOver()) setGameOver(true);
      }
    }
    setAiThinking(false);
  }, [selectedGM]);

  const handleSquareClick = useCallback((sq: Square) => {
    if (aiThinking || game.isGameOver() || game.turn() !== "w") return;

    if (selectedSquare && legalMoves.includes(sq)) {
      const g = new Chess(game.fen());
      const result = g.move({ from: selectedSquare, to: sq, promotion: "q" });
      if (result) {
        setLastMove({ from: result.from, to: result.to });
        playChessSound(result.captured ? "capture" : "move");
        setGame(new Chess(g.fen()));
        setSelectedSquare(null);
        setMoveCount(c => c + 1);
        setSurvivalMoves(s => s + 1);
        if (g.isGameOver()) { setGameOver(true); return; }
        setTimeout(() => makeAIMove(), 300);
      }
    } else {
      setSelectedSquare(sq === selectedSquare ? null : sq);
    }
  }, [selectedSquare, legalMoves, aiThinking, game, makeAIMove]);

  const startGame = (gm: GMStyle) => {
    setSelectedGM(gm);
    setGame(new Chess());
    setSelectedSquare(null);
    setLastMove(null);
    setMoveCount(0);
    setSurvivalMoves(0);
    setGameOver(false);
  };

  const backToSelect = () => {
    setSelectedGM(null);
    setGameOver(false);
  };

  if (!selectedGM) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Play Like a Grandmaster</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Choose a legendary GM style. The AI will play in their iconic fashion — can you survive?</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GM_STYLES.map((gm, i) => (
              <motion.button key={gm.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} onClick={() => startGame(gm)}
                className="group text-left rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/40 hover:bg-card transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl bg-card border border-border group-hover:border-primary/30 ${gm.color}`}>
                    <gm.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{gm.name}</div>
                    <div className="text-xs text-muted-foreground">{gm.subtitle}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{gm.description}</p>
                <Badge variant="outline" className="text-[10px]">{gm.difficulty}</Badge>
              </motion.button>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = selectedGM.icon;
  const resultText = game.isCheckmate()
    ? (game.turn() === "w" ? `${selectedGM.name} wins by checkmate!` : "You defeated the Grandmaster!")
    : game.isDraw() ? "Draw!" : game.isStalemate() ? "Stalemate!" : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* GM header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2 rounded-xl bg-card border border-border ${selectedGM.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">vs {selectedGM.name}</h1>
            <p className="text-xs text-muted-foreground">{selectedGM.subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline">Move {moveCount}</Badge>
            {aiThinking && <Badge className="bg-primary/20 text-primary animate-pulse">Thinking...</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <ChessBoard
            game={game}
            flipped={false}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isGameOver={gameOver}
            isPlayerTurn={game.turn() === "w" && !aiThinking}
            onSquareClick={handleSquareClick}
          />

          <div className="space-y-4">
            {gameOver && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">{resultText}</p>
                <p className="text-sm text-muted-foreground mt-1">You survived {survivalMoves} moves</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" onClick={backToSelect} className="flex-1">Change GM</Button>
                  <Button onClick={() => startGame(selectedGM)} className="flex-1"><RotateCcw className="w-4 h-4 mr-1" /> Rematch</Button>
                </div>
              </motion.div>
            )}

            <div className="rounded-xl border border-border bg-card/50 p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> GM Style
              </h3>
              <p className="text-sm text-muted-foreground">{selectedGM.description}</p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-4">
              <h3 className="font-semibold mb-2 text-sm">Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Total Moves</div><div className="font-bold">{moveCount}</div>
                <div className="text-muted-foreground">Your Moves</div><div className="font-bold">{survivalMoves}</div>
                <div className="text-muted-foreground">Difficulty</div><div className="font-bold capitalize">{selectedGM.difficulty}</div>
              </div>
            </div>

            {!gameOver && (
              <Button variant="outline" className="w-full" onClick={backToSelect}>
                ← Choose Different GM
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
