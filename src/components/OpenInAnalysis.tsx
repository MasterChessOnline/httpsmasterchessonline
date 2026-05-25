import { Link } from "react-router-dom";
import { ArrowUpRight, Brain } from "lucide-react";

/**
 * Small CTA that deep-links any position into the Analysis board.
 * Use anywhere a lesson, course, blog, or guide shows a FEN: the user can
 * jump straight into Analysis, drag moves around, and play out variations
 * against Stockfish.
 */
export default function OpenInAnalysis({
  fen,
  label = "Open in Analysis",
  className,
}: {
  fen: string;
  label?: string;
  className?: string;
}) {
  const href = `/analysis?fen=${encodeURIComponent(fen)}`;
  return (
    <Link
      to={href}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/15 hover:border-primary/60 px-3 py-1.5 text-xs font-semibold text-primary transition-colors"
      }
    >
      <Brain className="h-3.5 w-3.5" />
      <span>{label}</span>
      <ArrowUpRight className="h-3 w-3 opacity-80" />
    </Link>
  );
}
