import { Check } from "lucide-react";
import type { BoardTheme } from "@/lib/board-themes";

interface Props {
  theme: BoardTheme;
  active: boolean;
  onSelect: () => void;
}

/**
 * Visual preview card for a board theme — shows an actual mini board
 * swatch so the user picks by sight, not by text.
 */
export default function BoardThemeCard({ theme, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative rounded-xl border p-3 text-left transition-all ${
        active
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-border/50 bg-card/60 hover:border-primary/30 hover:bg-card/80"
      }`}
    >
      {active && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}

      {/* Mini 4x4 board preview */}
      <div
        className="grid grid-cols-4 rounded-lg overflow-hidden mb-2.5 shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
        style={{
          boxShadow: `0 4px 14px -4px hsl(${theme.dark} / 0.6)`,
        }}
      >
        {Array.from({ length: 16 }).map((_, i) => {
          const isLight = (Math.floor(i / 4) + (i % 4)) % 2 === 0;
          return (
            <div
              key={i}
              className="aspect-square"
              style={{ backgroundColor: `hsl(${isLight ? theme.light : theme.dark})` }}
            />
          );
        })}
      </div>

      <p className={`text-xs font-semibold leading-snug break-words ${active ? "text-primary" : "text-foreground"}`}>
        {theme.label}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug break-words">
        {theme.description}
      </p>
    </button>
  );
}
