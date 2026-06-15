import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Chess, type Square } from "chess.js";
import { Loader2, RotateCcw, ChevronRight, Lightbulb, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivePieceStyle } from "@/lib/board-themes";
import { useToast } from "@/hooks/use-toast";

type LichessDailyPuzzle = {
  game: { id: string; pgn: string };
  puzzle: { id: string; initialPly: number; solution: string[]; themes: string[]; rating: number };
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function fenToBoard(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/");
  return rows.map((row) => {
    const out: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
      else out.push((ch === ch.toUpperCase() ? "w" : "b") + ch.toLowerCase());
    }
    return out;
  });
}

/**
 * /puzzles — fetches Lichess Daily Puzzle (public, no key) and lets the user
 * solve it move by move. Pure read-only consumption — no Lichess account needed.
 */
export default function Puzzles() {
  const { toast } = useToast();
  const [data, setData] = useState<LichessDailyPuzzle | null>(null);
  const [chess, setChess] = useState<Chess | null>(null);
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [solutionIdx, setSolutionIdx] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legal, setLegal] = useState<Square[]>([]);
  const [status, setStatus] = useState<"loading" | "playing" | "solved" | "error">("loading");
  const [hintShown, setHintShown] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("mc_puzzle_streak") || "0"));
  const style = useMemo(() => getActivePieceStyle(), []);

  const loadDaily = async () => {
    setStatus("loading");
    setHintShown(false);
    setSolutionIdx(0);
    try {
      const res = await fetch("https://lichess.org/api/puzzle/daily");
      if (!res.ok) throw new Error("fetch failed");
      const json: LichessDailyPuzzle = await res.json();
      const g = new Chess();
      // Replay PGN up to initialPly, then play one more move = the opponent's setup move
      g.loadPgn(json.game.pgn);
      // chess.js after loadPgn is at end; rewind by undoing until length matches initialPly + 1
      const history = g.history();
      const targetLen = json.puzzle.initialPly + 1;
      const undoCount = Math.max(0, history.length - targetLen);
      for (let i = 0; i < undoCount; i++) g.undo();
      setData(json);
      setChess(g);
      // The side to move now is the side the user plays
      setOrientation(g.turn());
      setStatus("playing");
      setLastMove(null);
      setSelected(null);
      setLegal([]);
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => { loadDaily(); }, []);

  const board = chess ? fenToBoard(chess.fen()) : null;
  const displayFiles = orientation === "w" ? FILES : [...FILES].reverse();
  const displayRanks = orientation === "w" ? RANKS : [...RANKS].reverse();

  const onSquare = (sq: Square) => {
    if (!chess || !data || status !== "playing") return;
    if (selected && legal.includes(sq)) {
      // Attempt move
      const expectedUci = data.puzzle.solution[solutionIdx];
      const moveUci = `${selected}${sq}`;
      // Lichess solution moves include promotion suffix (e.g. e7e8q)
      const matches = expectedUci.startsWith(moveUci);
      if (!matches) {
        toast({ title: "Not the solution", description: "Try a different move.", variant: "destructive" });
        setSelected(null);
        setLegal([]);
        return;
      }
      const promotion = expectedUci.length === 5 ? expectedUci[4] : undefined;
      try {
        chess.move({ from: selected, to: sq, promotion });
      } catch {
        setSelected(null);
        setLegal([]);
        return;
      }
      setLastMove({ from: selected, to: sq });
      setSelected(null);
      setLegal([]);
      const nextIdx = solutionIdx + 1;
      // Play opponent's reply automatically (next move in solution)
      if (nextIdx < data.puzzle.solution.length) {
        const reply = data.puzzle.solution[nextIdx];
        setTimeout(() => {
          try {
            chess.move({ from: reply.slice(0, 2) as Square, to: reply.slice(2, 4) as Square, promotion: reply[4] });
            setLastMove({ from: reply.slice(0, 2), to: reply.slice(2, 4) });
            setChess(new Chess(chess.fen())); // force rerender
            setSolutionIdx(nextIdx + 1);
            if (nextIdx + 1 >= data.puzzle.solution.length) {
              setStatus("solved");
              const newStreak = streak + 1;
              setStreak(newStreak);
              localStorage.setItem("mc_puzzle_streak", String(newStreak));
            }
          } catch {}
        }, 350);
        setChess(new Chess(chess.fen()));
        setSolutionIdx(nextIdx);
      } else {
        // Solved with our last move
        setChess(new Chess(chess.fen()));
        setSolutionIdx(nextIdx);
        setStatus("solved");
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("mc_puzzle_streak", String(newStreak));
      }
      return;
    }
    // Select a piece
    const piece = chess.get(sq);
    if (piece && piece.color === chess.turn()) {
      setSelected(sq);
      const moves = chess.moves({ square: sq, verbose: true }) as any[];
      setLegal(moves.map((m) => m.to as Square));
    } else {
      setSelected(null);
      setLegal([]);
    }
  };

  const showHint = () => {
    if (!data) return;
    const next = data.puzzle.solution[solutionIdx];
    if (!next) return;
    setHintShown(true);
    toast({ title: "Hint", description: `Move from ${next.slice(0, 2).toUpperCase()}` });
  };

  return (
    <>
      <Helmet>
        <title>Daily Chess Puzzle — Free Tactics Trainer | MasterChess</title>
        <meta name="description" content="Solve today's chess puzzle. Free, no account needed. A new tactical puzzle every day on MasterChess." />
        <link rel="canonical" href="https://masterchess.live/puzzles" />
        <meta property="og:title" content="Daily Chess Puzzle — MasterChess" />
        <meta property="og:description" content="Solve today's free chess puzzle. Train tactics every day." />
        <meta property="og:url" content="https://masterchess.live/puzzles" />
      </Helmet>

      <main className="min-h-screen px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Daily puzzle
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Today's Chess <span className="text-gradient-gold">Tactic</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Find the best move for {chess?.turn() === "w" ? "White" : "Black"}. No account needed.
            </p>
            {streak > 0 && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                <Trophy className="h-3.5 w-3.5" /> {streak} solved
              </div>
            )}
          </div>

          {status === "loading" && (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading today's puzzle…
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-3 py-12">
              <p className="text-muted-foreground">Couldn't load today's puzzle. Check your connection.</p>
              <Button onClick={loadDaily}>Try again</Button>
            </div>
          )}

          {board && (status === "playing" || status === "solved") && (
            <>
              <div className="aspect-square max-w-[560px] mx-auto rounded-xl overflow-hidden ring-1 ring-border/60 shadow-2xl">
                <div className="grid grid-cols-8 w-full h-full">
                  {displayRanks.map((rank, r) =>
                    displayFiles.map((file, c) => {
                      const sq = `${file}${rank}` as Square;
                      const boardR = orientation === "w" ? r : 7 - r;
                      const boardC = orientation === "w" ? c : 7 - c;
                      const piece = board[boardR][boardC];
                      const isLight = (r + c) % 2 === 0;
                      const isSelected = selected === sq;
                      const isLegal = legal.includes(sq);
                      const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
                      const svg =
                        piece && style.mode === "svg" && style.svgFolder
                          ? `/pieces/${style.svgFolder}/${piece[0]}${piece[1].toUpperCase()}.svg`
                          : null;
                      return (
                        <button
                          key={sq}
                          onClick={() => onSquare(sq)}
                          className="relative flex items-center justify-center select-none"
                          style={{
                            background: isSelected
                              ? "hsl(var(--primary) / 0.45)"
                              : isLast
                              ? "hsl(var(--primary) / 0.25)"
                              : isLight
                              ? "hsl(var(--board-light))"
                              : "hsl(var(--board-dark))",
                          }}
                        >
                          {svg && (
                            <img
                              src={svg}
                              alt=""
                              draggable={false}
                              className="w-[88%] h-[88%] pointer-events-none"
                            />
                          )}
                          {isLegal && !piece && (
                            <span className="absolute h-3 w-3 rounded-full bg-foreground/30 pointer-events-none" />
                          )}
                          {isLegal && piece && (
                            <span className="absolute inset-1 rounded-full ring-2 ring-foreground/40 pointer-events-none" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {status === "solved" ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                    <Trophy className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground">Solved!</h2>
                  <p className="text-xs text-muted-foreground">Come back tomorrow for a new puzzle.</p>
                  <Button onClick={loadDaily} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" /> Replay
                  </Button>
                </motion.div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={showHint} disabled={hintShown}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Hint
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadDaily}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  {data && (
                    <span className="text-[11px] text-muted-foreground ml-2">
                      Rating: {data.puzzle.rating} · Themes: {data.puzzle.themes.slice(0, 3).join(", ")}
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          <div className="text-center text-[11px] text-muted-foreground pt-6">
            New puzzle every day.{" "}
            <a className="underline hover:text-foreground" href="/play">Play a real game →</a>
          </div>
        </div>
      </main>
    </>
  );
}
