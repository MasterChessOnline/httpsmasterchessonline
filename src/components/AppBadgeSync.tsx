// Keeps the installed PWA's app icon badge in sync with pending challenges
// and unread direct messages. No-op on devices without Badging API support.
// Refreshes on Supabase realtime + on a 60s safety poll.

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { badgeSupported, setAppBadge } from "@/lib/app-badge";

const POLL_MS = 60_000;

const AppBadgeSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !badgeSupported()) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const [invites, dms] = await Promise.all([
          supabase
            .from("game_invites")
            .select("id", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("status", "pending")
            .gt("expires_at", new Date().toISOString()),
          supabase
            .from("direct_messages")
            .select("id", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .is("read_at", null),
        ]);
        if (cancelled) return;
        const total = (invites.count ?? 0) + (dms.count ?? 0);
        await setAppBadge(total);
      } catch {
        /* silent — badging is best-effort */
      }
    };

    refresh();
    const interval = setInterval(refresh, POLL_MS);

    // Realtime: update immediately on insert/update
    const channel = supabase
      .channel(`app-badge-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_invites", filter: `recipient_id=eq.${user.id}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_messages", filter: `recipient_id=eq.${user.id}` },
        refresh
      )
      .subscribe();

    // Refresh when app regains focus
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user]);

  return null;
};

export default AppBadgeSync;
