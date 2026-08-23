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
type Listener = (ids: Set<string>) => void;

/**
 * One shared realtime channel for the whole app. Supabase reuses a channel per
 * topic, so creating "online-users" twice threw
 * "cannot add `presence` callbacks ... after `subscribe()`" and crashed pages
 * that mount two presence consumers (e.g. /profile).
 */
const shared = {
  channel: null as ReturnType<typeof supabase.channel> | null,
  userId: null as string | null,
  ids: new Set<string>(),
  listeners: new Set<Listener>(),
};

function joinShared(userId: string, listener: Listener) {
  shared.listeners.add(listener);

  if (shared.channel && shared.userId === userId) {
    listener(shared.ids);
    return () => leaveShared(listener);
  }

  if (shared.channel) {
    supabase.removeChannel(shared.channel);
    shared.channel = null;
  }

  const channel = supabase.channel("online-users", {
    config: { presence: { key: userId } },
  });
  shared.channel = channel;
  shared.userId = userId;

  const sync = () => {
    const state = channel.presenceState();
    shared.ids = new Set(Object.keys(state));
    shared.listeners.forEach((l) => l(shared.ids));
  };

  channel
    .on("presence", { event: "sync" }, sync)
    .on("presence", { event: "join" }, sync)
    .on("presence", { event: "leave" }, sync)
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: userId, online_at: Date.now() });
      }
    });

  return () => leaveShared(listener);
}

function leaveShared(listener: Listener) {
  shared.listeners.delete(listener);
  if (shared.listeners.size > 0 || !shared.channel) return;
  try { shared.channel.untrack(); } catch { /* ignore */ }
  supabase.removeChannel(shared.channel);
  shared.channel = null;
  shared.userId = null;
  shared.ids = new Set();
}

export function usePresence() {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    return joinShared(user.id, (ids) => setOnlineIds(new Set(ids)));
  }, [user?.id]);

  return { onlineIds, count: onlineIds.size, isOnline: (id: string) => onlineIds.has(id) };
}
