import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Coins, Gift, Crown, Info, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { emitReward } from "@/lib/reward-fx";

/**
 * Chess-themed Spin The Wheel.
 * - 8 equal segments (each = 45deg) for perfectly fair visual balance
 * - every segment uses a chess piece glyph + reward label
 * - server RPC (`claim_daily_spin`) returns one of 7 coin tiers; we map
 *   each coin tier to a piece-themed segment, and fold the "Mystery"
 *   segment onto the lowest tier so total weight stays 100%.
 */
type Segment = {
  idx: number;
  coins: number;
  label: string;
  piece: string;           // chess unicode glyph
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  gradient: string;
  textColor?: string;
};

const SEGMENTS: Segment[] = [
  { idx: 0, coins: 25,   label: "+25 Coins",    piece: "♙", rarity: "common",    gradient: "from-amber-900 to-amber-700" },
  { idx: 1, coins: 50,   label: "+50 Coins",    piece: "♙", rarity: "common",    gradient: "from-emerald-800 to-emerald-600" },
  { idx: 2, coins: 100,  label: "+100 Coins",   piece: "♘", rarity: "common",    gradient: "from-sky-800 to-sky-600" },
  { idx: 3, coins: 250,  label: "+250 Coins",   piece: "♗", rarity: "rare",      gradient: "from-violet-800 to-violet-600" },
  { idx: 4, coins: 25,   label: "Mystery",      piece: "🎁", rarity: "common",   gradient: "from-zinc-800 to-zinc-600" }, // maps to lowest tier
  { idx: 5, coins: 500,  label: "+500 Coins",   piece: "♖", rarity: "epic",      gradient: "from-fuchsia-800 to-fuchsia-600" },
  { idx: 6, coins: 1000, label: "+1,000 Coins", piece: "♕", rarity: "legendary", gradient: "from-rose-800 to-rose-600" },
  { idx: 7, coins: 2500, label: "JACKPOT",      piece: "♔", rarity: "mythic",    gradient: "from-yellow-400 to-amber-300", textColor: "text-black" },
];
const N = SEGMENTS.length;
const SEG = 360 / N; // 45 deg

const ODDS: { coins: number; label: string; piece: string; pct: number }[] = [
  { coins: 25,   label: "+25",    piece: "♙", pct: 35 },
  { coins: 50,   label: "+50",    piece: "♙", pct: 25 },
  { coins: 100,  label: "+100",   piece: "♘", pct: 18 },
  { coins: 250,  label: "+250",   piece: "♗", pct: 12 },
  { coins: 500,  label: "+500",   piece: "♖", pct: 6 },
  { coins: 1000, label: "+1,000", piece: "♕", pct: 3 },
  { coins: 2500, label: "JACKPOT", piece: "♔", pct: 1 },
];

function pickSegmentForCoins(coins: number): Segment {
  // Map server reward tier → preferred segment. 25-coin reward biased to the
  // ♙ segment; we'll occasionally hit the Mystery segment for variety.
  const exact = SEGMENTS.find((s) => s.coins === coins);
  if (!exact) return SEGMENTS[0];
  if (coins === 25 && Math.random() < 0.35) return SEGMENTS[4]; // Mystery
  return exact;
}

