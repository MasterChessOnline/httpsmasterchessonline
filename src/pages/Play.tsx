import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import CapturedPieces from "@/components/chess/CapturedPieces";
import GameControls from "@/components/chess/GameControls";
import AnalysisPanel from "@/components/chess/AnalysisPanel";
import PromotionDialog, { type PromotionPiece } from "@/components/chess/PromotionDialog";
import ChessClock, { TIME_CONTROLS } from "@/components/ChessClock";
import { getAIMove, type Difficulty, AI_LEVELS } from "@/lib/chess-ai";
import { playChessSound } from "@/lib/chess-sounds";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Swords, TrendingUp, Trophy, Target } from "lucide-react";

type GameMode = "local" | "ai";
type PlayerColor = "w" | "b";

const Play = () => {
  const { user, profile } = useAuth();
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
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const gameRef = useRef(new Chess());

  const [timeControlIdx, setTimeControlIdx] = useState(6); // unlimited
  const timeControl = TIME_CONTROLS[timeControlIdx];
  const unlimited = timeControl.seconds === 0;
  const [whiteTime, setWhiteTime] = useState(timeControl.seconds);
  const [blackTime, setBlackTime] = useState(timeControl.seconds);
  const [gameStarted, setGameStarted] = useState(false);

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!timeoutWinner;
  const aiColor = playerColor === "w" ? "b" : "w";
  const currentLevel = AI_LEVELS.find((l) => l.value === difficulty)!;

  const updateState = () => setFen(game.fen());

  const handleTimeOut = useCallback((color: "w" | "b") => {
    setTimeoutWinner(color === "w" ? "Black" : "White");
    playChessSound("gameOver");
  }, []);

  // Generate hint
  useEffect(() => {
    if (!hintsEnabled || mode !== "ai" || game.turn() !== playerColor || isGameOver) {
      setHintSquare(null);
      return;
    }
    const timer = setTimeout(() => {
      const bestMove = getAIMove(game, "intermediate");
      if (bestMove) {
        const tempGame = new Chess(game.fen());
        const move = tempGame.move(bestMove);
        if (move) setHintSquare(move.from as Square);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [fen, hintsEnabled, mode, playerColor, isGameOver]);

  // AI plays
  useEffect(() => {
    if (mode !== "ai" || game.turn() !== aiColor || isGameOver) return;
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
          if (!unlimited && timeControl.increment > 0) {
            if (aiColor === "w") setWhiteTime((p) => p + timeControl.increment);
            else setBlackTime((p) => p + timeControl.increment);
          }
          updateState();
          if (game.isCheckmate() || game.isDraw() || game.isStalemate()) playChessSound("gameOver");
          else if (game.isCheck()) playChessSound("check");
          else if (move.captured) playChessSound("capture");
          else playChessSound("move");
        }
      }
      setAiThinking(false);
    }, thinkTime);
    return () => clearTimeout(timeout);
  }, [fen, mode, difficulty, aiColor, isGameOver]);

  const handleSquareClick = (square: Square) => {
    if (isGameOver) return;
    if (mode === "ai" && game.turn() === aiColor) return;
    setHintSquare(null);

    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setMoveHistory((prev) => [...prev, move.san]);
        setLastMove({ from: move.from, to: move.to });
        setGameStarted(true);
        if (!unlimited && timeControl.increment > 0) {
          if (move.color === "w") setWhiteTime((p) => p + timeControl.increment);
          else setBlackTime((p) => p + timeControl.increment);
        }
        updateState();
        if (game.isCheckmate() || game.isDraw() || game.isStalemate()) playChessSound("gameOver");
        else if (game.isCheck()) playChessSound("check");
        else if (move.captured) playChessSound("capture");
        else playChessSound("move");
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map((m) => m.to as Square));
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
    setHintSquare(null);
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
    gameRef.current = new Chess();
    setFen("start");
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setAiThinking(false);
    setHintSquare(null);
  };

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    resetGame();
  };

  const changeColor = (c: PlayerColor) => {
    if (playerColor !== c) {
      setPlayerColor(c);
      resetGame();
    }
  };

  const boardFlipped = playerColor === "b";
  const isPlayerTurn = mode === "ai" ? game.turn() === playerColor : true;

  const statusText = timeoutWinner
    ? `${timeoutWinner} wins on time!`
    : game.isCheckmate()
    ? `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`
    : game.isDraw() ? "Draw!"
    : game.isStalemate() ? "Stalemate!"
    : game.isCheck()
    ? `${game.turn() === "w" ? "White" : "Black"} is in check!`
    : aiThinking ? "DailyChess_12 is thinking…"
    : `${game.turn() === "w" ? "White" : "Black"} to move`;

  const activeClockColor = isGameOver || !gameStarted ? null : game.turn();

  const gameResult = game.isCheckmate()
    ? (game.turn() === "w" ? "0-1" : "1-0")
    : game.isDraw() || game.isStalemate() ? "1/2-1/2"
    : timeoutWinner === "White" ? "1-0"
    : timeoutWinner === "Black" ? "0-1"
    : null;

  const pgn = game.pgn();

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3 text-xs">
            <Swords className="w-3 h-3 mr-1" /> Play Chess
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {mode === "ai" ? (
              <>
                You vs <span className="text-gradient-gold">DailyChess_12 Bot</span>
                <span className="text-lg ml-2 text-muted-foreground">({currentLevel.rating} Elo)</span>
              </>
            ) : (
              <>Play <span className="text-gradient-gold">Local</span></>
            )}
          </h1>
        </div>

        {/* Stats bar */}
        {profile && (
          <div className="flex justify-center gap-4 mb-6">
            {[
              { icon: TrendingUp, label: "Rating", value: profile.rating },
              { icon: Trophy, label: "Wins", value: profile.games_won },
              { icon: Target, label: "Games", value: profile.games_played },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/30">
                <s.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-xs font-bold text-foreground font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
          {/* Board column */}
          <div className="w-full max-w-[min(85vw,520px)] space-y-1.5">
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

            <CapturedPieces game={game} color={boardFlipped ? "w" : "b"} />

            <ChessBoard
              game={game}
              flipped={boardFlipped}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isGameOver={isGameOver}
              isPlayerTurn={isPlayerTurn}
              hintSquare={hintSquare}
              onSquareClick={handleSquareClick}
            />

            <CapturedPieces game={game} color={boardFlipped ? "b" : "w"} />
          </div>

          {/* Controls column */}
          <div className="w-full lg:max-w-xs space-y-3">
            <GameControls
              mode={mode}
              difficulty={difficulty}
              playerColor={playerColor}
              timeControlIdx={timeControlIdx}
              statusText={statusText}
              moveHistory={moveHistory}
              isGameOver={isGameOver}
              hintsEnabled={hintsEnabled}
              onModeChange={(m) => resetGame(m)}
              onDifficultyChange={changeDifficulty}
              onColorChange={changeColor}
              onTimeControlChange={changeTimeControl}
              onNewGame={() => resetGame()}
              onToggleHints={() => setHintsEnabled(!hintsEnabled)}
            />

            {/* Post-game analysis */}
            {isGameOver && gameResult && pgn && mode === "ai" && (
              <AnalysisPanel pgn={pgn} playerColor={playerColor} result={gameResult} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Play;
