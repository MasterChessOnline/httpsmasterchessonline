import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Gift, Sparkles, Check, Lock, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { emitReward } from "@/lib/reward-fx";

interface DaySpec {
  day: number;
  label: string;
  sub: string;
  big?: boolean;
}

const DAYS: DaySpec[] = [
  { day: 1, label: "+100", sub: "Coins" },
  { day: 2, label: "+150", sub: "Coins" },
  { day: 3, label: "+200", sub: "Coins" },
  { day: 4, label: "+250", sub: "Coins" },
  { day: 5, label: "+300", sub: "Coins" },
  { day: 6, label: "Free", sub: "Spin", big: true },
  { day: 7, label: "Chest", sub: "Mystery", big: true },
];

interface ClaimResult {
  ok: boolean;
  day?: number;
  coins?: number;
  reward_type?: "coins" | "free_spin" | "chest";
  new_balance?: number;
  error?: string;
}

export default function WelcomeCalendarCard({ forceModal = false }: { forceModal?: boolean }) {
  const { user } = useAuth();
  const [day, setDay] = useState<number>(0);
  const [lastClaim, setLastClaim] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [popup, setPopup] = useState<ClaimResult | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let off = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("welcome_day, welcome_last_claim")
        .eq("user_id", user.id)
        .maybeSingle();
      if (off) return;
      const w = (data as any) ?? {};
      setDay(w.welcome_day || 0);
      setLastClaim(w.welcome_last_claim ?? null);
      setLoading(false);
      // Auto-open welcome modal once for brand new users (day 0, never claimed)
      if (forceModal || ((w.welcome_day || 0) === 0 && !w.welcome_last_claim)) {
        const shown = localStorage.getItem("mc:welcome-modal-shown");
        if (!shown) {
          setOpenModal(true);
          localStorage.setItem("mc:welcome-modal-shown", "1");
        }
      }
    })();
    return () => { off = true; };
  }, [user?.id, forceModal]);

  const today = new Date().toISOString().slice(0, 10);
  const claimedToday = lastClaim === today;
  const completed = day >= 7;
  const nextDay = Math.min(day + 1, 7);
  // Reset detection (UI only): if last claim more than 1 day ago, we know server will reset to 1
  const willReset = !!lastClaim && lastClaim < new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const displayNextDay = willReset ? 1 : nextDay;

  const handleClaim = async () => {
    if (!user || claiming || claimedToday || completed) return;
    setClaiming(true);
    const { data, error } = await (supabase.rpc as any)("claim_welcome_reward");
    setClaiming(false);
    const r = (data ?? {}) as ClaimResult;
    if (error || !r.ok) {
      if (r.error === "already_claimed") toast("Already claimed today — come back tomorrow!");
      else if (r.error === "completed") toast.success("7-day welcome rewards complete! 🎉");
      else toast.error("Couldn't claim reward");
      return;
    }
    setDay(r.day || 0);
    setLastClaim(today);
    setPopup(r);
    emitReward({
      kind: r.reward_type === "chest" ? "achievement" : "coin",
      title: `Day ${r.day} reward!`,
      subtitle: r.reward_type === "free_spin"
        ? `+${r.coins} coins + free spin unlocked`
        : r.reward_type === "chest"
          ? `Mystery chest: +${r.coins} coins`
          : `+${r.coins} coins`,
      amount: r.coins,
      rare: (r.day || 0) >= 6,
    });
    window.dispatchEvent(new CustomEvent("mc:coins-changed"));
  };

  if (!user || loading || completed) return null;

  const progress = Math.round(((claimedToday ? day : day) / 7) * 100);

  const Card = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-orange-500/5 p-5 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.4)]"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300/90 mb-1">
              <Gift className="h-3 w-3" /> Welcome Calendar
            </div>
            <h3 className="font-display font-black text-lg text-foreground leading-tight">
              7 Days · 7 Free Rewards
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Day {Math.max(day, 0)}/7 · Don't miss a day or your streak resets
            </p>
          </div>
          {!claimedToday && !completed && (
            <Button
              onClick={handleClaim}
              disabled={claiming}
              size="sm"
              className="bg-gradient-to-br from-amber-500 to-orange-600 text-background font-bold shadow-[0_0_18px_hsl(38_95%_55%/0.5)] shrink-0"
            >
              {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Coins className="h-4 w-4 mr-1" /> Claim Day {displayNextDay}</>)}
            </Button>
          )}
          {claimedToday && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300 shrink-0">
              <Check className="h-3.5 w-3.5" /> Claimed
            </div>
          )}
        </div>

        <Progress value={progress} className="h-2 mb-3 bg-amber-950/40" />

        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d) => {
            const isDone = d.day <= day && !!lastClaim;
            const isToday = d.day === displayNextDay && !claimedToday;
            const isLocked = !isDone && !isToday;
            return (
              <motion.div
                key={d.day}
                animate={isToday ? { scale: [1, 1.05, 1] } : undefined}
                transition={{ duration: 1.8, repeat: Infinity }}
                className={[
                  "relative flex flex-col items-center justify-center rounded-lg border p-1.5 aspect-[3/4] text-center",
                  isDone && "border-emerald-500/50 bg-emerald-500/10",
                  isToday && "border-amber-400 bg-gradient-to-br from-amber-500/25 to-orange-500/15 shadow-[0_0_18px_hsl(38_95%_55%/0.55)]",
                  isLocked && "border-border/40 bg-card/40 opacity-60",
                  d.big && "ring-1 ring-amber-400/30",
                ].filter(Boolean).join(" ")}
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">D{d.day}</div>
                <div className={`text-[11px] font-black leading-none ${isToday ? "text-amber-200" : isDone ? "text-emerald-300" : "text-foreground/70"}`}>
                  {d.label}
                </div>
                <div className="text-[8px] uppercase tracking-wide text-muted-foreground mt-0.5">{d.sub}</div>
                {isDone && <Check className="absolute top-0.5 right-0.5 h-3 w-3 text-emerald-400" />}
                {isLocked && <Lock className="absolute top-0.5 right-0.5 h-2.5 w-2.5 text-muted-foreground/60" />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {Card}

      {/* First-login full-screen welcome modal */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpenModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="relative max-w-md w-full rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-card to-orange-500/10 p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_60px_hsl(38_95%_55%/0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setOpenModal(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
              <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-2 drop-shadow-[0_0_12px_hsl(38_95%_55%)]" />
              <h2 className="font-display font-black text-3xl text-amber-300 mb-1">Welcome to MasterChess!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Claim a free reward every day for 7 days. Bigger rewards each day — don't break the streak!
              </p>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {DAYS.map((d) => (
                  <div key={d.day} className={`rounded-md border p-1 text-center ${d.big ? "border-amber-400/60 bg-amber-500/15" : "border-border/40 bg-card/40"}`}>
                    <div className="text-[8px] text-muted-foreground">D{d.day}</div>
                    <div className="text-[10px] font-black text-amber-200">{d.label}</div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => { setOpenModal(false); handleClaim(); }}
                disabled={claiming || claimedToday}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-background font-bold py-6 text-base"
              >
                {claiming ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Claim Day 1 · +100 Coins <Coins className="h-4 w-4 ml-2" /></>}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-claim celebration popup */}
      <AnimatePresence>
        {popup && popup.ok && (
          <motion.div
            className="fixed inset-0 z-[145] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: -45, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="relative max-w-sm w-full rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-card to-orange-500/10 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_60px_hsl(38_95%_55%/0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-30"
                style={{ background: "conic-gradient(from 0deg, transparent, hsl(38 95% 55% / 0.4), transparent)" }}
              />
              <div className="relative">
                <div className="text-5xl mb-2">{popup.reward_type === "chest" ? "🎁" : popup.reward_type === "free_spin" ? "🎰" : "🪙"}</div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300 mb-1">Day {popup.day} reward</p>
                <h2 className="font-display font-black text-4xl text-amber-300 mb-2">
                  +{popup.coins?.toLocaleString()} Coins
                </h2>
                {popup.reward_type === "free_spin" && (
                  <p className="text-sm text-amber-200/90 mb-3">Plus a free Spin the Wheel — go grab it!</p>
                )}
                {popup.reward_type === "chest" && (
                  <p className="text-sm text-amber-200/90 mb-3">Mystery chest unlocked — random big payout!</p>
                )}
                <Button
                  onClick={() => setPopup(null)}
                  className="w-full bg-gradient-to-br from-amber-500 to-orange-600 text-background font-bold mt-2"
                >
                  Awesome!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
