import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe2, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/lib/countries";
import { lovable } from "@/integrations/lovable/index";

const PENDING_KEY = "mc:pending-profile";

interface PendingProfile {
  country: string;
  display_name: string;
}

export function getPendingProfile(): PendingProfile | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearPendingProfile() {
  try { localStorage.removeItem(PENDING_KEY); } catch {}
}

interface Props {
  open: boolean;
  onClose: () => void;
  onError?: (msg: string) => void;
}

export default function GoogleCountryNameModal({ open, onClose, onError }: Props) {
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!country || !name.trim()) return;
    setLoading(true);
    try {
      const pending: PendingProfile = { country, display_name: name.trim() };
      localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        onError?.(result.error.message);
        clearPendingProfile();
        setLoading(false);
      }
      // If redirected, browser handles rest.
    } catch (e: any) {
      onError?.(e?.message || "Failed to sign in");
      clearPendingProfile();
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-background to-card shadow-2xl"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            {!loading && (
              <button onClick={onClose} aria-label="Close"
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="relative p-7">
              <div className="text-center mb-5">
                <h2 className="font-display text-xl font-bold text-foreground">One quick step</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pick your country and a profile name before continuing with Google.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="g-country" className="text-xs flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-primary" /> Country
                  </Label>
                  <select
                    id="g-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 w-full h-11 rounded-md border border-border/60 bg-muted/20 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none"
                  >
                    <option value="">Select your country…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="g-name" className="text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> Profile name
                  </Label>
                  <Input
                    id="g-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={32}
                    placeholder="GrandmasterX"
                    className="mt-1.5 h-11 bg-muted/20"
                  />
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!country || !name.trim() || loading}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Continue with Google <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Your country flag will appear next to your name in games and the leaderboard.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
