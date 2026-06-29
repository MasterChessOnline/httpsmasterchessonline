import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

/**
 * Premium minimal launch splash.
 *
 * Black backdrop, centered MasterChess crest + wordmark with a soft gold
 * glow. Pure fade-in + gentle zoom-in, then a clean fade-out to the home
 * page. No loading bar, no percentages, no "Loading…" text — the splash
 * is purely cinematic and gives the app time to settle in the background.
 *
 * Shown once per browser session. Never rendered inside the Lovable
 * editor iframe.
 */
const SPLASH_MS = 3200;

export default function AppLaunchSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    if (isInIframe) return;
    if (sessionStorage.getItem("mc.splash.shown") === "1") return;
    sessionStorage.setItem("mc.splash.shown", "1");
    setVisible(true);
    const t = setTimeout(() => setVisible(false), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] overflow-hidden bg-black flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
        >
          {/* Soft gold radial glow centered behind the logo */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(251,191,36,0.22) 0%, rgba(251,191,36,0.06) 35%, transparent 70%)",
            }}
          />

          {/* Centered crest + wordmark — single coordinated fade-in + zoom-in */}
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Halo */}
            <div className="absolute -inset-10 blur-3xl bg-amber-400/30 rounded-full pointer-events-none" />

            {/* Crest */}
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-200/15 via-amber-500/10 to-black flex items-center justify-center shadow-[0_30px_80px_-10px_rgba(251,191,36,0.55)]">
              <Crown className="h-14 w-14 sm:h-16 sm:w-16 text-amber-200 drop-shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
            </div>

            {/* Wordmark */}
            <div
              className="mt-7 font-display font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 text-[clamp(2rem,9vw,3.75rem)] leading-none select-none"
              style={{ letterSpacing: "0.06em" }}
            >
              MASTERCHESS
            </div>

            {/* Tagline */}
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-8 bg-amber-300/40" />
              <span className="font-display text-[10px] sm:text-xs uppercase tracking-[0.45em] text-amber-200/70">
                Play · Compete · Master
              </span>
              <span className="h-px w-8 bg-amber-300/40" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
