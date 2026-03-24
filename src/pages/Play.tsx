import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import CapturedPieces from "@/components/chess/CapturedPieces";
import GameControls from "@/components/chess/GameControls";
import AnalysisPanel from "@/components/chess/AnalysisPanel";
import GameSummary from "@/components/chess/GameSummary";
import PromotionDialog, { type PromotionPiece } from "@/components/chess/PromotionDialog";
import ChessClock, { TIME_CONTROLS } from "@/components/ChessClock";
import { getAIMove, evaluateBoard, type Difficulty, AI_LEVELS } from "@/lib/chess-ai";
import { playChessSound } from "@/lib/chess-sounds";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Swords, TrendingUp, Trophy, Target, BookOpen, Monitor, MonitorOff, Keyboard, MessageCircle } from "lucide-react";
import { BOT_PROFILES, getRandomBot, type BotProfile } from "@/lib/bot-profiles";
import { motion, AnimatePresence } from "framer-motion";

type GameMode = "local" | "ai";
type PlayerColor = "w" | "b";

// Lesson recommendations based on game phase of mistakes
const PHASE_RECOMMENDATIONS = [
  { phase: "opening", label: "Opening Fundamentals", desc: "Review key opening principles and common setups", link: "/learn" },
  { phase: "middlegame", label: "Middlegame Strategy", desc: "Improve your tactical vision and planning", link: "/learn" },
  { phase: "endgame", label: "Endgame Techniques", desc: "Master essential endgame patterns", link: "/learn" },
];

