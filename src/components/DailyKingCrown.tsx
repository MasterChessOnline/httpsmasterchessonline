import { Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useDailyKing } from "@/hooks/use-daily-king";

interface Props {
  userId: string;
  size?: "sm" | "md";
}

/**
 * Shows a small gold crown next to a user's name IF that user is the current
 * Daily King (most rating gained in the last 24h, recomputed daily).
 */
export default function DailyKingCrown({ userId, size = "sm" }: Props) {
  const { king } = useDailyKing();
  if (!king || king.user_id !== userId) return null;

  const px = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center align-middle ml-1 animate-fade-in"
            aria-label="Daily King"
          >
            <Crown
              className={`${px} text-[#f3d97a] drop-shadow-[0_0_6px_rgba(243,217,122,0.7)]`}
              fill="currentColor"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="font-semibold text-[#f3d97a]">👑 Daily King</div>
          <div className="text-muted-foreground">
            +{king.rating_gain} ELO in {king.games_played} games yesterday
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
