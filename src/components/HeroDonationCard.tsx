import { Link } from "react-router-dom";
import { Heart, Users, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useDonationProgress } from "@/hooks/use-donation-progress";

export default function HeroDonationCard() {
  const { totalCents, goal, donorCount, loading } = useDonationProgress();

  if (loading || !goal || goal.targetCents <= 0) return null;

  const pct = Math.min(100, (totalCents / goal.targetCents) * 100);
  if (pct >= 100) return null;

  const raised = Math.floor(totalCents / 100);
  const target = Math.floor(goal.targetCents / 100);
  const cur = (goal.currency || "usd").toUpperCase() === "EUR" ? "€" : "$";
  const fmt = (n: number) => n.toLocaleString("en-US");

  // Milestone tiers for visual progress markers
  const tiers = [25, 50, 75];

  return (
    <motion.div
      className="mx-auto w-full max-w-xl sm:max-w-2xl mt-6 sm:mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-[#1a1206]/95 via-[#0d0a04]/95 to-[#1a1206]/95 backdrop-blur-md p-5 sm:p-6"
        style={{
          boxShadow:
            "0 20px 60px -20px hsl(43 90% 55% / 0.45), 0 0 40px -10px hsl(43 90% 55% / 0.25), inset 0 1px 0 hsl(43 90% 55% / 0.18)",
        }}
      >
        {/* Animated shimmer */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg, transparent 35%, hsl(43 95% 70% / 0.1) 50%, transparent 65%)",
            animation: "donationGlow 4s ease-in-out infinite",
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse" />
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
                <Heart className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-black fill-black/80" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-amber-300/90 uppercase tracking-[0.18em]">
                <Sparkles className="h-3 w-3" />
                Community Goal
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-amber-50 leading-tight truncate">
                Help MasterChess reach {cur}{fmt(target)}
              </h2>
            </div>
          </div>
          {donorCount > 0 && (
            <div className="shrink-0 hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1 text-xs text-amber-200/80">
                <Users className="h-3 w-3" />
                <span className="tabular-nums font-semibold">{donorCount}</span>
              </div>
              <span className="text-[10px] text-amber-200/50 uppercase tracking-wider">supporters</span>
            </div>
          )}
        </div>

        {/* Numbers row */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mb-3">
          <div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-amber-100 tabular-nums leading-none">
              {cur}{fmt(raised)}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-200/60 mt-1">raised</div>
          </div>
          <div className="text-center border-x border-amber-500/20 px-1">
            <div className="font-display text-xl sm:text-2xl font-bold text-amber-300 tabular-nums leading-none">
              {cur}{fmt(Math.max(0, target - raised))}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-200/60 mt-1">still needed</div>
          </div>
          <div className="text-right">
            <div className="font-display text-xl sm:text-2xl font-bold text-amber-300 tabular-nums leading-none">
              {pct.toFixed(1)}%
            </div>
            <div className="text-[10px] sm:text-xs text-amber-200/60 mt-1">funded</div>
          </div>
        </div>

        {/* Progress bar with milestone ticks */}
        <div className="relative z-10 mb-4">
          <div className="relative h-3 sm:h-4 rounded-full bg-black/60 overflow-hidden border border-amber-500/20">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400"
              style={{ boxShadow: "0 0 16px rgba(251,191,36,0.55)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
            />
            {/* Tier markers */}
            {tiers.map((t) => (
              <div
                key={t}
                className="absolute top-0 bottom-0 w-px bg-amber-100/25"
                style={{ left: `${t}%` }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        {/* CTA + tagline */}
        <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] sm:text-xs text-amber-200/70 max-w-[60%] leading-relaxed">
            100% player-funded. No ads, no paywalls — just pure chess.
          </p>
          <Link
            to="/supporter"
            className="group shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-black shadow-lg hover:shadow-amber-500/50 hover:from-amber-300 hover:to-amber-400 transition-all"
          >
            Donate Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes donationGlow {
          0%, 100% { opacity: 0.35; transform: translateX(-10%); }
          50% { opacity: 1; transform: translateX(10%); }
        }
      `}</style>
    </motion.div>
  );
}
