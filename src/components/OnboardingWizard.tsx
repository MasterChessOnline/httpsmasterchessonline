import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Users, X } from "lucide-react";
import { toast } from "sonner";

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "Just learning the rules" },
  { value: "intermediate", label: "Intermediate", desc: "I play regularly" },
  { value: "advanced", label: "Advanced", desc: "Tournament-level" },
];

const OPENINGS = [
  { value: "italian", label: "Italian Game" },
  { value: "sicilian", label: "Sicilian Defense" },
  { value: "london", label: "London System" },
  { value: "kings_indian", label: "King's Indian" },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [skill, setSkill] = useState<string>("");
  const [opening, setOpening] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data && !data.onboarding_completed) {
        // tiny delay so it doesn't fight the splash
        setTimeout(() => setOpen(true), 1200);
      }
    })();
  }, [user]);

  const finish = async (inviteAction?: "invite" | "skip") => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        skill_level: skill || null,
        favorite_opening: opening || null,
      })
      .eq("user_id", user.id);
    setSaving(false);
    setOpen(false);
    toast.success("Welcome aboard! 🎉");
    if (inviteAction === "invite") navigate("/referrals");
    else if (skill === "beginner") navigate("/lessons");
    else navigate("/play");
  };

  const dismiss = async () => {
    if (user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={dismiss}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-6 shadow-2xl"
          style={{
            boxShadow:
              "0 0 60px hsl(45 100% 50% / 0.15), inset 0 1px 0 hsl(45 100% 60% / 0.1)",
          }}
        >
          <button
            onClick={dismiss}
            className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex items-center gap-2 text-yellow-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest">
              Step {step + 1} / 3
            </span>
          </div>

          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <h2 className="mb-2 text-2xl font-bold text-white">
                What's your level?
              </h2>
              <p className="mb-5 text-sm text-zinc-400">
                We'll tailor lessons and matches for you.
              </p>
              <div className="space-y-2">
                {SKILL_LEVELS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSkill(s.value)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      skill === s.value
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    <div className="font-semibold text-white">{s.label}</div>
                    <div className="text-xs text-zinc-400">{s.desc}</div>
                  </button>
                ))}
              </div>
              <Button
                disabled={!skill}
                onClick={() => setStep(1)}
                className="mt-5 w-full bg-yellow-500 text-black hover:bg-yellow-400"
              >
                Next
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">
                  Favorite opening?
                </h2>
              </div>
              <p className="mb-5 text-sm text-zinc-400">
                Pick one — we'll add it to your repertoire.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {OPENINGS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setOpening(o.value)}
                    className={`rounded-xl border p-3 text-sm transition ${
                      opening === o.value
                        ? "border-yellow-500 bg-yellow-500/10 text-white"
                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep(0)}
                  className="flex-1 text-zinc-400"
                >
                  Back
                </Button>
                <Button
                  disabled={!opening}
                  onClick={() => setStep(2)}
                  className="flex-1 bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">
                  Invite a friend?
                </h2>
              </div>
              <p className="mb-5 text-sm text-zinc-400">
                You both get <span className="text-yellow-400">100 coins</span>{" "}
                when they play their first game.
              </p>
              <div className="space-y-2">
                <Button
                  disabled={saving}
                  onClick={() => finish("invite")}
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  Get my invite link →
                </Button>
                <Button
                  variant="ghost"
                  disabled={saving}
                  onClick={() => finish("skip")}
                  className="w-full text-zinc-400"
                >
                  Maybe later
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
