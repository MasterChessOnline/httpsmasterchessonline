import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar } from "lucide-react";
import { fetchActiveSeason, getSeasonProgress, type SeasonRow } from "@/lib/progression";

export default function SeasonBanner({ compact = false }: { compact?: boolean }) {
  const [season, setSeason] = useState<SeasonRow | null>(null);

  useEffect(() => {
    fetchActiveSeason().then(setSeason);
  }, []);

  if (!season) return null;
  const { daysRemaining, pctElapsed } = getSeasonProgress(season);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs">
        <Trophy className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-foreground">{season.name}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-primary font-medium tabular-nums">{daysRemaining}d left</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 backdrop-blur-md shadow-[0_4px_24px_-8px_hsl(var(--primary)/0.4)]"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">Season {season.season_number} · Active</p>
            <h3 className="font-display text-lg font-bold text-foreground">{season.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/40 px-3 py-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ends in</p>
            <p className="font-display text-lg font-bold text-foreground tabular-nums leading-none">{daysRemaining}d</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-background/40 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/70 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pctElapsed}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
          <span>Season start</span>
          <span>{Math.round(pctElapsed)}% elapsed</span>
          <span>Season end</span>
        </div>
      </div>
    </motion.div>
  );
}
