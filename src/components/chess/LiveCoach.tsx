import { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, Sparkles, Target, Shield, Zap, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";

export type MoveClassification = "brilliant" | "great" | "good" | "inaccuracy" | "mistake" | "blunder" | null;
export type PlayerStyle = "aggressive" | "defensive" | "balanced" | "tactical" | "positional";

export interface MoveEval {
  fen: string;
  san: string;
  eval: number; // centipawns from white's perspective
  prevEval: number;
  classification: MoveClassification;
  color: "w" | "b";
}

interface LiveCoachProps {
  game: Chess;
  fen: string;
  moveHistory: string[];
  playerColor: "w" | "b";
  isGameOver: boolean;
  enabled: boolean;
  onToggle: () => void;
  onBlunderFlash: () => void;
}

function classifyMove(evalDrop: number, isPlayerMove: boolean): MoveClassification {
  const drop = Math.abs(evalDrop);
  if (evalDrop > 150 && isPlayerMove) return "brilliant"; // gained 150+ cp
  if (drop < 20) return "good";
  if (drop < 50) return "good";
  if (drop < 100) return "inaccuracy";
  if (drop < 200) return "mistake";
  return "blunder";
}

function getClassificationColor(c: MoveClassification): string {
  switch (c) {
    case "brilliant": return "text-cyan-400";
    case "great": return "text-blue-400";
    case "good": return "text-green-400";
    case "inaccuracy": return "text-yellow-400";
    case "mistake": return "text-orange-400";
    case "blunder": return "text-red-400";
    default: return "text-muted-foreground";
  }
}

function getClassificationIcon(c: MoveClassification) {
  switch (c) {
    case "brilliant": return <Sparkles className="w-4 h-4" />;
    case "great": return <Zap className="w-4 h-4" />;
    case "good": return <Target className="w-4 h-4" />;
    case "inaccuracy": return <TrendingDown className="w-4 h-4" />;
    case "mistake": return <AlertTriangle className="w-4 h-4" />;
    case "blunder": return <AlertTriangle className="w-4 h-4" />;
    default: return null;
  }
}

function getClassificationLabel(c: MoveClassification): string {
  switch (c) {
    case "brilliant": return "Brilliant!";
    case "great": return "Great Move";
    case "good": return "Good";
    case "inaccuracy": return "Inaccuracy";
    case "mistake": return "Mistake";
    case "blunder": return "BLUNDER!";
    default: return "";
  }
}

function getClassificationMessage(c: MoveClassification, san: string): string {
  switch (c) {
    case "brilliant": return `${san} is a brilliant move! Exceptional play.`;
    case "great": return `${san} — strong move, well played!`;
    case "good": return `${san} — solid move.`;
    case "inaccuracy": return `${san} is slightly inaccurate. A better move existed.`;
    case "mistake": return `${san} is a mistake! You lost some advantage.`;
    case "blunder": return `${san} is a blunder! This loses significant material or advantage.`;
    default: return "";
  }
}

/** Simple material-based eval (fast, no Stockfish needed for real-time) */
function quickEval(game: Chess): number {
  const pieceValues: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const board = game.board();
  let score = 0;
  let whiteMobility = 0;
  let blackMobility = 0;

  for (const row of board) {
    for (const sq of row) {
      if (sq) {
        const val = pieceValues[sq.type] || 0;
        score += sq.color === "w" ? val : -val;
      }
    }
  }

  // Basic mobility bonus
  const tempGame = new Chess(game.fen());
  const moves = tempGame.moves();
  const currentMobility = moves.length;
  if (game.turn() === "w") whiteMobility = currentMobility;
  else blackMobility = currentMobility;

  score += (whiteMobility - blackMobility) * 5;

  // King safety - penalize exposed king
  if (game.isCheck()) {
    score += game.turn() === "w" ? -50 : 50;
  }

  return score;
}

/** Detect clutch moments (large eval swings) */
function isClutchMoment(prevEval: number, currentEval: number): boolean {
  return Math.abs(currentEval - prevEval) > 300;
}

/** Detect threats - squares attacked by opponent */
function getThreatenedSquares(game: Chess, forColor: "w" | "b"): string[] {
  const opponentColor = forColor === "w" ? "b" : "w";
  const threatened: Set<string> = new Set();

  // Check all opponent moves for attack squares
  const tempGame = new Chess(game.fen());
  // We need to check from opponent's perspective
  const fen = game.fen();
  const parts = fen.split(" ");
  parts[1] = opponentColor;
  try {
    const oppGame = new Chess(parts.join(" "));
    const oppMoves = oppGame.moves({ verbose: true });
    for (const m of oppMoves) {
      if (m.captured) {
        threatened.add(m.to);
      }
    }
  } catch {
    // Invalid FEN modification, skip
  }

  return Array.from(threatened);
}

/** Detect hanging pieces */
function getHangingPieces(game: Chess, color: "w" | "b"): string[] {
  const hanging: string[] = [];
  const board = game.board();
  const threatened = getThreatenedSquares(game, color);
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece.color === color && piece.type !== "k") {
        const sq = `${files[f]}${ranks[r]}`;
        if (threatened.includes(sq)) {
          hanging.push(sq);
        }
      }
    }
  }
  return hanging;
}

