import { useEffect, useRef } from "react";
import { TournamentData, Pairing } from "@/hooks/use-tournament";

export function useTournamentNotifications(
  tournament: TournamentData | null,
  myPairing: Pairing | undefined,
  userId: string | undefined
) {
  const lastNotifiedRound = useRef(0);
  const permissionRequested = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if (permissionRequested.current) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
      permissionRequested.current = true;
    }
  }, []);

  // Notify when a new round starts with user's pairing
  useEffect(() => {
    if (!tournament || !myPairing || !userId) return;
    if (tournament.status !== "active") return;
    if (tournament.current_round <= lastNotifiedRound.current) return;
    if (myPairing.result) return; // already finished

    lastNotifiedRound.current = tournament.current_round;

    if ("Notification" in window && Notification.permission === "granted") {
      const isWhite = myPairing.white_player_id === userId;
      new Notification(`🏆 Round ${tournament.current_round} Started!`, {
        body: `Your game is ready. You play as ${isWhite ? "White" : "Black"}. Good luck!`,
        icon: "/favicon.ico",
        tag: `round-${tournament.current_round}`,
      });
    }
  }, [tournament?.current_round, myPairing, userId, tournament?.status]);
}
