import type { MatchResultData } from "@/components/MatchResultModal";

/** Fire a global match-result event. Picked up by <MatchResultLayer />. */
export function emitMatchResult(data: MatchResultData & { onRematch?: () => void; onReview?: () => void }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("mc:match-result", { detail: data }));
}
