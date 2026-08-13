// Site-wide "Create free account" bar for visitors without an account.
// Hidden for signed-in users, on auth pages, and while a board is on screen.
import { Link, useLocation } from "react-router-dom";
import { Crown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const HIDDEN_EXACT = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);
const HIDDEN_PREFIXES = ["/play", "/game", "/online", "/analysis", "/study", "/puzzle", "/admin"];

const DISMISS_KEY = "mc:guest-signup-bar-dismissed";

export default function GuestSignupBar() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try { setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1"); } catch { setDismissed(false); }
  }, []);

  if (loading || user || dismissed) return null;
  if (HIDDEN_EXACT.has(pathname)) return null;
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <div className="sticky top-0 z-[60] w-full border-b border-primary/25 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-3 py-2 text-xs sm:text-sm">
        <span className="text-muted-foreground">
          No account yet? Save your games, rating and stats.
        </span>
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          <Crown className="h-3.5 w-3.5" /> Create free account
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setDismissed(true);
            try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
          }}
          className="ml-1 text-muted-foreground/70 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
