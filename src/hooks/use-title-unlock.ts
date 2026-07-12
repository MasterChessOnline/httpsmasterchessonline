// Detects when the current user crosses a title threshold and persists
// the highest title earned in profiles.highest_title_key so it never resets.

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getTitle, maxTitleKey } from "@/lib/titles";

export function useTitleUnlock() {
  const { user, profile, refreshProfile } = useAuth();
  const [unlockedKey, setUnlockedKey] = useState<string | null>(null);
  const attemptedPersistRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !profile) return;

    // Don't pop a title on a brand-new account. Wait until the user has actually
    // played at least one game (bot or online) — otherwise new signups instantly
    // see "Bot Hunter" because the default bot_rating is already above the
    // first threshold. Show a small intro experience first; titles come later.
    const botGames = (profile as any).bot_games_played ?? 0;
    const onlineGames = (profile as any).games_played ?? 0;
    if (botGames + onlineGames < 1) return;

    // Titles are driven by BOT rating and should use AI bot title labels/thresholds.
    const botRating = (profile as any).bot_rating ?? 1200;
    const currentTitle = getTitle(botRating, "bot");
    const highestKey = (profile as any).highest_title_key as string | undefined;
    const highest = maxTitleKey(highestKey, currentTitle.key);

    // If current title key is higher than what we've stored, that's a NEW unlock.
    if (currentTitle.key !== "unranked" && currentTitle.key !== highestKey && highest === currentTitle.key) {
      const attemptKey = `${user.id}:${currentTitle.key}`;
      if (attemptedPersistRef.current === attemptKey) return;
      attemptedPersistRef.current = attemptKey;
      setUnlockedKey(currentTitle.key);
      supabase
        .from("profiles")
        .update({ highest_title_key: currentTitle.key } as any)
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) {
            console.info("[MasterChess Startup] ERROR_STATE", { step: "TITLE_UNLOCK", message: "title persist skipped", error });
            return;
          }
          window.setTimeout(() => refreshProfile?.(), 0);
        });
    }
  }, [user?.id, profile, refreshProfile]);

  return {
    unlockedKey,
    dismiss: () => setUnlockedKey(null),
  };
}
