import { getRank, getRankProgress, getNextRank } from "@/lib/ranks";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RankBadgeProps {
  rating: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RankBadge({ rating, showProgress = false, size = "md" }: RankBadgeProps) {
  const rank = getRank(rating);
  const progress = getRankProgress(rating);
  const next = getNextRank(rating);

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <Badge
        variant="outline"
        className={`${sizeClasses[size]} ${rank.color} ${rank.bgColor} ${rank.borderColor} font-semibold gap-1`}
      >
        {rank.icon} {rank.label}
      </Badge>
      {showProgress && next && (
        <div className="w-full max-w-[120px]">
          <Progress value={progress} className="h-1" />
          <p className="text-[9px] text-muted-foreground text-center mt-0.5">
            {next.minRating - rating} to {next.label}
          </p>
        </div>
      )}
    </div>
  );
}
