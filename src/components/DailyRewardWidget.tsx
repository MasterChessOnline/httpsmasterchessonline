import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Coins, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

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

export default function DailyRewardWidget() {
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
      const { data } = await supabase
        .from("profiles")
        .select("login_streak, login_streak_best, last_login_reward_date")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setStreak(data.login_streak || 0);
        setBestStreak(data.login_streak_best || 0);
        const today = new Date().toISOString().slice(0, 10);
        setAlreadyClaimed(data.last_login_reward_date === today);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleClaim = async () => {
    if (!user || claiming) return;
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_daily_reward");
    setClaiming(false);
    if (error) {
      toast.error("Greška pri preuzimanju nagrade");
      return;
    }
    const r = data as unknown as ClaimResult;
    if (!r?.ok) {
      toast.error("Ne mogu da preuzmem nagradu");
      return;
    }
    if (r.already_claimed) {
      setAlreadyClaimed(true);
      toast("Već si preuzeo nagradu danas", { description: "Vrati se sutra!" });
      return;
    }
    setStreak(r.streak || 0);
    setBestStreak(r.best_streak || 0);
    setAlreadyClaimed(true);
    setJustClaimed(r);
    toast.success(`+${r.coins_awarded} 🪙  ·  Dan ${r.streak} u nizu!`, {
      description: `+${r.xp_awarded} XP. Nastavi niz!`,
      duration: 5000,
    });
  };

  if (!user || loading) return null;

  const nextReward = Math.min(10 + streak * 5, 100);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-amber-500/10 via-card to-orange-500/5 p-4 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.4)]"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={
              streak > 0
                ? { scale: [1, 1.08, 1], rotate: [-2, 2, -2] }
                : undefined
            }
            transition={{ duration: 2, repeat: Infinity }}
            className="relative shrink-0"
          >
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_20px_hsl(38_95%_55%/0.4)]">
              <Flame className="h-7 w-7 text-amber-400 drop-shadow-[0_0_8px_hsl(38_95%_55%/0.6)]" />
            </div>
            {streak > 0 && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500 text-background text-xs font-black flex items-center justify-center border-2 border-card">
                {streak}
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-foreground text-base">Daily Reward</h3>
              {bestStreak > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Best · {bestStreak}d
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {alreadyClaimed
                ? `Vrati se sutra za +${Math.min(10 + (streak) * 5, 100)} 🪙`
                : `Preuzmi +${nextReward} 🪙 i nastavi niz`}
            </p>
          </div>

          <Button
            onClick={handleClaim}
            disabled={alreadyClaimed || claiming}
            size="sm"
            className="shrink-0 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-background font-bold shadow-[0_0_18px_hsl(38_95%_55%/0.5)] disabled:opacity-50"
          >
            {claiming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : alreadyClaimed ? (
              "Preuzeto ✓"
            ) : (
              <>
                <Coins className="h-4 w-4 mr-1" />
                Claim
              </>
            )}
          </Button>
        </div>
      </motion.div>

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
              initial={{ scale: 0.5, opacity: 0, rotateY: -45 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="relative max-w-sm w-full rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-card to-orange-500/10 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_60px_hsl(38_95%_55%/0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-30"
                style={{
                  background: "conic-gradient(from 0deg, transparent, hsl(38 95% 55% / 0.4), transparent)",
                }}
              />
              <div className="relative">
                <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_12px_hsl(38_95%_55%)]" />
                <h2 className="font-display font-black text-3xl text-amber-400 mb-1">
                  +{justClaimed.coins_awarded} 🪙
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  +{justClaimed.xp_awarded} XP
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 mb-4">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-amber-300">
                    Dan {justClaimed.streak} u nizu
                  </span>
                </div>
                <Button
                  onClick={() => setJustClaimed(null)}
                  className="w-full bg-gradient-to-br from-amber-500 to-orange-600 text-background font-bold"
                >
                  Nastavi
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
