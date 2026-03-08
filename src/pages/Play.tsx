import { useState, useEffect, useRef, useCallback } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RotateCcw, Bot, Users, Crown, Timer } from "lucide-react";
import { getAIMove, Difficulty, AI_LEVELS } from "@/lib/chess-ai";
import ChessClock, { TIME_CONTROLS } from "@/components/ChessClock";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

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
  const [timeoutWinner, setTimeoutWinner] = useState<string | null>(null);
  const gameRef = useRef(new Chess());

  // Time control state
  const [timeControlIdx, setTimeControlIdx] = useState(4); // default unlimited
  const timeControl = TIME_CONTROLS[timeControlIdx];
  const unlimited = timeControl.seconds === 0;
  const [whiteTime, setWhiteTime] = useState(timeControl.seconds);
  const [blackTime, setBlackTime] = useState(timeControl.seconds);
  const [gameStarted, setGameStarted] = useState(false);

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!timeoutWinner;

  const updateState = () => {
    setFen(game.fen());
  };

  const aiColor = playerColor === "w" ? "b" : "w";
  const currentLevel = AI_LEVELS.find((l) => l.value === difficulty)!;

  const handleTimeOut = useCallback((color: "w" | "b") => {
    setTimeoutWinner(color === "w" ? "Black" : "White");
  }, []);

  // AI plays its color
  useEffect(() => {
    if (mode !== "ai") return;
    if (game.turn() !== aiColor) return;
    if (isGameOver) return;

    setAiThinking(true);
    const thinkTime = currentLevel.depth >= 4 ? 800 : currentLevel.depth >= 3 ? 500 : 300;
    const timeout = setTimeout(() => {
      const aiMoveStr = getAIMove(game, difficulty);
      if (aiMoveStr) {
        const move = game.move(aiMoveStr);
        if (move) {
          setMoveHistory((prev) => [...prev, move.san]);
          setLastMove({ from: move.from, to: move.to });
          setGameStarted(true);
          // Add increment for AI's move
          if (!unlimited && timeControl.increment > 0) {
            if (aiColor === "w") {
              setWhiteTime((prev: number) => prev + timeControl.increment);
            } else {
              setBlackTime((prev: number) => prev + timeControl.increment);
            }
          }
          updateState();
        }
      }
      setAiThinking(false);
    }, thinkTime);

    return () => clearTimeout(timeout);
  }, [fen, mode, difficulty, aiColor, isGameOver]);

  const handleSquareClick = (square: Square) => {
    if (isGameOver) return;
    if (mode === "ai" && game.turn() === aiColor) return;

    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        const movedColor = move.color; // color that just moved
        setMoveHistory((prev) => [...prev, move.san]);
        setLastMove({ from: move.from, to: move.to });
        setGameStarted(true);
        // Add increment for player's move
        if (!unlimited && timeControl.increment > 0) {
          if (movedColor === "w") {
            setWhiteTime((prev: number) => prev + timeControl.increment);
          } else {
            setBlackTime((prev: number) => prev + timeControl.increment);
          }
        }
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
    setTimeoutWinner(null);
    setGameStarted(false);
    setWhiteTime(TIME_CONTROLS[timeControlIdx].seconds);
    setBlackTime(TIME_CONTROLS[timeControlIdx].seconds);
    if (newMode) setMode(newMode);
  };

  const changeTimeControl = (idx: number) => {
    setTimeControlIdx(idx);
    setWhiteTime(TIME_CONTROLS[idx].seconds);
    setBlackTime(TIME_CONTROLS[idx].seconds);
    setTimeoutWinner(null);
    setGameStarted(false);
    // Reset game when changing time
    gameRef.current = new Chess();
    setFen("start");
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setAiThinking(false);
  };

  const boardFlipped = playerColor === "b";
  const displayFiles = boardFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = boardFlipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();

  const statusText = timeoutWinner
    ? `${timeoutWinner} wins on time!`
    : game.isCheckmate()
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

  const activeClockColor = isGameOver || !gameStarted ? null : game.turn();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          Play <span className="text-gradient-gold">Chess</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {mode === "ai"
            ? `You (${playerColor === "w" ? "White" : "Black"}) vs ${currentLevel.label} (${currentLevel.rating} Elo)`
            : "Two players on the same board"}
        </p>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          {/* Board + Clock */}
          <div className="w-full max-w-[min(90vw,480px)] space-y-2">
            {/* Clock above board */}
            <ChessClock
              whiteTime={whiteTime}
              blackTime={blackTime}
              activeColor={activeClockColor}
              isGameOver={isGameOver}
              onTimeOut={handleTimeOut}
              setWhiteTime={setWhiteTime}
              setBlackTime={setBlackTime}
              unlimited={unlimited}
            />

            <div role="grid" aria-label="Chess board">
              {displayRanks.map((rank) => (
                <div key={rank} className="flex" role="row">
                  {displayFiles.map((file) => {
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
          </div>

          {/* Sidebar */}
          <div className="w-full max-w-xs space-y-4">
            {/* Mode select */}
            <div className="flex gap-2">
              <Button variant={mode === "ai" ? "default" : "outline"} className="flex-1" onClick={() => resetGame("ai")}>
                <Bot className="mr-2 h-4 w-4" /> vs Computer
              </Button>
              <Button variant={mode === "local" ? "default" : "outline"} className="flex-1" onClick={() => resetGame("local")}>
                <Users className="mr-2 h-4 w-4" /> 2 Players
              </Button>
            </div>

            {/* AI Difficulty — 5 levels */}
            {mode === "ai" && (
              <div className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Difficulty</p>
                <div className="grid grid-cols-5 gap-1">
                  {AI_LEVELS.map((lvl) => (
                    <button
                      key={lvl.value}
                      onClick={() => { setDifficulty(lvl.value); resetGame(); }}
                      className={`rounded-lg px-1 py-2 text-center transition-all border ${
                        difficulty === lvl.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                      }`}
                      aria-pressed={difficulty === lvl.value}
                    >
                      <span className="text-[10px] font-bold block">{lvl.rating}</span>
                      <span className="text-[10px] font-medium block leading-tight">{lvl.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">{currentLevel.desc}</p>
              </div>
            )}

            {/* Time Control */}
            <div className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Timer className="h-3 w-3" /> Time Control
              </p>
              <div className="flex gap-1">
                {TIME_CONTROLS.map((tc, i) => (
                  <button
                    key={tc.label}
                    onClick={() => changeTimeControl(i)}
                    className={`flex-1 rounded-lg px-1 py-2 text-center transition-all border text-xs font-medium ${
                      timeControlIdx === i
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                    }`}
                    aria-pressed={timeControlIdx === i}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker (AI mode only) */}
            {mode === "ai" && (
              <div className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Play as</p>
                <div className="flex gap-2">
                  {(["w", "b"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => { if (playerColor !== c) { setPlayerColor(c); resetGame(); } }}
                      className={`flex-1 rounded-lg px-2 py-2 text-center transition-all border ${
                        playerColor === c
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                      }`}
                      aria-pressed={playerColor === c}
                    >
                      <Crown className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs font-medium block">{c === "w" ? "White" : "Black"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="rounded-lg border border-border/50 bg-card p-4" role="status" aria-live="polite">
              <p className="font-display text-lg font-semibold text-foreground">{statusText}</p>
            </div>

            <Button onClick={() => resetGame()} variant="outline" className="w-full">
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
