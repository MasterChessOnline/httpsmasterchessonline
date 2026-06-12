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

type Tier = "daily" | "weekly" | "legendary";

export default function SpinWheel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tier, setTier] = useState<Tier>("daily");
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ coins: number; new_balance?: number; segment?: Segment; tier?: string } | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean>(false);
  const [weeklyClaimed, setWeeklyClaimed] = useState<boolean>(false);
  const [checking, setChecking] = useState(true);
  const [oddsOpen, setOddsOpen] = useState(false);
  const [spinDuration, setSpinDuration] = useState(2.6);
  const [spinEase, setSpinEase] = useState<[number, number, number, number]>([0.16, 0.84, 0.2, 1]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) { setChecking(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: daily }, { data: weekly }] = await Promise.all([
        (supabase as any).from("daily_spin_claims").select("claim_date").eq("user_id", user.id).eq("claim_date", today).maybeSingle(),
        (supabase as any).from("weekly_spin_claims").select("id").eq("user_id", user.id)
          .gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()).maybeSingle(),
      ]);
      setAlreadyClaimed(!!daily);
      setWeeklyClaimed(!!weekly);
      setChecking(false);
    };
    check();
  }, [user?.id]);

  const runSpin = async (mode: "daily" | "daily-paid" | "weekly" | "legendary") => {
    if (!user) { toast({ title: "Sign in to spin", description: "Create a free account to claim rewards." }); return; }
    if (spinning) return;
    if (mode === "daily" && alreadyClaimed) return;
    if (mode === "weekly" && weeklyClaimed) return;
    setSpinning(true);
    setResult(null);

    const rpc =
      mode === "daily" ? "claim_daily_spin"
      : mode === "daily-paid" ? "spin_wheel_paid"
      : mode === "weekly" ? "claim_weekly_spin"
      : "spin_wheel_legendary";
    const { data, error } = await (supabase.rpc as any)(rpc);
    if (error || !data?.ok) {
      setSpinning(false);
      if (mode === "daily" && data?.error === "already_claimed") {
        setAlreadyClaimed(true);
        toast({ title: "Already spun today", description: "Use a paid spin (100 coins) or come back tomorrow." });
      } else if (mode === "weekly" && data?.error === "already_claimed") {
        setWeeklyClaimed(true);
        toast({ title: "Weekly spin already claimed", description: "Come back next week for a fresh free spin." });
      } else if (data?.error === "insufficient_coins") {
        toast({ title: "Not enough coins", description: `You need ${data.needed} more coins.`, variant: "destructive" });
      } else {
        toast({ title: "Spin failed", description: data?.error ?? error?.message ?? "Try again.", variant: "destructive" });
      }
      return;
    }

    const seg = pickSegmentForCoins(data.coins);
    const rotations = 4 + Math.floor(Math.random() * 4);
    const jitter = (Math.random() - 0.5) * (SEG * 0.45);
    const target = angle + 360 * rotations + (360 - (seg.idx * SEG + SEG / 2)) + jitter;
    const dur = 2.2 + Math.random() * 1.6;
    const easings: [number, number, number, number][] = [
      [0.16, 0.84, 0.2, 1],
      [0.22, 1.0, 0.36, 1],
      [0.1, 0.9, 0.1, 1],
      [0.33, 1, 0.68, 1],
    ];
    const ease = easings[Math.floor(Math.random() * easings.length)];
    setSpinDuration(dur);
    setSpinEase(ease);
    setShake(true);
    setTimeout(() => setShake(false), 180);
    setAngle(target);

    setTimeout(() => {
      setSpinning(false);
      if (mode === "daily") setAlreadyClaimed(true);
      if (mode === "weekly") setWeeklyClaimed(true);
      setResult({ coins: data.coins, new_balance: data.new_balance, segment: seg, tier: mode });
      emitReward({
        kind: data.coins >= 1000 ? "achievement" : "coin",
        title: `+${data.coins} Coins`,
        subtitle:
          mode === "legendary" ? `Legendary spin · cost ${data.cost ?? 1000}`
          : mode === "weekly" ? "Weekly Spin reward"
          : mode === "daily-paid" ? `Paid spin · cost ${data.cost ?? 100}`
          : data.coins >= 1000 ? "Daily Spin Jackpot!" : "Daily Spin reward",
        amount: data.coins,
      });
      window.dispatchEvent(new CustomEvent("mc:coins-changed"));
      window.dispatchEvent(new CustomEvent("mc:spin-claimed"));
    }, Math.round(dur * 1000) + 120);
  };

  const spin = () => {
    if (tier === "daily") runSpin("daily");
    else if (tier === "weekly") runSpin("weekly");
    else runSpin("legendary");
  };
  const paidSpin = () => runSpin("daily-paid");


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

          {/* Tier selector */}
          <div className="mt-5 inline-flex rounded-full border border-amber-400/30 bg-card/60 backdrop-blur p-1">
            {([
              { id: "daily", label: "Daily", sub: "Free" },
              { id: "weekly", label: "Weekly", sub: "Free" },
              { id: "legendary", label: "Legendary", sub: "1,000" },
            ] as { id: Tier; label: string; sub: string }[]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  tier === t.id
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow"
                    : "text-amber-200 hover:bg-amber-500/10"
                }`}
              >
                {t.label} <span className="opacity-70 ml-1">· {t.sub}</span>
              </button>
            ))}
          </div>
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
            animate={shake ? { rotate: angle, x: [0, -3, 3, -2, 2, 0] } : { rotate: angle }}
            transition={{ duration: spinDuration, ease: spinEase, x: { duration: 0.18 } }}
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
          <button
            type="button"
            onClick={() => setOddsOpen(true)}
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs font-semibold hover:bg-amber-500/20 transition"
          >
            <Info className="w-3.5 h-3.5" /> View winning chances
          </button>
        </div>

        {/* Odds Modal — clear popup with exact win chances */}
        <AnimatePresence>
          {oddsOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setOddsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="relative w-full max-w-sm rounded-3xl border border-amber-400/40 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-6 shadow-[0_0_80px_rgba(251,191,36,0.35)]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setOddsOpen(false)}
                  aria-label="Close"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-2">
                    <Info className="w-3 h-3" /> Exact Drop Rates
                  </div>
                  <h3 className="font-display text-xl font-bold">Your winning chances</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Probabilities are fixed and shown per spin. Totals always equal 100%.
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {ODDS.map((o) => (
                    <li
                      key={o.coins}
                      className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-card/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl w-7 text-center">{o.piece}</span>
                        <span className="text-sm font-bold text-amber-200">{o.label} coins</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-[110px]">
                        <div className="relative h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-300"
                            style={{ width: `${Math.max(2, o.pct)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-amber-300 w-9 text-right">{o.pct}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => setOddsOpen(false)}
                  className="w-full mt-5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold"
                >
                  Got it
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
