import { useState, useEffect, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { PUZZLES } from "@/lib/puzzles-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, XCircle, Lightbulb, Clock, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♚", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wq: { symbol: "♛", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wr: { symbol: "♜", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wb: { symbol: "♝", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wn: { symbol: "♞", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wp: { symbol: "♟", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  bk: { symbol: "♚", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bq: { symbol: "♛", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  br: { symbol: "♜", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bb: { symbol: "♝", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bn: { symbol: "♞", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bp: { symbol: "♟", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
};

function getDailyPuzzleIndex(): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % PUZZLES.length;
}

export default function DailyPuzzle() {
  const { user } = useAuth();
  const puzzleIdx = getDailyPuzzleIndex();
  const puzzle = PUZZLES[puzzleIdx];
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [moveIndex, setMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [opponentThinking, setOpponentThinking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ display_name: string; time_seconds: number }[]>([]);

  const board = useMemo(() => game.board(), [game.fen()]);
  const boardFlipped = puzzle.playerColor === "b";
  const displayFiles = boardFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = boardFlipped ? [...RANKS].reverse() : RANKS;

  // Timer
  useEffect(() => {
    if (solved) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [solved]);

  // Load today's leaderboard
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("puzzle_solves")
      .select("time_seconds, user_id")
      .eq("puzzle_date", today)
      .eq("solved", true)
      .order("time_seconds", { ascending: true })
      .limit(5)
      .then(async ({ data }) => {
        if (!data || data.length === 0) return;
        const userIds = data.map(d => d.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        const profileMap: Record<string, string> = {};
        profiles?.forEach(p => { profileMap[p.user_id] = p.display_name || "Player"; });
        setLeaderboard(data.map(d => ({
          display_name: profileMap[d.user_id] || "Player",
          time_seconds: d.time_seconds || 0,
        })));
      });
  }, [solved]);

  // Check if already solved today
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("puzzle_solves")
      .select("solved, time_seconds")
      .eq("user_id", user.id)
      .eq("puzzle_date", today)
      .single()
      .then(({ data }) => {
        if (data?.solved) {
          setSolved(true);
          setFeedback("correct");
          setTimer(data.time_seconds || 0);
        }
      });
  }, [user]);

  // Opponent auto-response
  useEffect(() => {
    if (!opponentThinking) return;
    const opponentMove = puzzle.moves[moveIndex];
    if (!opponentMove) { setOpponentThinking(false); return; }
    const t = setTimeout(() => {
      const newGame = new Chess(game.fen());
      const move = newGame.move(opponentMove);
      if (move) {
        setGame(newGame);
        setMoveIndex(prev => prev + 1);
      }
      setOpponentThinking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [opponentThinking]);

  const saveSolve = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("puzzle_solves").upsert({
      user_id: user.id,
      puzzle_date: today,
      puzzle_index: puzzleIdx,
      solved: true,
      time_seconds: timer,
    }, { onConflict: "user_id,puzzle_date" });
  }, [user, puzzleIdx, timer]);

  const handleSquareClick = useCallback((square: Square) => {
    if (solved || feedback === "wrong" || opponentThinking) return;

    if (selectedSquare && legalMoves.includes(square)) {
      const moveCopy = new Chess(game.fen());
      const move = moveCopy.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        const expectedMove = puzzle.moves[moveIndex];
        if (move.san === expectedMove) {
          setGame(moveCopy);
          const nextIdx = moveIndex + 1;
          setMoveIndex(nextIdx);
          if (nextIdx >= puzzle.moves.length) {
            setFeedback("correct");
            setSolved(true);
            saveSolve();
          } else {
            setFeedback(null);
            setOpponentThinking(true);
          }
        } else {
          setFeedback("wrong");
          setTimeout(() => setFeedback(null), 1200);
        }
      }
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
  }, [game, selectedSquare, legalMoves, puzzle, solved, feedback, moveIndex, opponentThinking, saveSolve]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Daily Challenge</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground text-center">
            Puzzle of the <span className="text-gradient-gold">Day</span>
          </h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            {puzzle.playerColor === "w" ? "White" : "Black"} to move — {puzzle.title}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
          {/* Board */}
          <div className="w-full max-w-[min(85vw,400px)]">
            <div role="grid" aria-label="Daily puzzle board" className="rounded-xl overflow-hidden border-2 border-border/50 shadow-glow">
              {displayRanks.map((rank) => (
                <div key={rank} className="flex" role="row">
                  {displayFiles.map((file) => {
                    const square = `${file}${rank}` as Square;
                    const origRi = RANKS.indexOf(rank);
                    const origFi = FILES.indexOf(file);
                    const isLight = (origRi + origFi) % 2 === 0;
                    const piece = board[origRi][origFi];
                    const isSelected = selectedSquare === square;
                    const isLegal = legalMoves.includes(square);
                    const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                    const pieceDisplay = pieceKey ? PIECE_DISPLAY[pieceKey] : null;

                    return (
                      <button
                        key={square}
                        role="gridcell"
                        className={`aspect-square w-[12.5%] flex items-center justify-center text-2xl sm:text-4xl select-none transition-all duration-150
                          ${isLight ? "bg-board-light" : "bg-board-dark"}
                          ${isSelected ? "ring-2 ring-primary ring-inset brightness-125" : ""}
                          ${isLegal ? "cursor-pointer" : "cursor-default"}`}
                        onClick={() => handleSquareClick(square)}
                      >
                        {isLegal && !piece && <span className="block h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-full bg-primary/40" />}
                        {isLegal && pieceDisplay && <span className={`${pieceDisplay.className} drop-shadow-[0_0_6px_hsl(var(--primary))]`}>{pieceDisplay.symbol}</span>}
                        {!isLegal && pieceDisplay && <span className={pieceDisplay.className}>{pieceDisplay.symbol}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-bold text-foreground">{formatTime(timer)}</span>
              </div>
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                puzzle.difficulty === "easy" ? "text-accent-foreground bg-accent/20 border-accent/30" :
                puzzle.difficulty === "medium" ? "text-primary bg-primary/10 border-primary/30" :
                "text-destructive bg-destructive/10 border-destructive/30"
              }`}>{puzzle.difficulty}</span>
            </div>

            {feedback === "correct" && (
              <div className="flex items-center gap-2 text-accent-foreground bg-accent/20 rounded-lg px-4 py-3 border border-accent/30">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Solved! 🎉</p>
                  <p className="text-xs opacity-80">Time: {formatTime(timer)}</p>
                </div>
              </div>
            )}
            {feedback === "wrong" && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg px-4 py-2 border border-destructive/30">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Try again!</span>
              </div>
            )}

            {!solved && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowHint(!showHint)}>
                <Lightbulb className="mr-2 h-4 w-4" /> {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
            )}

            {showHint && !solved && (
              <p className="text-sm text-primary bg-primary/10 rounded-lg p-3 border border-primary/20">💡 {puzzle.hint}</p>
            )}

            {/* Mini leaderboard */}
            {leaderboard.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Fastest</span>
                </div>
                <div className="space-y-1">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{i + 1}. {entry.display_name}</span>
                      <span className="font-mono text-muted-foreground">{formatTime(entry.time_seconds)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link to="/puzzles">
              <Button variant="outline" size="sm" className="w-full mt-2">
                More Puzzles →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
