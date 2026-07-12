import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StreakFlexTakeover from "./StreakFlexTakeover";

const STREAK_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: PromiseLike<T>, ms = STREAK_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(`timeout-${ms}ms`)), ms)),
  ]);
}

/**
 * Mount once globally. Subscribes to the authenticated user's win_streak and
 * triggers the milestone takeover when crossed. Lightweight — only polls on
 * focus + listens to profile updates.
 */
export default function StreakFlexController() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [allowTakeover, setAllowTakeover] = useState(false);

  useEffect(() => {
    setAllowTakeover(false);
    if (!user) return;
    let cancelled = false;

    const fetchStreak = async () => {
      try {
        const { data } = await withTimeout(
          supabase
            .from("profiles")
            .select("win_streak, username")
            .eq("user_id", user.id)
            .maybeSingle(),
        );
        if (cancelled || !data) return;
        setStreak(data.win_streak ?? 0);
        setUsername(data.username);
      } catch (error) {
        console.info("[MasterChess Startup] ERROR_STATE", { step: "STREAK_LOAD", message: "streak skipped", error });
      }
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
          if (typeof nw === "number") {
            setAllowTakeover(true);
            setStreak(nw);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user) return null;
  return <StreakFlexTakeover streak={allowTakeover ? streak : 0} username={username} />;
}
