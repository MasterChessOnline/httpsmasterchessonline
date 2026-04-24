import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Global user-avatar system.
 *
 * Single source of truth: `profiles.avatar_url` (+ display_name).
 * NEVER read avatars from snapshots stored on games/tournaments/chat rows.
 *
 * - Shared in-memory cache so all <UserAvatar/> instances for the same userId
 *   share one fetch.
 * - Single global realtime subscription on the `profiles` table — when any
 *   profile row updates, all consumers re-render with the new avatar.
 * - Cache-buster (?v=updated_at) appended to the public URL so browsers don't
 *   serve a stale image after upload.
 */

export type UserProfileLite = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

type Listener = (p: UserProfileLite | null) => void;

const cache = new Map<string, UserProfileLite | null>();
const inflight = new Map<string, Promise<UserProfileLite | null>>();
const listeners = new Map<string, Set<Listener>>();
let realtimeStarted = false;

function notify(userId: string) {
  const set = listeners.get(userId);
  if (!set) return;
  const value = cache.get(userId) ?? null;
  set.forEach((fn) => fn(value));
}

function ensureRealtime() {
  if (realtimeStarted) return;
  realtimeStarted = true;
  supabase
    .channel("global-profiles-avatar")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles" },
      (payload: any) => {
        const row = payload.new as UserProfileLite | undefined;
        if (!row?.user_id) return;
        // Only refresh entries we care about.
        if (!listeners.has(row.user_id) && !cache.has(row.user_id)) return;
        cache.set(row.user_id, {
          user_id: row.user_id,
          display_name: row.display_name ?? null,
          avatar_url: row.avatar_url ?? null,
          updated_at: row.updated_at ?? new Date().toISOString(),
        });
        notify(row.user_id);
      },
    )
    .subscribe();
}

async function fetchProfile(userId: string): Promise<UserProfileLite | null> {
  const existing = inflight.get(userId);
  if (existing) return existing;
  const p = (async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    const value = (data as UserProfileLite | null) ?? null;
    cache.set(userId, value);
    notify(userId);
    return value;
  })();
  inflight.set(userId, p);
  try {
    return await p;
  } finally {
    inflight.delete(userId);
  }
}

/** Imperatively update the cache (call after a local profile mutation). */
export function primeUserProfile(profile: Partial<UserProfileLite> & { user_id: string }) {
  const prev = cache.get(profile.user_id) ?? null;
  const next: UserProfileLite = {
    user_id: profile.user_id,
    display_name: profile.display_name ?? prev?.display_name ?? null,
    avatar_url: profile.avatar_url ?? prev?.avatar_url ?? null,
    updated_at: profile.updated_at ?? new Date().toISOString(),
  };
  cache.set(profile.user_id, next);
  notify(profile.user_id);
}

/** Build a cache-busted public URL so a freshly uploaded image is shown. */
export function bustedAvatarUrl(url: string | null | undefined, updatedAt?: string | null) {
  if (!url) return null;
  const v = updatedAt ? Date.parse(updatedAt) : 0;
  if (!v) return url;
  return url + (url.includes("?") ? "&" : "?") + "v=" + v;
}

export function useUserAvatar(userId: string | null | undefined) {
  const [profile, setProfile] = useState<UserProfileLite | null>(() =>
    userId ? cache.get(userId) ?? null : null,
  );

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    ensureRealtime();

    let active = true;
    const listener: Listener = (p) => {
      if (active) setProfile(p);
    };
    let set = listeners.get(userId);
    if (!set) {
      set = new Set();
      listeners.set(userId, set);
    }
    set.add(listener);

    const cached = cache.get(userId);
    if (cached !== undefined) {
      setProfile(cached);
    } else {
      fetchProfile(userId);
    }

    return () => {
      active = false;
      const s = listeners.get(userId);
      if (s) {
        s.delete(listener);
        if (s.size === 0) listeners.delete(userId);
      }
    };
  }, [userId]);

  return {
    profile,
    avatarUrl: bustedAvatarUrl(profile?.avatar_url ?? null, profile?.updated_at ?? null),
    displayName: profile?.display_name ?? null,
  };
}
