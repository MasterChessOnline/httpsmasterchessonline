import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";

export interface TimeControl {
  label: string;
  seconds: number; // per player
}

export const TIME_CONTROLS: TimeControl[] = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "∞", seconds: 0 }, // unlimited
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
