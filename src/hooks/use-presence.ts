import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Real-time presence — every signed-in user joins a shared 'online-users'
 * channel. Returns { onlineIds, count } updated whenever someone joins/leaves.
 *
 * No DB writes — uses Supabase Realtime presence (in-memory). This keeps the
 * "ZERO fake engagement data" rule: counts reflect real users only.
 */
export function usePresence() {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });

    const sync = () => {
      const state = channel.presenceState();
      const ids = new Set<string>();
      for (const key of Object.keys(state)) ids.add(key);
      setOnlineIds(ids);
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: Date.now() });
        }
      });

    return () => {
      try { channel.untrack(); } catch {}
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { onlineIds, count: onlineIds.size, isOnline: (id: string) => onlineIds.has(id) };
}
