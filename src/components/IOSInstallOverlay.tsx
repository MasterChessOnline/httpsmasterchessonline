import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, X, Check, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import IOSDemo from "@/components/install-demos/IOSDemo";
import { useInstallStatus } from "@/hooks/use-install-status";

/**
 * Fullscreen iOS install overlay.
 * Visible to every iPhone/iPad visitor in Safari (non-standalone) until the
 * app is actually installed. The shared `useInstallStatus` hook detects
 * installation in real time (display-mode change, navigator.standalone,
 * appinstalled event, related-apps API) and the overlay self-deletes the
 * moment install is confirmed — no refresh required.
 */

const SESSION_KEY = "mc.ios.overlay.dismissed";

export default function IOSInstallOverlay() {
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [inIframe, setInIframe] = useState(false);
  const { installed, isStandalone } = useInstallStatus();

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
    let iframe = false;
    try {
      iframe = window.self !== window.top;
    } catch {
      iframe = true;
    }
    setIsIos(ios);
    setInIframe(iframe);
    setDismissed(sessionStorage.getItem(SESSION_KEY) === "1");
  }, []);

  const show = isIos && !isStandalone && !installed && !inIframe && !dismissed;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };


  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Session-only close (overlay returns next visit until installed) */}
          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 border border-white/15 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>

          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Apple className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-display font-bold text-lg text-foreground leading-tight">
                  Install MasterChess
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Get the fullscreen app on your iPhone
                </p>
              </div>
            </div>

            <div className="w-full mb-4">
              <IOSDemo />
              <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Follow these 3 steps · demo loops
              </p>
            </div>

            <ol className="w-full space-y-2 text-sm text-muted-foreground text-left mb-4">
              <li className="flex gap-2">
                <span className="shrink-0 h-5 w-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Tap the{" "}
                <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                  <Share className="h-3.5 w-3.5" /> Share
                </span>{" "}
                icon at the bottom of Safari.
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 h-5 w-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Choose{" "}
                <strong className="text-foreground">Add to Home Screen</strong>.
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 h-5 w-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Tap <strong className="text-foreground">Add</strong> —
                MasterChess launches like a native app.
              </li>
            </ol>

            <div className="w-full flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 mb-3">
              <Check className="h-4 w-4 shrink-0" />
              This guide disappears automatically once installed.
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Continue without installing
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
