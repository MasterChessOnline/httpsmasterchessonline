import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TIME_CONTROLS } from "@/components/ChessClock";
import { calculateRatingChange, logOnlineRatingChange, type RatingCalcResult } from "@/lib/rating-system";
import { bumpMissionProgress } from "@/hooks/use-daily-missions";

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
  is_rated?: boolean;
}

export function useOnlineGame() {
  const { user, profile, refreshProfile } = useAuth();
  const [status, setStatus] = useState<OnlineGameStatus>("idle");
  const [game, setGame] = useState<OnlineGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratingResult, setRatingResult] = useState<RatingCalcResult | null>(null);
  const queueEntryId = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const gameChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const eloUpdatedRef = useRef(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const myColor = game
    ? game.white_player_id === user?.id ? "w" : "b"
    : null;

  // Helper: apply elo + log rating history + compute the user's RatingCalcResult
  const applyEloAndLog = useCallback(async (g: { white_player_id: string; black_player_id: string; result: string; is_rated?: boolean }) => {
    if (!user) return;

    // Casual games: skip rating updates entirely.
    if (g.is_rated === false) {
      setRatingResult(null);
      try {
        await bumpMissionProgress(user.id, "games_played", 1);
      } catch {}
      return;
    }

    // Snapshot opponent + my old rating BEFORE the RPC mutates them
    const isWhite = g.white_player_id === user.id;
    const opponentId = isWhite ? g.black_player_id : g.white_player_id;
    const [{ data: meBefore }, { data: oppBefore }] = await Promise.all([
      supabase.from("profiles").select("rating, games_played").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("rating, display_name, username").eq("user_id", opponentId).maybeSingle(),
    ]);
    const myOld = (meBefore as any)?.rating ?? 1200;
    const oppRating = (oppBefore as any)?.rating ?? 1200;
    const myGames = (meBefore as any)?.games_played ?? 0;
    const oppLabel = (oppBefore as any)?.display_name ?? (oppBefore as any)?.username ?? "Player";

    await supabase.rpc("update_elo_ratings", {
      p_white_id: g.white_player_id,
      p_black_id: g.black_player_id,
      p_result: g.result,
    });

    const myResult: "win" | "loss" | "draw" =
      g.result === "1/2-1/2" ? "draw"
      : (g.result === "1-0" && isWhite) || (g.result === "0-1" && !isWhite) ? "win"
      : "loss";

    const calc = calculateRatingChange({
      playerRating: myOld,
      opponentRating: oppRating,
      result: myResult,
      gamesPlayed: myGames,
    });
    setRatingResult(calc);

    await logOnlineRatingChange({
      userId: user.id,
      oldRating: myOld,
      newRating: calc.newRating,
      opponentRating: oppRating,
      opponentLabel: oppLabel,
      result: myResult,
    });
    await refreshProfile();

    // Daily missions: increment counters for online games
    try {
      await bumpMissionProgress(user.id, "games_played", 1);
      if (myResult === "win") {
        await bumpMissionProgress(user.id, "games_won", 1);
      }
    } catch (err) {
      console.warn("Mission bump failed", err);
    }
  }, [user, refreshProfile]);


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

    // Track most-recent server timestamp we've already applied so that
    // out-of-order realtime events / poll fetches can never overwrite a
    // newer FEN with a stale one (which is what caused the "ghost duplicate
    // move" effect for the local player).
    let lastAppliedAt = 0;

    const applyServerSnapshot = (incoming: OnlineGame) => {
      const ts = incoming.last_move_at ? new Date(incoming.last_move_at).getTime() : 0;
      setGame(prev => {
        if (!prev) {
          lastAppliedAt = ts;
          return incoming;
        }
        // Stale snapshot — older move timestamp than what we already applied.
        // This is the main defense against echo-overwrite ("ghost double move").
        if (ts && ts < lastAppliedAt) return prev;
        // Same timestamp & same FEN as what we already have → it's our own
        // optimistic write coming back. Keep referential equality so React
        // doesn't re-render the board (which would briefly flicker pieces).
        if (
          prev.fen === incoming.fen &&
          prev.pgn === incoming.pgn &&
          prev.status === incoming.status &&
          prev.last_move_at === incoming.last_move_at
        ) {
          // Adopt clock values even on a no-op snapshot so increment lands,
          // but only if they actually changed — otherwise return prev.
          if (prev.white_time === incoming.white_time && prev.black_time === incoming.black_time) {
            return prev;
          }
          return { ...prev, white_time: incoming.white_time, black_time: incoming.black_time };
        }
        lastAppliedAt = Math.max(lastAppliedAt, ts);
        return incoming;
      });

      if (incoming.status === "finished") {
        setStatus("finished");
        if (!eloUpdatedRef.current && incoming.result) {
          eloUpdatedRef.current = true;
          applyEloAndLog({
            white_player_id: incoming.white_player_id,
            black_player_id: incoming.black_player_id,
            result: incoming.result,
            is_rated: incoming.is_rated,
          });
        }
      }
    };

    const channel = supabase
      .channel(`online-game-${gameId}-${Date.now()}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "online_games",
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        applyServerSnapshot(payload.new as OnlineGame);
      })
      .subscribe();

    gameChannelRef.current = channel;

    // Backup poll — slightly slower so it doesn't fight realtime updates
    // and never reverts a fresher local state.
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from("online_games")
        .select("*")
        .eq("id", gameId)
        .single();
      if (data) applyServerSnapshot(data as OnlineGame);
    }, 5000);
  }, [applyEloAndLog]);

  // Recover active game on mount — prefer ?game=ID from URL if present
  useEffect(() => {
    if (!user) return;
    const recoverGame = async () => {
      // 1) Try the explicit ?game=ID from the URL first (challenge accept flow)
      const params = new URLSearchParams(window.location.search);
      const requestedId = params.get("game");

      if (requestedId) {
        const { data: byId } = await supabase
          .from("online_games")
          .select("*")
          .eq("id", requestedId)
          .maybeSingle();
        if (byId && (byId.white_player_id === user.id || byId.black_player_id === user.id)) {
          eloUpdatedRef.current = false;
          setGame(byId as OnlineGame);
          setStatus(byId.status === "finished" ? "finished" : "playing");
          subscribeToGame(byId.id);
          return;
        }
      }

      // 2) Fallback: most recent active game involving this user
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
      await applyEloAndLog({
        white_player_id: game.white_player_id,
        black_player_id: game.black_player_id,
        result,
        is_rated: game.is_rated,
      });
    }
  }, [game, applyEloAndLog]);

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

  return { status, game, myColor, error, ratingResult, searchMatch, cancelSearch, makeMove, endGame, resign, reset };
}
