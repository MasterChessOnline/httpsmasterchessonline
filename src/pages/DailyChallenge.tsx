import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target, Flame, Zap, Trophy, RotateCcw, Lightbulb,
  CheckCircle, XCircle, Clock, Calendar, Loader2, Coins, Sparkles, Crown, Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getDailyTierPuzzles,
  DAILY_TIERS,
  type DailyTier,
  type PuzzlePosition,
} from "@/lib/masterchess-puzzles";
import MiniFenBoard from "@/components/MiniFenBoard";

/* ─────────────────────────── persistence ─────────────────────────── */

const STREAK_KEY = "mc.dailyMate.streak.v1";
const COINS_KEY = "mc.coins.v1";
const XP_KEY = "mc.xp.v1";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function solvedKey(tier: DailyTier) {
  return `mc.daily.solved.${tier}.v1`;
}
function bestKey(tier: DailyTier) {
  return `mc.daily.best.${tier}.v1`;
}
function isSolvedToday(tier: DailyTier): boolean {
  try { return localStorage.getItem(solvedKey(tier)) === todayStr(); } catch { return false; }
}
function loadStreak(): { streak: number; lastSolvedDay: string | null } {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { streak: 0, lastSolvedDay: null };
    return JSON.parse(raw);
  } catch { return { streak: 0, lastSolvedDay: null }; }
}
function markSolvedToday(tier: DailyTier, xp: number, coins: number) {
  const today = todayStr();
  try {
    localStorage.setItem(solvedKey(tier), today);
    const cur = loadStreak();
    let next = cur;
    if (cur.lastSolvedDay !== today) {
      const y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
      const yesterday = y.toISOString().split("T")[0];
      next = {
        streak: cur.lastSolvedDay === yesterday ? cur.streak + 1 : 1,
        lastSolvedDay: today,
      };
      localStorage.setItem(STREAK_KEY, JSON.stringify(next));
    }
    const newXp = (parseInt(localStorage.getItem(XP_KEY) || "0", 10) || 0) + xp;
    const newCoins = (parseInt(localStorage.getItem(COINS_KEY) || "0", 10) || 0) + coins;
    localStorage.setItem(XP_KEY, String(newXp));
    localStorage.setItem(COINS_KEY, String(newCoins));
    return { streak: next, totalXp: newXp, totalCoins: newCoins };
  } catch {
    return { streak: loadStreak(), totalXp: 0, totalCoins: 0 };
  }
}
function secondsUntilLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

/* ─────────────────────────── solver ─────────────────────────── */

interface SolverProps {
  puzzle: PuzzlePosition;
  tier: typeof DAILY_TIERS[number];
  onSolved?: (result: { time: number; accuracy: number; combo: number }) => void;
  onBack: () => void;
  replayMode?: boolean;
}

