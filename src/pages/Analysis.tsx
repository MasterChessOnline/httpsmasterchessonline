import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine } from "@/lib/stockfish-engine";
import { fetchExplorerData, fetchMasterExplorerData, ExplorerMove, ExplorerData } from "@/lib/lichess-explorer";
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
  Play, ChevronDown, History, FileText, Plus, Search, Save, BookOpen,
  Globe, Database, Trophy, FlipVertical
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

function formatGames(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

type SidebarTab = "analysis" | "explorer" | "pgn";

// ── Component ──
export default function Analysis() {
  // sidebar is always analysis now
  const [depth, setDepth] = useState(15);
  const [flipped, setFlipped] = useState(false);
  const [bottomTab, setBottomTab] = useState<"explorer" | "import">("explorer");
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

  // Explorer state
  const [explorerData, setExplorerData] = useState<ExplorerData | null>(null);
  const [explorerDb, setExplorerDb] = useState<"lichess" | "masters">("lichess");
  const [explorerLoading, setExplorerLoading] = useState(false);

  // Current FEN for explorer
  const currentFen = useMemo(() => {
    if (pgnComplete && pgnCurrentIdx >= 0 && pgnCurrentIdx < pgnMoveEvals.length) {
      return pgnMoveEvals[pgnCurrentIdx].fen;
    }
    if (liveViewIdx >= 0 && liveViewIdx < liveMoveHistory.length) {
      return liveMoveHistory[liveViewIdx].fen;
    }
    return liveGame.fen();
  }, [pgnComplete, pgnCurrentIdx, pgnMoveEvals, liveViewIdx, liveMoveHistory, liveGame]);

  useEffect(() => {
    const engine = getStockfishEngine();
    engine.init().then(() => { stockfishReady.current = true; }).catch(() => setError("Failed to load analysis engine"));
  }, []);

  // Fetch explorer data when position or db changes
  useEffect(() => {
    if (bottomTab !== "explorer") return;
    let cancelled = false;
    setExplorerLoading(true);
    const fetchFn = explorerDb === "masters" ? fetchMasterExplorerData : fetchExplorerData;
    fetchFn(currentFen).then(data => {
      if (!cancelled) { setExplorerData(data); setExplorerLoading(false); }
    });
    return () => { cancelled = true; };
  }, [currentFen, explorerDb, bottomTab]);

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
          return;
        }
      } catch {}
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else { setSelectedSquare(null); setLegalMoves([]); }
  }, [liveGame, selectedSquare, evaluatePosition, liveMoveHistory.length, liveViewIdx]);

  // Play an explorer move
  const playExplorerMove = useCallback((san: string) => {
    if (pgnComplete) return; // can't add moves to PGN analysis
    if (liveViewIdx >= 0) return;
    const game = liveGame;
    try {
      const fenBefore = game.fen();
      const move = game.move(san);
      if (move) {
        const newFen = game.fen();
        setLiveFen(newFen); setLiveLastMove({ from: move.from, to: move.to });
        setSelectedSquare(null); setLegalMoves([]); setLiveGame(new Chess(newFen));
        evaluatePosition(newFen, fenBefore, move.san, move.from, move.to, move.color, Math.ceil(liveMoveHistory.length / 2) + 1);
      }
    } catch {}
  }, [liveGame, evaluatePosition, liveMoveHistory.length, liveViewIdx, pgnComplete]);

  const resetInteractive = useCallback(() => {
    const fresh = new Chess();
    setLiveGame(fresh); setLiveFen("start"); setSelectedSquare(null); setLegalMoves([]);
    setLiveMoveHistory([]); setLiveLastMove(null); setLiveEvaluating(false);
    setLiveCurrentEval({ cp: 0, mate: null, bestMove: "", bestMoveSan: "", altLines: [] });
    setLiveViewIdx(-1); prevEvalRef.current = 0;
    setPgnMoveEvals([]); setPgnComplete(false); setPgnCurrentIdx(-1);
    setExplorerData(null);
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
    setAnalyzing(true);
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
  };

  const downloadPGN = () => {
    const evals = pgnComplete ? pgnMoveEvals : liveMoveHistory;
    if (evals.length === 0) return;
    let pgn = `[Event "Game Analysis"]\n\n`;
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

  // bottomTab declared at top of component

  // ── Render ──
  return (
    <div className="min-h-screen bg-[hsl(220,20%,12%)]">
      <Navbar />
      <main className="flex flex-col items-center pt-4 pb-8 px-2 lg:px-4 min-h-[calc(100vh-64px)]">
        {/* ── TOP ROW: Board + Analysis Sidebar ── */}
        <div className="flex justify-center items-start gap-0 w-full max-w-[920px]">
          {/* ── LEFT: Eval Bar + Board ── */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1 self-start ml-10">
              <div className="w-4 h-4 rounded-sm bg-[hsl(220,15%,20%)] border border-border/30" />
              <span className="text-xs font-semibold text-foreground/80">Black</span>
              {explorerData?.opening && (
                <Badge variant="outline" className="text-[10px] ml-2">{explorerData.opening.eco} {explorerData.opening.name}</Badge>
              )}
            </div>

            <div className="flex items-stretch">
              {/* Eval Bar */}
              <div className="w-7 shrink-0 rounded-sm overflow-hidden mr-1.5 relative flex flex-col" style={{ minHeight: 420 }}>
                <motion.div className="bg-[hsl(220,15%,18%)]" initial={{ flexBasis: "50%" }} animate={{ flexBasis: `${100 - evalPercent}%` }} transition={{ type: "spring", stiffness: 180, damping: 22 }} style={{ flexShrink: 0 }} />
                <motion.div className="bg-[hsl(60,10%,90%)]" initial={{ flexBasis: "50%" }} animate={{ flexBasis: `${evalPercent}%` }} transition={{ type: "spring", stiffness: 180, damping: 22 }} style={{ flexShrink: 0 }} />
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
              <div className="w-[min(50vw,460px)]">
                <ChessBoard
                  game={boardGame}
                  flipped={flipped}
                  selectedSquare={!pgnComplete ? selectedSquare : null}
                  legalMoves={!pgnComplete ? legalMoves : []}
                  lastMove={lastMoveDisplay}
                  isGameOver={false}
                  isPlayerTurn={!pgnComplete && liveViewIdx < 0}
                  onSquareClick={!pgnComplete ? handleInteractiveSquareClick : () => {}}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 self-start ml-10">
              <div className="w-4 h-4 rounded-sm bg-[hsl(60,10%,90%)] border border-border/30" />
              <span className="text-xs font-semibold text-foreground/80">White</span>
            </div>

            {/* Board controls */}
            <div className="flex items-center gap-1 mt-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFlipped(!flipped)}>
                <FlipVertical className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetInteractive} title="New analysis">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── RIGHT: Analysis Sidebar ── */}
          <div className="w-[340px] lg:w-[380px] shrink-0 ml-3 flex flex-col bg-[hsl(220,18%,16%)] rounded-lg border border-border/20 overflow-hidden" style={{ minHeight: 500 }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/20 bg-[hsl(220,18%,14%)]">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Analysis</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Stockfish · D{depth}</span>
            </div>

            {/* Engine eval */}
            <div className="px-3 py-2 border-b border-border/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-foreground">{formatEval(evalCpForBar, evalMateForBar)}</span>
                {liveCurrentEval.bestMoveSan && !pgnComplete && (
                  <span className="text-xs text-muted-foreground">Best: <span className="text-foreground font-mono font-semibold">{liveCurrentEval.bestMoveSan}</span></span>
                )}
              </div>
              {currentEval && ["blunder", "mistake", "inaccuracy"].includes(currentEval.classification) && (
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <span className={CLASS_STYLES[currentEval.classification].color}>{CLASS_STYLES[currentEval.classification].label}</span>
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
              {/* Depth slider */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] text-muted-foreground">Depth</span>
                <Slider value={[depth]} onValueChange={([v]) => setDepth(v)} min={8} max={22} step={1} className="flex-1" />
                <span className="text-[9px] text-muted-foreground w-4 text-right">{depth}</span>
              </div>
            </div>

            {/* Eval graph */}
            {activeEvals.length > 1 && (
              <div className="px-3 py-2 border-b border-border/20">
                <div className="relative h-14 w-full">
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

            {/* Summary bar */}
            {activeEvals.length > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20 text-[10px]">
                <div className="flex gap-2">
                  <span className="text-cyan-400">✦ {brilliant}</span>
                  <span className="text-yellow-400">?! {inaccuracies}</span>
                  <span className="text-orange-400">? {mistakes}</span>
                  <span className="text-red-500">?? {blunders}</span>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <span>W: {calcAccuracy(whiteEvals)}%</span>
                  <span>B: {calcAccuracy(blackEvals)}%</span>
                </div>
              </div>
            )}

            {/* Move list */}
            <div className="flex-1 overflow-y-auto px-2 py-1 max-h-[240px]" ref={moveListRef}>
              {activeEvals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <MousePointerClick className="h-7 w-7 mb-2 text-primary/40" />
                  <p className="text-sm">Click pieces to make moves</p>
                  <p className="text-[10px] mt-1">or import a PGN below</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                  {activeEvals.map((mv, i) => {
                    const s = CLASS_STYLES[mv.classification];
                    const isActive = activeIdx === i;
                    const showNum = mv.color === "w";
                    return (
                      <button key={i} onClick={() => goFn(i)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
                          isActive ? "bg-[hsl(120,40%,35%)] text-white" : "hover:bg-[hsl(220,18%,22%)] text-foreground/80"
                        } ${mv.color === "w" ? "col-start-1" : "col-start-2"}`}>
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

            {/* Bottom navigation */}
            <div className="border-t border-border/20 px-3 py-2 flex items-center justify-between bg-[hsl(220,18%,14%)]">
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(-1)} disabled={activeEvals.length === 0}>
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(activeIdx - 1)} disabled={activeIdx <= -1}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(activeIdx + 1)} disabled={activeIdx >= activeEvals.length - 1}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goFn(activeEvals.length - 1)} disabled={activeIdx >= activeEvals.length - 1}>
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                {!pgnComplete && liveMoveHistory.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={undoLastMove}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Undo
                  </Button>
                )}
                {activeEvals.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={downloadPGN}>
                    <Download className="h-3 w-3 mr-1" /> PGN
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Explorer & Import (always visible) ── */}
        <div className="w-full max-w-[920px] mt-4">
          <div className="bg-[hsl(220,18%,16%)] rounded-lg border border-border/20 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border/20">
              <BottomTabButton active={bottomTab === "explorer"} onClick={() => setBottomTab("explorer")} icon={<Globe className="h-3.5 w-3.5" />} label="Opening Explorer" />
              <BottomTabButton active={bottomTab === "import"} onClick={() => setBottomTab("import")} icon={<Upload className="h-3.5 w-3.5" />} label="Import PGN" />
            </div>

            <AnimatePresence mode="wait">
              {/* ── EXPLORER ── */}
              {bottomTab === "explorer" && (
                <motion.div key="explorer-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* DB selector */}
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-border/10">
                    <div className="flex gap-1">
                      <button onClick={() => setExplorerDb("lichess")} className={`text-[11px] px-3 py-1 rounded transition-colors ${explorerDb === "lichess" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-[hsl(220,18%,22%)]"}`}>
                        Lichess DB
                      </button>
                      <button onClick={() => setExplorerDb("masters")} className={`text-[11px] px-3 py-1 rounded transition-colors ${explorerDb === "masters" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-[hsl(220,18%,22%)]"}`}>
                        Masters DB
                      </button>
                    </div>
                    {explorerData && (
                      <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {formatGames(explorerData.totalGames)} games
                        {explorerData.opening && <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-1">{explorerData.opening.eco} {explorerData.opening.name}</Badge>}
                      </span>
                    )}
                  </div>

                  {explorerLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground ml-2">Loading games...</span>
                    </div>
                  ) : explorerData && explorerData.moves.length > 0 ? (
                    <div>
                      {/* Win/Draw/Loss bar */}
                      {explorerData.totalGames > 0 && (
                        <div className="px-4 py-2 border-b border-border/10">
                          <div className="flex h-4 rounded-full overflow-hidden">
                            <div className="bg-[hsl(0,0%,95%)] flex items-center justify-center transition-all" style={{ width: `${(explorerData.white / explorerData.totalGames) * 100}%` }}>
                              <span className="text-[9px] font-bold text-[hsl(220,15%,20%)]">{((explorerData.white / explorerData.totalGames) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="bg-[hsl(0,0%,60%)] flex items-center justify-center transition-all" style={{ width: `${(explorerData.draws / explorerData.totalGames) * 100}%` }}>
                              <span className="text-[9px] font-bold text-white">{((explorerData.draws / explorerData.totalGames) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="bg-[hsl(220,15%,20%)] flex items-center justify-center transition-all" style={{ width: `${(explorerData.black / explorerData.totalGames) * 100}%` }}>
                              <span className="text-[9px] font-bold text-[hsl(0,0%,90%)]">{((explorerData.black / explorerData.totalGames) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Move table */}
                      <div className="grid grid-cols-[60px_1fr_50px_50px_50px_60px] gap-0 text-[9px] text-muted-foreground px-4 py-1.5 border-b border-border/10 uppercase tracking-wider font-semibold">
                        <span>Move</span><span>Win bar</span><span className="text-center">W%</span><span className="text-center">D%</span><span className="text-center">L%</span><span className="text-right">Games</span>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {explorerData.moves.sort((a, b) => b.games - a.games).map((mv) => (
                          <button key={mv.san} onClick={() => playExplorerMove(mv.san)}
                            className="w-full grid grid-cols-[60px_1fr_50px_50px_50px_60px] gap-0 text-[11px] px-4 py-1.5 hover:bg-[hsl(220,18%,22%)] transition-colors border-b border-border/5">
                            <span className="font-mono font-bold text-foreground">{mv.san}</span>
                            <div className="flex items-center pr-3">
                              <div className="flex h-2.5 w-full rounded-full overflow-hidden">
                                <div className="bg-[hsl(0,0%,92%)]" style={{ width: `${mv.winRate}%` }} />
                                <div className="bg-[hsl(0,0%,60%)]" style={{ width: `${mv.drawRate}%` }} />
                                <div className="bg-[hsl(220,15%,22%)]" style={{ width: `${mv.lossRate}%` }} />
                              </div>
                            </div>
                            <span className="text-center text-[hsl(0,0%,90%)]">{mv.winRate.toFixed(0)}</span>
                            <span className="text-center text-muted-foreground">{mv.drawRate.toFixed(0)}</span>
                            <span className="text-center text-muted-foreground/70">{mv.lossRate.toFixed(0)}</span>
                            <span className="text-right text-muted-foreground">{formatGames(mv.games)}</span>
                          </button>
                        ))}
                      </div>

                      {/* Top games */}
                      {explorerData.topGames && explorerData.topGames.length > 0 && (
                        <div className="px-4 py-2 border-t border-border/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Trophy className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Games</span>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-0.5">
                            {explorerData.topGames.map((g, i) => (
                              <a key={i} href={`https://lichess.org/${g.id}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] py-0.5 hover:text-primary transition-colors">
                                <span className="text-foreground/80">{g.white.name} ({g.white.rating}) vs {g.black.name} ({g.black.rating})</span>
                                <span className="text-muted-foreground">{g.winner === "white" ? "1-0" : g.winner === "black" ? "0-1" : "½-½"} · {g.year}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Database className="h-6 w-6 mb-2 text-primary/30" />
                      <p className="text-sm">No games found for this position</p>
                      <p className="text-[10px] mt-1">Make moves on the board to explore openings</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── IMPORT PGN ── */}
              {bottomTab === "import" && (
                <motion.div key="import-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Textarea
                        placeholder={"1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...\n\nOr paste full PGN with headers"}
                        value={pgnInput} onChange={(e) => setPgnInput(e.target.value)}
                        rows={5} className="font-mono text-xs resize-none bg-[hsl(220,18%,20%)] border-border/30" maxLength={10000}
                      />
                    </div>
                    <div className="w-[200px] flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Depth: {depth}</span>
                        <span>{depth <= 10 ? "Fast" : depth <= 18 ? "Standard" : "Deep"}</span>
                      </div>
                      <Slider value={[depth]} onValueChange={([v]) => setDepth(v)} min={8} max={22} step={1} />
                      {error && <p className="text-xs text-destructive">{error}</p>}
                      <Button onClick={runAnalysis} disabled={analyzing || !pgnInput.trim()} className="w-full bg-[hsl(120,40%,45%)] hover:bg-[hsl(120,40%,50%)] text-white font-semibold text-xs">
                        {analyzing ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Analyzing {progress}%</> : <><Brain className="mr-2 h-3.5 w-3.5" />Analyze Game</>}
                      </Button>
                      {analyzing && <Progress value={progress} className="h-1.5" />}
                      {pgnComplete && (
                        <Button variant="outline" onClick={clearPgnAnalysis} className="w-full text-xs">
                          <Trash2 className="mr-2 h-3 w-3" /> Clear & New
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──
function BottomTabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
        active ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
