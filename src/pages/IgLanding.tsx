import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import InstantHeroBoard from "@/components/InstantHeroBoard";
import WhyMasterChessCompact from "@/components/WhyMasterChessCompact";
import BeginnerCoachSheet from "@/components/BeginnerCoachSheet";
import SignupGate from "@/components/SignupGate";
import IgIntroReel, { hasSeenIgIntro } from "@/components/IgIntroReel";

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
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [coach, setCoach] = useState(false);
  // Once a visitor says they cannot play, the board keeps the hint line up.
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [detected, setDetected] = useState<TrafficSource>("direct");
  // Hard gate: the first game is free, then an account is required to continue.
  const [gate, setGate] = useState(false);
  // Story-style intro plays first for every new session of ad traffic.
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    setDetected(detectTrafficSource().source);
    captureLandingSource(variant);
    if (!user && !hasSeenIgIntro()) setIntro(true);


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
    <div className="min-h-[100dvh] relative overflow-hidden bg-gradient-to-b from-background via-background to-background/90 flex flex-col">
      <Seo
        path="/ig"
        title="Play Chess Free — One Move and You're Playing | MasterChess"
        description="Tap a piece and your free chess game starts instantly. No signup, no ads. Create a free account after your first win to save your rating."
      />

      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Minimal brand row — no navigation that could steal the first move */}
      <header className="px-5 pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Crown className="h-4 w-4 text-primary" />
          </span>
          <span className="font-display text-base font-bold tracking-wide">
            Master<span className="text-gradient-gold">Chess</span>
          </span>
        </Link>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Sign in
        </Link>
      </header>

      <main className="flex-1">
        {/* Instagram-optimised promise: one line, one CTA, then the board.
            No live matchmaking here — a first-time visitor plays the weakest
            bot, and the account is offered once that game is over. */}
        <section className="px-5 pt-4 pb-2 text-center">
          {/* Proof that the source was detected — an Instagram visitor sees their
              own channel named back at them, which lifts trust on first paint. */}
          {detected === "instagram" || detected === "facebook" ? (
            <p
              data-testid="source-badge"
              className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Welcome from {detected === "instagram" ? "Instagram" : "Facebook"} · @dailychess_12
            </p>
          ) : null}
          <h1 className="font-display text-2xl sm:text-3xl font-black leading-tight tracking-tight">
            One tap and you're playing chess.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start against a friendly beginner bot. No account, no waiting for an opponent.
          </p>

          <a
            href="#board"
            onClick={() => track("play_now_click", { surface: "ad-landing", variant: variant || "ig" })}
            className="mt-4 inline-block w-full sm:w-auto sm:min-w-[260px] rounded-2xl bg-primary px-8 py-3.5 font-display text-lg font-black tracking-wide text-primary-foreground shadow-glow"
          >
            PLAY FREE
          </a>
          <p className="mt-2 text-[11px] text-muted-foreground">No payment required.</p>
          <button
            onClick={() => {
              track("beginner_primer_open", { surface: "ad-landing", variant: variant || "ig" });
              setCoach(true);
            }}
            className="mt-3 block w-full text-xs text-primary underline underline-offset-4"
          >
            I don't know how to play — teach me in 60 seconds
          </button>
        </section>

        {/* The board is the hero: live from the first paint, weakest bot.
            The visitor plays one full game for free; after that the gate asks
            for a free account before another move can be played. */}
        <div id="board">
          <InstantHeroBoard
            adMode
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



        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="px-6 pb-8 max-w-md mx-auto w-full space-y-3"
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
        reason="You played your free game. Create a free account to keep playing, save your rating and unlock online opponents."
      />



      {/* pb-24 keeps the post-game offer clear of the fixed mobile tab bar. */}
      <footer className="text-center text-[10px] text-muted-foreground pb-24 sm:pb-4">
        @dailychess_12 · masterchess.live
      </footer>
    </div>
  );
}
