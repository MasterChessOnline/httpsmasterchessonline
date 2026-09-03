import Seo from "@/components/Seo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, RotateCcw, Lightbulb, Check, ArrowLeft, Target } from "lucide-react";
import ChessBoard from "@/components/chess/ChessBoard";
import { BOARD_CONTAINER_CLASS } from "@/lib/board-sizing";
import { Button } from "@/components/ui/button";
import { BOT_PROFILES } from "@/lib/bots/profiles";
import { getBotMove } from "@/lib/bots/bot-engine";
import { playChessSound } from "@/lib/chess-sounds";
import { celebrate } from "@/lib/celebrate";
import { ENDGAME_DRILLS, LEVEL_LABEL, getDrill, type EndgameDrill } from "@/lib/endgame-drills";

const SOLVED_KEY = "mc_endgames_solved";

function readSolved(): string[] {
  try {
    const raw = localStorage.getItem(SOLVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markSolved(id: string) {
  try {
    const next = Array.from(new Set([...readSolved(), id]));
    localStorage.setItem(SOLVED_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

function pickDefender(rating: number) {
  return [...BOT_PROFILES].sort(
    (a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating),
  )[0];
}

/* ------------------------------- Drill board ------------------------------- */

function DrillBoard({ drill }: { drill: EndgameDrill }) {
  const defender = useMemo(() => pickDefender(drill.defenderRating), [drill.defenderRating]);
  const [game, setGame] = useState(() => new Chess(drill.fen));
  const [fen, setFen] = useState(drill.fen);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState<"playing" | "solved" | "failed">("playing");
  const [showHint, setShowHint] = useState(false);
  const timer = useRef<number | null>(null);

  const reset = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    const g = new Chess(drill.fen);
    setGame(g);
    setFen(g.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setThinking(false);
    setStatus("playing");
    setShowHint(false);
  }, [drill.fen]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const movesUsed = Math.ceil(game.history().length / 2);

  const evaluate = useCallback(
    (g: Chess) => {
      setFen(g.fen());
      if (g.isCheckmate() && g.turn() === "b") {
        setStatus("solved");
        markSolved(drill.id);
        playChessSound("victory");
        celebrate("big");
        return true;
      }
      if (g.isGameOver()) {
        setStatus("failed");
        playChessSound("gameOver");
        return true;
      }
      if (Math.ceil(g.history().length / 2) > drill.moveLimit) {
        setStatus("failed");
        playChessSound("gameOver");
        return true;
      }
      return false;
    },
    [drill.id, drill.moveLimit],
  );

  const playDefence = useCallback(
    async (g: Chess) => {
      if (g.isGameOver()) return;
      setThinking(true);
      let chosen: string | null = null;
      try {
        const decision = await getBotMove(g, defender);
        chosen = decision.move as string;
      } catch {
        const legal = g.moves();
        chosen = legal.length ? legal[Math.floor(Math.random() * legal.length)] : null;
      }
      timer.current = window.setTimeout(() => {
        if (chosen) {
          const move = g.move(chosen);
          if (move) {
            setLastMove({ from: move.from, to: move.to });
            playChessSound(move.captured ? "capture" : "move");
          }
        }
        setThinking(false);
        evaluate(g);
      }, 350);
    },
    [defender, evaluate],
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (status !== "playing" || thinking || game.turn() !== "w") return;
      if (selectedSquare && legalMoves.includes(square)) {
        const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move) {
          setLastMove({ from: move.from, to: move.to });
          playChessSound(move.captured ? "capture" : "move");
          setSelectedSquare(null);
          setLegalMoves([]);
          if (!evaluate(game)) playDefence(game);
          return;
        }
      }
      const piece = game.get(square);
      if (piece && piece.color === "w") {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }) as { to: Square }[];
        setLegalMoves(moves.map((m) => m.to));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [game, selectedSquare, legalMoves, status, thinking, evaluate, playDefence],
  );

  const nextDrill = useMemo(() => {
    const i = ENDGAME_DRILLS.findIndex((d) => d.id === drill.id);
    return ENDGAME_DRILLS[i + 1];
  }, [drill.id]);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold text-foreground truncate">{drill.title}</h1>
          <p className="text-xs text-muted-foreground truncate">{drill.goal}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold text-foreground tabular-nums">
            {movesUsed}/{drill.moveLimit}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">moves</div>
        </div>
      </div>

      <div className={BOARD_CONTAINER_CLASS + " touch-none select-none"} data-fen={fen}>
        <ChessBoard
          game={game}
          flipped={false}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          isGameOver={status !== "playing"}
          isPlayerTurn={game.turn() === "w" && !thinking && status === "playing"}
          onSquareClick={handleSquareClick}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restart
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowHint((v) => !v)}>
          <Lightbulb className="h-3.5 w-3.5 mr-1.5" /> Hint
        </Button>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-muted-foreground rounded-lg border border-border/50 bg-card/40 p-3"
          >
            {drill.hint}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status !== "playing" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/60 bg-card p-4 text-center space-y-3"
          >
            <p className="font-display text-lg font-bold text-foreground">
              {status === "solved" ? "Solved." : "Not this time."}
            </p>
            <p className="text-xs text-muted-foreground">
              {status === "solved"
                ? `Mate in ${movesUsed} moves. Technique locked in.`
                : "The defender held. Restart and try a cleaner plan."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                Try again
              </Button>
              {status === "solved" && nextDrill && (
                <Button asChild className="flex-1">
                  <Link to={`/endgames/${nextDrill.id}`}>Next drill</Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function Endgames() {
  const { drillId } = useParams();
  const navigate = useNavigate();
  const drill = getDrill(drillId);
  const [solved, setSolved] = useState<string[]>([]);

  useEffect(() => {
    setSolved(readSolved());
  }, [drillId]);

  useEffect(() => {
    if (drillId && !drill) navigate("/endgames", { replace: true });
  }, [drillId, drill, navigate]);

  const grouped = useMemo(
    () =>
      (["basic", "core", "hard"] as const).map((level) => ({
        level,
        drills: ENDGAME_DRILLS.filter((d) => d.level === level),
      })),
    [],
  );

  return (
    <div
      className="min-h-[100dvh] bg-background flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Seo
        path={drill ? `/endgames/${drill.id}` : "/endgames"}
        title={
          drill
            ? `${drill.title} — Endgame Trainer | MasterChess`
            : "Endgame Trainer — Practice Chess Endgames Free | MasterChess"
        }
        description={
          drill
            ? `${drill.goal} Practice ${drill.title} against a defending engine. Free, no account needed.`
            : "Train the endgames that decide games: king and pawn, rook endings, Lucena, queen vs rook. Free, instant, no account."
        }
      />

      <header className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        {drill ? (
          <Link to="/endgames" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> All drills
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-display font-bold tracking-wide text-sm">
              Master<span className="text-gradient-gold">Chess</span>
            </span>
          </Link>
        )}
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {solved.length}/{ENDGAME_DRILLS.length} solved
        </span>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-3 py-4">
        {drill ? (
          <DrillBoard drill={drill} />
        ) : (
          <div className="space-y-6">
            <section className="space-y-2">
              <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
                Practice the endgames that <span className="text-gradient-gold">win games</span>.
              </h1>
              <p className="text-sm text-muted-foreground">
                Eight positions every strong player can convert. You attack, the engine defends.
                No account, no ads, straight to the board.
              </p>
            </section>

            {grouped.map(({ level, drills }) => (
              <section key={level} className="space-y-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {LEVEL_LABEL[level]}
                </h2>
                <ul className="space-y-2">
                  {drills.map((d) => (
                    <li key={d.id}>
                      <Link
                        to={`/endgames/${d.id}`}
                        className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-3 hover:border-primary/40 hover:bg-card/70 transition-colors"
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/60">
                          {solved.includes(d.id) ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Target className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground truncate">
                            {d.title}
                          </span>
                          <span className="block text-[11px] text-muted-foreground truncate">
                            {d.goal}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
