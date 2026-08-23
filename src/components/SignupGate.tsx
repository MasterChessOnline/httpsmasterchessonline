import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable/index";
import { track } from "@/lib/track";

/**
 * FORCED SIGNUP GATE (paid social traffic)
 * Instagram / TikTok / Facebook visitors get a real free game first, but once
 * they are hooked (first game over, or deep into the game) the funnel stops:
 * to keep playing they must create a free account. No dismiss button — the
 * only exits are Google one-tap, the email signup form, or an existing login.
 */
interface SignupGateProps {
  open: boolean;
  /** Where the gate was triggered from, for funnel reporting. */
  surface?: string;
  /** Short reason line shown under the headline. */
  reason?: string;
}

export default function SignupGate({
  open,
  surface = "ad-landing",
  reason = "Your game is saved to your free account — rating, streak and history.",
}: SignupGateProps) {
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [nameErr, setNameErr] = useState(false);
  const nameOk = accountName.trim().length >= 3;

  const handleGoogle = async () => {
    if (!nameOk) { setNameErr(true); return; }
    setLoading(true);
    track("signup_gate_google", { surface });
    try {
      localStorage.setItem(
        "mc:pending-profile",
        JSON.stringify({ display_name: accountName.trim(), country: "" }),
      );
    } catch {/* ignore */}
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/?welcome=1`,
    });
    if (result.error) setLoading(false);
  };


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="signup-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="signup-gate"
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="w-full max-w-sm rounded-3xl border border-primary/25 bg-card/95 p-6 shadow-glow"
          >
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
              <Lock className="h-5 w-5 text-primary" />
            </span>
            <h2 className="text-center font-display text-xl font-black leading-tight">
              Create your free account to keep playing
            </h2>
            <p className="mt-2 text-center text-xs text-muted-foreground">{reason}</p>

            {/* Account name first — Google only after it's filled in. */}
            <div className="mt-4">
              <Input
                value={accountName}
                onChange={(e) => { setAccountName(e.target.value.slice(0, 32)); setNameErr(false); }}
                placeholder="Your account name"
                maxLength={32}
                aria-label="Account name"
                className="h-11 bg-muted/30"
              />
              {nameErr ? (
                <p className="mt-1 text-[11px] text-destructive/90">Enter a name with at least 3 characters.</p>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground">The name other players will see.</p>
              )}
            </div>

            <div className="mt-4 space-y-2.5">

              <Button
                onClick={handleGoogle}
                disabled={loading}
                className="h-12 w-full bg-white font-medium text-gray-900 hover:bg-white/90"
              >
                <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              <Button asChild variant="outline" className="h-11 w-full border-primary/30">
                <Link to="/signup" onClick={() => track("signup_gate_email", { surface })}>
                  <Crown className="mr-2 h-4 w-4 text-primary" />
                  Create free account with email
                </Link>
              </Button>
              <Link
                to="/login"
                onClick={() => track("signup_gate_login", { surface })}
                className="block pt-1 text-center text-[11px] text-muted-foreground underline underline-offset-4"
              >
                I already have an account
              </Link>
            </div>

            <p className="mt-4 inline-flex w-full items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Free forever · takes 10 seconds
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
