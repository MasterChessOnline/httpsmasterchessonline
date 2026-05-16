import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crosshair, Flame, Clock, Check, ShieldCheck } from "lucide-react";
import { PUZZLE_POOL } from "@/lib/daily-puzzles";
import MiniFenBoard from "@/components/MiniFenBoard";

const SOLVED_KEY = "mc.dailyMate.solved.v1";
const STREAK_KEY = "mc.dailyMate.streak.v1";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function dayHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Pick a deterministic puzzle for today out of the local MasterChess pool. */
function pickTodaysPuzzle() {
  const idx = dayHash(todayStr()) % PUZZLE_POOL.length;
  const p = PUZZLE_POOL[idx];
  // Compute side to move + mate status from FEN + solution
  const board = new Chess(p.fen);
  const side = board.turn() as "w" | "b";
  let isMate = false;
  try {
    for (const uci of p.solution) {
      board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    }
    isMate = board.isCheckmate();
  } catch {}
  const matesIn = Math.max(1, Math.ceil(p.solution.length / 2));
  return { ...p, side, isMate, matesIn };
}

function secondsUntilLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

function isSolvedToday(): boolean {
  try { return localStorage.getItem(SOLVED_KEY) === todayStr(); } catch { return false; }
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { streak: 0, lastSolvedDay: null as string | null };
    return JSON.parse(raw);
  } catch { return { streak: 0, lastSolvedDay: null as string | null }; }
}

export default function DailyPuzzleWidget() {
  const puzzle = useMemo(() => pickTodaysPuzzle(), []);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(loadStreak());
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilLocalMidnight());

  useEffect(() => {
    setSolved(isSolvedToday());
    setStreak(loadStreak());
    const t = setInterval(() => setSecondsLeft(secondsUntilLocalMidnight()), 60_000);
    return () => clearInterval(t);
  }, []);

  const hh = Math.floor(secondsLeft / 3600);
  const mm = Math.floor((secondsLeft % 3600) / 60);

  const label = puzzle.isMate ? `Mate in ${puzzle.matesIn}` : puzzle.title;
  const sideToMove = puzzle.side === "w" ? "White" : "Black";

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
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> MasterChess original · resets in {hh}h {mm}m
              </div>
            </div>
          </div>
          <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
            {label}
          </Badge>
        </div>

        <div className="p-3 grid grid-cols-[auto,1fr] gap-3 items-center">
          <Link to="/daily-puzzle" className="block shrink-0">
            <MiniFenBoard fen={puzzle.fen} size={120} alt={`Daily ${label} chess puzzle`} />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-2 leading-snug">
              {sideToMove} to play. {puzzle.isMate ? `Force checkmate in ${puzzle.matesIn}.` : puzzle.description}
              {" "}Solve every day to grow your streak.
            </p>
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
              <Button size="sm" className="w-full">
                {solved ? "Replay" : "Solve now"} →
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
