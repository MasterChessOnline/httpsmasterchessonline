import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine } from "@/lib/stockfish-engine";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Brain, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Upload, Trash2, Zap, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Download, BarChart3, Settings2, TrendingUp, MousePointerClick, RotateCcw,
  Play, ChevronDown, History, FileText, Plus, Search, Save, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──
interface MoveEval {
  san: string; fen: string; fenBefore: string; from: string; to: string;
  color: "w" | "b"; moveNumber: number; eval: number; mate: number | null;
  bestMove: string; bestMoveSan: string;
  altLines: { san: string; eval: number; mate: number | null }[];
  classification: Classification; evalDrop: number;
}
type Classification = "brilliant" | "great" | "good" | "inaccuracy" | "mistake" | "blunder";

// ── Helpers ──
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
  brilliant:   { color: "text-cyan-400",     bg: "bg-cyan-500/10",   icon: Zap,          label: "Brilliant",  symbol: "!!" },
  great:       { color: "text-green-400",    bg: "bg-green-500/10",  icon: CheckCircle2, label: "Great",      symbol: "!" },
  good:        { color: "text-green-300/70", bg: "bg-green-500/5",   icon: CheckCircle2, label: "Good",       symbol: "" },
  inaccuracy:  { color: "text-yellow-400",   bg: "bg-yellow-500/10", icon: AlertTriangle, label: "Inaccuracy", symbol: "?!" },
  mistake:     { color: "text-orange-400",   bg: "bg-orange-500/10", icon: XCircle,       label: "Mistake",    symbol: "?" },
  blunder:     { color: "text-red-500",      bg: "bg-red-500/10",    icon: XCircle,       label: "Blunder",    symbol: "??" },
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
      if (pattern.every((m, i) => moves[i] === m)) { bestMatch = name; bestLen = pattern.length; }
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
  } catch { return uci; }
}

type SidebarPanel = "menu" | "pgn" | "moves" | "summary";

