import Seo from "@/components/Seo";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chess, Square } from "chess.js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Target, Shield, Crown, Clock, RotateCcw, ArrowRight,
  Lightbulb, CheckCircle2, XCircle, Flame, Trophy,
} from "lucide-react";
import {
  TRAINING_MODES, CURATED_POSITIONS, getCuratedByMode,
  type TrainingMode, type TrainingPosition,
} from "@/lib/training-positions";
import { loadPuzzles as loadLichessPuzzles, type PuzzlePosition } from "@/lib/masterchess-puzzles";
import { useTrainingStreak } from "@/hooks/use-training-streak";
import AchievementToast from "@/components/training/AchievementToast";
import { toast } from "sonner";
import { getStockfishEngine } from "@/lib/stockfish-engine";

/**
 * Multi-solution puzzle acceptance.
 * Some tactical puzzles have more than one winning move (e.g. two different
 * mating ideas, equally winning captures). We compare Stockfish's evaluation
 * of the position AFTER the "expected" move vs AFTER the user's move, from
 * the side-to-move's perspective. If the user's move is within a small
 * tolerance (or also mates in the same number), we treat it as a valid
 * alternate solution and let the puzzle continue.
 *
 * Cheap depth (10) keeps this snappy (~150-300ms) on the main thread.
 */
async function isAlternativeSolution(
  fenBeforeMove: string,
  expectedUci: string,
  userUci: string,
): Promise<{ accepted: boolean; replacementSolutionUci?: string }> {
  if (expectedUci === userUci) return { accepted: true };
  try {
    const eng = getStockfishEngine();
    await eng.init();
    // Side-to-move BEFORE the move was played.
    const mover = new Chess(fenBeforeMove).turn(); // "w" | "b"

    // Apply both candidate moves and evaluate the resulting positions.
    const apply = (uci: string) => {
      const c = new Chess(fenBeforeMove);
      try {
        c.move({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: (uci[4] as any) || "q" });
        return c.fen();
      } catch { return null; }
    };
    const expectedFen = apply(expectedUci);
    const userFen = apply(userUci);
    if (!expectedFen || !userFen) return { accepted: false };

    const [expectedEval, userEval] = await Promise.all([
      eng.evaluate(expectedFen, 10),
      eng.evaluate(userFen, 10),
    ]);

    // Normalize: evaluations are returned from the side-to-move's perspective
    // AFTER our move, which means the opponent is now to move. Flip to the
    // mover's perspective by negating.
    const expScore = -(expectedEval.evaluation || 0);
    const userScore = -(userEval.evaluation || 0);
    const expMate = expectedEval.mate != null ? -expectedEval.mate : null;
    const userMate = userEval.mate != null ? -userEval.mate : null;

    // Mate-vs-mate: both winning mates count.
    if (expMate != null && expMate > 0 && userMate != null && userMate > 0) {
      return { accepted: true, replacementSolutionUci: userUci };
    }
    // If expected is mate but user isn't → require user to also mate.
    if (expMate != null && expMate > 0) return { accepted: false };

    // Centipawn comparison from mover's perspective.
    const diff = expScore - userScore; // positive => user is worse
    if (diff <= 30) {
      return { accepted: true, replacementSolutionUci: userUci };
    }
    return { accepted: false };
  } catch {
    return { accepted: false };
  }
}

type SessionMode = "classic" | "timeattack" | "survival";
const TIME_ATTACK_SECONDS = 300; // 5 minutes
const MAX_MISTAKES = 3;
const BEST_KEY = (m: SessionMode) => `mc:training:best:${m}`;
function readBest(m: SessionMode): number {
  try { return parseInt(localStorage.getItem(BEST_KEY(m)) || "0", 10) || 0; } catch { return 0; }
}
function writeBest(m: SessionMode, v: number) {
  try { localStorage.setItem(BEST_KEY(m), String(v)); } catch {}
}

type Source = "curated" | "personal";
type Phase = "select" | "playing" | "feedback";

const ICONS: Record<TrainingMode, typeof Brain> = {
  "best-move": Target,
  "find-plan": Brain,
  "defend": Shield,
  "convert": Crown,
};