function PuzzleSolver({ puzzle, tier, onSolved, onBack, replayMode }: SolverProps) {
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [moveIndex, setMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [status, setStatus] = useState<"playing" | "solved" | "failed">("playing");
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timer, setTimer] = useState(0);
  const [combo, setCombo] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const reportedRef = useRef(false);

  useEffect(() => { reset(); /* eslint-disable-next-line */ }, [puzzle.fen]);

  useEffect(() => {
    if (status !== "playing") return;
    const i = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [status]);

  const playerMoves = puzzle.solutionUci.filter((_, i) => i % 2 === 0).length;
  const accuracy = attempts === 0 ? 100 : Math.max(0, Math.round((playerMoves / attempts) * 100));

  useEffect(() => {
    if (status === "solved" && !reportedRef.current) {
      reportedRef.current = true;
      onSolved?.({ time: timer, accuracy, combo });
    }
  }, [status, onSolved, timer, accuracy, combo]);

  function reset() {
    setGame(new Chess(puzzle.fen));
    setMoveIndex(0);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setStatus("playing");
    setHintSquare(null);
    setHintsUsed(0);
    setTimer(0);
    setCombo(0);
    setAttempts(0);
    reportedRef.current = false;
  }

  const playerTurn = moveIndex % 2 === 0;

  useEffect(() => {
    if (status !== "playing") return;
    if (playerTurn) return;
    if (moveIndex >= puzzle.solutionUci.length) return;
    const t = setTimeout(() => {
      const uci = puzzle.solutionUci[moveIndex];
      const next = new Chess(game.fen());
      const mv = next.move({
        from: uci.slice(0, 2), to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : undefined,
      });
      if (mv) {
        setGame(next);
        setLastMove({ from: mv.from, to: mv.to });
        setMoveIndex((i) => i + 1);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [playerTurn, moveIndex, status, game, puzzle.solutionUci]);

  const onSquareClick = useCallback((square: Square) => {
    if (status !== "playing" || !playerTurn) return;
    const piece = game.get(square);
    if (selectedSquare) {
      const expected = puzzle.solutionUci[moveIndex];
      const tryUci = `${selectedSquare}${square}`;
      const isMatch =
        tryUci === expected ||
        tryUci + "q" === expected ||
        tryUci === expected.slice(0, 4);
      setAttempts((a) => a + 1);
      if (isMatch) {
        const next = new Chess(game.fen());
        const mv = next.move({
          from: selectedSquare, to: square,
          promotion: expected.length > 4 ? expected[4] : "q",
        });
        if (mv) {
          setGame(next);
          setLastMove({ from: mv.from, to: mv.to });
          setSelectedSquare(null);
          setLegalMoves([]);
          setHintSquare(null);
          setCombo((c) => c + 1);
          const newIdx = moveIndex + 1;
          setMoveIndex(newIdx);
          if (newIdx >= puzzle.solutionUci.length) setStatus("solved");
        }
      } else {
        setCombo(0);
        setStatus("failed");
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m: any) => m.to));
    }
  }, [selectedSquare, game, status, moveIndex, puzzle.solutionUci, playerTurn]);

  const handleHint = () => {
    if (!playerTurn || status !== "playing") return;
    const move = puzzle.solutionUci[moveIndex];
    if (!move) return;
    setHintSquare(move.slice(0, 2) as Square);
    setHintsUsed((n) => n + 1);
  };

  const fmt = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
  const totalPlies = puzzle.solutionUci.length;
  const playerPlies = Math.ceil(totalPlies / 2);
  const playerMovesDone = Math.ceil(moveIndex / 2);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3 md:space-y-4 flex flex-col items-center">
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-3 md:p-4 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">← Tiers</Button>
              <h2 className="font-display text-base md:text-lg font-semibold text-foreground">
                {tier.label} · Mate in {tier.matesIn}
              </h2>
              <Badge className={`bg-${tier.color}-500/20 text-${tier.color}-300 border-${tier.color}-500/40`}>
                +{tier.xp} XP · +{tier.coins} 🪙
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {fmt(timer)}</span>
              <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-orange-400" /> {combo}x</span>
            </div>
          </div>
          <p className="text-sm text-foreground/90">
            {puzzle.side === "w" ? "⬜ White" : "⬛ Black"} to play — force checkmate in {tier.matesIn}.
          </p>
          <div className="mt-2 text-xs text-muted-foreground font-mono">
            Move {playerMovesDone}/{playerPlies} · Accuracy {accuracy}%
          </div>
        </div>

        {/* Board sized to match Play (Play Online + vs Bots) — large, responsive, capped to viewport. */}
        <div className="w-full max-w-[min(96vw,560px)] lg:max-w-[min(calc(100svh-8rem),72vw,1200px)]">
          <ChessBoard
            game={game}
            flipped={puzzle.side === "b"}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isGameOver={status !== "playing"}
            isPlayerTurn={status === "playing" && playerTurn}
            hintSquare={hintSquare}
            onSquareClick={onSquareClick}
            className={BOARD_CONTAINER_CLASS}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {status === "playing" && playerTurn && (
            <Button variant="outline" size="sm" onClick={handleHint}>
              <Lightbulb className="mr-2 h-4 w-4" /> Hint ({hintsUsed})
            </Button>
          )}
          {status !== "playing" && (
            <Button size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Restart
            </Button>
          )}
        </div>

        <AnimatePresence>
          {status === "solved" && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center"
            >
              <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
              <h3 className="font-display text-xl font-bold text-foreground mb-1">
                {tier.label} Solved! 🎉
              </h3>
              <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mt-3">
                <div className="rounded-lg bg-background/40 border border-border/40 p-2">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="font-mono font-bold text-foreground">{fmt(timer)}</div>
                </div>
                <div className="rounded-lg bg-background/40 border border-border/40 p-2">
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                  <div className="font-mono font-bold text-emerald-400">{accuracy}%</div>
                </div>
                <div className="rounded-lg bg-background/40 border border-border/40 p-2">
                  <div className="text-xs text-muted-foreground">Combo</div>
                  <div className="font-mono font-bold text-orange-400">{combo}x</div>
                </div>
              </div>
              {!replayMode && (
                <div className="mt-3 flex items-center justify-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                    <Sparkles className="h-4 w-4" /> +{tier.xp} XP
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <Coins className="h-4 w-4" /> +{tier.coins}
                  </span>
                </div>
              )}
            </motion.div>
          )}
          {status === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center"
            >
              <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
              <h3 className="font-display text-xl font-bold text-foreground mb-1">Wrong Move</h3>
              <p className="text-sm text-muted-foreground">
                Combo broken. Restart to try the line again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className="rounded-xl border border-border/50 bg-card/80 p-3 md:p-4">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" /> Tips
          </h3>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Checks, captures, threats — always first.</li>
            <li>• Visualize the king's escape squares.</li>
            <li>• Sacrifices often open the path to mate.</li>
            <li>• In Hard/Extreme tiers the first move is usually quiet.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── tier hub ─────────────────────────── */

const DailyChallenge = () => {
  const [puzzles, setPuzzles] = useState<Record<DailyTier, PuzzlePosition | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<DailyTier | null>(null);
  const [solvedMap, setSolvedMap] = useState<Record<DailyTier, boolean>>({
    easy: false, medium: false, hard: false, extreme: false,
  });
  const [streak, setStreak] = useState(loadStreak());
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilLocalMidnight());

  useEffect(() => {
    getDailyTierPuzzles()
      .then((p) => setPuzzles(p))
      .catch((e) => setError(e?.message || "Failed to load puzzles"))
      .finally(() => setLoading(false));

    setSolvedMap({
      easy: isSolvedToday("easy"),
      medium: isSolvedToday("medium"),
      hard: isSolvedToday("hard"),
      extreme: isSolvedToday("extreme"),
    });
    const t = setInterval(() => setSecondsLeft(secondsUntilLocalMidnight()), 60_000);
    return () => clearInterval(t);
  }, []);

  const hh = Math.floor(secondsLeft / 3600);
  const mm = Math.floor((secondsLeft % 3600) / 60);

  const handleSolved = (tier: DailyTier) => {
    const t = DAILY_TIERS.find((d) => d.key === tier)!;
    const res = markSolvedToday(tier, t.xp, t.coins);
    setSolvedMap((m) => ({ ...m, [tier]: true }));
    setStreak(res.streak);
  };

  const totalSolved = Object.values(solvedMap).filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  if (error || !puzzles) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p className="text-destructive">{error || "Puzzles unavailable."}</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Show solver when a tier is active
  if (activeTier && puzzles[activeTier]) {
    const tier = DAILY_TIERS.find((d) => d.key === activeTier)!;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-3 md:px-4 pt-20 pb-16">
          <div className="max-w-6xl mx-auto">
            <PuzzleSolver
              puzzle={puzzles[activeTier]!}
              tier={tier}
              replayMode={solvedMap[activeTier]}
              onSolved={() => handleSolved(activeTier)}
              onBack={() => setActiveTier(null)}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Hub
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 md:pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Daily Puzzles
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-xs text-orange-300">
                <Flame className="h-3 w-3" /> {streak.streak}-day streak
              </span>
            </div>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 flex-wrap">
              <Calendar className="h-4 w-4" />
              {todayStr()} · 4 fresh puzzles every day · resets in {hh}h {mm}m
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Trophy className="h-3 w-3" /> {totalSolved}/4 solved today
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {DAILY_TIERS.map((tier) => {
              const p = puzzles[tier.key];
              const solved = solvedMap[tier.key];
              return (
                <motion.button
                  key={tier.key}
                  onClick={() => p && setActiveTier(tier.key)}
                  disabled={!p}
                  whileHover={p ? { y: -4, scale: 1.01 } : {}}
                  whileTap={p ? { scale: 0.98 } : {}}
                  className={`group relative text-left rounded-2xl border p-4 md:p-5 transition-all overflow-hidden ${
                    solved
                      ? `border-${tier.color}-500/40 bg-gradient-to-br from-${tier.color}-500/15 to-card`
                      : `border-border/40 bg-card hover:border-${tier.color}-500/40`
                  }`}
                >
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-${tier.color}-500/10 blur-2xl pointer-events-none`} />
                  <div className="flex items-start justify-between gap-3 relative">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`shrink-0 w-12 h-12 rounded-xl bg-${tier.color}-500/20 border border-${tier.color}-500/40 flex items-center justify-center`}>
                        {tier.key === "extreme" ? <Crown className={`w-6 h-6 text-${tier.color}-400`} />
                          : tier.key === "hard" ? <Zap className={`w-6 h-6 text-${tier.color}-400`} />
                          : tier.key === "medium" ? <Target className={`w-6 h-6 text-${tier.color}-400`} />
                          : <Sparkles className={`w-6 h-6 text-${tier.color}-400`} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-lg font-bold text-foreground leading-tight">
                          {tier.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Force mate in {tier.matesIn}
                        </div>
                      </div>
                    </div>
                    {solved ? (
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] gap-1 shrink-0">
                        <CheckCircle className="w-3 h-3" /> Done
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={`text-[10px] gap-1 shrink-0 border-${tier.color}-500/40 text-${tier.color}-300`}>
                        <Lock className="w-3 h-3" /> Pending
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    {p && <MiniFenBoard fen={p.fen} size={96} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 text-xs mb-2">
                        <span className="inline-flex items-center gap-1 text-primary font-semibold">
                          <Sparkles className="w-3 h-3" /> +{tier.xp} XP
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <Coins className="w-3 h-3" /> +{tier.coins}
                        </span>
                      </div>
                      {p && (
                        <div className="text-[11px] text-muted-foreground">
                          Rated {p.rating} · {p.side === "w" ? "White" : "Black"} to play
                        </div>
                      )}
                      <div className={`mt-2 text-xs font-semibold ${solved ? "text-emerald-400" : `text-${tier.color}-300`}`}>
                        {solved ? "Replay (no reward)" : "Solve →"}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/40 bg-card/60 p-4">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" /> Today's Rules
              </h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• 4 unique puzzles every 24 hours, one per tier.</li>
                <li>• Each tier rewards XP + MasterCoins on completion.</li>
                <li>• Wrong move breaks your combo — restart anytime.</li>
                <li>• Solve any tier to keep your daily streak alive.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-primary" /> Daily Pro Tip
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In Hard and Extreme tiers, the first move is almost always a quiet move or a sacrifice
                that blocks the king's escape. Calculate every check first — but the winning line is
                usually subtler than it looks.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/training">
              <Button variant="outline" size="sm">
                <Zap className="mr-2 h-4 w-4" /> Want unlimited puzzles? Open Training →
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DailyChallenge;
