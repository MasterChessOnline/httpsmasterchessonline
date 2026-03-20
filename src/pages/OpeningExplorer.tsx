import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { getStockfishEngine } from "@/lib/stockfish-engine";
import { OPENINGS_DATABASE, OpeningMove } from "@/lib/openings-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain, BookOpen, RotateCcw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Zap, TrendingUp, ArrowRight,
  Star, BarChart3, Search, FlipVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

// ── Types ──────────────────────────────────────────────────────────────────────

interface BookMove {
  san: string;
  uci: string;
  frequency: number; // percentage
  winRate: number;
  drawRate: number;
  lossRate: number;
  games: number;
  openingName?: string;
  explanation?: string;
  isMainLine?: boolean;
}

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
  bookMove?: BookMove;
}

// ── Opening Book Builder ───────────────────────────────────────────────────────

// Build a lookup map from FEN → available book moves from our openings database
function buildOpeningBook(): Map<string, BookMove[]> {
  const book = new Map<string, BookMove[]>();
  const chess = new Chess();

  function walkTree(nodes: OpeningMove[], openingName: string) {
    const fen = simplifyFen(chess.fen());
    
    // Collect all moves available at this position
    const movesAtPosition: BookMove[] = [];
    
    for (const node of nodes) {
      try {
        const move = chess.move(node.san);
        if (move) {
          // Simulate stats based on main line status
          const isMain = node.isMainLine !== false;
          const freq = isMain ? 45 + Math.random() * 30 : 5 + Math.random() * 20;
          const winRate = 30 + Math.random() * 25;
          const drawRate = 20 + Math.random() * 20;
          const games = isMain ? 5000 + Math.floor(Math.random() * 50000) : 500 + Math.floor(Math.random() * 5000);
          
          movesAtPosition.push({
            san: node.san,
            uci: move.from + move.to + (move.promotion || ""),
            frequency: freq,
            winRate,
            drawRate,
            lossRate: 100 - winRate - drawRate,
            games,
            openingName,
            explanation: node.explanation,
            isMainLine: isMain,
          });
          
          // Recurse into children
          walkTree(node.children, openingName);
          chess.undo();
        }
      } catch {
        // Invalid move in this position, skip
      }
    }

    if (movesAtPosition.length > 0) {
      const existing = book.get(fen) || [];
      // Merge, avoiding duplicates
      for (const bm of movesAtPosition) {
        if (!existing.find(e => e.san === bm.san)) {
          existing.push(bm);
        }
      }
      // Normalize frequencies
      const total = existing.reduce((s, m) => s + m.frequency, 0);
      if (total > 0) {
        for (const m of existing) m.frequency = Math.round((m.frequency / total) * 100);
      }
      book.set(fen, existing);
    }
  }

  for (const opening of OPENINGS_DATABASE) {
    chess.reset();
    walkTree(opening.tree, opening.name);
  }

  return book;
}

