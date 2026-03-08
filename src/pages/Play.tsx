import { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RotateCcw, Bot, Users, Brain, Zap, GraduationCap, Crown } from "lucide-react";
import { getAIMove, Difficulty } from "@/lib/chess-ai";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

// SVG-style piece rendering with clear black/white distinction
const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♚", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wq: { symbol: "♛", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wr: { symbol: "♜", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wb: { symbol: "♝", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wn: { symbol: "♞", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wp: { symbol: "♟", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  bk: { symbol: "♚", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bq: { symbol: "♛", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  br: { symbol: "♜", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bb: { symbol: "♝", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bn: { symbol: "♞", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bp: { symbol: "♟", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; icon: typeof Brain; desc: string }[] = [
  { value: "beginner", label: "Beginner", icon: Zap, desc: "Makes mistakes often" },
  { value: "intermediate", label: "Medium", icon: Brain, desc: "Decent tactical play" },
  { value: "advanced", label: "Hard", icon: GraduationCap, desc: "Strong positional play" },
];

type GameMode = "local" | "ai";
type PlayerColor = "w" | "b";

const Play = () => {
  const [fen, setFen] = useState("start");
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const gameRef = useRef(new Chess());

  const game = gameRef.current;

  const updateState = () => {
    setFen(game.fen());
  };

  const aiColor = playerColor === "w" ? "b" : "w";

  // AI plays its color
  useEffect(() => {
    if (mode !== "ai") return;
    if (game.turn() !== aiColor) return;
    if (game.isGameOver()) return;

    setAiThinking(true);
    const timeout = setTimeout(() => {
      const aiMoveStr = getAIMove(game, difficulty);
      if (aiMoveStr) {
        const move = game.move(aiMoveStr);
        if (move) {
          setMoveHistory((prev) => [...prev, move.san]);
          setLastMove({ from: move.from, to: move.to });
          updateState();
        }
      }
      setAiThinking(false);
    }, difficulty === "advanced" ? 600 : 300);

    return () => clearTimeout(timeout);
  }, [fen, mode, difficulty, aiColor]);

  const handleSquareClick = (square: Square) => {
    if (game.isGameOver()) return;
    if (mode === "ai" && game.turn() === aiColor) return;

    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setMoveHistory((prev) => [...prev, move.san]);
        setLastMove({ from: move.from, to: move.to });
        updateState();
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const resetGame = (newMode?: GameMode) => {
    gameRef.current = new Chess();
    setFen("start");
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setAiThinking(false);
    if (newMode) setMode(newMode);
  };

  const boardFlipped = playerColor === "b";
  const displayFiles = boardFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = boardFlipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();

  const statusText = game.isCheckmate()
    ? `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`
    : game.isDraw()
    ? "Draw!"
    : game.isStalemate()
    ? "Stalemate!"
    : game.isCheck()
    ? `${game.turn() === "w" ? "White" : "Black"} is in check!`
    : aiThinking
    ? "Computer is thinking…"
    : `${game.turn() === "w" ? "White" : "Black"} to move`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          Play <span className="text-gradient-gold">Chess</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {mode === "ai"
            ? `You play ${playerColor === "w" ? "White" : "Black"} vs Computer (${DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label})`
            : "Two players on the same board"}
        </p>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          {/* Board */}
          <div className="w-full max-w-[min(90vw,480px)]" role="grid" aria-label="Chess board">
            {displayRanks.map((rank, ri) => (
              <div key={rank} className="flex" role="row">
                {displayFiles.map((file, fi) => {
                  const square = `${file}${rank}` as Square;
                  const origRi = RANKS.indexOf(rank);
                  const origFi = FILES.indexOf(file);
                  const isLight = (origRi + origFi) % 2 === 0;
                  const piece = board[origRi][origFi];
                  const isSelected = selectedSquare === square;
                  const isLegal = legalMoves.includes(square);
                  const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
                  const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                  const pieceDisplay = pieceKey ? PIECE_DISPLAY[pieceKey] : null;

                  return (
                    <button
                      key={square}
                      role="gridcell"
                      aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                      className={`aspect-square w-[12.5%] flex items-center justify-center text-3xl sm:text-5xl select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset
                        ${isLight ? "bg-board-light" : "bg-board-dark"}
                        ${isSelected ? "ring-2 ring-primary ring-inset brightness-125" : ""}
                        ${isLastMove && !isSelected ? "brightness-110" : ""}
                        ${isLegal ? "cursor-pointer" : "cursor-default"}
                      `}
                      onClick={() => handleSquareClick(square)}
                      tabIndex={0}
                    >
                      {isLegal && !piece && (
                        <span className="block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary/40" />
                      )}
                      {isLegal && pieceDisplay && (
                        <span className={`${pieceDisplay.className} drop-shadow-[0_0_6px_hsl(var(--primary))]`}>
                          {pieceDisplay.symbol}
                        </span>
                      )}
                      {!isLegal && pieceDisplay && (
                        <span className={pieceDisplay.className}>
                          {pieceDisplay.symbol}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-full max-w-xs space-y-4">
            {/* Mode select */}
            <div className="flex gap-2">
              <Button
                variant={mode === "ai" ? "default" : "outline"}
                className="flex-1"
                onClick={() => resetGame("ai")}
                aria-label="Play vs computer"
              >
                <Bot className="mr-2 h-4 w-4" /> vs Computer
              </Button>
              <Button
                variant={mode === "local" ? "default" : "outline"}
                className="flex-1"
                onClick={() => resetGame("local")}
                aria-label="Play locally"
              >
                <Users className="mr-2 h-4 w-4" /> 2 Players
              </Button>
            </div>

            {/* Difficulty selector (AI mode only) */}
            {mode === "ai" && (
              <div className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Difficulty</p>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setDifficulty(opt.value); resetGame(); }}
                      className={`flex-1 rounded-lg px-2 py-2 text-center transition-all border ${
                        difficulty === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                      }`}
                      aria-label={`${opt.label} difficulty`}
                      aria-pressed={difficulty === opt.value}
                    >
                      <opt.icon className="h-4 w-4 mx-auto mb-1" aria-hidden="true" />
                      <span className="text-xs font-medium block">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.desc}
                </p>
              </div>
            )}

            {/* Color picker (AI mode only) */}
            {mode === "ai" && (
              <div className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Play as</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (playerColor !== "w") { setPlayerColor("w"); resetGame(); } }}
                    className={`flex-1 rounded-lg px-2 py-2 text-center transition-all border ${
                      playerColor === "w"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                    }`}
                    aria-label="Play as White"
                    aria-pressed={playerColor === "w"}
                  >
                    <Crown className="h-4 w-4 mx-auto mb-1" aria-hidden="true" />
                    <span className="text-xs font-medium block">White</span>
                  </button>
                  <button
                    onClick={() => { if (playerColor !== "b") { setPlayerColor("b"); resetGame(); } }}
                    className={`flex-1 rounded-lg px-2 py-2 text-center transition-all border ${
                      playerColor === "b"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                    }`}
                    aria-label="Play as Black"
                    aria-pressed={playerColor === "b"}
                  >
                    <Crown className="h-4 w-4 mx-auto mb-1" aria-hidden="true" />
                    <span className="text-xs font-medium block">Black</span>
                  </button>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="rounded-lg border border-border/50 bg-card p-4" role="status" aria-live="polite">
              <p className="font-display text-lg font-semibold text-foreground">{statusText}</p>
            </div>

            <Button onClick={() => resetGame()} variant="outline" className="w-full" aria-label="New game">
              <RotateCcw className="mr-2 h-4 w-4" /> New Game
            </Button>

            {/* Move history */}
            <div className="rounded-lg border border-border/50 bg-card p-4 max-h-64 overflow-y-auto">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Moves</h3>
              {moveHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground">No moves yet — White plays first</p>
              ) : (
                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
                  {moveHistory.map((move, i) =>
                    i % 2 === 0 ? (
                      <div key={i} className="contents">
                        <span className="text-muted-foreground text-xs">{Math.floor(i / 2) + 1}.</span>
                        <span className="text-foreground font-medium">{move}</span>
                        <span className="text-muted-foreground">{moveHistory[i + 1] || ""}</span>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Play;
