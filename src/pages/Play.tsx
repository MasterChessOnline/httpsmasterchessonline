import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import CapturedPieces from "@/components/chess/CapturedPieces";
// LiveCoach removed per user request
import GameControls from "@/components/chess/GameControls";
import AnalysisPanel from "@/components/chess/AnalysisPanel";
import GameSummary from "@/components/chess/GameSummary";
import GameOverOverlay from "@/components/chess/GameOverOverlay";
import PromotionDialog, { type PromotionPiece } from "@/components/chess/PromotionDialog";
import ChessClock, { TIME_CONTROLS } from "@/components/ChessClock";
import { getAIMove, evaluateBoard, type Difficulty, AI_LEVELS } from "@/lib/chess-ai";
import { playChessSound } from "@/lib/chess-sounds";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Swords, TrendingUp, Trophy, Target, Monitor, MonitorOff, Keyboard, MessageCircle, Search, Zap, Layers } from "lucide-react";
import ChessBoard4D from "@/components/chess/ChessBoard4D";
import { getBotByDifficulty, getDefaultBot, type BotProfile } from "@/lib/bot-profiles";
import { getBotMove, getBotThinkMs, classifyCpLoss, estimateMoveQuality } from "@/lib/bots/bot-engine";
import { motion, AnimatePresence } from "framer-motion";
import { applyBotRatingChange, type RatingCalcResult } from "@/lib/rating-system";
import { getStreakBonus, getStreakState, updateStreakState, evaluateBadges, type BadgeRow, type StreakState } from "@/lib/progression";
import RatingChange from "@/components/RatingChange";
import TitleBadge from "@/components/TitleBadge";
import StreakBadge from "@/components/StreakBadge";
import BadgeUnlockToast from "@/components/BadgeUnlockToast";

type GameMode = "local" | "ai";
type PlayerColor = "w" | "b";
type GamePhaseState = "lobby" | "searching" | "matchup" | "playing";

const PHASE_RECOMMENDATIONS = [
  { phase: "opening", label: "Opening Fundamentals", desc: "Review key opening principles and common setups", link: "/learn" },
  { phase: "middlegame", label: "Middlegame Strategy", desc: "Improve your tactical vision and planning", link: "/learn" },
  { phase: "endgame", label: "Endgame Techniques", desc: "Master essential endgame patterns", link: "/learn" },
];

