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
import {
  Brain, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Upload, Trash2, Zap, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Download, BarChart3, Settings2, TrendingUp
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

// Opening detection from first moves
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
  const [pgnInput, setPgnInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moveEvals, setMoveEvals] = useState<MoveEval[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState("");
  const [depth, setDepth] = useState(15);
  const [showSettings, setShowSettings] = useState(false);

  const displayGame = useRef(new Chess());
  const [displayFen, setDisplayFen] = useState("start");
  const stockfishReady = useRef(false);
  const moveListRef = useRef<HTMLDivElement>(null);

  // Init Stockfish
  useEffect(() => {
    const engine = getStockfishEngine();
    engine.init().then(() => { stockfishReady.current = true; })
      .catch(() => setError("Failed to load analysis engine"));
  }, []);

  // Navigate to move
  const goToMove = useCallback((idx: number) => {
    const clamped = Math.max(-1, Math.min(idx, moveEvals.length - 1));
    setCurrentIdx(clamped);
    displayGame.current = clamped === -1 ? new Chess() : new Chess(moveEvals[clamped].fen);
    setDisplayFen(displayGame.current.fen());
  }, [moveEvals]);

  // Keyboard nav
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

  // Auto-scroll move list
  useEffect(() => {
    if (!moveListRef.current || currentIdx < 0) return;
    const el = moveListRef.current.children[currentIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentIdx]);

  // ── Run analysis ──

  const runAnalysis = async () => {
    setError("");
    setMoveEvals([]);
    setAnalysisComplete(false);
    setCurrentIdx(-1);
    displayGame.current = new Chess();
    setDisplayFen("start");

    const parseGame = new Chess();
    const trimmed = pgnInput.trim();
    if (!trimmed) { setError("Please enter a PGN or move list."); return; }

    try {
      parseGame.loadPgn(trimmed);
    } catch {
      parseGame.reset();
      const moves = trimmed.replace(/\d+\.\s*/g, "").split(/\s+/).filter(Boolean);
      for (const m of moves) {
        try { parseGame.move(m); }
        catch { setError(`Invalid move: "${m}".`); return; }
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

      // Get best move + top 3 alternative lines
      const bestResult = await engine.getBestMove(fenBefore, 600, depth);

      // Get multi-PV lines
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

      // Convert multi-PV lines to SAN
      const altLines = multiLines.slice(0, 3).map(line => ({
        san: line.pv[0] ? uciToSan(fenBefore, line.pv[0]) : "",
        eval: line.eval,
        mate: line.mate,
      })).filter(l => l.san && l.san !== move.san);

      evals.push({
        san: move.san,
        fen: fenAfter,
        fenBefore,
        from: move.from,
        to: move.to,
        color: move.color,
        moveNumber: Math.floor(i / 2) + 1,
        eval: evalCp,
        mate: posEval.mate,
        bestMove: bestResult.bestMove || "",
        bestMoveSan,
        altLines,
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
    setPgnInput(""); setMoveEvals([]); setAnalysisComplete(false);
    setCurrentIdx(-1); setError(""); setProgress(0);
    displayGame.current = new Chess(); setDisplayFen("start");
  };

  // ── Download annotated PGN ──

  const downloadPGN = () => {
    if (moveEvals.length === 0) return;
    const opening = detectOpening(moveEvals.map(m => m.san));
    let pgn = `[Event "Game Analysis"]\n[Opening "${opening}"]\n\n`;
    moveEvals.forEach((mv, i) => {
      if (mv.color === "w") pgn += `${mv.moveNumber}. `;
      pgn += mv.san;
      const s = CLASS_STYLES[mv.classification];
      if (s.symbol) pgn += s.symbol;
      if (mv.classification === "blunder" || mv.classification === "mistake" || mv.classification === "inaccuracy") {
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

  // ── Derived ──

  const currentEval = currentIdx >= 0 ? moveEvals[currentIdx] : null;
  const evalPercent = currentEval ? evalToBarPct(currentEval.eval, currentEval.mate) : 50;

  const blunders = moveEvals.filter(e => e.classification === "blunder").length;
  const mistakes = moveEvals.filter(e => e.classification === "mistake").length;
  const inaccuracies = moveEvals.filter(e => e.classification === "inaccuracy").length;
  const brilliant = moveEvals.filter(e => e.classification === "brilliant").length;

  const opening = useMemo(() => detectOpening(moveEvals.map(m => m.san)), [moveEvals]);

  const lastMove = currentIdx >= 0 ? { from: moveEvals[currentIdx].from, to: moveEvals[currentIdx].to } : null;

  // Accuracy per side
  const whiteEvals = moveEvals.filter(e => e.color === "w");
  const blackEvals = moveEvals.filter(e => e.color === "b");
  const calcAccuracy = (evs: MoveEval[]) => {
    if (evs.length === 0) return 0;
    const good = evs.filter(e => e.classification === "brilliant" || e.classification === "great" || e.classification === "good").length;
    return Math.round((good / evs.length) * 100);
  };
  const whiteAccuracy = calcAccuracy(whiteEvals);
  const blackAccuracy = calcAccuracy(blackEvals);

  // ── Eval Graph data ──
  const graphData = useMemo(() => {
    return moveEvals.map((ev, i) => ({
      idx: i,
      eval: Math.max(-500, Math.min(500, ev.mate !== null ? (ev.mate > 0 ? 500 : -500) : ev.eval)),
      classification: ev.classification,
    }));
  }, [moveEvals]);

  // ── Render ──

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Game Analysis</h1>
              <p className="text-sm text-muted-foreground">Powered by Stockfish — move-by-move evaluation</p>
            </div>
          </div>
          {analysisComplete && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadPGN}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download PGN
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAnalysis}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> New
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* ── Left Column: Board + Graph ── */}
          <div className="space-y-4">
            {/* Board + Eval Bar */}
            <div className="flex gap-2 items-stretch">
              {/* Vertical Eval Bar */}
              <div className="w-8 shrink-0">
                <div className="w-full h-full rounded-lg overflow-hidden border border-border/40 relative bg-[hsl(220,15%,18%)] min-h-[320px]">
                  <motion.div
                    className="absolute top-0 left-0 right-0 bg-foreground/90"
                    initial={{ height: "50%" }}
                    animate={{ height: `${100 - evalPercent}%` }}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-between py-1.5 pointer-events-none">
                    <span className={`text-[10px] font-bold font-mono z-10 ${evalPercent < 50 ? "text-background" : "text-foreground/60"}`}>
                      {currentEval ? (currentEval.eval >= 0 ? formatEval(currentEval.eval, currentEval.mate && currentEval.mate > 0 ? currentEval.mate : null) : "") : ""}
                    </span>
                    <span className={`text-[10px] font-bold font-mono z-10 ${evalPercent >= 50 ? "text-foreground" : "text-foreground/60"}`}>
                      {currentEval ? (currentEval.eval < 0 ? formatEval(Math.abs(currentEval.eval), currentEval.mate && currentEval.mate < 0 ? Math.abs(currentEval.mate) : null) : "") : ""}
                    </span>
                  </div>
                </div>
              </div>

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
                <span className="text-sm font-mono text-muted-foreground min-w-[100px] text-center">
                  {currentIdx >= 0
                    ? `${moveEvals[currentIdx].moveNumber}.${moveEvals[currentIdx].color === "b" ? ".." : ""} ${moveEvals[currentIdx].san}`
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

            {/* Eval Graph */}
            {analysisComplete && graphData.length > 0 && (
              <div className="rounded-xl border border-border/40 bg-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Advantage Over Time</span>
                </div>
                <div className="relative h-24 w-full">
                  {/* Center line */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-border/60" />
                  {/* Bars */}
                  <svg viewBox={`0 0 ${graphData.length} 100`} className="w-full h-full" preserveAspectRatio="none">
                    {graphData.map((d, i) => {
                      const normalized = (d.eval + 500) / 1000; // 0 to 1
                      const y = Math.max(0, Math.min(100, (1 - normalized) * 100));
                      const height = Math.abs(50 - y);
                      const isAbove = y < 50;
                      const isActive = currentIdx === i;
                      const isBad = d.classification === "blunder" || d.classification === "mistake";
                      let fill = "hsl(var(--muted-foreground) / 0.3)";
                      if (isBad) fill = d.classification === "blunder" ? "hsl(0, 70%, 50%)" : "hsl(30, 80%, 50%)";
                      if (isActive) fill = "hsl(var(--primary))";
                      return (
                        <rect
                          key={i}
                          x={i}
                          y={isAbove ? y : 50}
                          width={0.8}
                          height={Math.max(1, height)}
                          fill={fill}
                          className="cursor-pointer"
                          onClick={() => goToMove(i)}
                          rx={0.2}
                        />
                      );
                    })}
                  </svg>
                  {/* Current position marker */}
                  {currentIdx >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-primary/60"
                      style={{ left: `${(currentIdx / graphData.length) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-1">
                  <span>Move 1</span>
                  <span>Move {graphData.length}</span>
                </div>
              </div>
            )}

            {/* Move Classification Detail */}
            <AnimatePresence mode="wait">
              {currentEval && (
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-border/40 bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const s = CLASS_STYLES[currentEval.classification];
                        const Icon = s.icon;
                        return <>
                          <Icon className={`h-5 w-5 ${s.color}`} />
                          <span className={`font-bold text-sm ${s.color}`}>{s.label}</span>
                        </>;
                      })()}
                      <span className="text-sm text-foreground font-mono">
                        {currentEval.moveNumber}.{currentEval.color === "b" ? ".." : ""} {currentEval.san}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {formatEval(currentEval.eval, currentEval.mate)}
                    </Badge>
                  </div>

                  {/* Best move suggestion */}
                  {(currentEval.classification === "blunder" || currentEval.classification === "mistake" || currentEval.classification === "inaccuracy") && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Best was <strong className="text-foreground">{currentEval.bestMoveSan}</strong></span>
                    </div>
                  )}

                  {/* Alternative lines (Multi-PV) */}
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
          </div>

          {/* ── Right Column: Input / Stats / Moves ── */}
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

                {/* Depth setting */}
                <button
                  onClick={() => setShowSettings(p => !p)}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings2 className="h-3 w-3" /> Analysis Settings
                </button>
                {showSettings && (
                  <div className="rounded-lg bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Depth: {depth}</span>
                      <span className="text-[10px] text-muted-foreground/60">{depth <= 10 ? "Fast" : depth <= 18 ? "Standard" : "Deep"}</span>
                    </div>
                    <Slider
                      value={[depth]}
                      onValueChange={([v]) => setDepth(v)}
                      min={8}
                      max={22}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                {error && <p className="text-xs text-destructive">{error}</p>}

                <Button onClick={runAnalysis} disabled={analyzing || !pgnInput.trim()} className="w-full">
                  {analyzing
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    : <><Brain className="mr-2 h-4 w-4" /> Analyze Game</>}
                </Button>
                {analyzing && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-[10px] text-muted-foreground text-center">{progress}% — depth {depth}</p>
                  </div>
                )}
              </div>
            )}

            {/* Game Summary */}
            {analysisComplete && (
              <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Game Summary
                </h2>

                {/* Opening */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Opening</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">{opening}</Badge>
                </div>

                {/* Final eval */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Final Evaluation</span>
                  <span className="font-mono font-bold text-foreground">
                    {moveEvals.length > 0 ? formatEval(moveEvals[moveEvals.length - 1].eval, moveEvals[moveEvals.length - 1].mate) : "0.0"}
                  </span>
                </div>

                {/* Accuracy per side */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/20 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{whiteAccuracy}%</p>
                    <p className="text-[10px] text-muted-foreground">White Accuracy</p>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{blackAccuracy}%</p>
                    <p className="text-[10px] text-muted-foreground">Black Accuracy</p>
                  </div>
                </div>

                {/* Classification counts */}
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
            {analysisComplete && (
              <div className="rounded-xl border border-border/40 bg-card p-3 max-h-[380px] overflow-y-auto" ref={moveListRef}>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Moves</h3>
                <div className="space-y-0.5">
                  {moveEvals.map((mv, i) => {
                    const s = CLASS_STYLES[mv.classification];
                    const isActive = currentIdx === i;
                    return (
                      <button
                        key={i}
                        onClick={() => goToMove(i)}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors text-xs ${
                          isActive ? "bg-primary/15 border border-primary/30" : "hover:bg-muted/30"
                        }`}
                      >
                        {mv.color === "w" && (
                          <span className="text-muted-foreground/50 font-mono w-6 text-right shrink-0">{mv.moveNumber}.</span>
                        )}
                        {mv.color === "b" && (
                          <span className="text-muted-foreground/50 font-mono w-6 text-right shrink-0">
                            {i === 0 || moveEvals[i - 1]?.color === "b" ? `${mv.moveNumber}...` : ""}
                          </span>
                        )}
                        <span className={`font-mono font-medium ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                          {mv.san}
                        </span>
                        {s.symbol && (
                          <span className={`text-[9px] font-bold ${s.color}`}>{s.symbol}</span>
                        )}
                        <span className={`ml-auto text-[10px] font-mono ${s.color}`}>
                          {formatEval(mv.eval, mv.mate)}
                        </span>
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
