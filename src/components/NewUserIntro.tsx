// Post-signup welcome intro. Fires on the homepage when a brand-new account
// lands there via ?welcome=1 — a short guided tour of what the site does and
// where things live in the navbar, instead of dropping the player into a game.
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Swords, Trophy, GraduationCap, Users, ChevronRight, X, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/track";

const FLAG = "mc:new-user-intro-seen";

const STEPS = [
  {
    icon: Crown,
    title: "Welcome to MasterChess",
    body:
      "Your free account is ready. You keep your rating, your games and your streak — forever, no ads, no subscription.",
    bullets: ["500 coins already in your wallet", "Real rating from your first game"],
  },
  {
    icon: Swords,
    title: "Play — bots or real people",
    body:
      "Play in the navbar: pick a bot from 400 to 3500 rating for practice, or jump into a live game against a real opponent.",
    bullets: ["Bots are instant, 24/7", "Live games use real ELO"],
  },
  {
    icon: GraduationCap,
    title: "Learn while you play",
    body:
      "Learn holds openings, daily puzzles and lessons. Everything is playable — you learn by making moves, not by reading walls of text.",
    bullets: ["Daily puzzle for your streak", "Opening trainer with variations"],
  },
  {
    icon: Trophy,
    title: "Compete & community",
    body:
      "Compete has tournaments, arenas and the leaderboard. Community is where profiles, clans and chess moments live.",
    bullets: ["Prime Time every day at 20:00", "Free tournaments, real prizes"],
  },
];

export default function NewUserIntro() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (params.get("welcome") !== "1") return;
    const key = `${FLAG}:${user.id}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {/* ignore */}
    setOpen(true);
    track("new_user_intro_open", { surface: "home" });
  }, [user?.id, params]);

  const close = () => {
    if (user) {
      try { localStorage.setItem(`${FLAG}:${user.id}`, "1"); } catch {/* ignore */}
    }
    setOpen(false);
    const next = new URLSearchParams(params);
    next.delete("welcome");
    setParams(next, { replace: true });
  };

  const finish = () => {
    track("new_user_intro_finish", { surface: "home" });
    close();
  };

  const startPlaying = () => {
    track("new_user_intro_play", { surface: "home" });
    close();
    navigate("/play");
  };

  const current = STEPS[step];
  const Icon = current?.icon ?? Crown;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[280] flex items-center justify-center bg-background/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/30 bg-card/95 p-6 shadow-glow"
          >
            <button
              type="button"
              onClick={finish}
              aria-label="Close intro"
              className="absolute right-4 top-4 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
              <Icon className="h-5 w-5 text-primary" />
            </span>

            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3 w-3" /> Step {step + 1} of {STEPS.length}
            </div>

            <h2 className="font-display text-2xl font-black leading-tight text-foreground">
              {current.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{current.body}</p>

            <ul className="mt-4 space-y-1.5">
              {current.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-foreground/90">
                  <Users className="h-3.5 w-3.5 text-primary" /> {b}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <span
                  key={s.title}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {isLast ? (
                <Button onClick={startPlaying} className="h-12 w-full font-display font-bold uppercase tracking-widest">
                  <Swords className="mr-2 h-4 w-4" /> Play my first game
                </Button>
              ) : (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="h-12 w-full font-display font-bold uppercase tracking-widest"
                >
                  Next <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
              <button
                type="button"
                onClick={finish}
                className="text-center text-[11px] text-muted-foreground underline underline-offset-4"
              >
                Look around the homepage first
              </button>
              <Link
                to="/profile"
                onClick={finish}
                className="text-center text-[11px] text-muted-foreground/80 hover:text-primary"
              >
                Finish my profile
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
