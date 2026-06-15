import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "mc_exit_intent_shown_v1";
// Only fire on funnel routes where exit = lost conversion
const ALLOWED_ROUTES = ["/", "/ig", "/start", "/play-guest", "/signup", "/login"];

export default function ExitIntentModal() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (!ALLOWED_ROUTES.includes(location.pathname)) return;

    // RULE: never interrupt a casual visitor before they've played at least one game.
    // Mobile users on home see a signup gate before doing anything → instant bounce.
    // We only fire exit-intent AFTER the guest has finished at least 1 local game.
    const gamesPlayed = Number(localStorage.getItem("mc_guest_games_played") || "0");
    if (gamesPlayed < 1) return;

    // Desktop only: real mouse-leave intent. No mobile timed popup.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const trigger = () => {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
    };

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => document.documentElement.removeEventListener("mouseleave", onLeave);
  }, [user, location.pathname]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem("mc_pending_bonus", "exit_500");
      const redirectUrl = `${window.location.origin}/play?welcome=exit`;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = () => {
    sessionStorage.setItem("mc_pending_bonus", "exit_500");
    setOpen(false);
    navigate("/signup?bonus=exit");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-primary/40 bg-card p-7 shadow-2xl text-center space-y-5"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 border border-primary/30 mx-auto">
              <Gift className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Wait — don't leave empty-handed
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign up in 10 seconds and instantly get
                <span className="block mt-2 text-primary font-semibold text-base">
                  500 coins + Founder badge
                </span>
              </p>
            </div>

            <div className="space-y-2.5">
              <Button
                className="w-full h-11 bg-white text-gray-900 hover:bg-white/90 font-medium"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Claim with Google
              </Button>
              <Button variant="outline" className="w-full h-11" onClick={handleEmail}>
                Use email instead
              </Button>
              <button
                onClick={() => setOpen(false)}
                className="w-full text-[11px] text-muted-foreground hover:text-foreground py-2"
              >
                No thanks, I don't want free coins
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
