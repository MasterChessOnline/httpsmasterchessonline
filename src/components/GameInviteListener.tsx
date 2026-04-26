// Listens for incoming game invites and shows a toast popup.
// Mounted globally in App.tsx.
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const GameInviteListener = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const acceptInvite = async (inviteId: string) => {
      // Re-fetch the latest invite to get sender_color, time control, etc.
      const { data: invite, error: fetchErr } = await supabase
        .from("game_invites" as any)
        .select("*")
        .eq("id", inviteId)
        .maybeSingle();

      if (fetchErr || !invite) {
        toast({ title: "Invite not found", variant: "destructive" });
        return;
      }
      const inv = invite as any;
      if (inv.status !== "pending") {
        toast({ title: "Invite no longer available", description: `Status: ${inv.status}` });
        return;
      }

      // Decide colors based on sender preference
      let whiteId: string;
      let blackId: string;
      const senderColor: "white" | "black" | "random" = inv.sender_color || "random";
      if (senderColor === "white") {
        whiteId = inv.sender_id; blackId = inv.recipient_id;
      } else if (senderColor === "black") {
        whiteId = inv.recipient_id; blackId = inv.sender_id;
      } else {
        const senderIsWhite = Math.random() > 0.5;
        whiteId = senderIsWhite ? inv.sender_id : inv.recipient_id;
        blackId = senderIsWhite ? inv.recipient_id : inv.sender_id;
      }

      // Create the online_games row
      const { data: newGame, error: createErr } = await supabase
        .from("online_games")
        .insert({
          white_player_id: whiteId,
          black_player_id: blackId,
          white_time: inv.time_control_seconds || 600,
          black_time: inv.time_control_seconds || 600,
          time_control_label: inv.time_control_label,
          increment: inv.time_control_increment || 0,
        })
        .select()
        .single();

      if (createErr || !newGame) {
        toast({ title: "Could not create game", description: createErr?.message, variant: "destructive" });
        return;
      }

      // Mark invite accepted with the game_id so sender can navigate too
      await supabase.from("game_invites" as any)
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          game_id: newGame.id,
        })
        .eq("id", inviteId);

      navigate(`/play/online?game=${newGame.id}`);
    };

    const handleInvite = async (inviteId: string, senderId: string, label: string) => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("user_id", senderId)
        .maybeSingle();
      const senderName = prof?.display_name || prof?.username || "A friend";

      toast({
        title: `⚔️ ${senderName} challenges you!`,
        description: `${label} game — accept to play now.`,
        duration: 30000,
        action: (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => acceptInvite(inviteId)}>Accept</Button>
            <Button
              size="sm" variant="outline"
              onClick={async () => {
                await supabase.from("game_invites" as any)
                  .update({ status: "declined", responded_at: new Date().toISOString() })
                  .eq("id", inviteId);
              }}
            >
              Decline
            </Button>
          </div>
        ) as any,
      });
    };

    const channel = supabase
      .channel(`game-invites-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_invites", filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          const inv = payload.new as any;
          if (inv.status === "pending") {
            handleInvite(inv.id, inv.sender_id, inv.time_control_label);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, navigate]);

  return null;
};

export default GameInviteListener;
