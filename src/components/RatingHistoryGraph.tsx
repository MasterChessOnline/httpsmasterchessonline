// Lightweight inline SVG sparkline of rating history.
// No external chart lib needed — keeps the bundle small.

import { motion } from "framer-motion";

export interface RatingPoint {
  created_at: string;
  new_rating: number;
  rating_change: number;
}

interface Props {
  points: RatingPoint[];
  color?: string;       // hsl token e.g. "hsl(var(--primary))"
  height?: number;
  emptyLabel?: string;
}

export default function RatingHistoryGraph({
  points,
  color = "hsl(var(--primary))",
  height = 80,
  emptyLabel = "Play a game to start your rating history",
}: Props) {
  if (!points.length) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground py-6 border border-dashed border-border/50 rounded-lg">
        {emptyLabel}
      </div>
    );
  }

  const sorted = [...points].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const ratings = sorted.map(p => p.new_rating);
  const min = Math.min(...ratings) - 10;
  const max = Math.max(...ratings) + 10;
  const range = Math.max(1, max - min);
  const width = 100;
  const points2 = sorted.map((p, i) => {
    const x = (i / Math.max(1, sorted.length - 1)) * width;
    const y = height - ((p.new_rating - min) / range) * height;
    return `${x},${y}`;
  });

  const path = `M ${points2.join(" L ")}`;
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;
  const last = sorted[sorted.length - 1];
  const first = sorted[0];
  const totalChange = last.new_rating - first.new_rating;
  const positive = totalChange >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold tabular-nums text-foreground">{last.new_rating}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</div>
        </div>
        <div className={`text-sm font-semibold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
          {positive ? "+" : ""}{totalChange} <span className="text-xs text-muted-foreground">last {sorted.length}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="rh-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill="url(#rh-grad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
