// 3-step onboarding tracker for new players. Tracks: play first match, open
// first chest, do first spin. Persisted in localStorage; auto-hides when
// all three are done. Designed for Dashboard placement.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Swords, Gift, Sparkles, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const KEY = "mc:onboarding-v1";
const DISMISS_KEY = "mc:onboarding-dismissed";

type State = { played: boolean; chest: boolean; spin: boolean };

function read(uid: string): State {
  try {
    const raw = localStorage.getItem(`${KEY}:${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { played: false, chest: false, spin: false };
}
function write(uid: string, s: State) {
  localStorage.setItem(`${KEY}:${uid}`, JSON.stringify(s));
}

export default function OnboardingProgressCard() {
  const { user, profile } = useAuth();
  const [state, setState] = useState<State>({ played: false, chest: false, spin: false });
  const [dismissed, setDismissed] = useState(false);

  // Initial load + hydrate from server-side signals
  useEffect(() => {
    if (!user) return;
    const dKey = `${DISMISS_KEY}:${user.id}`;
    if (localStorage.getItem(dKey)) setDismissed(true);

    const initial = read(user.id);
    // Pre-fill "played" from profile counters
    const played =
      initial.played ||
      ((profile as any)?.games_played ?? 0) + ((profile as any)?.bot_games_played ?? 0) > 0;

    // Pre-fill "spin" from daily_spin_claims existence
    supabase
      .from("daily_spin_claims" as any)
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        const spin = initial.spin || ((data as any[]) ?? []).length > 0;
        const next = { played, chest: initial.chest, spin };
        setState(next);
        write(user.id, next);
      });
  }, [user?.id, profile?.user_id, (profile as any)?.games_played, (profile as any)?.bot_games_played]);

  // React to local events (chest opened, spin claimed)
  useEffect(() => {
    if (!user) return;
    const onChest = () => {
      setState((s) => {
        const next = { ...s, chest: true };
        write(user.id, next);
        return next;
      });
    };
    const onSpin = () => {
      setState((s) => {
        const next = { ...s, spin: true };
        write(user.id, next);
        return next;
      });
    };
    window.addEventListener("mc:chest-opened", onChest);
    window.addEventListener("mc:spin-claimed", onSpin);
    return () => {
      window.removeEventListener("mc:chest-opened", onChest);
      window.removeEventListener("mc:spin-claimed", onSpin);
    };
  }, [user?.id]);

  if (!user || dismissed) return null;
  const total = 3;
  const done = (state.played ? 1 : 0) + (state.chest ? 1 : 0) + (state.spin ? 1 : 0);
  const pct = Math.round((done / total) * 100);
  if (done === total) return null;

  const steps: { key: keyof State; label: string; icon: React.ElementType; to: string; cta: string }[] = [
    { key: "played", label: "Play your first match", icon: Swords, to: "/play", cta: "Play now" },
    { key: "chest", label: "Open your first reward chest", icon: Gift, to: "/chests", cta: "Open chest" },
    { key: "spin", label: "Spin the Wheel (free spin)", icon: Sparkles, to: "/spin", cta: "Spin now" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-zinc-950 to-zinc-900 p-5 shadow-[0_0_50px_-15px_rgba(251,191,36,0.4)]"
      >
        <button
          aria-label="Dismiss onboarding"
          onClick={() => {
            localStorage.setItem(`${DISMISS_KEY}:${user.id}`, "1");
            setDismissed(true);
          }}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-bold">Welcome Quest</p>
            <h3 className="font-display text-lg font-bold text-foreground">Get rolling in 3 steps</h3>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-extrabold text-amber-300 tabular-nums">{pct}%</div>
            <div className="text-[10px] text-muted-foreground">{done} / {total}</div>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <ul className="space-y-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const ok = state[s.key];
            return (
              <li key={s.key} className="flex items-center gap-3 rounded-lg border border-amber-500/15 bg-zinc-900/40 px-3 py-2.5">
                {ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <Icon className="w-4 h-4 text-amber-300 shrink-0" />
                <span className={`flex-1 text-sm ${ok ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {s.label}
                </span>
                {!ok && (
                  <Link
                    to={s.to}
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500 text-black hover:bg-amber-400 transition"
                  >
                    {s.cta}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
}
