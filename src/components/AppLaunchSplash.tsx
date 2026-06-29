import { useEffect, useState } from "react";
import { Crown } from "lucide-react";

/**
 * Ultra-light launch mark. It never waits for APIs or chunks: Home renders
 * underneath immediately, this layer just fades out fast.
 */
const SPLASH_MS = 260;

export default function AppLaunchSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    if (isInIframe) {
      setVisible(false);
      return;
    }
    const isHome = window.location.pathname === "/" || window.location.pathname === "";
    if (!isHome) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(false), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-background app-entry-splash pointer-events-none"
      aria-hidden="true"
    >
      <div className="app-entry-mark flex flex-col items-center text-center px-5">
        <div className="h-20 w-20 rounded-2xl border border-primary/45 bg-primary/10 grid place-items-center shadow-[0_20px_70px_hsl(var(--primary)/0.28)]">
          <Crown className="h-10 w-10 text-primary" />
        </div>
        <div className="mt-5 font-display text-4xl sm:text-6xl font-black uppercase text-primary leading-none">
          MASTERCHESS
        </div>
      </div>
    </div>
  );
}
