import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyStreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  freeze_available: boolean;
  freeze_used_date: string | null;
  total_active_days: number;
}

const today = () => new Date().toISOString().slice(0, 10);

function diffInDays(from: string, to: string) {
  const a = new Date(from + "T00:00:00Z").getTime();
  const b = new Date(to + "T00:00:00Z").getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function useDailyStreak() {
  const { user } = useAuth();
  const [data, setData] = useState<DailyStreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    const { data: row } = await supabase
      .from("user_daily_streaks" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setData((row as any) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Touch streak on activity (call once per session)
  const touchStreak = useCallback(async () => {
    if (!user) return;
    const t = today();

    const { data: row } = await supabase
      .from("user_daily_streaks" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!row) {
      await supabase.from("user_daily_streaks" as any).insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: t,
        total_active_days: 1,
        freeze_available: true,
      });
      await fetchStreak();
      return;
    }

    const r = row as any;
    if (r.last_active_date === t) return; // already counted today

    const days = r.last_active_date ? diffInDays(r.last_active_date, t) : 999;
    let newStreak = r.current_streak;
    let freezeAvailable = r.freeze_available;
    let freezeUsedDate = r.freeze_used_date;

    if (days === 1) {
      newStreak = r.current_streak + 1;
    } else if (days === 2 && r.freeze_available) {
      // Use freeze to save streak
      newStreak = r.current_streak + 1;
      freezeAvailable = false;
      freezeUsedDate = t;
    } else {
      newStreak = 1;
      // Restore freeze on broken streak
      freezeAvailable = true;
      freezeUsedDate = null;
    }

    const longest = Math.max(r.longest_streak, newStreak);

    await supabase
      .from("user_daily_streaks" as any)
      .update({
        current_streak: newStreak,
        longest_streak: longest,
        last_active_date: t,
        total_active_days: r.total_active_days + 1,
        freeze_available: freezeAvailable,
        freeze_used_date: freezeUsedDate,
      })
      .eq("user_id", user.id);

    await fetchStreak();
  }, [user, fetchStreak]);

  return { data, loading, touchStreak, refresh: fetchStreak };
}
