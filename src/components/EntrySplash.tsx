import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Premium entry splash — plays once per browser session (sessionStorage).
 * The homepage mounts underneath immediately; this overlay only performs the
 * queen intro and then removes itself after a strict 3–4 second window.
 */
const MIN_MS = 3000;
const MAX_MS = 3800;
const KEY = "mc.entrySplash.v3";

export default function EntrySplash() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      if (sessionStorage.getItem(KEY) === "done") return false;
      // Respect reduced motion users — skip entirely.
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    } catch {}
    return true;
  });

  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem(KEY, "done"); } catch {}
    const timer = window.setTimeout(() => setShow(false), MIN_MS);
    const hardCap = window.setTimeout(() => setShow(false), MAX_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hardCap);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="entry-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#08070d]"
          style={{ pointerEvents: "none" }}
          aria-hidden="true"
        >
          {/* Animated radial backdrop */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(212,175,55,0.18), rgba(8,7,13,0) 70%), radial-gradient(120% 80% at 50% 100%, rgba(80,40,200,0.18), rgba(8,7,13,0) 70%)",
            }}
          />
          {/* Soft floating particles */}
          <div className="absolute inset-0 opacity-60">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-amber-300/60"
                initial={{
                  x: `${(i * 53) % 100}%`,
                  y: `${(i * 37) % 100}%`,
                  opacity: 0,
                }}
                animate={{ opacity: [0, 1, 0], y: [`${(i * 37) % 100}%`, `${((i * 37) % 100) - 12}%`] }}
                transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div
                className="absolute -inset-10 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(212,175,55,0.45), rgba(212,175,55,0) 65%)",
                  filter: "blur(20px)",
                }}
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="relative h-24 w-24 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-400/30 via-amber-200/10 to-transparent shadow-[0_0_60px_rgba(212,175,55,0.35)] flex items-center justify-center"
              >
                <span
                  className="text-5xl font-black"
                  style={{
                    background: "linear-gradient(180deg,#FFE89A 0%,#D4AF37 60%,#8a6a14 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  ♛
                </span>
              </motion.div>
            </motion.div>

            {/* Wordmark */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-8 text-3xl font-bold tracking-[0.35em] sm:text-4xl"
              style={{
                background: "linear-gradient(180deg,#FFF2C2 0%,#D4AF37 70%,#8a6a14 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MASTERCHESS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-3 text-[11px] uppercase tracking-[0.45em] text-amber-200/70"
            >
              Play · Compete · Improve
            </motion.p>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="mt-10 h-[2px] w-44 overflow-hidden rounded-full bg-amber-300/15"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-amber-300 to-transparent"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
