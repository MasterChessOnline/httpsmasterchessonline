import { useState } from "react";
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
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/homepage";
  const authSuffix = redirectTo !== "/homepage" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    // 1-click Google: skip country/name modal (killed conversion).
    // Defaults are applied; user can edit anything in Settings.
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + redirectTo,
    });
    if (result.error) {
      setError(result.error.message);
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Auto-derive display name from the local-part of the email so the form
    // stays single-step. Users can edit it later in Settings.
    const autoDisplay = (email.split("@")[0] || "Player")
      .replace(/[^a-zA-Z0-9]/g, " ")
      .trim()
      .slice(0, 32) || "Player";
    const startingLevel = getStartingLevel(DEFAULT_STARTING_LEVEL_KEY);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: autoDisplay,
          starting_level: startingLevel.key,
          starting_rating: startingLevel.rating,
        },
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const newUserId = data.user?.id;
    if (newUserId) {
      window.setTimeout(() => {
        supabase
          .from("profiles")
          .update({
            rating: startingLevel.rating,
            peak_rating: startingLevel.rating,
          })
          .eq("user_id", newUserId)
          .then(({ error }) => {
            if (error) {
              console.info("[MasterChess Entry] ERROR_STATE", { step: "SIGNUP_PROFILE_UPDATE", message: "profile update skipped", error });
            }
          });
      }, 0);
    }

    track("sign_up", { method: "email", user_id: newUserId, starting_level: startingLevel.key });
    navigate(redirectTo);
  };

  const handleAppleLogin = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-10">
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
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <motion.div
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Crown className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="font-display text-xl font-bold text-foreground uppercase tracking-wider">
                Master<span className="text-gradient-gold">Chess</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome to MasterChess</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Your next grandmaster move starts here</p>
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
                We'll generate a display name from your email — you can change it later in Settings.
              </p>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to={`/login${authSuffix}`} className="text-primary font-medium hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
      <GoogleCountryNameModal
        open={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onError={(msg) => setError(msg)}
      />
    </div>
  );
};

export default Signup;
