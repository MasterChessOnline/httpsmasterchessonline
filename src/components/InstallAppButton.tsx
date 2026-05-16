import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Apple, X, Check, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SafariMacDemo from "@/components/install-demos/SafariMacDemo";
import IOSDemo from "@/components/install-demos/IOSDemo";

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
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  // Catches Safari, Chrome, Firefox, Edge on iPhone/iPad — all use WebKit.
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      (navigator as any).maxTouchPoints > 1);
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
      toast.success("Installed ✓", {
        description: "MasterChess has been added to your apps.",
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
  // during the brief "Installed" confirmation animation).
  if ((installed || isStandalone) && !justInstalled) return null;


  const handleClick = async () => {
    // 1. Native install prompt available → fire it immediately, no questions asked.
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem(INSTALLED_KEY, "1");
          setInstalled(true);
          toast.success("Installed ✓", {
            description: "MasterChess has been added to your apps.",
          });
        }
      } catch {}
      setDeferred(null);
      return;
    }
    // 2. Inside Lovable preview iframe → break out to live domain where
    //    the native install dialog can fire (iframes cannot install PWAs).
    if (isInIframe) {
      try {
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
    // 3. iOS — Apple blocks fully automatic installs. Open the Share sheet
    //    immediately AND show the step-by-step guide as backup.
    if (isIos) {
      setShowIosHelp(true);
      if (navigator.share) {
        try {
          await navigator.share({
            title: "MasterChess",
            text: "Install MasterChess on your iPhone.",
            url: window.location.origin,
          });
        } catch {
          // user dismissed; modal stays visible with steps
        }
      }
      return;
    }
    // 4. Other browsers without beforeinstallprompt → show manual steps.
    setShowAndroidHelp(true);
  };

  const sizeClass =
    variant === "hero"
      ? "h-14 px-8 text-base rounded-xl"
      : "h-9 px-3 text-xs rounded-lg";

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {justInstalled ? (
          <motion.div
            key="installed"
            initial={{ opacity: 0, scale: 0.85, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <div
              className={`${sizeClass} inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-display uppercase tracking-wider shadow-[0_0_24px_-4px_rgba(16,185,129,0.55)]`}
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4" />
              Installed
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="install"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
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
        )}
      </AnimatePresence>


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

              <div className="mb-3">
                <IOSDemo />
                <p className="mt-1.5 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  Live demo · loops automatically
                </p>
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

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: "MasterChess",
                          text: "Install MasterChess on your iPhone.",
                          url: window.location.origin,
                        });
                      } catch {}
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Open Share Menu
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowIosHelp(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAndroidHelp && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAndroidHelp(false)}
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
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">Install MasterChess</h3>
                    <p className="text-xs text-muted-foreground">Desktop · Laptop · Android</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAndroidHelp(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold mb-1.5">Chrome · Edge · Brave (Mac / Windows / Linux)</p>
                  <p>
                    Click the <strong className="text-foreground">install icon</strong>{" "}
                    <span className="inline-block px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary text-xs">⊕</span>{" "}
                    in the address bar — or open the menu{" "}
                    <strong className="text-foreground">⋮ → "Install MasterChess"</strong>.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold mb-2 flex items-center gap-1.5">
                    <Apple className="h-3.5 w-3.5" /> Safari (macOS)
                  </p>

                  {/* Mini macOS menu-bar mockup */}
                  <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-800/70 to-zinc-900/70 overflow-hidden mb-2.5 shadow-inner">
                    <div className="flex items-center gap-3 px-2.5 py-1 border-b border-white/5 bg-black/30 text-[11px] text-white/70">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                        <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                        <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                      </div>
                      <span className="font-semibold text-white">Safari</span>
                      <span className="relative px-1.5 py-0.5 rounded text-amber-300 bg-amber-400/15 ring-1 ring-amber-400/40">
                        File
                        <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-amber-300 animate-ping" />
                      </span>
                      <span>Edit</span>
                      <span>View</span>
                      <span>History</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-[11px] space-y-0.5">
                      <div className="text-white/40">New Tab</div>
                      <div className="text-white/40">New Window</div>
                      <div className="flex items-center justify-between rounded bg-amber-400/20 ring-1 ring-amber-400/50 px-1.5 py-0.5 text-amber-200 font-semibold">
                        <span>Add to Dock…</span>
                        <span className="text-amber-300/70">⌘D</span>
                      </div>
                      <div className="text-white/40">Share</div>
                    </div>
                  </div>

                  <ol className="space-y-1.5 text-sm">
                    <li className="flex gap-2">
                      <span className="shrink-0 h-5 w-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">1</span>
                      In the top menu bar click <strong className="text-foreground">File</strong>.
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 h-5 w-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">2</span>
                      Choose <strong className="text-foreground">Add to Dock…</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 h-5 w-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">3</span>
                      Click <strong className="text-foreground">Add</strong> — MasterChess appears in your Dock and launches like a native app.
                    </li>
                  </ol>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/70">Requires macOS Sonoma 14+ · Safari 17+</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold mb-1.5">Android</p>
                  <p>
                    Menu <strong className="text-foreground">⋮ → "Install app"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                <Check className="h-4 w-4 shrink-0" />
                Launches in its own window — no browser bar, like a native app.
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => setShowAndroidHelp(false)}>
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
