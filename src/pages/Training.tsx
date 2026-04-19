import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chess, Square } from "chess.js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Target, Shield, Crown, Clock, RotateCcw, ArrowRight, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { TRAINING_MODES, CURATED_POSITIONS, getCuratedByMode, type TrainingMode, type TrainingPosition } from "@/lib/training-positions";
import { toast } from "sonner";

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
  } catch {
    return [];
  }
}

const Training = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<TrainingMode>("best-move");
  const [source, setSource] = useState<Source>("curated");
  const [position, setPosition] = useState<TrainingPosition | null>(null);
  const [chess, setChess] = useState<Chess | null>(null);
  const [userMove, setUserMove] = useState<string | null>(null); // UCI
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [personalPositions, setPersonalPositions] = useState<TrainingPosition[]>([]);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    setSecondsLeft(60);
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, position?.id]);

  // Build personal positions from user's recent finished games
  async function loadPersonalPositions(targetMode: TrainingMode) {
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
      // Pick a moment between move 8 and 25 where it was the user's turn
      const isWhite = g.white_player_id === user.id;
      const candidates = fens.filter((f, i) => {
        if (f.moveNumber < 8 || f.moveNumber > 25) return false;
        return isWhite ? f.side === "w" : f.side === "b";
      });
      if (candidates.length === 0) continue;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      // Use chess.js to compute a plausible "best move" (legal capture or check, fall back to first legal)
      const c = new Chess(pick.fen);
      const moves = c.moves({ verbose: true });
      if (moves.length === 0) continue;
      const captures = moves.filter(m => m.captured);
      const checks = moves.filter(m => m.san.includes("+"));
      const choice = checks[0] || captures[0] || moves[0];
      built.push({
        id: `p-${g.id}-${pick.moveNumber}`,
        mode: targetMode,
        fen: pick.fen,
        side: pick.side,
        bestMove: choice.from + choice.to + (choice.promotion || ""),
        title: `Your game · move ${pick.moveNumber}`,
        hint: targetMode === "defend" ? "Find the safest move that holds the position." :
              targetMode === "convert" ? "You're playing — find the most accurate continuation." :
              targetMode === "find-plan" ? "Look for a move that fits a long-term plan." :
              "Find the strongest move based on captures, checks, and threats.",
        explanation: `In your real game, ${choice.san} was a strong candidate — it ${choice.captured ? "wins material" : choice.san.includes("+") ? "gives check and creates pressure" : "improves piece activity and keeps initiative"}. Reviewing your own positions is the fastest way to spot recurring patterns.`,
        whyWrong: `The move you tried doesn't apply pressure or improve your worst piece. In positions like this, prioritize: (1) checks, (2) captures, (3) threats — in that order.`,
        difficulty: "intermediate",
      });
      if (built.length >= 8) break;
    }
    setLoadingPersonal(false);
    return built;
  }

  async function startSession() {
    let pool: TrainingPosition[] = [];
    if (source === "curated") {
      pool = getCuratedByMode(mode);
    } else {
      pool = await loadPersonalPositions(mode);
      if (pool.length === 0) {
        toast.error("Not enough finished games yet — switching to curated positions.");
        pool = getCuratedByMode(mode);
        setSource("curated");
      }
    }
    if (pool.length === 0) {
      toast.error("No positions available for this mode.");
      return;
    }
    const next = pool[Math.floor(Math.random() * pool.length)];
    loadPosition(next);
  }

  function loadPosition(p: TrainingPosition) {
    setPosition(p);
    setChess(new Chess(p.fen));
    setUserMove(null);
    setCorrect(null);
    setHintShown(false);
    setSelectedSquare(null);
    setLegalMoves([]);
    setPhase("playing");
  }

  function handleSquareClick(square: Square) {
    if (!chess || !position || phase !== "playing") return;
    // If a square is already selected, attempt move
    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        const piece = chess.get(selectedSquare);
        const promotion = piece?.type === "p" && (square[1] === "8" || square[1] === "1") ? "q" : undefined;
        const move = chess.move({ from: selectedSquare, to: square, promotion });
        if (move) {
          const uci = selectedSquare + square + (promotion || "");
          setUserMove(uci);
          const acceptable = position.acceptable || [position.bestMove];
          const ok = acceptable.includes(uci);
          setCorrect(ok);
          setScore(s => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
          setPhase("feedback");
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      // Re-select if clicked own piece
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        setLegalMoves(chess.moves({ square, verbose: true }).map(m => m.to as Square));
        return;
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    // First click: must be own piece
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      setLegalMoves(chess.moves({ square, verbose: true }).map(m => m.to as Square));
    }
  }


  function handleTimeout() {
    if (phase !== "playing") return;
    setCorrect(false);
    setScore(s => ({ correct: s.correct, total: s.total + 1 }));
    setPhase("feedback");
    toast("Time's up! Take a breath next time.", { description: "Real chess always has a clock." });
  }

  function nextPosition() {
    const pool = source === "curated" ? getCuratedByMode(mode) : personalPositions.length > 0 ? personalPositions : getCuratedByMode(mode);
    const choices = pool.filter(p => p.id !== position?.id);
    if (choices.length === 0) { setPhase("select"); return; }
    loadPosition(choices[Math.floor(Math.random() * choices.length)]);
  }

  // Highlight last move on board
  const lastMove = useMemo(() => {
    if (!userMove) return undefined;
    return { from: userMove.slice(0, 2) as Square, to: userMove.slice(2, 4) as Square };
  }, [userMove]);

  if (loading || !user) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto pt-32 text-center text-muted-foreground">Loading…</div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              <span className="text-gradient-gold">Real Game Training</span>
            </h1>
            <p className="text-sm text-muted-foreground">Train under pressure. Get instant feedback. Learn from every move.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {phase === "select" && (
              <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* Mode selector */}
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

                {/* Source selector */}
                <div>
                  <h3 className="text-sm font-display font-semibold text-foreground mb-3">Position source</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: "curated" as const, title: "Curated GM positions", desc: "Hand-picked classics" },
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
                {/* Board */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{TRAINING_MODES.find(m => m.key === mode)?.label}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${secondsLeft < 10 ? "text-red-400" : "text-foreground"}`}>
                      <Clock className="w-4 h-4" />
                      {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/40 shadow-2xl">
                    <ChessBoard
                      game={chess}
                      flipped={position.side === "b"}
                      selectedSquare={selectedSquare}
                      legalMoves={legalMoves}
                      lastMove={lastMove ? { from: lastMove.from, to: lastMove.to } : null}
                      isGameOver={phase === "feedback"}
                      isPlayerTurn={phase === "playing"}
                      onSquareClick={handleSquareClick}
                    />
                  </div>
                </div>

                {/* Side panel */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-border/40 bg-card/80 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{position.difficulty}</p>
                    <h3 className="font-display text-base font-bold text-foreground mt-1">{position.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {position.side === "w" ? "White" : "Black"} to move.
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
                            {correct ? "Correct!" : "Not the best"}
                          </p>
                        </div>
                        <p className="text-sm text-foreground">
                          {correct ? position.explanation : position.whyWrong}
                        </p>
                      </div>
                      {!correct && (
                        <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Why the best move works</p>
                          <p className="text-sm text-foreground">{position.explanation}</p>
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
