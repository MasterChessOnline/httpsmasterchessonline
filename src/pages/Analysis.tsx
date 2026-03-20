import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine } from "@/lib/stockfish-engine";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Upload, Trash2, Zap, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Download, BarChart3, Settings2, TrendingUp, MousePointerClick, RotateCcw,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MoveEval {
  san: string;
  fen: string;
  fenBefore: string;
  from: string;
  to: string;
  color: "w" | "b";
  moveNumber: number;
  eval: number;
  mate: number | null;
  bestMove: string;
  bestMoveSan: string;
  altLines: { san: string; eval: number; mate: number | null }[];
  classification: Classification;
  evalDrop: number;
}

type Classification = "brilliant" | "great" | "good" | "inaccuracy" | "mistake" | "blunder";

// ── Helpers ────────────────────────────────────────────────────────────────────

function classifyMove(evalDrop: number): Classification {
  const abs = Math.abs(evalDrop);
  if (abs <= 10) return "brilliant";
  if (abs <= 25) return "great";
  if (abs <= 50) return "good";
  if (abs <= 100) return "inaccuracy";
  if (abs <= 200) return "mistake";
  return "blunder";
}

const CLASS_STYLES: Record<Classification, { color: string; bg: string; icon: typeof CheckCircle2; label: string; symbol: string }> = {
  brilliant:   { color: "text-cyan-400",       bg: "bg-cyan-500/10",   icon: Zap,            label: "Brilliant",    symbol: "!!" },
  great:       { color: "text-green-400",      bg: "bg-green-500/10",  icon: CheckCircle2,   label: "Great",        symbol: "!" },
  good:        { color: "text-green-300/70",   bg: "bg-green-500/5",   icon: CheckCircle2,   label: "Good",         symbol: "" },
  inaccuracy:  { color: "text-yellow-400",     bg: "bg-yellow-500/10", icon: AlertTriangle,   label: "Inaccuracy",   symbol: "?!" },
  mistake:     { color: "text-orange-400",     bg: "bg-orange-500/10", icon: XCircle,         label: "Mistake",      symbol: "?" },
  blunder:     { color: "text-red-500",        bg: "bg-red-500/10",    icon: XCircle,         label: "Blunder",      symbol: "??" },
};

function formatEval(cp: number, mate: number | null): string {
  if (mate !== null) return mate > 0 ? `M${mate}` : `M${mate}`;
  const val = cp / 100;
  return val >= 0 ? `+${val.toFixed(1)}` : val.toFixed(1);
}

function evalToBarPct(cp: number, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 95 : 5;
  const x = cp / 100;
  return Math.max(5, Math.min(95, 50 + 50 * (2 / (1 + Math.exp(-0.4 * x)) - 1)));
}

const OPENINGS: [string[], string][] = [
  [["e4", "e5", "Nf3", "Nc6", "Bb5"], "Ruy Lopez"],
  [["e4", "e5", "Nf3", "Nc6", "Bc4"], "Italian Game"],
  [["e4", "c5"], "Sicilian Defense"],
  [["e4", "e6"], "French Defense"],
  [["e4", "c6"], "Caro-Kann Defense"],
  [["e4", "d5"], "Scandinavian Defense"],
  [["e4", "e5", "Nf3", "Nf6"], "Petrov's Defense"],
  [["d4", "d5", "c4"], "Queen's Gambit"],
  [["d4", "Nf6", "c4", "g6"], "King's Indian Defense"],
  [["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"], "Nimzo-Indian Defense"],
  [["d4", "d5", "Bf4"], "London System"],
  [["d4", "Nf6"], "Indian Defense"],
  [["e4", "e5"], "Open Game"],
  [["d4", "d5"], "Closed Game"],
  [["Nf3"], "Réti Opening"],
  [["c4"], "English Opening"],
];

function detectOpening(moves: string[]): string {
  let bestMatch = "Unknown Opening";
  let bestLen = 0;
  for (const [pattern, name] of OPENINGS) {
    if (pattern.length <= moves.length && pattern.length > bestLen) {
      if (pattern.every((m, i) => moves[i] === m)) {
        bestMatch = name;
        bestLen = pattern.length;
      }
    }
  }
  return bestMatch;
}

