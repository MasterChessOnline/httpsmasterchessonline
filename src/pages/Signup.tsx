import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { STARTING_LEVELS, DEFAULT_STARTING_LEVEL_KEY, getStartingLevel } from "@/lib/starting-levels";

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
  const [displayName, setDisplayName] = useState("");
  const [levelKey, setLevelKey] = useState<string>(DEFAULT_STARTING_LEVEL_KEY);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const startingLevel = getStartingLevel(levelKey);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || "Player",
          starting_level: startingLevel.key,
          starting_rating: startingLevel.rating,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Seed the new profile with the chosen starting ONLINE rating.
    // (handle_new_user trigger creates the row with defaults; we bump it.)
    const newUserId = data.user?.id;
    if (newUserId) {
      await new Promise((r) => setTimeout(r, 400));
      await supabase
        .from("profiles")
        .update({
          rating: startingLevel.rating,
          peak_rating: startingLevel.rating,
        })
        .eq("user_id", newUserId);
    }

    navigate("/dashboard");
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
      {CHESS_PIECES.map((piece, i) => (
        <FloatingPiece key={i} piece={piece} index={i} />
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-8 sm:p-10">
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
                onClick={() => handleSocialLogin("google")}
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
                onClick={() => handleSocialLogin("apple")}
              >
                <svg className="mr-2.5 h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </Button>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-3 text-muted-foreground tracking-wider">or</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="GrandmasterX"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                autoComplete="name"
                className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
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

            {/* Starting level picker */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Starting Level
                <span className="ml-1 text-[10px] text-muted-foreground/70">(sets your bot rating)</span>
              </Label>
              <div className="grid grid-cols-5 gap-1.5">
                {STARTING_LEVELS.map((lvl) => {
                  const selected = levelKey === lvl.key;
                  return (
                    <button
                      key={lvl.key}
                      type="button"
                      onClick={() => setLevelKey(lvl.key)}
                      className={`group relative flex flex-col items-center justify-center rounded-lg border bg-muted/20 px-1.5 py-2 transition-all hover:scale-[1.03] ${
                        selected
                          ? `${lvl.borderColor} bg-primary/5 shadow-glow`
                          : "border-border/40 hover:border-primary/30"
                      }`}
                      aria-pressed={selected}
                      aria-label={`${lvl.label} — ${lvl.rating} rating`}
                    >
                      <span className={`text-base leading-none ${selected ? lvl.color : "opacity-70"}`}>
                        {lvl.icon}
                      </span>
                      <span className={`mt-1 text-[9px] font-bold uppercase tracking-wider ${selected ? lvl.color : "text-muted-foreground"}`}>
                        L{lvl.level}
                      </span>
                      <span className={`mt-0.5 font-mono text-[10px] font-semibold ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                        {lvl.rating}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {getStartingLevel(levelKey).label} — {getStartingLevel(levelKey).description}
              </p>
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
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
