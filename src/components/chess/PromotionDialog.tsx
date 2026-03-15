import { Square } from "chess.js";
import { cn } from "@/lib/utils";

type PromotionPiece = "q" | "r" | "b" | "n";

interface PromotionOption {
  piece: PromotionPiece;
  label: string;
  symbol: string;
}

const PROMOTION_OPTIONS: PromotionOption[] = [
  { piece: "q", label: "Dama (Queen)", symbol: "♛" },
  { piece: "r", label: "Top (Rook)", symbol: "♜" },
  { piece: "b", label: "Lovac (Bishop)", symbol: "♝" },
  { piece: "n", label: "Konj (Knight)", symbol: "♞" },
];

interface PromotionDialogProps {
  isOpen: boolean;
  color: "w" | "b";
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

export type { PromotionPiece };

export default function PromotionDialog({ isOpen, color, onSelect, onCancel }: PromotionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200" />

      {/* Dialog */}
      <div
        className="relative z-10 bg-card border border-border rounded-xl p-5 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-center text-sm font-semibold text-foreground mb-1 font-display">
          Pawn Promotion
        </h3>
        <p className="text-center text-xs text-muted-foreground mb-4">
          Choose a piece to promote to
        </p>

        <div className="flex gap-3">
          {PROMOTION_OPTIONS.map((opt) => (
            <button
              key={opt.piece}
              onClick={() => onSelect(opt.piece)}
              className={cn(
                "group flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-150",
                "hover:scale-110 hover:shadow-lg active:scale-95",
                "border-border/50 bg-background hover:border-primary/60 hover:bg-primary/10",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
              )}
              aria-label={`Promote to ${opt.label}`}
            >
              <span
                className={cn(
                  "text-4xl leading-none transition-transform duration-150 group-hover:scale-110",
                  color === "w"
                    ? "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    : "text-[hsl(220,20%,12%)] drop-shadow-[0_0_3px_rgba(255,255,255,0.35)]"
                )}
              >
                {opt.symbol}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
