// Thin persistent ribbon under the navbar promoting the next Dragan Brakus Cup.
// - Hides itself 24h after the event ends.
// - User-dismissable for the current session (sessionStorage).
// - Auto-pulls live registered-player count from the DB.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Snapshot = {
  id: string;
  starts_at: string;
  registered: number;
  max_players: number;
};

const DISMISS_KEY = "brakus-ribbon-dismissed-v1";

function formatCountdown(diffMs: number) {
  if (diffMs <= 0) return "Live now";
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function BrakusRibbon() {
  const { user } = useAuth();
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const location = useLocation();

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("tournaments")
          .select("id, starts_at, max_players")
          .ilike("name", "%Dragan Brakus%")
          .order("starts_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled || !data) return;
        const { count } = await supabase
          .from("tournament_registrations")
          .select("user_id", { count: "exact", head: true })
          .eq("tournament_id", data.id);
        if (cancelled) return;
        setSnap({
          id: data.id,
          starts_at: data.starts_at,
          registered: count ?? 0,
          max_players: data.max_players || 500,
        });
      } catch (error) {
        console.info("[MasterChess Startup] Home background data skipped", { step: "BRAKUS_RIBBON", error });
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(i);
  }, []);

  // Don't render on the dedicated tournament pages — would be noise.
  const onBrakusPage = location.pathname.startsWith("/dragan-brakus");
  // Don't render while in a game (body[data-game-active])
  const inGame = typeof document !== "undefined" && document.body.dataset.gameActive === "true";

  if (!snap || dismissed || onBrakusPage || inGame) return null;

  const startMs = new Date(snap.starts_at).getTime();
  const hideAfter = startMs + 24 * 60 * 60 * 1000;
  if (now > hideAfter) return null;

  const countdown = formatCountdown(startMs - now);
  const dateLabel = new Date(snap.starts_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });

  return (
    <div className="fixed top-0 lg:top-16 left-0 right-0 z-40 pointer-events-none">
      <div className="pointer-events-auto bg-gradient-to-r from-yellow-500/95 via-amber-400/95 to-yellow-500/95 text-black border-b border-yellow-700/40 shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
        <div className="container mx-auto px-3 py-1.5 flex items-center gap-2 text-[12px] sm:text-sm font-semibold">
          <Trophy className="h-4 w-4 shrink-0" />
          <Link to="/dragan-brakus" className="flex-1 truncate hover:underline">
            <span className="hidden sm:inline">DB Chess Cup · {dateLabel} · </span>
            <span className="sm:hidden">DB Cup · </span>
            Starts in <span className="font-bold">{countdown}</span>
            <span className="hidden md:inline"> · {snap.registered}/{snap.max_players} registered</span>
          </Link>
          <Link
            to="/dragan-brakus"
            className="rounded-md bg-black/85 text-yellow-300 px-2.5 py-1 text-[11px] sm:text-xs font-bold hover:bg-black"
          >
            Register
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch {}
              setDismissed(true);
            }}
            className="ml-1 rounded p-1 hover:bg-black/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
