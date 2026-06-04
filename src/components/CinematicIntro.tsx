import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "mc:cinematic-intro:seen-session";

/**
 * One-time cinematic launch screen shown to brand-new visitors.
 * - Sign Up is the dominant CTA (offers 500 starting coins)
 * - Skips for signed-in users
 * - Skips inside editor iframe
 */
/**
 * Cinematic launch splash — premium, 1.4s max, then auto-fades.
 * Never blocks interaction. Shown ONCE per browser per session.
 */
export default function CinematicIntro() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    try { if (window.self !== window.top) return; } catch { return; }
    setOpen(true);
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
    const t = setTimeout(() => setOpen(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // Suppress unused warning — kept for future personalization
  void user;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[400] overflow-hidden bg-black pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => { /* allow GC */ }}
        >
          {/* Gold spotlight */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(251,191,36,0.28) 0%, rgba(251,191,36,0.05) 38%, transparent 68%)",
            }}
          />
          {/* Floating pieces — subtle */}
          {["♞", "♝", "♜", "♛", "♟"].map((c, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="absolute text-amber-300/15 select-none font-bold"
              style={{ fontSize: `${56 + i * 16}px`, left: `${10 + i * 18}%`, top: `${20 + (i % 3) * 22}%` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.5, y: [0, -8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
            >
              {c}
            </motion.div>
          ))}
          {/* Crown reveal */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.5, rotateY: -120, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <Crown className="h-24 w-24 md:h-28 md:w-28 text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.65)]" strokeWidth={1.5} />
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-400/25 blur-3xl"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.7em" }}
              animate={{ opacity: 1, letterSpacing: "0.28em" }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 font-display text-2xl md:text-4xl font-bold bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent uppercase"
            >
              MasterChess
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              transition={{ delay: 0.6 }}
              className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.45em] text-amber-300/80"
            >
              <Sparkles className="h-3 w-3" /> Live
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