// ── Component ──
export default function Analysis() {
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>("menu");
  const [depth, setDepth] = useState(15);
  const moveListRef = useRef<HTMLDivElement>(null);
  const stockfishReady = useRef(false);

  // PGN mode
  const [pgnInput, setPgnInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pgnMoveEvals, setPgnMoveEvals] = useState<MoveEval[]>([]);
  const [pgnCurrentIdx, setPgnCurrentIdx] = useState(-1);
  const [pgnComplete, setPgnComplete] = useState(false);
  const [error, setError] = useState("");
  const pgnDisplayGame = useRef(new Chess());
  const [pgnDisplayFen, setPgnDisplayFen] = useState("start");

  // Interactive mode
  const [liveGame, setLiveGame] = useState(new Chess());
  const [liveFen, setLiveFen] = useState("start");
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [liveMoveHistory, setLiveMoveHistory] = useState<MoveEval[]>([]);
  const [liveLastMove, setLiveLastMove] = useState<{ from: string; to: string } | null>(null);
  const [liveEvaluating, setLiveEvaluating] = useState(false);
  const [liveCurrentEval, setLiveCurrentEval] = useState<{ cp: number; mate: number | null; bestMove: string; bestMoveSan: string; altLines: { san: string; eval: number; mate: number | null }[] }>({ cp: 0, mate: null, bestMove: "", bestMoveSan: "", altLines: [] });
  const [liveViewIdx, setLiveViewIdx] = useState(-1);
  const prevEvalRef = useRef(0);

  useEffect(() => {
    const engine = getStockfishEngine();
    engine.init().then(() => { stockfishReady.current = true; }).catch(() => setError("Failed to load analysis engine"));
  }, []);

  // ── Interactive logic ──
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
        san: line.pv[0] ? uciToSan(fen, line.pv[0]) : "", eval: line.eval, mate: line.mate,
      })).filter(l => l.san);
      setLiveCurrentEval({ cp: evalCp, mate: posEval.mate, bestMove: bestResult.bestMove || "", bestMoveSan, altLines });
      const wasWhite = color === "w";
      const prevFromSide = wasWhite ? prevEvalRef.current : -prevEvalRef.current;
      const currFromSide = wasWhite ? evalCp : -evalCp;
      const evalDrop = prevFromSide - currFromSide;
      const moveEval: MoveEval = {
        san: moveSan, fen, fenBefore, from: moveFrom, to: moveTo, color, moveNumber: moveNum,
        eval: evalCp, mate: posEval.mate, bestMove: bestResult.bestMove || "", bestMoveSan,
        altLines, classification: classifyMove(evalDrop), evalDrop,
      };
      prevEvalRef.current = evalCp;
      setLiveMoveHistory(prev => [...prev, moveEval]);
    } catch (e) { console.error("Eval error:", e); } finally { setLiveEvaluating(false); }
  }, [depth]);

  const handleInteractiveSquareClick = useCallback((square: Square) => {
    if (liveViewIdx >= 0) return;
    const game = liveGame;
    if (selectedSquare) {
      try {
        const fenBefore = game.fen();
        const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move) {
          const newFen = game.fen();
          setLiveFen(newFen); setLiveLastMove({ from: move.from, to: move.to });
          setSelectedSquare(null); setLegalMoves([]); setLiveGame(new Chess(newFen));
          evaluatePosition(newFen, fenBefore, move.san, move.from, move.to, move.color, Math.ceil(liveMoveHistory.length / 2) + 1);
          if (sidebarPanel === "menu") setSidebarPanel("moves");
          return;
        }
      } catch {}
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else { setSelectedSquare(null); setLegalMoves([]); }
  }, [liveGame, selectedSquare, evaluatePosition, liveMoveHistory.length, liveViewIdx, sidebarPanel]);

  const resetInteractive = useCallback(() => {
    const fresh = new Chess();
    setLiveGame(fresh); setLiveFen("start"); setSelectedSquare(null); setLegalMoves([]);
    setLiveMoveHistory([]); setLiveLastMove(null); setLiveEvaluating(false);
    setLiveCurrentEval({ cp: 0, mate: null, bestMove: "", bestMoveSan: "", altLines: [] });
    setLiveViewIdx(-1); prevEvalRef.current = 0;
    setPgnMoveEvals([]); setPgnComplete(false); setPgnCurrentIdx(-1);
    setSidebarPanel("menu");
  }, []);

  const undoLastMove = useCallback(() => {
    if (liveMoveHistory.length === 0) return;
    const newHistory = liveMoveHistory.slice(0, -1);
    const game = new Chess();
    for (const mv of newHistory) game.move(mv.san);
    setLiveGame(new Chess(game.fen())); setLiveFen(game.fen()); setLiveMoveHistory(newHistory);
    setLiveLastMove(newHistory.length > 0 ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to } : null);
    setSelectedSquare(null); setLegalMoves([]); setLiveViewIdx(-1);
    prevEvalRef.current = newHistory.length > 0 ? newHistory[newHistory.length - 1].eval : 0;
    if (newHistory.length > 0) {
      const last = newHistory[newHistory.length - 1];
      setLiveCurrentEval({ cp: last.eval, mate: last.mate, bestMove: last.bestMove, bestMoveSan: last.bestMoveSan, altLines: last.altLines });
    } else { setLiveCurrentEval({ cp: 0, mate: null, bestMove: "", bestMoveSan: "", altLines: [] }); }
  }, [liveMoveHistory]);

  const goToLiveMove = useCallback((idx: number) => {
    if (idx < 0) {
      setLiveViewIdx(-1);
      const game = new Chess();
      for (const mv of liveMoveHistory) game.move(mv.san);
      setLiveGame(new Chess(game.fen())); setLiveFen(game.fen());
      setLiveLastMove(liveMoveHistory.length > 0 ? { from: liveMoveHistory[liveMoveHistory.length - 1].from, to: liveMoveHistory[liveMoveHistory.length - 1].to } : null);
    } else {
      const clamped = Math.min(idx, liveMoveHistory.length - 1);
      setLiveViewIdx(clamped);
      const mv = liveMoveHistory[clamped];
      setLiveFen(mv.fen); setLiveGame(new Chess(mv.fen)); setLiveLastMove({ from: mv.from, to: mv.to });
    }
    setSelectedSquare(null); setLegalMoves([]);
  }, [liveMoveHistory]);

  // ── PGN logic ──
  const goToPgnMove = useCallback((idx: number) => {
    const clamped = Math.max(-1, Math.min(idx, pgnMoveEvals.length - 1));
    setPgnCurrentIdx(clamped);
    pgnDisplayGame.current = clamped === -1 ? new Chess() : new Chess(pgnMoveEvals[clamped].fen);
    setPgnDisplayFen(pgnDisplayGame.current.fen());
  }, [pgnMoveEvals]);

  useEffect(() => {
    if (!pgnComplete && liveMoveHistory.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const evals = pgnComplete ? pgnMoveEvals : liveMoveHistory;
      const idx = pgnComplete ? pgnCurrentIdx : (liveViewIdx >= 0 ? liveViewIdx : liveMoveHistory.length - 1);
      const goFn = pgnComplete ? goToPgnMove : goToLiveMove;
      switch (e.key) {
        case "ArrowLeft": goFn(idx - 1); break;
        case "ArrowRight": goFn(idx + 1); break;
        case "Home": goFn(-1); break;
        case "End": goFn(evals.length - 1); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pgnComplete, pgnCurrentIdx, goToPgnMove, pgnMoveEvals.length, liveMoveHistory, liveViewIdx, goToLiveMove]);

  const runAnalysis = async () => {
    setError(""); setPgnMoveEvals([]); setPgnComplete(false); setPgnCurrentIdx(-1);
    pgnDisplayGame.current = new Chess(); setPgnDisplayFen("start");
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
      const engine = getStockfishEngine(); await engine.init(); stockfishReady.current = true;
    }
    setAnalyzing(true); setSidebarPanel("moves");
    const engine = getStockfishEngine(); engine.newGame();
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
        san: line.pv[0] ? uciToSan(fenBefore, line.pv[0]) : "", eval: line.eval, mate: line.mate,
      })).filter(l => l.san && l.san !== move.san);
      evals.push({
        san: move.san, fen: fenAfter, fenBefore, from: move.from, to: move.to,
        color: move.color, moveNumber: Math.floor(i / 2) + 1,
        eval: evalCp, mate: posEval.mate, bestMove: bestResult.bestMove || "",
        bestMoveSan, altLines, classification: classifyMove(evalDrop), evalDrop,
      });
      prevEval = evalCp;
    }
    setPgnMoveEvals(evals); setPgnComplete(true); setAnalyzing(false); setProgress(100); goToPgnMove(0);
  };

  const clearPgnAnalysis = () => {
    setPgnInput(""); setPgnMoveEvals([]); setPgnComplete(false);
    setPgnCurrentIdx(-1); setError(""); setProgress(0);
    pgnDisplayGame.current = new Chess(); setPgnDisplayFen("start");
    setSidebarPanel("menu");
  };

  const downloadPGN = () => {
    const evals = pgnComplete ? pgnMoveEvals : liveMoveHistory;
    if (evals.length === 0) return;
    const op = detectOpening(evals.map(m => m.san));
    let pgn = `[Event "Game Analysis"]\n[Opening "${op}"]\n\n`;
    evals.forEach((mv) => {
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
    const a = document.createElement("a"); a.href = url; a.download = "analysis.pgn"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived ──
  const activeEvals = pgnComplete ? pgnMoveEvals : liveMoveHistory;
  const activeIdx = pgnComplete ? pgnCurrentIdx : (liveViewIdx >= 0 ? liveViewIdx : liveMoveHistory.length - 1);
  const currentEval = activeIdx >= 0 && activeIdx < activeEvals.length ? activeEvals[activeIdx] : null;
  const evalCpForBar = !pgnComplete ? liveCurrentEval.cp : (currentEval?.eval ?? 0);
  const evalMateForBar = !pgnComplete ? liveCurrentEval.mate : (currentEval?.mate ?? null);
  const evalPercent = evalToBarPct(evalCpForBar, evalMateForBar);
  const blunders = activeEvals.filter(e => e.classification === "blunder").length;
  const mistakes = activeEvals.filter(e => e.classification === "mistake").length;
  const inaccuracies = activeEvals.filter(e => e.classification === "inaccuracy").length;
  const brilliant = activeEvals.filter(e => e.classification === "brilliant").length;
  const opening = useMemo(() => detectOpening(activeEvals.map(m => m.san)), [activeEvals]);
  const lastMoveDisplay = pgnComplete
    ? (pgnCurrentIdx >= 0 ? { from: pgnMoveEvals[pgnCurrentIdx].from, to: pgnMoveEvals[pgnCurrentIdx].to } : null)
    : liveLastMove;
  const boardGame = pgnComplete ? pgnDisplayGame.current : liveGame;
  const whiteEvals = activeEvals.filter(e => e.color === "w");
  const blackEvals = activeEvals.filter(e => e.color === "b");
  const calcAccuracy = (evs: MoveEval[]) => {
    if (evs.length === 0) return 0;
    return Math.round((evs.filter(e => ["brilliant", "great", "good"].includes(e.classification)).length / evs.length) * 100);
  };
  const graphData = useMemo(() => activeEvals.map((ev) => ({
    eval: Math.max(-500, Math.min(500, ev.mate !== null ? (ev.mate > 0 ? 500 : -500) : ev.eval)),
    classification: ev.classification,
  })), [activeEvals]);
  const goFn = pgnComplete ? goToPgnMove : goToLiveMove;

  // ── Render ──
  return (
    <div className="min-h-screen bg-[hsl(220,20%,12%)]">
      <Navbar />
      <main className="flex justify-center items-start gap-0 pt-4 pb-8 px-2 lg:px-4 min-h-[calc(100vh-64px)]">
        {/* ── LEFT: Eval Bar + Board ── */}
        <div className="flex flex-col items-center">
          {/* Black label */}
          <div className="flex items-center gap-2 mb-1 self-start ml-10">
            <div className="w-5 h-5 rounded-sm bg-[hsl(220,15%,20%)] border border-border/30" />
            <span className="text-sm font-semibold text-foreground/80">Black</span>
          </div>

          <div className="flex items-stretch">
            {/* Eval Bar */}
            <div className="w-7 shrink-0 rounded-sm overflow-hidden mr-1.5 relative flex flex-col" style={{ minHeight: 420 }}>
              <motion.div
                className="bg-[hsl(220,15%,18%)]"
                initial={{ flexBasis: "50%" }}
                animate={{ flexBasis: `${100 - evalPercent}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                style={{ flexShrink: 0 }}
              />
              <motion.div
                className="bg-[hsl(60,10%,90%)]"
                initial={{ flexBasis: "50%" }}
                animate={{ flexBasis: `${evalPercent}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                style={{ flexShrink: 0 }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-[9px] font-bold font-mono px-0.5 ${evalCpForBar >= 0 ? 'text-[hsl(220,15%,18%)]' : 'text-[hsl(60,10%,90%)]'}`}>
                  {formatEval(evalCpForBar, evalMateForBar)}
                </span>
              </div>
              {liveEvaluating && !pgnComplete && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <Loader2 className="h-3 w-3 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Board */}
            <div className="w-[min(60vw,520px)]">
              <ChessBoard
                game={boardGame}
                flipped={false}
                selectedSquare={!pgnComplete ? selectedSquare : null}
                legalMoves={!pgnComplete ? legalMoves : []}
                lastMove={lastMoveDisplay}
                isGameOver={false}
                isPlayerTurn={!pgnComplete && liveViewIdx < 0}
                onSquareClick={!pgnComplete ? handleInteractiveSquareClick : () => {}}
              />
            </div>
          </div>

          {/* White label */}
          <div className="flex items-center gap-2 mt-1 self-start ml-10">
            <div className="w-5 h-5 rounded-sm bg-[hsl(60,10%,90%)] border border-border/30" />
            <span className="text-sm font-semibold text-foreground/80">White</span>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="w-[340px] lg:w-[380px] shrink-0 ml-4 flex flex-col bg-[hsl(220,18%,16%)] rounded-lg border border-border/20 overflow-hidden" style={{ minHeight: 520 }}>
          {/* Header */}
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-border/20">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-foreground">Analysis</span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {sidebarPanel === "menu" && (
                <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-1">
                  <SidebarMenuItem icon={<MousePointerClick className="h-4 w-4" />} label="Make Moves" desc="Click pieces on the board" onClick={() => setSidebarPanel("moves")} />
                  <SidebarMenuItem icon={<Plus className="h-4 w-4" />} label="Set Up Position" desc="Custom FEN position" onClick={() => {}} />
                  <SidebarMenuItem icon={<History className="h-4 w-4" />} label="Load From Game History" desc="Analyze a past game" onClick={() => {}} />
                  <SidebarMenuItem icon={<FileText className="h-4 w-4" />} label="Load From FEN/PGN(s)" desc="Paste PGN or FEN" onClick={() => setSidebarPanel("pgn")} chevron />

                  {/* PGN Input inline */}
                  <div className="px-3 pt-2 pb-1">
                    <Textarea
                      placeholder="Paste one or more PGNs, or drag & drop your PGN file here."
                      value={pgnInput}
                      onChange={(e) => setPgnInput(e.target.value)}
                      rows={4}
                      className="font-mono text-xs resize-none bg-[hsl(220,18%,20%)] border-border/30 placeholder:text-muted-foreground/40"
                      maxLength={10000}
                    />
                  </div>

                  <div className="px-3 pb-2">
                    <Button
                      onClick={runAnalysis}
                      disabled={analyzing || !pgnInput.trim()}
                      className="w-full bg-[hsl(120,40%,45%)] hover:bg-[hsl(120,40%,50%)] text-white font-semibold"
                    >
                      {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Add Game(s)"}
                    </Button>
                    {analyzing && (
                      <div className="mt-2 space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground text-center">{progress}% — depth {depth}</p>
                      </div>
                    )}
                    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
                  </div>

                  <SidebarMenuItem icon={<BookOpen className="h-4 w-4" />} label="Load Previous Analysis" desc="Resume saved analysis" onClick={() => {}} />
                </motion.div>
              )}

              {sidebarPanel === "pgn" && (
                <motion.div key="pgn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 space-y-3">
                  <button onClick={() => setSidebarPanel("menu")} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <ChevronLeft className="h-3 w-3" /> Back
                  </button>
                  <h3 className="text-sm font-bold text-foreground">Load From FEN/PGN</h3>
                  <Textarea
                    placeholder={"1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...\n\nOr paste full PGN with headers"}
                    value={pgnInput} onChange={(e) => setPgnInput(e.target.value)}
                    rows={10} className="font-mono text-xs resize-none bg-[hsl(220,18%,20%)] border-border/30" maxLength={10000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Depth: {depth}</span>
                    <span className="text-[10px] text-muted-foreground/60">{depth <= 10 ? "Fast" : depth <= 18 ? "Standard" : "Deep"}</span>
                  </div>
                  <Slider value={[depth]} onValueChange={([v]) => setDepth(v)} min={8} max={22} step={1} />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <Button onClick={runAnalysis} disabled={analyzing || !pgnInput.trim()} className="w-full bg-[hsl(120,40%,45%)] hover:bg-[hsl(120,40%,50%)] text-white font-semibold">
                    {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-4 w-4" />Analyze Game</>}
                  </Button>
                  {analyzing && <Progress value={progress} className="h-1.5" />}
                </motion.div>
              )}

              {sidebarPanel === "moves" && (
                <motion.div key="moves" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
                    <button onClick={() => setSidebarPanel("menu")} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ChevronLeft className="h-3 w-3" /> Menu
                    </button>
                    <div className="flex items-center gap-1">
                      {!pgnComplete && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={undoLastMove} disabled={liveMoveHistory.length === 0}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Undo
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={resetInteractive}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {pgnComplete && (
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={clearPgnAnalysis}>
                          <Search className="h-3 w-3 mr-1" /> New
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Engine eval */}
                  {(activeEvals.length > 0 || liveCurrentEval.bestMoveSan) && (
                    <div className="px-3 py-2 border-b border-border/20 bg-[hsl(220,18%,14%)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Engine · Depth {depth}</span>
                        <span className="text-sm font-mono font-bold text-foreground">
                          {formatEval(evalCpForBar, evalMateForBar)}
                        </span>
                      </div>
                      {liveCurrentEval.bestMoveSan && !pgnComplete && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Best: <span className="text-foreground font-mono font-semibold">{liveCurrentEval.bestMoveSan}</span>
                        </p>
                      )}
                      {currentEval && ["blunder", "mistake", "inaccuracy"].includes(currentEval.classification) && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          <span className={CLASS_STYLES[currentEval.classification].color}>
                            {CLASS_STYLES[currentEval.classification].label}
                          </span>
                          <span className="text-muted-foreground">— Best was</span>
                          <span className="text-foreground font-mono font-semibold">{currentEval.bestMoveSan}</span>
                        </div>
                      )}
                      {/* Alt lines */}
                      {(pgnComplete ? currentEval?.altLines : liveCurrentEval.altLines)?.slice(0, 3).map((line, li) => (
                        <div key={li} className="flex items-center justify-between text-[11px] mt-0.5">
                          <span className="font-mono text-foreground/70">{line.san}</span>
                          <span className="font-mono text-muted-foreground">{formatEval(line.eval, line.mate)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Eval graph */}
                  {activeEvals.length > 1 && (
                    <div className="px-3 py-2 border-b border-border/20">
                      <div className="relative h-16 w-full">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-border/40" />
                        <svg viewBox={`0 0 ${graphData.length} 100`} className="w-full h-full" preserveAspectRatio="none">
                          {graphData.map((d, i) => {
                            const normalized = (d.eval + 500) / 1000;
                            const y = Math.max(0, Math.min(100, (1 - normalized) * 100));
                            const height = Math.abs(50 - y);
                            const isAbove = y < 50;
                            const isActive = activeIdx === i;
                            const isBad = d.classification === "blunder" || d.classification === "mistake";
                            let fill = "hsl(0, 0%, 45%)";
                            if (isBad) fill = d.classification === "blunder" ? "hsl(0, 70%, 50%)" : "hsl(30, 80%, 50%)";
                            if (isActive) fill = "hsl(120, 50%, 50%)";
                            return <rect key={i} x={i} y={isAbove ? y : 50} width={0.8} height={Math.max(1, height)} fill={fill} className="cursor-pointer" onClick={() => goFn(i)} rx={0.2} />;
                          })}
                        </svg>
                        {activeIdx >= 0 && (
                          <div className="absolute top-0 bottom-0 w-0.5 bg-primary/60" style={{ left: `${(activeIdx / graphData.length) * 100}%` }} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Move list */}
                  <div className="flex-1 overflow-y-auto px-2 py-1 max-h-[300px]" ref={moveListRef}>
                    {activeEvals.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <MousePointerClick className="h-8 w-8 mb-3 text-primary/40" />
                        <p className="text-sm">Click pieces to make moves</p>
                        <p className="text-[10px] mt-1">Stockfish evaluates every position</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                        {activeEvals.map((mv, i) => {
                          const s = CLASS_STYLES[mv.classification];
                          const isActive = activeIdx === i;
                          const showNum = mv.color === "w";
                          return (
                            <button key={i}
                              onClick={() => goFn(i)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
                                isActive ? "bg-[hsl(120,40%,35%)] text-white" : "hover:bg-[hsl(220,18%,22%)] text-foreground/80"
                              } ${mv.color === "w" ? "col-start-1" : "col-start-2"}`}
                            >
                              {showNum && <span className="text-muted-foreground/50 font-mono w-5 text-right shrink-0 text-[10px]">{mv.moveNumber}.</span>}
                              {!showNum && <span className="w-5 shrink-0" />}
                              <span className="font-mono font-medium">{mv.san}</span>
                              {s.symbol && <span className={`text-[9px] font-bold ${isActive ? "text-white/80" : s.color}`}>{s.symbol}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {sidebarPanel === "summary" && (
                <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 space-y-3">
                  <button onClick={() => setSidebarPanel("moves")} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <ChevronLeft className="h-3 w-3" /> Back
                  </button>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Game Summary
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Opening</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">{opening}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[hsl(220,18%,20%)] p-2 text-center">
                      <p className="text-lg font-bold text-foreground">{calcAccuracy(whiteEvals)}%</p>
                      <p className="text-[10px] text-muted-foreground">White Accuracy</p>
                    </div>
                    <div className="rounded-lg bg-[hsl(220,18%,20%)] p-2 text-center">
                      <p className="text-lg font-bold text-foreground">{calcAccuracy(blackEvals)}%</p>
                      <p className="text-[10px] text-muted-foreground">Black Accuracy</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <StatBox count={brilliant} label="Brilliant" color="cyan" />
                    <StatBox count={inaccuracies} label="Inaccuracy" color="yellow" />
                    <StatBox count={mistakes} label="Mistake" color="orange" />
                    <StatBox count={blunders} label="Blunder" color="red" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom navigation */}
          <div className="border-t border-border/20 px-3 py-2 flex items-center justify-between bg-[hsl(220,18%,14%)]">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goFn(-1)} disabled={activeEvals.length === 0}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goFn(activeIdx - 1)} disabled={activeIdx <= -1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goFn(activeIdx + 1)} disabled={activeIdx >= activeEvals.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goFn(activeEvals.length - 1)} disabled={activeIdx >= activeEvals.length - 1}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-[10px] px-2" onClick={resetInteractive}>
                <Search className="h-3 w-3 mr-1" /> New
              </Button>
              {activeEvals.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] px-2" onClick={downloadPGN}>
                    <Save className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] px-2" onClick={() => setSidebarPanel("summary")}>
                    <BarChart3 className="h-3 w-3 mr-1" /> Review
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──

function SidebarMenuItem({ icon, label, desc, onClick, chevron }: { icon: React.ReactNode; label: string; desc?: string; onClick: () => void; chevron?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(220,18%,20%)] transition-colors text-left group">
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {desc && <p className="text-[10px] text-muted-foreground truncate">{desc}</p>}
      </div>
      <ChevronRight className={`h-4 w-4 text-muted-foreground/40 ${chevron ? 'rotate-90' : ''}`} />
    </button>
  );
}

function StatBox({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={`rounded-lg bg-${color}-500/10 border border-${color}-500/20 px-1 py-1.5`}>
      <p className={`text-sm font-bold text-${color}-400`}>{count}</p>
      <p className={`text-[9px] text-${color}-300`}>{label}</p>
    </div>
  );
}
