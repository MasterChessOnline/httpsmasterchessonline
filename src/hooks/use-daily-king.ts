import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DailyKing {
  reign_date: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  rating_gain: number;
  games_played: number;
}

let cache: { king: DailyKing | null; at: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export function useDailyKing() {
  const [king, setKing] = useState<DailyKing | null>(cache?.king ?? null);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cache && Date.now() - cache.at < TTL_MS) {
        setKing(cache.king);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_current_daily_king" as any);
      if (cancelled) return;
      if (error) {
        console.warn("daily king load:", error.message);
        setKing(null);
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        const k = row ? (row as DailyKing) : null;
        cache = { king: k, at: Date.now() };
        setKing(k);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return { king, loading };
}
