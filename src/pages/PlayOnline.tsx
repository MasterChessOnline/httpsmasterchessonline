import { useState, useEffect, useRef, useCallback } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Wifi, Flag, Timer, Loader2, Send, Users, Swords, RotateCcw, Handshake, Zap, Eye, MonitorOff } from "lucide-react";
import ChessClock, { TIME_CONTROLS } from "@/components/ChessClock";
import { useOnlineGame } from "@/hooks/use-online-game";
import ChessBoard from "@/components/chess/ChessBoard";
import PromotionDialog, { type PromotionPiece } from "@/components/chess/PromotionDialog";
import { useToast } from "@/hooks/use-toast";
import RatingChange from "@/components/RatingChange";
import { playChessSound } from "@/lib/chess-sounds";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import DynamicBackground from "@/components/DynamicBackground";
import GameStatusOverlay from "@/components/chess/GameStatusOverlay";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♔", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wq: { symbol: "♕", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wr: { symbol: "♖", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wb: { symbol: "♗", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wn: { symbol: "♘", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wp: { symbol: "♙", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  bk: { symbol: "♚", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bq: { symbol: "♛", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  br: { symbol: "♜", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bb: { symbol: "♝", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bn: { symbol: "♞", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bp: { symbol: "♟", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
};

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

const TC_PRESET_BY_PARAM: Record<string, number> = {
  bullet: 1, // 1+0
  blitz: 4, // 3+0
  rapid: 8, // 10+0
  classical: 11,
};

