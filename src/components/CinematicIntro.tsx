import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Coins, Crown, Sparkles, LogIn, UserPlus, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "mc:cinematic-intro:seen";

/**
 * One-time cinematic launch screen shown to brand-new visitors.
 * - Sign Up is the dominant CTA (offers 500 starting coins)
 * - Skips for signed-in users
 * - Skips inside editor iframe
 */
export default function CinematicIntro() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<0 | 1>(0); // 0=splash, 1=choices

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    // skip inside editor iframe
    try { if (window.self !== window.top) return; } catch { return; }
    const t = setTimeout(() => setOpen(true), 250);
    const advance = setTimeout(() => setStage(1), 2200);
    return () => { clearTimeout(t); clearTimeout(advance); };
  }, [user]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[400] overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Spotlight */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(251,191,36,0.22) 0%, rgba(251,191,36,0.05) 35%, transparent 65%), radial-gradient(circle at 50% 90%, rgba(201,168,76,0.12) 0%, transparent 55%)",
            }}
          />
          {/* Animated grid scanlines */}
          <motion.div
            aria-hidden
            className="absolute inset-0 opacity-25 pointer-events-none"
            initial={{ backgroundPositionY: 0 }}
            animate={{ backgroundPositionY: ["0%", "100%"] }}
            transition={{ duration: 14, ease: "linear", repeat: Infinity }}
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(251,191,36,0.18) 0 1px, transparent 1px 24px)",
            }}
          />
          {/* Floating pieces */}
          {["♞", "♝", "♜", "♛", "♟"].map((c, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="absolute text-amber-300/15 select-none"
              style={{ fontSize: `${48 + i * 18}px`, left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 22}%` }}
              animate={{ y: [0, -16, 0], rotate: [0, 6, -4, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            >
              {c}
            </motion.div>
          ))}

          {/* Splash crest */}
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="splash"
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.08, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ scale: 0.4, rotateY: -180, opacity: 0 }}
                  animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Crown className="h-28 w-28 text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]" strokeWidth={1.5} />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-amber-400/20 blur-3xl"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 16, letterSpacing: "0.6em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.25em" }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 font-display text-3xl md:text-5xl font-bold bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent uppercase"
                >
                  MasterChess
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.9 }}
                  className="mt-2 text-xs uppercase tracking-[0.4em] text-amber-300/70"
                >
                  Live
                </motion.p>
              </motion.div>
            )}

            {stage === 1 && (
              <motion.div
                key="choices"
                className="absolute inset-0 flex flex-col items-center justify-center px-5"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Crown className="h-10 w-10 text-amber-400/80 mb-3" strokeWidth={1.5} />
                <h2 className="font-display text-2xl md:text-4xl font-bold text-white text-center leading-tight">
                  Welcome to{" "}
                  <span className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                    MasterChess
                  </span>
                </h2>
                <p className="mt-2 text-sm text-zinc-400 text-center max-w-sm">
                  Real humans. Real ratings. Real rewards.
                </p>

                <div className="mt-7 w-full max-w-sm space-y-3">
                  {/* DOMINANT: Sign Up + 500 coins */}
                  <Link
                    to="/signup"
                    onClick={dismiss}
                    className="group relative block rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-[2px] shadow-[0_20px_60px_-10px_rgba(251,191,36,0.55)] transition-transform active:scale-[0.98]"
                  >
                    <div className="rounded-2xl bg-black/30 backdrop-blur-sm px-5 py-4 flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-amber-400/20 flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-amber-100" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-base font-bold text-amber-100">Sign Up & Get 500 Coins</div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-200/90">
                          <Coins className="h-3 w-3" />
                          <span>Free starter pack · unlock boards & pieces</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-amber-200 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* Secondary: Log In */}
                  <Link
                    to="/login"
                    onClick={dismiss}
                    className="block rounded-2xl border border-amber-500/30 bg-white/[0.04] backdrop-blur px-5 py-3 text-sm font-medium text-amber-100 hover:bg-white/[0.08] transition"
                  >
                    <div className="flex items-center gap-3">
                      <LogIn className="h-4 w-4 text-amber-300" />
                      <span>Log In</span>
                    </div>
                  </Link>

                  {/* Tertiary: Guest */}
                  <button
                    onClick={dismiss}
                    className="block w-full rounded-2xl px-5 py-3 text-xs text-zinc-400 hover:text-white transition"
                  >
                    Continue as Guest →
                  </button>
                </div>

                <p
                  className="mt-6 max-w-sm text-center text-[13px] text-amber-100/70"
                  style={{ fontFamily: "Caveat, cursive", fontSize: "1.05rem", lineHeight: 1.4 }}
                >
                  "I built this so you'd actually want to come back. — Nikola, 13"
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-amber-400/60">
                  <Sparkles className="h-3 w-3" /> No bots pretending to be players
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
