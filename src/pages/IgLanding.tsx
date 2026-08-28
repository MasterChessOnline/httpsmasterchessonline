import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import InstantHeroBoard from "@/components/InstantHeroBoard";
import WhyMasterChessCompact from "@/components/WhyMasterChessCompact";
import BeginnerCoachSheet from "@/components/BeginnerCoachSheet";
import SignupGate from "@/components/SignupGate";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { captureAttribution, track } from "@/lib/track";
import { detectTrafficSource, type TrafficSource } from "@/lib/trafficSource";




/**
 * PAID-TRAFFIC LANDING (/ig, /start, /ads/:variant)
 * Board first, everything else later. Ad traffic lands on a live chess board
 * against the weakest bot — the game starts on the visitor's first move.
 * The "create free account" offer only appears after the first game finishes
 * (rendered by InstantHeroBoard in adMode), plus a Google one-tap below.
 * Not indexed: this is a paid-traffic page, not a search landing page.
 */

const ATTRIBUTION_KEY = "mc_attribution";

/** Route variant → the channel we assume when the ad URL carries no utm_source. */
function channelFromVariant(variant?: string): string {
  if (!variant) return "ig";
  const v = variant.toLowerCase();
  if (v.includes("tiktok") || v.startsWith("tt")) return "tiktok";
  if (v.includes("google") || v.startsWith("g")) return "google";
  if (v.includes("fb") || v.includes("facebook") || v.includes("meta")) return "facebook";
  return v;
}

function captureLandingSource(variant?: string) {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source") || channelFromVariant(variant);
    const data: Record<string, string> = {
      source,
      campaign: params.get("utm_campaign") || variant || "",
      content: params.get("utm_content") || "",
      ref: params.get("ref") || "",
      landed_at: new Date().toISOString(),
    };
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data));
    localStorage.setItem("mc_ig_session", "1");
    // Shared UTM store (used by signup + funnel reporting).
    captureAttribution();
    track("ad_landing_view", { surface: "ad-landing", ad_source: source, variant: variant || "ig" });
  } catch {
    /* private mode — attribution is best-effort */
  }
}


export default function IgLanding() {
  const { variant } = useParams<{ variant?: string }>();
  const { user } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [coach, setCoach] = useState(false);
  // Once a visitor says they cannot play, the board keeps the hint line up.
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [detected, setDetected] = useState<TrafficSource>("direct");
  // Hard gate: the first game is free, then an account is required to continue.
  const [gate, setGate] = useState(false);

  useEffect(() => {
    setDetected(detectTrafficSource().source);
    captureLandingSource(variant);

    // Paid landing page must stay out of the search index: override every
    // robots tag the shared SEO layer already emitted, then restore on exit.
    const tags = Array.from(
      document.head.querySelectorAll<HTMLMetaElement>('meta[name="robots"]'),
    );
    const previous = tags.map((t) => t.content);
    tags.forEach((t) => (t.content = "noindex, nofollow"));
    let added: HTMLMetaElement | null = null;
    if (!tags.length) {
      added = document.createElement("meta");
      added.name = "robots";
      added.content = "noindex, nofollow";
      document.head.appendChild(added);
    }
    return () => {
      tags.forEach((t, i) => (t.content = previous[i]));
      added?.remove();
    };
  }, []);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setGoogleLoading(false);
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-background flex flex-col">
      <Seo
        path="/ig"
        title="Play Chess Free — One Move and You're Playing | MasterChess"
        description="Tap a piece and your free chess game starts instantly. No signup, no ads. Create a free account after your first win to save your rating."

      />


      {/* No blur layers here: a 120px blur on a 420px circle costs a full
          repaint on the cheap Android phones this page is bought for. */}

      {/* Minimal brand row — no navigation that could steal the first move */}
      <header className="px-4 pt-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Crown className="h-3.5 w-3.5 text-primary" />
          </span>
          <span className="font-display text-sm font-bold tracking-wide">
            Master<span className="text-gradient-gold">Chess</span>
          </span>
        </Link>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Sign in
        </Link>
      </header>

      <main className="flex-1">
        {/* One line, then the board. There is no "PLAY FREE" button any more:
            the button was a second tap between the ad's promise and the game,
            and it pushed the board below the fold on a 390x800 phone. */}
        <section className="px-4 pt-2 pb-1 text-center">
          <h1 className="font-display text-lg font-black leading-tight tracking-tight">
            Free chess · your move
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {detected === "instagram" || detected === "facebook" ? (
              <span data-testid="source-badge">Welcome from Instagram · </span>
            ) : null}
            Tap a piece to start. No account needed.
          </p>
        </section>

        {/* The board is the hero: live from the first paint, weakest bot.
            The visitor plays one full game for free; after that the gate asks
            for a free account before another move can be played. */}
        <div id="board">

          <InstantHeroBoard
            adMode
            hideHeading
            headingLevel="h2"
            beginner={beginnerMode}
            onProgress={({ plies, ended }) => {
              if (user || gate) return;
              // Gate at the end of the first game, or once a long game shows
              // the visitor is clearly engaged (12 moves each).
              if (ended || plies >= 24) {
                track("signup_gate_shown", {
                  surface: "ad-landing",
                  variant: variant || "ig",
                  ad_source: detected,
                  trigger: ended ? "game_end" : "deep_game",
                });
                setGate(true);
              }
            }}
          />
        </div>

        <button
          onClick={() => {
            track("beginner_primer_open", { surface: "ad-landing", variant: variant || "ig" });
            setCoach(true);
          }}
          className="mx-auto mt-2 block w-full text-xs text-primary underline underline-offset-4"
        >
          I don't know how to play — teach me in 60 seconds
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="px-6 pt-6 pb-8 max-w-md mx-auto w-full space-y-3"
        >

          <Button
            onClick={handleGoogle}
            disabled={googleLoading}
            variant="outline"
            className="w-full h-12 bg-white text-gray-900 hover:bg-white/90 border-white/30 font-medium"
          >
            <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google — save your games
          </Button>
          <p className="text-center text-[11px] text-muted-foreground inline-flex w-full items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Free forever · your rating, streak and history are saved
          </p>
        </motion.div>

        {/* Same three reasons as the homepage — answers "why this site" after the game. */}
        <WhyMasterChessCompact className="pb-6" />
      </main>


      <BeginnerCoachSheet
        open={coach}
        onOpenChange={setCoach}
        surface="ad-landing"
        onStart={() => {
          setBeginnerMode(true);
          document.getElementById("board")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Forced account step for paid social traffic — no dismiss on purpose. */}
      <SignupGate
        open={gate}
        surface="ad-landing"
        reason="You played your free game. Create a free account to keep playing, save your rating and start your daily streak — coins every day you come back."
      />



      {/* No fixed tab bar on this route, so no reserved space is needed. */}
      <footer className="text-center text-[10px] text-muted-foreground pb-4">
        @dailychess_12 · masterchess.live
      </footer>

    </div>
  );
}
