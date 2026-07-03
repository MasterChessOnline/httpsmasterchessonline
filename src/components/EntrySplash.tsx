import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Entry splash is an overlay only. It never waits for auth, profile, ratings,
 * notifications, or database calls. The homepage renders underneath instantly.
 */
const SPLASH_MS = 3300;
const FADE_MS = 450;
const HOME_FORCE_MS = 5000;
const KEY = "mc.entrySplash.v5.clean";

function entryLog(label: string, payload?: unknown) {
  try {
    console.info(`[MasterChess Entry] ${label}`, payload ?? "");
  } catch {
    // Entry logging must never affect startup.
  }
}

export default function EntrySplash() {
  const navigate = useNavigate();
  const location = useLocation();
  const dismissedRef = useRef(false);
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(KEY) !== "done";
    } catch {
      return true;
    }
  });
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!show) return;

    const finish = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      try { sessionStorage.setItem(KEY, "done"); } catch { /* ignore */ }
      entryLog("Entry finished");
      try { window.dispatchEvent(new CustomEvent("mc:entry-finished")); } catch { /* ignore */ }
      setClosing(true);
      window.setTimeout(() => setShow(false), FADE_MS);
    };

    dismissedRef.current = false;
    setClosing(false);
    entryLog("Entry started");
    try { window.dispatchEvent(new CustomEvent("mc:entry-started")); } catch { /* ignore */ }

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(finish, reducedMotion ? 250 : SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, [show]);

  useEffect(() => {
    if (!["/", "/home", "/homepage"].includes(location.pathname)) return;
    const force = window.setTimeout(() => {
      const homeReady = document.querySelector('[data-entry-ready="home"]');
      if (!homeReady) {
        entryLog("ERROR_STATE", { step: "HOME_FALLBACK", message: "Homepage not rendered after 5s; forcing /homepage" });
        navigate("/homepage", { replace: true });
      }
      dismissedRef.current = true;
      try { sessionStorage.setItem(KEY, "done"); } catch { /* ignore */ }
      try { window.dispatchEvent(new CustomEvent("mc:entry-finished")); } catch { /* ignore */ }
      setShow(false);
    }, HOME_FORCE_MS);
    return () => window.clearTimeout(force);
  }, [location.pathname, navigate]);

  if (!show) return null;

  return (
    <motion.div
      key="entry-splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-background"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background:
            "radial-gradient(60% 60% at 50% 42%, hsl(var(--primary) / 0.24), transparent 68%), radial-gradient(100% 70% at 50% 100%, hsl(var(--accent) / 0.18), transparent 70%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--background)))",
        }}
      />

      <div className="absolute inset-0 opacity-60">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/65"
            initial={{ x: `${(i * 53) % 100}%`, y: `${(i * 37) % 100}%`, opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [`${(i * 37) % 100}%`, `${((i * 37) % 100) - 12}%`] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center text-center px-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="absolute -inset-10 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.45), transparent 65%)", filter: "blur(20px)" }}
          />
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="relative h-24 w-24 rounded-2xl border border-primary/40 bg-primary/15 shadow-[0_0_60px_hsl(var(--primary)/0.35)] flex items-center justify-center"
          >
            <span className="text-5xl font-black text-primary">♛</span>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-8 text-3xl font-bold tracking-[0.35em] text-primary sm:text-4xl"
        >
          MASTERCHESS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-3 text-[11px] uppercase tracking-[0.35em] text-primary/80"
        >
          DB Chess Cup · Play · Compete
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          className="mt-10 h-[2px] w-44 overflow-hidden rounded-full bg-primary/15"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 bg-primary"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}