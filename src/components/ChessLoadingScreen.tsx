import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Swords, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const pieces = ["♔", "♛", "♜", "♝", "♞", "♟"];

const STAGES = [
  "Loading profile...",
  "Loading tournaments...",
  "Loading leaderboard...",
  "Loading daily rewards...",
  "Polishing the board...",
];

const TIPS = [
  "Control the center of the board.",
  "Every move shapes your future position.",
  "Think before you play.",
  "Patience creates victory.",
  "A strong mind wins equal positions.",
  "Develop pieces before attacking.",
  "A bad plan is better than no plan.",
];

interface LiveStats {
  online: number | null;
  games: number | null;
  tournaments: number | null;
}

export default function ChessLoadingScreen() {
  const [progress, setProgress] = useState(6);
  const [stageIdx, setStageIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [stats, setStats] = useState<LiveStats>({ online: null, games: null, tournaments: null });

  // Animate progress toward 95% so it always feels alive while Suspense resolves
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      setProgress((p) => {
        if (p >= 95) return p;
        // ease-out: closer to 95, slower
        const remaining = 95 - p;
        return Math.min(95, p + (remaining * dt) / 1800);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Rotate stages
  useEffect(() => {
    const t = setInterval(() => setStageIdx((i) => (i + 1) % STAGES.length), 900);
    return () => clearInterval(t);
  }, []);

  // Rotate tips
  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 2600);
    return () => clearInterval(t);
  }, []);

  // Fetch live stats once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [presenceRes, gamesRes, tournRes] = await Promise.all([
          supabase.from("online_game_presence" as any).select("*", { count: "exact", head: true }),
          supabase
            .from("online_games" as any)
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("tournaments" as any)
            .select("*", { count: "exact", head: true })
            .in("status", ["upcoming", "registering", "active", "in_progress"]),
        ]);
        if (!alive) return;
        setStats({
          online: presenceRes.count ?? 0,
          games: gamesRes.count ?? 0,
          tournaments: tournRes.count ?? 0,
        });
      } catch {
        if (alive) setStats({ online: 0, games: 0, tournaments: 0 });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden px-6">
      {/* Soft animated radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 35%, hsl(var(--primary) / 0.18), transparent 70%)",
        }}
      />

      {/* Logo / brand */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-6 text-center"
      >
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Master<span className="text-primary">Chess</span>
        </h1>
        <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          .live
        </p>
      </motion.div>

      {/* Dancing pieces */}
      <div className="flex gap-3 mb-6 relative">
        {pieces.map((p, i) => (
          <motion.span
            key={i}
            className="text-3xl text-primary"
            initial={{ y: 0, opacity: 0.3 }}
            animate={{ y: [0, -14, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          >
            {p}
          </motion.span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs relative">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
          <AnimatePresence mode="wait">
            <motion.span
              key={stageIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              {STAGES[stageIdx]}
            </motion.span>
          </AnimatePresence>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Rotating tip */}
      <div className="mt-6 h-5 max-w-xs text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-sm italic text-foreground/80"
          >
            “{TIPS[tipIdx]}”
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Live stats */}
      <div className="mt-8 grid grid-cols-3 gap-2 w-full max-w-xs">
        <StatPill icon={<Users className="h-3.5 w-3.5" />} label="Online" value={stats.online} />
        <StatPill icon={<Swords className="h-3.5 w-3.5" />} label="Games" value={stats.games} />
        <StatPill icon={<Trophy className="h-3.5 w-3.5" />} label="Events" value={stats.tournaments} />
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/60 backdrop-blur px-2 py-2 flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      {value === null ? (
        <div className="h-3.5 w-8 rounded bg-muted animate-pulse" />
      ) : (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {value.toLocaleString()}
        </span>
      )}
    </div>
  );
}
