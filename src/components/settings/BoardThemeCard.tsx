import { Check } from "lucide-react";
import type { BoardTheme } from "@/lib/board-themes";
import BoardSwatch from "@/components/previews/BoardSwatch";

interface Props {
  theme: BoardTheme;
  active: boolean;
  onSelect: () => void;
}

/**
 * Visual preview card for a board theme — uniform height, real mini board.
 */
export default function BoardThemeCard({ theme, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative rounded-xl border p-3 text-left transition-all h-full flex flex-col ${
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

      <div className="mb-2.5 transition-transform duration-300 group-hover:scale-[1.03]">
        <BoardSwatch light={theme.light} dark={theme.dark} size={4} themeKey={theme.key} />
      </div>

      <div className="mt-auto">
        <p className={`text-xs font-semibold leading-snug line-clamp-1 ${active ? "text-primary" : "text-foreground"}`}>
          {theme.label}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2 min-h-[2.2em]">
          {theme.description}
        </p>
      </div>
    </button>
  );
}
