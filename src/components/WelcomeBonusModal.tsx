// Global welcome popup for brand-new MasterChess accounts. Fires once per
// new user (detected by profile.created_at within 5 minutes of "now"
// AND a session-scoped localStorage flag). Surfaces the +500 default
// signup bonus (granted at profile creation time by the handle_new_user
// trigger via the master_coins default of 500).
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const FLAG = "mc:welcome-bonus-seen";

function isFreshAccount(createdAt?: string | null) {
  if (!createdAt) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs >= 0 && ageMs < 5 * 60 * 1000;
}

export default function WelcomeBonusModal() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    const key = `${FLAG}:${user.id}`;
    if (localStorage.getItem(key)) return;
    if (!isFreshAccount((profile as any).created_at)) {
      // Existing account — silently mark as seen so we never bother them.
      localStorage.setItem(key, "1");
      return;
    }
    // Defer one tick so it doesn't fight with route transitions
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [user?.id, profile?.user_id]);

  const dismiss = () => {
    if (user) localStorage.setItem(`${FLAG}:${user.id}`, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={dismiss}
        >
          {/* Floating coins */}
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-amber-300"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 700,
                y: (Math.random() - 0.5) * 520,
                opacity: [0, 1, 0],
                scale: [0, 1 + Math.random() * 0.8, 0.6],
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 2.4, delay: i * 0.04, ease: "easeOut", repeat: Infinity, repeatDelay: 0.3 }}
              style={{ fontSize: `${18 + (i % 5) * 6}px` }}
            >
              ●
            </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0.6, rotateY: -90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 text-center shadow-[0_0_120px_-10px_hsl(43,90%,55%/0.7)]"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center"
            >
              <Crown className="w-9 h-9 text-amber-300" />
            </motion.div>

            <p className="text-xs uppercase tracking-[0.35em] text-amber-300 mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Welcome to MasterChess
            </p>
            <h2 className="font-display text-3xl font-extrabold bg-gradient-to-br from-amber-200 to-yellow-400 bg-clip-text text-transparent">
              You got +500 Coins
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Your starter bag of Master Coins is loaded. Spend them on board skins,
              spin the wheel, or stake them in chests.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Link to="/play" onClick={dismiss} className="rounded-xl border border-amber-500/30 bg-card/60 hover:border-amber-500/60 px-2 py-3 text-center transition">
                <div className="text-xl">♟</div>
                <div className="text-[10px] mt-1 font-semibold text-amber-200">Play match</div>
              </Link>
              <Link to="/spin" onClick={dismiss} className="rounded-xl border border-amber-500/30 bg-card/60 hover:border-amber-500/60 px-2 py-3 text-center transition">
                <div className="text-xl">🎡</div>
                <div className="text-[10px] mt-1 font-semibold text-amber-200">Free spin</div>
              </Link>
              <Link to="/chests" onClick={dismiss} className="rounded-xl border border-amber-500/30 bg-card/60 hover:border-amber-500/60 px-2 py-3 text-center transition">
                <div className="text-xl">📦</div>
                <div className="text-[10px] mt-1 font-semibold text-amber-200">Open chest</div>
              </Link>
            </div>

            <Button
              onClick={dismiss}
              className="mt-6 w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold hover:from-amber-400 hover:to-yellow-300"
            >
              <Coins className="w-4 h-4 mr-2" /> Collect & Enter MasterChess
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
