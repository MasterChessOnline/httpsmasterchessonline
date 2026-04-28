import { useMemo } from "react";

interface MoveEvalLite {
  san: string;
  eval: number;
  mate: number | null;
  color: "w" | "b";
}

interface Props {
  evals: MoveEvalLite[];
  currentIdx: number;
  onSelect?: (idx: number) => void;
  height?: number;
}

// Centipawn → white-POV percentage [0..100], clamped, with mate handling.
function toPct(cp: number, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 100 : 0;
  const x = cp / 100;
  return Math.max(2, Math.min(98, 50 + 50 * (2 / (1 + Math.exp(-0.4 * x)) - 1)));
}

export default function EvalGraph({ evals, currentIdx, onSelect, height = 80 }: Props) {
  const points = useMemo(() => evals.map((e) => toPct(e.eval, e.mate)), [evals]);
  const w = 100;
  const h = 100;

  if (points.length === 0) {
    return (
      <div
        className="rounded-md border border-border/50 bg-card/40 flex items-center justify-center text-[10px] text-muted-foreground"
        style={{ height }}
      >
        Play moves to see the evaluation graph
      </div>
    );
  }

  const stepX = w / Math.max(1, points.length - 1);
  // Build closed area path (white above 50, black below)
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(2)},${(100 - p).toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${((points.length - 1) * stepX).toFixed(2)},100 L0,100 Z`;

  const cur = currentIdx >= 0 && currentIdx < points.length ? currentIdx : -1;

  return (
    <div className="relative rounded-md border border-border/50 bg-gradient-to-b from-card/60 to-card/20 overflow-hidden" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
        {/* midline */}
        <line x1="0" y1="50" x2={w} y2="50" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="1,1" />
        {/* area (white advantage) */}
        <path d={areaPath} fill="hsl(var(--primary) / 0.18)" />
        {/* line */}
        <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.8" />
        {/* current marker */}
        {cur >= 0 && (
          <line
            x1={(cur * stepX).toFixed(2)}
            x2={(cur * stepX).toFixed(2)}
            y1="0"
            y2="100"
            stroke="hsl(var(--primary))"
            strokeWidth="0.6"
            strokeDasharray="2,1.5"
          />
        )}
      </svg>
      {/* click overlay */}
      {onSelect && (
        <div className="absolute inset-0 flex">
          {points.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className="flex-1 hover:bg-primary/10 transition"
              title={`Move ${Math.floor(i / 2) + 1}${evals[i]?.color === "w" ? "." : "..."} ${evals[i]?.san}`}
              aria-label={`Go to move ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
