import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { STARTING_LEVELS, DEFAULT_STARTING_LEVEL_KEY, getStartingLevel } from "@/lib/starting-levels";
import { track } from "@/lib/track";

import AuthAura from "@/components/auth/AuthAura";
import GoogleCountryNameModal from "@/components/auth/GoogleCountryNameModal";
import BrandLogo from "@/components/BrandLogo";
import Seo from "@/components/Seo";
import WhyMasterChessCompact from "@/components/WhyMasterChessCompact";
import SeoFaqBlock from "@/components/seo/SeoFaqBlock";
import { SIGNUP_FAQ } from "@/lib/seo-faq";

import {
  getGuestProgress,
  guestValueLine,
  markSignupSeen,
  clearGuestProgress,
} from "@/lib/guestProgress";
import {
  isBackendOutage,
  queuePendingSignup,
  clearPendingSignup,
  getPendingSignup,
} from "@/lib/backendHealth";

const CHESS_PIECES = ["♔", "♕", "♖", "♗", "♘", "♙"];

const FloatingPiece = ({ piece, index }: { piece: string; index: number }) => (
  <motion.div
    className="absolute text-primary/[0.04] text-6xl select-none pointer-events-none"
    style={{
      left: `${10 + (index * 17) % 80}%`,
      top: `${5 + (index * 23) % 85}%`,
    }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, index % 2 === 0 ? 10 : -10, 0],
      opacity: [0.03, 0.06, 0.03],
    }}
    transition={{
      duration: 4 + index * 0.7,
      repeat: Infinity,
      ease: "easeInOut",
      delay: index * 0.5,
    }}
  >
    {piece}
  </motion.div>
);

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Account name is required for BOTH paths (Google + email).
  const [accountName, setAccountName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [fideId, setFideId] = useState("");
  const [fideBusy, setFideBusy] = useState(false);
  const [fideFound, setFideFound] = useState<null | { name: string; federation?: string | null; title?: string | null; standard_rating?: number | null; rapid_rating?: number | null; blitz_rating?: number | null }>(null);
  const [fideErr, setFideErr] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showFide, setShowFide] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [outage, setOutage] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // What this guest earned while playing without an account.
  const guestLine = useMemo(() => guestValueLine(getGuestProgress()), []);
  const nameOk = accountName.trim().length >= 3;


  useEffect(() => {
    // Funnel step: the signup offer was actually seen.
    markSignupSeen();
    // A queued email from an earlier outage: prefill so the retry is one tap.
    const pending = getPendingSignup();
    if (pending?.email) setEmail((prev) => prev || pending.email);
  }, []);



  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // After signup the player always lands on the homepage first (with the
  // welcome intro), never straight in a game — a new account needs orientation
  // before a board. An explicit ?redirect= still wins.
  const redirectTo = searchParams.get("redirect") || "/?welcome=1";


  const authSuffix = searchParams.get("redirect") ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  const handleGoogleLogin = async () => {
    setError(null);
    setNameTouched(true);
    // Account name first, Google second — the name is what shows up in games.
    if (!nameOk) {
      setError("Choose your account name first (at least 3 characters).");
      return;
    }
    setGoogleLoading(true);
    try {
      localStorage.setItem(
        "mc:pending-profile",
        JSON.stringify({ display_name: accountName.trim(), country: "" }),
      );
    } catch {/* ignore */}
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + redirectTo,
    });
    if (result.error) {
      setError(result.error.message);
      setGoogleLoading(false);
    }
  };


  // Debounced FIDE lookup (optional field)
  const fideDebounce = useState<{ t: number | null }>({ t: null })[0];
  const lookupFide = async (fid: string) => {
    setFideBusy(true); setFideErr(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fide-lookup?id=${fid}`;
      const r = await fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
      const j: any = await r.json().catch(() => ({}));
      if (!j?.name) { setFideFound(null); setFideErr(j?.error || "FIDE profile not found."); return; }
      setFideFound({
        name: j.name,
        federation: j.federation,
        title: j.title,
        standard_rating: j.standard_rating ?? j.rating ?? null,
        rapid_rating: j.rapid_rating ?? null,
        blitz_rating: j.blitz_rating ?? null,
      });
    } catch (e: any) {
      setFideFound(null); setFideErr(e?.message || "Lookup failed.");
    } finally { setFideBusy(false); }
  };
  const onFideChange = (v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 10);
    setFideId(clean);
    if (fideDebounce.t) window.clearTimeout(fideDebounce.t);
    if (!/^\d{5,10}$/.test(clean)) { setFideFound(null); setFideErr(null); return; }
    fideDebounce.t = window.setTimeout(() => lookupFide(clean), 450);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNameTouched(true);
    if (!nameOk) {
      setError("Choose your account name (at least 3 characters).");
      return;
    }
    setLoading(true);

    // If FIDE ID was entered, keep the verified name as real name fields,
    // but the account name the player typed always wins as display name.
    let firstName = "", lastName = "";
    if (fideFound?.name) {
      const raw = String(fideFound.name);
      if (raw.includes(",")) { const [l, f] = raw.split(",").map(s => s.trim()); firstName = f || ""; lastName = l || ""; }
      else { const parts = raw.trim().split(/\s+/); lastName = parts.pop() || ""; firstName = parts.join(" "); }
    }
    const autoDisplay = accountName.trim().slice(0, 32);
    const startingLevel = getStartingLevel(DEFAULT_STARTING_LEVEL_KEY);
    // If FIDE-verified, seed rating from Blitz → Rapid → Standard.
    const fideRating = fideFound?.blitz_rating || fideFound?.rapid_rating || fideFound?.standard_rating || null;
    const seedRating = fideRating || startingLevel.rating;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: autoDisplay,
          starting_level: startingLevel.key,
          starting_rating: seedRating,
        },
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (error) {
      // Distinguish "you typed something wrong" from "our backend is down":
      // in the second case keep the email so nothing is lost.
      if (isBackendOutage(error.message)) {
        queuePendingSignup({ email });
        setOutage(true);
        setError(null);
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    const newUserId = data.user?.id;
    if (newUserId && data.session) {
      // Runs only with a live session (otherwise row-level security rejects it),
      // and never touches rating/stat columns — those are seeded server-side.
      window.setTimeout(() => {
        const patch: any = {
          display_name: autoDisplay,
        };
        if (fideFound) {
          patch.first_name = firstName || null;
          patch.last_name = lastName || null;
          patch.fide_id = fideId || null;
          patch.fide_title = (fideFound.title || "").toUpperCase().slice(0, 3) || null;
          patch.federation = (fideFound.federation || "").toUpperCase().slice(0, 3) || null;
        }
        supabase
          .from("profiles")
          .update(patch)
          .eq("user_id", newUserId)

          .then(({ error }) => {
            if (error) {
              console.info("[MasterChess Startup] ERROR_STATE", { step: "SIGNUP_PROFILE_UPDATE", message: "profile update skipped", error });
            }
          });
      }, 0);
    }

    // Registration notification to the player's own inbox.
    // Fire-and-forget: never block entering the app on the mail provider.
    if (data.session) {
      supabase.functions
        .invoke("send-welcome-email", { body: { display_name: autoDisplay } })
        .then(({ error }) => {
          if (error) console.info("[MasterChess] welcome email skipped", error);
        });
    }

    track("sign_up", { method: "email", user_id: newUserId, starting_level: startingLevel.key, fide_verified: !!fideFound });
    clearPendingSignup();
    clearGuestProgress();

    if (!data.session) {
      // Email confirmation is on: don't pretend they're logged in.
      setSentTo(email);
      setLoading(false);
      return;
    }
    navigate(redirectTo);
  };



  const handleAppleLogin = async () => {
    setError(null);
    setNameTouched(true);
    if (!nameOk) {
      setError("Choose your account name first (at least 3 characters).");
      return;
    }
    try {
      localStorage.setItem(
        "mc:pending-profile",
        JSON.stringify({ display_name: accountName.trim(), country: "" }),
      );
    } catch {/* ignore */}
    const result = await lovable.auth.signInWithOAuth("apple", {

      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden py-10">
      <Seo
        title="Create Free Account — MasterChess"
        description="Create your free MasterChess account in seconds. Play chess online vs real players and bots, save your rating, join tournaments. No ads, no subscription."
        path="/signup"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Create Free Account",
            url: "https://masterchess.live/signup",
            description: "Sign up free for MasterChess and start playing chess online instantly.",
            isPartOf: { "@type": "WebSite", name: "MasterChess", url: "https://masterchess.live/" },
            potentialAction: {
              "@type": "RegisterAction",
              name: "Create Free Account",
              target: "https://masterchess.live/signup",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: SIGNUP_FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}

      />
      <AuthAura />
      {CHESS_PIECES.map((piece, i) => (
        <FloatingPiece key={i} piece={piece} index={i} />
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="erupt-card rounded-2xl backdrop-blur-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.6),0_0_60px_-20px_hsl(43_90%_55%/0.3)] p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3 mb-5">
              <BrandLogo size="lg" />
              <span className="font-display text-2xl font-black text-foreground uppercase tracking-wider">
                Master<span className="text-gradient-gold">Chess</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome to MasterChess</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Your next grandmaster move starts here</p>
          </div>

          {/* What the guest actually loses by not signing up — concrete, from
              the games they already played in this browser. */}
          {guestLine && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-widest text-primary/90">Unsaved progress</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{guestLine}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create your free account to keep it — it disappears if you leave.
              </p>
            </div>
          )}

          {outage && (
            <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-xs text-foreground">
              Our servers are briefly unavailable. Your email is saved and we'll finish this
              signup automatically — meanwhile you can keep playing.{" "}
              <Link to="/play-guest" className="underline text-primary">Play now</Link>
            </div>
          )}

          {sentTo ? (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-foreground">Check your inbox</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                We sent a confirmation email to <span className="text-foreground">{sentTo}</span>.
                Open it to activate your account, then log in.
              </p>
              <Button asChild variant="outline" className="mt-4 h-10 w-full border-primary/30">
                <Link to={`/login${authSuffix}`}>Go to login</Link>
              </Button>
            </div>
          ) : (
          <>
          {/* Account name — required BEFORE Google or email. It is the name
              other players see on the board and leaderboard. */}
          <div className="mb-5 space-y-1.5">
            <Label htmlFor="account-name" className="text-xs font-medium text-muted-foreground">
              Account name <span className="text-primary">*</span>
            </Label>
            <Input
              id="account-name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.slice(0, 32))}
              onBlur={() => setNameTouched(true)}
              placeholder="e.g. GrandmasterX"
              maxLength={32}
              autoComplete="nickname"
              className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
            {nameTouched && !nameOk ? (
              <p className="text-[11px] text-destructive/90">Pick a name with at least 3 characters.</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                This is the name other players see. Required before continuing with Google or email.
              </p>
            )}
          </div>

          {/* Social buttons */}
          <div className="space-y-2.5 mb-6">

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full h-11 bg-white text-gray-800 border-white/20 hover:bg-white/90 font-medium text-sm"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                <svg className="mr-2.5 h-4.5 w-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm"
                onClick={handleAppleLogin}
              >
                <svg className="mr-2.5 h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </Button>
            </motion.div>
          </div>

          {/* Divider — only when email form is open */}
          {showEmailForm && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/80 px-3 text-muted-foreground tracking-wider">or with email</span>
              </div>
            </div>
          )}

          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Or sign up with email →
            </button>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!showFide ? (
                <button
                  type="button"
                  onClick={() => setShowFide(true)}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  Have a FIDE ID? Add it to import your rating (optional)
                </button>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="fide" className="text-xs font-medium text-muted-foreground">
                    FIDE ID <span className="opacity-60">(optional — auto-fills your name & rating)</span>
                  </Label>
                  <Input
                    id="fide"
                    inputMode="numeric"
                    placeholder="e.g. 14106503"
                    value={fideId}
                    onChange={(e) => onFideChange(e.target.value)}
                    maxLength={10}
                    className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  />
                  {fideBusy && <p className="text-[11px] text-muted-foreground">Checking FIDE…</p>}
                  {fideFound && (
                    <p className="text-[11px] text-emerald-400">
                      ✓ {fideFound.name}{fideFound.title ? ` · ${fideFound.title}` : ""}{fideFound.federation ? ` · ${fideFound.federation}` : ""}
                      {fideFound.blitz_rating ? ` · Blitz ${fideFound.blitz_rating}` : fideFound.rapid_rating ? ` · Rapid ${fideFound.rapid_rating}` : fideFound.standard_rating ? ` · Std ${fideFound.standard_rating}` : ""}
                    </p>
                  )}
                  {fideErr && !fideBusy && <p className="text-[11px] text-destructive/80">{fideErr}</p>}
                </div>
              )}




              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 border border-destructive/20"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow relative overflow-hidden group"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </Button>
              </motion.div>

              <p className="text-[11px] text-center text-muted-foreground">
                We'll send a confirmation email to <span className="text-foreground">{email || "your inbox"}</span> as soon as your account is created.
              </p>
            </form>
          )}
          </>
          )}


          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to={`/login${authSuffix}`} className="text-primary font-medium hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Same promise as the homepage — the reason to finish the form. */}
      <div className="relative z-10 w-full">
        <WhyMasterChessCompact className="mt-10" />
        <div className="mx-auto max-w-3xl px-4">
          <SeoFaqBlock items={SIGNUP_FAQ} title="Before you sign up" />
        </div>
      </div>

      <GoogleCountryNameModal
        open={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onError={(msg) => setError(msg)}
      />
    </div>
  );
};

export default Signup;
