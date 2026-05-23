import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TIME_CONTROLS } from "@/components/ChessClock";
import { calculateRatingChange, logOnlineRatingChange, type RatingCalcResult } from "@/lib/rating-system";
import { bumpMissionProgress } from "@/hooks/use-daily-missions";

export type OnlineGameStatus = "idle" | "searching" | "playing" | "finished";

export type EndReason =
  | "checkmate"
  | "resignation"
  | "timeout"
  | "stalemate"
  | "threefold"
  | "fifty_move"
  | "insufficient_material"
  | "agreement";

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
  move_number?: number;
  is_rated?: boolean;
  end_reason?: EndReason | null;
  elo_applied?: boolean;
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
  const endingRef = useRef(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const myColor = game
    ? game.white_player_id === user?.id ? "w" : "b"
    : null;

  type RatingPreview = {
    calc: RatingCalcResult;
    opponentRating: number;
    opponentLabel: string;
    myResult: "win" | "loss" | "draw";
  };

  const buildRatingPreview = useCallback(async (g: { white_player_id: string; black_player_id: string; result: string; is_rated?: boolean }): Promise<RatingPreview | null> => {
    if (!user || g.is_rated === false) return null;

    const isWhite = g.white_player_id === user.id;
    const opponentId = isWhite ? g.black_player_id : g.white_player_id;
    const [{ data: meBefore }, { data: oppBefore }] = await Promise.all([
      supabase.from("profiles").select("rating, games_played").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("rating, display_name, username").eq("user_id", opponentId).maybeSingle(),
    ]);

    // Prefer the AuthContext profile as the user's OLD rating. It is still the
    // pre-finalization value while the backend RPC applies the official change.
    const myOld = profile?.rating ?? (meBefore as any)?.rating ?? 1200;
    const myGames = profile?.games_played ?? (meBefore as any)?.games_played ?? 0;
    const opponentRating = (oppBefore as any)?.rating ?? 1200;
    const opponentLabel = (oppBefore as any)?.display_name ?? (oppBefore as any)?.username ?? "Player";
    const myResult: "win" | "loss" | "draw" =
      g.result === "1/2-1/2" ? "draw"
      : (g.result === "1-0" && isWhite) || (g.result === "0-1" && !isWhite) ? "win"
      : "loss";

    const calc = calculateRatingChange({
      playerRating: myOld,
      opponentRating,
      result: myResult,
      gamesPlayed: myGames,
    });
    setRatingResult(calc);
    return { calc, opponentRating, opponentLabel, myResult };
  }, [user, profile?.rating, profile?.games_played]);

  // Helper: log rating history + compute the user's RatingCalcResult.
  // NOTE: Elo on the profiles table is now applied atomically by the
  // `finalize_online_game` RPC (server-side, exactly once per game).
  // This function ONLY snapshots ratings + writes a rating_history row + bumps missions.
  const applyEloAndLog = useCallback(async (g: { id: string; white_player_id: string; black_player_id: string; result: string; is_rated?: boolean }, preview?: RatingPreview | null) => {
    if (!user) return;

    // Casual games: skip rating display entirely.
    if (g.is_rated === false) {
      setRatingResult(null);
      try { await bumpMissionProgress(user.id, "games_played", 1); } catch {}
      return;
    }

    const rating = preview ?? await buildRatingPreview(g);
    if (!rating) return;

    // After the RPC, fetch the official server rating so the card shows the
    // exact loss/gain that was applied, not only a client-side prediction.
    const { data: meAfter } = await supabase
      .from("profiles")
      .select("rating")
      .eq("user_id", user.id)
      .maybeSingle();
    const officialNew = (meAfter as any)?.rating ?? rating.calc.newRating;
    const finalCalc: RatingCalcResult = {
      ...rating.calc,
      newRating: officialNew,
      change: officialNew - rating.calc.oldRating,
    };
    setRatingResult(finalCalc);

    // Log to rating_history (idempotent? — checked by uniqueness on (user_id, created_at) in practice).
    // Wrapped so a duplicate insert never crashes the UI.
    try {
      await logOnlineRatingChange({
        userId: user.id,
        oldRating: finalCalc.oldRating,
        newRating: finalCalc.newRating,
        opponentRating: rating.opponentRating,
        opponentLabel: rating.opponentLabel,
        result: rating.myResult,
      });
    } catch (err) {
      console.warn("rating_history log failed (likely duplicate)", err);
    }
    await refreshProfile();

    try {
      await bumpMissionProgress(user.id, "games_played", 1);
      if (rating.myResult === "win") await bumpMissionProgress(user.id, "games_won", 1);
    } catch (err) {
      console.warn("Mission bump failed", err);
    }
  }, [user, refreshProfile, buildRatingPreview]);


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
        const ratingIsAuthoritative = incoming.is_rated === false || incoming.elo_applied === true;
        if (!eloUpdatedRef.current && incoming.result && ratingIsAuthoritative) {
          eloUpdatedRef.current = true;
          applyEloAndLog({
            id: incoming.id,
            white_player_id: incoming.white_player_id,
            black_player_id: incoming.black_player_id,
            result: incoming.result,
            is_rated: incoming.is_rated,
          });
        }
      }
    };

    const channel = supabase
      .channel(`online-game-${gameId}`, { config: { broadcast: { self: false, ack: false } } })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "online_games",
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        applyServerSnapshot(payload.new as OnlineGame);
      })
      // Instant peer-to-peer move broadcast (~50-150ms vs DB realtime ~300-800ms).
      // Sender broadcasts a snapshot immediately after the optimistic update;
      // receiver applies it via the same dedupe path (lastAppliedAt).
      .on("broadcast", { event: "move" }, (payload) => {
        const snap = (payload as any).payload as Partial<OnlineGame>;
        if (snap && snap.fen) applyServerSnapshot(snap as OnlineGame);
      })
      // Authoritative move-log insert lands before/with the game row update and
      // gives the opponent an instant, server-confirmed snapshot. This avoids
      // relying on the sender's optimistic broadcast after move #1.
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "online_game_moves",
        filter: `game_id=eq.${gameId}`,
      }, (payload) => {
        const move = payload.new as any;
        setGame(prev => {
          if (!prev) return prev;
          const nextMoveNumber = move.ply ?? (prev.move_number ?? 0) + 1;
          if ((prev.move_number ?? 0) >= nextMoveNumber) return prev;
          const snapshot: OnlineGame = {
            ...prev,
            fen: move.fen_after,
            pgn: move.pgn_after,
            turn: move.color === "w" ? "b" : "w",
            move_number: nextMoveNumber,
            last_move_from: move.from_square,
            last_move_to: move.to_square,
            last_move_at: move.created_at,
            white_time: move.white_time,
            black_time: move.black_time,
          };
          return snapshot;
        });
      })
      .subscribe();

    gameChannelRef.current = channel;

    // Backup poll — 1.5s so even if realtime stalls, both sides converge fast.
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from("online_games")
        .select("*")
        .eq("id", gameId)
        .single();
      if (data) applyServerSnapshot(data as OnlineGame);
    }, 750);
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
          // Don't auto-resume a finished game — that would re-show the old
          // result on the lobby and block the user from starting a new match.
          if (byId.status === "finished") return;
          eloUpdatedRef.current = false; endingRef.current = false;
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
        eloUpdatedRef.current = false; endingRef.current = false;
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

    // Phase 1 guard: 1 user = 1 active game. Server clears stale links + queue rows.
    const { data: gate } = await supabase.rpc("assert_can_queue" as any);
    if (gate && (gate as any).ok === false) {
      const activeId = (gate as any).game_id as string | undefined;
      if ((gate as any).error === "already_in_game" && activeId) {
        setError("You already have an active game. Resume it before starting a new one.");
        // Auto-load the in-progress game so the player can continue.
        await loadGameById(activeId);
      } else {
        setError("Cannot join queue right now.");
      }
      return;
    }

    setStatus("searching");

    const tc = TIME_CONTROLS[timeControlIdx];

    // (Server already cleaned queue rows in assert_can_queue, but keep this for safety.)
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

      // User always plays white (white moves first).
      const iAmWhite = true;
      const whiteId = iAmWhite ? user.id : opponent.user_id;
      const blackId = iAmWhite ? opponent.user_id : user.id;

      // Atomic creation with 1-game-per-user enforcement.
      const { data: startRes, error: startErr } = await supabase.rpc("start_online_game" as any, {
        p_white_id: whiteId,
        p_black_id: blackId,
        p_white_time: tc.seconds || 600,
        p_black_time: tc.seconds || 600,
        p_time_control_label: tc.label,
        p_increment: tc.increment,
      });
      const startOk = startRes && (startRes as any).ok === true;
      const newGame = startOk ? ((startRes as any).game as OnlineGame) : null;
      if (startErr || !newGame) {
        const reason = (startRes as any)?.error;
        if (reason === "white_busy" || reason === "black_busy") {
          setError("One of the players is already in another game.");
        } else {
          setError("Failed to create game");
        }
        setStatus("idle");
        return;
      }

      eloUpdatedRef.current = false; endingRef.current = false;
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
            eloUpdatedRef.current = false; endingRef.current = false;
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
          eloUpdatedRef.current = false; endingRef.current = false;
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
    fenBefore: string, fen: string, san: string, from: string, to: string, turn: string, whiteTime: number, blackTime: number,
    promotion?: string, finish?: { result: string; endReason: EndReason }
  ) => {
    if (!game) return;
    const newPgn = game.pgn ? `${game.pgn} ${san}` : san;
    const nowIso = new Date().toISOString();
    const expectedMoveNumber = game.move_number ?? 0;
    const movingColor = game.turn;

    // Optimistic local update so the board never feels laggy. The server echo
    // (realtime + poll) will be deduped by applyServerSnapshot since the
    // last_move_at is already set to nowIso below.
    setGame(prev => prev ? {
      ...prev,
      fen, pgn: newPgn, turn,
      move_number: expectedMoveNumber + 1,
      last_move_from: from, last_move_to: to,
      last_move_at: nowIso,
      white_time: whiteTime, black_time: blackTime,
      status: finish ? "finished" : prev.status,
      result: finish?.result ?? prev.result,
      end_reason: finish?.endReason ?? prev.end_reason,
    } : prev);

    const updatePayload = {
      fen, pgn: newPgn, turn,
      move_number: expectedMoveNumber + 1,
      last_move_from: from, last_move_to: to,
      last_move_at: nowIso,
      white_time: whiteTime, black_time: blackTime,
      status: finish ? "finished" : game.status,
      result: finish?.result ?? game.result,
      end_reason: finish?.endReason ?? game.end_reason,
    };

    // Fire instant broadcast to opponent BEFORE awaiting DB write so the
    // opponent's board updates in ~50-150ms instead of waiting for DB realtime.
    if (gameChannelRef.current) {
      gameChannelRef.current.send({
        type: "broadcast",
        event: "move",
        payload: { ...game, ...updatePayload },
      });
    }

    const { data, error: moveErr } = await supabase.rpc("commit_online_move" as any, {
      p_game_id: game.id,
      p_expected_move_number: expectedMoveNumber,
      p_fen_before: fenBefore,
      p_fen_after: fen,
      p_san: san,
      p_pgn_after: newPgn,
      p_from: from,
      p_to: to,
      p_promotion: promotion ?? null,
      p_color: movingColor,
      p_turn_after: turn,
      p_white_time: whiteTime,
      p_black_time: blackTime,
      p_result: finish?.result ?? null,
      p_end_reason: finish?.endReason ?? null,
    });

    const rpcGame = (data as any)?.game as OnlineGame | undefined;
    if (rpcGame) setGame(rpcGame);
    if (moveErr || (data as any)?.ok === false) {
      const fallbackGame = (data as any)?.game as OnlineGame | undefined;
      if (fallbackGame) setGame(fallbackGame);
      else {
        const { data: fresh } = await supabase.from("online_games").select("*").eq("id", game.id).single();
        if (fresh) setGame(fresh as OnlineGame);
      }
    } else if (rpcGame && rpcGame.status === "active") {
      // Notify opponent it's their turn (best-effort, non-blocking)
      const opponentId = movingColor === "w" ? game.black_player_id : game.white_player_id;
      if (opponentId) {
        supabase.functions.invoke("push-send", {
          body: {
            user_ids: [opponentId],
            type: "your_turn",
            payload: {
              title: "♟️ It's your turn",
              body: `Opponent played ${san}. Make your move!`,
              url: `/play/online?game=${game.id}`,
              tag: `turn-${game.id}`,
            },
          },
        }).catch(() => {});
      }
    }
  }, [game]);

  // Atomic finalize via RPC: marks finished + sets end_reason + applies Elo exactly once.
  // Safe to call from BOTH players concurrently — only one mutation actually lands.
  // CRITICAL: optimistically flip local state FIRST so the UI locks instantly and the
  // user sees Game Over even if the network round-trip is slow or fails.
  const endGame = useCallback(async (result: string, endReason: EndReason = "checkmate") => {
    if (!game) return { ok: false as const, error: "no_game" };
    if (endingRef.current) return { ok: true as const };
    endingRef.current = true;

    // Snapshot rating immediately, BEFORE the server mutates profiles, so the
    // player sees the rating loss/gain as soon as the game is resigned/ended.
    const ratingPreviewPromise = buildRatingPreview({
      white_player_id: game.white_player_id,
      black_player_id: game.black_player_id,
      result,
      is_rated: game.is_rated,
    });

    // 1) Instant local UI flip — board locks, overlay shows, sounds trigger.
    setGame(prev => prev ? ({ ...prev, status: "finished", result, end_reason: endReason } as OnlineGame) : prev);
    setStatus("finished");

    // Broadcast finished snapshot instantly. The opponent should see "You Won"
    // without waiting for database realtime/polling.
    if (gameChannelRef.current) {
      const finishedAt = new Date().toISOString();
      gameChannelRef.current.send({
        type: "broadcast",
        event: "move",
        payload: { ...game, status: "finished", result, end_reason: endReason, last_move_at: finishedAt },
      });
    }

    // 2) Server-authoritative finalize. Try RPC, fall back to direct update.
    let serverOk = false;
    try {
      const { data, error: rpcErr } = await supabase.rpc("finalize_online_game" as any, {
        p_game_id: game.id,
        p_result: result,
        p_end_reason: endReason,
      });
      if (!rpcErr && (data as any)?.ok !== false) serverOk = true;
      else console.warn("finalize_online_game RPC failed", rpcErr, data);
      const rpcGame = (data as any)?.game as OnlineGame | undefined;
      if (rpcGame) setGame(rpcGame);
    } catch (e) {
      console.warn("finalize_online_game threw", e);
    }
    if (!serverOk) {
      const { error: updErr } = await supabase
        .from("online_games")
        .update({ status: "finished", result, end_reason: endReason })
        .eq("id", game.id);
      const { data: verifyGame } = await supabase.from("online_games").select("*").eq("id", game.id).single();
      if (verifyGame) setGame(verifyGame as OnlineGame);
      if (updErr || verifyGame?.status !== "finished" || verifyGame?.result !== result) {
        console.error("Direct finalize update also failed", updErr);
        endingRef.current = false;
        return { ok: false as const, error: updErr?.message ?? "finalize_failed" };
      }
      // Clear current_game_id locks best-effort
      await supabase.from("profiles").update({ current_game_id: null }).in("user_id", [game.white_player_id, game.black_player_id]);
    }

    if (!eloUpdatedRef.current) {
      eloUpdatedRef.current = true;
      const ratingPreview = await ratingPreviewPromise;
      await applyEloAndLog({
        id: game.id,
        white_player_id: game.white_player_id,
        black_player_id: game.black_player_id,
        result,
        is_rated: game.is_rated,
      }, ratingPreview);
    }
    return { ok: true as const };
  }, [game, applyEloAndLog, buildRatingPreview]);

  const resign = useCallback(async () => {
    if (!game || !myColor) return { ok: false as const, error: "no_game" };
    if (game.status !== "active") return { ok: true as const };
    return endGame(myColor === "w" ? "0-1" : "1-0", "resignation");
  }, [game, myColor, endGame]);

  // Abort: only valid before the first move. No Elo change.
  const abortGame = useCallback(async () => {
    if (!game) return { ok: false, error: "no_game" as const };
    if ((game.move_number ?? 0) > 0) return { ok: false, error: "moves_played" as const };
    const { data, error: rpcErr } = await supabase.rpc("abort_online_game" as any, {
      p_game_id: game.id,
    });
    if (rpcErr || (data as any)?.ok === false) {
      return { ok: false, error: ((data as any)?.error ?? "failed") as string };
    }
    setGame(prev => prev ? { ...prev, status: "aborted", end_reason: "agreement" } : prev);
    setStatus("finished");
    return { ok: true as const };
  }, [game]);

  const reset = useCallback(() => {
    cleanupChannels();
    setGame(null);
    setStatus("idle");
    setError(null);
    eloUpdatedRef.current = false; endingRef.current = false;
  }, [cleanupChannels]);

  // Load a specific game by id without a full page reload (used by rematch flow).
  const loadGameById = useCallback(async (gameId: string) => {
    if (!user || !gameId) return;
    cleanupChannels();
    eloUpdatedRef.current = false; endingRef.current = false;
    setError(null);
    const { data: byId } = await supabase
      .from("online_games")
      .select("*")
      .eq("id", gameId)
      .maybeSingle();
    if (byId && (byId.white_player_id === user.id || byId.black_player_id === user.id)) {
      setGame(byId as OnlineGame);
      setStatus(byId.status === "finished" ? "finished" : "playing");
      subscribeToGame(byId.id);
    }
  }, [user, cleanupChannels, subscribeToGame]);

  // Listen for cross-component rematch broadcasts.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id) loadGameById(id);
    };
    window.addEventListener("online-game-load", handler as EventListener);
    return () => window.removeEventListener("online-game-load", handler as EventListener);
  }, [loadGameById]);

  useEffect(() => {
    return () => {
      cleanupChannels();
      if (queueEntryId.current && user) {
        supabase.from("matchmaking_queue").delete().eq("id", queueEntryId.current);
      }
    };
  }, [user, cleanupChannels]);

  return { status, game, myColor, error, ratingResult, searchMatch, cancelSearch, makeMove, endGame, resign, abortGame, reset, loadGameById };
}
