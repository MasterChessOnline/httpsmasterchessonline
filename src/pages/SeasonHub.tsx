import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Clock, Lock, CheckCircle2, Coins, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Season {
  id: string;
  season_number: number;
  name: string;
  starts_at: string;
  ends_at: string;
}

const TIER_COUNT = 100;
const XP_PER_TIER = 100;

function tierReward(tier: number) {
  // Free track: every tier gets coins. Premium track: bigger coin + exclusive rewards on milestones.
  const coins = 50 + tier * 10;
  const premiumCoins = 100 + tier * 20;
  const isMilestone = tier % 10 === 0;
  const isFinal = tier === TIER_COUNT;
  return { coins, premiumCoins, isMilestone, isFinal };
}

export default function SeasonHub() {
  const { user } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [seasonXp, setSeasonXp] = useState(0);
  const [claimed, setClaimed] = useState<Set<number>>(new Set());
  const [now, setNow] = useState(Date.now());
  const [claimingTier, setClaimingTier] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: s } = await supabase
        .from("seasons" as any)
        .select("id,season_number,name,starts_at,ends_at")
        .eq("status", "active")
        .order("season_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!alive || !s) return;
      setSeason(s as any);
      if (!user) return;
      const { data: claims } = await supabase
        .from("battle_pass_claims" as any)
        .select("tier_index")
        .eq("user_id", user.id)
        .eq("season_id", (s as any).id);
      if (!alive) return;
      setClaimed(new Set((claims ?? []).map((c: any) => c.tier_index)));

      // Derive a Season XP signal from profile: XP earned this season ≈ recent activity.
      // We use total_xp as proxy (UI only) — the claim RPC validates server-side.
      const { data: prof } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("user_id", user.id)
        .maybeSingle();
      if (alive && prof) {
        setSeasonXp(((prof as any).total_xp ?? 0) % (TIER_COUNT * XP_PER_TIER));
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const countdown = useMemo(() => {
    if (!season) return null;
    const diff = Math.max(0, new Date(season.ends_at).getTime() - now);
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [season, now]);

  const currentTier = Math.min(TIER_COUNT, Math.floor(seasonXp / XP_PER_TIER));
  const progressPct = ((seasonXp % XP_PER_TIER) / XP_PER_TIER) * 100;

  const claim = async (tier: number) => {
    if (!user) {
      toast.error("Sign in to claim Season rewards");
      return;
    }
    if (tier > 30) {
      toast.info("Tier reward claim opens at launch");
      return;
    }
    setClaimingTier(tier);
    const { data, error } = await supabase.rpc("claim_battle_pass_tier" as any, {
      _tier: tier,
    });
    setClaimingTier(null);
    if (error || !(data as any)?.ok) {
      const err = (data as any)?.error ?? error?.message ?? "Could not claim";
      toast.error(err.replaceAll("_", " "));
      return;
    }
    const next = new Set(claimed);
    next.add(tier);
    setClaimed(next);
    toast.success(`+${(data as any).reward} coins claimed!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-950/70 via-black to-black p-6 sm:p-10 mb-8 shadow-[0_30px_80px_-20px_rgba(251,191,36,0.5)]"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(70% 60% at 30% 20%, rgba(251,191,36,0.3), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-amber-300 text-xs uppercase tracking-[0.35em] mb-2">
              <Sparkles className="w-4 h-4" /> Season {season?.season_number ?? "—"}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
              {season?.name ?? "Season Hub"}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              100 tiers · free + premium track · exclusive avatars, boards, pieces, titles and coins.
              Earn Season XP every time you play, win, learn or compete.
            </p>

            {countdown && (
              <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-amber-300/30 bg-black/50 px-4 py-3">
                <Clock className="w-4 h-4 text-amber-300" />
                <div className="font-mono text-sm tabular-nums">
                  Season ends in {countdown.d}d {String(countdown.h).padStart(2, "0")}h{" "}
                  {String(countdown.m).padStart(2, "0")}m {String(countdown.s).padStart(2, "0")}s
                </div>
              </div>
            )}

            {/* XP bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Tier {currentTier} / {TIER_COUNT}</span>
                <span className="tabular-nums">
                  {seasonXp % XP_PER_TIER}/{XP_PER_TIER} XP
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link to="/missions" className="rounded-xl border border-border bg-card/60 p-3 hover:border-amber-300/40 transition">
            <div className="text-amber-300 text-xs uppercase tracking-wider">Earn XP</div>
            <div className="font-semibold">Daily Missions</div>
          </Link>
          <Link to="/play-online" className="rounded-xl border border-border bg-card/60 p-3 hover:border-amber-300/40 transition">
            <div className="text-amber-300 text-xs uppercase tracking-wider">Earn XP</div>
            <div className="font-semibold">Play Online</div>
          </Link>
          <Link to="/tournaments" className="rounded-xl border border-border bg-card/60 p-3 hover:border-amber-300/40 transition">
            <div className="text-amber-300 text-xs uppercase tracking-wider">Earn XP</div>
            <div className="font-semibold">Tournaments</div>
          </Link>
          <Link to="/leaderboard" className="rounded-xl border border-border bg-card/60 p-3 hover:border-amber-300/40 transition">
            <div className="text-amber-300 text-xs uppercase tracking-wider">Compete</div>
            <div className="font-semibold">Leaderboard</div>
          </Link>
        </div>

        {/* Reward track */}
        <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-300" /> Reward Track
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: TIER_COUNT }, (_, i) => i + 1).map((tier) => {
            const r = tierReward(tier);
            const isUnlocked = currentTier >= tier;
            const isClaimed = claimed.has(tier);
            return (
              <motion.div
                key={tier}
                whileHover={{ y: -2 }}
                className={`relative rounded-xl border p-3 flex flex-col gap-2 ${
                  r.isFinal
                    ? "border-amber-400/70 bg-gradient-to-br from-amber-900/40 to-black"
                    : r.isMilestone
                    ? "border-amber-300/40 bg-amber-950/30"
                    : "border-border bg-card/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Tier
                  </span>
                  <span className="font-display font-bold text-sm tabular-nums">{tier}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 text-sm font-semibold">
                  <Coins className="w-3.5 h-3.5" />
                  {r.coins}
                </div>
                {r.isMilestone && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-200">
                    {r.isFinal ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                    {r.isFinal ? "Legendary title" : "Exclusive cosmetic"}
                  </div>
                )}
                {isClaimed ? (
                  <div className="flex items-center justify-center gap-1 text-xs text-green-400 mt-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                  </div>
                ) : isUnlocked ? (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs mt-auto"
                    disabled={claimingTier === tier}
                    onClick={() => claim(tier)}
                  >
                    {claimingTier === tier ? "..." : "Claim"}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-auto">
                    <Lock className="w-3 h-3" /> Tier {tier}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Earn Season XP from games, wins, missions, tournaments and daily logins.
          Premium track rewards unlock at launch.
        </p>
      </main>
      <Footer />
    </div>
  );
}
