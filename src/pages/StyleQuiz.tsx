import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";
import { celebrateSideCannons } from "@/lib/celebrate";

type Trait = "aggressive" | "defensive" | "positional" | "creative";

const QUESTIONS: { q: string; options: { label: string; trait: Trait }[] }[] = [
  {
    q: "Your opening on move 1?",
    options: [
      { label: "e4 — straight for the kill", trait: "aggressive" },
      { label: "d4 — slow strangulation", trait: "positional" },
      { label: "Nf3 — keep them guessing", trait: "creative" },
      { label: "c4 — solid as a rock", trait: "defensive" },
    ],
  },
  {
    q: "Opponent offers a knight sacrifice. You…",
    options: [
      { label: "Take it. Always take it.", trait: "aggressive" },
      { label: "Calculate 8 moves deep first", trait: "positional" },
      { label: "Decline and surprise them back", trait: "creative" },
      { label: "Block and consolidate", trait: "defensive" },
    ],
  },
  {
    q: "Endgame with equal material:",
    options: [
      { label: "Push pawns, force the issue", trait: "aggressive" },
      { label: "Maneuver king, improve pieces", trait: "positional" },
      { label: "Find the one weird trick", trait: "creative" },
      { label: "Trade everything to a draw", trait: "defensive" },
    ],
  },
  {
    q: "Your favorite kind of position:",
    options: [
      { label: "Open lines, exposed kings", trait: "aggressive" },
      { label: "Closed center, plans for hours", trait: "positional" },
      { label: "Unbalanced, asymmetric", trait: "creative" },
      { label: "Fortress, no losing chances", trait: "defensive" },
    ],
  },
];

const RESULTS: Record<Trait, { name: string; like: string; color: string; emoji: string }> = {
  aggressive: { name: "The Tactician", like: "Mikhail Tal", color: "text-red-400", emoji: "⚔️" },
  defensive: { name: "The Wall", like: "Tigran Petrosian", color: "text-blue-400", emoji: "🛡️" },
  positional: { name: "The Strategist", like: "Anatoly Karpov", color: "text-emerald-400", emoji: "♟️" },
  creative: { name: "The Artist", like: "Magnus Carlsen", color: "text-violet-400", emoji: "🎨" },
};

export default function StyleQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Trait, number>>({
    aggressive: 0,
    defensive: 0,
    positional: 0,
    creative: 0,
  });
  const [result, setResult] = useState<Trait | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = (trait: Trait) => {
    const next = { ...scores, [trait]: scores[trait] + 1 };
    setScores(next);
    if (step + 1 >= QUESTIONS.length) {
      const top = (Object.keys(next) as Trait[]).reduce((a, b) => (next[a] >= next[b] ? a : b));
      setResult(top);
      setTimeout(() => celebrateSideCannons(), 200);
    } else {
      setStep(step + 1);
    }
  };

  const claim = async () => {
    if (!result) return;
    setLoading(true);
    sessionStorage.setItem("mc_pending_bonus", `style_${result}`);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/play?welcome=quiz&style=${result}` },
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + (result ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <>
      <Seo
        path="/quiz"
        title="What's your chess style? · MasterChess"
        description="Take the 4-question quiz to discover your playing personality. Earn a permanent profile badge."
      />
      <main className="min-h-[100dvh] bg-background flex flex-col px-5 py-8">
        <Link to="/" className="inline-flex items-center gap-2 self-start">
          <Crown className="h-5 w-5 text-primary" />
          <span className="font-display font-bold tracking-wide">
            Master<span className="text-gradient-gold">Chess</span>
          </span>
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Progress */}
            <div className="h-1 w-full rounded-full bg-card/60 mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Question {step + 1} of {QUESTIONS.length}
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                    {QUESTIONS[step].q}
                  </h1>
                  <div className="space-y-2.5 pt-2">
                    {QUESTIONS[step].options.map((opt) => (
                      <motion.button
                        key={opt.label}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => pick(opt.trait)}
                        className="w-full text-left rounded-xl border border-border/50 bg-card/60 backdrop-blur p-4 hover:border-primary/50 hover:bg-card transition-colors text-sm font-medium"
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 22 }}
                  className="text-center space-y-5"
                >
                  <div className="text-6xl">{RESULTS[result].emoji}</div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Your style</div>
                    <h1 className={`font-display text-3xl sm:text-4xl font-bold ${RESULTS[result].color}`}>
                      {RESULTS[result].name}
                    </h1>
                    <p className="text-sm text-muted-foreground pt-2">
                      You play like <span className="text-foreground font-semibold">{RESULTS[result].like}</span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-left space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Unlock your badge
                    </div>
                    <div className="text-sm text-foreground">
                      Save <span className="text-primary font-semibold">{RESULTS[result].name}</span> badge to your profile + claim <span className="text-primary font-semibold">150 coins</span>.
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Button
                      onClick={claim}
                      disabled={loading}
                      className="w-full h-12 bg-white text-gray-900 hover:bg-white/90 font-medium"
                    >
                      <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Claim badge with Google
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/signup?bonus=style&style=${result}`)}
                      className="w-full h-11"
                    >
                      Use email instead
                    </Button>
                    <button
                      onClick={() => {
                        setStep(0);
                        setResult(null);
                        setScores({ aggressive: 0, defensive: 0, positional: 0, creative: 0 });
                      }}
                      className="w-full text-[11px] text-muted-foreground hover:text-foreground py-1"
                    >
                      Retake quiz
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}
