/**
 * Finishes what an outage interrupted.
 *
 * When someone tried to create an account while the backend was unreachable we
 * kept their email locally. As soon as the backend answers again this strip
 * invites them back to /signup with the email prefilled — otherwise that
 * intent is simply lost.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import {
  probeBackend,
  getPendingSignup,
  clearPendingSignup,
  type PendingSignup,
} from "@/lib/backendHealth";

export default function PendingSignupResume() {
  const [pending, setPending] = useState<PendingSignup | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let stop = false;
    const check = async () => {
      const queued = getPendingSignup();
      if (!queued) {
        if (!stop) setPending(null);
        return;
      }
      const state = await probeBackend();
      if (!stop) setPending(state === "online" ? queued : null);
    };
    check();
    const id = window.setInterval(check, 60_000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [location.pathname]);

  // On /signup the page itself handles the queued email.
  if (!pending || dismissed || location.pathname.startsWith("/signup")) return null;

  return (
    <div
      role="status"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[55] rounded-xl border border-primary/40 bg-card/95 backdrop-blur p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold mb-1">Accounts are back online</p>
          <p className="text-xs text-muted-foreground mb-3">
            Finish the free account you started for {pending.email} — your games and streak get saved.
          </p>
          <div className="flex items-center gap-2">
            <Link
              to={`/signup?email=${encodeURIComponent(pending.email)}`}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all"
            >
              Finish signup
            </Link>
            <button
              onClick={() => {
                clearPendingSignup();
                setDismissed(true);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              No thanks
            </button>
          </div>
        </div>
        <button aria-label="Dismiss" onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
