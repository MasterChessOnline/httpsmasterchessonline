import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Smartphone, Apple, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mc.install.dismissed.v1";

export default function InstallAppButton({
  variant = "hero",
}: {
  variant?: "hero" | "navbar";
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIos, setShowIos] = useState(false);

  const isIos = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS-only flag
      window.navigator.standalone === true);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || isStandalone) return null;

  const dismissed =
    typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1";
  if (dismissed && !deferred && !isIos) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else if (isIos) {
      setShowIos(true);
    } else {
      // No prompt fired — show short toast-style hint
      setShowIos(true);
    }
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
          <Download className="h-4 w-4" />
          {variant === "hero" ? "Install App" : "Install"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showIos && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIos(false)}
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
                    {isIos ? <Apple className="h-5 w-5 text-primary" /> : <Smartphone className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">Install MasterChess</h3>
                    <p className="text-xs text-muted-foreground">Add to your home screen</p>
                  </div>
                </div>
                <button onClick={() => setShowIos(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isIos ? (
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Tap the <strong className="text-foreground">Share</strong> icon in Safari (square with arrow).</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Scroll and tap <strong className="text-foreground">"Add to Home Screen"</strong>.</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Tap <strong className="text-foreground">Add</strong>. MasterChess launches fullscreen.</li>
                </ol>
              ) : (
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Open your browser menu (⋮).</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Choose <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong>.</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Confirm — MasterChess launches as its own app.</li>
                </ol>
              )}

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                <Check className="h-4 w-4 shrink-0" />
                Fullscreen, no browser bar, instant launch from your home screen.
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem(DISMISS_KEY, "1");
                    setShowIos(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5"
                >
                  Don't show again
                </button>
                <Button size="sm" onClick={() => setShowIos(false)}>Got it</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
