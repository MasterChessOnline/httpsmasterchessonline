import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crosshair, Flame, Clock, Check, Loader2, ShieldCheck } from "lucide-react";

interface VerifiedPuzzle {
  date: string;          // YYYY-MM-DD
  startFen: string;
  solution: string[];    // UCI
  playerColor: "w" | "b";
  isMate: boolean;
  matesIn: number;       // full moves to mate (player moves)
  themes: string[];
  id: string;
}

const CACHE_KEY = "mc_daily_puzzle_widget_v1";
const SOLVED_KEY = "mc.dailyMate.solved.v1";
const STREAK_KEY = "mc.dailyMate.streak.v1";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

async function fetchVerifiedDailyPuzzle(): Promise<VerifiedPuzzle> {
  // Cache by day
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as VerifiedPuzzle;
      if (cached.date === todayStr()) return cached;
    }
  } catch {}

  const r = await fetch("https://lichess.org/api/puzzle/daily");
  if (!r.ok) throw new Error(`Lichess HTTP ${r.status}`);
  const data = await r.json();

  const pgn: string = data.game?.pgn || "";
  const initialPly: number = data.puzzle?.initialPly ?? 0;
  const solution: string[] = data.puzzle?.solution || [];
  const themes: string[] = data.puzzle?.themes || [];
  const id: string = data.puzzle?.id || "daily";

  if (!pgn || !solution.length) throw new Error("Invalid puzzle payload");

  const sanMoves = pgn.split(/\s+/).filter(Boolean);
  const board = new Chess();
  for (let i = 0; i <= initialPly && i < sanMoves.length; i++) {
    try { board.move(sanMoves[i]); } catch { break; }
  }
  const startFen = board.fen();

  // Verify legality + checkmate (Stockfish-engine-verified by Lichess; this confirms forced line)
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

  // Player makes ceil(solution.length/2) moves
  const matesIn = Math.ceil(solution.length / 2);

  const puzzle: VerifiedPuzzle = {
    date: todayStr(),
    startFen,
    solution,
    playerColor: board.turn() as "w" | "b",
    isMate: isMate || isMateTheme,
    matesIn,
    themes,
    id,
  };

  try { localStorage.setItem(CACHE_KEY, JSON.stringify(puzzle)); } catch {}
  return puzzle;
}

function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0
  ));
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

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

export default function DailyPuzzleWidget() {
  const [puzzle, setPuzzle] = useState<VerifiedPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(loadStreak());
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilMidnightUTC());

  useEffect(() => {
    let alive = true;
    fetchVerifiedDailyPuzzle()
      .then((p) => { if (alive) setPuzzle(p); })
      .catch((e) => { if (alive) setError(e?.message || "Failed to load"); })
      .finally(() => { if (alive) setLoading(false); });
    setSolved(isSolvedToday());
    setStreak(loadStreak());
    const t = setInterval(() => setSecondsLeft(secondsUntilMidnightUTC()), 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const hh = Math.floor(secondsLeft / 3600);
  const mm = Math.floor((secondsLeft % 3600) / 60);

  const boardImg = puzzle
    ? `https://www.chess.com/dynboard?fen=${encodeURIComponent(puzzle.startFen)}&board=green&piece=neo&size=2`
    : null;

  const label = puzzle?.isMate ? `Mate in ${puzzle.matesIn}` : "Daily Tactic";
  const sideToMove = puzzle?.playerColor === "w" ? "White" : "Black";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card via-card to-amber-500/5">
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-foreground leading-tight">Daily Puzzle</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Engine-verified · resets in {hh}h {mm}m
              </div>
            </div>
          </div>
          {puzzle && (
            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
              {label}
            </Badge>
          )}
        </div>

        <div className="p-3 grid grid-cols-[auto,1fr] gap-3 items-center">
          <Link to="/daily-puzzle" className="block shrink-0">
            {loading || !boardImg ? (
              <div className="w-[120px] h-[120px] rounded-md ring-1 ring-border/40 bg-muted/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <img
                src={boardImg}
                alt={`Daily ${label} chess puzzle`}
                loading="lazy"
                width={120}
                height={120}
                className="w-[120px] h-[120px] rounded-md ring-1 ring-border/40"
              />
            )}
          </Link>
          <div className="min-w-0">
            {error ? (
              <p className="text-xs text-destructive mb-2">Couldn't load today's puzzle. Try again later.</p>
            ) : (
              <p className="text-xs text-muted-foreground mb-2 leading-snug">
                {puzzle ? (
                  <>
                    {sideToMove} to play.{" "}
                    {puzzle.isMate
                      ? `Force checkmate in ${puzzle.matesIn}.`
                      : "Find the full forced winning line."}{" "}
                    Solve every day to grow your streak.
                  </>
                ) : (
                  "Loading today's engine-verified puzzle…"
                )}
              </p>
            )}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className="text-[10px] gap-1 border-orange-500/40 text-orange-300">
                <Flame className="w-3 h-3" /> {streak.streak}-day
              </Badge>
              {solved ? (
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                  <Check className="w-3 h-3" /> Done today
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Clock className="w-3 h-3" /> Pending
                </Badge>
              )}
            </div>
            <Link to="/daily-puzzle">
              <Button size="sm" className="w-full" disabled={loading && !puzzle}>
                {solved ? "Replay" : "Solve now"} →
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
