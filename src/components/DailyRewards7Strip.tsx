import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Coins, Sparkles, Loader2, Check, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ClaimResult {
  ok: boolean;
  already_claimed?: boolean;
  streak?: number;
  best_streak?: number;
  coins_awarded?: number;
  xp_awarded?: number;
  new_balance?: number;
  error?: string;
}

// Reward curve for the visible 7-day cycle (looped)
const REWARDS_7 = [10, 15, 25, 35, 50, 75, 150];

/**
 * 7-day daily rewards strip — premium mobile-game style.
 * Always-visible row of seven cells with the day-7 chest as the climax.
 * Uses the existing `claim_daily_reward` RPC and `get_my_profile` for state.
 */
export default function DailyRewards7Strip() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [justClaimed, setJustClaimed] = useState<ClaimResult | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: rpcData } = await supabase.rpc("get_my_profile");
      const data: any = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (cancelled) return;
      if (data) {
        setStreak(data.login_streak || 0);
        setBestStreak(data.login_streak_best || 0);
        const today = new Date().toISOString().slice(0, 10);
        setAlreadyClaimed(data.last_login_reward_date === today);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user || loading) return null;

  const handleClaim = async () => {
    if (claiming || alreadyClaimed) return;
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_daily_reward");
    setClaiming(false);
    if (error) { toast.error("Couldn't claim reward"); return; }
    const r = data as unknown as ClaimResult;
    if (!r?.ok) { toast.error("Couldn't claim reward"); return; }
    if (r.already_claimed) { setAlreadyClaimed(true); return; }
    setStreak(r.streak || 0);
    setBestStreak(r.best_streak || 0);
    setAlreadyClaimed(true);
    setJustClaimed(r);
    try {
      const { emitReward } = await import("@/lib/reward-fx");
      emitReward({
        kind: "coin",
        title: `Day ${r.streak} claimed`,
        subtitle: `+${r.xp_awarded} XP · streak alive`,
        amount: r.coins_awarded,
      });
    } catch {}
  };

  // Position within the 7-day cycle (0..6). If already claimed, the
  // "current" cell is the one just claimed; otherwise it's the next one.
  const cycleIndex = (streak % 7 + 7) % 7; // last completed within cycle
  const currentCellIdx = alreadyClaimed ? Math.max(0, cycleIndex - 1) : cycleIndex;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-card/80 to-orange-500/5 p-3 sm:p-4 shadow-[0_10px_40px_-15px_rgba(251,191,36,0.45)]"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center gap-2.5 mb-3">
          <motion.div
            animate={streak > 0 ? { rotate: [-3, 3, -3] } : undefined}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/40 flex items-center justify-center shadow-[0_0_18px_hsl(38_95%_55%/0.4)]"
          >
            <Flame className="h-4.5 w-4.5 text-amber-400 drop-shadow-[0_0_8px_hsl(38_95%_55%/0.7)]" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-foreground text-sm sm:text-base leading-none">
                Daily Rewards
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/80 leading-none">
                {streak}d streak
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              {alreadyClaimed
                ? "Come back tomorrow to keep your streak alive."
                : `Claim today and earn +${REWARDS_7[cycleIndex]} 🪙`}
              {bestStreak > 0 && (
                <span className="ml-2 hidden sm:inline opacity-70">· Best {bestStreak}d</span>
              )}
            </p>
          </div>
          <Button
            onClick={handleClaim}
            disabled={alreadyClaimed || claiming}
            size="sm"
            className="shrink-0 h-9 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-background font-bold shadow-[0_0_18px_hsl(38_95%_55%/0.55)] disabled:opacity-60"
          >
            {claiming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : alreadyClaimed ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Claimed
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-1" /> Claim
              </>
            )}
          </Button>
        </div>

        {/* 7-day strip */}
        <div className="relative grid grid-cols-7 gap-1.5 sm:gap-2">
          {REWARDS_7.map((amt, i) => {
            const isClimax = i === 6;
            const claimed = i < currentCellIdx || (alreadyClaimed && i === currentCellIdx);
            const isToday = !alreadyClaimed && i === currentCellIdx;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                className={[
                  "relative flex flex-col items-center justify-center rounded-xl border px-1 py-2 sm:py-2.5 text-center transition-colors",
                  claimed
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : isToday
                      ? "border-amber-400/70 bg-amber-500/15 text-amber-100 shadow-[0_0_20px_-4px_hsl(38_95%_55%/0.7)]"
                      : "border-border/50 bg-card/40 text-muted-foreground",
                  isClimax && !claimed && !isToday && "border-amber-400/40 bg-gradient-to-b from-amber-500/10 to-transparent",
                ].join(" ")}
              >
                {isToday && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-xl ring-2 ring-amber-300/60"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">
                  D{i + 1}
                </span>
                <span className="mt-1 inline-flex items-center justify-center">
                  {isClimax ? (
                    <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 drop-shadow-[0_0_6px_hsl(38_95%_55%)]" />
                  ) : claimed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Coins className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="mt-0.5 text-[10px] sm:text-[11px] font-extrabold tabular-nums leading-none">
                  {amt}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Claim celebration overlay */}
      <AnimatePresence>
        {justClaimed && !justClaimed.already_claimed && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setJustClaimed(null)}
          >
            <motion.div
              initial={{ scale: 0.55, opacity: 0, rotateY: -35 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="relative max-w-sm w-full rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-card to-orange-500/10 p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.85),0_0_60px_hsl(38_95%_55%/0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-30"
                style={{ background: "conic-gradient(from 0deg, transparent, hsl(38 95% 55% / 0.4), transparent)" }}
              />
              <div className="relative">
                <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_12px_hsl(38_95%_55%)]" />
                <h2 className="font-display font-black text-3xl text-amber-400 mb-1">
                  +{justClaimed.coins_awarded} 🪙
                </h2>
                <p className="text-sm text-muted-foreground mb-4">+{justClaimed.xp_awarded} XP</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 mb-4">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-amber-300">Day {justClaimed.streak} in a row</span>
                </div>
                <Button
                  onClick={() => setJustClaimed(null)}
                  className="w-full bg-gradient-to-br from-amber-500 to-orange-600 text-background font-bold"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