function simplifyFen(fen: string): string {
  // Remove move counters for book lookup (keep position, turn, castling, en passant)
  return fen.split(" ").slice(0, 4).join(" ");
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

// ── Component ──────────────────────────────────────────────────────────────────

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

  // Opening book
  const openingBook = useMemo(() => buildOpeningBook(), []);
  const [bookMoves, setBookMoves] = useState<BookMove[]>([]);
  const [currentOpening, setCurrentOpening] = useState("Starting Position");

  const engineRef = useRef(getStockfishEngine());
  const abortRef = useRef(0);

  // Build a Chess instance for the current view position
  const viewGame = useMemo(() => {
    const g = new Chess();
    for (let i = 0; i < viewIndex && i < history.length; i++) {
      g.move(history[i].san);
    }
    return g;
  }, [viewIndex, history]);

  const currentFen = viewGame.fen();

  // Legal moves for selected square
  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [] as Square[];
    return viewGame.moves({ square: selectedSquare, verbose: true }).map(m => m.to as Square);
  }, [selectedSquare, viewGame]);

  // Last move
  const lastMove = useMemo(() => {
    if (viewIndex === 0) return null;
    const h = history[viewIndex - 1];
    return h ? { from: h.from, to: h.to } : null;
  }, [viewIndex, history]);

  // Init engine
  useEffect(() => {
    const engine = engineRef.current;
    engine.init().then(() => {
      setEngineReady(true);
      engine.newGame();
    });
  }, []);

  // Look up book moves and run Stockfish whenever position changes
  useEffect(() => {
    const fen = currentFen;
    const simpleFen = simplifyFen(fen);
    
    // Book lookup
    const moves = openingBook.get(simpleFen) || [];
    setBookMoves(moves);

    // Detect opening name
    if (history.length > 0 && viewIndex > 0) {
      const lastBook = history.slice(0, viewIndex).reverse().find(h => h.bookMove?.openingName);
      setCurrentOpening(lastBook?.bookMove?.openingName || "Unknown Position");
    } else {
      setCurrentOpening("Starting Position");
    }

    // Stockfish analysis
    if (!engineReady) return;
    const id = ++abortRef.current;
    setAnalyzing(true);

    const engine = engineRef.current;
    engine.setMultiPV(3);
    engine.getMultiPV(fen, 3, depth[0]).then(lines => {
      if (abortRef.current !== id) return;
      setEngineLines(lines);
      if (lines.length > 0) {
        setEngineEval({ cp: lines[0].eval, mate: lines[0].mate });
        setBestMoveUci(lines[0].pv[0] || "");
      }
      setAnalyzing(false);
    });
  }, [currentFen, engineReady, depth, openingBook, history, viewIndex]);

  // Handle user move on the board
  const handleMove = useCallback((from: string, to: string) => {
    // If viewing history, truncate forward moves
    const newGame = new Chess();
    const movesToReplay = history.slice(0, viewIndex);
    for (const h of movesToReplay) {
      newGame.move(h.san);
    }

    try {
      const move = newGame.move({ from: from as Square, to: to as Square, promotion: "q" });
      if (!move) return;

      const simpleFen = simplifyFen(newGame.fen());
      const bookMove = bookMoves.find(bm => bm.san === move.san);

      const entry: HistoryEntry = {
        san: move.san,
        fen: newGame.fen(),
        from: move.from,
        to: move.to,
        bookMove,
      };

      const newHistory = [...movesToReplay, entry];
      setHistory(newHistory);
      setViewIndex(newHistory.length);
      setSelectedSquare(null);
    } catch {
      // Invalid move
    }
  }, [history, viewIndex, bookMoves]);

  // Play a book move by clicking
  const playBookMove = useCallback((san: string) => {
    const newGame = new Chess();
    const movesToReplay = history.slice(0, viewIndex);
    for (const h of movesToReplay) {
      newGame.move(h.san);
    }

    try {
      const move = newGame.move(san);
      if (!move) return;

      const simpleFen = simplifyFen(newGame.fen());
      const bookMove = bookMoves.find(bm => bm.san === san);

      const entry: HistoryEntry = {
        san: move.san,
        fen: newGame.fen(),
        from: move.from,
        to: move.to,
        bookMove,
      };

      const newHistory = [...movesToReplay, entry];
      setHistory(newHistory);
      setViewIndex(newHistory.length);
    } catch {}
  }, [history, viewIndex, bookMoves]);

  // Navigation
  const goTo = useCallback((idx: number) => {
    setViewIndex(Math.max(0, Math.min(history.length, idx)));
    setSelectedSquare(null);
  }, [history.length]);

  const reset = useCallback(() => {
    setGame(new Chess());
    setHistory([]);
    setViewIndex(0);
    setSelectedSquare(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(viewIndex - 1);
      if (e.key === "ArrowRight") goTo(viewIndex + 1);
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(history.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, viewIndex, history.length]);

  // Highlight best move squares
  const bestMoveHighlight = useMemo(() => {
    if (!bestMoveUci || bestMoveUci.length < 4) return {};
    return {
      [bestMoveUci.slice(0, 2)]: "rgba(34, 197, 94, 0.35)",
      [bestMoveUci.slice(2, 4)]: "rgba(34, 197, 94, 0.55)",
    };
  }, [bestMoveUci]);

  // Last move highlight
  const lastMoveHighlight = useMemo(() => {
    if (viewIndex === 0) return {};
    const last = history[viewIndex - 1];
    if (!last) return {};
    return {
      [last.from]: "rgba(255, 215, 0, 0.3)",
      [last.to]: "rgba(255, 215, 0, 0.4)",
    };
  }, [viewIndex, history]);

  const evalPct = evalToBarPct(engineEval.cp, engineEval.mate);
  const evalText = formatEval(engineEval.cp, engineEval.mate);
  const isWhiteTurn = currentFen.includes(" w ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Opening Explorer</h1>
          <Badge variant="outline">{currentOpening}</Badge>
          {analyzing && <Brain className="w-4 h-4 text-primary animate-pulse" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
          {/* Left: Eval Bar + Board */}
          <div className="flex gap-2">
            {/* Vertical eval bar */}
            <div className="hidden sm:flex flex-col w-8 rounded-lg overflow-hidden border border-border bg-muted/30 relative"
                 style={{ minHeight: 400 }}>
              <div className="absolute top-1 left-0 right-0 text-center text-[10px] font-bold z-10"
                   style={{ color: evalPct < 50 ? "hsl(var(--foreground))" : "hsl(var(--background))" }}>
                {engineEval.mate !== null && engineEval.mate < 0 ? evalText : !isWhiteTurn && evalPct < 50 ? evalText : ""}
              </div>
              {/* Black portion */}
              <motion.div
                className="bg-foreground"
                animate={{ height: `${100 - evalPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* White portion */}
              <motion.div
                className="bg-background flex-1"
                animate={{ height: `${evalPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold z-10"
                   style={{ color: evalPct >= 50 ? "hsl(var(--background))" : "hsl(var(--foreground))" }}>
                {engineEval.mate !== null && engineEval.mate > 0 ? evalText : isWhiteTurn && evalPct >= 50 ? evalText : ""}
              </div>
              {/* Eval number center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold bg-background/80 px-1 rounded text-foreground">
                  {evalText}
                </span>
              </div>
            </div>

            {/* Board */}
            <div className="w-full max-w-[480px]">
              <ChessBoard
                fen={currentFen}
                onMove={handleMove}
                flipped={flipped}
                selectedSquare={selectedSquare}
                onSquareClick={(sq) => setSelectedSquare(sq === selectedSquare ? null : sq as Square)}
                customSquareStyles={{ ...lastMoveHighlight, ...bestMoveHighlight }}
              />
              {/* Controls under board */}
              <div className="flex items-center justify-between mt-2 gap-1">
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => goTo(0)}><ChevronsLeft className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => goTo(viewIndex - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => goTo(viewIndex + 1)}><ChevronRight className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => goTo(history.length)}><ChevronsRight className="w-4 h-4" /></Button>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setFlipped(!flipped)}>
                    <FlipVertical className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={reset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
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
                {engineLines.length === 0 && (
                  <div className="text-xs text-muted-foreground">Analyzing...</div>
                )}
                {engineLines.map((line, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs p-1.5 rounded ${i === 0 ? "bg-primary/10" : "bg-muted/30"}`}>
                    <span className={`font-bold min-w-[48px] ${
                      (line.mate !== null ? (line.mate > 0 ? true : false) : line.eval > 0) 
                        ? "text-green-400" : "text-red-400"
                    }`}>
                      {formatEval(line.eval, line.mate)}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {line.pv.slice(0, 8).join(" ")}
                    </span>
                    {i === 0 && <Zap className="w-3 h-3 text-primary ml-auto shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Opening Book Moves */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Opening Book</span>
                {bookMoves.length > 0 && (
                  <Badge variant="outline" className="text-[10px]">{bookMoves.length} moves</Badge>
                )}
              </div>

              {bookMoves.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">
                  Out of book — Stockfish is your guide from here.
                </div>
              ) : (
                <div className="space-y-0.5">
                  {/* Header */}
                  <div className="grid grid-cols-[60px_1fr_60px_60px_60px_70px] gap-1 text-[10px] text-muted-foreground px-1 pb-1 border-b border-border">
                    <span>Move</span>
                    <span>Opening</span>
                    <span className="text-center">Win%</span>
                    <span className="text-center">Draw%</span>
                    <span className="text-center">Loss%</span>
                    <span className="text-right">Games</span>
                  </div>
                  {bookMoves
                    .sort((a, b) => b.frequency - a.frequency)
                    .map((bm, i) => (
                      <button
                        key={bm.san}
                        onClick={() => playBookMove(bm.san)}
                        className={`w-full grid grid-cols-[60px_1fr_60px_60px_60px_70px] gap-1 text-xs px-1 py-1.5 rounded hover:bg-primary/10 transition-colors text-left ${
                          i === 0 ? "bg-primary/5" : ""
                        }`}
                      >
                        <span className="font-bold text-foreground flex items-center gap-1">
                          {bm.san}
                          {bm.isMainLine && <Star className="w-2.5 h-2.5 text-primary" />}
                        </span>
                        <span className="text-muted-foreground truncate text-[10px]">
                          {bm.explanation || bm.openingName || ""}
                        </span>
                        <span className="text-center text-green-400">{bm.winRate.toFixed(0)}%</span>
                        <span className="text-center text-muted-foreground">{bm.drawRate.toFixed(0)}%</span>
                        <span className="text-center text-red-400">{bm.lossRate.toFixed(0)}%</span>
                        <span className="text-right text-muted-foreground">
                          {bm.games > 1000 ? `${(bm.games / 1000).toFixed(1)}k` : bm.games}
                        </span>
                      </button>
                    ))}
                </div>
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
                  <button
                    onClick={() => goTo(0)}
                    className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                      viewIndex === 0 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    Start
                  </button>
                  {history.map((h, i) => {
                    const isWhiteMove = i % 2 === 0;
                    const moveNum = Math.floor(i / 2) + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => goTo(i + 1)}
                        className={`text-xs px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 ${
                          viewIndex === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        {isWhiteMove && <span className="text-muted-foreground">{moveNum}.</span>}
                        <span className={h.bookMove ? "text-foreground" : "text-muted-foreground italic"}>
                          {h.san}
                        </span>
                        {h.bookMove && <BookOpen className="w-2.5 h-2.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Explanation panel */}
            {viewIndex > 0 && history[viewIndex - 1]?.bookMove?.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-primary/30 bg-primary/5 p-3"
              >
                <p className="text-sm text-foreground">
                  <strong>{history[viewIndex - 1].san}</strong>
                  {" — "}
                  {history[viewIndex - 1].bookMove!.explanation}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
