import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Gift, Sparkles, Share2, Users, Trophy, Flame, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { emitReward } from "@/lib/reward-fx";
import { share as shareLink } from "@/lib/share";
import CanvasSpinWheel, { type WheelSegment } from "./CanvasSpinWheel";

/**
 * Homepage Spin Wheel section.
 * - Server-validated rewards via `claim_daily_spin` RPC (anti-cheat).
 * - Canvas wheel (60fps).
 * - Countdown to next free spin + streak day.
 * - Live social-proof strip: players online, rewards won today, top win.
 * - Shareable result card (Web Share + clipboard fallback).
 */

// Visual segments — must align with server reward tiers (see SpinWheel.tsx).
const SEGMENTS: (WheelSegment & { coins: number })[] = [
  { coins: 25,   label: "+25",    sub: "Coins",   piece: "♙", color: "#7c2d12" },
  { coins: 50,   label: "+50",    sub: "Coins",   piece: "♙", color: "#065f46" },
  { coins: 100,  label: "+100",   sub: "Coins",   piece: "♘", color: "#0c4a6e" },
  { coins: 250,  label: "+250",   sub: "Coins",   piece: "♗", color: "#5b21b6" },
  { coins: 25,   label: "MYSTERY",sub: "Chest",   piece: "🎁", color: "#27272a" },
  { coins: 500,  label: "+500",   sub: "Coins",   piece: "♖", color: "#86198f" },
  { coins: 1000, label: "+1K",    sub: "Coins",   piece: "♕", color: "#9f1239" },
  { coins: 2500, label: "JACKPOT",sub: "King's Prize", piece: "♔", color: "#f59e0b", text: "#1c1917" },
];
const SEG_DEG = 360 / SEGMENTS.length;

