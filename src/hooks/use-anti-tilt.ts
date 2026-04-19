import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getSetting } from "@/lib/user-settings";

const SESSION_RATING_KEY = "chess-session-start-rating";
const SESSION_DATE_KEY = "chess-session-date";
const TILT_DISMISSED_KEY = "chess-tilt-dismissed-until";

export interface TiltStatus {
  isTilting: boolean;
  reason: "losses" | "rating" | null;
  consecutiveLosses: number;
  ratingDrop: number; // positive number = points lost in session
}

/**
 * Detects if the user is on a losing streak or has dropped rating significantly
 * within the current session. Reads notifTilt setting to allow opt-out.
 */
export function useAntiTilt(pollMs = 30_000): TiltStatus {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<TiltStatus>({
    isTilting: false,
    reason: null,
    consecutiveLosses: 0,
    ratingDrop: 0,
  });

  // Initialize session rating baseline once per day
  useEffect(() => {
    if (!profile) return;
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(SESSION_DATE_KEY);
    if (storedDate !== today) {
      localStorage.setItem(SESSION_DATE_KEY, today);
      localStorage.setItem(SESSION_RATING_KEY, String(profile.rating));
    } else if (!localStorage.getItem(SESSION_RATING_KEY)) {
      localStorage.setItem(SESSION_RATING_KEY, String(profile.rating));
    }
  }, [profile]);

  useEffect(() => {
    if (!user || !profile) return;
    const enabled = getSetting("notifTilt", true);
    if (!enabled) {
      setStatus({ isTilting: false, reason: null, consecutiveLosses: 0, ratingDrop: 0 });
      return;
    }

    let mounted = true;

    async function check() {
      // Respect dismiss window
      const dismissedUntil = Number(localStorage.getItem(TILT_DISMISSED_KEY) || 0);
      if (Date.now() < dismissedUntil) return;

      // Pull last 3 finished games
      const { data } = await supabase
        .from("online_games")
        .select("result, white_player_id, black_player_id, created_at")
        .or(`white_player_id.eq.${user!.id},black_player_id.eq.${user!.id}`)
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(3);

      let losses = 0;
      for (const g of data || []) {
        const isWhite = g.white_player_id === user!.id;
        const lost = (isWhite && g.result === "0-1") || (!isWhite && g.result === "1-0");
        if (lost) losses++;
        else break;
      }

      const sessionStart = Number(localStorage.getItem(SESSION_RATING_KEY) || profile!.rating);
      const drop = sessionStart - profile!.rating; // positive if rating dropped

      const tiltByLosses = losses >= 3;
      const tiltByRating = drop >= 40;
      const isTilting = tiltByLosses || tiltByRating;

      if (mounted) {
        setStatus({
          isTilting,
          reason: tiltByLosses ? "losses" : tiltByRating ? "rating" : null,
          consecutiveLosses: losses,
          ratingDrop: Math.max(0, drop),
        });
      }
    }

    check();
    const interval = setInterval(check, pollMs);
    return () => { mounted = false; clearInterval(interval); };
  }, [user, profile, pollMs]);

  return status;
}

export function dismissTiltWarning(minutes = 30) {
  localStorage.setItem(TILT_DISMISSED_KEY, String(Date.now() + minutes * 60_000));
}

export function resetSessionRating(rating: number) {
  localStorage.setItem(SESSION_RATING_KEY, String(rating));
  localStorage.setItem(SESSION_DATE_KEY, new Date().toDateString());
}
