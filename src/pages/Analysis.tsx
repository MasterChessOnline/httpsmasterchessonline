import { useState, useEffect, useRef, useCallback } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine, type StockfishResult } from "@/lib/stockfish-engine";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Upload, Trash2, Zap, AlertTriangle, CheckCircle2, XCircle, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MoveEval {
  san: string;
  fen: string; // FEN after the move
  fenBefore: string; // FEN before the move
  color: "w" | "b";
  moveNumber: number;
  eval: number; // centipawns from white's perspective
  mate: number | null;
  bestMove: string; // best move UCI
  bestMoveSan: string;
  classification: "brilliant" | "great" | "good" | "inaccuracy" | "mistake" | "blunder";
  evalDrop: number; // how much eval dropped vs previous
}

function classifyMove(evalDrop: number): MoveEval["classification"] {
  const abs = Math.abs(evalDrop);
  if (abs <= 10) return "brilliant";
  if (abs <= 25) return "great";
  if (abs <= 50) return "good";
  if (abs <= 100) return "inaccuracy";
  if (abs <= 200) return "mistake";
  return "blunder";
}

const CLASSIFICATION_STYLES: Record<MoveEval["classification"], { color: string; icon: typeof CheckCircle2; label: string }> = {
  brilliant: { color: "text-cyan-400", icon: Zap, label: "Brilliant" },
  great: { color: "text-green-400", icon: CheckCircle2, label: "Great" },
  good: { color: "text-green-300/70", icon: CheckCircle2, label: "Good" },
  inaccuracy: { color: "text-yellow-400", icon: AlertTriangle, label: "Inaccuracy" },
  mistake: { color: "text-orange-400", icon: XCircle, label: "Mistake" },
  blunder: { color: "text-red-500", icon: XCircle, label: "Blunder" },
};

function formatEval(cp: number, mate: number | null): string {
  if (mate !== null) return mate > 0 ? `M${mate}` : `M${mate}`;
  const val = cp / 100;
  return val >= 0 ? `+${val.toFixed(1)}` : val.toFixed(1);
}

function evalToBarPercent(cp: number, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 95 : 5;
  // Sigmoid-like mapping: clamp between 5-95%
  const x = cp / 100;
  const pct = 50 + 50 * (2 / (1 + Math.exp(-0.4 * x)) - 1);
  return Math.max(5, Math.min(95, pct));
}