// Convert PGN to a list of FENs at each move (for personal positions).
function fensFromPgn(pgn: string): { fen: string; moveNumber: number; side: "w" | "b" }[] {
  try {
    const c = new Chess();
    c.loadPgn(pgn);
    const history = c.history({ verbose: true });
    const out: { fen: string; moveNumber: number; side: "w" | "b" }[] = [];
    const replay = new Chess();
    history.forEach((m, i) => {
      replay.move(m);
      out.push({ fen: replay.fen(), moveNumber: Math.floor(i / 2) + 1, side: replay.turn() });
    });
    return out;
  } catch { return []; }
}

const Training = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<TrainingMode>("best-move");
  const [source, setSource] = useState<Source>("curated");
  const [position, setPosition] = useState<TrainingPosition | null>(null);
  const [chess, setChess] = useState<Chess | null>(null);
  const [stepIndex, setStepIndex] = useState(0); // index into position.solutionUci (user move at even idx)
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [personalPositions, setPersonalPositions] = useState<TrainingPosition[]>([]);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);
  const streak = useTrainingStreak();
  const stepIndexRef = useRef(0);

  // Session-mode state
  const [sessionMode, setSessionMode] = useState<SessionMode>("classic");
  const [mistakes, setMistakes] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(TIME_ATTACK_SECONDS);
  const [bestScore, setBestScore] = useState<Record<SessionMode, number>>({
    classic: readBest("classic"),
    timeattack: readBest("timeattack"),
    survival: readBest("survival"),
  });
  const [achievement, setAchievement] = useState<{ title: string; subtitle?: string } | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

  // Time Attack global countdown
  useEffect(() => {
    if (sessionMode !== "timeattack" || phase === "select" || sessionEnded) return;
    if (sessionTimeLeft <= 0) { endSession("Time's up!"); return; }
    const t = setInterval(() => setSessionTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionMode, phase, sessionTimeLeft, sessionEnded]);

  // Timer — gets a generous floor based on solution length so mate-in-N is fair.
  useEffect(() => {
    if (phase !== "playing" || !position) return;
    const sol = (position as PuzzlePosition).solutionUci;
    const userMoves = sol ? Math.ceil(sol.length / 2) : 1;
    const total = Math.max(45, 30 + userMoves * 25); // 30s base + 25s per user move
    setSecondsLeft(total);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); handleTimeout(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, position?.id]);

  async function loadPersonalPositions(targetMode: TrainingMode): Promise<TrainingPosition[]> {
    if (!user) return [];
    setLoadingPersonal(true);
    const { data } = await supabase
      .from("online_games")
      .select("id, pgn, white_player_id, black_player_id, result")
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(20);

    const built: TrainingPosition[] = [];
    for (const g of (data || [])) {
      if (!g.pgn) continue;
      const fens = fensFromPgn(g.pgn);
      const isWhite = g.white_player_id === user.id;
      const candidates = fens.filter((f) => f.moveNumber >= 8 && f.moveNumber <= 25 && (isWhite ? f.side === "w" : f.side === "b"));
      if (candidates.length === 0) continue;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const c = new Chess(pick.fen);
      const moves = c.moves({ verbose: true });
      if (moves.length === 0) continue;
      const choice = moves.find(m => m.san.includes("+")) || moves.find(m => m.captured) || moves[0];
      built.push({
        id: `p-${g.id}-${pick.moveNumber}`,
        mode: targetMode,
        fen: pick.fen,
        side: pick.side,
        bestMove: choice.from + choice.to + (choice.promotion || ""),
        title: `Your game · move ${pick.moveNumber}`,
        hint: "Look for checks, captures, and threats.",
        explanation: `${choice.san} is a strong candidate from your real game.`,
        whyWrong: `Prioritize checks, captures, and threats — in that order.`,
        difficulty: "intermediate",
      });
      if (built.length >= 8) break;
    }
    setPersonalPositions(built);
    setLoadingPersonal(false);
    return built;
  }

  // Pick a fresh puzzle (not in seenIds) from the pool for the current mode.
  function pickFresh(pool: TrainingPosition[]): TrainingPosition | null {
    const fresh = pool.filter((p) => !seenIds.has(p.id));
    const choices = fresh.length > 0 ? fresh : pool; // wrap around if exhausted
    if (choices.length === 0) return null;
    return choices[Math.floor(Math.random() * choices.length)];
  }

  async function buildPool(): Promise<TrainingPosition[]> {
    if (source === "personal") {
      const built = personalPositions.length > 0 ? personalPositions : await loadPersonalPositions(mode);
      if (built.length > 0) return built;
      toast.error("Not enough finished games yet — switching to Stockfish puzzles.");
      setSource("curated");
    }
    try {
      const lichess = await loadLichessPuzzles();
      const filtered = lichess.filter((p) => p.mode === mode);
      if (filtered.length > 0) return filtered;
    } catch { /* fall through */ }
    return getCuratedByMode(mode);
  }

  function endSession(reason?: string) {
    setSessionEnded(true);
    setPhase("feedback");
    const finalScore = score.correct;
    const prevBest = bestScore[sessionMode];
    if (finalScore > prevBest && finalScore > 0) {
      writeBest(sessionMode, finalScore);
      setBestScore(b => ({ ...b, [sessionMode]: finalScore }));
      setAchievement({
        title: "New Record!",
        subtitle: `${finalScore} solved · ${sessionMode === "timeattack" ? "Time Attack" : sessionMode === "survival" ? "Survival" : "Classic"}`,
      });
    } else if (reason) {
      toast(reason, { description: `Final score: ${finalScore}` });
    }
  }

  async function startSession() {
    setMistakes(0);
    setSessionEnded(false);
    setSessionTimeLeft(TIME_ATTACK_SECONDS);
    setScore({ correct: 0, total: 0 });
    setSeenIds(new Set());
    const pool = await buildPool();
    const next = pickFresh(pool);
    if (!next) { toast.error("No positions available for this mode."); return; }
    loadPosition(next);
  }

  function loadPosition(p: TrainingPosition) {
    setPosition(p);
    setChess(new Chess(p.fen));
    setStepIndex(0); stepIndexRef.current = 0;
    setCorrect(null);
    setHintShown(false);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMoveSquares(null);
    setSeenIds((prev) => new Set(prev).add(p.id));
    setPhase("playing");
  }

  // Auto-play opponent's reply after a correct user move.
  function autoPlayOpponent(currChess: Chess, sol: string[], nextIdx: number) {
    const oppUci = sol[nextIdx];
    if (!oppUci) return { advanced: nextIdx, done: true };
    const oppMove = currChess.move({
      from: oppUci.slice(0, 2),
      to: oppUci.slice(2, 4),
      promotion: oppUci.length > 4 ? (oppUci[4] as any) : undefined,
    });
    if (!oppMove) return { advanced: nextIdx, done: true };
    setLastMoveSquares({ from: oppMove.from as Square, to: oppMove.to as Square });
    return { advanced: nextIdx + 1, done: false };
  }

  function handleSquareClick(square: Square) {
    if (!chess || !position || phase !== "playing") return;
    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        const piece = chess.get(selectedSquare);
        const promotion = piece?.type === "p" && (square[1] === "8" || square[1] === "1") ? "q" : undefined;
        const move = chess.move({ from: selectedSquare, to: square, promotion });
        if (move) {
          const uci = selectedSquare + square + (promotion || "");
          processUserMove(uci);
        }
        setSelectedSquare(null); setLegalMoves([]);
        return;
      }
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        setLegalMoves(chess.moves({ square, verbose: true }).map(m => m.to as Square));
        return;
      }
      setSelectedSquare(null); setLegalMoves([]);
      return;
    }
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      setLegalMoves(chess.moves({ square, verbose: true }).map(m => m.to as Square));
    }
  }

  function processUserMove(uci: string) {
    if (!chess || !position) return;
    const sol = (position as PuzzlePosition).solutionUci || [position.bestMove];
    const expected = sol[stepIndexRef.current];
    setLastMoveSquares({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square });

    if (!expected || uci !== expected) {
      // Wrong move — undo + fail
      try { chess.undo(); } catch { /* noop */ }
      streak.reset();
      setCorrect(false);
      setScore(s => ({ correct: s.correct, total: s.total + 1 }));
      setPhase("feedback");
      return;
    }

    const nextIdx = stepIndexRef.current + 1;
    // If solution exhausted → puzzle solved
    if (nextIdx >= sol.length) {
      stepIndexRef.current = nextIdx;
      setStepIndex(nextIdx);
      streak.increment();
      setCorrect(true);
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      setPhase("feedback");
      return;
    }
    // Auto-play opponent reply with a small delay for nicer animation
    setStepIndex(nextIdx);
    stepIndexRef.current = nextIdx;
    setTimeout(() => {
      const r = autoPlayOpponent(chess, sol, nextIdx);
      stepIndexRef.current = r.advanced;
      setStepIndex(r.advanced);
      setChess(new Chess(chess.fen())); // force refresh
      // Check if everything done
      if (r.advanced >= sol.length) {
        streak.increment();
        setCorrect(true);
        setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
        setPhase("feedback");
      }
    }, 380);
  }

  function handleTimeout() {
    if (phase !== "playing") return;
    streak.reset();
    setCorrect(false);
    setScore(s => ({ correct: s.correct, total: s.total + 1 }));
    setPhase("feedback");
    toast("Time's up!", { description: "Streak reset — slow down on the next one." });
  }

  async function nextPosition() {
    const pool = await buildPool();
    const next = pickFresh(pool);
    if (!next) { setPhase("select"); return; }
    loadPosition(next);
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-background"><Seo title={"Chess Training — Tactics & Drills | MasterChess"} description={"Sharpen tactics with mate-in-N, endgame drills, combo trainer and survival mode."} path="/training" type="website" /><Navbar /><div className="container mx-auto pt-32 text-center text-muted-foreground">Loading…</div></div>;
  }

  const totalUserMovesNeeded = position ? Math.ceil((((position as PuzzlePosition).solutionUci || [position.bestMove]).length) / 2) : 0;
  const userMovesPlayed = Math.ceil(stepIndex / 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              <span className="text-gradient-gold">Real Game Training</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              770+ Stockfish-vetted puzzles. Play to checkmate. Build your streak.
            </p>
          </motion.div>

          {/* Streak banner — always visible, fire animates with streak size */}
          {(() => {
            const s = streak.current;
            const tier = s >= 15 ? 3 : s >= 5 ? 2 : 1;
            const flameSize = tier === 3 ? "w-7 h-7" : tier === 2 ? "w-5 h-5" : "w-4 h-4";
            const flameGlow = tier === 3 ? "drop-shadow-[0_0_14px_rgba(251,146,60,0.95)]" : tier === 2 ? "drop-shadow-[0_0_10px_rgba(251,146,60,0.7)]" : "";
            const combo = s >= 10 ? "x3" : s >= 5 ? "x2" : null;
            return (
              <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/30 px-4 py-1.5">
                  <motion.span
                    key={s}
                    animate={{ scale: tier === 3 ? [1, 1.25, 1] : tier === 2 ? [1, 1.12, 1] : 1 }}
                    transition={{ duration: 0.7, repeat: tier > 1 ? Infinity : 0, repeatDelay: 0.4 }}
                    className="inline-flex"
                  >
                    <Flame className={`${flameSize} text-orange-400 ${flameGlow}`} />
                  </motion.span>
                  <span className="font-display font-bold text-orange-300 text-sm">Streak {s}</span>
                  {combo && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-[10px] font-bold text-orange-200 uppercase tracking-wider">
                      {combo} combo
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold text-primary text-sm">Best {streak.best}</span>
                </div>
              </div>
            );
          })()}

          <AnimatePresence mode="wait">
            {phase === "select" && (
              <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-display font-semibold text-foreground mb-3">Choose a training mode</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRAINING_MODES.map(m => {
                      const Icon = ICONS[m.key];
                      const active = mode === m.key;
                      return (
                        <button key={m.key} onClick={() => setMode(m.key)}
                          className={`text-left rounded-xl border p-4 transition-all ${active ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border/50 bg-card/60 hover:border-primary/30"}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-display font-semibold text-foreground">{m.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-display font-semibold text-foreground mb-3">Position source</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: "curated" as const, title: "770+ Stockfish puzzles", desc: "Mate-in-1/2/3/4/5, forks, pins, sacrifices — solve to checkmate" },
                      { key: "personal" as const, title: "Your own past games", desc: "Train on real moments from your history" },
                    ]).map(s => {
                      const active = source === s.key;
                      return (
                        <button key={s.key} onClick={() => setSource(s.key)}
                          className={`text-left rounded-xl border p-4 transition-all ${active ? "border-primary bg-primary/10" : "border-border/50 bg-card/60 hover:border-primary/30"}`}>
                          <p className="text-sm font-display font-semibold text-foreground">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={startSession} size="lg" className="w-full gap-2" disabled={loadingPersonal}>
                  {loadingPersonal ? "Loading your games…" : <>Start Training <ArrowRight className="w-4 h-4" /></>}
                </Button>

                {score.total > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Last session: {score.correct} / {score.total} correct ({Math.round((score.correct / score.total) * 100)}%)
                  </p>
                )}
              </motion.div>
            )}

            {phase !== "select" && position && chess && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-[1fr,360px] gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{TRAINING_MODES.find(m => m.key === mode)?.label}</span>
                      {totalUserMovesNeeded > 1 && (
                        <span className="text-[10px] text-muted-foreground/80 px-2 py-0.5 rounded bg-muted/30">
                          Move {Math.min(userMovesPlayed + 1, totalUserMovesNeeded)} / {totalUserMovesNeeded}
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${secondsLeft < 10 ? "text-red-400" : "text-foreground"}`}>
                      <Clock className="w-4 h-4" />
                      {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/40 shadow-2xl">
                    <ChessBoard
                      game={chess}
                      flipped={false}
                      selectedSquare={selectedSquare}
                      legalMoves={legalMoves}
                      lastMove={lastMoveSquares}
                      isGameOver={phase === "feedback"}
                      isPlayerTurn={phase === "playing"}
                      onSquareClick={handleSquareClick}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border/40 bg-card/80 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{position.difficulty}</p>
                    <h3 className="font-display text-base font-bold text-foreground mt-1">{position.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {chess.turn() === "w" ? "White" : "Black"} to move.
                      {totalUserMovesNeeded > 1 && ` Solve to checkmate (${totalUserMovesNeeded} moves).`}
                    </p>
                  </div>

                  {phase === "playing" && (
                    <>
                      <Button onClick={() => setHintShown(true)} variant="outline" className="w-full gap-2" disabled={hintShown}>
                        <Lightbulb className="w-4 h-4" /> {hintShown ? "Hint shown" : "Show hint"}
                      </Button>
                      {hintShown && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                          <p className="text-sm text-foreground">{position.hint}</p>
                        </motion.div>
                      )}
                    </>
                  )}

                  {phase === "feedback" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className={`rounded-xl border p-4 ${correct ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {correct ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                          <p className={`font-display font-bold ${correct ? "text-emerald-400" : "text-red-400"}`}>
                            {correct ? `Solved! Streak +1 (${streak.current})` : "Not the best — streak reset"}
                          </p>
                        </div>
                        <p className="text-sm text-foreground">
                          {correct ? position.explanation : position.whyWrong}
                        </p>
                      </div>
                      {!correct && (
                        <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">The full solution</p>
                          <p className="text-sm font-mono text-foreground">{((position as PuzzlePosition).solutionUci || [position.bestMove]).join("  ")}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => loadPosition(position)} variant="outline" className="gap-2">
                          <RotateCcw className="w-4 h-4" /> Retry
                        </Button>
                        <Button onClick={nextPosition} className="gap-2">
                          Next <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button onClick={() => setPhase("select")} variant="ghost" className="w-full text-xs">
                        Back to mode select
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Session: {score.correct} / {score.total}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Training;
