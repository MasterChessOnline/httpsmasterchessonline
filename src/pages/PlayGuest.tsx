import Seo from "@/components/Seo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Trophy, RotateCcw, LogIn } from "lucide-react";
import ChessBoard from "@/components/chess/ChessBoard";
import { BOARD_CONTAINER_CLASS } from "@/lib/board-sizing";
import { Button } from "@/components/ui/button";
import { BOT_PROFILES } from "@/lib/bots/profiles";
import { getBotMove, getBotThinkMs } from "@/lib/bots/bot-engine";
import { playChessSound } from "@/lib/chess-sounds";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Easy bot — friendly first experience
const GUEST_BOT = BOT_PROFILES.find((b) => b.id === "pawn-pablo") ?? BOT_PROFILES[1];

type Phase = "playing" | "ended";

const RESULT_LABEL: Record<string, string> = {
  win: "You won!",
  loss: "Bot won this one",
  draw: "Draw",
};

export default function PlayGuest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user already signed in, take them to the real Play page.
  useEffect(() => {
    if (user) navigate("/play", { replace: true });
  }, [user, navigate]);

  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [phase, setPhase] = useState<Phase>("playing");
  const [outcome, setOutcome] = useState<"win" | "loss" | "draw" | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const botMoveTimer = useRef<number | null>(null);

  const refresh = useCallback((g: Chess) => {
    setFen(g.fen());
    if (g.isGameOver()) {
      let result: "win" | "loss" | "draw" = "draw";
      if (g.isCheckmate()) result = g.turn() === "b" ? "win" : "loss";
      setOutcome(result);
      setPhase("ended");
      playChessSound(result === "win" ? "victory" : "gameOver");
    }
  }, []);

  const playBotMove = useCallback(async (g: Chess) => {
    if (g.isGameOver()) return;
    setBotThinking(true);
    const start = Date.now();
    try {
      const decision = await getBotMove(g, GUEST_BOT);
      const think = getBotThinkMs(GUEST_BOT, {
        baseSeconds: 2,
        ply: g.history().length,
        fromBook: decision.fromBook,
        critical: false,
      });
      const elapsed = Date.now() - start;
      const wait = Math.max(300, think - elapsed);
      botMoveTimer.current = window.setTimeout(() => {
        const move = g.move(decision.move);
        if (move) {
          setLastMove({ from: move.from, to: move.to });
          playChessSound(move.captured ? "capture" : "move");
        }
        setBotThinking(false);
        refresh(g);
      }, wait);
    } catch {
      setBotThinking(false);
    }
  }, [refresh]);

  useEffect(() => () => {
    if (botMoveTimer.current) window.clearTimeout(botMoveTimer.current);
  }, []);

  const handleSquareClick = useCallback((square: Square) => {
    if (phase !== "playing" || botThinking) return;
    if (game.turn() !== "w") return; // guest plays white

    // If selecting own piece
    const piece = game.get(square);
    if (selectedSquare && legalMoves.includes(square)) {
      // Try to move
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setLastMove({ from: move.from, to: move.to });
        playChessSound(move.captured ? "capture" : "move");
        setSelectedSquare(null);
        setLegalMoves([]);
        refresh(game);
        // bot replies
        if (!game.isGameOver()) playBotMove(game);
        return;
      }
    }
    if (piece && piece.color === "w") {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true }) as any[];
      setLegalMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [game, selectedSquare, legalMoves, phase, botThinking, playBotMove, refresh]);

  const resetGame = () => {
    const g = new Chess();
    setGame(g);
    setFen(g.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setOutcome(null);
    setPhase("playing");
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setError(result.error.message);
      setGoogleLoading(false);
    }
  };

  const handleEmailSignup = () => navigate("/signup");

  const moveCount = useMemo(() => Math.ceil(game.history().length / 2), [game, fen]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Seo
        path="/play-guest"
        title="Play Chess Instantly — No Signup Needed | MasterChess"
        description="Play a free game of chess against our friendly bot. No account, no email. Just click and play."
      />

      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <Link to="/" className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-foreground tracking-wide">
            Master<span className="text-gradient-gold">Chess</span>
          </span>
        </Link>
        <button
          onClick={() => navigate("/signup")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Sign in
        </button>
      </header>

      <main className="max-w-md mx-auto px-3 py-4 space-y-4">
        {/* Bot strip */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-card/40 border border-border/40 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{GUEST_BOT.avatar}</span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">{GUEST_BOT.name}</div>
              <div className="text-[11px] text-muted-foreground">Rating {GUEST_BOT.rating} · {GUEST_BOT.countryFlag}</div>
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {botThinking ? "thinking…" : `move ${moveCount}`}
          </div>
        </div>

        {/* Board */}
        <div className={BOARD_CONTAINER_CLASS}>
          <ChessBoard
            game={game}
            flipped={false}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isGameOver={phase === "ended"}
            isPlayerTurn={game.turn() === "w" && !botThinking && phase === "playing"}
            onSquareClick={handleSquareClick}
          />
        </div>

        {/* You strip */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-card/40 border border-border/40 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎮</span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">You (Guest)</div>
              <div className="text-[11px] text-muted-foreground">No account — playing as White</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetGame}
            className="h-8 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> New
          </Button>
        </div>

        {/* Soft CTA above the fold once they've made 5+ moves */}
        {moveCount >= 4 && phase === "playing" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-[12px] text-muted-foreground"
          >
            <Sparkles className="inline h-3.5 w-3.5 text-primary mr-1" />
            Save this game + claim <span className="text-primary font-semibold">200 coins</span> by signing up
          </motion.div>
        )}
      </main>

      {/* End-game signup modal */}
      <AnimatePresence>
        {phase === "ended" && outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 22 }}
              className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl text-center space-y-5"
            >
              <div className="space-y-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 border border-primary/30 mx-auto">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {RESULT_LABEL[outcome]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Save your progress, earn <span className="text-primary font-semibold">200 coins</span>, and unlock real opponents.
                </p>

                {/* Streak teaser */}
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                    🔥 Day 1 streak started
                  </div>
                  <div className="flex justify-center gap-1.5">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-6 w-6 rounded-md border ${
                          i === 0
                            ? "bg-primary/80 border-primary text-[10px] font-bold text-background flex items-center justify-center"
                            : "bg-card/40 border-border/60"
                        }`}
                      >
                        {i === 0 ? "1" : ""}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Sign up to keep it · day 7 = <span className="text-primary font-semibold">2× coins</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  className="w-full h-11 bg-white text-gray-900 hover:bg-white/90 font-medium"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                >
                  <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleEmailSignup}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign up with email
                </Button>
                <button
                  type="button"
                  onClick={resetGame}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Play another game as guest
                </button>
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
