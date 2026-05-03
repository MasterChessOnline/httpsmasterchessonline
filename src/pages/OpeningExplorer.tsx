import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine } from "@/lib/stockfish-engine";
import { fetchMasterChessExplorer, MasterMove, MasterExplorerData } from "@/lib/masterchess-db";
import { OPENINGS_DATABASE } from "@/lib/openings-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain, BookOpen, RotateCcw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Zap, Star, BarChart3, FlipVertical,
  Globe, Database, Trophy, Loader2, Swords, Shield, Play, Search, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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
  const [styleFilter, setStyleFilter] = useState<"all" | "aggressive" | "defensive" | "beginner" | "high-winrate">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Stockfish state
  const [engineReady, setEngineReady] = useState(false);
  const [engineLines, setEngineLines] = useState<EngineLineInfo[]>([]);
  const [engineEval, setEngineEval] = useState<{ cp: number; mate: number | null }>({ cp: 0, mate: null });
  const [analyzing, setAnalyzing] = useState(false);
  const [bestMoveUci, setBestMoveUci] = useState("");

  // MasterChess explorer state
  const [explorerData, setExplorerData] = useState<MasterExplorerData | null>(null);
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

  // Fetch MasterChess DB data when position changes
  useEffect(() => {
    setExplorerLoading(true);
    const data = fetchMasterChessExplorer(currentFen);
    setExplorerData(data);
    setExplorerLoading(false);
  }, [currentFen]);

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
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Opening Explorer</h1>
            {explorerData?.opening && (
              <Badge variant="outline">{explorerData.opening.eco} · {explorerData.opening.name}</Badge>
            )}
            {analyzing && <Brain className="w-4 h-4 text-primary animate-pulse" />}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px]">MasterChess DB</Badge>
            <Link to="/play">
              <Button size="sm" className="gap-1.5">
                <Play className="w-4 h-4" /> Play this Opening
              </Button>
            </Link>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search openings..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex gap-1">
            {([
              { key: "all", label: "All", icon: Globe },
              { key: "aggressive", label: "Aggressive", icon: Swords },
              { key: "defensive", label: "Defensive", icon: Shield },
              { key: "beginner", label: "Beginner", icon: Star },
              { key: "high-winrate", label: "High Win%", icon: Trophy },
            ] as const).map(f => (
              <button key={f.key} onClick={() => setStyleFilter(f.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${styleFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border"}`}>
                <f.icon className="w-3 h-3" /> {f.label}
              </button>
            ))}
          </div>
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

            {/* MasterChess DB Explorer */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">MasterChess Database</span>
                </div>
                <Badge variant="secondary" className="text-[9px]">Local · Curated</Badge>
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
                      {explorerData.topGames.map((g, i) => {
                        const href = g.source === "masters"
                          ? `https://database.chessbase.com/?lang=en#pgn|${encodeURIComponent(history.map(h => h.san).join(" "))}`
                          : `https://lichess.org/${g.id}`;
                        return (
                          <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between text-[10px] py-0.5 hover:text-primary transition-colors gap-2">
                            <span className="text-foreground/80 truncate flex-1">
                              <span className="font-semibold">{g.white.name}</span> ({g.white.rating}) <span className="text-muted-foreground">vs</span> <span className="font-semibold">{g.black.name}</span> ({g.black.rating})
                            </span>
                            <span className="text-muted-foreground shrink-0 inline-flex items-center gap-1">
                              {g.winner === "white" ? "1-0" : g.winner === "black" ? "0-1" : "½-½"}
                              <Calendar className="w-2.5 h-2.5" />{g.year}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-muted-foreground py-2">Out of book — Stockfish is your guide.</div>
              )}
            </div>

            {/* Player Search (Lichess + Chess.com) */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Player Search</span>
                <span className="text-[10px] text-muted-foreground">Lichess + Chess.com</span>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  value={playerQuery}
                  onChange={(e) => setPlayerQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") searchPlayer(); }}
                  placeholder="username (e.g. MagnusCarlsen, DrNykterstein)"
                  className="flex-1 px-2.5 py-1 rounded-md bg-muted/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="sm" onClick={searchPlayer} disabled={playerLoading} className="h-7 px-3 text-xs">
                  {playerLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
                </Button>
              </div>
              {playerResults.length === 0 && !playerLoading && (
                <div className="text-[11px] text-muted-foreground">Enter a Lichess or Chess.com username to view ratings, recent games, and PGNs.</div>
              )}
              {playerResults.map((p) => (
                <div key={p.source} className="mb-2 pb-2 border-b border-border/40 last:border-b-0 last:pb-0 last:mb-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary inline-flex items-center gap-1">
                      {p.title && <Badge variant="secondary" className="text-[9px] px-1 py-0 mr-1">{p.title}</Badge>}
                      {p.username}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] uppercase text-muted-foreground">{p.source}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {p.ratings.bullet && <Badge variant="outline" className="text-[9px]">Bullet {p.ratings.bullet}</Badge>}
                    {p.ratings.blitz && <Badge variant="outline" className="text-[9px]">Blitz {p.ratings.blitz}</Badge>}
                    {p.ratings.rapid && <Badge variant="outline" className="text-[9px]">Rapid {p.ratings.rapid}</Badge>}
                    {p.ratings.classical && <Badge variant="outline" className="text-[9px]">Classical {p.ratings.classical}</Badge>}
                  </div>
                  {p.recentGames.slice(0, 5).map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-[10px] py-0.5">
                      <a href={g.url} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary truncate flex-1">
                        vs {g.opponent} <span className="text-muted-foreground">({g.timeControl})</span>
                      </a>
                      <span className={`shrink-0 ml-2 font-semibold ${g.result === "Win" ? "text-green-400" : g.result === "Loss" ? "text-red-400" : "text-muted-foreground"}`}>
                        {g.result}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

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
