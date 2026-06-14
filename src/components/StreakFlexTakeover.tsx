import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MILESTONES = [5, 10, 25, 50, 100] as const;
const STORAGE_KEY = "mc:streak-flex:lastShown";

interface Props {
  streak: number;
  username?: string | null;
}

function milestoneFor(streak: number): number | null {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (streak >= MILESTONES[i]) return MILESTONES[i];
  }
  return null;
}

function colorFor(m: number) {
  if (m >= 100) return { from: "#fde047", to: "#f59e0b", glow: "rgba(253,224,71,0.6)" };
  if (m >= 50) return { from: "#f97316", to: "#dc2626", glow: "rgba(249,115,22,0.6)" };
  if (m >= 25) return { from: "#a78bfa", to: "#7c3aed", glow: "rgba(167,139,250,0.6)" };
  if (m >= 10) return { from: "#34d399", to: "#059669", glow: "rgba(52,211,153,0.6)" };
  return { from: "#fbbf24", to: "#d97706", glow: "rgba(251,191,36,0.6)" };
}

/**
 * Full-screen confetti takeover when a player crosses a win-streak milestone.
 * Triggers once per milestone (persisted in localStorage). Mount once globally
 * with the current win_streak; it self-shows when appropriate.
 */
export default function StreakFlexTakeover({ streak, username }: Props) {
  const [showMilestone, setShowMilestone] = useState<number | null>(null);

  useEffect(() => {
    const m = milestoneFor(streak);
    if (!m) return;
    const last = Number(localStorage.getItem(STORAGE_KEY) ?? "0");
    if (m > last) {
      setShowMilestone(m);
      localStorage.setItem(STORAGE_KEY, String(m));
    }
  }, [streak]);

  if (!showMilestone) return null;

  const colors = colorFor(showMilestone);
  const close = () => setShowMilestone(null);

  const shareText = `🔥 ${showMilestone}-game WIN STREAK on MasterChess! Come try to break it: https://masterchess.live${username ? `/u/${username}` : ""}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <AnimatePresence>
      <motion.div
        key={`flex-${showMilestone}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md"
        onClick={close}
      >
        {/* Confetti dots */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
            animate={{ y: window.innerHeight + 50, rotate: 720, opacity: 0 }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.8, ease: "easeIn" }}
            className="absolute h-2 w-2 rounded-sm"
            style={{ background: i % 2 === 0 ? colors.from : colors.to }}
          />
        ))}

        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.5, opacity: 0, rotateX: -30 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="relative mx-4 max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-black/90 to-zinc-900/90 p-8 text-center shadow-2xl"
          style={{ boxShadow: `0 0 80px ${colors.glow}` }}
        >
          <button
            onClick={close}
            className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              boxShadow: `0 0 40px ${colors.glow}`,
            }}
          >
            <Flame className="h-14 w-14 text-white" fill="white" />
          </motion.div>

          <div className="text-xs uppercase tracking-[0.3em] text-zinc-400">Win Streak</div>
          <div
            className="my-2 text-8xl font-display font-black leading-none"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {showMilestone}
          </div>
          <div className="mb-6 text-lg font-semibold text-white">
            {showMilestone >= 50 ? "LEGENDARY" : showMilestone >= 25 ? "UNSTOPPABLE" : showMilestone >= 10 ? "ON FIRE" : "STREAK UNLOCKED"}
          </div>
          <p className="mb-6 text-sm text-zinc-300">
            You just chained <strong>{showMilestone} wins in a row</strong>. Flex it before someone breaks it.
          </p>

          <div className="flex gap-2">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f3d97a] to-[#d4a843] px-4 py-3 font-semibold text-black hover:brightness-110 transition-all"
            >
              <Share2 className="h-4 w-4" /> Share the flex
            </a>
            <Button variant="outline" onClick={close} className="border-white/20">
              Keep going
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
