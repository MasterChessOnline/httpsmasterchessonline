import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, Check, Coins, Sparkles, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const TIER_COUNT = 30;
const XP_PER_TIER = 100;
const tierReward = (tier: number) => 50 + tier * 10;
const isMilestone = (tier: number) => tier % 5 === 0;

type Progress = {
  season_id: string | null;
  season_name: string | null;
  season_xp: number;
  ends_at: string | null;
};

export default function BattlePass() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>({
    season_id: null,
    season_name: null,
    season_xp: 0,
    ends_at: null,
  });
  const [claimed, setClaimed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  async function load() {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase.rpc as any)("battle_pass_progress", { _user: user.id });
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      setProgress({
        season_id: row.season_id,
        season_name: row.season_name,
        season_xp: row.season_xp ?? 0,
        ends_at: row.ends_at,
      });
      if (row.season_id) {
        const { data: cls } = await supabase
          .from("battle_pass_claims" as any)
          .select("tier_index")
          .eq("season_id", row.season_id);
        setClaimed(new Set(((cls as any[]) ?? []).map((c) => c.tier_index)));
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  const currentTier = useMemo(
    () => Math.min(TIER_COUNT, Math.floor(progress.season_xp / XP_PER_TIER)),
    [progress.season_xp]
  );
  const nextTierXp = (currentTier + 1) * XP_PER_TIER;
  const tierPct = currentTier >= TIER_COUNT
    ? 100
    : ((progress.season_xp - currentTier * XP_PER_TIER) / XP_PER_TIER) * 100;

  const daysLeft = progress.ends_at
    ? Math.max(0, Math.ceil((new Date(progress.ends_at).getTime() - Date.now()) / 86400000))
    : null;

  async function claim(tier: number) {
    if (!user || claiming) return;
    setClaiming(tier);
    const { data, error } = await (supabase.rpc as any)("claim_battle_pass_tier", { _tier: tier });
    setClaiming(null);
    if (error || !data?.ok) {
      toast({
        title: "Couldn't claim",
        description: data?.error === "locked" ? "Keep winning to unlock this tier." : data?.error ?? error?.message ?? "Try again.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `Tier ${tier} claimed!`,
      description: `+${data.reward} coins · Balance ${data.new_balance}`,
    });
    setClaimed((s) => new Set([...s, tier]));
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mc:coins-changed"));
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Season Battle Pass — MasterChess"
        description="Climb 30 tiers, earn coins every win. Season Battle Pass on MasterChess.live."
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/20 via-primary/5 to-background p-6 md:p-8 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)]"
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Season Battle Pass</p>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground truncate">
                {progress.season_name ?? "Active Season"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Earn <span className="text-primary font-semibold">25 XP per win</span>
                {daysLeft !== null && <> · <span className="text-foreground font-semibold">{daysLeft} days left</span></>}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Tier <span className="text-foreground font-bold">{currentTier}</span> / {TIER_COUNT}</span>
              <span className="tabular-nums font-semibold text-foreground">
                {progress.season_xp} {currentTier < TIER_COUNT && <span className="text-muted-foreground">/ {nextTierXp} XP</span>}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tierPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary via-amber-400 to-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
              />
            </div>
          </div>

          {!user && (
            <div className="mt-5 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm flex items-center justify-between gap-3 flex-wrap">
              <span className="text-foreground">Log in to start earning rewards.</span>
              <Button asChild size="sm"><Link to="/login">Log in</Link></Button>
            </div>
          )}
        </motion.div>

        {/* Tier grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Array.from({ length: TIER_COUNT }, (_, i) => i + 1).map((tier) => {
            const unlocked = progress.season_xp >= tier * XP_PER_TIER;
            const isClaimed = claimed.has(tier);
            const milestone = isMilestone(tier);
            const reward = tierReward(tier);

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.4, tier * 0.012) }}
                className={`relative rounded-2xl border p-3 text-center transition-all ${
                  isClaimed
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : unlocked
                    ? "border-primary/50 bg-gradient-to-b from-primary/15 to-primary/5 shadow-[0_4px_18px_-8px_hsl(var(--primary)/0.5)]"
                    : "border-border bg-card/50 opacity-70"
                } ${milestone ? "ring-1 ring-amber-400/40" : ""}`}
              >
                {milestone && (
                  <Sparkles className="absolute top-1.5 right-1.5 h-3 w-3 text-amber-400" />
                )}
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Tier
                </div>
                <div className="font-display text-2xl font-extrabold text-foreground leading-none mb-2">
                  {tier}
                </div>
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-400">
                  <Coins className="h-4 w-4" />
                  {reward}
                </div>
                <div className="mt-2">
                  {isClaimed ? (
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                      <Check className="h-3 w-3" /> Claimed
                    </div>
                  ) : unlocked ? (
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs w-full"
                      disabled={claiming === tier || !user}
                      onClick={() => claim(tier)}
                    >
                      {claiming === tier ? "..." : "Claim"}
                    </Button>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Lock className="h-3 w-3" /> {tier * XP_PER_TIER} XP
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* How to earn */}
        <div className="mt-10 rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> How to earn XP
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• <span className="text-foreground font-semibold">+25 XP</span> for every win in Online play</li>
            <li>• <span className="text-foreground font-semibold">+25 XP</span> for every win against Bots</li>
            <li>• Milestone tiers (every 5th) glow gold and award the biggest coin payouts</li>
            <li>• Pass progress resets when the season ends — claim before the timer hits zero</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/play/online">Play Online</Link></Button>
            <Button asChild size="sm" variant="secondary"><Link to="/play">Beat a Bot</Link></Button>
            <Button asChild size="sm" variant="ghost"><Link to="/tournaments"><Trophy className="h-4 w-4 mr-1" /> Tournaments</Link></Button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-xs text-muted-foreground mt-6">Loading your season progress…</p>
        )}
      </div>
    </div>
  );
}
