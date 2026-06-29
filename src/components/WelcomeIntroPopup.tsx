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
    // Never block the public entry/home screen for guests. Logged-in new users
    // can still see this once after their profile is ready.
    const userKey = user ? `${STORAGE_KEY_PREFIX}${user.id}` : null;

    if (typeof window === "undefined") return;
    if (!user) return;

    if (!profile || !userKey) return;
    if (localStorage.getItem(userKey)) return;
    const botGames = (profile as any).bot_games_played ?? 0;
    const onlineGames = (profile as any).games_played ?? 0;
    if (botGames + onlineGames > 0) return;

    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [user, profile]);

  const dismiss = () => {
    setOpen(false);
    if (typeof window === "undefined") return;
    if (user) {
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
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#1a0f00] via-zinc-950 to-[#0a0a14] shadow-[0_40px_120px_-20px_rgba(245,158,11,0.5)]"
            initial={{ y: 40, opacity: 0, scale: 0.94, rotateX: -8 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            {/* Animated aurora glows */}
            <motion.div
              className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl"
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-24 -right-12 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl"
              animate={{ opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl"
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Floating chess piece */}
            <motion.div
              className="pointer-events-none absolute right-6 top-6 text-7xl text-amber-400/15 select-none"
              animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              ♛
            </motion.div>

            <button
              onClick={dismiss}
              aria-label="Close welcome"
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-7 sm:p-9">
              <div className="flex items-center gap-2 text-amber-400/90">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Welcome home
                </span>
              </div>

              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl leading-[1.05]">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  MasterChess
                </span>
              </h2>

              {/* Handwritten note from Nikola */}
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] to-transparent p-4">
                <p
                  className="text-[15px] leading-relaxed text-amber-100/90"
                  style={{ fontFamily: "Caveat, cursive", fontSize: "1.05rem", lineHeight: 1.45 }}
                >
                  Hi — I'm <span className="font-bold text-amber-300">Nikola</span>, 13, from Serbia.
                  I built MasterChess because I wanted a place to play chess that feels
                  <em> honest</em>: no engine help, no fake players, no clutter. Just
                  you, a board, and the next move. Hope you stay a while.
                </p>
                <div className="mt-1 text-right text-[11px] uppercase tracking-widest text-amber-400/60">
                  — Nikola Šakotić
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <FeatureRow
                  icon={<Swords className="h-4 w-4" />}
                  title="Play real humans"
                  desc="Rated matches against actual people. Your ELO actually moves."
                  tone="amber"
                />
                <FeatureRow
                  icon={<GraduationCap className="h-4 w-4" />}
                  title="Learn at your pace"
                  desc="Openings, courses, and Stockfish-powered game review."
                  tone="emerald"
                />
                <FeatureRow
                  icon={<Crown className="h-4 w-4" />}
                  title="Earn titles"
                  desc="Climb from Rookie to Singularity by winning games."
                  tone="violet"
                />
              </div>

              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/play"
                  onClick={dismiss}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 py-3 text-center text-sm font-bold text-black shadow-[0_10px_30px_-8px_rgba(245,158,11,0.6)] transition hover:brightness-110 hover:scale-[1.02]"
                >
                  Play your first game →
                </Link>
                <button
                  onClick={dismiss}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
                >
                  Look around
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
  tone = "amber",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone?: "amber" | "emerald" | "violet";
}) {
  const toneMap = {
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  };
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3.5 py-3 transition hover:bg-white/[0.05]">
      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${toneMap[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-zinc-400">{desc}</div>
      </div>
    </div>
  );
}