const PlayOnline = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tcParam = searchParams.get("tc") || "";
  const initialTcIdx = TC_PRESET_BY_PARAM[tcParam] ?? 4;
  const {
    status: onlineStatus, game: onlineGame, myColor, error: onlineError, ratingResult,
    searchMatch, cancelSearch, makeMove, endGame, resign, reset: resetOnline,
  } = useOnlineGame();

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [timeoutWinner, setTimeoutWinner] = useState<string | null>(null);
  const [timeControlIdx, setTimeControlIdx] = useState(initialTcIdx);
  const gameRef = useRef(new Chess());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [opponentProfile, setOpponentProfile] = useState<{ display_name: string | null; rating: number } | null>(null);
  const [gameMode, setGameMode] = useState<"rated" | "casual">("rated");
  const [focusMode, setFocusMode] = useState(false);
  const [drawOfferedByMe, setDrawOfferedByMe] = useState(false);
  const [drawOfferedByOpponent, setDrawOfferedByOpponent] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const { toast, dismiss } = useToast();
  const boardFocusRef = useRef<HTMLDivElement>(null);

  const tc = TIME_CONTROLS[timeControlIdx];
  const unlimited = tc.seconds === 0;
  const [whiteTime, setWhiteTime] = useState(tc.seconds);
  const [blackTime, setBlackTime] = useState(tc.seconds);
  const [gameStarted, setGameStarted] = useState(false);

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!timeoutWinner || onlineStatus === "finished";
  const boardFlipped = myColor === "b";

  const displayFiles = boardFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = boardFlipped ? [...RANKS].reverse() : RANKS;

  const opponentId = onlineGame
    ? myColor === "w" ? onlineGame.black_player_id : onlineGame.white_player_id
    : null;

  // Fetch opponent profile
  useEffect(() => {
    if (!opponentId) return;
    supabase.from("profiles").select("display_name, rating").eq("user_id", opponentId).single().then(({ data }) => {
      if (data) setOpponentProfile(data);
    });
  }, [opponentId]);

  // Sync board from server state.
  // Two key invariants:
  //   1. Only rebuild the chess.js instance when the FEN actually changed.
  //   2. Only adopt the server clock when the server's last_move_at is newer
  //      than what we last adopted — otherwise the locally ticking clock
  //      gets jerked back every time we receive a no-op snapshot or our own
  //      optimistic echo, causing the "trzanje" the user reported.
  const lastAdoptedMoveAtRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onlineGame || onlineStatus !== "playing") return;
    if (onlineGame.fen !== game.fen()) {
      const prevFen = game.fen();
      gameRef.current = new Chess(onlineGame.fen);
      setSelectedSquare(null);
      setLegalMoves([]);
      setGameStarted(true);
      if (onlineGame.pgn) setMoveHistory(onlineGame.pgn.split(" ").filter(Boolean));
      // Play sound for opponent's move
      if (prevFen !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" && gameRef.current.turn() === myColor) {
        const g = gameRef.current;
        if (g.isCheckmate() || g.isDraw() || g.isStalemate()) playChessSound("gameOver");
        else if (g.isCheck()) playChessSound("check");
        else {
          const moves = onlineGame.pgn?.split(" ").filter(Boolean) || [];
          const lastSan = moves[moves.length - 1] || "";
          playChessSound(lastSan.includes("x") ? "capture" : "move");
        }
      }
    }
    // Only adopt server clock when a NEW move was actually played.
    if (onlineGame.last_move_at && onlineGame.last_move_at !== lastAdoptedMoveAtRef.current) {
      lastAdoptedMoveAtRef.current = onlineGame.last_move_at;
      setWhiteTime(onlineGame.white_time);
      setBlackTime(onlineGame.black_time);
    }
  }, [onlineGame]);

  // Initial game setup
  useEffect(() => {
    if (onlineGame && onlineStatus === "playing") {
      setWhiteTime(onlineGame.white_time);
      setBlackTime(onlineGame.black_time);
      gameRef.current = new Chess(onlineGame.fen);
      if (onlineGame.pgn) setMoveHistory(onlineGame.pgn.split(" ").filter(Boolean));
      setGameStarted(true);
      playChessSound("start");
      requestAnimationFrame(() => boardFocusRef.current?.scrollIntoView({ block: "center", inline: "center" }));
    }
  }, [onlineStatus]);

  useEffect(() => {
    if (isGameOver) {
      setDrawOfferedByMe(false);
      setDrawOfferedByOpponent(false);
      dismiss();
    }
  }, [isGameOver, onlineStatus, dismiss]);

  // Chat subscription
  useEffect(() => {
    if (!onlineGame || onlineStatus !== "playing") return;
    supabase.from("game_messages").select("*").eq("game_id", onlineGame.id)
      .order("created_at", { ascending: true }).then(({ data }) => {
        if (data) setChatMessages(data as ChatMessage[]);
      });
    const channel = supabase.channel(`chat-${onlineGame.id}-${Date.now()}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "game_messages",
        filter: `game_id=eq.${onlineGame.id}`,
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        setChatMessages(prev => [...prev, msg]);
        // Handle draw offer signaling
        if (msg.user_id !== user?.id) {
          if (msg.message === "__draw_offer__") {
            if (isGameOver) return;
            setDrawOfferedByOpponent(true);
            toast({ title: "Draw offer", description: "Your opponent offers a draw." });
          } else if (msg.message === "__draw_accept__") {
            // Opponent accepted our offer
            if (drawOfferedByMe) {
              endGame("1/2-1/2", "agreement");
              playChessSound("gameOver");
            }
          } else if (msg.message === "__draw_decline__") {
            if (drawOfferedByMe) {
              setDrawOfferedByMe(false);
              toast({ title: "Draw declined", description: "Your opponent declined the draw." });
            }
          }
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [onlineGame?.id, onlineStatus, user?.id, drawOfferedByMe]);

  useEffect(() => {
    if (onlineStatus !== "playing") return;
    const last = chatMessages[chatMessages.length - 1];
    if (!last || last.message.startsWith("__")) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chatMessages, onlineStatus]);

  const sendChat = async () => {
    if (!chatInput.trim() || !user || !onlineGame) return;
    await supabase.from("game_messages").insert({
      game_id: onlineGame.id, user_id: user.id, message: chatInput.trim(),
    });
    setChatInput("");
  };

  const handleTimeOut = useCallback((color: "w" | "b") => {
    const result = color === "w" ? "0-1" : "1-0";
    setTimeoutWinner(color === "w" ? "Black" : "White");
    playChessSound("gameOver");
    if (onlineGame) endGame(result, "timeout");
  }, [onlineGame, endGame]);

  const executeMove = (from: Square, to: Square, promotion: PromotionPiece = "q") => {
    const fenBefore = game.fen();
    const move = game.move({ from, to, promotion });
    if (!move) return;
    setMoveHistory(prev => [...prev, move.san]);
    setGameStarted(true);

    let wt = whiteTime, bt = blackTime;
    const inc = onlineGame?.increment || 0;
    if (!unlimited && inc > 0) {
      if (move.color === "w") { wt += inc; setWhiteTime(wt); }
      else { bt += inc; setBlackTime(bt); }
    }

    let finish: { result: string; endReason: Parameters<typeof endGame>[1] } | undefined;
    if (game.isCheckmate()) {
      finish = { result: game.turn() === "w" ? "0-1" : "1-0", endReason: "checkmate" };
      playChessSound("gameOver");
    } else if (game.isStalemate()) {
      finish = { result: "1/2-1/2", endReason: "stalemate" };
      playChessSound("gameOver");
    } else if (game.isThreefoldRepetition()) {
      finish = { result: "1/2-1/2", endReason: "threefold" };
      playChessSound("gameOver");
    } else if (game.isInsufficientMaterial()) {
      finish = { result: "1/2-1/2", endReason: "insufficient_material" };
      playChessSound("gameOver");
    } else if (game.isDraw()) {
      // Catch-all: most often the 50-move rule when none of the above hit.
      finish = { result: "1/2-1/2", endReason: "fifty_move" };
      playChessSound("gameOver");
    } else if (game.isCheck()) {
      playChessSound("check");
    } else if (move.captured) {
      playChessSound("capture");
    } else {
      playChessSound("move");
    }

    makeMove(fenBefore, game.fen(), move.san, move.from, move.to, game.turn(), wt, bt, promotion, finish);
  };

  const handleSquareClick = (square: Square) => {
    if (isGameOver || game.turn() !== myColor || onlineStatus !== "playing") return;

    if (selectedSquare && legalMoves.includes(square)) {
      // Detect promotion: pawn moving to last rank
      const piece = game.get(selectedSquare);
      const isPromotion = piece?.type === "p" && (square[1] === "8" || square[1] === "1");
      if (isPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      executeMove(selectedSquare, square);
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotionSelect = (piece: PromotionPiece) => {
    if (!pendingPromotion) return;
    executeMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
  };

  const offerDraw = async () => {
    if (!user || !onlineGame || drawOfferedByMe) return;
    setDrawOfferedByMe(true);
    await supabase.from("game_messages").insert({
      game_id: onlineGame.id, user_id: user.id, message: "__draw_offer__",
    });
    toast({ title: "Draw offered", description: "Waiting for opponent..." });
  };

  const acceptDraw = async () => {
    if (!user || !onlineGame || !drawOfferedByOpponent) return;
    await supabase.from("game_messages").insert({
      game_id: onlineGame.id, user_id: user.id, message: "__draw_accept__",
    });
    setDrawOfferedByOpponent(false);
    endGame("1/2-1/2", "agreement");
    playChessSound("gameOver");
  };

  const declineDraw = async () => {
    if (!user || !onlineGame || !drawOfferedByOpponent) return;
    await supabase.from("game_messages").insert({
      game_id: onlineGame.id, user_id: user.id, message: "__draw_decline__",
    });
    setDrawOfferedByOpponent(false);
  };

  const resetAll = () => {
    resetOnline();
    gameRef.current = new Chess();
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setChatMessages([]);
    setTimeoutWinner(null);
    setGameStarted(false);
    setWhiteTime(tc.seconds);
    setBlackTime(tc.seconds);
    setOpponentProfile(null);
    setDrawOfferedByMe(false);
    setDrawOfferedByOpponent(false);
  };

  const activeClockColor = isGameOver || !gameStarted ? null : game.turn();
  const lastMove = onlineGame?.last_move_from && onlineGame?.last_move_to
    ? { from: onlineGame.last_move_from, to: onlineGame.last_move_to } : null;

  // Detailed end-of-game label.
  // Honors end_reason from the server (resignation/timeout/agreement/etc) so the
  // banner says exactly WHY the game ended, not just who won.
  const winnerWord = onlineGame?.result === "1-0" ? "White" : onlineGame?.result === "0-1" ? "Black" : null;
  const endReason = (onlineGame as any)?.end_reason as string | undefined;
  const endReasonLabel: Record<string, string> = {
    checkmate: "by checkmate",
    resignation: "by resignation",
    timeout: "on time",
    stalemate: "by stalemate",
    threefold: "by threefold repetition",
    fifty_move: "by fifty-move rule",
    insufficient_material: "by insufficient material",
    agreement: "by agreement",
  };
  const endReasonText = endReason ? endReasonLabel[endReason] ?? "" : "";

  const statusText = onlineGame?.status === "finished"
    ? onlineGame.result === "1/2-1/2"
      ? `Draw ${endReasonText}`.trim()
      : `${winnerWord} wins ${endReasonText}`.trim()
    : timeoutWinner ? `${timeoutWinner} wins on time!`
    : game.isCheckmate() ? `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`
    : game.isStalemate() ? "Stalemate"
    : game.isThreefoldRepetition() ? "Draw by threefold repetition"
    : game.isInsufficientMaterial() ? "Draw by insufficient material"
    : game.isDraw() ? "Draw by fifty-move rule"
    : game.isCheck() ? `${game.turn() === "w" ? "White" : "Black"} is in check!`
    : onlineStatus === "playing" && game.turn() === myColor ? "Your turn"
    : onlineStatus === "playing" ? "Opponent's turn" : "";

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <Wifi className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Play Online</h1>
          <p className="text-muted-foreground mb-6">Log in to play against other players online.</p>
          <Button onClick={() => navigate("/login")}>Log In to Play</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── LOBBY ──
  if (onlineStatus === "idle" || onlineStatus === "searching") {
    return (
      <div className="min-h-screen bg-background relative">
        <DynamicBackground />
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
              Play <span className="text-gradient-gold">Online</span>
            </h1>
            <p className="text-sm text-muted-foreground">Find a real opponent and compete</p>
          </motion.div>

          <div className="max-w-lg mx-auto space-y-5">
            {/* Quick Start */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <button
                onClick={() => searchMatch(timeControlIdx)}
                disabled={onlineStatus === "searching"}
                className="w-full rounded-xl bg-primary text-primary-foreground py-4 text-lg font-bold shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-5 h-5" /> Play Now — Instant Match
              </button>
            </motion.div>

            {/* Time Control */}
            <div className="rounded-xl border border-border/50 bg-card/80 p-5 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" /> Time Control
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {TIME_CONTROLS.filter((_, i) => i < TIME_CONTROLS.length - 1).map((t, i) => (
                  <button key={t.label} onClick={() => { setTimeControlIdx(i); setWhiteTime(TIME_CONTROLS[i].seconds); setBlackTime(TIME_CONTROLS[i].seconds); }}
                    disabled={onlineStatus === "searching"}
                    className={`rounded-lg px-2 py-2.5 text-center transition-all border text-xs font-medium ${timeControlIdx === i ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/30"} disabled:opacity-50`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 text-[10px] text-muted-foreground justify-center">
                <span className="px-2 py-0.5 rounded bg-muted/30">Bullet</span>
                <span className="px-2 py-0.5 rounded bg-muted/30">Blitz</span>
                <span className="px-2 py-0.5 rounded bg-muted/30">Rapid</span>
                <span className="px-2 py-0.5 rounded bg-muted/30">Classical</span>
              </div>
            </div>

            {/* Game Mode */}
            <div className="rounded-xl border border-border/50 bg-card/80 p-5 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Game Mode</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setGameMode("rated")}
                  className={`rounded-lg p-3 border text-sm font-medium transition-all ${gameMode === "rated" ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}>
                  ⚔️ Rated
                </button>
                <button onClick={() => setGameMode("casual")}
                  className={`rounded-lg p-3 border text-sm font-medium transition-all ${gameMode === "casual" ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}>
                  🎮 Casual
                </button>
              </div>
            </div>

            {/* Player Card */}
            <div className="rounded-xl border border-border/50 bg-card/80 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{profile?.display_name || "Player"}</p>
                <p className="text-xs text-muted-foreground">Rating: {profile?.rating || 1200} ELO</p>
              </div>
            </div>

            {onlineError && <p className="text-sm text-destructive text-center">{onlineError}</p>}

            {onlineStatus === "searching" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Searching for opponent…</span>
                </div>
                <p className="text-xs text-muted-foreground">Looking for a player near your rating</p>
                <Button variant="outline" onClick={cancelSearch} className="w-full">Cancel Search</Button>
              </motion.div>
            ) : (
              <Button className="w-full" size="lg" onClick={() => searchMatch(timeControlIdx)}>
                <Wifi className="mr-2 h-5 w-5" /> Find Opponent
              </Button>
            )}

            {/* Spectate link */}
            <Link to="/spectate" className="block">
              <button className="w-full rounded-xl border border-border/50 bg-card/80 p-3 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" /> Watch Live Games
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── FOCUS MODE ──
  if (focusMode && (onlineStatus === "playing" || onlineStatus === "finished")) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
        <button onClick={() => setFocusMode(false)} className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-card/80 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm">
          <MonitorOff className="w-3.5 h-3.5 inline mr-1.5" /> Exit Focus
        </button>
        <div className="w-full max-w-[min(90vw,560px)]">
          {/* Opponent clock */}
          {!unlimited && (
            <div className="flex justify-end mb-2">
              <span className={`font-mono text-lg font-bold ${(boardFlipped ? whiteTime : blackTime) <= 30 ? "text-destructive" : "text-foreground"}`}>
                {formatClock(boardFlipped ? whiteTime : blackTime)}
              </span>
            </div>
          )}
          <ChessBoard
            game={game}
            flipped={boardFlipped}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isGameOver={isGameOver}
            isPlayerTurn={onlineStatus === "playing" && game.turn() === myColor}
            hintSquare={null}
            onSquareClick={handleSquareClick}
            className="w-full max-w-[min(94vw,calc(100svh-8rem),620px)] mx-auto"
          />
          {/* Player clock */}
          {!unlimited && (
            <div className="flex justify-end mt-2">
              <span className={`font-mono text-lg font-bold ${(boardFlipped ? blackTime : whiteTime) <= 30 ? "text-destructive" : "text-foreground"}`}>
                {formatClock(boardFlipped ? blackTime : whiteTime)}
              </span>
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground font-mono">{statusText}</p>
        <ChessClock whiteTime={whiteTime} blackTime={blackTime} activeColor={activeClockColor} isGameOver={isGameOver} onTimeOut={handleTimeOut} setWhiteTime={setWhiteTime} setBlackTime={setBlackTime} unlimited={unlimited} />
        {isGameOver && (
          <Button className="mt-4" onClick={resetAll}><RotateCcw className="h-4 w-4 mr-2" /> New Game</Button>
        )}
      </div>
    );
  }

  // ── GAME VIEW ──
  // Full-viewport play: board fills the entire screen height/width.
  // Sidebar shrinks to a narrow column on desktop and collapses below on mobile.
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-2 sm:px-3 pt-14 sm:pt-16 pb-3">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] gap-3 lg:items-start">
          {/* Board + Clocks — fills the full viewport */}
          <div className="min-w-0 flex flex-col items-center">
            <div className="w-full max-w-[min(98vw,calc(100svh-7rem))] space-y-1.5">
            {/* Opponent info */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/80 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center text-xs">
                  {boardFlipped ? "♔" : "♚"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{opponentProfile?.display_name || "Opponent"}</p>
                  <p className="text-[10px] text-muted-foreground">{opponentProfile?.rating || "?"} ELO</p>
                </div>
              </div>
              {!unlimited && (
                <span className={`font-mono text-lg font-bold ${(boardFlipped ? whiteTime : blackTime) <= 30 ? "text-destructive" : "text-foreground"}`}>
                  {formatClock(boardFlipped ? whiteTime : blackTime)}
                </span>
              )}
            </div>

            {/* Board — same component & sizing used everywhere on the site,
                so it always picks up the user's chosen piece set + theme. */}
            <div ref={boardFocusRef} className="relative w-full flex justify-center">
              <ChessBoard
                game={game}
                flipped={boardFlipped}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isGameOver={isGameOver}
                isPlayerTurn={onlineStatus === "playing" && game.turn() === myColor}
                hintSquare={null}
                onSquareClick={handleSquareClick}
                className="w-full max-w-[min(98vw,calc(100svh-9rem))] mx-auto"
              />
              <GameStatusOverlay
                kind={
                  onlineStatus === "finished" || timeoutWinner
                    ? (onlineGame?.result === "1/2-1/2" || game.isDraw() || game.isStalemate() ? "draw" : "checkmate")
                    : game.isCheckmate() ? "checkmate"
                    : game.isDraw() || game.isStalemate() ? "draw"
                    : game.isCheck() ? "check"
                    : null
                }
                subtitle={isGameOver ? statusText : undefined}
              />
            </div>

            {/* Player info */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/80 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs">
                  {boardFlipped ? "♚" : "♔"}
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{profile?.display_name || "You"}</p>
                  <p className="text-[10px] text-muted-foreground">{profile?.rating || 1200} ELO</p>
                </div>
              </div>
              {!unlimited && (
                <span className={`font-mono text-lg font-bold ${(boardFlipped ? blackTime : whiteTime) <= 30 ? "text-destructive" : "text-foreground"}`}>
                  {formatClock(boardFlipped ? blackTime : whiteTime)}
                </span>
              )}
            </div>

            {/* Clock ticker (hidden) */}
            <ChessClock
              whiteTime={whiteTime} blackTime={blackTime}
              activeColor={activeClockColor} isGameOver={isGameOver}
              onTimeOut={handleTimeOut}
              setWhiteTime={setWhiteTime} setBlackTime={setBlackTime}
              unlimited={unlimited}
            />
            </div>
          </div>

          {/* Sidebar: Status, Moves, Chat, Controls */}
          <div className="w-full space-y-3">
            {/* Status */}
            <div className={`rounded-xl border p-3 text-center text-sm font-medium ${isGameOver ? "border-primary/30 bg-primary/5 text-primary" : "border-border/50 bg-card/80 text-foreground"}`}>
              {statusText}
            </div>

            {/* Move History */}
            <div className="rounded-xl border border-border/50 bg-card/80 p-3 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Moves</p>
              <div className="flex flex-wrap gap-1">
                {moveHistory.map((san, i) => (
                  <span key={i} className="text-xs font-mono text-foreground">
                    {i % 2 === 0 && <span className="text-muted-foreground mr-0.5">{Math.floor(i / 2) + 1}.</span>}
                    {san}
                  </span>
                ))}
                {moveHistory.length === 0 && <span className="text-xs text-muted-foreground">No moves yet</span>}
              </div>
            </div>

            {/* Draw Offer — fixed floating chip so the page never shifts when offered.
                Positioned next to the board (top-right of viewport on desktop, top on mobile). */}
            {drawOfferedByOpponent && !isGameOver && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-50 rounded-xl border border-primary/40 bg-card/95 backdrop-blur-md shadow-2xl p-3 w-[min(92vw,320px)] space-y-2 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-medium text-primary">Opponent offers a draw</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="flex-1" onClick={acceptDraw}>Accept</Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={declineDraw}>Decline</Button>
                </div>
              </div>
            )}

            {/* Game Controls */}
            {!isGameOver && onlineStatus === "playing" && (
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" size="sm" className="flex-1 min-w-[100px] gap-1" onClick={resign}>
                  <Flag className="h-3.5 w-3.5" /> Resign
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[100px] gap-1"
                  onClick={offerDraw}
                  disabled={drawOfferedByMe || drawOfferedByOpponent}
                >
                  <Handshake className="h-3.5 w-3.5" />
                  {drawOfferedByMe ? "Draw offered…" : "Offer Draw"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setFocusMode(true)}>
                  <Eye className="h-3.5 w-3.5" /> Focus
                </Button>
              </div>
            )}

            {isGameOver && ratingResult && (
              <RatingChange result={ratingResult} ratingType="online" />
            )}

            {isGameOver && (
              <Button className="w-full" onClick={resetAll}>
                <RotateCcw className="h-4 w-4 mr-2" /> New Game
              </Button>
            )}

            {/* Chat */}
            <div className="rounded-xl border border-border/50 bg-card/80 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chat</p>
              <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
                {chatMessages.filter(m => !m.message.startsWith("__")).map(msg => (
                  <div key={msg.id} className={`text-xs ${msg.user_id === user?.id ? "text-primary" : "text-foreground"}`}>
                    <span className="font-medium">{msg.user_id === user?.id ? "You" : "Opponent"}:</span> {msg.message}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-1.5">
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Type a message…" className="h-8 text-xs" />
                <Button size="sm" variant="outline" onClick={sendChat} className="h-8 px-2">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <PromotionDialog
        isOpen={!!pendingPromotion}
        color={(myColor || "w") as "w" | "b"}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />
    </div>
  );
};

function formatClock(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default PlayOnline;
