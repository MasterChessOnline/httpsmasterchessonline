import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Crown, Flame, Coins, Zap, Bot, Globe2, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCoinBalance } from "@/hooks/use-coin-balance";

/**
 * Quick entry dashboard — the third beat of the entry experience.
 *
 *   AppLaunchSplash (0–1.6s, mobile/standalone only)
 *   ↓
 *   CSS chessboard zoom (handled here, ~0.5s reveal)
 *   ↓
 *   Glassmorphic stat strip with three CTAs:
 *     ← Profile + rating       Coins (animated)       Win streak + level →
 *     [ PLAY ONLINE ]  [ PLAY VS BOT ]  [ ENTER HOME ]
 *
 * Shows ONCE per browser session on "/" for authenticated users. Auto-dismisses
 * after 9s of inactivity so it never blocks the user, and is fully skippable
 * via the X button or "Enter Home".
 */
const SESSION_KEY = "mc.entryDash.shown.v1";

export default function EntryQuickDashboard() {
  const { user, profile, loading } = useAuth();
  const { balance } = useCoinBalance();
  const navigate = useNavigate();
  const location = useLocation();

  const [visible, setVisible] = useState(false);
  const [animatedCoins, setAnimatedCoins] = useState(0);

  // Decide whether to mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading) return;
    if (!user) return;
    if (location.pathname !== "/") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch { /* ignore */ }

    // Skip inside the Lovable editor iframe to avoid blocking previews.
    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    if (inIframe) return;

    // Wait for the splash to finish on mobile/standalone before slotting in.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari standalone flag
      window.navigator.standalone === true;
    const isMobile =
      window.matchMedia?.("(max-width: 768px)").matches ||
      /Android|Mobile/i.test(navigator.userAgent || "");
    const splashDelay = isStandalone || isMobile ? 1700 : 250;

    const t = setTimeout(() => {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      setVisible(true);
    }, splashDelay);
    return () => clearTimeout(t);
  }, [user, loading, location.pathname]);

  // Auto-dismiss after 9s of doing nothing.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 9000);
    return () => clearTimeout(t);
  }, [visible]);

  // Animate the coin counter from 0 → balance once it appears.
  useEffect(() => {
    if (!visible || balance == null) return;
    const target = Math.max(0, Math.floor(balance));
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedCoins(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, balance]);

  const rating = (profile as any)?.rating ?? 1200;
  const winStreak = (profile as any)?.win_streak ?? 0;
  const totalXp = (profile as any)?.total_xp ?? 0;
  const level = useMemo(() => Math.max(1, Math.floor(totalXp / 100) + 1), [totalXp]);
  const xpInLevel = totalXp % 100;
  const displayName = profile?.display_name || profile?.username || "Player";
  const avatar = profile?.avatar_url;

  const dismiss = (target?: string) => {
    setVisible(false);
    if (target) {
      // Tiny delay so the exit animation can start before route change.
      setTimeout(() => navigate(target), 180);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 70%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={(e) => {
            // Click outside the card dismisses.
            if (e.target === e.currentTarget) setVisible(false);
          }}
        >
          {/* Floating particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-amber-300/50"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  filter: "drop-shadow(0 0 6px rgba(251,191,36,0.7))",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], y: [-10, -60], scale: [0.5, 1, 0.4] }}
                transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ y: 60, scale: 0.92, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 40, scale: 0.95, opacity: 0, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-full max-w-md rounded-3xl border border-amber-300/25 shadow-[0_30px_120px_-10px_rgba(251,191,36,0.35)]"
            style={{
              background:
                "linear-gradient(160deg, rgba(28,20,8,0.95) 0%, rgba(10,7,3,0.97) 100%)",
            }}
          >
            {/* Close */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setVisible(false)}
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-amber-200/60 hover:text-amber-200 hover:bg-amber-300/10 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Gold sweep */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
              aria-hidden
            >
              <motion.div
                className="absolute top-0 -left-1/2 h-full w-1/2 bg-gradient-to-r from-transparent via-amber-200/15 to-transparent skew-x-12"
                initial={{ x: "-100%" }}
                animate={{ x: "260%" }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.35 }}
              />
            </div>

            <div className="relative p-5 sm:p-6">
              {/* Greeting */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-amber-400/40 blur-md" />
                  <div className="relative h-11 w-11 rounded-full border-2 border-amber-300/60 bg-gradient-to-br from-amber-200/20 to-black overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Crown className="h-5 w-5 text-amber-200" />
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
                    Welcome back
                  </div>
                  <div className="text-base font-semibold text-amber-50 truncate">
                    {displayName}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[10px] uppercase tracking-widest text-amber-200/60">
                    Rating
                  </div>
                  <div className="text-base font-bold text-amber-100 tabular-nums">
                    {rating}
                  </div>
                </div>
              </div>

              {/* Stat triplet */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <Stat
                  icon={<Coins className="h-4 w-4" />}
                  label="Coins"
                  value={animatedCoins.toLocaleString()}
                  highlight
                />
                <Stat
                  icon={<Flame className="h-4 w-4" />}
                  label="Streak"
                  value={String(winStreak)}
                />
                <Stat
                  icon={<Zap className="h-4 w-4" />}
                  label={`Lvl ${level}`}
                  value={`${xpInLevel}/100 XP`}
                  progress={xpInLevel}
                />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <CTA
                  label="Play Online"
                  icon={<Globe2 className="h-4 w-4" />}
                  onClick={() => dismiss("/play")}
                  primary
                />
                <CTA
                  label="Play vs Bot"
                  icon={<Bot className="h-4 w-4" />}
                  onClick={() => dismiss("/bots")}
                />
              </div>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="mt-2 w-full text-center text-[11px] uppercase tracking-[0.3em] text-amber-200/60 hover:text-amber-100 transition flex items-center justify-center gap-1.5 py-2"
              >
                Enter Home <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  progress?: number;
}) {
  return (
    <div
      className={`relative rounded-xl border px-2.5 py-2.5 text-center overflow-hidden ${
        highlight
          ? "border-amber-300/50 bg-gradient-to-br from-amber-500/15 to-amber-900/20 shadow-[0_0_24px_-6px_rgba(251,191,36,0.55)]"
          : "border-amber-300/15 bg-black/40"
      }`}
    >
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.18em] text-amber-200/70">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-base font-bold text-amber-50 tabular-nums leading-tight">
        {value}
      </div>
      {typeof progress === "number" && (
        <div className="mt-1.5 h-1 w-full rounded-full bg-amber-300/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-200"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}

function CTA({
  label,
  icon,
  onClick,
  primary,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm uppercase tracking-wider transition-all active:scale-[0.97] ${
        primary
          ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-[0_10px_30px_-8px_rgba(251,191,36,0.8)] hover:shadow-[0_14px_40px_-6px_rgba(251,191,36,0.95)]"
          : "border border-amber-300/30 bg-black/40 text-amber-100 hover:bg-amber-300/10 hover:border-amber-300/60"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
