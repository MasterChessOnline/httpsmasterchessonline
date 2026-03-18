import { Opening } from "@/lib/openings-data";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Lock } from "lucide-react";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onSelect}
      className="group relative bg-card border border-border/50 rounded-xl p-4 cursor-pointer
        hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]
        transition-all duration-300 hover:-translate-y-1"
    >
      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
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
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {opening.name}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{opening.eco}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
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
