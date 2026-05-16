import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

/**
 * Cinematic launch splash shown ONLY when the app is opened from the home
 * screen (standalone/PWA mode). Gives the "real native app" feel right after
 * the user taps the icon — gold King mark, halo glow, brand wordmark.
 *
 * Auto-dismisses after ~1.6s. Never shows inside the browser tab or iframe.
 */
export default function AppLaunchSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    // Show once per session, only in real installed-app mode.
    if (!isStandalone || isInIframe) return;
    if (sessionStorage.getItem("mc.splash.shown") === "1") return;
    sessionStorage.setItem("mc.splash.shown", "1");
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b0b0d] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
        >
          {/* Cinematic gold radial glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.08) 30%, transparent 60%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Subtle film grain */}
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Crown mark */}
          <motion.div
            className="relative"
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.05 }}
          >
            <div className="absolute inset-0 blur-2xl bg-amber-400/40 rounded-full" />
            <div className="relative h-24 w-24 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-300/20 via-amber-500/10 to-black flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(201,168,76,0.55)]">
              <Crown className="h-12 w-12 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
            </div>
          </motion.div>

          {/* Wordmark */}
          <motion.div
            className="mt-7 text-center"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }}
          >
            <div className="font-display text-3xl tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 uppercase">
              MasterChess
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-[0.4em] text-amber-300/60">
              Play · Compete · Master
            </div>
          </motion.div>

          {/* Gold loading bar */}
          <motion.div
            className="absolute bottom-16 h-[2px] w-40 overflow-hidden rounded-full bg-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-amber-300 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
