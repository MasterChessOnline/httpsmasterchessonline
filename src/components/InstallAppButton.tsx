import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Apple, X, Check, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SafariMacDemo from "@/components/install-demos/SafariMacDemo";
import IOSDemo from "@/components/install-demos/IOSDemo";
import { useInstallStatus, INSTALLED_KEY } from "@/hooks/use-install-status";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const LIVE_URL = "https://masterchess.live";

export default function InstallAppButton({
  variant = "hero",
}: {
  variant?: "hero" | "navbar";
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const { installed, isStandalone } = useInstallStatus();
  const [justInstalled, setJustInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const nav = (typeof navigator !== "undefined" ? navigator : null) as
    | (Navigator & { userAgentData?: { platform?: string; mobile?: boolean }; standalone?: boolean })
    | null;

  // True iPhone / iPad / iPod detection across Safari, Chrome (CriOS),
  // Firefox (FxiOS), Edge (EdgiOS) and in-app WebViews. All iOS browsers
  // are WebKit-only, so we explicitly require WebKit AND exclude Android,
  // which prevents false positives on Android browsers that spoof "like Mac".
  const isAppleHardware = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as "MacIntel" — distinguish from real desktop Macs
  // by requiring multi-touch AND that we're NOT a UA-Client-Hints desktop.
  const isIpadOsDesktopMode =
    nav?.platform === "MacIntel" &&
    typeof nav?.maxTouchPoints === "number" &&
    nav.maxTouchPoints > 1 &&
    // userAgentData.mobile is reliable on Chromium; if it explicitly says
    // desktop (false on a Mac without touch), don't treat as iPad.
    nav?.userAgentData?.mobile !== false &&
    // Belt-and-suspenders: real iPads have no "Macintosh" + Chrome desktop UA.
    !/Android/i.test(ua);
  // Some iOS WebViews (Gmail, Facebook, Instagram, TikTok, LinkedIn) wrap
  // WebKit and may strip "iPhone" from the UA — detect via standalone flag
  // (iOS-only) when WebKit is present and Android is not.
  const isIosWebView =
    !/Android/i.test(ua) &&
    /AppleWebKit/.test(ua) &&
    typeof nav?.standalone === "boolean" &&
    /Mobile/.test(ua);
  const isIos = isAppleHardware || isIpadOsDesktopMode || isIosWebView;
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
      setTimeout(() => setJustInstalled(false), 2800);
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
  // iOS installs are clunky (manual Share → Add to Home Screen) and Apple
  // blocks beforeinstallprompt. Hide the button entirely on iPhone/iPad.
  if (isIos) return null;


  const handleClick = async () => {
    // 1. Native install prompt available → fire it immediately, no questions asked.
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem(INSTALLED_KEY, "1");
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
    // 4. Desktop/Android without a deferred prompt available yet
    //    (e.g. already-eligible Chrome that fired the event before mount, or
    //    PWA criteria not yet met). Skip the intro modal — just nudge with a
    //    short toast pointing at the address-bar install icon.
    toast("Tap the install icon ⊕ in your address bar", {
      description: "Or open your browser menu → Install app.",
      duration: 5000,
    });
  };

  const sizeClass =
    variant === "hero"
      ? "h-16 px-7 text-base rounded-2xl"
      : "h-10 px-4 text-xs rounded-xl";

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
              className={`${sizeClass} inline-flex items-center justify-center gap-2 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-display uppercase tracking-wider shadow-[0_0_24px_-4px_rgba(16,185,129,0.55)]`}
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
            className="relative inline-block group"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97, y: 1 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
          >
            {/* Soft ambient gold glow */}
            <motion.span
              aria-hidden
              className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.45),transparent_70%)] blur-xl -z-20"
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Thin gold outline pulse */}
            <motion.span
              aria-hidden
              className="absolute -inset-px rounded-2xl border border-amber-300/60 -z-10"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <Button
              onClick={handleClick}
              className={`${sizeClass} relative overflow-hidden border border-amber-200/40 text-amber-50 hover:text-amber-50 font-display font-bold uppercase tracking-[0.18em] gap-3 transition-all duration-300 bg-[linear-gradient(110deg,#1a1208_0%,#3d2a0c_25%,#8a6418_50%,#3d2a0c_75%,#1a1208_100%)] bg-[length:250%_100%] shadow-[0_12px_40px_-6px_rgba(251,191,36,0.55),inset_0_1px_0_0_rgba(255,220,130,0.6),inset_0_-1px_0_0_rgba(0,0,0,0.5)] hover:shadow-[0_20px_60px_-4px_rgba(251,191,36,0.9),inset_0_1px_0_0_rgba(255,220,130,0.75),inset_0_-1px_0_0_rgba(0,0,0,0.5)]`}
              style={{ animation: "shimmer 2.6s linear infinite" }}
            >
              {/* Top gold inner highlight strip */}
              <span
                aria-hidden
                className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-amber-100 to-transparent pointer-events-none"
              />
              {/* Bright diagonal light sweep */}
              <motion.span
                aria-hidden
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-amber-100/80 to-transparent skew-x-[-18deg] pointer-events-none blur-[1px]"
                animate={{ x: ["0%", "600%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
              />
              {/* Second faster white sparkle sweep */}
              <motion.span
                aria-hidden
                className="absolute inset-y-0 -left-1/4 w-1/6 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-25deg] pointer-events-none"
                animate={{ x: ["0%", "750%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear", repeatDelay: 1.4 }}
              />
              {/* Gold icon chip */}
              <span className={`relative flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_6px_rgba(0,0,0,0.4)] ${variant === "hero" ? "h-9 w-9" : "h-6 w-6"}`}>
                {deferred || !isInIframe ? (
                  <Download className={`text-zinc-950 ${variant === "hero" ? "h-4 w-4" : "h-3.5 w-3.5"}`} strokeWidth={3} />
                ) : (
                  <ExternalLink className={`text-zinc-950 ${variant === "hero" ? "h-4 w-4" : "h-3.5 w-3.5"}`} strokeWidth={3} />
                )}
              </span>
              {variant === "hero" ? (
                <span className="relative flex flex-col items-start leading-none">
                  <span className="text-[15px] bg-gradient-to-b from-amber-50 to-amber-200 bg-clip-text text-transparent">
                    Install App
                  </span>
                  <span className="text-[9px] font-semibold tracking-[0.3em] text-amber-300/70 mt-1.5">
                    Free · Instant
                  </span>
                </span>
              ) : (
                <span className="relative bg-gradient-to-b from-amber-50 to-amber-200 bg-clip-text text-transparent">Install</span>
              )}
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

                  {/* Animated Safari macOS demo */}
                  <div className="mb-2.5">
                    <SafariMacDemo />
                    <p className="mt-1.5 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
                      Live demo · loops automatically
                    </p>
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