export default function SpinWheel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ coins: number; new_balance?: number; segment?: Segment } | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean>(false);
  const [checking, setChecking] = useState(true);
  const [oddsOpen, setOddsOpen] = useState(false);

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

  const runSpin = async (paid: boolean) => {
    if (!user) { toast({ title: "Sign in to spin", description: "Create a free account to claim rewards." }); return; }
    if (spinning) return;
    if (!paid && alreadyClaimed) return;
    setSpinning(true);
    setResult(null);

    const rpc = paid ? "spin_wheel_paid" : "claim_daily_spin";
    const { data, error } = await (supabase.rpc as any)(rpc);
    if (error || !data?.ok) {
      setSpinning(false);
      if (!paid && data?.error === "already_claimed") {
        setAlreadyClaimed(true);
        toast({ title: "Already spun today", description: "Use a paid spin (100 coins) or come back tomorrow." });
      } else if (data?.error === "insufficient_coins") {
        toast({ title: "Not enough coins", description: `You need ${data.needed} more coins.`, variant: "destructive" });
      } else {
        toast({ title: "Spin failed", description: data?.error ?? error?.message ?? "Try again.", variant: "destructive" });
      }
      return;
    }

    const seg = pickSegmentForCoins(data.coins);
    const target = 360 * 5 + (360 - (seg.idx * SEG + SEG / 2));
    setAngle(target);

    setTimeout(() => {
      setSpinning(false);
      if (!paid) setAlreadyClaimed(true);
      setResult({ coins: data.coins, new_balance: data.new_balance, segment: seg });
      emitReward({
        kind: data.coins >= 1000 ? "achievement" : "coin",
        title: `+${data.coins} Coins`,
        subtitle: paid
          ? `Paid spin · cost ${data.cost ?? 100}`
          : data.coins >= 1000 ? "Daily Spin Jackpot!" : "Daily Spin reward",
        amount: data.coins,
      });
      window.dispatchEvent(new CustomEvent("mc:coins-changed"));
      window.dispatchEvent(new CustomEvent("mc:spin-claimed"));
    }, 2700);
  };

  const spin = () => runSpin(false);
  const paidSpin = () => runSpin(true);


  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Ambient chess pieces */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] select-none">
        {["♔","♕","♖","♗","♘","♙","♚","♛","♜","♝","♞","♟"].map((c, i) => (
          <div key={i} className="absolute font-bold text-foreground" style={{
            fontSize: `${80 + (i % 5) * 30}px`,
            left: `${(i * 13) % 95}%`,
            top: `${(i * 23) % 90}%`,
            transform: `rotate(${(i * 37) % 360}deg)`,
          }}>{c}</div>
        ))}
      </div>

      <Navbar />
      <main className="container max-w-3xl mx-auto px-4 pt-24 pb-24 relative">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back home
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase">
            <Gift className="w-3.5 h-3.5" /> Daily Spin
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-br from-amber-300 via-primary to-amber-500 bg-clip-text text-transparent">
            Royal Wheel of Rewards
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One free spin every 24 hours · 8 chess-themed prizes · land the King for the Jackpot.
          </p>
        </div>

        {/* Wheel */}
        <div className="relative mx-auto aspect-square w-[min(86vw,460px)]">
          {/* Pointer (crown) */}
          <div aria-hidden className="absolute left-1/2 -translate-x-1/2 -top-3 z-20 flex flex-col items-center">
            <Crown className="w-7 h-7 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" strokeWidth={2} />
            <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "22px solid hsl(45,90%,55%)", marginTop: -2, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }} />
          </div>

          {/* Outer ambient glow */}
          <motion.div
            aria-hidden
            className="absolute inset-[-14%] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsla(45,90%,55%,0.28), transparent 62%)" }}
            animate={{ opacity: [0.4, 0.95, 0.4], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />

          {/* Decorative outer ring */}
          <div aria-hidden className="absolute inset-[-3%] rounded-full border-[6px] border-amber-500/40 shadow-[inset_0_0_30px_rgba(251,191,36,0.3)]" />

          {/* The wheel */}
          <motion.div
            className="relative h-full w-full rounded-full border-4 border-amber-400/80 overflow-hidden shadow-[0_0_60px_-10px_hsl(45,90%,55%,0.6)]"
            style={{ transformOrigin: "50% 50%" }}
            animate={{ rotate: angle }}
            transition={{ duration: 2.6, ease: [0.16, 0.84, 0.2, 1] }}
          >
            {/* Segment slices via conic-gradient — guaranteed equal sizes */}
            <div
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from -${SEG / 2}deg, ${SEGMENTS.map((s, i) => {
                  const colorMap: Record<Segment["rarity"], string> = {
                    common:    i === 0 ? "#78350f" : i === 1 ? "#065f46" : "#0c4a6e",
                    rare:      "#5b21b6",
                    epic:      "#86198f",
                    legendary: "#9f1239",
                    mythic:    "#fbbf24",
                  };
                  // For segment 4 (mystery) use zinc
                  const c = i === 4 ? "#3f3f46" : colorMap[s.rarity];
                  return `${c} ${i * SEG}deg ${(i + 1) * SEG}deg`;
                }).join(", ")})`,
              }}
            />
            {/* Spoke dividers */}
            {SEGMENTS.map((_, i) => (
              <div
                key={`sp-${i}`}
                aria-hidden
                className="absolute left-1/2 top-1/2 origin-top h-1/2 w-px bg-amber-300/60"
                style={{ transform: `translate(-50%, -100%) rotate(${i * SEG + SEG / 2}deg)`, transformOrigin: "bottom center" }}
              />
            ))}
            {/* Segment labels — piece glyph + reward */}
            {SEGMENTS.map((s) => {
              const mid = s.idx * SEG + SEG / 2;
              return (
                <div
                  key={`lbl-${s.idx}`}
                  className={`absolute left-1/2 top-1/2 ${s.textColor ?? "text-white"} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${mid}deg) translateY(-38%)`,
                    transformOrigin: "center",
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5 leading-none">
                    <span className="text-3xl sm:text-4xl">{s.piece}</span>
                    <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider whitespace-nowrap">
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Winning segment glow + pulse (renders inside the wheel so it rotates with it) */}
            {result?.segment && !spinning && (
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.35, 0.95, 0.35] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{
                  background: `conic-gradient(from -${SEG / 2}deg,
                    transparent ${result.segment.idx * SEG}deg,
                    hsla(45,95%,60%,0.55) ${result.segment.idx * SEG}deg,
                    hsla(45,100%,75%,0.85) ${result.segment.idx * SEG + SEG / 2}deg,
                    hsla(45,95%,60%,0.55) ${(result.segment.idx + 1) * SEG}deg,
                    transparent ${(result.segment.idx + 1) * SEG}deg)`,
                  mixBlendMode: "screen",
                  filter: "blur(2px)",
                }}
              />
            )}
          </motion.div>

          {/* Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 border-4 border-black/70 shadow-[inset_0_0_20px_rgba(0,0,0,0.4),0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center z-10">
            <Crown className="w-8 h-8 text-black drop-shadow" strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            disabled={spinning || alreadyClaimed || checking || !user}
            onClick={spin}
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-extrabold px-12 py-7 text-xl rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.45)] hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {checking ? "Loading…" : spinning ? "Spinning…" : alreadyClaimed ? "Daily spin claimed" : user ? "SPIN — Free" : "Sign in to spin"}
          </Button>
          {user && (
            <Button
              variant="outline"
              size="sm"
              disabled={spinning}
              onClick={paidSpin}
              className="border-amber-500/50 text-amber-200 hover:bg-amber-500/10"
            >
              <Coins className="w-3.5 h-3.5 mr-1.5" /> Spin again — 100 coins
            </Button>
          )}
          {!user && (
            <Link to="/signup" className="text-xs text-primary hover:underline">Create a free account →</Link>
          )}
        </div>

        {/* Odds table */}
        <section className="mt-12">
          <h2 className="font-display text-lg font-bold mb-3 text-center inline-flex items-center justify-center gap-2 w-full">
            <Coins className="w-4 h-4 text-amber-400" /> Drop rates
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ODDS.map((o) => (
              <div key={o.coins} className="rounded-lg border border-amber-500/30 bg-card/60 backdrop-blur px-3 py-2.5 text-center hover:border-amber-500/60 transition">
                <div className="text-2xl mb-0.5">{o.piece}</div>
                <div className="text-sm font-bold text-amber-300">{o.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{o.pct}% chance</div>
              </div>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              onClick={() => setResult(null)}
            >
              {/* Confetti pieces */}
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={`c-${i}`}
                  className="absolute text-2xl"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: (Math.random() - 0.5) * 800,
                    y: (Math.random() - 0.5) * 600,
                    opacity: 0,
                    scale: 1 + Math.random(),
                    rotate: Math.random() * 720,
                  }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                  style={{ color: ["#fbbf24","#f59e0b","#fde68a","#fff"][i % 4] }}
                >
                  {["♔","♕","♖","♗","♘","♙","★","✦"][i % 8]}
                </motion.div>
              ))}
              <motion.div
                initial={{ scale: 0.6, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="relative rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 text-center shadow-[0_0_100px_rgba(251,191,36,0.55)] max-w-sm"
              >
                <div className="text-7xl mb-2">{result.segment?.piece ?? "🎉"}</div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-300 mb-1">You won</p>
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
