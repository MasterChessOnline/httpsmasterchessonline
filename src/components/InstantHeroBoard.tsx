import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Flame, Maximize2, Minimize2, RotateCcw, Share2, Sparkles, X } from "lucide-react";
import ChessBoard from "@/components/chess/ChessBoard";
import ShareWinCard from "@/components/ShareWinCard";
import BotAvatar from "@/components/BotAvatar";
import { Button } from "@/components/ui/button";
import { BOT_PROFILES } from "@/lib/bots/profiles";
import { getBotMove, getBotThinkMs } from "@/lib/bots/bot-engine";
import { playChessSound } from "@/lib/chess-sounds";
import { celebrate } from "@/lib/celebrate";
import { recordGuestResult } from "@/lib/guestProgress";


/**
 * INSTANT HERO BOARD — the first thing a visitor sees on the homepage.
 * The board is live: the visitor's first move starts a real game against a
 * friendly bot. No clicks, no menus, no signup. When the game ends we offer,
 * in this order: save the result (free account), share it, play again.
 */

// The homepage free game is played against the weakest bot on the site, so a
// first-time visitor can actually win their very first game.
const HERO_BOT =
  BOT_PROFILES.find((b) => b.id === "newbie-nina") ??
  [...BOT_PROFILES].sort((a, b) => a.rating - b.rating)[0];

const STREAK_KEY = "mc_guest_streak";
const STREAK_DAY_KEY = "mc_guest_streak_day";
const LAST_RESULT_KEY = "mc_guest_last_result";