export default function Analysis() {
  const [pgnInput, setPgnInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moveEvals, setMoveEvals] = useState<MoveEval[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = starting position
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState("");

  const displayGame = useRef(new Chess());
  const [displayFen, setDisplayFen] = useState("start");

  const stockfishReady = useRef(false);

  // Init Stockfish
  useEffect(() => {
    const engine = getStockfishEngine();
    engine.init().then(() => {
      stockfishReady.current = true;
    }).catch(() => setError("Failed to load analysis engine"));
  }, []);

  // Navigate to a move index
  const goToMove = useCallback((idx: number) => {
    const clamped = Math.max(-1, Math.min(idx, moveEvals.length - 1));
    setCurrentIdx(clamped);
    if (clamped === -1) {
      displayGame.current = new Chess();
    } else {
      displayGame.current = new Chess(moveEvals[clamped].fen);
    }
    setDisplayFen(displayGame.current.fen());
  }, [moveEvals]);

  // Keyboard navigation
  useEffect(() => {
    if (!analysisComplete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowLeft": goToMove(currentIdx - 1); break;
        case "ArrowRight": goToMove(currentIdx + 1); break;
        case "Home": goToMove(-1); break;
        case "End": goToMove(moveEvals.length - 1); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [analysisComplete, currentIdx, goToMove]);

  const runAnalysis = async () => {
    setError("");
    setMoveEvals([]);
    setAnalysisComplete(false);
    setCurrentIdx(-1);
    displayGame.current = new Chess();
    setDisplayFen("start");

    // Parse PGN
    const parseGame = new Chess();
    const trimmed = pgnInput.trim();

    if (!trimmed) {
      setError("Please enter a PGN or move list.");
      return;
    }

    // Try loading as PGN first
    try {
      parseGame.loadPgn(trimmed);
    } catch {
      // Try as space-separated moves
      parseGame.reset();
      const moves = trimmed.replace(/\d+\.\s*/g, "").split(/\s+/).filter(Boolean);
      for (const m of moves) {
        try {
          parseGame.move(m);
        } catch {
          setError(`Invalid move: "${m}". Please use valid PGN or algebraic notation.`);
          return;
        }
      }
    }

    const history = parseGame.history({ verbose: true });
    if (history.length === 0) {
      setError("No moves found. Paste a valid PGN or move list.");
      return;
    }

    if (!stockfishReady.current) {
      const engine = getStockfishEngine();
      await engine.init();
      stockfishReady.current = true;
    }

    setAnalyzing(true);
    const engine = getStockfishEngine();
    engine.newGame();

    const evals: MoveEval[] = [];
    const evalGame = new Chess();
    let prevEval = 0; // starting eval is ~0

    for (let i = 0; i < history.length; i++) {
      setProgress(Math.round(((i + 1) / history.length) * 100));

      const move = history[i];
      const fenBefore = evalGame.fen();

      // Get best move for this position BEFORE the player's move
      const bestResult = await engine.getBestMove(fenBefore, 800, 15);

      // Make the player's move
      evalGame.move(move.san);
      const fenAfter = evalGame.fen();

      // Evaluate the position AFTER the player's move
      const posEval = await engine.evaluate(fenAfter, 15);

      // The eval is from white's perspective
      const evalCp = posEval.mate !== null
        ? (posEval.mate > 0 ? 10000 : -10000)
        : posEval.evaluation;

      // Calculate eval drop (from the moving side's perspective)
      const wasWhite = move.color === "w";
      const prevFromSide = wasWhite ? prevEval : -prevEval;
      const currFromSide = wasWhite ? evalCp : -evalCp;
      const evalDrop = prevFromSide - currFromSide; // positive = player lost advantage

      // Convert best move UCI to SAN
      let bestMoveSan = bestResult.bestMove || "";
      if (bestResult.bestMove) {
        try {
          const tempGame = new Chess(fenBefore);
          const from = bestResult.bestMove.substring(0, 2) as Square;
          const to = bestResult.bestMove.substring(2, 4) as Square;
          const promo = bestResult.bestMove.length > 4 ? bestResult.bestMove[4] as any : undefined;
          const m = tempGame.move({ from, to, promotion: promo });
          if (m) bestMoveSan = m.san;
        } catch {
          bestMoveSan = bestResult.bestMove;
        }
      }

      evals.push({
        san: move.san,
        fen: fenAfter,
        fenBefore,
        color: move.color,
        moveNumber: Math.floor(i / 2) + 1,
        eval: evalCp,
        mate: posEval.mate,
        bestMove: bestResult.bestMove || "",
        bestMoveSan,
        classification: classifyMove(evalDrop),
        evalDrop,
      });

      prevEval = evalCp;
    }

    setMoveEvals(evals);
    setAnalysisComplete(true);
    setAnalyzing(false);
    setProgress(100);
    goToMove(0);
  };

  const clearAnalysis = () => {
    setPgnInput("");
    setMoveEvals([]);
    setAnalysisComplete(false);
    setCurrentIdx(-1);
    setError("");
    setProgress(0);
    displayGame.current = new Chess();
    setDisplayFen("start");
  };

  const currentEval = currentIdx >= 0 ? moveEvals[currentIdx] : null;
  const evalPercent = currentEval ? evalToBarPercent(currentEval.eval, currentEval.mate) : 50;

  // Stats summary
  const blunders = moveEvals.filter(e => e.classification === "blunder").length;
  const mistakes = moveEvals.filter(e => e.classification === "mistake").length;
  const inaccuracies = moveEvals.filter(e => e.classification === "inaccuracy").length;

  const lastMove = currentIdx >= 0 ? {
    from: (() => {
      // Reconstruct from/to from the eval's fenBefore
      const tempGame = new Chess(moveEvals[currentIdx].fenBefore);
      const m = tempGame.move(moveEvals[currentIdx].san);
      return m ? m.from : "";
    })(),
    to: (() => {
      const tempGame = new Chess(moveEvals[currentIdx].fenBefore);
      const m = tempGame.move(moveEvals[currentIdx].san);
      return m ? m.to : "";
    })(),
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Game Analysis</h1>
            <p className="text-sm text-muted-foreground">Powered by Stockfish — paste any game and get move-by-move evaluation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left: Eval Bar + Board side by side */}
          <div className="space-y-4">
            <div className="flex gap-2 items-stretch">
              {/* Vertical Eval Bar */}
              <div className="w-8 shrink-0 flex flex-col items-center">
                <div className="w-full flex-1 rounded-lg overflow-hidden border border-border/40 relative bg-[hsl(220,15%,18%)] min-h-[320px]">
                  {/* White (top portion) */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 bg-foreground/90"
                    initial={{ height: "50%" }}
                    animate={{ height: `${100 - evalPercent}%` }}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  />
                  {/* Eval label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-between py-1.5 pointer-events-none">
                    <span className={`text-[10px] font-bold font-mono z-10 ${evalPercent < 50 ? "text-background" : "text-foreground/60"}`}>
                      {currentEval && (currentEval.eval >= 0 || currentEval.mate !== null)
                        ? formatEval(Math.abs(currentEval.eval), currentEval.mate !== null && currentEval.mate > 0 ? currentEval.mate : null)
                        : !currentEval ? "" : ""}
                    </span>
                    <span className={`text-[10px] font-bold font-mono z-10 ${evalPercent >= 50 ? "text-foreground" : "text-foreground/60"}`}>
                      {currentEval && (currentEval.eval < 0 || (currentEval.mate !== null && currentEval.mate < 0))
                        ? formatEval(Math.abs(currentEval.eval), currentEval.mate !== null && currentEval.mate < 0 ? Math.abs(currentEval.mate) : null)
                        : !currentEval ? "" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chess Board */}
              <div className="flex-1">
                <ChessBoard
                  game={displayGame.current}
                  flipped={false}
                  selectedSquare={null}
                  legalMoves={[]}
                  lastMove={lastMove}
                  isGameOver={false}
                  isPlayerTurn={false}
                  onSquareClick={() => {}}
                />
              </div>
            </div>

            {/* Navigation Controls */}
            {analysisComplete && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={() => goToMove(-1)} disabled={currentIdx <= -1}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => goToMove(currentIdx - 1)} disabled={currentIdx <= -1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-mono text-muted-foreground min-w-[80px] text-center">
                  {currentIdx >= 0
                    ? `${moveEvals[currentIdx].moveNumber}. ${moveEvals[currentIdx].color === "w" ? "" : "..."}${moveEvals[currentIdx].san}`
                    : "Start"}
                </span>
                <Button variant="outline" size="icon" onClick={() => goToMove(currentIdx + 1)} disabled={currentIdx >= moveEvals.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => goToMove(moveEvals.length - 1)} disabled={currentIdx >= moveEvals.length - 1}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Move Classification for current move */}
            <AnimatePresence mode="wait">
              {currentEval && (
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-border/40 bg-card p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const style = CLASSIFICATION_STYLES[currentEval.classification];
                        const Icon = style.icon;
                        return (
                          <>
                            <Icon className={`h-5 w-5 ${style.color}`} />
                            <span className={`font-bold text-sm ${style.color}`}>{style.label}</span>
                          </>
                        );
                      })()}
                      <span className="text-sm text-foreground font-mono">
                        {currentEval.moveNumber}.{currentEval.color === "b" ? ".." : ""} {currentEval.san}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {formatEval(currentEval.eval, currentEval.mate)}
                    </Badge>
                  </div>

                  {currentEval.classification !== "brilliant" && currentEval.classification !== "great" && currentEval.classification !== "good" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Best was <strong className="text-foreground">{currentEval.bestMoveSan}</strong></span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Input + Move List + Stats */}
          <div className="space-y-4">
            {/* PGN Input */}
            {!analysisComplete && (
              <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Paste Game (PGN)
                </h2>
                <Textarea
                  placeholder={"1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...\n\nOr paste full PGN with headers"}
                  value={pgnInput}
                  onChange={(e) => setPgnInput(e.target.value)}
                  rows={8}
                  className="font-mono text-xs resize-none"
                  maxLength={10000}
                />
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
                <Button
                  onClick={runAnalysis}
                  disabled={analyzing || !pgnInput.trim()}
                  className="w-full"
                >
                  {analyzing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Brain className="mr-2 h-4 w-4" /> Analyze Game</>
                  )}
                </Button>
                {analyzing && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-[10px] text-muted-foreground text-center">{progress}% — evaluating moves with Stockfish</p>
                  </div>
                )}
              </div>
            )}

            {/* Stats Summary */}
            {analysisComplete && (
              <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Summary</h2>
                  <Button variant="ghost" size="sm" onClick={clearAnalysis}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> New
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-2">
                    <p className="text-lg font-bold text-red-500">{blunders}</p>
                    <p className="text-[10px] text-red-400">Blunders</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-2">
                    <p className="text-lg font-bold text-orange-400">{mistakes}</p>
                    <p className="text-[10px] text-orange-300">Mistakes</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-2 py-2">
                    <p className="text-lg font-bold text-yellow-400">{inaccuracies}</p>
                    <p className="text-[10px] text-yellow-300">Inaccuracies</p>
                  </div>
                </div>
              </div>
            )}

            {/* Move List with evals */}
            {analysisComplete && (
              <div className="rounded-xl border border-border/40 bg-card p-3 max-h-[420px] overflow-y-auto">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Moves</h3>
                <div className="space-y-0.5">
                  {moveEvals.map((mv, i) => {
                    const style = CLASSIFICATION_STYLES[mv.classification];
                    const isActive = currentIdx === i;
                    return (
                      <button
                        key={i}
                        onClick={() => goToMove(i)}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors text-xs ${
                          isActive
                            ? "bg-primary/15 border border-primary/30"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        {mv.color === "w" && (
                          <span className="text-muted-foreground/50 font-mono w-6 text-right shrink-0">{mv.moveNumber}.</span>
                        )}
                        {mv.color === "b" && i === 0 && (
                          <span className="text-muted-foreground/50 font-mono w-6 text-right shrink-0">{mv.moveNumber}...</span>
                        )}
                        {mv.color === "b" && i > 0 && moveEvals[i - 1]?.color === "w" ? (
                          <span className="w-6 shrink-0" />
                        ) : mv.color === "b" && (i === 0 || moveEvals[i - 1]?.color === "b") ? null : null}
                        <span className={`font-mono font-medium ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                          {mv.san}
                        </span>
                        <span className={`ml-auto text-[10px] font-mono ${style.color}`}>
                          {formatEval(mv.eval, mv.mate)}
                        </span>
                        {(mv.classification === "blunder" || mv.classification === "mistake" || mv.classification === "inaccuracy") && (
                          <span className={`text-[9px] ${style.color}`}>
                            {mv.classification === "blunder" ? "??" : mv.classification === "mistake" ? "?" : "?!"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
