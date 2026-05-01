import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Swords, GraduationCap, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY_PREFIX = "mc:welcome-seen:";

/**
 * One-time welcome / introduction shown to brand-new users right after sign-up.
 *
 * Replaces the old behavior where the "Bot Hunter" title popped up the
 * instant a user signed in (because the default bot_rating already
 * exceeded the first threshold). Titles now wait until the user has
 * played at least one game; new players see this short tour instead.
 */
export default function WelcomeIntroPopup() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
    if (typeof window !== "undefined" && localStorage.getItem(storageKey)) return;

    const botGames = (profile as any).bot_games_played ?? 0;
    const onlineGames = (profile as any).games_played ?? 0;

    // Only for brand-new users with zero games played.
    if (botGames + onlineGames > 0) return;

    // Tiny delay so the page paints first — feels like a gentle reveal.
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [user, profile]);

  const dismiss = () => {
    setOpen(false);
    if (user && typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, "1");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_30px_80px_-20px_rgba(245,158,11,0.35)]"
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            {/* Soft gold glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

            <button
              onClick={dismiss}
              aria-label="Close welcome"
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-7 sm:p-8">
              <div className="flex items-center gap-2 text-amber-400/90">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Welcome aboard
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  MasterChess
                </span>
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                A clean, focused home for real human chess. Here's a quick
                tour of what you can do — your first title unlocks once you
                start playing.
              </p>

              <div className="mt-6 space-y-2.5">
                <FeatureRow
                  icon={<Swords className="h-4 w-4" />}
                  title="Play"
                  desc="Challenge bots or jump into an online match."
                />
                <FeatureRow
                  icon={<GraduationCap className="h-4 w-4" />}
                  title="Learn"
                  desc="Openings, courses, and game review at your pace."
                />
                <FeatureRow
                  icon={<Crown className="h-4 w-4" />}
                  title="Earn titles"
                  desc="Climb from Rookie to Singularity by winning games."
                />
              </div>

              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/play"
                  onClick={dismiss}
                  className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-center text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Play your first game
                </Link>
                <button
                  onClick={dismiss}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
                >
                  Look around first
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3.5 py-3">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-300">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-zinc-400">{desc}</div>
      </div>
    </div>
  );
}
