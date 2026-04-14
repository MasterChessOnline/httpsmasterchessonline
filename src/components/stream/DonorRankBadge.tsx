import { getDonorRank, type DonorRank } from "@/lib/donor-ranks";
import { Badge } from "@/components/ui/badge";

interface DonorRankBadgeProps {
  totalCents: number;
  size?: "sm" | "md";
}

export default function DonorRankBadge({ totalCents, size = "sm" }: DonorRankBadgeProps) {
  const rank = getDonorRank(totalCents);
  if (!rank) return null;

  return (
    <Badge
      variant="outline"
      className={`${size === "sm" ? "text-[9px] px-1.5 py-0" : "text-xs px-2 py-0.5"} ${rank.color} ${rank.bgColor} ${rank.borderColor} font-semibold gap-0.5`}
    >
      {rank.icon} {rank.label}
    </Badge>
  );
}