/** Analyze player style based on move history */
export function analyzeStyle(moveEvals: MoveEval[]): PlayerStyle {
  if (moveEvals.length < 6) return "balanced";

  let captures = 0;
  let exchanges = 0;
  let quietMoves = 0;

  for (const me of moveEvals) {
    if (me.san.includes("x")) captures++;
    else quietMoves++;
  }

  const captureRate = captures / moveEvals.length;
  if (captureRate > 0.45) return "aggressive";
  if (captureRate < 0.15) return "positional";

  const blunders = moveEvals.filter(m => m.classification === "blunder" || m.classification === "mistake").length;
  const brilliants = moveEvals.filter(m => m.classification === "brilliant" || m.classification === "great").length;

  if (brilliants > blunders * 2) return "tactical";
  if (quietMoves > captures * 3) return "defensive";

  return "balanced";
}

/** Calculate accuracy percentage */
export function calculateAccuracy(moveEvals: MoveEval[], color: "w" | "b"): number {
  const playerMoves = moveEvals.filter(m => m.color === color);
  if (playerMoves.length === 0) return 100;

  let totalScore = 0;
  for (const m of playerMoves) {
    switch (m.classification) {
      case "brilliant": totalScore += 100; break;
      case "great": totalScore += 95; break;
      case "good": totalScore += 85; break;
      case "inaccuracy": totalScore += 60; break;
      case "mistake": totalScore += 30; break;
      case "blunder": totalScore += 5; break;
      default: totalScore += 80; break;
    }
  }

  return Math.round(totalScore / playerMoves.length);
}

