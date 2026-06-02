import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Coins, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { emitReward } from "@/lib/reward-fx";

/**
 * Spec reward table (matches the `claim_daily_spin` server RPC weights).
 * Index here is used to rotate the wheel to the matching segment.
 */
const SEGMENTS = [
  { idx: 0, coins: 25,   label: "25",    color: "from-amber-700 to-amber-500",   weight: 35 },
  { idx: 1, coins: 50,   label: "50",    color: "from-emerald-700 to-emerald-500", weight: 25 },
  { idx: 2, coins: 100,  label: "100",   color: "from-sky-700 to-sky-500",       weight: 18 },
  { idx: 3, coins: 250,  label: "250",   color: "from-violet-700 to-violet-500", weight: 12 },
  { idx: 4, coins: 500,  label: "500",   color: "from-fuchsia-700 to-fuchsia-500", weight: 6 },
  { idx: 5, coins: 1000, label: "1,000", color: "from-rose-700 to-rose-500",     weight: 3 },
  { idx: 6, coins: 2500, label: "2,500 ★", color: "from-yellow-400 to-amber-300 text-black", weight: 1 },
];
const SEG = 360 / SEGMENTS.length;

export default function SpinWheel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ coins: number; new_balance?: number } | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean>(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) { setChecking(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await (supabase as any)
        .from("daily_spin_claims")
        .select("claim_date")
        .eq("user_id", user.id)
        .eq("claim_date", today)
        .maybeSingle();
      setAlreadyClaimed(!!data);
      setChecking(false);
    };
    check();
  }, [user?.id]);

  const spin = async () => {
    if (!user) { toast({ title: "Sign in to spin", description: "Create a free account to claim daily rewards." }); return; }
    if (spinning || alreadyClaimed) return;
    setSpinning(true);
    setResult(null);

    const { data, error } = await (supabase.rpc as any)("claim_daily_spin");
    if (error || !data?.ok) {
      setSpinning(false);
      if (data?.error === "already_claimed") {
        setAlreadyClaimed(true);
        toast({ title: "Already spun today", description: "Come back tomorrow for another spin." });
      } else {
        toast({ title: "Spin failed", description: data?.error ?? error?.message ?? "Try again.", variant: "destructive" });
      }
      return;
    }

    const seg = SEGMENTS.find((s) => s.coins === data.coins) ?? SEGMENTS[0];
    // Land segment center at top pointer (0deg). Add 6 full turns for drama.
    const target = 360 * 6 + (360 - (seg.idx * SEG + SEG / 2));
    setAngle(target);

    setTimeout(() => {
      setSpinning(false);
      setAlreadyClaimed(true);
      setResult({ coins: data.coins, new_balance: data.new_balance });
      emitReward({
        kind: data.coins >= 1000 ? "achievement" : "coin",
        title: `+${data.coins} Coins`,
        subtitle: data.coins >= 1000 ? "Daily Spin Jackpot!" : "Daily Spin reward",
        amount: data.coins,
      });
      window.dispatchEvent(new CustomEvent("mc:coins-changed"));
    }, 4200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container max-w-3xl mx-auto px-4 pt-24 pb-24">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back home
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase">
            <Gift className="w-3.5 h-3.5" /> Daily Spin
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-br from-amber-300 via-primary to-amber-500 bg-clip-text text-transparent">
            One free spin every 24 hours
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Land on a jackpot — every spin pays Coins. Rare prizes are rare.
          </p>
        </div>

        {/* Wheel */}
        <div className="relative mx-auto aspect-square w-[min(86vw,440px)]">
          {/* Pointer */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 -top-2 z-10"
            style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "22px solid hsl(45,90%,55%)" }}
          />
          {/* Ambient glow */}
          <motion.div
            aria-hidden
            className="absolute inset-[-12%] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsla(45,90%,55%,0.25), transparent 60%)" }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
          <motion.div
            className="relative h-full w-full rounded-full border-4 border-amber-400/70 overflow-hidden shadow-[0_0_60px_-10px_hsl(45,90%,55%,0.55)]"
            style={{ transformOrigin: "50% 50%" }}
            animate={{ rotate: angle }}
            transition={{ duration: 4, ease: [0.18, 0.9, 0.2, 1] }}
          >
            {SEGMENTS.map((s) => {
              const start = s.idx * SEG;
              return (
                <div
                  key={s.idx}
                  className={`absolute left-1/2 top-1/2 origin-top-left bg-gradient-to-br ${s.color}`}
                  style={{
                    width: "50%",
                    height: "50%",
                    transform: `rotate(${start}deg) skewY(-${90 - SEG}deg)`,
                  }}
                />
              );
            })}
            {/* Labels (counter-skewed) */}
            {SEGMENTS.map((s) => {
              const mid = s.idx * SEG + SEG / 2;
              return (
                <div
                  key={`lbl-${s.idx}`}
                  className="absolute left-1/2 top-1/2 text-xs sm:text-sm font-bold text-white drop-shadow"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${mid}deg) translateY(-36%)`,
                    transformOrigin: "center",
                  }}
                >
                  <span className="inline-flex items-center gap-1"><Coins className="w-3 h-3 text-amber-200" />{s.label}</span>
                </div>
              );
            })}
          </motion.div>
          {/* Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-600 border-4 border-black/60 shadow-inner flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            disabled={spinning || alreadyClaimed || checking || !user}
            onClick={spin}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold px-10 py-6 text-lg hover:brightness-110 disabled:opacity-50"
          >
            {checking ? "Loading…" : spinning ? "Spinning…" : alreadyClaimed ? "Come back tomorrow" : user ? "SPIN — Free" : "Sign in to spin"}
          </Button>
          {!user && (
            <Link to="/signup" className="text-xs text-primary hover:underline">Create a free account →</Link>
          )}
        </div>

        {/* Odds table */}
        <section className="mt-12">
          <h2 className="font-display text-lg font-bold mb-3 text-center">Drop rates</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SEGMENTS.map((s) => (
              <div key={s.idx} className="rounded-lg border border-border/40 bg-card/60 px-3 py-2 text-center">
                <div className="text-sm font-bold text-amber-300 inline-flex items-center gap-1"><Coins className="w-3 h-3" />{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.weight}%</div>
              </div>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setResult(null)}
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="rounded-3xl border border-amber-400/40 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 text-center shadow-[0_0_80px_rgba(251,191,36,0.5)] max-w-sm"
              >
                <div className="text-6xl mb-3">🎉</div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300 mb-1">You won</p>
                <h3 className="text-5xl font-extrabold bg-gradient-to-br from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                  +{result.coins.toLocaleString()}
                </h3>
                <p className="text-amber-300 text-sm mt-1">Coins</p>
                {typeof result.new_balance === "number" && (
                  <p className="text-xs text-muted-foreground mt-3">New balance: {result.new_balance.toLocaleString()}</p>
                )}
                <Button onClick={() => setResult(null)} className="mt-5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold">
                  Collect
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
