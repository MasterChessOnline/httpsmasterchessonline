import { Link } from "react-router-dom";
import { Heart, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useDonationProgress } from "@/hooks/use-donation-progress";

export default function HeroDonationCard() {
  const { totalCents, goal, donorCount, loading } = useDonationProgress();

  if (loading || !goal || goal.targetCents <= 0) return null;

  const pct = Math.min(100, Math.round((totalCents / goal.targetCents) * 100));
  if (pct >= 100) return null;

  const raised = Math.floor(totalCents / 100);
  const target = Math.floor(goal.targetCents / 100);
  const cur = (goal.currency || "usd").toUpperCase() === "EUR" ? "€" : "$";

  return (
    <motion.div
      className="mx-auto w-full max-w-lg sm:max-w-xl mt-5 sm:mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/90 via-[#1a1408]/90 to-amber-950/90 backdrop-blur-md px-4 py-3.5 sm:px-6 sm:py-4"
        style={{
          boxShadow:
            "0 0 40px -10px hsl(43 90% 55% / 0.35), inset 0 1px 0 hsl(43 90% 55% / 0.15)",
        }}
      >
        {/* Animated glow ring */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg, transparent 40%, hsl(43 95% 70% / 0.08) 50%, transparent 60%)",
            animation: "donationGlow 3s ease-in-out infinite",
          }}
        />

        {/* Top row: icon + title + donor count */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 fill-amber-400/60" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-amber-100 uppercase tracking-wider">
              Support MasterChess
            </span>
          </div>
          {donorCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-200/70">
              <Users className="h-3 w-3" />
              <span className="tabular-nums">{donorCount} donors</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-3 sm:h-3.5 rounded-full bg-black/50 overflow-hidden border border-amber-500/20">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400"
                style={{
                  boxShadow: "0 0 12px rgba(251,191,36,0.4)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs sm:text-sm font-bold text-amber-100 tabular-nums whitespace-nowrap">
              {pct}%
            </span>
          </div>
        </div>

        {/* Bottom row: raised amount + CTA */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs text-amber-200/60 uppercase tracking-wider">
              Goal: {cur}{target}
            </span>
            <span className="text-sm sm:text-base font-bold text-amber-100 tabular-nums">
              {cur}{raised} raised
            </span>
          </div>
          <Link
            to="/supporter"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-black shadow-lg hover:bg-amber-400 hover:shadow-amber-500/40 transition-all"
          >
            Donate Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes donationGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
