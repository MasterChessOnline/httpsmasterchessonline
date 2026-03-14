import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveTournament {
  tournament_id: string;
  tournament_name: string;
  tournament_status: string;
  starts_at: string;
  time_control_label: string;
  current_round: number;
  total_rounds: number;
}

export function useActiveTournament(userId: string | undefined) {
  const [activeTournament, setActiveTournament] = useState<ActiveTournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetch = async () => {
      // Find tournaments user is registered in that are NOT finished
      const { data: regs } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .eq("user_id", userId);

      if (!regs || regs.length === 0) {
        setActiveTournament(null);
        setLoading(false);
        return;
      }

      const tournamentIds = regs.map(r => r.tournament_id);

      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("id, name, status, starts_at, time_control_label, current_round, total_rounds")
        .in("id", tournamentIds)
        .in("status", ["registering", "active"]);

      if (tournaments && tournaments.length > 0) {
        // Prefer active over registering
        const active = tournaments.find(t => t.status === "active") || tournaments[0];
        setActiveTournament({
          tournament_id: active.id,
          tournament_name: active.name,
          tournament_status: active.status,
          starts_at: active.starts_at,
          time_control_label: active.time_control_label,
          current_round: active.current_round,
          total_rounds: active.total_rounds,
        });
      } else {
        setActiveTournament(null);
      }
      setLoading(false);
    };

    fetch();

    // Re-check on tournament changes
    const channel = supabase.channel(`active-tournament-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_registrations", filter: `user_id=eq.${userId}` }, () => fetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { activeTournament, loading };
}
