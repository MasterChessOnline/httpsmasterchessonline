import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
  title?: string;
}

/** Gold verified checkmark for partner clubs, coaches, schools, organizers. */
export default function VerifiedBadge({
  className,
  size = 16,
  title = "Verifikovani MasterChess partner",
}: VerifiedBadgeProps) {
  return (
    <span
      title={title}
      aria-label={title}
      className={cn("inline-flex items-center text-amber-400", className)}
    >
      <BadgeCheck size={size} strokeWidth={2.5} className="drop-shadow-[0_0_6px_rgba(212,168,67,0.6)]" />
    </span>
  );
}
