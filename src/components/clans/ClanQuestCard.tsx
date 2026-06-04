import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Coins, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Quest {
  id: string;
  club_id: string;
  quest_date: string;
  quest_key: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  coin_reward_per_member: number;
  completed_at: string | null;
  rewarded_at: string | null;
}

/**
 * Today's shared clan quest. Progress ticks up automatically as members
 * win games (server-side via contribute_clan_quest). We refresh on focus
 * and on the mc:clan-quest-complete window event.
 */
export default function ClanQuestCard({ clubId, color = "#d4a843" }: { clubId: string; color?: string }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await (supabase.rpc as any)("get_or_create_clan_quest", { p_club_id: clubId });
    setQuest((data as Quest) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const onComplete = (e: Event) => {
      const ids = (e as CustomEvent).detail?.clubIds as string[] | undefined;
      if (!ids || ids.includes(clubId)) load();
    };
    const onFocus = () => load();
    window.addEventListener("mc:clan-quest-complete", onComplete);
    window.addEventListener("focus", onFocus);

    // Realtime: refresh whenever today's quest row changes
    const ch = supabase
      .channel(`clan-quest-${clubId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clan_quests", filter: `club_id=eq.${clubId}` },
        () => load()
      )
      .subscribe();

    return () => {
      window.removeEventListener("mc:clan-quest-complete", onComplete);
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card/60 p-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading clan quest…
      </div>
    );
  }
  if (!quest) return null;

  const pct = Math.min(100, Math.round((quest.current_value / Math.max(1, quest.target_value)) * 100));
  const done = !!quest.completed_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden border bg-card/80 p-4"
      style={{ borderColor: `${color}55`, boxShadow: `0 0 28px -10px ${color}66` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${color}1f`, border: `1px solid ${color}55` }}
          >
            {done ? (
              <CheckCircle2 className="h-4 w-4" style={{ color }} />
            ) : (
              <Target className="h-4 w-4" style={{ color }} />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Daily Clan Quest</div>
            <h3 className="text-sm font-bold text-foreground truncate">{quest.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{quest.description}</p>
          </div>
        </div>
        <div
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 shrink-0"
          style={{ color, background: `${color}1a`, border: `1px solid ${color}40` }}
        >
          <Coins className="h-3 w-3" /> +{quest.coin_reward_per_member} each
        </div>
      </div>

      {/* progress bar */}
      <div className="h-2.5 rounded-full overflow-hidden bg-muted/40">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: done
              ? `linear-gradient(90deg, ${color}, #fff3b0)`
              : `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 12px ${color}aa`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono">
          {quest.current_value} / {quest.target_value}
        </span>
        <span className="font-semibold" style={{ color }}>
          {done ? "Complete — rewards paid!" : `${pct}%`}
        </span>
      </div>
    </motion.div>
  );
}
