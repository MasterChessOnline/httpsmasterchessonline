import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Flame, Gift, Play, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";

const STORAGE_KEY = "mc_ig_intro_seen_v1";
const FRAME_MS = 2600;

type Frame = {
  icon: typeof Crown;
  title: string;
  line: string;
};

/**
 * INTRO REEL for paid social traffic (/ig, /start, /ads/:variant).
 * A story-style, auto-advancing 4-frame intro that plays like a short video:
 * it explains the site in 10 seconds, ends on the two only actions that matter
 * (play the free game, or create the free account) and never blocks a returning
 * visitor — it is shown once per browser session.
 */
const FRAMES: Frame[] = [
  {
    icon: Crown,
    title: "Welcome to MasterChess",
    line: "Real chess, real people. No ads in your game, no clutter.",
  },
  {
    icon: Play,
    title: "Your first game is free",
    line: "Tap a piece and you're playing. No account needed to start.",
  },
  {
    icon: Trophy,
    title: "A free account saves everything",
    line: "Your rating, your history and online opponents — in 10 seconds.",
  },
  {
    icon: Flame,
    title: "Come back every day",
    line: "Daily streak, missions and coins grow every day you play.",
  },
];

interface IgIntroReelProps {
  /** Called when the intro finishes or is skipped. */
  onDone: () => void;
  /** Play the free game right away. */
  onPlay: () => void;
  /** Start the free-account flow. */
  onSignup: () => void;
  surface?: string;
}

export function hasSeenIgIntro() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export default function IgIntroReel({
  onDone,
  onPlay,
  onSignup,
  surface = "ad-landing",
}: IgIntroReelProps) {
  const [index, setIndex] = useState(0);
  const last = index === FRAMES.length - 1;

  useEffect(() => {
    track("ig_intro_start", { surface });
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode */
    }
  }, [surface]);

  useEffect(() => {
    if (last) return;
    const t = setTimeout(() => setIndex((i) => i + 1), FRAME_MS);
    return () => clearTimeout(t);
  }, [index, last]);

  const finish = (reason: string) => {
    track("ig_intro_done", { surface, reason, frame: index + 1 });
    onDone();
  };

  const Icon = FRAMES[index].icon;

  return (
    <motion.div
      data-testid="ig-intro-reel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex flex-col bg-background/95 backdrop-blur-xl"
    >
      {/* Story progress bars */}
      <div className="flex gap-1.5 px-4 pt-4">
        {FRAMES.map((f, i) => (
          <div key={f.title} className="h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: i < index ? "100%" : 0 }}
              animate={{ width: i < index ? "100%" : i === index ? "100%" : 0 }}
              transition={{ duration: i === index && !last ? FRAME_MS / 1000 : 0.2, ease: "linear" }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 pt-3">
        <span className="inline-flex items-center gap-2 font-display text-sm font-bold tracking-wide">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
            <Crown className="h-3.5 w-3.5 text-primary" />
          </span>
          Master<span className="-ml-2 text-gradient-gold">Chess</span>
        </span>
        <button
          onClick={() => finish("skip")}
          className="text-[11px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Skip intro
        </button>
      </div>

      {/* Frame */}
      <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="max-w-sm space-y-4"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/30 bg-primary/15">
              <Icon className="h-7 w-7 text-primary" />
            </span>
            <h2 className="font-display text-2xl font-black leading-tight sm:text-3xl">
              {FRAMES[index].title}
            </h2>
            <p className="text-sm text-muted-foreground">{FRAMES[index].line}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions — account first, free game second. */}
      <div className="mx-auto w-full max-w-sm space-y-2.5 px-6 pb-8">
        <Button
          onClick={() => {
            track("ig_intro_signup", { surface, frame: index + 1 });
            onSignup();
          }}
          className="h-12 w-full font-display text-base font-black tracking-wide shadow-glow"
        >
          <Gift className="mr-2 h-4 w-4" />
          Create free account
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            track("ig_intro_play", { surface, frame: index + 1 });
            onPlay();
          }}
          className="h-11 w-full border-primary/30"
        >
          <Play className="mr-2 h-4 w-4 text-primary" />
          Play my free game first
        </Button>
        <p className="inline-flex w-full items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Free forever · daily streak rewards
        </p>
      </div>
    </motion.div>
  );
}
