import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Swords, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Seo from "@/components/Seo";
import { toast } from "sonner";

/**
 * Public challenge page. Anyone visiting `/beat-me/:handle` sees a
 * "challenger awaits" landing. Logged-in users tap to play; guests are routed
 * to /play-guest with a soft signup prompt afterwards. Sender gets a shareable
 * link from `/beat-me` (their own page).
 */
export default function BeatMe() {
  const { user } = useAuth();
  const { handle: handleParam } = useParams<{ handle?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Self-mode: viewing /beat-me without a handle → show share UI
  const ownerHandle = handleParam ?? (user?.user_metadata?.display_name as string | undefined) ?? "you";
  const tc = params.get("tc") ?? "5+3";

  const link = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/beat-me/${encodeURIComponent(ownerHandle)}?tc=${encodeURIComponent(tc)}&ref=beatme`;
  }, [ownerHandle, tc]);

  const [copied, setCopied] = useState(false);
  const isSelfMode = !handleParam;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Challenge link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  const share = async () => {
    const text = `${ownerHandle} challenges you to ${tc} chess. First to accept wins bragging rights.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "MasterChess challenge", text, url: link });
        return;
      } catch { /* user cancelled */ }
    }
    copy();
  };

  useEffect(() => {
    // Tag funnel source
    if (params.get("ref") === "beatme" && !user) {
      try { sessionStorage.setItem("mc_funnel_source", "beatme"); } catch {}
    }
  }, [params, user]);

  return (
    <>
      <Seo
        path={isSelfMode ? "/beat-me" : `/beat-me/${ownerHandle}`}
        title={isSelfMode ? "Challenge anyone · MasterChess" : `${ownerHandle} challenges you · MasterChess`}
        description={`Tap to accept the ${tc} chess challenge. Instant play, no signup needed.`}
      />
      <main className="min-h-[100dvh] bg-background relative overflow-hidden flex flex-col">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[460px] w-[460px] rounded-full bg-primary/15 blur-[120px]" />
        </div>

        <header className="px-5 pt-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-display font-bold tracking-wide">
              Master<span className="text-gradient-gold">Chess</span>
            </span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center space-y-6"
          >
            {isSelfMode ? (
              <>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 mx-auto">
                  <Share2 className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                    Challenge anyone, anywhere
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Share this link in your IG story or DM. They tap, you play. No signup needed on their side.
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur p-3 flex items-center gap-2">
                  <code className="flex-1 truncate text-left text-[11px] text-muted-foreground font-mono">
                    {link}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copy} className="h-8 shrink-0">
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-2.5">
                  <Button onClick={share} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share challenge link
                  </Button>
                  {!user && (
                    <p className="text-[11px] text-muted-foreground">
                      Sign in to use your real handle in the link.{" "}
                      <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 14 }}
                  className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 mx-auto"
                >
                  <Swords className="h-9 w-9 text-primary" />
                </motion.div>
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                    Incoming challenge
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                    <span className="text-gradient-gold">{ownerHandle}</span> dares you
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {tc} chess. First to flinch loses.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Button
                    onClick={() => navigate(user ? "/play/online" : "/play-guest")}
                    className="w-full h-14 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_10px_40px_-10px_hsl(43_90%_55%/0.7)]"
                  >
                    <Swords className="h-5 w-5 mr-2" />
                    Accept challenge
                  </Button>
                  <Link to="/" className="block text-[11px] text-muted-foreground hover:text-foreground py-1">
                    What is MasterChess?
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