function pickSegmentForCoins(coins: number): number {
  // Fair mapping: pointer lands on the exact segment that matches the reward.
  const idx = SEGMENTS.findIndex((s) => s.coins === coins);
  return idx >= 0 ? idx : 0;
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function HomeSpinWheelSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [result, setResult] = useState<{ coins: number; idx: number } | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [nextSpinAt, setNextSpinAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<{ online: number; rewardsToday: number; topWin: number }>({
    online: 0,
    rewardsToday: 0,
    topWin: 0,
  });
  const initRef = useRef(false);

  // ── load claim status + streak ────────────────────────────────────────────
  useEffect(() => {
    if (!user || initRef.current) return;
    initRef.current = true;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data: claim } = await (supabase as any)
        .from("daily_spin_claims")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("claim_date", today)
        .maybeSingle();
      if (claim) {
        setAlreadyClaimed(true);
        const next = new Date(today + "T00:00:00Z").getTime() + 24 * 3600 * 1000;
        setNextSpinAt(next);
      }
      const { data: rpcData } = await (supabase as any).rpc("get_my_profile");
      const prof: any = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (prof?.login_streak != null) setStreak(prof.login_streak);
    })();
  }, [user?.id]);

  // ── live stats refresher (every 30s) ──────────────────────────────────────
  useEffect(() => {
    let alive = true;
    const fetchStats = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const [presence, claimsToday] = await Promise.all([
        (supabase as any)
          .from("online_game_presence")
          .select("user_id", { count: "exact", head: true })
          .gte("last_seen", fiveMinAgo),
        (supabase as any)
          .from("daily_spin_claims")
          .select("coins_awarded")
          .eq("claim_date", today),
      ]);
      if (!alive) return;
      const online = (presence as any)?.count ?? 0;
      const rows: { coins_awarded: number }[] = (claimsToday as any)?.data ?? [];
      const rewardsToday = rows.reduce((s, r) => s + (r.coins_awarded || 0), 0);
      const topWin = rows.reduce((m, r) => Math.max(m, r.coins_awarded || 0), 0);
      setStats({ online, rewardsToday, topWin });
    };
    fetchStats();
    const iv = setInterval(fetchStats, 30_000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  // ── countdown ticker ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!alreadyClaimed) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [alreadyClaimed]);

  const countdownSecs = useMemo(() => {
    if (!nextSpinAt) return 0;
    return Math.max(0, Math.floor((nextSpinAt - now) / 1000));
  }, [nextSpinAt, now]);

  // ── spin handler ──────────────────────────────────────────────────────────
  const spin = async () => {
    if (!user) {
      toast({ title: "Sign in to spin", description: "Create a free account in 10 seconds." });
      navigate("/signup");
      return;
    }
    if (spinning || alreadyClaimed) return;
    setSpinning(true);
    setWinnerIdx(null);
    setResult(null);

    const { data, error } = await (supabase.rpc as any)("claim_daily_spin");
    if (error || !data?.ok) {
      setSpinning(false);
      if (data?.error === "already_claimed") {
        setAlreadyClaimed(true);
        const today = new Date().toISOString().slice(0, 10);
        setNextSpinAt(new Date(today + "T00:00:00Z").getTime() + 24 * 3600 * 1000);
        toast({ title: "Already spun today", description: "Come back tomorrow for another free spin." });
      } else {
        toast({ title: "Spin failed", description: data?.error ?? error?.message ?? "Try again.", variant: "destructive" });
      }
      return;
    }

    const idx = pickSegmentForCoins(data.coins);
    // Land segment idx under the top pointer.
    // Segment 0 starts at -90deg (top). To put segment idx center at top:
    // target rotation = - (idx * SEG_DEG + SEG_DEG/2)  + 360 * spinsExtra
    const SPINS = 7;
    const target = SPINS * 360 - (idx * SEG_DEG + SEG_DEG / 2);
    setAngle(target);

    setTimeout(() => {
      setSpinning(false);
      setAlreadyClaimed(true);
      const today = new Date().toISOString().slice(0, 10);
      setNextSpinAt(new Date(today + "T00:00:00Z").getTime() + 24 * 3600 * 1000);
      setWinnerIdx(idx);
      setResult({ coins: data.coins, idx });
      emitReward({
        kind: data.coins >= 1000 ? "achievement" : "coin",
        title: `+${data.coins} Coins`,
        subtitle: data.coins >= 1000 ? "Daily Spin Jackpot!" : "Daily Spin reward",
        amount: data.coins,
      });
      window.dispatchEvent(new CustomEvent("mc:coins-changed"));
      window.dispatchEvent(new CustomEvent("mc:spin-claimed"));
    }, 4300);
  };

  const handleShare = () => {
    if (!result) return;
    const seg = SEGMENTS[result.idx];
    shareLink({
      title: "MasterChess.live",
      text: `I just won ${seg.label} ${seg.sub ?? ""} on the MasterChess daily wheel! ${seg.piece} Spin yours →`,
      url: typeof window !== "undefined" ? `${window.location.origin}/spin` : undefined,
      fallbackToast: "Result copied — paste it anywhere!",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1a0f00] via-zinc-950 to-black p-5 sm:p-8 shadow-[0_30px_80px_-20px_rgba(245,158,11,0.45)]"
    >
      {/* Aurora */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl"
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 sm:gap-8 items-center">
        {/* Wheel */}
        <div className="mx-auto">
          <CanvasSpinWheel
            segments={SEGMENTS}
            targetAngle={angle}
            duration={4200}
            winnerIdx={winnerIdx}
            size={typeof window !== "undefined" && window.innerWidth < 480 ? 280 : 340}
          />
        </div>

        {/* Copy & CTA */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            {alreadyClaimed ? "Next free spin in" : "Free spin available"}
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Spin & Win
            </span>{" "}
            up to 2,500 coins
          </h2>

          {alreadyClaimed ? (
            <div className="mt-3 font-mono text-2xl text-amber-300 tabular-nums">
              {formatCountdown(countdownSecs)}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">
              One tap to claim. Coins, chests, and the King's jackpot.
            </p>
          )}

          {streak > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5" /> Day {streak} login streak
            </div>
          )}

          <button
            type="button"
            onClick={spin}
            disabled={spinning || alreadyClaimed}
            className="mt-5 w-full md:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider text-base shadow-[0_10px_30px_-8px_rgba(245,158,11,0.7)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Coins className="h-5 w-5" />
            {spinning ? "Spinning…" : alreadyClaimed ? "Come back tomorrow" : "SPIN THE WHEEL"}
          </button>

        </div>
      </div>

      {/* Live social-proof strip */}
      <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <Stat icon={<Users className="h-4 w-4" />} label="Online" value={stats.online} accent="text-emerald-300" />
        <Stat icon={<Coins className="h-4 w-4" />} label="Won today" value={stats.rewardsToday.toLocaleString()} accent="text-amber-300" />
        <Stat icon={<Trophy className="h-4 w-4" />} label="Top win" value={stats.topWin ? `+${stats.topWin.toLocaleString()}` : "—"} accent="text-fuchsia-300" />
      </div>

      {/* Result modal with shareable card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-zinc-950 to-black p-6 text-center shadow-[0_30px_80px_-10px_rgba(245,158,11,0.6)]"
            >
              <button
                onClick={() => setResult(null)}
                aria-label="Close"
                className="absolute right-3 top-3 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-6xl mb-2 select-none">{SEGMENTS[result.idx].piece}</div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">You won</div>
              <div className="mt-1 font-display text-5xl font-black bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                +{result.coins.toLocaleString()}
              </div>
              <div className="mt-1 text-sm text-zinc-400">MasterChess Coins</div>

              <button
                onClick={handleShare}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold uppercase tracking-wider text-sm hover:brightness-110 transition"
              >
                <Share2 className="h-4 w-4" /> Share your win
              </button>
              <button
                onClick={() => setResult(null)}
                className="mt-2 w-full px-5 py-2 rounded-2xl border border-amber-400/30 text-amber-200 text-xs font-semibold uppercase tracking-wider hover:bg-amber-400/10 transition"
              >
                Claim & close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: string }) {
  return (
    <div className="rounded-2xl border border-amber-400/15 bg-black/40 px-2 py-3">
      <div className={`flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest font-bold ${accent}`}>
        {icon} {label}
      </div>
      <div className="mt-1 font-display text-lg sm:text-xl font-bold text-zinc-100 tabular-nums">{value}</div>
    </div>
  );
}
