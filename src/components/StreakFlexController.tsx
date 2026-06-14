import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StreakFlexTakeover from "./StreakFlexTakeover";

/**
 * Mount once globally. Subscribes to the authenticated user's win_streak and
 * triggers the milestone takeover when crossed. Lightweight — only polls on
 * focus + listens to profile updates.
 */
export default function StreakFlexController() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchStreak = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("win_streak, username")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      setStreak(data.win_streak ?? 0);
      setUsername(data.username);
    };

    fetchStreak();
    const onFocus = () => fetchStreak();
    window.addEventListener("focus", onFocus);

    const channel = supabase
      .channel(`streak-flex-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const nw = (payload.new as any)?.win_streak;
          if (typeof nw === "number") setStreak(nw);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) return null;
  return <StreakFlexTakeover streak={streak} username={username} />;
}
