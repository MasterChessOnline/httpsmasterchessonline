import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Swords, Wifi, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getPendingProfile, clearPendingProfile } from "@/components/auth/GoogleCountryNameModal";

const PUBLIC_PATHS = new Set([
  "/login", "/signup", "/forgot-password", "/reset-password",
  "/about", "/privacy", "/terms", "/contact",
]);

const SEEN_KEY = "mc:welcome-gate-seen";

/**
 * Forces unauthenticated visitors to sign up / log in via a full-screen
 * welcome screen. Replaces the old WelcomeIntroPopup that only fired
 * after login. Skips public auth/info routes.
 *
 * Also: when a user completes Google sign-in with pending country/name
 * (set by GoogleCountryNameModal), we apply that to their profile here.
 */
export default function AuthGate() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  // Apply pending profile after a successful Google OAuth round-trip.
  useEffect(() => {
    if (!user) return;
    const pending = getPendingProfile();
    if (!pending) return;
    (async () => {
      try {
        await supabase.from("profiles")
          .update({ display_name: pending.display_name, country: pending.country })
          .eq("user_id", user.id);
      } catch {/* ignore */}
      clearPendingProfile();
    })();
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (user) { setShow(false); return; }
    const isPublic = PUBLIC_PATHS.has(location.pathname);
    setShow(!isPublic);
  }, [user, loading, location.pathname]);

  // Mark seen so we don't bombard with animations if they bounce around
  useEffect(() => {
    if (show) {
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    }
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-zinc-950 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />

        <motion.div
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-primary/30 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_30px_120px_-20px_hsl(var(--primary)/0.5)]"
          initial={{ y: 30, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />

          <div className="relative p-6 sm:p-10">
            <div className="flex items-center justify-center gap-2 text-primary mb-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Welcome</span>
            </div>

            <h1 className="text-center font-display text-3xl sm:text-5xl font-bold leading-tight">
              Step into{" "}
              <span className="bg-gradient-to-r from-primary via-yellow-300 to-primary bg-clip-text text-transparent">
                MasterChess
              </span>
            </h1>
            <p className="mt-3 text-center text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Real games. Real ratings. Battle bots, climb online, and master your craft —
              all in one cinematic chess world.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Swords, title: "Play vs Bots", desc: "9 unique personalities, 400-2000 ELO" },
                { icon: Wifi, title: "Online Matches", desc: "Live opponents, real ELO" },
                { icon: Crown, title: "Climb Titles", desc: "Rookie → Singularity" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <div className="text-sm font-semibold text-foreground">{title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/signup")}
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow text-base"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Sign up free
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="flex-1 h-12 border-primary/40 hover:bg-primary/10 text-foreground text-base"
              >
                <LogIn className="mr-2 h-4 w-4" /> Log in
              </Button>
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground/80">
              By continuing you agree to our{" "}
              <Link to="/terms" className="underline hover:text-primary">Terms</Link> and{" "}
              <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
