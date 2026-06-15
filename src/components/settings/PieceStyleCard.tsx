import { Check } from "lucide-react";
import type { PieceStyle } from "@/lib/board-themes";
import PieceSetPreview from "@/components/previews/PieceSetPreview";

interface Props {
  style: PieceStyle;
  active: boolean;
  onSelect: () => void;
}

/**
 * Visual preview card for a piece style — preview is forced into a square
 * frame so every card matches the board cards beside it.
 */
export default function PieceStyleCard({ style, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative rounded-xl border p-2.5 text-left transition-all h-full flex flex-col ${
        active
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-border/50 bg-card/60 hover:border-primary/30 hover:bg-card/80"
      }`}
    >
      {active && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md z-10">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}

      <div className="w-full aspect-square mb-2 flex items-center justify-center rounded-lg bg-gradient-to-b from-background/40 to-background/10 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
        <div className="w-full px-1">
          <PieceSetPreview style={style} />
        </div>
      </div>

      <div className="mt-auto">
        <p className={`text-xs font-semibold leading-tight line-clamp-1 ${active ? "text-primary" : "text-foreground"}`}>
          {style.label}
        </p>
      </div>
    </button>
  );
}
