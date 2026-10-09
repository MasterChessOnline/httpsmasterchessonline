import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Timer, Trophy } from "lucide-react";
import Seo from "@/components/Seo";

const FILES = "abcdefgh";
const BEST_KEY = "mc_vision_best";
const DURATION = 30;

function randomSquare() {
  return FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);
}

export default function Vision() {
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState(randomSquare());
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [flash, setFlash] = useState<string | null>(null);
  const [white, setWhite] = useState(true);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const timer = useRef<number>();

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          window.clearInterval(timer.current);
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer.current);
  }, [running]);

  useEffect(() => {
    if (!running && time === 0 && score > best) {
      setBest(score);
      localStorage.setItem(BEST_KEY, String(score));
    }
  }, [running, time, score, best]);

  const start = () => {
    setScore(0);
    setTime(DURATION);
    setTarget(randomSquare());
    setRunning(true);
  };

  const click = (sq: string) => {
    if (!running) return;
    if (sq === target) {
      setScore((s) => s + 1);
      setTarget(randomSquare());
      setFlash("ok");
    } else setFlash("bad");
    setTimeout(() => setFlash(null), 150);
  };

  const ranks = white ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = white ? FILES.split("") : FILES.split("").reverse();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Seo
        path="/vision"
        title="Chess Board Vision Trainer — Learn Coordinates Fast | MasterChess"
        description="Free 30-second chess coordinates game. Click the right square as fast as you can, beat your best score. No account needed."
      />
      <header className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" /> Best {best}
        </span>
      </header>
      <main className="flex-1 w-full max-w-md mx-auto px-3 py-4 space-y-4">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Board <span className="text-gradient-gold">Vision</span>
        </h1>
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
            <Timer className="h-4 w-4" /> {time}s
          </span>
          <span className="font-display text-4xl font-bold text-primary">{running ? target : "—"}</span>
          <span className="text-sm font-bold tabular-nums text-foreground">{score}</span>
        </div>
        <div
          className={`grid grid-cols-8 aspect-square w-full rounded-lg overflow-hidden border-2 transition-colors ${
            flash === "ok" ? "border-primary" : flash === "bad" ? "border-destructive" : "border-border/50"
          }`}
        >
          {ranks.map((r, ri) =>
            files.map((f, fi) => {
              const sq = f + r;
              const light = (ri + fi) % 2 === 0;
              return (
                <button
                  key={sq}
                  onClick={() => click(sq)}
                  aria-label={sq}
                  className={`${light ? "bg-secondary" : "bg-primary/60"} active:opacity-70`}
                />
              );
            }),
          )}
        </div>
        {!running && (
          <div className="space-y-2">
            {time === 0 && (
              <p className="text-center text-sm text-foreground">
                You found <b>{score}</b> squares in 30 seconds.{score >= best && score > 0 ? " New best!" : ""}
              </p>
            )}
            <button
              onClick={start}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              {time === 0 ? "Play again" : "Start 30 seconds"}
            </button>
            <button
              onClick={() => setWhite((w) => !w)}
              className="w-full rounded-xl border border-border/50 px-4 py-2 text-xs text-muted-foreground"
            >
              Play as {white ? "Black" : "White"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
