import { Opening } from "@/lib/openings-data";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Lock, Crown } from "lucide-react";

interface OpeningCardProps {
  opening: Opening;
  progress?: number; // 0-100
  isFavorite?: boolean;
  onSelect: () => void;
  onToggleFavorite?: () => void;
  index: number;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-primary/20 text-primary border-primary/30",
  advanced: "bg-destructive/20 text-red-400 border-destructive/30",
};

export default function OpeningCard({
  opening,
  progress = 0,
  isFavorite,
  onSelect,
  onToggleFavorite,
  index,
}: OpeningCardProps) {
  const isMasterclass = opening.name.toLowerCase().includes("masterclass") || opening.name.toLowerCase().includes("masterkurs") || opening.id.includes("masterclass");

  // Side: which color this repertoire is built for (only relevant for masterclass repertoires)
  const masterclassSide: "white" | "black" | null = isMasterclass
    ? opening.id.includes("kalashnikov")
      ? "black"
      : "white"
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onSelect}
      className={`group relative rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
        isMasterclass
          ? "pt-8 px-4 pb-4 bg-gradient-to-br from-primary/15 via-card to-card border-2 border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.22)] hover:border-primary hover:shadow-[0_0_55px_hsl(var(--primary)/0.4)]"
          : "p-4 bg-card border border-border/50 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
      }`}
    >
      {/* Animated shimmer for masterclass cards */}
      {isMasterclass && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-x-12 top-0 h-full opacity-0 group-hover:opacity-100"
          initial={false}
          animate={{ x: ["-30%", "130%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, hsl(var(--primary) / 0.18) 50%, transparent 70%)",
          }}
        />
      )}

      {isMasterclass && (
        <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1.5">
          <Badge className="bg-primary text-primary-foreground border border-primary/60 text-[9px] uppercase tracking-wider font-bold shadow-lg">
            <Crown className="w-2.5 h-2.5 mr-1 fill-current" /> Masterclass
          </Badge>
          {masterclassSide && (
            <Badge
              variant="outline"
              className={`text-[9px] uppercase tracking-wider font-bold shadow-md ${
                masterclassSide === "white"
                  ? "bg-background text-foreground border-foreground/40"
                  : "bg-foreground text-background border-foreground"
              }`}
            >
              For {masterclassSide === "white" ? "White" : "Black"}
            </Badge>
          )}
        </div>
      )}

      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors z-10"
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
      )}

      {/* Icon & Title */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{opening.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold transition-colors truncate ${isMasterclass ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
            {opening.name}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{opening.eco}</span>
        </div>
      </div>

      {/* Description — fully visible, wraps as needed */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 break-words">
        {opening.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className={`text-[10px] ${difficultyColors[opening.difficulty]}`}>
          {opening.difficulty}
        </Badge>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {opening.totalVariations} lines
        </span>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Starting moves */}
      <div className="mt-3 pt-2 border-t border-border/30">
        <span className="text-[10px] font-mono text-muted-foreground">
          {opening.startingMoves}
        </span>
      </div>
    </motion.div>
  );
}
