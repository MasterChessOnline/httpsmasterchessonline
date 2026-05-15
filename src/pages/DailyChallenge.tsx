import { useState, useEffect, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target, Flame, Zap, Trophy, RotateCcw, Lightbulb,
  CheckCircle, XCircle, Clock, Calendar, Loader2, Lock, ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const SOLVED_KEY = "mc.dailyMate.solved.v1";
const STREAK_KEY = "mc.dailyMate.streak.v1";

function isSolvedToday(): boolean {
  try { return localStorage.getItem(SOLVED_KEY) === todayStr(); } catch { return false; }
}
function loadStreak(): { streak: number; lastSolvedDay: string | null } {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { streak: 0, lastSolvedDay: null };
    return JSON.parse(raw);
  } catch { return { streak: 0, lastSolvedDay: null }; }
}
function markSolvedToday() {
  const today = todayStr();
  try {
    localStorage.setItem(SOLVED_KEY, today);
    const cur = loadStreak();
    if (cur.lastSolvedDay === today) return cur;
    // Yesterday continues streak; otherwise restart at 1
    const y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
    const yesterday = y.toISOString().split("T")[0];
    const next = {
      streak: cur.lastSolvedDay === yesterday ? cur.streak + 1 : 1,
      lastSolvedDay: today,
    };
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
    return next;
  } catch { return loadStreak(); }
}
function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

interface DailyPuzzle {
  title: string;
  url: string;
  publish_time: number;
  fen: string;
  pgn: string;
  image: string;
}

interface ParsedPuzzle {
  title: string;
  url: string;
  date: string;
  startFen: string;
  solution: string[]; // UCI moves
  playerColor: "w" | "b";
  firstMoveBy: "w" | "b";
  isMate: boolean;
}

const STORAGE_KEY = "mc_daily_puzzle_cache_v1";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function parsePuzzle(p: DailyPuzzle): ParsedPuzzle | null {
  try {
    const chess = new Chess();
    chess.loadPgn(p.pgn);
    const history = chess.history({ verbose: true });
    if (!history.length) return null;

    // Replay from start of PGN to get the puzzle's starting FEN (first move's "before")
    const startFen = (history[0] as any).before || p.fen;
    const solution = history.map((m: any) => `${m.from}${m.to}${m.promotion || ""}`);

    // Verify last move is checkmate (Stockfish-verified by Chess.com — this just confirms forced mate)
    const verifier = new Chess(startFen);
    let isMate = false;
    for (const uci of solution) {
      const from = uci.slice(0, 2) as Square;
      const to = uci.slice(2, 4) as Square;
      const promotion = uci.length > 4 ? uci[4] : undefined;
      verifier.move({ from, to, promotion });
    }
    isMate = verifier.isCheckmate();

    const startTurn = new Chess(startFen).turn();
    // Player plays the side that moves first in the solution
    return {
      title: p.title,
      url: p.url,
      date: new Date(p.publish_time * 1000).toISOString().split("T")[0],
      startFen,
      solution,
      playerColor: startTurn,
      firstMoveBy: startTurn,
      isMate,
    };
  } catch (e) {
    console.error("Puzzle parse error:", e);
    return null;
  }
}

// Fetch Lichess daily puzzle (engine-verified, single forced winning line).
async function fetchVerifiedDailyMate(): Promise<ParsedPuzzle> {
  const r = await fetch("https://lichess.org/api/puzzle/daily");
  if (!r.ok) throw new Error(`Lichess HTTP ${r.status}`);
  const data = await r.json();

  const pgn: string = data.game?.pgn || "";
  const initialPly: number = data.puzzle?.initialPly ?? 0;
  const solution: string[] = data.puzzle?.solution || [];
  const themes: string[] = data.puzzle?.themes || [];
  const id: string = data.puzzle?.id || "daily";

  if (!pgn || !solution.length) throw new Error("Invalid puzzle payload");

  // Replay PGN moves up to initialPly to get the puzzle starting FEN.
  const sanMoves = pgn.split(/\s+/).filter(Boolean);
  const board = new Chess();
  for (let i = 0; i <= initialPly && i < sanMoves.length; i++) {
    try { board.move(sanMoves[i]); } catch { break; }
  }
  const startFen = board.fen();

  // Verify solution legality
  const verifier = new Chess(startFen);
  for (const uci of solution) {
    verifier.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    });
  }
  const isMate = verifier.isCheckmate();
  const isMateTheme = themes.some((t) => t.toLowerCase().startsWith("matein"));

  return {
    title: isMate || isMateTheme ? "Daily Mate Puzzle" : "Daily Tactic",
    url: `https://lichess.org/training/${id}`,
    date: todayStr(),
    startFen,
    solution,
    playerColor: board.turn(),
    firstMoveBy: board.turn(),
    isMate: isMate || isMateTheme,
  };
}


