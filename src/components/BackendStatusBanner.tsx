/**
 * Honest outage banner. When the hosted database is unreachable, gameplay vs
 * bots still works — but signup, online play and tournaments cannot. Instead of
 * silent failures we say so, keep the visitor playing, and retry any queued
 * signup email as soon as the backend answers again.
 */
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { probeBackend, getPendingSignup, type BackendState } from "@/lib/backendHealth";

export default function BackendStatusBanner() {
  const [state, setState] = useState<BackendState>("unknown");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const next = await probeBackend(true);
      if (!stop) setState(next);
    };
    tick();
    // Re-check every 60s so the banner disappears on its own once resumed.
    const id = window.setInterval(tick, 60_000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);

  if (state !== "offline" || dismissed) return null;

  const pending = getPendingSignup();

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] bg-destructive/90 text-destructive-foreground text-xs sm:text-sm px-4 py-2 flex items-center gap-2 justify-center backdrop-blur"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="text-center">
        Accounts and online play are temporarily unavailable — games vs bots still work.
        {pending ? " Your email is saved; we'll finish your signup automatically." : ""}
      </span>
      <button
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="ml-1 opacity-80 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
