import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TournamentData {
  id: string;
  name: string;
  description: string;
  category: string;
  format: string;
  total_rounds: number;
  current_round: number;
  max_players: number;
  status: string;
  starts_at: string;
  time_control_label: string;
  time_control_seconds: number;
  time_control_increment: number;
  round_started_at: string | null;
}

export interface Registration {
  id: string;
  user_id: string;
  score: number;
  tiebreak: number;
  rating_at_join: number;
  display_name?: string;
  username?: string;
}

export interface Pairing {
  id: string;
  round: number;
  white_player_id: string;
  black_player_id: string | null;
  result: string | null;
  game_id: string | null;
}

export interface TournamentChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export function useTournament(tournamentId: string | undefined) {
  const { user } = useAuth();
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [chatMessages, setChatMessages] = useState<TournamentChatMessage[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  // Fetch initial data
  const fetchAll = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);

    const [tRes, regRes, pairRes, chatRes] = await Promise.all([
      supabase.from("tournaments").select("*").eq("id", tournamentId).single(),
      supabase.from("tournament_registrations").select("*").eq("tournament_id", tournamentId).order("score", { ascending: false }),
      supabase.from("tournament_pairings").select("*").eq("tournament_id", tournamentId).order("round").order("created_at"),
      supabase.from("tournament_chat_messages").select("*").eq("tournament_id", tournamentId).order("created_at", { ascending: true }).limit(100),
    ]);

    if (tRes.data) setTournament(tRes.data as TournamentData);
    
    // Enrich registrations with profile names
    const regs = (regRes.data || []) as Registration[];
    if (regs.length > 0) {
      const userIds = regs.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      for (const reg of regs) {
        const p = profileMap.get(reg.user_id);
        if (p) {
          reg.display_name = p.display_name || undefined;
          reg.username = p.username || undefined;
        }
      }
    }
    setRegistrations(regs);
    setPairings((pairRes.data || []) as Pairing[]);
    setChatMessages((chatRes.data || []) as TournamentChatMessage[]);

    if (user) {
      setIsRegistered(regs.some(r => r.user_id === user.id));
    }

    setLoading(false);
  }, [tournamentId, user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!tournamentId) return;

    const ch1 = supabase.channel(`t-${tournamentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments", filter: `id=eq.${tournamentId}` },
        (payload) => { if (payload.new) setTournament(payload.new as TournamentData); })
      .subscribe();

    const ch2 = supabase.channel(`tr-${tournamentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_registrations", filter: `tournament_id=eq.${tournamentId}` },
        () => { fetchAll(); })
      .subscribe();

    const ch3 = supabase.channel(`tp-${tournamentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_pairings", filter: `tournament_id=eq.${tournamentId}` },
        () => { fetchAll(); })
      .subscribe();

    const ch4 = supabase.channel(`tc-${tournamentId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tournament_chat_messages", filter: `tournament_id=eq.${tournamentId}` },
        (payload) => { setChatMessages(prev => [...prev, payload.new as TournamentChatMessage]); })
      .subscribe();

    channelsRef.current = [ch1, ch2, ch3, ch4];

    return () => {
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [tournamentId, fetchAll]);

  const join = useCallback(async () => {
    if (!tournamentId) return;
    const { data, error } = await supabase.functions.invoke("manage-tournament", {
      body: { action: "join", tournament_id: tournamentId },
    });
    if (error) throw error;
    setIsRegistered(true);
    return data;
  }, [tournamentId]);

  const leave = useCallback(async () => {
    if (!tournamentId) return;
    await supabase.functions.invoke("manage-tournament", {
      body: { action: "leave", tournament_id: tournamentId },
    });
    setIsRegistered(false);
  }, [tournamentId]);

  const startTournament = useCallback(async () => {
    if (!tournamentId) return;
    const { data, error } = await supabase.functions.invoke("manage-tournament", {
      body: { action: "start", tournament_id: tournamentId },
    });
    if (error) throw error;
    return data;
  }, [tournamentId]);

  const sendChat = useCallback(async (message: string) => {
    if (!tournamentId || !user) return;
    await supabase.from("tournament_chat_messages").insert({
      tournament_id: tournamentId,
      user_id: user.id,
      message,
    });
  }, [tournamentId, user]);

  const myPairing = pairings.find(p =>
    p.round === (tournament?.current_round || 0) &&
    user && (p.white_player_id === user.id || p.black_player_id === user.id)
  );

  return {
    tournament, registrations, pairings, chatMessages,
    isRegistered, loading, myPairing,
    join, leave, startTournament, sendChat, refetch: fetchAll,
  };
}
