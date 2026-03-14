import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";

export interface TimeControl {
  label: string;
  seconds: number; // per player
  increment: number; // seconds added per move
}

export const TIME_CONTROLS: TimeControl[] = [
  // Bullet
  { label: "1+0", seconds: 60, increment: 0 },
  { label: "1+1", seconds: 60, increment: 1 },
  { label: "2+1", seconds: 120, increment: 1 },
  // Blitz
  { label: "3+0", seconds: 180, increment: 0 },
  { label: "3+2", seconds: 180, increment: 2 },
  { label: "5+0", seconds: 300, increment: 0 },
  { label: "5+3", seconds: 300, increment: 3 },
  // Rapid
  { label: "10+0", seconds: 600, increment: 0 },
  { label: "10+5", seconds: 600, increment: 5 },
  { label: "15+10", seconds: 900, increment: 10 },
  { label: "30+0", seconds: 1800, increment: 0 },
  // Classical
  { label: "60+30", seconds: 3600, increment: 30 },
  // Unlimited
  { label: "∞", seconds: 0, increment: 0 },
];

interface ChessClockProps {
  whiteTime: number; // seconds remaining
  blackTime: number;
  activeColor: "w" | "b" | null; // null = paused
  isGameOver: boolean;
  onTimeOut: (color: "w" | "b") => void;
  setWhiteTime: (t: number | ((p: number) => number)) => void;
  setBlackTime: (t: number | ((p: number) => number)) => void;
  unlimited: boolean;
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChessClock({
  whiteTime,
  blackTime,
  activeColor,
  isGameOver,
  onTimeOut,
  setWhiteTime,
  setBlackTime,
  unlimited,
}: ChessClockProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (unlimited || isGameOver || !activeColor) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (activeColor === "w") {
        setWhiteTime((prev: number) => {
          if (prev <= 1) {
            onTimeOut("w");
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev: number) => {
          if (prev <= 1) {
            onTimeOut("b");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeColor, isGameOver, unlimited]);

  if (unlimited) return null;

  const whiteUrgent = whiteTime <= 30;
  const blackUrgent = blackTime <= 30;

  return (
    <div className="flex justify-between gap-3">
      <div
        className={`flex-1 rounded-lg border px-3 py-2 text-center transition-colors ${
          activeColor === "w" && !isGameOver
            ? "border-primary bg-primary/10"
            : "border-border/50 bg-card"
        }`}
      >
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
          <Clock className="h-3 w-3" /> White
        </div>
        <span className={`font-mono text-lg font-bold ${whiteUrgent ? "text-destructive" : "text-foreground"}`}>
          {formatTime(whiteTime)}
        </span>
      </div>
      <div
        className={`flex-1 rounded-lg border px-3 py-2 text-center transition-colors ${
          activeColor === "b" && !isGameOver
            ? "border-primary bg-primary/10"
            : "border-border/50 bg-card"
        }`}
      >
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
          <Clock className="h-3 w-3" /> Black
        </div>
        <span className={`font-mono text-lg font-bold ${blackUrgent ? "text-destructive" : "text-foreground"}`}>
          {formatTime(blackTime)}
        </span>
      </div>
    </div>
  );
}
