import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

/**
 * Cinematic, "brutal-luxury" launch splash. Shown once per session when the
 * user opens MasterChess from the home-screen icon (PWA / standalone mode).
 *
 * Layers (bottom → top):
 *  1. Pure black backdrop with two oversized radial spotlights.
 *  2. Animated gold grid scanlines sliding diagonally.
 *  3. Film grain overlay.
 *  4. Large gold King crest with halo + sweep.
 *  5. Stencil wordmark "MASTERCHESS" with split-letter reveal.
 *  6. Tagline + animated tracking line.
 *  7. Twin shutter-wipe exit (top + bottom panels close in).
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
    const isMobile =
      window.matchMedia?.("(max-width: 768px)").matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    // Show on PWA standalone OR mobile browsers (per-session). Never inside the editor iframe.
    if (isInIframe) return;
    if (!isStandalone && !isMobile) return;
    if (sessionStorage.getItem("mc.splash.shown") === "1") return;
    sessionStorage.setItem("mc.splash.shown", "1");
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3600);
    return () => clearTimeout(t);
  }, []);

  const letters = "MASTERCHESS".split("");

  // Flying chess pieces — swoop in from off-screen toward final positions around the crest.
  const flyingPieces = [
    { char: "♞", fromX: -420, fromY: -360, toX: -180, toY: -120, rotate: -540, delay: 0.10, size: 64 },
    { char: "♝", fromX: 460, fromY: -380, toX: 170, toY: -110, rotate: 480, delay: 0.22, size: 58 },
    { char: "♜", fromX: -500, fromY: 320, toX: -190, toY: 130, rotate: -360, delay: 0.34, size: 60 },
    { char: "♛", fromX: 480, fromY: 340, toX: 180, toY: 140, rotate: 420, delay: 0.46, size: 68 },
    { char: "♟", fromX: 0, fromY: -460, toX: 0, toY: -210, rotate: 720, delay: 0.58, size: 42 },
    { char: "♞", fromX: 520, fromY: 40, toX: 230, toY: 20, rotate: -420, delay: 0.70, size: 50 },
    { char: "♝", fromX: -520, fromY: 60, toX: -230, toY: 30, rotate: 540, delay: 0.82, size: 52 },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          {/* Spotlights */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.04) 35%, transparent 65%), radial-gradient(circle at 50% 85%, rgba(201,168,76,0.10) 0%, transparent 55%)",
            }}
          />

          {/* Diagonal gold scanlines */}
          <motion.div
            aria-hidden
            className="absolute inset-[-20%] pointer-events-none opacity-30"
            style={{
              background:
                "repeating-linear-gradient(135deg, rgba(251,191,36,0.10) 0px, rgba(251,191,36,0.10) 1px, transparent 1px, transparent 14px)",
            }}
            initial={{ x: -80, y: -80 }}
            animate={{ x: 80, y: 80 }}
            transition={{ duration: 2, ease: "linear" }}
          />

          {/* Film grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Top + bottom hairlines */}
          <motion.div
            className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          />
          <motion.div
            className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          />

          {/* Chess board assembling — 64 squares cascade in diagonally */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ rotateX: 55, rotateZ: -8, scale: 0.85, opacity: 0 }}
            animate={{ rotateX: 55, rotateZ: -8, scale: 1, opacity: 0.55 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.35 } }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
          >
            <div
              className="grid grid-cols-8 gap-0 rounded-md overflow-hidden border border-amber-300/20 shadow-[0_40px_120px_-20px_rgba(251,191,36,0.45)]"
              style={{
                width: "min(70vw, 420px)",
                height: "min(70vw, 420px)",
              }}
            >
              {Array.from({ length: 64 }).map((_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const dark = (row + col) % 2 === 1;
                // Diagonal stagger: squares closer to top-left land first.
                const delay = (row + col) * 0.035;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -40, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                      delay,
                    }}
                    className={
                      dark
                        ? "bg-gradient-to-br from-[#3a2a14] to-[#1a0f05]"
                        : "bg-gradient-to-br from-[#d9b876] to-[#a8854a]"
                    }
                  />
                );
              })}
            </div>
            {/* Gold floor reflection */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-10 h-16 w-3/4 rounded-[50%] blur-2xl bg-amber-400/30"
              aria-hidden
            />
          </motion.div>

          {/* Flying chess pieces — swoop in from off-screen, settle, then linger */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden>
            {flyingPieces.map((p, i) => (
              <motion.span
                key={i}
                className="absolute select-none text-amber-300"
                style={{
                  fontSize: p.size,
                  lineHeight: 1,
                  filter: "drop-shadow(0 6px 24px rgba(251,191,36,0.55)) drop-shadow(0 0 12px rgba(251,191,36,0.35))",
                  textShadow: "0 0 14px rgba(251,191,36,0.6)",
                  left: 0,
                  top: 0,
                }}
                initial={{ x: p.fromX, y: p.fromY, rotate: 0, scale: 0.4, opacity: 0 }}
                animate={{
                  x: [p.fromX, p.toX, p.toX + (i % 2 === 0 ? -8 : 8)],
                  y: [p.fromY, p.toY, p.toY - 6],
                  rotate: [0, p.rotate, p.rotate],
                  scale: [0.4, 1.1, 1],
                  opacity: [0, 1, 1],
                }}
                transition={{
                  duration: 2.6,
                  times: [0, 0.55, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: p.delay,
                }}
              >
                {p.char}
              </motion.span>
            ))}
          </div>

          {/* Content */}
          <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
            {/* Crown crest */}
            <motion.div
              className="relative"
              initial={{ scale: 0.55, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 170, damping: 13 }}
            >
              <div className="absolute -inset-8 blur-3xl bg-amber-400/40 rounded-full" />
              <div className="absolute -inset-2 rounded-3xl border border-amber-300/30" />
              <div className="relative h-28 w-28 rounded-3xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-200/15 via-amber-500/10 to-black flex items-center justify-center shadow-[0_30px_80px_-10px_rgba(251,191,36,0.6)]">
                {/* sweep highlight */}
                <motion.div
                  className="absolute inset-0 overflow-hidden rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <motion.div
                    className="absolute top-0 -left-1/2 h-full w-1/2 bg-gradient-to-r from-transparent via-amber-200/45 to-transparent skew-x-12"
                    initial={{ x: "-100%" }}
                    animate={{ x: "260%" }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                  />
                </motion.div>
                <Crown className="relative h-14 w-14 text-amber-200 drop-shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
              </div>
            </motion.div>

            {/* Wordmark — letter-by-letter stencil reveal */}
            <div className="mt-8 flex items-end gap-[1px] sm:gap-[2px] select-none">
              {letters.map((ch, i) => (
                <motion.span
                  key={i}
                  className="font-display font-black text-[clamp(2rem,9vw,4rem)] leading-none uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600"
                  style={{ letterSpacing: "0.04em" }}
                  initial={{ y: 28, opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.25 + i * 0.035,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {/* Tagline */}
            <motion.div
              className="mt-3 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
            >
              <span className="h-px w-8 bg-amber-300/40" />
              <span className="font-display text-[10px] sm:text-xs uppercase tracking-[0.45em] text-amber-200/70">
                Play · Compete · Master
              </span>
              <span className="h-px w-8 bg-amber-300/40" />
            </motion.div>

            {/* Tracking bar */}
            <motion.div
              className="absolute bottom-16 h-[2px] w-44 overflow-hidden rounded-full bg-amber-300/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-amber-300 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "220%" }}
                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Shutter wipe exit — top */}
          <motion.div
            className="absolute inset-x-0 top-0 bg-black z-10 pointer-events-none"
            initial={{ height: 0 }}
            exit={{ height: "52%", transition: { duration: 0.45, ease: [0.7, 0, 0.3, 1] } }}
          />
          {/* Shutter wipe exit — bottom */}
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-black z-10 pointer-events-none"
            initial={{ height: 0 }}
            exit={{ height: "52%", transition: { duration: 0.45, ease: [0.7, 0, 0.3, 1] } }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
