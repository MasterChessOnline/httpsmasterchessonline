import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeChessCard, type ChessCardProfile, type ChessCardGame } from "@/lib/chess-card";

interface ProfileLite {
  user_id: string;
  rating: number;
}

/**
 * Loads up to 50 most-recent finished online games for a user and computes
 * their Chess Card profile. Auto-refetches when userId changes.
 */
export function useChessCard(userId: string | undefined, rating: number | undefined) {
  const [card, setCard] = useState<ChessCardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setCard(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: qErr } = await supabase
          .from("online_games")
          .select("white_player_id,black_player_id,result,pgn,time_control_label,white_time,black_time,created_at")
          .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
          .eq("status", "finished")
          .order("created_at", { ascending: false })
          .limit(50);
        if (qErr) throw qErr;
        const games: ChessCardGame[] = (data ?? []).map(g => ({ ...g, source: "online" as const }));
        if (cancelled) return;
        setCard(computeChessCard(userId, rating ?? 1200, games));
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load Chess Card");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, rating]);

  return { card, loading, error };
}

export async function loadProfileForCard(userId: string): Promise<ProfileLite | null> {
  const { data } = await supabase
    .from("profiles")
    .select("user_id,rating,display_name,username,avatar_url")
    .eq("user_id", userId)
    .maybeSingle();
  return data as any;
}
