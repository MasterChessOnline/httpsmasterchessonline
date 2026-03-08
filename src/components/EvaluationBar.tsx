interface EvaluationBarProps {
  score: number; // centipawns from white's perspective
  mate: number | null;
  orientation: "white" | "black";
}

const EvaluationBar = ({ score, mate, orientation }: EvaluationBarProps) => {
  // Convert score to a percentage for the bar (0-100, where 100 = white winning completely)
  let whitePct: number;
  if (mate !== null) {
    whitePct = mate > 0 ? 100 : 0;
  } else {
    // Sigmoid-like mapping: ±500cp maps to roughly 10-90%
    whitePct = 50 + 50 * (2 / (1 + Math.exp(-score / 250)) - 1);
    whitePct = Math.max(2, Math.min(98, whitePct));
  }

  const displayPct = orientation === "white" ? whitePct : 100 - whitePct;

  const formatScore = () => {
    if (mate !== null) return `M${Math.abs(mate)}`;
    const pawns = Math.abs(score / 100);
    return pawns.toFixed(1);
  };

  const isWhiteWinning = mate !== null ? mate > 0 : score > 0;

  return (
    <div className="flex flex-col items-center h-full w-8 select-none">
      <div className="relative w-6 rounded-sm overflow-hidden flex-1 border border-border/50">
        {/* Dark (black) section */}
        <div
          className="absolute top-0 left-0 right-0 bg-zinc-800 transition-all duration-300"
          style={{ height: `${100 - displayPct}%` }}
        />
        {/* Light (white) section */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-zinc-100 transition-all duration-300"
          style={{ height: `${displayPct}%` }}
        />
        {/* Score label */}
        <div
          className={`absolute left-0 right-0 flex items-center justify-center text-[9px] font-bold ${
            isWhiteWinning ? "bottom-0 text-zinc-800 pb-0.5" : "top-0 text-zinc-100 pt-0.5"
          }`}
        >
          {formatScore()}
        </div>
      </div>
    </div>
  );
};

export default EvaluationBar;
