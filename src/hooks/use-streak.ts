import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_tournaments_played: number;
  last_participation_date: string | null;
}

export function useStreak(userId: string | undefined) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("tournament_streaks" as any)
        .select("current_streak, longest_streak, total_tournaments_played, last_participation_date")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setStreak(data as unknown as StreakData);
      }
      setLoading(false);
    };

    fetch();
  }, [userId]);

  return { streak, loading };
}
