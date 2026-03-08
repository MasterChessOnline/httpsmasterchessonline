import { useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/premium-tiers";
import { useStockfish } from "@/hooks/use-stockfish";
import EvaluationBar from "@/components/EvaluationBar";
import EngineLines from "@/components/EngineLines";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, RotateCcw, FlipVertical, Crown, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const FREE_DEPTH = 12;
const PREMIUM_DEPTH = 22;

const Analyse = () => {
  const { isPremium, subscriptionTier } = useAuth();
  const { toast } = useToast();

  const maxDepth = isPremium ? PREMIUM_DEPTH : FREE_DEPTH;

  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [fenInput, setFenInput] = useState("");
  const [pgnInput, setPgnInput] = useState("");
  const [history, setHistory] = useState<string[]>([START_FEN]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [engineOn, setEngineOn] = useState(true);

  const currentFen = history[historyIndex];
  const turn = currentFen.split(" ")[1] as "w" | "b";

  const { lines, bestMove, isSearching, currentDepth, stop } = useStockfish({
    fen: currentFen,
    enabled: engineOn,
    depth: maxDepth,
    multiPv: 3,
  });

  // Eval from white's perspective
  const evalScore = lines[0]?.score ?? 0;
  const evalMate = lines[0]?.mate ?? null;

  const makeMove = useCallback(
    (from: string, to: string) => {
      const gameCopy = new Chess(currentFen);
      const move = gameCopy.move({ from, to, promotion: "q" });
      if (!move) return false;

      // Trim future history if we branched
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(gameCopy.fen());
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setGame(gameCopy);
      return true;
    },
    [currentFen, history, historyIndex]
  );

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare) return false;
      return makeMove(sourceSquare, targetSquare);
    },
    [makeMove]
  );

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGame(new Chess(history[historyIndex - 1]));
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGame(new Chess(history[historyIndex + 1]));
    }
  };

  const resetBoard = () => {
    setGame(new Chess());
    setHistory([START_FEN]);
    setHistoryIndex(0);
    setFenInput("");
    setPgnInput("");
  };

  const loadFen = () => {
    const trimmed = fenInput.trim();
    if (!trimmed) return;
    try {
      const g = new Chess(trimmed);
      setGame(g);
      setHistory([g.fen()]);
      setHistoryIndex(0);
      toast({ title: "FEN loaded" });
    } catch {
      toast({ title: "Invalid FEN", variant: "destructive" });
    }
  };

  const loadPgn = () => {
    const trimmed = pgnInput.trim();
    if (!trimmed) return;
    try {
      const g = new Chess();
      g.loadPgn(trimmed);
      // Build history from moves
      const moves = g.history();
      const g2 = new Chess();
      const fens = [g2.fen()];
      for (const m of moves) {
        g2.move(m);
        fens.push(g2.fen());
      }
      setHistory(fens);
      setHistoryIndex(fens.length - 1);
      setGame(new Chess(fens[fens.length - 1]));
      toast({ title: "PGN loaded", description: `${moves.length} moves` });
    } catch {
      toast({ title: "Invalid PGN", variant: "destructive" });
    }
  };

  const flipBoard = () => setOrientation((o) => (o === "white" ? "black" : "white"));

  // Highlight best move
  const customArrows: [string, string][] = useMemo(() => {
    if (!bestMove || bestMove === "(none)") return [];
    const from = bestMove.slice(0, 2);
    const to = bestMove.slice(2, 4);
    return [[from, to]];
  }, [bestMove]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Analysis Board</h1>
          <p className="text-muted-foreground text-sm">
            {isPremium
              ? `Full engine analysis · Depth ${PREMIUM_DEPTH}`
              : `Free analysis · Depth ${FREE_DEPTH}`}
            {!isPremium && (
              <a href="/premium" className="ml-2 text-primary hover:underline inline-flex items-center gap-1">
                <Crown className="h-3 w-3" /> Upgrade for full depth
              </a>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 max-w-5xl mx-auto">
          {/* Board + Eval Bar */}
          <div className="flex gap-2">
            <EvaluationBar score={evalScore} mate={evalMate} orientation={orientation} />
            <div className="w-[min(480px,calc(100vw-80px))] aspect-square">
              <Chessboard
                options={{
                  position: currentFen,
                  onPieceDrop: onDrop as any,
                  boardOrientation: orientation,
                  boardStyle: {
                    borderRadius: "4px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  },
                  darkSquareStyle: { backgroundColor: "hsl(25 35% 30%)" },
                  lightSquareStyle: { backgroundColor: "hsl(33 40% 60%)" },
                  arrows: customArrows.map(([s, e]) => ({ startSquare: s, endSquare: e, color: "rgba(255,170,0,0.7)" })),
                  animationDurationInMs: 150,
                }}
              />
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goBack} disabled={historyIndex === 0}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goForward} disabled={historyIndex === history.length - 1}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={flipBoard}>
                <FlipVertical className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={resetBoard}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant={engineOn ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (engineOn) stop();
                  setEngineOn(!engineOn);
                }}
                className="ml-auto"
              >
                {engineOn ? <Square className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                {engineOn ? "Stop" : "Start"}
              </Button>
            </div>

            {/* Engine Lines */}
            <EngineLines lines={lines} currentDepth={currentDepth} isSearching={isSearching} turn={turn} />

            {/* Move list */}
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Position {historyIndex + 1} / {history.length}
              </p>
              <p className="text-xs font-mono text-foreground/70 break-all">{currentFen}</p>
            </div>

            {/* FEN input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Load FEN</label>
              <div className="flex gap-2">
                <Input
                  value={fenInput}
                  onChange={(e) => setFenInput(e.target.value)}
                  placeholder="Paste FEN string…"
                  className="text-xs font-mono"
                />
                <Button size="sm" onClick={loadFen}>
                  Load
                </Button>
              </div>
            </div>

            {/* PGN input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Load PGN</label>
              <Textarea
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="Paste PGN here…"
                className="text-xs font-mono min-h-[60px]"
              />
              <Button size="sm" onClick={loadPgn}>
                Load PGN
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analyse;
