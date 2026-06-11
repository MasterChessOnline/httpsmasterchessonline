import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Lock, Check, Coins, Sparkles, Zap, Crown, Star, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const NORMAL_TIERS = 50;
const BONUS_TIERS = 20; // tiers 51..70
const TOTAL_TIERS = NORMAL_TIERS + BONUS_TIERS;
const XP_PER_TIER = 100;
const PREMIUM_PRICE = 2500;

function freeReward(tier: number) {
  const base = 50 + tier * 10;
  return tier > 50 ? base + 50 : base;
}
function premiumReward(tier: number) {
  const base = (50 + tier * 10) * 2;
  return tier > 50 ? base + 50 : base;
}
const isMilestone = (tier: number) => tier % 5 === 0;

type Progress = {
  season_id: string | null;
  season_name: string | null;
  season_xp: number;
  ends_at: string | null;
};
type Claim = { tier_index: number; track: "free" | "premium" };

export default function BattlePass() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>({
    season_id: null,
    season_name: null,
    season_xp: 0,
    ends_at: null,
  });
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [hasPremium, setHasPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [buyingPremium, setBuyingPremium] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; key: number } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (!user) { setLoading(false); return; }
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
        const [{ data: cls }, { data: prem }] = await Promise.all([
          supabase.from("battle_pass_claims" as any).select("tier_index, track").eq("season_id", row.season_id),
          supabase.from("battle_pass_premium" as any).select("id").eq("season_id", row.season_id).maybeSingle(),
        ]);
        setClaimed(new Set(((cls as any[]) ?? []).map((c) => `${c.track}:${c.tier_index}`)));
        setHasPremium(!!prem);
      }
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [user?.id]);

  const currentTier = useMemo(
    () => Math.min(TOTAL_TIERS, Math.floor(progress.season_xp / XP_PER_TIER)),
    [progress.season_xp]
  );
  const nextTierXp = (currentTier + 1) * XP_PER_TIER;
  const tierPct = currentTier >= TOTAL_TIERS
    ? 100
    : ((progress.season_xp - currentTier * XP_PER_TIER) / XP_PER_TIER) * 100;

  const daysLeft = progress.ends_at
    ? Math.max(0, Math.ceil((new Date(progress.ends_at).getTime() - Date.now()) / 86400000))
    : null;

  // Auto-scroll rail to current tier on first load
  useEffect(() => {
    if (!loading && railRef.current && currentTier > 2) {
      const tierEl = railRef.current.querySelector<HTMLElement>(`[data-tier="${currentTier}"]`);
      tierEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [loading, currentTier]);

  async function claim(tier: number, track: "free" | "premium", ev?: React.MouseEvent) {
    if (!user || claiming) return;
    const key = `${track}:${tier}`;
    setClaiming(key);
    const { data, error } = await (supabase.rpc as any)("claim_battle_pass_tier", { _tier: tier, _track: track });
    setClaiming(null);
    if (error || !data?.ok) {
      const msg = data?.error === "locked"
        ? "Keep winning to unlock this tier."
        : data?.error === "no_premium_pass"
        ? "Unlock the Premium Pass to claim this reward."
        : data?.error ?? error?.message ?? "Try again.";
      toast({ title: "Couldn't claim", description: msg, variant: "destructive" });
      return;
    }
    toast({
      title: `Tier ${tier} ${track === "premium" ? "Premium" : "Free"} claimed!`,
      description: `+${data.reward} coins · Balance ${data.new_balance}`,
    });
    setClaimed((s) => new Set([...s, key]));
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mc:coins-changed"));
    // confetti burst at click coords
    if (ev) setConfetti({ x: ev.clientX, y: ev.clientY, key: Date.now() });
  }

  async function buyPremium() {
    if (!user || buyingPremium) return;
    setBuyingPremium(true);
    const { data, error } = await (supabase.rpc as any)("buy_premium_pass");
    setBuyingPremium(false);
    if (error || !data?.ok) {
      const msg = data?.error === "insufficient_coins"
        ? `You need ${PREMIUM_PRICE} coins (you have ${data?.balance ?? 0}).`
        : data?.error === "already_owned"
        ? "You already own the Premium Pass."
        : data?.error ?? error?.message ?? "Try again.";
      toast({ title: "Couldn't unlock", description: msg, variant: "destructive" });
      return;
    }
    toast({ title: "Premium Pass unlocked!", description: `Balance ${data.new_balance}` });
    setHasPremium(true);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mc:coins-changed"));
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Season Battle Pass — MasterChess"
        description="Climb 50 tiers, unlock the Premium Pass for double rewards, and earn exclusive coins every win. Battle Pass on MasterChess.live."
        path="/battle-pass"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/25 via-primary/5 to-background p-6 md:p-8 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)]"
        >
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
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
                <span className="text-primary font-semibold">25 XP per win</span>
                {daysLeft !== null && <> · <span className="text-foreground font-semibold">{daysLeft} days left</span></>}
                {hasPremium && <> · <span className="text-amber-400 font-semibold inline-flex items-center gap-1"><Gem className="h-3 w-3" /> Premium owner</span></>}
              </p>
            </div>
            {!hasPremium && user && (
              <Button
                onClick={buyPremium}
                disabled={buyingPremium}
                className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-amber-300 text-black font-bold hover:opacity-90"
              >
                <Gem className="h-4 w-4 mr-1" />
                {buyingPremium ? "..." : `Unlock Premium · ${PREMIUM_PRICE}`}
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Tier <span className="text-foreground font-bold">{currentTier}</span> / {TOTAL_TIERS}</span>
              <span className="tabular-nums font-semibold text-foreground">
                {progress.season_xp} {currentTier < TOTAL_TIERS && <span className="text-muted-foreground">/ {nextTierXp} XP</span>}
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

          {!hasPremium && user && (
            <div className="mt-5 sm:hidden">
              <Button
                onClick={buyPremium}
                disabled={buyingPremium}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-300 text-black font-bold"
              >
                <Gem className="h-4 w-4 mr-1" />
                {buyingPremium ? "..." : `Unlock Premium · ${PREMIUM_PRICE} coins`}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Horizontal rail — Brawl Stars style */}
        <div className="mt-8 relative">
          <div
            ref={railRef}
            className="overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth [scrollbar-width:thin]"
          >
            <div className="inline-flex flex-col gap-3 min-w-full">
              {/* PREMIUM ROW */}
              <Row label="Premium" icon={<Gem className="h-3.5 w-3.5" />} accent="amber" locked={!hasPremium}>
                {Array.from({ length: TOTAL_TIERS }, (_, i) => i + 1).map((tier) => {
                  const unlocked = progress.season_xp >= tier * XP_PER_TIER;
                  const key = `premium:${tier}`;
                  const done = claimed.has(key);
                  return (
                    <TierCell
                      key={`p${tier}`}
                      tier={tier}
                      reward={premiumReward(tier)}
                      track="premium"
                      unlocked={unlocked && hasPremium}
                      claimed={done}
                      milestone={isMilestone(tier)}
                      bonus={tier > 50}
                      disabled={!user || claiming === key}
                      loading={claiming === key}
                      onClaim={(ev) => claim(tier, "premium", ev)}
                    />
                  );
                })}
              </Row>

              {/* TIER NUMBER STRIP */}
              <div className="flex gap-2 items-center justify-start pl-1">
                {Array.from({ length: TOTAL_TIERS }, (_, i) => i + 1).map((tier) => (
                  <div
                    key={`n${tier}`}
                    data-tier={tier}
                    className={`shrink-0 w-[78px] text-center text-xs font-bold tabular-nums ${
                      tier === currentTier
                        ? "text-primary"
                        : tier <= currentTier
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {tier}
                  </div>
                ))}
              </div>

              {/* FREE ROW */}
              <Row label="Free" icon={<Star className="h-3.5 w-3.5" />} accent="slate">
                {Array.from({ length: TOTAL_TIERS }, (_, i) => i + 1).map((tier) => {
                  const unlocked = progress.season_xp >= tier * XP_PER_TIER;
                  const key = `free:${tier}`;
                  const done = claimed.has(key);
                  return (
                    <TierCell
                      key={`f${tier}`}
                      tier={tier}
                      reward={freeReward(tier)}
                      track="free"
                      unlocked={unlocked}
                      claimed={done}
                      milestone={isMilestone(tier)}
                      bonus={tier > 50}
                      disabled={!user || claiming === key}
                      loading={claiming === key}
                      onClaim={(ev) => claim(tier, "free", ev)}
                    />
                  );
                })}
              </Row>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Scroll the rail horizontally · Tier {currentTier} is centered
          </p>
        </div>

        {/* How to earn */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> How to earn XP
            </h2>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• <span className="text-foreground font-semibold">+25 XP</span> per win Online or vs Bots</li>
              <li>• Milestone tiers (every 5th) glow gold and pay extra</li>
              <li>• Bonus tiers <span className="text-foreground font-semibold">51 – {TOTAL_TIERS}</span> unlock after the main pass</li>
              <li>• Pass resets at season end — claim before the timer hits zero</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm"><Link to="/play/online">Play Online</Link></Button>
              <Button asChild size="sm" variant="secondary"><Link to="/play">Beat a Bot</Link></Button>
              <Button asChild size="sm" variant="ghost"><Link to="/tournaments"><Trophy className="h-4 w-4 mr-1" /> Tournaments</Link></Button>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-background p-5">
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <Gem className="h-5 w-5 text-amber-400" /> Premium Pass
            </h2>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• <span className="text-foreground font-semibold">2× coins</span> on every tier you claim</li>
              <li>• Access to exclusive bonus tiers reward stream</li>
              <li>• Premium badge on your profile this season</li>
              <li>• One-time unlock for <span className="text-amber-400 font-semibold">{PREMIUM_PRICE} coins</span></li>
            </ul>
            {hasPremium ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 text-emerald-400 px-3 py-1.5 text-xs font-bold">
                <Check className="h-4 w-4" /> You own this season's Premium Pass
              </div>
            ) : user ? (
              <Button
                onClick={buyPremium}
                disabled={buyingPremium}
                className="mt-4 bg-gradient-to-r from-amber-500 to-amber-300 text-black font-bold"
              >
                <Gem className="h-4 w-4 mr-1" />
                {buyingPremium ? "Unlocking..." : `Unlock Premium · ${PREMIUM_PRICE}`}
              </Button>
            ) : (
              <Button asChild className="mt-4"><Link to="/login">Log in to unlock</Link></Button>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-center text-xs text-muted-foreground mt-6">Loading your season progress…</p>
        )}
      </div>

      {/* Confetti burst */}
      <AnimatePresence>
        {confetti && (
          <ConfettiBurst
            key={confetti.key}
            x={confetti.x}
            y={confetti.y}
            onDone={() => setConfetti(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  label, icon, accent, locked, children,
}: { label: string; icon: React.ReactNode; accent: "amber" | "slate"; locked?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-stretch gap-2">
      <div className={`sticky left-0 z-10 shrink-0 w-20 rounded-xl border flex flex-col items-center justify-center text-[10px] font-bold uppercase tracking-widest ${
        accent === "amber"
          ? "border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-amber-300"
          : "border-border bg-card/70 text-muted-foreground"
      }`}>
        <div className="flex items-center gap-1">{icon}{label}</div>
        {locked && <div className="text-[9px] text-amber-400/80 mt-0.5">Locked</div>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function TierCell({
  tier, reward, track, unlocked, claimed, milestone, bonus, disabled, loading, onClaim,
}: {
  tier: number; reward: number; track: "free" | "premium";
  unlocked: boolean; claimed: boolean; milestone: boolean; bonus: boolean;
  disabled: boolean; loading: boolean; onClaim: (ev: React.MouseEvent) => void;
}) {
  const premium = track === "premium";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(0.3, tier * 0.005) }}
      className={`relative shrink-0 w-[78px] h-[96px] rounded-xl border p-2 flex flex-col items-center justify-between transition-all ${
        claimed
          ? "border-emerald-500/40 bg-emerald-500/5"
          : unlocked
          ? premium
            ? "border-amber-400/60 bg-gradient-to-b from-amber-500/25 to-amber-500/5 shadow-[0_4px_18px_-6px_rgba(251,191,36,0.55)]"
            : "border-primary/50 bg-gradient-to-b from-primary/15 to-primary/5"
          : "border-border bg-card/40 opacity-70"
      } ${milestone ? "ring-1 ring-amber-400/40" : ""} ${bonus ? "ring-1 ring-fuchsia-400/40" : ""}`}
    >
      {milestone && <Sparkles className="absolute top-1 right-1 h-3 w-3 text-amber-400" />}
      {bonus && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded-full bg-fuchsia-500 text-white">
          BONUS
        </div>
      )}
      <div className="flex items-center gap-1 text-sm font-extrabold text-amber-300">
        <Coins className="h-3.5 w-3.5" /> {reward}
      </div>
      {claimed ? (
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[9px] font-semibold">
          <Check className="h-3 w-3" /> Got it
        </div>
      ) : unlocked ? (
        <button
          onClick={onClaim}
          disabled={disabled}
          className={`w-full h-6 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
            premium
              ? "bg-gradient-to-r from-amber-500 to-amber-300 text-black hover:opacity-90"
              : "bg-primary text-primary-foreground hover:opacity-90"
          } disabled:opacity-50`}
        >
          {loading ? "…" : "Claim"}
        </button>
      ) : (
        <div className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
          <Lock className="h-2.5 w-2.5" /> {tier * XP_PER_TIER}
        </div>
      )}
    </motion.div>
  );
}

function ConfettiBurst({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ["#fbbf24", "#f59e0b", "#fde68a", "#10b981", "#ec4899", "#60a5fa"];
  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const dist = 80 + Math.random() * 120;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 40;
        const color = colors[i % colors.length];
        return (
          <motion.span
            key={i}
            initial={{ x, y, scale: 0, opacity: 1 }}
            animate={{ x: x + dx, y: y + dy, scale: 1, opacity: 0, rotate: Math.random() * 720 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="absolute -top-1 -left-1 w-2 h-2 rounded-sm"
            style={{ background: color }}
          />
        );
      })}
    </div>
  );
}