const DailyChallenge = () => {
  const [puzzle, setPuzzle] = useState<ParsedPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadySolved, setAlreadySolved] = useState(isSolvedToday());
  const [streak, setStreak] = useState(loadStreak());
  const [override, setOverride] = useState(false); // user chose to replay
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilMidnightUTC());

  useEffect(() => {
    const today = todayStr();
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (cached?.day === today && cached?.puzzle) {
        setPuzzle(cached.puzzle);
        setLoading(false);
        return;
      }
    } catch {}

    fetchVerifiedDailyMate()
      .then((parsed) => {
        setPuzzle(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: today, puzzle: parsed }));
      })
      .catch((e) => {
        console.error(e);
        setError("Could not load today's puzzle. Please try again.");
      })
      .finally(() => setLoading(false));

    const t = setInterval(() => setSecondsLeft(secondsUntilMidnightUTC()), 30_000);
    return () => clearInterval(t);
  }, []);

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

  if (error || !puzzle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p className="text-destructive">{error || "Puzzle unavailable."}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const hh = Math.floor(secondsLeft / 3600);
  const mm = Math.floor((secondsLeft % 3600) / 60);

  if (alreadySolved && !override) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/40">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Today's puzzle is solved</h1>
            <p className="text-muted-foreground">
              You've already cracked today's engine-verified puzzle. Come back when the next one drops to keep your streak alive.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
                <Flame className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                <div className="text-2xl font-display font-bold text-foreground">{streak.streak}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Day streak</div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="text-2xl font-display font-bold text-foreground tabular-nums">{hh}h {mm}m</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next puzzle</div>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <Button variant="outline" onClick={() => setOverride(true)}>
                <RotateCcw className="mr-2 h-4 w-4" /> Replay (won't change streak)
              </Button>
              <Link to="/"><Button>Back to home</Button></Link>
            </div>

            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 justify-center">
              <Lock className="h-3 w-3" /> One puzzle per day · resets at 00:00 UTC
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Daily Puzzle
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-xs text-orange-300">
                <Flame className="h-3 w-3" /> {streak.streak}-day streak
              </span>
            </div>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 flex-wrap">
              <Calendar className="h-4 w-4" />
              {puzzle.date} · One puzzle per day · resets in {hh}h {mm}m
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Stockfish-verified
              </span>
            </p>
          </div>

          <PuzzleSolver
            puzzle={puzzle}
            replayMode={override}
            onSolved={() => {
              if (!override) {
                const next = markSolvedToday();
                setStreak(next);
                setAlreadySolved(true);
              }
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

function PuzzleSolver({ puzzle, onSolved, replayMode }: { puzzle: ParsedPuzzle; onSolved?: () => void; replayMode?: boolean }) {
  const [game, setGame] = useState(() => new Chess(puzzle.startFen));
  const [moveIndex, setMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [status, setStatus] = useState<"playing" | "solved" | "failed">("playing");
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timer, setTimer] = useState(0);
  const reportedRef = useRef(false);

  // Reset when puzzle changes
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.startFen]);

  // Timer
  useEffect(() => {
    if (status !== "playing") return;
    const i = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [status]);

  function reset() {
    setGame(new Chess(puzzle.startFen));
    setMoveIndex(0);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setStatus("playing");
    setHintSquare(null);
    setHintsUsed(0);
    setTimer(0);
    reportedRef.current = false;
  }

  const playerTurn = useMemo(() => {
    // Player plays every other move starting from move 0
    return moveIndex % 2 === 0;
  }, [moveIndex]);

  // Auto-play opponent reply
  useEffect(() => {
    if (status !== "playing") return;
    if (playerTurn) return;
    if (moveIndex >= puzzle.solution.length) return;

    const t = setTimeout(() => {
      const uci = puzzle.solution[moveIndex];
      const next = new Chess(game.fen());
      const mv = next.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : undefined,
      });
      if (mv) {
        setGame(next);
        setLastMove({ from: mv.from, to: mv.to });
        setMoveIndex((i) => i + 1);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [playerTurn, moveIndex, status, game, puzzle.solution]);

  const onSquareClick = useCallback(
    (square: Square) => {
      if (status !== "playing" || !playerTurn) return;
      const piece = game.get(square);

      if (selectedSquare) {
        const expected = puzzle.solution[moveIndex];
        const tryUci = `${selectedSquare}${square}`;
        // Allow promotion match (default to queen)
        const isMatch =
          tryUci === expected ||
          tryUci + "q" === expected ||
          tryUci === expected.slice(0, 4);

        if (isMatch) {
          const next = new Chess(game.fen());
          const mv = next.move({
            from: selectedSquare,
            to: square,
            promotion: expected.length > 4 ? expected[4] : "q",
          });
          if (mv) {
            setGame(next);
            setLastMove({ from: mv.from, to: mv.to });
            setSelectedSquare(null);
            setLegalMoves([]);
            setHintSquare(null);
            const newIdx = moveIndex + 1;
            setMoveIndex(newIdx);
            if (newIdx >= puzzle.solution.length) {
              setStatus("solved");
            }
          }
        } else {
          setStatus("failed");
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } else if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map((m: any) => m.to));
      }
    },
    [selectedSquare, game, status, moveIndex, puzzle.solution, playerTurn]
  );

  const handleHint = () => {
    if (!playerTurn || status !== "playing") return;
    const move = puzzle.solution[moveIndex];
    if (!move) return;
    setHintSquare(move.slice(0, 2) as Square);
    setHintsUsed((n) => n + 1);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const totalPlies = puzzle.solution.length;
  const playerPlies = Math.ceil(totalPlies / 2);
  const playerMovesDone = Math.ceil(moveIndex / 2);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {puzzle.isMate ? `Mate in ${playerPlies}` : "Find the winning move"}
              </h2>
              {puzzle.isMate ? (
                <Badge className="bg-destructive/20 text-destructive">
                  Forced Mate in {playerPlies}
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  Best move only
                </Badge>
              )}
              <Badge className="bg-primary/20 text-primary">
                Engine-verified
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {formatTime(timer)}
              </span>
            </div>
          </div>
          <p className="text-sm text-foreground/90 font-medium">
            {puzzle.playerColor === "w" ? "⬜ White" : "⬛ Black"} to play —{" "}
            {puzzle.isMate
              ? `force checkmate in ${playerPlies} move${playerPlies === 1 ? "" : "s"}.`
              : "find every move of the winning combination."}
          </p>
          <div className="mt-2 text-xs text-muted-foreground font-mono">
            Progress: {playerMovesDone}/{playerPlies} of your moves
          </div>
        </div>

        <ChessBoard
          game={game}
          flipped={puzzle.playerColor === "b"}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          isGameOver={status !== "playing"}
          isPlayerTurn={status === "playing" && playerTurn}
          hintSquare={hintSquare}
          onSquareClick={onSquareClick}
        />

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

        {status === "solved" && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
            <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
            <h3 className="font-display text-xl font-bold text-foreground mb-1">
              Puzzle Solved! 🎉
            </h3>
            <p className="text-sm text-muted-foreground">
              Time: {formatTime(timer)} · Hints used: {hintsUsed}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Come back tomorrow for a brand new puzzle.
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center">
            <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
            <h3 className="font-display text-xl font-bold text-foreground mb-1">
              Wrong Move
            </h3>
            <p className="text-sm text-muted-foreground">
              That isn't the only winning move — restart and try again.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" /> Today's Rules
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• One unique puzzle every 24 hours.</li>
            <li>• Engine-verified — only the strongest line wins.</li>
            <li>• You must play every correct move to the very end.</li>
            <li>• A wrong move ends the attempt — restart anytime.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Tips
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• Look for checks, captures, and threats first.</li>
            <li>• Calculate forcing moves before quiet ones.</li>
            <li>• A sacrifice often opens the path to mate.</li>
            <li>• Visualize the king's escape squares.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-xs text-foreground font-semibold mb-1">
            Train Daily
          </p>
          <p className="text-[11px] text-muted-foreground">
            Solving one verified puzzle each day is the fastest way to grow.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DailyChallenge;
