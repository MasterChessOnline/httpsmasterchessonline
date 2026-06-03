import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, Sparkles, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Homepage Spin Wheel CTA. Shows a teaser of the daily wheel and links to /spin.
 * If the user already spun today, the button reads "Spin Again Tomorrow".
 */
export default function SpinWheelHomeWidget() {
  const { user } = useAuth();
  const [claimedToday, setClaimedToday] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    (supabase as any)
      .from("daily_spin_claims")
      .select("id")
      .eq("user_id", user.id)
      .eq("claim_date", today)
      .maybeSingle()
      .then(({ data }: any) => setClaimedToday(!!data));
  }, [user]);

  const segments = [
    { label: "+50", tone: "from-amber-500/30 to-amber-600/10" },
    { label: "+100", tone: "from-sky-500/30 to-sky-600/10" },
    { label: "+250", tone: "from-violet-500/30 to-violet-600/10" },
    { label: "+500", tone: "from-emerald-500/30 to-emerald-600/10" },
    { label: "+1K", tone: "from-rose-500/30 to-rose-600/10" },
    { label: "JACKPOT", tone: "from-fuchsia-500/40 to-amber-500/30" },
    { label: "+2.5K", tone: "from-cyan-500/30 to-cyan-600/10" },
    { label: "MYSTERY", tone: "from-indigo-500/40 to-indigo-600/10" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1a0f00] via-zinc-950 to-black p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(245,158,11,0.45)]"
    >
      {/* Aurora background */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl"
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-12 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Wheel */}
        <div className="relative mx-auto flex h-56 w-56 sm:h-64 sm:w-64 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-amber-400/40 shadow-[0_0_60px_rgba(245,158,11,0.45)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            style={{
              background: `conic-gradient(${segments
                .map((s, i) => {
                  const colors = ["#f59e0b", "#0ea5e9", "#8b5cf6", "#10b981", "#f43f5e", "#d946ef", "#06b6d4", "#6366f1"];
                  const c = colors[i % colors.length];
                  const start = (i / segments.length) * 360;
                  const end = ((i + 1) / segments.length) * 360;
                  return `${c} ${start}deg ${end}deg`;
                })
                .join(", ")})`,
            }}
          />
          <div className="absolute inset-3 rounded-full bg-black/85 backdrop-blur-sm border border-amber-400/40 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-center"
            >
              <Gift className="mx-auto h-10 w-10 text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.6)]" />
              <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-amber-200/90">Daily Spin</div>
            </motion.div>
          </div>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]" />
        </div>

        {/* Copy */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3 w-3" /> Free every 24h
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Spin & Win
            </span>{" "}
            up to 2,500 coins
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-md">
            Free daily spin with chances at coins, rare boards, legendary piece sets, and the jackpot.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 justify-center md:justify-start">
            {segments.slice(0, 5).map((s) => (
              <span key={s.label} className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${s.tone} text-amber-100 border border-amber-400/20`}>
                {s.label}
              </span>
            ))}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500/40 to-amber-500/30 text-fuchsia-100 border border-fuchsia-400/30">
              💎 JACKPOT
            </span>
          </div>

          <Link
            to="/spin"
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-bold uppercase tracking-wider text-sm shadow-[0_10px_30px_-8px_rgba(245,158,11,0.7)] hover:brightness-110 hover:scale-[1.03] transition"
          >
            <Coins className="h-4 w-4" />
            {claimedToday ? "View Wheel" : "Spin The Wheel"}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
