import type { EngineLine } from "@/hooks/use-stockfish";

interface EngineLinesProps {
  lines: EngineLine[];
  currentDepth: number;
  isSearching: boolean;
  turn: "w" | "b";
}

const EngineLines = ({ lines, currentDepth, isSearching, turn }: EngineLinesProps) => {
  const formatScore = (line: EngineLine) => {
    if (line.mate !== null) {
      const m = turn === "b" ? -line.mate : line.mate;
      return { text: `M${Math.abs(m)}`, winning: m > 0 ? "white" : "black" };
    }
    const cp = turn === "b" ? -line.score : line.score;
    const pawns = cp / 100;
    return {
      text: `${pawns >= 0 ? "+" : ""}${pawns.toFixed(1)}`,
      winning: pawns >= 0 ? "white" : "black",
    };
  };

  const formatPv = (pv: string) => {
    // Show first 8 UCI moves
    return pv.split(" ").slice(0, 8).join(" ");
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Engine Lines {isSearching && <span className="animate-pulse">⟳</span>}
        </span>
        <span className="text-xs text-muted-foreground font-mono">depth {currentDepth}</span>
      </div>
      <div className="space-y-1">
        {lines.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Waiting for engine…</p>
        ) : (
          lines.map((line, i) => {
            const { text, winning } = formatScore(line);
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className={`font-mono font-bold w-12 text-center rounded px-1 py-0.5 ${
                    winning === "white"
                      ? "bg-zinc-100 text-zinc-900"
                      : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  {text}
                </span>
                <span className="text-foreground/80 font-mono truncate flex-1">
                  {formatPv(line.pv)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EngineLines;
