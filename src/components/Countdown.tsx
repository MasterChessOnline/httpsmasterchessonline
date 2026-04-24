import { useEffect, useMemo, useState } from "react";

interface CountdownProps {
  /** ISO timestamp of the target moment */
  target: string | Date;
  /** Optional callback fired exactly once when countdown reaches zero */
  onComplete?: () => void;
  /** Visual size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Hide labels (D/H/M/S) */
  compact?: boolean;
  className?: string;
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

export default function Countdown({
  target, onComplete, size = "md", compact = false, className = "",
}: CountdownProps) {
  const targetMs = useMemo(
    () => (typeof target === "string" ? new Date(target).getTime() : target.getTime()),
    [target],
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, targetMs - now);
  const completed = diff === 0;

  useEffect(() => {
    if (completed) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const sizeMap = {
    sm: { num: "text-lg", lbl: "text-[10px]", gap: "gap-1.5" },
    md: { num: "text-2xl md:text-3xl", lbl: "text-xs", gap: "gap-3" },
    lg: { num: "text-4xl md:text-5xl", lbl: "text-sm", gap: "gap-4" },
    xl: { num: "text-5xl md:text-7xl", lbl: "text-base", gap: "gap-6" },
  }[size];

  if (completed) {
    return (
      <div className={`inline-flex items-center gap-2 text-accent font-bold ${className}`}>
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        LIVE
      </div>
    );
  }

  const Cell = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className={`font-mono font-bold tabular-nums ${sizeMap.num} text-foreground`}>
        {pad(value)}
      </div>
      {!compact && (
        <div className={`uppercase tracking-wider text-muted-foreground ${sizeMap.lbl}`}>
          {label}
        </div>
      )}
    </div>
  );

  return (
    <div className={`inline-flex items-baseline ${sizeMap.gap} ${className}`}>
      {days > 0 && <Cell value={days} label="Days" />}
      <Cell value={hours} label="Hours" />
      <Cell value={minutes} label="Min" />
      <Cell value={seconds} label="Sec" />
    </div>
  );
}
