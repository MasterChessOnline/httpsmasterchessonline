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
 * Rendered on fresh homepage entry. Never rendered inside the Lovable editor
 * iframe. It must never show recovery buttons or loading text.
 */
const SPLASH_MS = 3600;

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
    const isHome = window.location.pathname === "/" || window.location.pathname === "";
    if (!isHome) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse 68% 48% at 50% 48%, rgba(120,84,12,0.46) 0%, rgba(42,31,10,0.78) 34%, rgba(0,0,0,0.98) 78%), #000",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
        >
          {/* Soft gold radial glow centered behind the logo */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(251,191,36,0.34) 0%, rgba(251,191,36,0.10) 40%, transparent 72%)",
            }}
          />

          {/* Centered crest + wordmark — cinematic 3D entrance */}
          <motion.div
            className="relative flex flex-col items-center px-5 text-center"
            style={{ perspective: 1200 }}
            initial={{ opacity: 0, scale: 0.74, rotateX: -22 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Halo pulse */}
            <motion.div
              className="absolute -inset-10 blur-3xl bg-amber-400/30 rounded-full pointer-events-none"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.08, 0.95] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Crest with slow 3D float */}
            <motion.div
              className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-[2rem] border-2 border-amber-300/70 bg-gradient-to-br from-amber-100/20 via-amber-500/12 to-black flex items-center justify-center shadow-[0_34px_90px_-10px_rgba(251,191,36,0.72)]"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: [0, 12, 0, -12, 0], rotateX: [0, -6, 0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crown className="h-14 w-14 sm:h-16 sm:w-16 text-amber-200 drop-shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
            </motion.div>

            {/* Wordmark */}
            <motion.h1
              className="mt-7 font-display font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 text-[clamp(2.35rem,11vw,4.35rem)] leading-none select-none"
              style={{ letterSpacing: "0.04em" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              MASTERCHESS
            </motion.h1>

            {/* Tagline */}
            <motion.div
              className="mt-3 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <span className="h-px w-8 bg-amber-300/40" />
              <span className="font-display text-[10px] sm:text-xs uppercase tracking-[0.45em] text-amber-200/70">
                Play · Compete · Master
              </span>
              <span className="h-px w-8 bg-amber-300/40" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
