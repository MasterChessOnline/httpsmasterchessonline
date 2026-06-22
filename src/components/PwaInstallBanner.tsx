// Smart PWA install prompt. Shows only:
// - on supported browsers (beforeinstallprompt event captured)
// - after the user has played at least 3 games (localStorage signal)
// - after a soft cooldown (7 days) since last dismiss
// - never inside iframes / Lovable preview
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

const DISMISS_KEY = "mc:pwa:dismissedAt";
const GAMES_KEY = "mc:games:played"; // already incremented elsewhere
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isPreviewOrEmbedded(): boolean {
  if (typeof window === "undefined") return true;
  if (window.top !== window.self) return true;
  const h = window.location.hostname;
  return (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h.endsWith(".lovableproject.com") ||
    h.endsWith(".lovable.app")
  );
}

export default function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isPreviewOrEmbedded()) return;
    // Already installed?
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);

      // Eligibility checks
      const gamesPlayed = parseInt(localStorage.getItem(GAMES_KEY) || "0", 10);
      const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
      const cooledDown = !dismissedAt || Date.now() - dismissedAt > COOLDOWN_MS;
      if (gamesPlayed >= 3 && cooledDown) {
        setShow(true);
        try {
          window.dispatchEvent(new CustomEvent("mc:track", { detail: { event: "pwa_install_prompt_shown" } }));
        } catch {}
      }
    };
    const onInstalled = () => {
      setShow(false);
      try {
        window.dispatchEvent(new CustomEvent("mc:track", { detail: { event: "pwa_installed" } }));
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      try {
        window.dispatchEvent(new CustomEvent("mc:track", { detail: { event: `pwa_prompt_${outcome}` } }));
      } catch {}
    } catch {}
    setShow(false);
    setDeferred(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[300] w-[92%] max-w-md">
      <div className="relative rounded-2xl border border-amber-500/40 bg-zinc-950/95 backdrop-blur-md p-4 shadow-[0_0_40px_hsl(43,95%,60%,0.2)] flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black">
          ♛
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-amber-200">Install MasterChess</div>
          <div className="text-xs text-zinc-400">Add to your home screen — faster, full screen, offline-ready.</div>
        </div>
        <Button size="sm" onClick={install} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
          <Download className="h-3.5 w-3.5 mr-1" /> Install
        </Button>
        <button
          aria-label="Dismiss install prompt"
          onClick={dismiss}
          className="absolute top-1 right-1 p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
