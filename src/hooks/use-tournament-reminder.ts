import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks every 60s if user has a tournament starting within 30 minutes
 * and sends a browser notification + toast reminder.
 */
export function useTournamentReminder(
  userId: string | undefined,
  onReminder?: (tournamentName: string, minutesUntil: number) => void
) {
  const lastRemindedId = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const checkReminder = async () => {
      // Get user's registrations
      const { data: regs } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .eq("user_id", userId);

      if (!regs || regs.length === 0) return;

      const ids = regs.map(r => r.tournament_id);

      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("id, name, starts_at, status")
        .in("id", ids)
        .eq("status", "registering");

      if (!tournaments) return;

      const now = Date.now();
      for (const t of tournaments) {
        const startsAt = new Date(t.starts_at).getTime();
        const diffMin = (startsAt - now) / (1000 * 60);

        // Notify if starts within 30 minutes and hasn't been reminded yet
        if (diffMin > 0 && diffMin <= 30 && lastRemindedId.current !== t.id) {
          lastRemindedId.current = t.id;

          // Browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`⏰ Tournament in ${Math.round(diffMin)} min!`, {
              body: `${t.name} starts soon. Get ready!`,
              icon: "/favicon.ico",
              tag: `reminder-${t.id}`,
            });
          }

          onReminder?.(t.name, Math.round(diffMin));
        }
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000); // check every minute

    return () => clearInterval(interval);
  }, [userId, onReminder]);
}