const Play = () => {
  const { user, profile, refreshProfile } = useAuth();
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
  const [currentBot, setCurrentBot] = useState<BotProfile>(() => getDefaultBot("beginner"));
  const [botMessage, setBotMessage] = useState<string>("");
  const [drawOfferPending, setDrawOfferPending] = useState(false);
  const [mode4D, setMode4D] = useState(false);
  const [blunderFlash, setBlunderFlash] = useState(false);
  const [drawDeclined, setDrawDeclined] = useState(false);
  const gameRef = useRef(new Chess());
  const positionHistory = useRef<string[]>([]);

  // --- NEW: Game phase state (lobby → searching → matchup → playing) ---
  const [gamePhase, setGamePhase] = useState<GamePhaseState>("lobby");
  const [searchProgress, setSearchProgress] = useState(0);

  // --- NEW: Premove system ---
  const [premove, setPremove] = useState<{ from: Square; to: Square; promotion?: PromotionPiece } | null>(null);

  // --- Bot rating tracking ---
  const [botRatingResult, setBotRatingResult] = useState<RatingCalcResult | null>(null);
  const [streakAfter, setStreakAfter] = useState<StreakState | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeRow[]>([]);
  const ratingAppliedRef = useRef(false);

  // --- Per-move accuracy tracking (player + bot) ---
  const [playerMoveQuality, setPlayerMoveQuality] = useState<Array<{ cp: number; quality: ReturnType<typeof classifyCpLoss> }>>([]);
  const [botMoveQuality, setBotMoveQuality] = useState<Array<{ cp: number; quality: ReturnType<typeof classifyCpLoss> }>>([]);

  const [timeControlIdx, setTimeControlIdx] = useState(6);
  const timeControl = TIME_CONTROLS[timeControlIdx];
  const unlimited = timeControl.seconds === 0;
  const [whiteTime, setWhiteTime] = useState(timeControl.seconds);
  const [blackTime, setBlackTime] = useState(timeControl.seconds);
  const [gameStarted, setGameStarted] = useState(false);

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!timeoutWinner || !!resignedBy || drawAgreed;
  const aiColor = playerColor === "w" ? "b" : "w";

  const updateState = () => setFen(game.fen());

  // Bot greeting
  useEffect(() => {
    if (mode === "ai" && gamePhase === "playing") {
      showBotMessage(currentBot.taunts.greeting);
    }
  }, [currentBot.id, mode, gamePhase]);

  const showBotMessage = (msg: string) => {
    setBotMessage(msg);
    setTimeout(() => setBotMessage(""), 4000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (gamePhase !== "playing") return;
      switch (e.key.toLowerCase()) {
        case "r": if (!isGameOver && moveHistory.length > 0) handleResign(); break;
        case "d": if (!isGameOver && moveHistory.length >= 2) handleOfferDraw(); break;
        case "f": setStreamerMode(prev => !prev); break;
        case "n": goToLobby(); break;
        case "?": setShowShortcuts(prev => !prev); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isGameOver, moveHistory.length, gamePhase]);

  const getPositionKey = () => {
    const parts = game.fen().split(" ");
    return parts.slice(0, 4).join(" ");
  };

  const checkDrawConditions = (): { isDraw: boolean; reason: string } => {
    const posKey = getPositionKey();
    const count = positionHistory.current.filter(p => p === posKey).length;
    if (count >= 3) return { isDraw: true, reason: "by threefold repetition" };
    const halfMoves = parseInt(game.fen().split(" ")[4]);
    if (halfMoves >= 100) return { isDraw: true, reason: "by 50-move rule" };
    if (game.isInsufficientMaterial()) return { isDraw: true, reason: "by insufficient material" };
    if (game.isStalemate()) return { isDraw: true, reason: "by stalemate" };
    if (game.isDraw()) return { isDraw: true, reason: "" };
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

  // Hint
  useEffect(() => {
    if (!hintsEnabled || mode !== "ai" || game.turn() !== playerColor || isGameOver || gamePhase !== "playing") {
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
  }, [fen, hintsEnabled, mode, playerColor, isGameOver, gamePhase]);

  // --- AI plays + execute premove after AI move ---
  useEffect(() => {
    if (mode !== "ai" || game.turn() !== aiColor || isGameOver || gamePhase !== "playing") return;
    setAiThinking(true);

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      // Resolve the bot's move (Stockfish-backed, may be async)
      const decision = await getBotMove(game, currentBot);
      if (cancelled) return;

      const critical = game.inCheck() || Math.abs(evaluateBoard(game)) > 200;
      const thinkTime = getBotThinkMs(currentBot, {
        baseSeconds: timeControl.seconds,
        ply: moveHistory.length,
        fromBook: decision.fromBook,
        critical,
      });

      timeout = setTimeout(() => {
        if (cancelled) return;
        const aiMoveStr = decision.move || getAIMove(game, difficulty);
        if (aiMoveStr) {
          const move = game.move(aiMoveStr);
          if (move) {
            setMoveHistory((prev) => [...prev, move.san]);
            setLastMove({ from: move.from, to: move.to });
            setGameStarted(true);
            setBotMoveQuality((prev) => [...prev, { cp: decision.cpLoss, quality: decision.quality }]);
            trackPosition();
            if (!unlimited && timeControl.increment > 0) {
              if (aiColor === "w") setWhiteTime((p) => p + timeControl.increment);
              else setBlackTime((p) => p + timeControl.increment);
            }
            updateState();

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

            if (decision.quality === "blunder" && Math.random() < 0.5) {
              setTimeout(() => showBotMessage(currentBot.taunts.onBlunder), 500);
            }
          }
        }
        setAiThinking(false);
      }, thinkTime);
    })();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [fen, mode, difficulty, aiColor, isGameOver, gamePhase, currentBot]);

  // --- Execute premove when it becomes player's turn ---
  useEffect(() => {
    if (!premove || game.turn() !== playerColor || isGameOver || gamePhase !== "playing") return;
    // Small delay to show the premove executing
    const timer = setTimeout(() => {
      const { from, to, promotion } = premove;
      setPremove(null);
      // Validate move is still legal
      const legalMvs = game.moves({ verbose: true });
      const isLegal = legalMvs.some(m => m.from === from && m.to === to);
      if (isLegal) {
        executeMove(from, to, promotion || "q");
        playChessSound("move");
      } else {
        // Premove invalid — cancel silently
        playChessSound("move"); // subtle feedback
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [fen, premove, playerColor, isGameOver, gamePhase]);

  const isPromotionMove = (from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (!piece || piece.type !== "p") return false;
    const toRank = parseInt(to[1]);
    return (piece.color === "w" && toRank === 8) || (piece.color === "b" && toRank === 1);
  };

  const executeMove = (from: Square, to: Square, promotion: PromotionPiece = "q") => {
    // Pre-move analysis: how good was this move vs engine best?
    let playerCp = 0;
    if (mode === "ai") {
      try {
        const estimate = estimateMoveQuality(game, { from, to, promotion });
        playerCp = estimate.cpLoss;
      } catch { /* ignore — analysis is best-effort */ }
    }

    const move = game.move({ from, to, promotion });
    if (move) {
      setMoveHistory((prev) => [...prev, move.san]);
      setLastMove({ from: move.from, to: move.to });
      setGameStarted(true);
      if (mode === "ai") {
        const quality = classifyCpLoss(playerCp);
        setPlayerMoveQuality(prev => [...prev, { cp: playerCp, quality }]);
        if (quality === "blunder") {
          setBlunderFlash(true);
          setTimeout(() => setBlunderFlash(false), 350);
        }
      }
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
    if (isGameOver || pendingPromotion || gamePhase !== "playing") return;

    // --- PREMOVE: if not player's turn, allow setting premove ---
    if (mode === "ai" && game.turn() === aiColor) {
      if (premove && premove.from === square) {
        // Cancel premove by clicking the same from-square
        setPremove(null);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      if (selectedSquare) {
        // Set premove (from selectedSquare → square)
        setPremove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      // Select a piece for premove (show all squares as potential targets)
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        // For premoves, show all squares as possible (validation happens on execution)
        const allSquares: Square[] = [];
        for (const f of ["a","b","c","d","e","f","g","h"]) {
          for (const r of [1,2,3,4,5,6,7,8]) {
            const sq = `${f}${r}` as Square;
            if (sq !== square) allSquares.push(sq);
          }
        }
        setLegalMoves(allSquares);
      }
      return;
    }

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
    if (isGameOver) return;
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
      setTimeout(() => {
        const eval_ = evaluateBoard(game);
        const aiAdvantage = aiColor === "w" ? eval_ : -eval_;
        const movesPlayed = moveHistory.length;
        const isEqual = Math.abs(eval_) < 100;
        const longGame = movesPlayed >= currentBot.drawAcceptThreshold;
        const botWinning = aiAdvantage > 200;
        if ((isEqual || longGame) && !botWinning) {
          setDrawAgreed(true);
          setDrawReason("by agreement");
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
      setDrawReason("by agreement");
      playChessSound("gameOver");
    }
  };

  const startMatchmaking = (bot?: BotProfile) => {
    const selectedBot = bot ?? getDefaultBot(difficulty);
    setCurrentBot(selectedBot);
    if (bot) {
      setDifficulty(selectedBot.difficulty);
    }
    setGamePhase("searching");
    setSearchProgress(0);
  };

  // Searching animation → matchup screen
  useEffect(() => {
    if (gamePhase !== "searching") return;
    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGamePhase("matchup");
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [gamePhase]);

  // Matchup screen → playing (auto-transition after 2.5s)
  useEffect(() => {
    if (gamePhase !== "matchup") return;
    const timer = setTimeout(() => {
      resetGameState();
      setGamePhase("playing");
      playChessSound("start");
    }, 2500);
    return () => clearTimeout(timer);
  }, [gamePhase]);

  const resetGameState = () => {
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
    setPremove(null);
    setBotRatingResult(null);
    setPlayerMoveQuality([]);
    setBotMoveQuality([]);
    ratingAppliedRef.current = false;
    positionHistory.current = [];
    setWhiteTime(TIME_CONTROLS[timeControlIdx].seconds);
    setBlackTime(TIME_CONTROLS[timeControlIdx].seconds);
  };

  const goToLobby = () => {
    resetGameState();
    setGamePhase("lobby");
  };

  const changeTimeControl = (idx: number) => {
    setTimeControlIdx(idx);
    setWhiteTime(TIME_CONTROLS[idx].seconds);
    setBlackTime(TIME_CONTROLS[idx].seconds);
  };

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setCurrentBot(getDefaultBot(d));
  };

  const boardFlipped = playerColor === "b";
  const isPlayerTurn = mode === "ai" ? game.turn() === playerColor : true;

  const statusText = resignedBy
    ? `${resignedBy === "w" ? "White" : "Black"} resigned! ${resignedBy === "w" ? "Black" : "White"} wins!`
    : drawAgreed
    ? drawReason || "Draw!"
    : drawOfferPending
    ? (drawDeclined ? "Draw offer declined!" : "Waiting for draw response...")
    : timeoutWinner
    ? `${timeoutWinner} wins on time!`
    : game.isCheckmate()
    ? `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`
    : game.isStalemate() ? "Stalemate — Draw!"
    : game.isDraw() ? "Draw!"
    : game.isCheck()
    ? `${game.turn() === "w" ? "White" : "Black"} is in check!`
    : aiThinking ? `${currentBot.name} is thinking…`
    : `${game.turn() === "w" ? "White" : "Black"} to move`;

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

  // --- Game-over overlay info (shown over the board) ---
  const gameOverInfo: { type: "checkmate" | "draw" | "resign" | "timeout"; winner: "white" | "black" | null; reason?: string } | null = (() => {
    if (!isGameOver) return null;
    if (resignedBy) {
      const winner = resignedBy === "w" ? "black" : "white";
      return { type: "resign", winner, reason: `${resignedBy === "w" ? "White" : "Black"} resigned` };
    }
    if (timeoutWinner) {
      return { type: "timeout", winner: timeoutWinner.toLowerCase() as "white" | "black", reason: "on time" };
    }
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "black" : "white";
      return { type: "checkmate", winner };
    }
    if (drawAgreed || game.isStalemate() || game.isDraw()) {
      let reason = drawReason;
      if (!reason) {
        if (game.isStalemate()) reason = "by stalemate";
        else if (game.isInsufficientMaterial()) reason = "by insufficient material";
        else reason = "";
      }
      return { type: "draw", winner: null, reason };
    }
    return null;
  })();

  const pgn = game.pgn();

  // --- Apply bot rating change once when an AI game finishes ---
  useEffect(() => {
    if (!isGameOver || !gameResult || mode !== "ai" || !user || !profile) return;
    if (ratingAppliedRef.current) return;
    if (moveHistory.length < 4) return; // ignore instant resigns
    ratingAppliedRef.current = true;

    const playerWon =
      (gameResult === "1-0" && playerColor === "w") ||
      (gameResult === "0-1" && playerColor === "b");
    const isDraw = gameResult === "1/2-1/2";
    const result: "win" | "loss" | "draw" = isDraw ? "draw" : playerWon ? "win" : "loss";

    const botRating = currentBot.rating;
    const currentBotRating = (profile as any).bot_rating ?? 1200;
    const botGames = (profile as any).bot_games_played ?? 0;

    applyBotRatingChange({
      userId: user.id,
      currentRating: currentBotRating,
      botRating,
      botLabel: currentBot.name,
      gamesPlayed: botGames,
      result,
    }).then(calc => {
      setBotRatingResult(calc);
      refreshProfile();
    }).catch(() => { ratingAppliedRef.current = false; });
  }, [isGameOver, gameResult, mode, user, profile, difficulty, playerColor, currentBot.name, moveHistory.length, refreshProfile]);

  const getRecommendations = () => {
    if (!isGameOver || !gameResult) return [];
    const totalMoves = moveHistory.length;
    if (totalMoves < 4) return [PHASE_RECOMMENDATIONS[0]];
    const recs = [];
    if (totalMoves <= 20) recs.push(PHASE_RECOMMENDATIONS[0]);
    if (totalMoves > 10 && totalMoves <= 50) recs.push(PHASE_RECOMMENDATIONS[1]);
    if (totalMoves > 30) recs.push(PHASE_RECOMMENDATIONS[2]);
    return recs.length > 0 ? recs : [PHASE_RECOMMENDATIONS[1]];
  };

  // ===================== LOBBY SCREEN =====================
  if (gamePhase === "lobby") {
    return (
      <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">
              <Swords className="w-3 h-3 mr-1" /> Play Chess
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
              Choose your <span className="text-gradient-gold">opponent</span>
            </h1>
            <p className="text-muted-foreground text-sm">Choose your side, pick any bot, and play by full chess rules.</p>
          </motion.div>

          {/* Time control selector */}
          <div className="mb-6 w-full max-w-md">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">Time</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {TIME_CONTROLS.map((tc, i) => (
                <button
                  key={tc.label}
                  onClick={() => changeTimeControl(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    timeControlIdx === i
                      ? "border-primary bg-primary/15 text-primary shadow-glow"
                      : "border-border/40 bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="mb-6 w-full max-w-md">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">Difficulty</p>
            <div className="flex justify-center gap-2">
              {AI_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => changeDifficulty(level.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                    difficulty === level.value
                      ? "border-primary bg-primary/15 text-primary shadow-glow"
                      : "border-border/40 bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick play button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mb-8">
            <Button
              onClick={() => startMatchmaking()}
              size="lg"
              className="text-lg px-10 py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow font-bold gap-2"
            >
              <Zap className="w-5 h-5" /> Play Now
            </Button>
          </motion.div>

          {/* Bot grid */}
          <div className="w-full max-w-lg">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">Or pick an opponent</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {getBotByDifficulty(difficulty).map(bot => (
                <motion.button
                  key={bot.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startMatchmaking(bot)}
                  className="rounded-xl p-3 text-center transition-all border border-border/40 bg-card hover:border-primary/40 hover:shadow-glow"
                >
                  <span className="text-3xl block mb-1">{bot.avatar}</span>
                  <span className="text-xs font-bold block text-foreground leading-tight">{bot.name}</span>
                  <span className="text-[10px] text-muted-foreground block">{bot.countryFlag} {bot.rating} Elo</span>
                </motion.button>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ===================== SEARCHING SCREEN =====================
  if (gamePhase === "searching") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center" style={{ fontFamily: "var(--font-body)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto border-4 border-primary/30 border-t-primary rounded-full"
          />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">Finding opponent...</h2>
            <p className="text-sm text-muted-foreground">Matching you with a player near your skill level</p>
          </div>
          <div className="w-64 mx-auto">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(searchProgress, 100)}%` }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={goToLobby} className="text-muted-foreground">
            Cancel
          </Button>
        </motion.div>
      </div>
    );
  }

  // ===================== MATCHUP SCREEN =====================
  if (gamePhase === "matchup") {
    const playerName = profile?.display_name || profile?.username || "You";
    const playerInitial = (playerName && playerName.length > 0 ? playerName[0] : "P").toUpperCase();
    const playerRating = (profile as any)?.bot_rating || 1200;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center" style={{ fontFamily: "var(--font-body)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-8 px-4"
        >
          {/* VS layout */}
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {/* Player */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary mx-auto mb-2">
                {playerInitial}
              </div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold text-foreground">{playerName}</p>
                <TitleBadge titleKey={(profile as any)?.highest_title_key} rating={playerRating} size="xs" />
              </div>
              <p className="text-xs text-muted-foreground">{playerRating} Elo</p>
            </motion.div>

            {/* VS */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            >
              <span className="text-3xl sm:text-4xl font-display font-black text-gradient-gold">VS</span>
            </motion.div>

            {/* Bot */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card border-2 border-border flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-2">
                {currentBot.avatar}
              </div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold text-foreground">{currentBot.name} {currentBot.countryFlag}</p>
                <TitleBadge rating={currentBot.rating} size="xs" />
              </div>
              <p className="text-xs text-muted-foreground">{currentBot.rating} Elo</p>
            </motion.div>
          </div>

          {/* Color assignment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border ${
              playerColor === "w"
                ? "bg-white/10 border-white/30 text-foreground"
                : "bg-zinc-900/50 border-zinc-700 text-foreground"
            }`}>
              <span className="text-2xl">{playerColor === "w" ? "♔" : "♚"}</span>
              <span className="font-bold text-lg">
                You are {playerColor === "w" ? "White" : "Black"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {playerColor === "w" ? "You move first" : `${currentBot.name} moves first`}
            </p>
          </motion.div>

          {/* Loading dots */}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ===================== STREAMER MODE =====================
  if (streamerMode) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
        <button onClick={() => setStreamerMode(false)} className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-card/80 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm">
          <MonitorOff className="w-3.5 h-3.5 inline mr-1.5" /> Exit
        </button>
        <div className="w-full max-w-[min(90vw,600px)]">
          <ChessBoard game={game} flipped={boardFlipped} selectedSquare={selectedSquare} legalMoves={legalMoves} lastMove={lastMove} isGameOver={isGameOver} isPlayerTurn={isPlayerTurn} hintSquare={null} onSquareClick={handleSquareClick} premove={premove} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground font-mono">{statusText}</p>
        <PromotionDialog isOpen={!!pendingPromotion} color={game.turn()} onSelect={handlePromotionSelect} onCancel={() => setPendingPromotion(null)} />
      </div>
    );
  }

  // ===================== PLAYING SCREEN =====================
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              <Swords className="w-3 h-3 mr-1" /> Live Game
            </Badge>
            <Badge className={`text-xs ${playerColor === "w" ? "bg-white/20 text-foreground border-white/30" : "bg-zinc-800 text-foreground border-zinc-600"}`}>
              {playerColor === "w" ? "♔ White" : "♚ Black"}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setStreamerMode(true)} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-border/50 bg-card text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                  <Monitor className="w-3 h-3" /> Streamer
                </button>
              </TooltipTrigger>
              <TooltipContent>Streamer Mode (F)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setMode4D(prev => !prev)} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs transition-all ${mode4D ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" : "border-border/50 bg-card text-muted-foreground hover:text-primary hover:border-primary/30"}`}>
                  <Layers className="w-3 h-3" /> 4D
                </button>
              </TooltipTrigger>
              <TooltipContent>Toggle 4D Visual Mode</TooltipContent>
            </Tooltip>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            You vs <span className="text-gradient-gold">{currentBot.avatar} {currentBot.name}</span>
            <span className="text-base ml-2 text-muted-foreground">({currentBot.rating})</span>
          </h1>
        </div>

        {/* Bot message */}
        <AnimatePresence>
          {botMessage && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="flex justify-center mb-3">
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

        {/* Premove indicator */}
        <AnimatePresence>
          {premove && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center mb-2">
              <div className="px-3 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-xs text-blue-400 font-medium">
                ⚡ Premove: {premove.from} → {premove.to}
                <button onClick={() => setPremove(null)} className="ml-2 text-blue-300 hover:text-blue-100">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
          {/* Board column */}
          <div className="w-full max-w-[min(85vw,520px)] space-y-1.5 relative">
            {/* Opponent bar (top) */}
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${
              game.turn() === aiColor && !isGameOver
                ? "bg-primary/5 border-primary/30"
                : "bg-card/50 border-border/20"
            }`}>
              <span className="text-xl">{currentBot.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-bold text-foreground truncate">{currentBot.name} {currentBot.countryFlag}</p>
                  <TitleBadge rating={currentBot.rating} size="xs" />
                </div>
                <p className="text-[10px] text-muted-foreground">{currentBot.rating} Elo · {aiColor === "w" ? "⬜ White" : "⬛ Black"}</p>
              </div>
              {game.turn() === aiColor && !isGameOver && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {aiThinking && (
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1 h-1 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <ChessClock whiteTime={whiteTime} blackTime={blackTime} activeColor={activeClockColor} isGameOver={isGameOver} onTimeOut={handleTimeOut} setWhiteTime={setWhiteTime} setBlackTime={setBlackTime} unlimited={unlimited} />
            <CapturedPieces game={game} color={boardFlipped ? "w" : "b"} />

            <ChessBoard4D enabled={mode4D}>
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
                premove={premove}
                overlay={gameOverInfo ? (
                  <GameOverOverlay
                    type={gameOverInfo.type}
                    winner={gameOverInfo.winner}
                    reason={gameOverInfo.reason}
                  />
                ) : undefined}
              />
            </ChessBoard4D>

            <CapturedPieces game={game} color={boardFlipped ? "b" : "w"} />

            {/* Player bar (bottom) */}
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${
              game.turn() === playerColor && !isGameOver
                ? "bg-primary/5 border-primary/30"
                : "bg-card/50 border-border/20"
            }`}>
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {((profile?.display_name || profile?.username || "P")[0] || "P").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-bold text-foreground truncate">{profile?.display_name || profile?.username || "You"}</p>
                  <TitleBadge titleKey={(profile as any)?.highest_title_key} rating={(profile as any)?.bot_rating ?? 1200} size="xs" />
                </div>
                <p className="text-[10px] text-muted-foreground">{(profile as any)?.bot_rating ?? 1200} Elo · {playerColor === "w" ? "⬜ White" : "⬛ Black"}</p>
              </div>
              {game.turn() === playerColor && !isGameOver && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* Controls column */}
          <div className="w-full lg:max-w-xs space-y-3">
            {/* Game status */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
              <p className="text-sm font-medium text-foreground">{statusText}</p>
            </div>
            <GameControls
              mode={mode}
              difficulty={difficulty}
              playerColor={playerColor}
              timeControlIdx={timeControlIdx}
              statusText={statusText}
              moveHistory={moveHistory}
              isGameOver={isGameOver}
              hintsEnabled={hintsEnabled}
              onModeChange={setMode}
              onDifficultyChange={changeDifficulty}
              onColorChange={setPlayerColor}
              onTimeControlChange={changeTimeControl}
              onNewGame={goToLobby}
              onToggleHints={() => setHintsEnabled(!hintsEnabled)}
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
              canResign={true}
              settingsLocked={!isGameOver && moveHistory.length > 0}
            />

            {/* Draw offer status */}
            {drawOfferPending && !drawAgreed && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                {drawDeclined ? (
                  <p className="text-sm font-medium text-destructive">❌ {currentBot.name} declined the draw!</p>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentBot.name} is considering the draw...</p>
                  </div>
                )}
              </div>
            )}

            {isGameOver && gameResult && moveHistory.length >= 4 && (
              <GameSummary
                moveHistory={moveHistory}
                result={gameResult}
                playerColor={playerColor}
                difficulty={difficulty}
                playerMoveQuality={mode === "ai" ? playerMoveQuality : undefined}
                botName={mode === "ai" ? currentBot.name : undefined}
              />
            )}
            {botRatingResult && mode === "ai" && (
              <RatingChange result={botRatingResult} ratingType="bot" />
            )}
            {isGameOver && gameResult && pgn && mode === "ai" && (
              <AnalysisPanel pgn={pgn} playerColor={playerColor} result={gameResult} />
            )}

            {/* Rematch / New Game */}
            {isGameOver && (
              <div className="flex gap-2">
                <Button onClick={() => startMatchmaking(currentBot)} className="flex-1 gap-1">
                  <Swords className="w-4 h-4" /> Rematch
                </Button>
                <Button onClick={goToLobby} variant="outline" className="flex-1">
                  New Opponent
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <PromotionDialog isOpen={!!pendingPromotion} color={game.turn()} onSelect={handlePromotionSelect} onCancel={() => setPendingPromotion(null)} />
      <Footer />
    </div>
  );
};

export default Play;
