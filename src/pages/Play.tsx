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
import { Swords, TrendingUp, Trophy, Target, Monitor, MonitorOff, Keyboard, MessageCircle, Search, Zap, Layers, BookOpen } from "lucide-react";
import ChessBoard4D from "@/components/chess/ChessBoard4D";
import { getBotByDifficulty, getDefaultBot, type BotProfile } from "@/lib/bot-profiles";
import { BOT_PROFILES } from "@/lib/bots/profiles";
import { getBotMove, getBotThinkMs, classifyCpLoss, estimateMoveQuality } from "@/lib/bots/bot-engine";
import { motion, AnimatePresence } from "framer-motion";
import { applyBotRatingChange, type RatingCalcResult } from "@/lib/rating-system";
import { getStreakBonus, getStreakState, updateStreakState, evaluateBadges, type BadgeRow, type StreakState } from "@/lib/progression";
import { bumpMissionProgress } from "@/hooks/use-daily-missions";
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
  const [hintToSquare, setHintToSquare] = useState<Square | null>(null);
  const [hintText, setHintText] = useState<string>("");
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
  const [returnToOpening, setReturnToOpening] = useState<{ id: string; label: string | null } | null>(null);

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

  // End-of-game audio: 1s delay so the final move is fully shown before any
  // winner/draw melody plays. Uses a calm warm "victory" cadence on a win,
  // a soft "drawMelody" on a draw, and the existing "gameOver" thump on a loss.
  const endSoundFiredRef = useRef(false);
  useEffect(() => {
    if (!isGameOver) { endSoundFiredRef.current = false; return; }
    if (endSoundFiredRef.current) return;
    endSoundFiredRef.current = true;
    let result: "win" | "loss" | "draw" = "draw";
    if (drawAgreed || game.isDraw() || game.isStalemate()) result = "draw";
    else if (resignedBy) result = resignedBy === playerColor ? "loss" : "win";
    else if (timeoutWinner) result = (timeoutWinner === "White" ? "w" : "b") === playerColor ? "win" : "loss";
    else if (game.isCheckmate()) {
      // turn() now belongs to the side that has been mated.
      result = game.turn() === playerColor ? "loss" : "win";
    }
    const sound = result === "win" ? "victory" : result === "draw" ? "drawMelody" : "gameOver";
    const t = setTimeout(() => playChessSound(sound), 1000);
    return () => clearTimeout(t);
  }, [isGameOver, drawAgreed, resignedBy, timeoutWinner, playerColor, game]);

  const updateState = () => setFen(game.fen());

  // Bot only speaks on blunders & game end
  const botMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (botMessageTimerRef.current) clearTimeout(botMessageTimerRef.current);
  }, []);

  const showBotMessage = (msg: string) => {
    if (!msg) return;
    if (botMessageTimerRef.current) clearTimeout(botMessageTimerRef.current);
    setBotMessage(msg);
    botMessageTimerRef.current = setTimeout(() => setBotMessage(""), 3500);
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

  // Hint — suggests the engine's recommended move (from + to + reasoning)
  useEffect(() => {
    if (!hintsEnabled || mode !== "ai" || game.turn() !== playerColor || isGameOver || gamePhase !== "playing") {
      setHintSquare(null);
      setHintToSquare(null);
      setHintText("");
      return;
    }
    const timer = setTimeout(() => {
      // Use a stronger level for hints so suggestions are actually helpful
      const bestMove = getAIMove(game, "advanced");
      if (!bestMove) return;
      const tempGame = new Chess(game.fen());
      const move = tempGame.move(bestMove);
      if (!move) return;
      setHintSquare(move.from as Square);
      setHintToSquare(move.to as Square);

      // Build a friendly explanation
      const pieceNames: Record<string, string> = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" };
      const pieceName = pieceNames[move.piece] || "Piece";
      let reason = "";
      if (move.flags.includes("c") || move.flags.includes("e")) reason = "captures material";
      else if (tempGame.isCheckmate()) reason = "delivers checkmate!";
      else if (tempGame.inCheck()) reason = "puts the king in check";
      else if (move.flags.includes("k") || move.flags.includes("q")) reason = "castles to safety";
      else if (move.flags.includes("p")) reason = "promotes the pawn";
      else if (["e4","d4","e5","d5","c4","c5","f4","f5"].includes(move.to)) reason = "controls the center";
      else reason = "improves your position";
      setHintText(`${pieceName} ${move.from} → ${move.to} — ${reason}`);
    }, 800);
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
            } else if (move.captured) {
              playChessSound("capture");
            } else {
              playChessSound("move");
            }

            // Bot only "speaks" on real blunders. For weaker bots (beginner/intermediate)
            // require a much bigger mistake AND throttle, since they blunder very often.
            if (decision.quality === "blunder") {
              const isWeakBot = currentBot.difficulty === "beginner" || currentBot.difficulty === "intermediate";
              const bigEnough = !isWeakBot || decision.cpLoss >= 400;
              const throttle = !isWeakBot || Math.random() < 0.35;
              if (bigEnough && throttle) {
                setTimeout(() => showBotMessage(currentBot.taunts.onBlunder), 500);
              }
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
        // Only allow legal premove targets for the selected piece
        if (legalMoves.includes(square)) {
          setPremove({ from: selectedSquare, to: square });
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      // Select a piece for premove and compute pseudo-legal targets
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        // Build a hypothetical position where it's the player's turn so we can
        // ask chess.js for that piece's legal moves. This restricts premoves
        // to actually-legal piece movements (e.g. knight L-shapes only).
        try {
          const parts = game.fen().split(" ");
          parts[1] = playerColor; // flip side to move
          parts[3] = "-";          // clear en passant to avoid invalid FEN
          const hypo = new Chess();
          hypo.load(parts.join(" "));
          const moves = hypo.moves({ square, verbose: true }) as Array<{ to: Square }>;
          setLegalMoves(moves.map((m) => m.to));
        } catch {
          setLegalMoves([]);
        }
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

  // When set, the next resetGameState() will start from this FEN instead of the standard start.
  const pendingStartFenRef = useRef<string | null>(null);

  const resetGameState = () => {
    const startFen = pendingStartFenRef.current;
    pendingStartFenRef.current = null;
    gameRef.current = startFen ? new Chess(startFen) : new Chess();
    setFen(startFen ?? "start");
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
    setStreakAfter(null);
    setUnlockedBadges([]);
    setPlayerMoveQuality([]);
    setBotMoveQuality([]);
    ratingAppliedRef.current = false;
    positionHistory.current = [];
    setWhiteTime(TIME_CONTROLS[timeControlIdx].seconds);
    setBlackTime(TIME_CONTROLS[timeControlIdx].seconds);
  };

  // Pick up "Play from position" handoff from Opening Trainer (one-shot).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("play-from-position");
      if (!raw) return;
      sessionStorage.removeItem("play-from-position");
      const data = JSON.parse(raw) as {
        fen?: string;
        botId?: string;
        playerColor?: PlayerColor;
        contextLabel?: string | null;
        returnOpeningId?: string | null;
      };
      if (!data.fen) return;
      // Validate the FEN before committing.
      try { new Chess(data.fen); } catch { return; }

      const bot = data.botId
        ? BOT_PROFILES.find((b) => b.id === data.botId)
        : undefined;
      if (bot) {
        setCurrentBot(bot);
        setDifficulty(bot.difficulty);
      }
      if (data.playerColor === "w" || data.playerColor === "b") {
        setPlayerColor(data.playerColor);
      }
      setMode("ai");
      pendingStartFenRef.current = data.fen;
      if (data.returnOpeningId) {
        setReturnToOpening({ id: data.returnOpeningId, label: data.contextLabel ?? null });
      }
      // Skip the searching animation — go straight to the matchup screen,
      // which auto-transitions to "playing" and runs resetGameState().
      setGamePhase("matchup");
    } catch {
      /* ignore */
    }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToLobby = () => {
    resetGameState();
    setReturnToOpening(null);
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

  // --- Apply bot rating change + streak + badges once when an AI game finishes ---
  useEffect(() => {
    if (!isGameOver || !gameResult || mode !== "ai" || !user || !profile) return;
    if (ratingAppliedRef.current) return;
    if (moveHistory.length < 2) return; // ignore zero-move quits only
    ratingAppliedRef.current = true;

    const playerWon =
      (gameResult === "1-0" && playerColor === "w") ||
      (gameResult === "0-1" && playerColor === "b");
    const isDraw = gameResult === "1/2-1/2";
    const result: "win" | "loss" | "draw" = isDraw ? "draw" : playerWon ? "win" : "loss";

    const botRating = currentBot.rating;
    const currentBotRating = (profile as any).bot_rating ?? 1200;
    const botGames = (profile as any).bot_games_played ?? 0;

    (async () => {
      try {
        // 1. Read current streak BEFORE updating
        const prevStreak = await getStreakState(user.id, "bot");
        const projectedStreak = result === "win" ? prevStreak.current_streak + 1 : 0;
        const streakBonus = getStreakBonus(projectedStreak, result);

        // 2. Apply Elo with streak bonus + loss protection
        const calc = await applyBotRatingChange({
          userId: user.id,
          currentRating: currentBotRating,
          botRating,
          botLabel: currentBot.name,
          gamesPlayed: botGames,
          result,
          streakBonus,
          lossStreak: prevStreak.loss_streak,
        });
        setBotRatingResult(calc);

        // 3. Update streak state
        const newStreak = await updateStreakState(user.id, "bot", result);
        setStreakAfter(newStreak);

        // 4. Evaluate & insert any newly-earned badges
        const newBadges = await evaluateBadges({
          userId: user.id,
          rating: calc.newRating,
          gamesPlayed: botGames + 1,
          result,
          playerRating: currentBotRating,
          opponentRating: botRating,
          currentStreak: newStreak.current_streak,
        });
        if (newBadges.length > 0) setUnlockedBadges(newBadges);

        // Daily missions: bot game counters
        try {
          await bumpMissionProgress(user.id, "games_played", 1);
          if (result === "win") {
            await bumpMissionProgress(user.id, "games_won", 1);
            await bumpMissionProgress(user.id, "bot_won", 1);
          }
          // Win streak (absolute set)
          if (result === "win") {
            await bumpMissionProgress(
              user.id,
              "win_streak",
              0,
              newStreak.current_streak
            );
          }
        } catch (err) {
          console.warn("Mission bump failed", err);
        }

        refreshProfile();
      } catch {
        ratingAppliedRef.current = false;
      }
    })();
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">
              <Swords className="w-3 h-3 mr-1" /> Play Chess
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
              Choose your <span className="text-gradient-gold">opponent</span>
            </h1>
            <p className="text-muted-foreground text-sm">Choose your side, pick any bot, and play by full chess rules.</p>
          </motion.div>

          {/* Titles shortcut */}
          <Link to="/play/titles" className="mb-8 group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm hover:border-primary/50 transition-all"
            >
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">View Titles & Rating Thresholds</span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold border border-primary/30 px-2 py-0.5 rounded-full">Bot · Online</span>
            </motion.div>
          </Link>

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
            <div className="flex flex-wrap justify-center gap-2">
              {getBotByDifficulty(difficulty).map(bot => (
                <motion.button
                  key={bot.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startMatchmaking(bot)}
                  className="rounded-xl p-3 text-center transition-all border border-border/40 bg-card hover:border-primary/40 hover:shadow-glow basis-[calc(33.333%-0.5rem)] sm:basis-[calc(25%-0.5rem)] max-w-[140px]"
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
                <TitleBadge rating={playerRating} mode="bot" size="xs" />
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
                <TitleBadge rating={currentBot.rating} mode="bot" size="xs" />
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
          <ChessBoard game={game} flipped={boardFlipped} selectedSquare={selectedSquare} legalMoves={legalMoves} lastMove={lastMove} isGameOver={isGameOver} isPlayerTurn={isPlayerTurn} hintSquare={hintSquare} hintToSquare={hintToSquare} onSquareClick={handleSquareClick} premove={premove} />
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

        {/* Bot message — rendered absolutely below the board (see board column) so the layout never jumps */}

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
          {hintsEnabled && hintText && !isGameOver && game.turn() === playerColor && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-center mb-2">
              <div className="px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/40 text-xs text-accent-foreground font-medium flex items-center gap-2">
                <span className="text-accent">💡</span>
                <span>Hint: {hintText}</span>
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
                  <TitleBadge rating={currentBot.rating} mode="bot" size="xs" />
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
                hintToSquare={hintToSquare}
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
                  <TitleBadge rating={(profile as any)?.bot_rating ?? 1200} mode="bot" size="xs" />
                </div>
                <p className="text-[10px] text-muted-foreground">{(profile as any)?.bot_rating ?? 1200} Elo · {playerColor === "w" ? "⬜ White" : "⬛ Black"}</p>
              </div>
              {game.turn() === playerColor && !isGameOver && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>

            {/* Rating change — directly under the board */}
            {botRatingResult && mode === "ai" && isGameOver && (
              <RatingChange result={botRatingResult} ratingType="bot" />
            )}

            {/* Bot feedback bubble — absolutely positioned below the board so the layout never jumps */}
            <AnimatePresence>
              {botMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-30 pointer-events-none"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/95 backdrop-blur-sm border border-primary/30 shadow-lg max-w-sm">
                    <span className="text-2xl">{currentBot.avatar}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-primary leading-tight">{currentBot.name}</p>
                      <p className="text-sm text-foreground leading-snug">{botMessage}</p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-primary/50 flex-shrink-0" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls column */}
          <div className="w-full lg:max-w-xs space-y-3">
            {/* Continue course (when game was launched from Opening Trainer) */}
            {returnToOpening && (
              <Link
                to={`/openings?openingId=${encodeURIComponent(returnToOpening.id)}`}
                className="block rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-3 hover:border-primary/70 hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary">Continue course</p>
                    {returnToOpening.label && (
                      <p className="text-xs text-muted-foreground truncate">{returnToOpening.label}</p>
                    )}
                  </div>
                </div>
              </Link>
            )}
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

            {streakAfter && streakAfter.current_streak >= 2 && mode === "ai" && (
              <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Win Streak</p>
                  <p className="text-sm text-foreground">
                    On a roll — keep winning for streak bonuses!
                  </p>
                </div>
                <StreakBadge streak={streakAfter.current_streak} best={streakAfter.best_streak} size="lg" />
              </div>
            )}
            {unlockedBadges.length > 0 && mode === "ai" && (
              <BadgeUnlockToast badges={unlockedBadges} onDismiss={() => setUnlockedBadges([])} />
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

        {/* Post-game analysis — full width, side by side on desktop */}
        {isGameOver && gameResult && mode === "ai" && (moveHistory.length >= 4 || pgn) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {moveHistory.length >= 4 && (
              <GameSummary
                moveHistory={moveHistory}
                result={gameResult}
                playerColor={playerColor}
                difficulty={difficulty}
                playerMoveQuality={playerMoveQuality}
                botName={currentBot.name}
              />
            )}
            {pgn && (
              <AnalysisPanel pgn={pgn} playerColor={playerColor} result={gameResult} />
            )}
          </div>
        )}
      </main>

      <PromotionDialog isOpen={!!pendingPromotion} color={game.turn()} onSelect={handlePromotionSelect} onCancel={() => setPendingPromotion(null)} />
      <Footer />
    </div>
  );
};

export default Play;
