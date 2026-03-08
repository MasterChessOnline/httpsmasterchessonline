import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TIME_CONTROLS } from "@/components/ChessClock";

export type OnlineGameStatus = "idle" | "searching" | "playing" | "finished";

export interface OnlineGame {
  id: string;
  white_player_id: string;
  black_player_id: string;
  fen: string;
  pgn: string;
  status: string;
  result: string | null;
  white_time: number;
  black_time: number;
  time_control_label: string;
  increment: number;
  last_move_at: string | null;
  last_move_from: string | null;
  last_move_to: string | null;
  turn: string;
}

export function useOnlineGame() {
  const { user, profile, refreshProfile } = useAuth();
  const [status, setStatus] = useState<OnlineGameStatus>("idle");
  const [game, setGame] = useState<OnlineGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queueEntryId = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const eloUpdatedRef = useRef(false);

  const myColor = game
    ? game.white_player_id === user?.id ? "w" : "b"
    : null;

  const subscribeToGame = useCallback((gameId: string) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`online-game-${gameId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "online_games",
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        const updated = payload.new as OnlineGame;
        setGame(updated);
        if (updated.status === "finished") {
          setStatus("finished");
          // Update ELO ratings
          if (!eloUpdatedRef.current && updated.result) {
            eloUpdatedRef.current = true;
            supabase.rpc("update_elo_ratings", {
              p_white_id: updated.white_player_id,
              p_black_id: updated.black_player_id,
              p_result: updated.result,
            }).then(() => {
              refreshProfile();
            });
          }
        }
      })
      .subscribe();

    channelRef.current = channel;
  }, [refreshProfile]);

  const searchMatch = useCallback(async (timeControlIdx: number) => {
    if (!user || !profile) return;
    setError(null);
    setStatus("searching");

    const tc = TIME_CONTROLS[timeControlIdx];

    const { data: queueEntries } = await supabase
      .from("matchmaking_queue")
      .select("*")
      .eq("time_control_label", tc.label)
      .neq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);

    if (queueEntries && queueEntries.length > 0) {
      const opponent = queueEntries[0];
      await supabase.from("matchmaking_queue").delete().eq("id", opponent.id);

      const iAmWhite = Math.random() > 0.5;
      const whiteId = iAmWhite ? user.id : opponent.user_id;
      const blackId = iAmWhite ? opponent.user_id : user.id;

      const { data: newGame, error: createError } = await supabase
        .from("online_games")
        .insert({
          white_player_id: whiteId,
          black_player_id: blackId,
          white_time: tc.seconds || 600,
          black_time: tc.seconds || 600,
          time_control_label: tc.label,
          increment: tc.increment,
        })
        .select()
        .single();

      if (createError || !newGame) {
        setError("Failed to create game");
        setStatus("idle");
        return;
      }

      eloUpdatedRef.current = false;
      setGame(newGame as OnlineGame);
      setStatus("playing");
      subscribeToGame(newGame.id);
    } else {
      const { data: entry, error: queueError } = await supabase
        .from("matchmaking_queue")
        .insert({
          user_id: user.id,
          rating: profile.rating,
          time_control_label: tc.label,
        })
        .select()
        .single();

      if (queueError) {
        setError("Failed to join queue");
        setStatus("idle");
        return;
      }

      queueEntryId.current = entry.id;

      const queueChannel = supabase
        .channel("matchmaking-listen")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "online_games",
        }, async (payload) => {
          const newGame = payload.new as OnlineGame;
          if (newGame.white_player_id === user.id || newGame.black_player_id === user.id) {
            eloUpdatedRef.current = false;
            setGame(newGame);
            setStatus("playing");
            subscribeToGame(newGame.id);
            supabase.removeChannel(queueChannel);

            if (queueEntryId.current) {
              await supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
              queueEntryId.current = null;
            }
          }
        })
        .subscribe();

      channelRef.current = queueChannel;
    }
  }, [user, profile, subscribeToGame]);

  const cancelSearch = useCallback(async () => {
    if (queueEntryId.current) {
      await supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
      queueEntryId.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setStatus("idle");
  }, []);

  const makeMove = useCallback(async (
    fen: string, san: string, from: string, to: string, turn: string, whiteTime: number, blackTime: number
  ) => {
    if (!game) return;
    const newPgn = game.pgn ? `${game.pgn} ${san}` : san;
    await supabase.from("online_games").update({
      fen, pgn: newPgn, turn,
      last_move_from: from, last_move_to: to,
      last_move_at: new Date().toISOString(),
      white_time: whiteTime, black_time: blackTime,
    }).eq("id", game.id);
  }, [game]);

  const endGame = useCallback(async (result: string) => {
    if (!game) return;
    await supabase.from("online_games").update({ status: "finished", result }).eq("id", game.id);
    
    // Also call ELO update directly for the player who ended the game
    if (!eloUpdatedRef.current) {
      eloUpdatedRef.current = true;
      await supabase.rpc("update_elo_ratings", {
        p_white_id: game.white_player_id,
        p_black_id: game.black_player_id,
        p_result: result,
      });
      refreshProfile();
    }
  }, [game, refreshProfile]);

  const resign = useCallback(async () => {
    if (!game || !myColor) return;
    await endGame(myColor === "w" ? "0-1" : "1-0");
  }, [game, myColor, endGame]);

  const reset = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setGame(null);
    setStatus("idle");
    setError(null);
    eloUpdatedRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (queueEntryId.current && user) {
        supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
      }
    };
  }, [user]);

  return { status, game, myColor, error, searchMatch, cancelSearch, makeMove, endGame, resign, reset };
}
