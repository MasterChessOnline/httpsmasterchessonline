import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine } from "@/lib/stockfish-engine";
import { fetchExplorerData, fetchMasterExplorerData, ExplorerMove, ExplorerData } from "@/lib/lichess-explorer";
import { OPENINGS_DATABASE } from "@/lib/openings-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain, BookOpen, RotateCcw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Zap, Star, BarChart3, FlipVertical,
  Globe, Database, Trophy, Loader2
} from "lucide-react";
import { motion } from "framer-motion";

// ── Types ──
interface EngineLineInfo {
  pv: string[];
  eval: number;
  mate: number | null;
  depth: number;
}

interface HistoryEntry {
  san: string;
  fen: string;
  from: string;
  to: string;
}

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

function formatGames(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Component ──
export default function OpeningExplorer() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [depth, setDepth] = useState([16]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  // Stockfish state
  const [engineReady, setEngineReady] = useState(false);
  const [engineLines, setEngineLines] = useState<EngineLineInfo[]>([]);
  const [engineEval, setEngineEval] = useState<{ cp: number; mate: number | null }>({ cp: 0, mate: null });
  const [analyzing, setAnalyzing] = useState(false);
  const [bestMoveUci, setBestMoveUci] = useState("");

  // Lichess explorer state
  const [explorerData, setExplorerData] = useState<ExplorerData | null>(null);
  const [explorerDb, setExplorerDb] = useState<"lichess" | "masters">("lichess");
  const [explorerLoading, setExplorerLoading] = useState(false);

  const engineRef = useRef(getStockfishEngine());
  const abortRef = useRef(0);

  const viewGame = useMemo(() => {
    const g = new Chess();
    for (let i = 0; i < viewIndex && i < history.length; i++) {
      g.move(history[i].san);
    }
    return g;
  }, [viewIndex, history]);

  const currentFen = viewGame.fen();

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [] as Square[];
    return viewGame.moves({ square: selectedSquare, verbose: true }).map(m => m.to as Square);
  }, [selectedSquare, viewGame]);

  const lastMove = useMemo(() => {
    if (viewIndex === 0) return null;
    const h = history[viewIndex - 1];
    return h ? { from: h.from, to: h.to } : null;
  }, [viewIndex, history]);

  // Init engine
  useEffect(() => {
    engineRef.current.init().then(() => {
      setEngineReady(true);
      engineRef.current.newGame();
    });
  }, []);

  // Fetch Lichess explorer data when position changes
  useEffect(() => {
    let cancelled = false;
    setExplorerLoading(true);
    const fetchFn = explorerDb === "masters" ? fetchMasterExplorerData : fetchExplorerData;
    fetchFn(currentFen).then(data => {
      if (!cancelled) { setExplorerData(data); setExplorerLoading(false); }
    });
    return () => { cancelled = true; };
  }, [currentFen, explorerDb]);

  // Run Stockfish when position changes
  useEffect(() => {
    if (!engineReady) return;
    const id = ++abortRef.current;
    setAnalyzing(true);
    const engine = engineRef.current;
    engine.setMultiPV(3);
    engine.getMultiPV(currentFen, 3, depth[0]).then(lines => {
      if (abortRef.current !== id) return;
      setEngineLines(lines);
      if (lines.length > 0) {
        setEngineEval({ cp: lines[0].eval, mate: lines[0].mate });
        setBestMoveUci(lines[0].pv[0] || "");
      }
      setAnalyzing(false);
    });
  }, [currentFen, engineReady, depth]);

  const handleMove = useCallback((from: string, to: string) => {
    const newGame = new Chess();
    const movesToReplay = history.slice(0, viewIndex);
    for (const h of movesToReplay) newGame.move(h.san);
    try {
      const move = newGame.move({ from: from as Square, to: to as Square, promotion: "q" });
      if (!move) return;
      const entry: HistoryEntry = { san: move.san, fen: newGame.fen(), from: move.from, to: move.to };
      const newHistory = [...movesToReplay, entry];
      setHistory(newHistory);
      setViewIndex(newHistory.length);
      setSelectedSquare(null);
    } catch {}
  }, [history, viewIndex]);

  const playExplorerMove = useCallback((san: string) => {
    const newGame = new Chess();
    const movesToReplay = history.slice(0, viewIndex);
    for (const h of movesToReplay) newGame.move(h.san);
    try {
      const move = newGame.move(san);
      if (!move) return;
      const entry: HistoryEntry = { san: move.san, fen: newGame.fen(), from: move.from, to: move.to };
      const newHistory = [...movesToReplay, entry];
      setHistory(newHistory);
      setViewIndex(newHistory.length);
    } catch {}
  }, [history, viewIndex]);

  const goTo = useCallback((idx: number) => {
    setViewIndex(Math.max(0, Math.min(history.length, idx)));
    setSelectedSquare(null);
  }, [history.length]);

  const reset = useCallback(() => {
    setHistory([]); setViewIndex(0); setSelectedSquare(null);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") goTo(viewIndex - 1);
      if (e.key === "ArrowRight") goTo(viewIndex + 1);
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(history.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, viewIndex, history.length]);

  const evalPct = evalToBarPct(engineEval.cp, engineEval.mate);
  const evalText = formatEval(engineEval.cp, engineEval.mate);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Opening Explorer</h1>
          {explorerData?.opening && (
            <Badge variant="outline">{explorerData.opening.eco} · {explorerData.opening.name}</Badge>
          )}
          {analyzing && <Brain className="w-4 h-4 text-primary animate-pulse" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
          {/* Left: Eval Bar + Board */}
          <div className="flex gap-2">
            {/* Vertical eval bar */}
            <div className="hidden sm:flex flex-col w-8 rounded-lg overflow-hidden border border-border bg-muted/30 relative" style={{ minHeight: 400 }}>
              <motion.div className="bg-foreground" animate={{ height: `${100 - evalPct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
              <motion.div className="bg-background flex-1" animate={{ height: `${evalPct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold bg-background/80 px-1 rounded text-foreground">{evalText}</span>
              </div>
            </div>

            {/* Board */}
            <div className="w-full max-w-[480px]">
              <ChessBoard
                game={viewGame}
                flipped={flipped}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isGameOver={false}
                isPlayerTurn={true}
                hintSquare={bestMoveUci.length >= 4 ? (bestMoveUci.slice(0, 2) as Square) : null}
                onSquareClick={(sq) => {
                  if (selectedSquare && legalMoves.includes(sq)) {
                    handleMove(selectedSquare, sq);
                  } else {
                    setSelectedSquare(sq === selectedSquare ? null : sq);
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2 gap-1">
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => goTo(0)}><ChevronsLeft className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => goTo(viewIndex - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => goTo(viewIndex + 1)}><ChevronRight className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => goTo(history.length)}><ChevronsRight className="w-4 h-4" /></Button>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setFlipped(!flipped)}><FlipVertical className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={reset}><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-3 min-w-0">
            {/* Engine Lines */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Stockfish</span>
                  <Badge variant="secondary" className="text-[10px]">Depth {depth[0]}</Badge>
                </div>
                <div className="flex items-center gap-2 w-32">
                  <Slider value={depth} onValueChange={setDepth} min={8} max={22} step={1} />
                </div>
              </div>
              <div className="space-y-1">
                {engineLines.length === 0 && <div className="text-xs text-muted-foreground">Analyzing...</div>}
                {engineLines.map((line, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs p-1.5 rounded ${i === 0 ? "bg-primary/10" : "bg-muted/30"}`}>
                    <span className={`font-bold min-w-[48px] ${(line.mate !== null ? (line.mate > 0) : line.eval > 0) ? "text-green-400" : "text-red-400"}`}>
                      {formatEval(line.eval, line.mate)}
                    </span>
                    <span className="text-muted-foreground truncate">{line.pv.slice(0, 8).join(" ")}</span>
                    {i === 0 && <Zap className="w-3 h-3 text-primary ml-auto shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Lichess Explorer – Real Data */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Opening Explorer</span>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => setExplorerDb("lichess")}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${explorerDb === "lichess" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    Lichess
                  </button>
                  <button onClick={() => setExplorerDb("masters")}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${explorerDb === "masters" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    Masters
                  </button>
                </div>
              </div>

              {explorerLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground ml-2">Loading...</span>
                </div>
              ) : explorerData && explorerData.moves.length > 0 ? (
                <>
                  {/* Position stats bar */}
                  {explorerData.totalGames > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                        <Database className="h-3 w-3" />
                        <span>{formatGames(explorerData.totalGames)} games</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <div className="bg-[hsl(0,0%,92%)]" style={{ width: `${(explorerData.white / explorerData.totalGames) * 100}%` }} />
                        <div className="bg-[hsl(0,0%,55%)]" style={{ width: `${(explorerData.draws / explorerData.totalGames) * 100}%` }} />
                        <div className="bg-[hsl(220,15%,22%)]" style={{ width: `${(explorerData.black / explorerData.totalGames) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                        <span>White {((explorerData.white / explorerData.totalGames) * 100).toFixed(0)}%</span>
                        <span>Draw {((explorerData.draws / explorerData.totalGames) * 100).toFixed(0)}%</span>
                        <span>Black {((explorerData.black / explorerData.totalGames) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Move table */}
                  <div className="space-y-0">
                    <div className="grid grid-cols-[50px_1fr_42px_42px_42px_52px] gap-0 text-[9px] text-muted-foreground px-1 pb-1 border-b border-border uppercase tracking-wider">
                      <span>Move</span><span>Bar</span>
                      <span className="text-center">W%</span><span className="text-center">D%</span><span className="text-center">L%</span>
                      <span className="text-right">Games</span>
                    </div>
                    {explorerData.moves.sort((a, b) => b.games - a.games).map((mv) => (
                      <button key={mv.san} onClick={() => playExplorerMove(mv.san)}
                        className="w-full grid grid-cols-[50px_1fr_42px_42px_42px_52px] gap-0 text-xs px-1 py-1.5 rounded hover:bg-primary/10 transition-colors text-left border-b border-border/10">
                        <span className="font-bold text-foreground">{mv.san}</span>
                        <div className="flex items-center pr-2">
                          <div className="flex h-2.5 w-full rounded-full overflow-hidden">
                            <div className="bg-[hsl(0,0%,92%)]" style={{ width: `${mv.winRate}%` }} />
                            <div className="bg-[hsl(0,0%,55%)]" style={{ width: `${mv.drawRate}%` }} />
                            <div className="bg-[hsl(220,15%,22%)]" style={{ width: `${mv.lossRate}%` }} />
                          </div>
                        </div>
                        <span className="text-center text-foreground/90">{mv.winRate.toFixed(0)}</span>
                        <span className="text-center text-muted-foreground">{mv.drawRate.toFixed(0)}</span>
                        <span className="text-center text-muted-foreground/70">{mv.lossRate.toFixed(0)}</span>
                        <span className="text-right text-muted-foreground">{formatGames(mv.games)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Top games */}
                  {explorerData.topGames && explorerData.topGames.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Trophy className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Games</span>
                      </div>
                      {explorerData.topGames.map((g, i) => (
                        <a key={i} href={`https://lichess.org/${g.id}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between text-[10px] py-0.5 hover:text-primary transition-colors">
                          <span className="text-foreground/80 truncate">{g.white.name} ({g.white.rating}) vs {g.black.name} ({g.black.rating})</span>
                          <span className="text-muted-foreground ml-2 shrink-0">
                            {g.winner === "white" ? "1-0" : g.winner === "black" ? "0-1" : "½-½"} · {g.year}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-muted-foreground py-2">Out of book — Stockfish is your guide.</div>
              )}
            </div>

            {/* Move History */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Moves</span>
              </div>
              <ScrollArea className="max-h-40">
                <div className="flex flex-wrap gap-0.5">
                  <button onClick={() => goTo(0)}
                    className={`text-xs px-1.5 py-0.5 rounded transition-colors ${viewIndex === 0 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    Start
                  </button>
                  {history.map((h, i) => {
                    const isWhiteMove = i % 2 === 0;
                    const moveNum = Math.floor(i / 2) + 1;
                    return (
                      <button key={i} onClick={() => goTo(i + 1)}
                        className={`text-xs px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 ${viewIndex === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                        {isWhiteMove && <span className="text-muted-foreground">{moveNum}.</span>}
                        <span>{h.san}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
