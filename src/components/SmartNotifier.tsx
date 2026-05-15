import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePresence } from "@/hooks/use-presence";
import { getRank } from "@/lib/ranks";

const PREFS_KEY = "mc:notif-prefs";

interface Prefs {
  friendOnline: boolean;
  rivalElo: boolean;
  rankUp: boolean;
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { friendOnline: true, rivalElo: true, rankUp: true, ...JSON.parse(raw) };
  } catch {}
  return { friendOnline: true, rivalElo: true, rankUp: true };
}

/**
 * Listens to presence + profile changes and surfaces opt-in toasts.
 * Mounted once at the App root. Realtime-only (no DB writes).
 */
export default function SmartNotifier() {
  const { user } = useAuth();
  const { onlineIds } = usePresence();
  const seenOnline = useRef<Set<string>>(new Set());
  const friends = useRef<Map<string, string>>(new Map()); // id -> display_name
  const prevRating = useRef<number | null>(null);
  const prevRank = useRef<string | null>(null);

  // Load friends + own profile baseline.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      const ids = new Set<string>();
      for (const f of friendships ?? []) {
        const other = f.user_id === user.id ? f.friend_id : f.user_id;
        ids.add(other);
      }
      if (ids.size) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", [...ids]);
        if (cancelled) return;
        const map = new Map<string, string>();
        for (const p of profs ?? []) map.set(p.user_id, p.display_name ?? "Friend");
        friends.current = map;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("rating")
        .eq("user_id", user.id)
        .maybeSingle();
      if (me?.rating != null) {
        prevRating.current = me.rating;
        prevRank.current = getRank(me.rating).key;
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Friend-online toasts.
  useEffect(() => {
    if (!user) return;
    const prefs = readPrefs();
    if (!prefs.friendOnline) {
      seenOnline.current = new Set(onlineIds);
      return;
    }
    for (const id of onlineIds) {
      if (id === user.id) continue;
      if (seenOnline.current.has(id)) continue;
      const name = friends.current.get(id);
      if (name) {
        toast(`${name} just went online`, { description: "Send a challenge?" });
      }
    }
    seenOnline.current = new Set(onlineIds);
  }, [onlineIds, user?.id]);

  // Listen to own profile changes for rank-up toast.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`profile-self-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const prefs = readPrefs();
          const newRating: number | undefined = payload?.new?.rating;
          if (typeof newRating !== "number") return;
          const old = prevRating.current;
          prevRating.current = newRating;

          if (prefs.rankUp && old != null) {
            const oldRank = getRank(old).key;
            const newRank = getRank(newRating).key;
            if (newRank !== oldRank && prevRank.current !== newRank) {
              prevRank.current = newRank;
              const r = getRank(newRating);
              toast.success(`Rank up! Welcome to ${r.label} ${r.icon}`, {
                description: `Rating: ${newRating}`,
              });
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return null;
}
