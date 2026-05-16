import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Apple, X, Check, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALLED_KEY = "mc.install.done.v1";
const LIVE_URL = "https://masterchess.live";

export default function InstallAppButton({
  variant = "hero",
}: {
  variant?: "hero" | "navbar";
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    typeof window !== "undefined" && localStorage.getItem(INSTALLED_KEY) === "1",
  );
  const [justInstalled, setJustInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  const isIos =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS-only flag
      window.navigator.standalone === true);
  const isInIframe = (() => {
    try {
      return typeof window !== "undefined" && window.self !== window.top;
    } catch {
      return true;
    }
  })();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setDeferred(null);
      // Show the confirmation chip briefly, then hide the button entirely.
      setJustInstalled(true);
      toast.success("Instalirano ✓", {
        description: "MasterChess je dodat među tvoje aplikacije.",
        duration: 4000,
      });
      setTimeout(() => {
        setInstalled(true);
        setJustInstalled(false);
      }, 2800);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Hide forever once installed or already running as PWA (but keep visible
  // during the brief "Instalirano" confirmation animation).
  if ((installed || isStandalone) && !justInstalled) return null;


  const handleClick = async () => {
    // 1. Native install prompt available → fire it immediately.
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem(INSTALLED_KEY, "1");
          setInstalled(true);
        }
      } catch {}
      setDeferred(null);
      return;
    }
    // 2. iOS Safari has no native prompt → show "Add to Home Screen" sheet.
    if (isIos) {
      setShowIosHelp(true);
      return;
    }
    // 3. Inside Lovable preview iframe → break out to live domain (same tab
    //    in the top window) where the browser's native install dialog can
    //    actually fire. Sandbox iframes physically cannot install a PWA.
    if (isInIframe) {
      try {
        // Break out of the iframe so the user lands on masterchess.live
        // as a top-level navigation where install is allowed.
        if (window.top) {
          window.top.location.href = LIVE_URL + "?install=1";
        } else {
          window.location.href = LIVE_URL + "?install=1";
        }
      } catch {
        window.location.href = LIVE_URL + "?install=1";
      }
      return;
    }
    // 4. On live site but browser hasn't fired beforeinstallprompt yet
    //    (e.g. user just landed, criteria not met). Reload to give Chrome
    //    a chance to surface the address-bar install icon.
    window.location.href = LIVE_URL + "?install=1";
  };

  const sizeClass =
    variant === "hero"
      ? "h-14 px-8 text-base rounded-xl"
      : "h-9 px-3 text-xs rounded-lg";

  return (
    <>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Button
          onClick={handleClick}
          variant="outline"
          className={`ripple-btn ${sizeClass} border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-display uppercase tracking-wider gap-2 shadow-glow transition-all`}
        >
          {deferred || !isInIframe ? (
            <Download className="h-4 w-4" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          {variant === "hero" ? "Install App" : "Install"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showIosHelp && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIosHelp(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-primary/30 bg-card p-5 shadow-2xl"
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Apple className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">Install MasterChess</h3>
                    <p className="text-xs text-muted-foreground">iPhone / iPad</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIosHelp(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span> Tap the{" "}
                  <strong className="text-foreground">Share</strong> icon in Safari.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span> Tap{" "}
                  <strong className="text-foreground">"Add to Home Screen"</strong>.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span> Tap{" "}
                  <strong className="text-foreground">Add</strong> — MasterChess launches fullscreen.
                </li>
              </ol>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                <Check className="h-4 w-4 shrink-0" />
                Fullscreen, no browser bar, instant launch from home screen.
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => setShowIosHelp(false)}>
                  Got it
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