type Phase = "idle" | "playing" | "ended";
type Outcome = "win" | "loss" | "draw";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readStreak(): number {
  try {
    return Number(localStorage.getItem(STREAK_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

/** Bump the guest streak at most once per calendar day, on a win. */
function bumpStreak(): number {
  try {
    const day = todayKey();
    if (localStorage.getItem(STREAK_DAY_KEY) === day) return readStreak();
    const next = readStreak() + 1;
    localStorage.setItem(STREAK_KEY, String(next));
    localStorage.setItem(STREAK_DAY_KEY, day);
    return next;
  } catch {
    return readStreak();
  }
}

interface InstantHeroBoardProps {
  /**
   * Ad-traffic mode (used by /ig): show only the board until the first game
   * ends — no "create account" call to action competing with the game.
   */
  adMode?: boolean;
  /** Render the headline as an h2 (when the page already owns the h1). */
  headingLevel?: "h1" | "h2";
}

export default function InstantHeroBoard({
  adMode = false,
  headingLevel = "h1",
}: InstantHeroBoardProps = {}) {
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [streak, setStreak] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);
  const botTimer = useRef<number | null>(null);
  const [immersive, setImmersive] = useState(false);

  // Full screen keeps the SAME game — we only change how it is presented.
  const enterImmersive = useCallback(async () => {
    setImmersive(true);
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch {
      /* iOS Safari has no Fullscreen API — the overlay alone is enough. */
    }
  }, []);

  const exitImmersive = useCallback(async () => {
    setImmersive(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  // Native fullscreen exit (Android back gesture / Esc) must close the overlay too.
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // While immersive, hide the site chrome (navbar / bottom nav / footer) so the
  // board really owns the phone screen and nothing overlaps it.
  useEffect(() => {
    if (!immersive) return;
    document.body.setAttribute("data-game-active", "true");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.removeAttribute("data-game-active");
      document.body.style.overflow = prevOverflow;
    };
  }, [immersive]);


  // Returning guest: remind them of their streak / last game.
  useEffect(() => {
    setStreak(readStreak());
    try {
      const last = localStorage.getItem(LAST_RESULT_KEY);
      if (last) {
        const parsed = JSON.parse(last) as { outcome?: Outcome; day?: string };
        if (parsed?.day && parsed.day !== todayKey()) {
          setReturning(
            parsed.outcome === "win"
              ? "Welcome back — keep your streak alive, win one more."
              : "Welcome back — take your revenge on the bot.",
          );
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(
    () => () => {
      if (botTimer.current) window.clearTimeout(botTimer.current);
    },
    [],
  );

  const finish = useCallback((g: Chess) => {
    let result: Outcome = "draw";
    if (g.isCheckmate()) result = g.turn() === "b" ? "win" : "loss";
    setOutcome(result);
    setPhase("ended");
    playChessSound(result === "win" ? "victory" : "gameOver");
    if (result === "win") {
      celebrate("big");
      setStreak(bumpStreak());
    }
    // Durable guest record for the signup screen's "unsaved progress" line.
    recordGuestResult(result, HERO_BOT?.name);
    try {
      const prev = Number(localStorage.getItem("mc_guest_games_played") || "0");
      localStorage.setItem("mc_guest_games_played", String(prev + 1));
      if (result === "win") {
        const w = Number(localStorage.getItem("mc_guest_wins") || "0");
        localStorage.setItem("mc_guest_wins", String(w + 1));
      }
      localStorage.setItem(
        LAST_RESULT_KEY,
        JSON.stringify({ outcome: result, day: todayKey(), moves: Math.ceil(g.history().length / 2) }),
      );
    } catch {
      /* ignore quota */
    }
  }, []);

  const refresh = useCallback(
    (g: Chess) => {
      setFen(g.fen());
      if (g.isGameOver()) finish(g);
    },
    [finish],
  );

  const playBotMove = useCallback(
    async (g: Chess) => {
      if (g.isGameOver()) return;
      setBotThinking(true);
      const start = Date.now();
      try {
        const decision = await getBotMove(g, HERO_BOT);
        const think = getBotThinkMs(HERO_BOT, {
          baseSeconds: 2,
          ply: g.history().length,
          fromBook: decision.fromBook,
          critical: false,
        });
        const elapsed = Date.now() - start;
        // Snappy first replies so the visitor never waits on the homepage.
        const cap = g.history().length <= 4 ? 700 : think;
        const wait = Math.max(250, Math.min(cap, think) - elapsed);
        botTimer.current = window.setTimeout(() => {
          const move = g.move(decision.move);
          if (move) {
            setLastMove({ from: move.from, to: move.to });
            playChessSound(move.captured ? "capture" : "move");
          }
          setBotThinking(false);
          refresh(g);
        }, wait);
      } catch {
        // Stability guard: never leave the homepage board frozen — if the
        // engine fails or times out, play a legal move so the game continues.
        const legal = g.moves();
        if (legal.length) {
          const move = g.move(legal[Math.floor(Math.random() * legal.length)]);
          if (move) {
            setLastMove({ from: move.from, to: move.to });
            playChessSound(move.captured ? "capture" : "move");
          }
        }
        setBotThinking(false);
        refresh(g);
      }
    },
    [refresh],
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (phase === "ended" || botThinking) return;
      if (game.turn() !== "w") return;

      const piece = game.get(square);
      if (selectedSquare && legalMoves.includes(square)) {
        const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move) {
          if (phase === "idle") setPhase("playing");
          setLastMove({ from: move.from, to: move.to });
          playChessSound(move.captured ? "capture" : "move");
          setSelectedSquare(null);
          setLegalMoves([]);
          setReturning(null);
          refresh(game);
          if (!game.isGameOver()) playBotMove(game);
          return;
        }
      }
      if (piece && piece.color === "w") {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }) as { to: Square }[];
        setLegalMoves(moves.map((m) => m.to));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [game, selectedSquare, legalMoves, phase, botThinking, playBotMove, refresh],
  );

  const resetGame = () => {
    if (botTimer.current) window.clearTimeout(botTimer.current);
    const g = new Chess();
    setGame(g);
    setFen(g.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setOutcome(null);
    setBotThinking(false);
    setPhase("idle");
  };

  const moveNumber = useMemo(() => Math.ceil(game.history().length / 2), [game, fen]);

  return (
    <section
      className={
        immersive
          ? "fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-background px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          : "relative z-10 px-4 pt-6 pb-2"
      }
      aria-label="Play chess instantly"
    >
      <div className={immersive ? "mx-auto w-full max-w-2xl" : "container mx-auto max-w-3xl"}>
        <div
          className={
            immersive
              ? "rounded-2xl border border-primary/20 bg-card/40 p-2 sm:p-4"
              : "rounded-3xl border border-primary/25 bg-card/60 backdrop-blur-xl p-4 sm:p-6 shadow-[0_0_60px_hsl(43_90%_55%/0.12)]"
          }
        >
          {immersive && (
            <div className="mb-2 flex items-center justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={exitImmersive}
                className="h-9 rounded-lg text-muted-foreground"
                aria-label="Exit full screen"
              >
                <Minimize2 className="h-4 w-4 mr-1" /> Exit full screen
              </Button>
            </div>
          )}

          <div className="text-center">
            {immersive ? null : headingLevel === "h1" ? (
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Play free online chess — <span className="text-gradient-gold">no registration</span>
              </h1>
            ) : (
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Play free online chess — <span className="text-gradient-gold">no registration</span>
              </h2>
            )}

            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              {phase === "idle"
                ? "Make a move on the board below — your game starts instantly."
                : phase === "playing"
                  ? `Move ${moveNumber} · playing ${HERO_BOT.name} (${HERO_BOT.rating})`
                  : outcome === "win"
                    ? "You won. Save it, share it, or run it back."
                    : outcome === "loss"
                      ? "Close one. Try again — the board is ready."
                      : "Drawn game. Run it back?"}
            </p>
          </div>

          <AnimatePresence>
            {returning && phase === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-primary"
              >
                <Flame className="h-4 w-4" />
                {returning}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <BotAvatar
                avatar={HERO_BOT.avatar}
                alt={HERO_BOT.name}
                className="h-8 w-8 shrink-0 ring-1 ring-primary/40"
                emojiClassName="text-lg shrink-0"
              />
              <span className="font-semibold text-foreground truncate">{HERO_BOT.name}</span>
              <span className="text-muted-foreground shrink-0">{HERO_BOT.rating}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 text-primary font-semibold">
                  <Flame className="h-4 w-4" /> {streak}-day streak
                </span>
              )}
              {botThinking && <span className="animate-pulse">thinking…</span>}
            </div>
          </div>

          <div
            className={
              immersive
                ? "mt-2 w-full mx-auto max-w-[min(100vw-1rem,calc(100svh-13rem),640px)]"
                : "mt-3 w-full mx-auto max-w-[min(100vw-3rem,520px)]"
            }
          >
            <ChessBoard
              game={game}
              flipped={false}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isGameOver={phase === "ended"}
              isPlayerTurn={game.turn() === "w" && !botThinking && phase !== "ended"}
              onSquareClick={handleSquareClick}
            />
          </div>

          {phase === "ended" ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Link to="/signup" className="w-full">
                <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Crown className="h-4 w-4 mr-2" />
                  Save this result
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-primary/30"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" className="w-full h-12 rounded-xl" onClick={resetGame}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Play again
              </Button>
            </div>
          ) : (
            <>
              {!adMode && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link to="/signup" className="w-full">
                    <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                      <Crown className="h-4 w-4 mr-2" />
                      Create free account
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-primary/30"
                    onClick={immersive ? exitImmersive : enterImmersive}
                  >
                    {immersive ? (
                      <>
                        <Minimize2 className="h-4 w-4 mr-2" />
                        Exit full screen
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Free game — full screen
                      </>
                    )}
                  </Button>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Free · no signup · no ads
                </span>
                {phase === "playing" && (
                  <button onClick={resetGame} className="hover:text-primary underline-offset-2 hover:underline">
                    Restart
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ShareWinCard
        open={shareOpen}
        onOpenChange={setShareOpen}
        playerName="Guest"
        opponentName={HERO_BOT.name}
        result={outcome ?? "draw"}
        moves={moveNumber}
        timeControl="Instant"
      />

      <script
        type="application/ld+json"
        // Tells Google the homepage itself is a place to play chess right now.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PlayAction",
            name: "Play free online chess without registration",
            agent: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live/" },
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://masterchess.live/",
              actionPlatform: [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform",
              ],
            },
          }),
        }}
      />
    </section>
  );
}
