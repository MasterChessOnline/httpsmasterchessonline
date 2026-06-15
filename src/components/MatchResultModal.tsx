import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, TrendingUp, TrendingDown, Trophy, Handshake, X, Sparkles, Star, Share2, Copy, Check, MessageCircle, Send, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export interface MatchResultData {
  outcome: "win" | "loss" | "draw";
  coinsEarned: number;
  coinsBase?: number;
  streakBonus?: number;
  firstWinBonus?: number;
  newBalance?: number;
  ratingChange?: number;
  newRating?: number;
  opponentLabel?: string;
  opponentRating?: number;
}

interface Props {
  open: boolean;
  data: MatchResultData | null;
  onClose: () => void;
  onRematch?: () => void;
  onReview?: () => void;
}

export default function MatchResultModal({ open, data, onClose, onRematch, onReview }: Props) {
  const { profile } = useAuth() as any;
  const [copied, setCopied] = useState(false);
  if (!data) return null;
  const titleMap = {
    win: { text: "Victory!", icon: <Trophy className="w-8 h-8" />, color: "from-amber-400 to-yellow-200", glow: "shadow-[0_0_80px_hsl(43,95%,60%,0.5)]" },
    loss: { text: "Defeat", icon: <X className="w-8 h-8" />, color: "from-rose-400 to-rose-200", glow: "shadow-[0_0_60px_hsl(0,75%,60%,0.4)]" },
    draw: { text: "Draw", icon: <Handshake className="w-8 h-8" />, color: "from-sky-400 to-sky-200", glow: "shadow-[0_0_60px_hsl(200,80%,60%,0.4)]" },
  };
  const t = titleMap[data.outcome];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.9, rotateX: -10 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className={`relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 ${t.glow} overflow-hidden`}
          >
            {/* aurora */}
            <motion.div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6 sm:p-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 mx-auto"
              >
                {t.icon}
              </motion.div>
              <h2 className={`text-center text-4xl font-bold bg-gradient-to-br ${t.color} bg-clip-text text-transparent`}>
                {t.text}
              </h2>
              {data.opponentLabel && (
                <p className="mt-1 text-center text-sm text-zinc-400">
                  vs {data.opponentLabel}{data.opponentRating ? ` (${data.opponentRating})` : ""}
                </p>
              )}
              {/* First Win of the Day banner */}
              {data.firstWinBonus ? (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                  className="mt-5 relative overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/25 px-4 py-3"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-100">
                      <Star className="h-5 w-5 text-amber-300" fill="currentColor" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-amber-200">First Win of the Day</div>
                        <div className="text-[11px] text-amber-100/80">Come back tomorrow for another!</div>
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-amber-200 drop-shadow-[0_0_10px_rgba(252,211,77,0.6)]">
                      +{data.firstWinBonus}
                    </div>
                  </div>
                </motion.div>
              ) : null}


              {/* Coins row */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Coins className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Coins earned</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="text-3xl font-bold text-amber-300"
                  >
                    +{data.coinsEarned}
                  </motion.span>
                </div>
                {data.streakBonus ? (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-200/80">
                    <Sparkles className="h-3 w-3" />
                    Streak bonus +{data.streakBonus}
                    {data.coinsBase ? ` (base ${data.coinsBase})` : ""}
                  </div>
                ) : null}
                {typeof data.newBalance === "number" && (
                  <div className="mt-1 text-xs text-zinc-400">
                    New balance: <span className="font-semibold text-amber-200">{data.newBalance.toLocaleString()}</span> coins
                  </div>
                )}
              </motion.div>

              {/* Rating row */}
              {typeof data.ratingChange === "number" && (
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-3 rounded-2xl border border-zinc-700/40 bg-zinc-900/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-300">
                      {data.ratingChange >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-400" /> : <TrendingDown className="h-5 w-5 text-rose-400" />}
                      <span className="text-sm font-semibold uppercase tracking-wider">Rating</span>
                    </div>
                    <span className={`text-2xl font-bold ${data.ratingChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {data.ratingChange >= 0 ? "+" : ""}{data.ratingChange}
                    </span>
                  </div>
                  {typeof data.newRating === "number" && (
                    <div className="mt-1 text-xs text-zinc-400">
                      Now: <span className="font-semibold text-zinc-200">{data.newRating}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {onRematch && (
                  <Button onClick={onRematch} className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold hover:brightness-110">
                    Rematch
                  </Button>
                )}
                {onReview && (
                  <Button onClick={onReview} variant="outline" className="flex-1 border-amber-500/40 text-amber-200 hover:bg-amber-500/10">
                    Review
                  </Button>
                )}
                <Button onClick={onClose} variant="ghost" className="flex-1 text-zinc-400 hover:text-white">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