function getGamePhase(moveNumber: number, totalMoves: number): string {
  const ratio = moveNumber / Math.max(totalMoves, 1);
  if (ratio < 0.3) return "opening";
  if (ratio < 0.7) return "middlegame";
  return "endgame";
}

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
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [resignedBy, setResignedBy] = useState<"w" | "b" | null>(null);
  const [drawAgreed, setDrawAgreed] = useState(false);
  const [drawReason, setDrawReason] = useState<string>("");
  const [streamerMode, setStreamerMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentBot, setCurrentBot] = useState<BotProfile>(() => getRandomBot("beginner"));
  const [botMessage, setBotMessage] = useState<string>("");
  const [drawOfferPending, setDrawOfferPending] = useState(false);
  const [drawDeclined, setDrawDeclined] = useState(false);
  const gameRef = useRef(new Chess());
  const positionHistory = useRef<string[]>([]);

  const [timeControlIdx, setTimeControlIdx] = useState(6); // unlimited
  const timeControl = TIME_CONTROLS[timeControlIdx];
  const unlimited = timeControl.seconds === 0;
  const [whiteTime, setWhiteTime] = useState(timeControl.seconds);
  const [blackTime, setBlackTime] = useState(timeControl.seconds);
  const [gameStarted, setGameStarted] = useState(false);

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!timeoutWinner || !!resignedBy || drawAgreed;
  const aiColor = playerColor === "w" ? "b" : "w";

  const updateState = () => setFen(game.fen());

  // Show bot greeting on mount/bot change
  useEffect(() => {
    if (mode === "ai") {
      showBotMessage(currentBot.taunts.greeting);
    }
  }, [currentBot.id, mode]);

  const showBotMessage = (msg: string) => {
    setBotMessage(msg);
    setTimeout(() => setBotMessage(""), 4000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case "r": if (!isGameOver && moveHistory.length > 0) handleResign(); break;
        case "d": if (!isGameOver && moveHistory.length >= 2) handleOfferDraw(); break;
        case "f": setStreamerMode(prev => !prev); break;
        case "n": resetGame(); break;
        case "?": setShowShortcuts(prev => !prev); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isGameOver, moveHistory.length]);

  // Get position key for repetition tracking (FEN without move counters)
  const getPositionKey = () => {
    const parts = game.fen().split(" ");
    return parts.slice(0, 4).join(" ");
  };

  // Check all draw conditions
  const checkDrawConditions = (): { isDraw: boolean; reason: string } => {
    // Threefold repetition
    const posKey = getPositionKey();
    const count = positionHistory.current.filter(p => p === posKey).length;
    if (count >= 3) return { isDraw: true, reason: "Remis trostrukim ponavljanjem pozicije" };

    // Fifty-move rule (chess.js tracks half-move clock)
    const halfMoves = parseInt(game.fen().split(" ")[4]);
    if (halfMoves >= 100) return { isDraw: true, reason: "Remis pravilom 50 poteza" };

    // Insufficient material
    if (game.isInsufficientMaterial()) return { isDraw: true, reason: "Remis — nedovoljno materijala" };

    // Stalemate
    if (game.isStalemate()) return { isDraw: true, reason: "Pat — remis!" };

    // Other draw
    if (game.isDraw()) return { isDraw: true, reason: "Remis!" };

    return { isDraw: false, reason: "" };
  };

  const trackPosition = () => {
    const posKey = getPositionKey();
    positionHistory.current.push(posKey);
    
    const drawCheck = checkDrawConditions();
    if (drawCheck.isDraw) {
      setDrawAgreed(true);
      setDrawReason(drawCheck.reason);
      playChessSound("gameOver");
      if (mode === "ai") showBotMessage(currentBot.taunts.onDraw);
    }
  };

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
    const thinkTime = currentBot.rating >= 1600 ? 1000 : currentBot.rating >= 1000 ? 600 : 400;
    const timeout = setTimeout(() => {
      const aiMoveStr = getAIMove(game, difficulty);
      if (aiMoveStr) {
        const move = game.move(aiMoveStr);
        if (move) {
          setMoveHistory((prev) => [...prev, move.san]);
          setLastMove({ from: move.from, to: move.to });
          setGameStarted(true);
          trackPosition();
          if (!unlimited && timeControl.increment > 0) {
            if (aiColor === "w") setWhiteTime((p) => p + timeControl.increment);
            else setBlackTime((p) => p + timeControl.increment);
          }
          updateState();

          // Bot reactions
          if (game.isCheckmate()) {
            playChessSound("gameOver");
            showBotMessage(currentBot.taunts.onWin);
          } else if (game.isCheck()) {
            playChessSound("check");
            showBotMessage(currentBot.taunts.onCheck);
          } else if (move.captured) {
            playChessSound("capture");
            if (Math.random() < 0.3) showBotMessage(currentBot.taunts.onCapture);
          } else {
            playChessSound("move");
          }
        }
      }
      setAiThinking(false);
    }, thinkTime);
    return () => clearTimeout(timeout);
  }, [fen, mode, difficulty, aiColor, isGameOver]);

  const isPromotionMove = (from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (!piece || piece.type !== "p") return false;
    const toRank = parseInt(to[1]);
    return (piece.color === "w" && toRank === 8) || (piece.color === "b" && toRank === 1);
  };

  const executeMove = (from: Square, to: Square, promotion: PromotionPiece = "q") => {
    const move = game.move({ from, to, promotion });
    if (move) {
      setMoveHistory((prev) => [...prev, move.san]);
      setLastMove({ from: move.from, to: move.to });
      setGameStarted(true);
      trackPosition();
      if (!unlimited && timeControl.increment > 0) {
        if (move.color === "w") setWhiteTime((p) => p + timeControl.increment);
        else setBlackTime((p) => p + timeControl.increment);
      }
      updateState();

      if (game.isCheckmate()) {
        playChessSound("gameOver");
        if (mode === "ai") showBotMessage(currentBot.taunts.onLose);
      } else if (game.isCheck()) {
        playChessSound("check");
      } else if (move.captured) {
        playChessSound("capture");
      } else {
        playChessSound("move");
      }
    }
    setSelectedSquare(null);
    setLegalMoves([]);
    setDrawOfferPending(false);
    setDrawDeclined(false);
  };

  const handlePromotionSelect = (piece: PromotionPiece) => {
    if (!pendingPromotion) return;
    executeMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
  };

  const handleSquareClick = (square: Square) => {
    if (isGameOver || pendingPromotion) return;
    if (mode === "ai" && game.turn() === aiColor) return;
    setHintSquare(null);

    if (selectedSquare && legalMoves.includes(square)) {
      if (isPromotionMove(selectedSquare, square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }
      executeMove(selectedSquare, square);
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

  const handleResign = () => {
    if (isGameOver || moveHistory.length === 0) return;
    if (mode === "ai") {
      setResignedBy(playerColor);
      showBotMessage(currentBot.taunts.onWin);
    } else {
      setResignedBy(game.turn());
    }
    playChessSound("gameOver");
  };

  const handleOfferDraw = () => {
    if (isGameOver || moveHistory.length < 2 || drawOfferPending) return;

    if (mode === "ai") {
      setDrawOfferPending(true);
      // AI decides based on evaluation and bot personality
      setTimeout(() => {
        const eval_ = evaluateBoard(game);
        const aiAdvantage = aiColor === "w" ? eval_ : -eval_;
        const movesPlayed = moveHistory.length;
        
        // Bot accepts draw if:
        // 1. Position is roughly equal (within ±100 centipawns)
        // 2. OR enough moves have been played past the bot's threshold
        // 3. AND the bot isn't significantly winning
        const isEqual = Math.abs(eval_) < 100;
        const longGame = movesPlayed >= currentBot.drawAcceptThreshold;
        const botWinning = aiAdvantage > 200;

        if ((isEqual || longGame) && !botWinning) {
          setDrawAgreed(true);
          setDrawReason("Remis dogovorom");
          showBotMessage(currentBot.taunts.onDrawOffer);
          playChessSound("gameOver");
        } else {
          setDrawDeclined(true);
          showBotMessage(currentBot.taunts.onDrawDecline);
          setTimeout(() => setDrawOfferPending(false), 2000);
        }
      }, 1500);
    } else {
      setDrawAgreed(true);
      setDrawReason("Remis dogovorom");
      playChessSound("gameOver");
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
    setPendingPromotion(null);
    setResignedBy(null);
    setDrawAgreed(false);
    setDrawReason("");
    setDrawOfferPending(false);
    setDrawDeclined(false);
    positionHistory.current = [];
    setWhiteTime(TIME_CONTROLS[timeControlIdx].seconds);
    setBlackTime(TIME_CONTROLS[timeControlIdx].seconds);
    if (newMode) setMode(newMode);
    // Pick a new random bot
    setCurrentBot(getRandomBot(difficulty));
  };

  const changeTimeControl = (idx: number) => {
    setTimeControlIdx(idx);
    setWhiteTime(TIME_CONTROLS[idx].seconds);
    setBlackTime(TIME_CONTROLS[idx].seconds);
    setTimeoutWinner(null);
    setGameStarted(false);
    setResignedBy(null);
    setDrawAgreed(false);
    setDrawReason("");
    setDrawOfferPending(false);
    setDrawDeclined(false);
    positionHistory.current = [];
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
    setCurrentBot(getRandomBot(d));
    resetGame();
  };

  const changeColor = (c: PlayerColor) => {
    if (playerColor !== c) {
      setPlayerColor(c);
      resetGame();
    }
  };

  const selectBot = (bot: BotProfile) => {
    setCurrentBot(bot);
    setDifficulty(bot.difficulty);
    resetGame();
  };

  const boardFlipped = playerColor === "b";
  const isPlayerTurn = mode === "ai" ? game.turn() === playerColor : true;

  const statusText = resignedBy
    ? `${resignedBy === "w" ? "Beli" : "Crni"} je predao! ${resignedBy === "w" ? "Crni" : "Beli"} pobeđuje!`
    : drawAgreed
    ? drawReason || "Remis!"
    : drawOfferPending
    ? (drawDeclined ? "Ponuda za remi odbijena!" : "Čekanje odgovora na ponudu za remi...")
    : timeoutWinner
    ? `${timeoutWinner} pobeđuje na vreme!`
    : game.isCheckmate()
    ? `Šah-mat! ${game.turn() === "w" ? "Crni" : "Beli"} pobeđuje!`
    : game.isStalemate() ? "Pat — Remis!"
    : game.isDraw() ? "Remis!"
    : game.isCheck()
    ? `${game.turn() === "w" ? "Beli" : "Crni"} je u šahu!`
    : aiThinking ? `${currentBot.name} razmišlja…`
    : `${game.turn() === "w" ? "Beli" : "Crni"} na potezu`;

  const activeClockColor = isGameOver || !gameStarted ? null : game.turn();

  const gameResult = resignedBy
    ? (resignedBy === "w" ? "0-1" : "1-0")
    : drawAgreed ? "1/2-1/2"
    : game.isCheckmate()
    ? (game.turn() === "w" ? "0-1" : "1-0")
    : game.isDraw() || game.isStalemate() ? "1/2-1/2"
    : timeoutWinner === "White" ? "1-0"
    : timeoutWinner === "Black" ? "0-1"
    : null;

  const pgn = game.pgn();

  // Determine recommended lessons based on where mistakes likely occurred
  const getRecommendations = () => {
    if (!isGameOver || !gameResult) return [];
    const totalMoves = moveHistory.length;
    if (totalMoves < 4) return [PHASE_RECOMMENDATIONS[0]];
    // Simple heuristic: recommend based on game length
    const recs = [];
    if (totalMoves <= 20) recs.push(PHASE_RECOMMENDATIONS[0]);
    if (totalMoves > 10 && totalMoves <= 50) recs.push(PHASE_RECOMMENDATIONS[1]);
    if (totalMoves > 30) recs.push(PHASE_RECOMMENDATIONS[2]);
    return recs.length > 0 ? recs : [PHASE_RECOMMENDATIONS[1]];
  };

  if (streamerMode) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
        <button
          onClick={() => setStreamerMode(false)}
          className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-card/80 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"
        >
          <MonitorOff className="w-3.5 h-3.5 inline mr-1.5" /> Exit Streamer Mode
        </button>
        <div className="w-full max-w-[min(90vw,600px)]">
          <ChessBoard
            game={game}
            flipped={boardFlipped}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isGameOver={isGameOver}
            isPlayerTurn={isPlayerTurn}
            hintSquare={null}
            onSquareClick={handleSquareClick}
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground font-mono">{statusText}</p>
        <PromotionDialog
          isOpen={!!pendingPromotion}
          color={game.turn()}
          onSelect={handlePromotionSelect}
          onCancel={() => setPendingPromotion(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              <Swords className="w-3 h-3 mr-1" /> Play Chess
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setStreamerMode(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-border/50 bg-card text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                >
                  <Monitor className="w-3 h-3" /> Streamer Mode
                </button>
              </TooltipTrigger>
              <TooltipContent>Hide UI, show only board (F)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowShortcuts(s => !s)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-border/50 bg-card text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                >
                  <Keyboard className="w-3 h-3" /> Shortcuts
                </button>
              </TooltipTrigger>
              <TooltipContent>R=Resign, D=Draw, F=Fullscreen, N=New Game</TooltipContent>
            </Tooltip>
          </div>
          {showShortcuts && (
            <div className="mb-3 rounded-lg border border-border/40 bg-card/80 p-3 max-w-sm mx-auto">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { key: "R", action: "Resign" },
                  { key: "D", action: "Offer Draw" },
                  { key: "F", action: "Toggle Fullscreen" },
                  { key: "N", action: "New Game" },
                  { key: "?", action: "Toggle Shortcuts" },
                ].map(s => (
                  <div key={s.key} className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 font-mono text-[10px] text-foreground">{s.key}</kbd>
                    <span className="text-muted-foreground">{s.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {mode === "ai" ? (
              <>
                You vs <span className="text-gradient-gold">{currentBot.avatar} {currentBot.name}</span>
                <span className="text-lg ml-2 text-muted-foreground">({currentBot.rating} Elo)</span>
              </>
            ) : (
              <>Play <span className="text-gradient-gold">Local</span></>
            )}
          </h1>
          {mode === "ai" && (
            <p className="text-sm text-muted-foreground mt-1">
              {currentBot.countryFlag} {currentBot.style} · {currentBot.bio}
            </p>
          )}
        </div>

        {/* Bot message bubble */}
        <AnimatePresence>
          {botMessage && mode === "ai" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex justify-center mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-primary/30 shadow-lg max-w-md">
                <span className="text-2xl">{currentBot.avatar}</span>
                <div>
                  <p className="text-xs font-semibold text-primary">{currentBot.name}</p>
                  <p className="text-sm text-foreground">{botMessage}</p>
                </div>
                <MessageCircle className="w-4 h-4 text-primary/50 flex-shrink-0" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            {/* Opponent info bar (top) */}
            {mode === "ai" && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card/50 border border-border/20">
                <span className="text-xl">{currentBot.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{currentBot.name} {currentBot.countryFlag}</p>
                  <p className="text-[10px] text-muted-foreground">{currentBot.rating} Elo</p>
                </div>
                {aiThinking && (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                )}
              </div>
            )}

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

            {/* Player info bar (bottom) */}
            {mode === "ai" && profile && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card/50 border border-border/20">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {(profile.display_name || "P")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{profile.display_name || "You"}</p>
                  <p className="text-[10px] text-muted-foreground">{profile.rating} Elo</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {playerColor === "w" ? "⬜ Beli" : "⬛ Crni"}
                </span>
              </div>
            )}
          </div>

          {/* Controls column */}
          <div className="w-full lg:max-w-xs space-y-3">
            {/* Bot selector */}
            {mode === "ai" && (
              <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Izaberi protivnika</p>
                <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                  {BOT_PROFILES.map(bot => (
                    <button
                      key={bot.id}
                      onClick={() => selectBot(bot)}
                      className={`rounded-lg p-2 text-center transition-all border ${
                        currentBot.id === bot.id
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-border/40 bg-muted/20 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-xl block">{bot.avatar}</span>
                      <span className="text-[9px] font-bold block text-foreground leading-tight">{bot.name}</span>
                      <span className="text-[8px] text-muted-foreground block">{bot.rating}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
              canResign={moveHistory.length > 0}
            />

            {/* Draw offer status */}
            {drawOfferPending && !drawAgreed && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                {drawDeclined ? (
                  <p className="text-sm font-medium text-destructive">❌ {currentBot.name} je odbio/la remi!</p>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentBot.name} razmišlja o remiju...</p>
                  </div>
                )}
              </div>
            )}

            {/* Game Summary Report */}
            {isGameOver && gameResult && moveHistory.length >= 4 && (
              <GameSummary
                moveHistory={moveHistory}
                result={gameResult}
                playerColor={playerColor}
                difficulty={difficulty}
              />
            )}

            {/* Post-game analysis */}
            {isGameOver && gameResult && pgn && mode === "ai" && (
              <AnalysisPanel pgn={pgn} playerColor={playerColor} result={gameResult} />
            )}
          </div>
        </div>
      </main>

      <PromotionDialog
        isOpen={!!pendingPromotion}
        color={game.turn()}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />

      <Footer />
    </div>
  );
};

export default Play;
