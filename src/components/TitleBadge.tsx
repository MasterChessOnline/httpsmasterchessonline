import { getTitle, getTitleByKey, type ChessTitle, type RatingMode, BOT_TITLE_OVERRIDES } from "@/lib/titles";
import { motion } from "framer-motion";

interface TitleBadgeProps {
  /** Use rating to derive title, OR pass titleKey directly (highest-ever). */
  rating?: number;
  titleKey?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  /** When true, hides the badge for unranked players. */
  hideUnranked?: boolean;
  /** Which name set to use (online = FIDE, bot = AI Arena). Defaults to online. */
  mode?: RatingMode;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<TitleBadgeProps["size"]>, string> = {
  xs: "text-[9px] px-1.5 py-0.5 gap-0.5",
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-1.5",
};

export default function TitleBadge({
  rating,
  titleKey,
  size = "sm",
  hideUnranked = true,
  mode = "online",
  className = "",
}: TitleBadgeProps) {
  let title: ChessTitle | null = null;
  if (titleKey) title = getTitleByKey(titleKey);
  if (!title && typeof rating === "number") title = getTitle(rating, mode);
  if (!title) return null;
  if (hideUnranked && title.key === "unranked") return null;

  // Apply bot-mode label override if requested.
  const label = mode === "bot" ? (BOT_TITLE_OVERRIDES[title.key]?.label ?? title.label) : title.label;

  const baseClasses = `inline-flex items-center rounded-md border font-bold uppercase tracking-wide ${SIZE_CLASSES[size]} ${title.color} ${title.bgColor} ${title.borderColor} ${className}`;

  if (title.prestigious) {
    return (
      <motion.span
        className={baseClasses}
        style={{ textShadow: `0 0 8px currentColor` }}
        animate={{
          boxShadow: [
            "0 0 0px hsl(var(--primary) / 0)",
            "0 0 12px hsl(var(--primary) / 0.4)",
            "0 0 0px hsl(var(--primary) / 0)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span aria-hidden>{title.icon}</span>
        <span>{label}</span>
      </motion.span>
    );
  }

  return (
    <span className={baseClasses}>
      <span aria-hidden>{title.icon}</span>
      <span>{label}</span>
    </span>
  );
}