export default function LiveCoach({
  game, fen, moveHistory, playerColor, isGameOver, enabled, onToggle, onBlunderFlash,
}: LiveCoachProps) {
  const [currentClassification, setCurrentClassification] = useState<MoveClassification>(null);
  const [coachMessage, setCoachMessage] = useState("");
  const [evalScore, setEvalScore] = useState(0);
  const [showThreatMap, setShowThreatMap] = useState(false);
  const [hangingPieces, setHangingPieces] = useState<string[]>([]);
  const [clutchAlert, setClutchAlert] = useState(false);
  const [moveEvals, setMoveEvals] = useState<MoveEval[]>([]);
  const prevEvalRef = useRef(0);
  const prevMoveCountRef = useRef(0);

  // Evaluate position after each move
  useEffect(() => {
    if (!enabled || moveHistory.length === 0) return;
    if (moveHistory.length === prevMoveCountRef.current) return;

    const newEval = quickEval(game);
    const prevEval = prevEvalRef.current;
    const lastSan = moveHistory[moveHistory.length - 1];
    const moveColor: "w" | "b" = moveHistory.length % 2 === 1 ? "w" : "b";
    const isPlayerMove = moveColor === playerColor;

    // Calculate eval drop from the player's perspective
    const evalChange = moveColor === "w"
      ? newEval - prevEval  // white move: positive = good for white
      : -(newEval - prevEval); // black move: positive = good for black (inverted)

    const classification = classifyMove(-evalChange, isPlayerMove && evalChange > 100);

    // Override to brilliant if player gained a lot
    let finalClassification = classification;
    if (isPlayerMove && evalChange > 150) finalClassification = "brilliant";
    else if (isPlayerMove && evalChange > 80) finalClassification = "great";

    const moveEval: MoveEval = {
      fen,
      san: lastSan,
      eval: newEval,
      prevEval,
      classification: finalClassification,
      color: moveColor,
    };

    setMoveEvals(prev => [...prev, moveEval]);
    setEvalScore(newEval);
    setCurrentClassification(finalClassification);
    setCoachMessage(getClassificationMessage(finalClassification, lastSan));

    // Blunder flash
    if (finalClassification === "blunder" && isPlayerMove) {
      onBlunderFlash();
    }

    // Clutch detection
    if (isClutchMoment(prevEval, newEval)) {
      setClutchAlert(true);
      setTimeout(() => setClutchAlert(false), 3000);
    }

    // Update hanging pieces
    setHangingPieces(getHangingPieces(game, playerColor));

    prevEvalRef.current = newEval;
    prevMoveCountRef.current = moveHistory.length;

    // Auto-hide message
    const timer = setTimeout(() => {
      setCurrentClassification(null);
      setCoachMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [moveHistory.length, enabled]);

  // Reset on new game
  useEffect(() => {
    if (moveHistory.length === 0) {
      setMoveEvals([]);
      setEvalScore(0);
      setCurrentClassification(null);
      setCoachMessage("");
      prevEvalRef.current = 0;
      prevMoveCountRef.current = 0;
      setHangingPieces([]);
      setClutchAlert(false);
    }
  }, [moveHistory.length]);

  // Eval bar value (clamped between -1000 and 1000 for display)
  const clampedEval = Math.max(-1000, Math.min(1000, evalScore));
  const whiteAdvantage = ((clampedEval + 1000) / 2000) * 100; // 0-100%

  const playerAccuracy = calculateAccuracy(moveEvals, playerColor);
  const style = analyzeStyle(moveEvals.filter(m => m.color === playerColor));

  const styleConfig: Record<PlayerStyle, { icon: React.ReactNode; color: string }> = {
    aggressive: { icon: <Zap className="w-3 h-3" />, color: "text-red-400" },
    defensive: { icon: <Shield className="w-3 h-3" />, color: "text-blue-400" },
    balanced: { icon: <Target className="w-3 h-3" />, color: "text-green-400" },
    tactical: { icon: <Sparkles className="w-3 h-3" />, color: "text-purple-400" },
    positional: { icon: <Brain className="w-3 h-3" />, color: "text-teal-400" },
  };

  return (
    <div className="space-y-2">
      {/* Toggle */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
          enabled
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-card border-border/40 text-muted-foreground hover:border-primary/30"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" />
          AI Coach
        </span>
        {enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>

      {enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          {/* Evaluation Bar */}
          <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-2 py-1">
              <span className="text-[10px] font-mono text-muted-foreground">EVAL</span>
              <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-white/90 to-white/70 rounded-full"
                  animate={{ width: `${whiteAdvantage}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-foreground min-w-[3rem] text-right">
                {evalScore > 0 ? "+" : ""}{(evalScore / 100).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Move Classification Alert */}
          <AnimatePresence>
            {currentClassification && coachMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  currentClassification === "blunder"
                    ? "bg-red-500/10 border-red-500/30"
                    : currentClassification === "mistake"
                    ? "bg-orange-500/10 border-orange-500/30"
                    : currentClassification === "brilliant"
                    ? "bg-cyan-500/10 border-cyan-500/30"
                    : "bg-card border-border/40"
                }`}
              >
                <span className={getClassificationColor(currentClassification)}>
                  {getClassificationIcon(currentClassification)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${getClassificationColor(currentClassification)}`}>
                    {getClassificationLabel(currentClassification)}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{coachMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clutch Alert */}
          <AnimatePresence>
            {clutchAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
              >
                <Zap className="w-4 h-4 text-yellow-400" />
                <p className="text-xs font-bold text-yellow-400">⚡ CLUTCH MOMENT!</p>
                <p className="text-[10px] text-muted-foreground">Major turning point detected</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hanging Pieces Warning */}
          {hangingPieces.length > 0 && !isGameOver && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              <p className="text-[10px] text-orange-400">
                ⚠️ Hanging piece{hangingPieces.length > 1 ? "s" : ""} on {hangingPieces.join(", ")}
              </p>
            </div>
          )}

          {/* Stats Bar */}
          {moveHistory.length >= 4 && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-card border border-border/30">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-foreground">{playerAccuracy}%</span>
                <span className="text-[10px] text-muted-foreground">acc</span>
              </div>
              <div className="w-px h-3 bg-border/50" />
              <div className={`flex items-center gap-1 ${styleConfig[style].color}`}>
                {styleConfig[style].icon}
                <span className="text-[10px] font-bold capitalize">{style}</span>
              </div>
              <div className="w-px h-3 bg-border/50" />
              <div className="flex items-center gap-0.5">
                {moveEvals.slice(-5).map((me, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      me.classification === "blunder" ? "bg-red-400" :
                      me.classification === "mistake" ? "bg-orange-400" :
                      me.classification === "inaccuracy" ? "bg-yellow-400" :
                      me.classification === "brilliant" ? "bg-cyan-400" :
                      "bg-green-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Threat Map Toggle */}
          <button
            onClick={() => setShowThreatMap(!showThreatMap)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
              showThreatMap
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-card border-border/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>🗺️ Threat Map</span>
            <span>{showThreatMap ? "ON" : "OFF"}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
