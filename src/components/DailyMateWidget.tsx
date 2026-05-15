import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crosshair, Flame, Clock, Check } from "lucide-react";
import { getTodaysMate, secondsUntilNextMate } from "@/lib/daily-mates";
import { getOpeningBoardImage } from "@/lib/og-board-image";

const STORAGE_KEY = "mc.dailyMate.streak.v1";
const SOLVED_KEY = "mc.dailyMate.solved.v1";

interface StreakState {
  streak: number;
  lastSolvedDay: string | null; // YYYY-MM-DD UTC
}

function todayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { streak: 0, lastSolvedDay: null };
    return JSON.parse(raw) as StreakState;
  } catch {
    return { streak: 0, lastSolvedDay: null };
  }
}

export function isSolvedToday(): boolean {
  try {
    return localStorage.getItem(SOLVED_KEY) === todayKey();
  } catch {
    return false;
  }
}

export default function DailyMateWidget() {
  const puzzle = useMemo(() => getTodaysMate(), []);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState<StreakState>({ streak: 0, lastSolvedDay: null });
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilNextMate());

  useEffect(() => {
    setSolved(isSolvedToday());
    setStreak(loadStreak());
    const t = setInterval(() => setSecondsLeft(secondsUntilNextMate()), 60_000);
    return () => clearInterval(t);
  }, []);

  // FEN URL — shows the actual position via Chess.com dyn-board (same trick as OG images)
  const boardImg = `https://www.chess.com/dynboard?fen=${encodeURIComponent(puzzle.fen)}&board=green&piece=neo&size=2`;

  const hh = Math.floor(secondsLeft / 3600);
  const mm = Math.floor((secondsLeft % 3600) / 60);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card via-card to-amber-500/5">
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-foreground leading-tight">Daily Mate</div>
              <div className="text-[10px] text-muted-foreground">Resets in {hh}h {mm}m</div>
            </div>
          </div>
          <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
            Mate in {puzzle.matesIn}
          </Badge>
        </div>

        <div className="p-3 grid grid-cols-[auto,1fr] gap-3 items-center">
          <Link to="/daily-mate" className="block shrink-0">
            <img
              src={boardImg}
              alt={`Daily mate-in-${puzzle.matesIn} chess puzzle`}
              loading="lazy"
              width={120}
              height={120}
              className="w-[120px] h-[120px] rounded-md ring-1 ring-border/40"
            />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-2 leading-snug">
              {puzzle.side === "w" ? "White" : "Black"} to play and force mate in {puzzle.matesIn}.
              Solve every day to grow your streak.
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
            <Link to="/daily-mate">
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
