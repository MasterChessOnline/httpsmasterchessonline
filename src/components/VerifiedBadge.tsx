// Gold verified check mark used next to verified club/partner names.
import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <BadgeCheck
      size={size}
      className={`text-primary ${className}`}
      aria-label="Verified"
    />
  );
}
