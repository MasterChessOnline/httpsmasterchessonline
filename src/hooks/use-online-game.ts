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
  const gameChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const eloUpdatedRef = useRef(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const myColor = game
    ? game.white_player_id === user?.id ? "w" : "b"
    : null;

  // Clean up all channels
  const cleanupChannels = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (gameChannelRef.current) {
      supabase.removeChannel(gameChannelRef.current);
      gameChannelRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const subscribeToGame = useCallback((gameId: string) => {
    if (gameChannelRef.current) supabase.removeChannel(gameChannelRef.current);

    const channel = supabase
      .channel(`online-game-${gameId}-${Date.now()}`)
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
          if (!eloUpdatedRef.current && updated.result) {
            eloUpdatedRef.current = true;
            supabase.rpc("update_elo_ratings", {
              p_white_id: updated.white_player_id,
              p_black_id: updated.black_player_id,
              p_result: updated.result,
            }).then(() => refreshProfile());
          }
        }
      })
      .subscribe();

    gameChannelRef.current = channel;

    // Also poll every 3s as backup for missed realtime events
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from("online_games")
        .select("*")
        .eq("id", gameId)
        .single();
      if (data) {
        setGame(prev => {
          // Only update if something changed
          if (!prev || prev.fen !== data.fen || prev.status !== data.status ||
              prev.white_time !== data.white_time || prev.black_time !== data.black_time) {
            if (data.status === "finished" && prev?.status !== "finished") {
              setStatus("finished");
              if (!eloUpdatedRef.current && data.result) {
                eloUpdatedRef.current = true;
                supabase.rpc("update_elo_ratings", {
                  p_white_id: data.white_player_id,
                  p_black_id: data.black_player_id,
                  p_result: data.result,
                }).then(() => refreshProfile());
              }
            }
            return data as OnlineGame;
          }
          return prev;
        });
      }
    }, 3000);
  }, [refreshProfile]);

  // Recover active game on mount
  useEffect(() => {
    if (!user) return;
    const recoverGame = async () => {
      const { data: activeGames } = await supabase
        .from("online_games")
        .select("*")
        .eq("status", "active")
        .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (activeGames && activeGames.length > 0) {
        const activeGame = activeGames[0] as OnlineGame;
        eloUpdatedRef.current = false;
        setGame(activeGame);
        setStatus("playing");
        subscribeToGame(activeGame.id);
      }
    };
    recoverGame();
  }, [user, subscribeToGame]);

  const searchMatch = useCallback(async (timeControlIdx: number) => {
    if (!user || !profile) return;
    setError(null);
    setStatus("searching");

    const tc = TIME_CONTROLS[timeControlIdx];

    // First clean up any stale queue entries from this user
    await supabase.from("matchmaking_queue").delete().eq("user_id", user.id);

    // Look for an opponent in queue
    const { data: queueEntries } = await supabase
      .from("matchmaking_queue")
      .select("*")
      .eq("time_control_label", tc.label)
      .neq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);

    if (queueEntries && queueEntries.length > 0) {
      const opponent = queueEntries[0];
      // Remove opponent from queue
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
      // Join queue and wait
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

      // Listen for game creation involving this user
      const queueChannel = supabase
        .channel(`matchmaking-${user.id}-${Date.now()}`)
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
            channelRef.current = null;

            // Clean queue entry
            if (queueEntryId.current) {
              await supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
              queueEntryId.current = null;
            }
          }
        })
        .subscribe();

      channelRef.current = queueChannel;

      // Also poll for game creation as backup
      const pollInterval = setInterval(async () => {
        const { data: games } = await supabase
          .from("online_games")
          .select("*")
          .eq("status", "active")
          .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (games && games.length > 0) {
          clearInterval(pollInterval);
          const foundGame = games[0] as OnlineGame;
          eloUpdatedRef.current = false;
          setGame(foundGame);
          setStatus("playing");
          subscribeToGame(foundGame.id);

          if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
          }
          if (queueEntryId.current) {
            await supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
            queueEntryId.current = null;
          }
        }
      }, 2000);

      // Store poll ref for cleanup
      const origCleanup = channelRef.current;
      channelRef.current = queueChannel;
      // Store poll interval cleanup in a separate mechanism
      const origPoll = pollRef.current;
      if (origPoll) clearInterval(origPoll);
      pollRef.current = pollInterval;
    }
  }, [user, profile, subscribeToGame]);

  const cancelSearch = useCallback(async () => {
    if (queueEntryId.current) {
      await supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
      queueEntryId.current = null;
    }
    cleanupChannels();
    setStatus("idle");
  }, [cleanupChannels]);

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
    cleanupChannels();
    setGame(null);
    setStatus("idle");
    setError(null);
    eloUpdatedRef.current = false;
  }, [cleanupChannels]);

  useEffect(() => {
    return () => {
      cleanupChannels();
      if (queueEntryId.current && user) {
        supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
      }
    };
  }, [user, cleanupChannels]);

  return { status, game, myColor, error, searchMatch, cancelSearch, makeMove, endGame, resign, reset };
}
