interface EvalBarProps {
  evalCp: number;          // From White's POV
  mate: number | null;     // From White's POV
  flipped?: boolean;
  loading?: boolean;
}

/** Vertical evaluation bar (Lichess style). Renders a thin column showing
 * the relative balance between White and Black. */
export default function EvalBar({ evalCp, mate, flipped = false, loading }: EvalBarProps) {
  // Convert eval (in centipawns) to a 0..1 ratio with a soft sigmoid
  let whiteRatio: number;
  if (mate !== null) {
    whiteRatio = mate > 0 ? 1 : mate < 0 ? 0 : 0.5;
  } else {
    // tanh-like clamp; ±5 pawns ≈ near edges
    const x = evalCp / 100; // pawns
    const clamped = Math.max(-10, Math.min(10, x));
    whiteRatio = 0.5 + 0.5 * Math.tanh(clamped / 4);
  }
  whiteRatio = Math.max(0.02, Math.min(0.98, whiteRatio));
  const whitePct = whiteRatio * 100;

  const label = mate !== null
    ? `M${Math.abs(mate)}${mate < 0 ? " (–)" : ""}`
    : (() => {
        const v = (evalCp / 100).toFixed(1);
        return evalCp >= 0 ? `+${v}` : v;
      })();

  // When flipped, swap visual top/bottom so White's bar grows from the bottom of the player's perspective
  const whiteOnTop = flipped;

  return (
    <div className="flex flex-col items-center w-5 sm:w-6 flex-shrink-0">
      <div className="relative flex-1 w-full rounded-md overflow-hidden border border-border/40 bg-[hsl(220,15%,8%)] shadow-inner">
        {/* White segment */}
        <div
          className="absolute left-0 right-0 bg-white transition-all duration-300 ease-out"
          style={{
            ...(whiteOnTop
              ? { top: 0, height: `${whitePct}%` }
              : { bottom: 0, height: `${whitePct}%` }),
          }}
        />
        {/* Center divider line at 50% */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/40" />
        {/* Eval label */}
        <div
          className={`absolute left-0 right-0 text-[8px] sm:text-[9px] font-mono font-bold text-center px-0.5 ${
            whiteRatio > 0.5 ? "text-[hsl(220,15%,8%)] bottom-0.5" : "text-white top-0.5"
          }`}
          style={{ writingMode: "horizontal-tb" }}
        >
          {loading && !label ? "…" : label}
        </div>
      </div>
    </div>
  );
}
