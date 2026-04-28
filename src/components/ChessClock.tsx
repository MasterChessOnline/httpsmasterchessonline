import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  if (seconds < 10) {
    // Show tenths in the danger zone for that "tick" feel
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Tiny WebAudio beep used as low-time warning. No external assets needed,
// respects the user's existing sound preferences via the global "muted" flag.
function playLowTimeBeep(volume = 0.08) {
  try {
    if (typeof window === "undefined") return;
    const muted = (window as any).__chessSoundMuted;
    if (muted) return;
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = (window as any).__lowTimeAudioCtx || ((window as any).__lowTimeAudioCtx = new Ctx());
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = volume;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.stop(ctx.currentTime + 0.2);
  } catch {}
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
  const lastBeepRef = useRef<{ w: number; b: number }>({ w: 0, b: 0 });

  // Increment flash ("+5s") when the value JUMPS upward (server granted increment)
  const prevWhiteRef = useRef(whiteTime);
  const prevBlackRef = useRef(blackTime);
  const [whiteIncFlash, setWhiteIncFlash] = useState<number | null>(null);
  const [blackIncFlash, setBlackIncFlash] = useState<number | null>(null);

  useEffect(() => {
    const diff = whiteTime - prevWhiteRef.current;
    if (diff > 0 && diff <= 60) {
      setWhiteIncFlash(diff);
      const id = setTimeout(() => setWhiteIncFlash(null), 1200);
      return () => clearTimeout(id);
    }
    prevWhiteRef.current = whiteTime;
  }, [whiteTime]);

  useEffect(() => {
    const diff = blackTime - prevBlackRef.current;
    if (diff > 0 && diff <= 60) {
      setBlackIncFlash(diff);
      const id = setTimeout(() => setBlackIncFlash(null), 1200);
      return () => clearTimeout(id);
    }
    prevBlackRef.current = blackTime;
  }, [blackTime]);

  // Keep refs in sync after flashes settle
  useEffect(() => { prevWhiteRef.current = whiteTime; }, [whiteTime]);
  useEffect(() => { prevBlackRef.current = blackTime; }, [blackTime]);

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
          // Beep on every second under 10s, and once at 30s threshold
          if (prev <= 10 && prev !== lastBeepRef.current.w) {
            lastBeepRef.current.w = prev;
            playLowTimeBeep(0.06);
          } else if (prev === 30) {
            playLowTimeBeep(0.04);
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev: number) => {
          if (prev <= 1) {
            onTimeOut("b");
            return 0;
          }
          if (prev <= 10 && prev !== lastBeepRef.current.b) {
            lastBeepRef.current.b = prev;
            playLowTimeBeep(0.06);
          } else if (prev === 30) {
            playLowTimeBeep(0.04);
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeColor, isGameOver, unlimited]);

  if (unlimited) return null;

  const whiteUrgent = whiteTime <= 30;
  const whiteCritical = whiteTime <= 10;
  const blackUrgent = blackTime <= 30;
  const blackCritical = blackTime <= 10;

  const renderSide = (side: "w" | "b") => {
    const t = side === "w" ? whiteTime : blackTime;
    const urgent = side === "w" ? whiteUrgent : blackUrgent;
    const critical = side === "w" ? whiteCritical : blackCritical;
    const isActive = activeColor === side && !isGameOver;
    const flash = side === "w" ? whiteIncFlash : blackIncFlash;
    const label = side === "w" ? "White" : "Black";

    return (
      <motion.div
        animate={
          isActive && critical
            ? { scale: [1, 1.04, 1], boxShadow: ["0 0 0 0 hsl(0 84% 60% / 0)", "0 0 0 6px hsl(0 84% 60% / 0.25)", "0 0 0 0 hsl(0 84% 60% / 0)"] }
            : { scale: 1 }
        }
        transition={isActive && critical ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
        className={`relative flex-1 rounded-lg border px-3 py-2 text-center transition-colors ${
          isActive
            ? critical
              ? "border-destructive bg-destructive/10"
              : urgent
                ? "border-orange-400/70 bg-orange-400/10"
                : "border-primary bg-primary/10"
            : "border-border/50 bg-card"
        }`}
      >
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
          <Clock className="h-3 w-3" /> {label}
        </div>
        <span
          className={`font-mono text-lg font-bold tabular-nums ${
            critical ? "text-destructive" : urgent ? "text-orange-400" : "text-foreground"
          }`}
        >
          {formatTime(t)}
        </span>

        {/* Increment flash: "+Xs" floats up when server grants increment */}
        <AnimatePresence>
          {flash != null && (
            <motion.span
              key={`inc-${side}-${flash}`}
              initial={{ opacity: 0, y: 0, scale: 0.85 }}
              animate={{ opacity: 1, y: -14, scale: 1 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ duration: 0.6 }}
              className="absolute right-2 top-1 text-[10px] font-mono font-bold text-green-400 pointer-events-none"
            >
              +{flash}s
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex justify-between gap-3">
      {renderSide("w")}
      {renderSide("b")}
    </div>
  );
}