function uciToSan(fen: string, uci: string): string {
  try {
    const g = new Chess(fen);
    const from = uci.substring(0, 2) as Square;
    const to = uci.substring(2, 4) as Square;
    const promo = uci.length > 4 ? uci[4] as any : undefined;
    const m = g.move({ from, to, promotion: promo });
    return m ? m.san : uci;
  } catch {
    return uci;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Analysis() {
  const [mode, setMode] = useState<"interactive" | "pgn">("interactive");

  // Shared
  const [depth, setDepth] = useState(15);
  const [showSettings, setShowSettings] = useState(false);
  const moveListRef = useRef<HTMLDivElement>(null);
  const stockfishReady = useRef(false);

  // PGN mode state
  const [pgnInput, setPgnInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pgnMoveEvals, setPgnMoveEvals] = useState<MoveEval[]>([]);
  const [pgnCurrentIdx, setPgnCurrentIdx] = useState(-1);
  const [pgnComplete, setPgnComplete] = useState(false);
  const [error, setError] = useState("");
  const pgnDisplayGame = useRef(new Chess());
  const [pgnDisplayFen, setPgnDisplayFen] = useState("start");

  // Interactive mode state
  const [liveGame, setLiveGame] = useState(new Chess());
  const [liveFen, setLiveFen] = useState("start");
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [liveMoveHistory, setLiveMoveHistory] = useState<MoveEval[]>([]);
  const [liveLastMove, setLiveLastMove] = useState<{ from: string; to: string } | null>(null);
  const [liveEvaluating, setLiveEvaluating] = useState(false);
  const [liveCurrentEval, setLiveCurrentEval] = useState<{ cp: number; mate: number | null; bestMove: string; bestMoveSan: string; altLines: { san: string; eval: number; mate: number | null }[] }>({ cp: 0, mate: null, bestMove: "", bestMoveSan: "", altLines: [] });
  const [liveViewIdx, setLiveViewIdx] = useState(-1); // -1 = latest position
  const prevEvalRef = useRef(0);

  // Init Stockfish
  useEffect(() => {
    const engine = getStockfishEngine();
    engine.init().then(() => { stockfishReady.current = true; })
      .catch(() => setError("Failed to load analysis engine"));
  }, []);

  // ══════════════════════════════════════════════════════════════════════════════
  // INTERACTIVE MODE
  // ══════════════════════════════════════════════════════════════════════════════

  const evaluatePosition = useCallback(async (fen: string, fenBefore: string, moveSan: string, moveFrom: string, moveTo: string, color: "w" | "b", moveNum: number) => {
    if (!stockfishReady.current) return;
    setLiveEvaluating(true);
    const engine = getStockfishEngine();

    try {
      const [bestResult, posEval, multiLines] = await Promise.all([
        engine.getBestMove(fen, 600, depth),
        engine.evaluate(fen, depth),
        engine.getMultiPV(fen, 3, Math.min(depth, 12)),
      ]);

      const evalCp = posEval.mate !== null ? (posEval.mate > 0 ? 10000 : -10000) : posEval.evaluation;
      const bestMoveSan = bestResult.bestMove ? uciToSan(fen, bestResult.bestMove) : "";

      const altLines = multiLines.slice(0, 3).map(line => ({
        san: line.pv[0] ? uciToSan(fen, line.pv[0]) : "",
        eval: line.eval,
        mate: line.mate,
      })).filter(l => l.san);

      setLiveCurrentEval({
        cp: evalCp,
        mate: posEval.mate,
        bestMove: bestResult.bestMove || "",
        bestMoveSan,
        altLines,
      });

      // Classify the move
      const wasWhite = color === "w";
      const prevFromSide = wasWhite ? prevEvalRef.current : -prevEvalRef.current;
      const currFromSide = wasWhite ? evalCp : -evalCp;
      const evalDrop = prevFromSide - currFromSide;

      const moveEval: MoveEval = {
        san: moveSan,
        fen,
        fenBefore,
        from: moveFrom,
        to: moveTo,
        color,
        moveNumber: moveNum,
        eval: evalCp,
        mate: posEval.mate,
        bestMove: bestResult.bestMove || "",
        bestMoveSan,
        altLines,
        classification: classifyMove(evalDrop),
        evalDrop,
      };

      prevEvalRef.current = evalCp;
      setLiveMoveHistory(prev => [...prev, moveEval]);
    } catch (e) {
      console.error("Eval error:", e);
    } finally {
      setLiveEvaluating(false);
    }
  }, [depth]);

  const handleInteractiveSquareClick = useCallback((square: Square) => {
    // If viewing history, don't allow moves
    if (liveViewIdx >= 0) return;

    const game = liveGame;
    if (selectedSquare) {
      // Try to make the move
      try {
        const fenBefore = game.fen();
        const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move) {
          const newFen = game.fen();
          setLiveFen(newFen);
          setLiveLastMove({ from: move.from, to: move.to });
          setSelectedSquare(null);
          setLegalMoves([]);
          setLiveGame(new Chess(newFen));
          const moveNum = Math.floor(game.history().length / 2) + (move.color === "w" ? 1 : 0);
          evaluatePosition(newFen, fenBefore, move.san, move.from, move.to, move.color, Math.ceil(liveMoveHistory.length / 2) + 1);
          return;
        }
      } catch {
        // Invalid move, fall through to select new piece
      }
    }

    // Select piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [liveGame, selectedSquare, evaluatePosition, liveMoveHistory.length, liveViewIdx]);

  const resetInteractive = useCallback(() => {
    const fresh = new Chess();
    setLiveGame(fresh);
    setLiveFen("start");
    setSelectedSquare(null);
    setLegalMoves([]);
    setLiveMoveHistory([]);
    setLiveLastMove(null);
    setLiveEvaluating(false);
    setLiveCurrentEval({ cp: 0, mate: null, bestMove: "", bestMoveSan: "", altLines: [] });
    setLiveViewIdx(-1);
    prevEvalRef.current = 0;
  }, []);

  const undoLastMove = useCallback(() => {
    if (liveMoveHistory.length === 0) return;
    const newHistory = liveMoveHistory.slice(0, -1);
    const game = new Chess();
    for (const mv of newHistory) {
      game.move(mv.san);
    }
    setLiveGame(new Chess(game.fen()));
    setLiveFen(game.fen());
    setLiveMoveHistory(newHistory);
    setLiveLastMove(newHistory.length > 0 ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to } : null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLiveViewIdx(-1);
    prevEvalRef.current = newHistory.length > 0 ? newHistory[newHistory.length - 1].eval : 0;
    if (newHistory.length > 0) {
      const last = newHistory[newHistory.length - 1];
      setLiveCurrentEval({ cp: last.eval, mate: last.mate, bestMove: last.bestMove, bestMoveSan: last.bestMoveSan, altLines: last.altLines });
    } else {
      setLiveCurrentEval({ cp: 0, mate: null, bestMove: "", bestMoveSan: "", altLines: [] });
    }
  }, [liveMoveHistory]);

  // Navigate interactive history
  const goToLiveMove = useCallback((idx: number) => {
    if (idx < 0) {
      setLiveViewIdx(-1);
      const game = new Chess();
      for (const mv of liveMoveHistory) game.move(mv.san);
      setLiveGame(new Chess(game.fen()));
      setLiveFen(game.fen());
      setLiveLastMove(liveMoveHistory.length > 0 ? { from: liveMoveHistory[liveMoveHistory.length - 1].from, to: liveMoveHistory[liveMoveHistory.length - 1].to } : null);
    } else {
      const clamped = Math.min(idx, liveMoveHistory.length - 1);
      setLiveViewIdx(clamped);
      const mv = liveMoveHistory[clamped];
      setLiveFen(mv.fen);
      setLiveGame(new Chess(mv.fen));
      setLiveLastMove({ from: mv.from, to: mv.to });
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [liveMoveHistory]);

  // ══════════════════════════════════════════════════════════════════════════════
  // PGN MODE
  // ══════════════════════════════════════════════════════════════════════════════

  const goToPgnMove = useCallback((idx: number) => {
    const clamped = Math.max(-1, Math.min(idx, pgnMoveEvals.length - 1));
    setPgnCurrentIdx(clamped);
    pgnDisplayGame.current = clamped === -1 ? new Chess() : new Chess(pgnMoveEvals[clamped].fen);
    setPgnDisplayFen(pgnDisplayGame.current.fen());
  }, [pgnMoveEvals]);

  useEffect(() => {
    if (!pgnComplete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowLeft": goToPgnMove(pgnCurrentIdx - 1); break;
        case "ArrowRight": goToPgnMove(pgnCurrentIdx + 1); break;
        case "Home": goToPgnMove(-1); break;
        case "End": goToPgnMove(pgnMoveEvals.length - 1); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pgnComplete, pgnCurrentIdx, goToPgnMove, pgnMoveEvals.length]);

  useEffect(() => {
    if (!moveListRef.current || pgnCurrentIdx < 0) return;
    const el = moveListRef.current.children[pgnCurrentIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [pgnCurrentIdx]);

  const runAnalysis = async () => {
    setError("");
    setPgnMoveEvals([]);
    setPgnComplete(false);
    setPgnCurrentIdx(-1);
    pgnDisplayGame.current = new Chess();
    setPgnDisplayFen("start");

    const parseGame = new Chess();
    const trimmed = pgnInput.trim();
    if (!trimmed) { setError("Please enter a PGN or move list."); return; }

    try { parseGame.loadPgn(trimmed); } catch {
      parseGame.reset();
      const moves = trimmed.replace(/\d+\.\s*/g, "").split(/\s+/).filter(Boolean);
      for (const m of moves) {
        try { parseGame.move(m); } catch { setError(`Invalid move: "${m}".`); return; }
      }
    }

    const history = parseGame.history({ verbose: true });
    if (history.length === 0) { setError("No moves found."); return; }

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
    let prevEval = 0;

    for (let i = 0; i < history.length; i++) {
      setProgress(Math.round(((i + 1) / history.length) * 100));
      const move = history[i];
      const fenBefore = evalGame.fen();
      const bestResult = await engine.getBestMove(fenBefore, 600, depth);
      const multiLines = await engine.getMultiPV(fenBefore, 3, Math.min(depth, 12));
      evalGame.move(move.san);
      const fenAfter = evalGame.fen();
      const posEval = await engine.evaluate(fenAfter, depth);

      const evalCp = posEval.mate !== null ? (posEval.mate > 0 ? 10000 : -10000) : posEval.evaluation;
      const wasWhite = move.color === "w";
      const prevFromSide = wasWhite ? prevEval : -prevEval;
      const currFromSide = wasWhite ? evalCp : -evalCp;
      const evalDrop = prevFromSide - currFromSide;
      const bestMoveSan = bestResult.bestMove ? uciToSan(fenBefore, bestResult.bestMove) : "";
      const altLines = multiLines.slice(0, 3).map(line => ({
        san: line.pv[0] ? uciToSan(fenBefore, line.pv[0]) : "",
        eval: line.eval, mate: line.mate,
      })).filter(l => l.san && l.san !== move.san);

      evals.push({
        san: move.san, fen: fenAfter, fenBefore, from: move.from, to: move.to,
        color: move.color, moveNumber: Math.floor(i / 2) + 1,
        eval: evalCp, mate: posEval.mate, bestMove: bestResult.bestMove || "",
        bestMoveSan, altLines, classification: classifyMove(evalDrop), evalDrop,
      });
      prevEval = evalCp;
    }

    setPgnMoveEvals(evals);
    setPgnComplete(true);
    setAnalyzing(false);
    setProgress(100);
    goToPgnMove(0);
  };

  const clearPgnAnalysis = () => {
    setPgnInput(""); setPgnMoveEvals([]); setPgnComplete(false);
    setPgnCurrentIdx(-1); setError(""); setProgress(0);
    pgnDisplayGame.current = new Chess(); setPgnDisplayFen("start");
  };

  const downloadPGN = () => {
    if (pgnMoveEvals.length === 0) return;
    const opening = detectOpening(pgnMoveEvals.map(m => m.san));
    let pgn = `[Event "Game Analysis"]\n[Opening "${opening}"]\n\n`;
    pgnMoveEvals.forEach((mv) => {
      if (mv.color === "w") pgn += `${mv.moveNumber}. `;
      pgn += mv.san;
      const s = CLASS_STYLES[mv.classification];
      if (s.symbol) pgn += s.symbol;
      if (["blunder", "mistake", "inaccuracy"].includes(mv.classification)) {
        pgn += ` {${s.label}: best was ${mv.bestMoveSan} (${formatEval(mv.eval, mv.mate)})}`;
      }
      pgn += " ";
    });
    const blob = new Blob([pgn.trim()], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analysis.pgn"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived values ──

  const activeEvals = mode === "pgn" ? pgnMoveEvals : liveMoveHistory;
  const activeIdx = mode === "pgn" ? pgnCurrentIdx : (liveViewIdx >= 0 ? liveViewIdx : liveMoveHistory.length - 1);
  const currentEval = activeIdx >= 0 && activeIdx < activeEvals.length ? activeEvals[activeIdx] : null;

  const evalCpForBar = mode === "interactive" ? liveCurrentEval.cp : (currentEval?.eval ?? 0);
  const evalMateForBar = mode === "interactive" ? liveCurrentEval.mate : (currentEval?.mate ?? null);
  const evalPercent = evalToBarPct(evalCpForBar, evalMateForBar);

  const blunders = activeEvals.filter(e => e.classification === "blunder").length;
  const mistakes = activeEvals.filter(e => e.classification === "mistake").length;
  const inaccuracies = activeEvals.filter(e => e.classification === "inaccuracy").length;
  const brilliant = activeEvals.filter(e => e.classification === "brilliant").length;
  const opening = useMemo(() => detectOpening(activeEvals.map(m => m.san)), [activeEvals]);

  const lastMoveDisplay = mode === "pgn"
    ? (pgnCurrentIdx >= 0 ? { from: pgnMoveEvals[pgnCurrentIdx].from, to: pgnMoveEvals[pgnCurrentIdx].to } : null)
    : liveLastMove;

  const boardGame = mode === "pgn" ? pgnDisplayGame.current : liveGame;

  const whiteEvals = activeEvals.filter(e => e.color === "w");
  const blackEvals = activeEvals.filter(e => e.color === "b");
  const calcAccuracy = (evs: MoveEval[]) => {
    if (evs.length === 0) return 0;
    const good = evs.filter(e => ["brilliant", "great", "good"].includes(e.classification)).length;
    return Math.round((good / evs.length) * 100);
  };

  const graphData = useMemo(() => activeEvals.map((ev) => ({
    eval: Math.max(-500, Math.min(500, ev.mate !== null ? (ev.mate > 0 ? 500 : -500) : ev.eval)),
    classification: ev.classification,
  })), [activeEvals]);

  // ── Render ──

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Game Analysis</h1>
              <p className="text-sm text-muted-foreground">Powered by Stockfish — real-time evaluation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="interactive" className="text-xs gap-1.5">
                  <MousePointerClick className="h-3.5 w-3.5" /> Interactive
                </TabsTrigger>
                <TabsTrigger value="pgn" className="text-xs gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Import PGN
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* ── Left Column: Board + Graph ── */}
          <div className="space-y-4">
            {/* Board + Eval Bar */}
            <div className="flex gap-3 items-stretch">
              {/* Vertical Eval Bar - Chess.com style */}
              <div className="w-8 shrink-0 rounded-lg overflow-hidden border border-border relative flex flex-col" style={{ minHeight: 400 }}>
                {/* Black (dark) portion - top */}
                <motion.div
                  className="bg-foreground"
                  initial={{ flexBasis: "50%" }}
                  animate={{ flexBasis: `${100 - evalPercent}%` }}
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  style={{ flexShrink: 0 }}
                />
                {/* White (light) portion - bottom */}
                <motion.div
                  className="bg-white"
                  initial={{ flexBasis: "50%" }}
                  animate={{ flexBasis: `${evalPercent}%` }}
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  style={{ flexShrink: 0 }}
                />
                {/* Eval label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold font-mono bg-card/90 text-foreground px-1 py-0.5 rounded shadow-sm">
                    {formatEval(evalCpForBar, evalMateForBar)}
                  </span>
                </div>
                {liveEvaluating && mode === "interactive" && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-card/30">
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <ChessBoard
                  game={boardGame}
                  flipped={false}
                  selectedSquare={mode === "interactive" ? selectedSquare : null}
                  legalMoves={mode === "interactive" ? legalMoves : []}
                  lastMove={lastMoveDisplay}
                  isGameOver={false}
                  isPlayerTurn={mode === "interactive" && liveViewIdx < 0}
                  onSquareClick={mode === "interactive" ? handleInteractiveSquareClick : () => {}}
                />
              </div>
            </div>

            {/* Interactive mode controls */}
            {mode === "interactive" && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={undoLastMove} disabled={liveMoveHistory.length === 0}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Undo
                </Button>
                <Button variant="outline" size="sm" onClick={resetInteractive}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Reset Board
                </Button>
                {liveMoveHistory.length > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadPGNFromLive}>
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Export PGN
                  </Button>
                )}
              </div>
            )}

            {/* PGN mode controls */}
            {mode === "pgn" && pgnComplete && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={() => goToPgnMove(-1)} disabled={pgnCurrentIdx <= -1}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => goToPgnMove(pgnCurrentIdx - 1)} disabled={pgnCurrentIdx <= -1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-mono text-muted-foreground min-w-[100px] text-center">
                  {pgnCurrentIdx >= 0
                    ? `${pgnMoveEvals[pgnCurrentIdx].moveNumber}.${pgnMoveEvals[pgnCurrentIdx].color === "b" ? ".." : ""} ${pgnMoveEvals[pgnCurrentIdx].san}`
                    : "Start"}
                </span>
                <Button variant="outline" size="icon" onClick={() => goToPgnMove(pgnCurrentIdx + 1)} disabled={pgnCurrentIdx >= pgnMoveEvals.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => goToPgnMove(pgnMoveEvals.length - 1)} disabled={pgnCurrentIdx >= pgnMoveEvals.length - 1}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Eval Graph */}
            {activeEvals.length > 1 && (
              <div className="rounded-xl border border-border/40 bg-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Advantage Over Time</span>
                </div>
                <div className="relative h-24 w-full">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-border/60" />
                  <svg viewBox={`0 0 ${graphData.length} 100`} className="w-full h-full" preserveAspectRatio="none">
                    {graphData.map((d, i) => {
                      const normalized = (d.eval + 500) / 1000;
                      const y = Math.max(0, Math.min(100, (1 - normalized) * 100));
                      const height = Math.abs(50 - y);
                      const isAbove = y < 50;
                      const isActive = activeIdx === i;
                      const isBad = d.classification === "blunder" || d.classification === "mistake";
                      let fill = "hsl(var(--muted-foreground) / 0.3)";
                      if (isBad) fill = d.classification === "blunder" ? "hsl(0, 70%, 50%)" : "hsl(30, 80%, 50%)";
                      if (isActive) fill = "hsl(var(--primary))";
                      return (
                        <rect key={i} x={i} y={isAbove ? y : 50} width={0.8} height={Math.max(1, height)}
                          fill={fill} className="cursor-pointer"
                          onClick={() => mode === "pgn" ? goToPgnMove(i) : goToLiveMove(i)} rx={0.2}
                        />
                      );
                    })}
                  </svg>
                  {activeIdx >= 0 && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-primary/60"
                      style={{ left: `${(activeIdx / graphData.length) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Move classification detail */}
            <AnimatePresence mode="wait">
              {currentEval && (
                <motion.div key={activeIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-border/40 bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const s = CLASS_STYLES[currentEval.classification];
                        const Icon = s.icon;
                        return <><Icon className={`h-5 w-5 ${s.color}`} /><span className={`font-bold text-sm ${s.color}`}>{s.label}</span></>;
                      })()}
                      <span className="text-sm text-foreground font-mono">
                        {currentEval.moveNumber}.{currentEval.color === "b" ? ".." : ""} {currentEval.san}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {formatEval(currentEval.eval, currentEval.mate)}
                    </Badge>
                  </div>

                  {["blunder", "mistake", "inaccuracy"].includes(currentEval.classification) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Best was <strong className="text-foreground">{currentEval.bestMoveSan}</strong></span>
                    </div>
                  )}

                  {currentEval.altLines.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Top Lines</p>
                      {currentEval.altLines.map((line, li) => (
                        <div key={li} className="flex items-center justify-between text-xs bg-muted/10 rounded px-2 py-1">
                          <span className="font-mono text-foreground/80">{line.san}</span>
                          <span className="font-mono text-muted-foreground">{formatEval(line.eval, line.mate)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live eval for interactive (when no moves yet or current position) */}
            {mode === "interactive" && liveMoveHistory.length === 0 && !liveEvaluating && (
              <div className="rounded-xl border border-border/40 bg-card p-4 text-center text-muted-foreground text-sm">
                <MousePointerClick className="h-6 w-6 mx-auto mb-2 text-primary/60" />
                <p>Click pieces to make moves — Stockfish will evaluate each position automatically</p>
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-4">
            {/* Interactive: live eval + best move */}
            {mode === "interactive" && liveMoveHistory.length > 0 && (
              <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Live Evaluation
                </h2>
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono text-foreground">
                    {formatEval(liveCurrentEval.cp, liveCurrentEval.mate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {liveCurrentEval.cp > 50 ? "White is better" : liveCurrentEval.cp < -50 ? "Black is better" : "Equal position"}
                  </p>
                </div>
                {liveCurrentEval.bestMoveSan && (
                  <div className="flex items-center justify-between text-sm bg-muted/20 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">Best move:</span>
                    <span className="font-mono font-bold text-foreground">{liveCurrentEval.bestMoveSan}</span>
                  </div>
                )}
                {liveCurrentEval.altLines.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Top Lines</p>
                    {liveCurrentEval.altLines.map((line, li) => (
                      <div key={li} className="flex items-center justify-between text-xs bg-muted/10 rounded px-2 py-1">
                        <span className="font-mono text-foreground/80">{line.san}</span>
                        <span className="font-mono text-muted-foreground">{formatEval(line.eval, line.mate)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PGN Input */}
            {mode === "pgn" && !pgnComplete && (
              <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Paste Game (PGN)
                </h2>
                <Textarea
                  placeholder={"1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...\n\nOr paste full PGN with headers"}
                  value={pgnInput} onChange={(e) => setPgnInput(e.target.value)}
                  rows={8} className="font-mono text-xs resize-none" maxLength={10000}
                />
                <button onClick={() => setShowSettings(p => !p)}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                  <Settings2 className="h-3 w-3" /> Analysis Settings
                </button>
                {showSettings && (
                  <div className="rounded-lg bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Depth: {depth}</span>
                      <span className="text-[10px] text-muted-foreground/60">{depth <= 10 ? "Fast" : depth <= 18 ? "Standard" : "Deep"}</span>
                    </div>
                    <Slider value={[depth]} onValueChange={([v]) => setDepth(v)} min={8} max={22} step={1} className="w-full" />
                  </div>
                )}
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button onClick={runAnalysis} disabled={analyzing || !pgnInput.trim()} className="w-full">
                  {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Brain className="mr-2 h-4 w-4" /> Analyze Game</>}
                </Button>
                {analyzing && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-[10px] text-muted-foreground text-center">{progress}% — depth {depth}</p>
                  </div>
                )}
              </div>
            )}

            {/* PGN: actions */}
            {mode === "pgn" && pgnComplete && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={downloadPGN}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download PGN
                </Button>
                <Button variant="ghost" size="sm" onClick={clearPgnAnalysis}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> New
                </Button>
              </div>
            )}

            {/* Summary (both modes) */}
            {activeEvals.length > 0 && (
              <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Summary
                </h2>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Opening</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">{opening}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Moves</span>
                  <span className="font-mono font-bold text-foreground">{activeEvals.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/20 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{calcAccuracy(whiteEvals)}%</p>
                    <p className="text-[10px] text-muted-foreground">White Accuracy</p>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{calcAccuracy(blackEvals)}%</p>
                    <p className="text-[10px] text-muted-foreground">Black Accuracy</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-1 py-1.5">
                    <p className="text-sm font-bold text-cyan-400">{brilliant}</p>
                    <p className="text-[9px] text-cyan-300">Brilliant</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1 py-1.5">
                    <p className="text-sm font-bold text-yellow-400">{inaccuracies}</p>
                    <p className="text-[9px] text-yellow-300">Inaccuracy</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-1 py-1.5">
                    <p className="text-sm font-bold text-orange-400">{mistakes}</p>
                    <p className="text-[9px] text-orange-300">Mistake</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-1 py-1.5">
                    <p className="text-sm font-bold text-red-500">{blunders}</p>
                    <p className="text-[9px] text-red-400">Blunder</p>
                  </div>
                </div>
              </div>
            )}

            {/* Move List */}
            {activeEvals.length > 0 && (
              <div className="rounded-xl border border-border/40 bg-card p-3 max-h-[380px] overflow-y-auto" ref={moveListRef}>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Moves</h3>
                <div className="space-y-0.5">
                  {activeEvals.map((mv, i) => {
                    const s = CLASS_STYLES[mv.classification];
                    const isActive = activeIdx === i;
                    return (
                      <button key={i}
                        onClick={() => mode === "pgn" ? goToPgnMove(i) : goToLiveMove(i)}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors text-xs ${
                          isActive ? "bg-primary/15 border border-primary/30" : "hover:bg-muted/30"
                        }`}
                      >
                        {mv.color === "w" && <span className="text-muted-foreground/50 font-mono w-6 text-right shrink-0">{mv.moveNumber}.</span>}
                        {mv.color === "b" && <span className="text-muted-foreground/50 font-mono w-6 text-right shrink-0">{i === 0 || activeEvals[i - 1]?.color === "b" ? `${mv.moveNumber}...` : ""}</span>}
                        <span className={`font-mono font-medium ${isActive ? "text-foreground" : "text-foreground/80"}`}>{mv.san}</span>
                        {s.symbol && <span className={`text-[9px] font-bold ${s.color}`}>{s.symbol}</span>}
                        <span className={`ml-auto text-[10px] font-mono ${s.color}`}>{formatEval(mv.eval, mv.mate)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Depth settings for interactive */}
            {mode === "interactive" && (
              <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
                <button onClick={() => setShowSettings(p => !p)}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full">
                  <Settings2 className="h-3 w-3" /> Analysis Depth: {depth}
                </button>
                {showSettings && (
                  <div className="pt-1">
                    <Slider value={[depth]} onValueChange={([v]) => setDepth(v)} min={8} max={22} step={1} className="w-full" />
                    <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1">
                      <span>Fast (8)</span><span>Deep (22)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  // Helper for interactive PGN export
  function downloadPGNFromLive() {
    if (liveMoveHistory.length === 0) return;
    const op = detectOpening(liveMoveHistory.map(m => m.san));
    let pgn = `[Event "Interactive Analysis"]\n[Opening "${op}"]\n\n`;
    liveMoveHistory.forEach((mv) => {
      if (mv.color === "w") pgn += `${mv.moveNumber}. `;
      pgn += mv.san;
      const s = CLASS_STYLES[mv.classification];
      if (s.symbol) pgn += s.symbol;
      if (["blunder", "mistake", "inaccuracy"].includes(mv.classification)) {
        pgn += ` {${s.label}: best was ${mv.bestMoveSan}}`;
      }
      pgn += " ";
    });
    const blob = new Blob([pgn.trim()], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analysis.pgn"; a.click();
    URL.revokeObjectURL(url);
  }
}
