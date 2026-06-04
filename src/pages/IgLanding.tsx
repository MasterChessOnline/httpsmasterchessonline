import Seo from "@/components/Seo";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Play, Users, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useEffect, useState } from "react";
import LiveSocialProof from "@/components/LiveSocialProof";

/**
 * Mobile-first single-screen landing for Instagram bio traffic.
 * One decision: Play Now (no signup) or Continue with Google.
 * No Navbar, no Footer, no other widgets — optimized for <2s LCP and 1 CTA.
 */
export default function IgLanding() {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Tag visit so future analytics can split IG traffic. Reuses the global
  // ReferralTracker (?ref=ig) if present; otherwise marks the session.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("ref")) {
        localStorage.setItem("mc_ig_session", "1");
      }
    } catch { /* noop */ }
  }, []);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) setGoogleLoading(false);
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-gradient-to-b from-background via-background to-background/90 flex flex-col">
      <Seo
        path="/ig"
        title="MasterChess — Play Chess Now"
        description="Play live chess instantly. No ads, no bots farming you. 100% human players. Free forever."
      />

      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Brand row */}
      <header className="px-5 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center"
          >
            <Crown className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="font-display text-lg font-bold tracking-wide">
            Master<span className="text-gradient-gold">Chess</span>
          </span>
        </Link>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center"
        >
          {/* Floating board mini-preview */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 18 }}
            className="mx-auto w-44 h-44 rounded-2xl border border-primary/30 bg-card shadow-[0_30px_80px_-20px_hsl(43_90%_55%/0.5)] overflow-hidden relative"
            style={{ transform: "perspective(800px) rotateX(12deg)" }}
          >
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {Array.from({ length: 64 }).map((_, i) => {
                const r = Math.floor(i / 8);
                const c = i % 8;
                const dark = (r + c) % 2 === 1;
                return (
                  <div
                    key={i}
                    className={dark ? "bg-[hsl(28,30%,28%)]" : "bg-[hsl(40,45%,82%)]"}
                  />
                );
              })}
            </div>
            {/* Floating pieces overlay */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 text-center text-2xl leading-none">
              {[
                { p: "♜", r: 0, c: 0 }, { p: "♚", r: 0, c: 4 }, { p: "♜", r: 0, c: 7 },
                { p: "♟", r: 1, c: 1 }, { p: "♟", r: 1, c: 5 },
                { p: "♘", r: 4, c: 4 },
                { p: "♙", r: 6, c: 3 }, { p: "♙", r: 6, c: 4 },
                { p: "♖", r: 7, c: 0 }, { p: "♔", r: 7, c: 6 },
              ].map((it, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  style={{ gridColumnStart: it.c + 1, gridRowStart: it.r + 1 }}
                  className="self-center"
                >
                  {it.p}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <div className="space-y-2">
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Play chess. <br />
              <span className="text-gradient-gold">100% human.</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              No ads. No bot farms. Free forever.
            </p>
            <div className="flex justify-center pt-2">
              <LiveSocialProof compact />
            </div>
          </div>

          <div className="space-y-2.5">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => navigate("/play-guest")}
                className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_10px_40px_-10px_hsl(43_90%_55%/0.7)]"
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                Play Now
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleGoogle}
                disabled={googleLoading}
                variant="outline"
                className="w-full h-12 bg-white text-gray-900 hover:bg-white/90 border-white/30 font-medium"
              >
                <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-5 text-[11px] text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" /> Real players
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-primary" /> Tournaments
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Free coins
            </span>
          </div>
        </motion.div>
      </main>

      <footer className="text-center text-[10px] text-muted-foreground pb-4">
        @dailychess_12 · masterchess.live
      </footer>
    </div>
  );
}
