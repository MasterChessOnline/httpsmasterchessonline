import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";

/**
 * Lightweight offline indicator. Non-blocking: the app continues to render
 * its current route; the banner just informs the user that some features
 * (multiplayer, ratings sync, etc.) may not work until they reconnect.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const on = () => {
      setOffline(false);
      setDismissed(false);
    };
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[200] max-w-[92vw] flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/85 backdrop-blur px-4 py-2 text-xs sm:text-sm text-amber-100 shadow-lg"
    >
      <WifiOff className="h-4 w-4 text-amber-300 shrink-0" aria-hidden />
      <span>You're offline. Some features may be unavailable.</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="ml-1 rounded-full p-1 hover:bg-white/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
