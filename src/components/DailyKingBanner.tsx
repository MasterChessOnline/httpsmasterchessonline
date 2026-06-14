import { Crown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useDailyKing } from "@/hooks/use-daily-king";

/**
 * Compact homepage banner announcing today's reigning Daily King.
 * Hidden if no king has been crowned yet.
 */
export default function DailyKingBanner() {
  const { king, loading } = useDailyKing();
  if (loading || !king) return null;

  const name = king.display_name || king.username || "Unknown";
  const slug = king.username || king.user_id;

  return (
    <Link
      to={`/u/${slug}`}
      className="group relative mx-auto my-6 flex max-w-2xl items-center gap-4 rounded-2xl border border-[#d4a843]/40 bg-gradient-to-r from-[#1a1408] via-[#2a1f0a] to-[#1a1408] px-5 py-4 shadow-[0_0_30px_rgba(212,168,67,0.15)] transition-all hover:border-[#f3d97a]/70 hover:shadow-[0_0_40px_rgba(243,217,122,0.25)]"
    >
      <div className="relative shrink-0">
        <Crown className="h-10 w-10 text-[#f3d97a] drop-shadow-[0_0_12px_rgba(243,217,122,0.7)]" fill="currentColor" />
        <span className="absolute inset-0 animate-ping rounded-full bg-[#f3d97a]/20" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#d4a843]">Daily King · 24h champion</div>
        <div className="truncate text-lg font-display font-bold text-foreground">
          {name}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <TrendingUp className="h-3 w-3" /> +{king.rating_gain} ELO
          </span>
          <span>· {king.games_played} games</span>
        </div>
      </div>
      <div className="hidden sm:block text-xs text-[#d4a843] opacity-0 transition-opacity group-hover:opacity-100">
        View profile →
      </div>
    </Link>
  );
}
