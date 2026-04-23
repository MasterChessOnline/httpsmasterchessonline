// Listens for incoming game invites and shows a toast popup.
// Mounted globally in App.tsx.
import { useEffect } from "react";
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
            <Button
              size="sm"
              onClick={async () => {
                // Accept: mark accepted; play page will handle game creation
                await supabase.from("game_invites" as any)
                  .update({ status: "accepted", responded_at: new Date().toISOString() })
                  .eq("id", inviteId);
                navigate(`/play/online?invite=${inviteId}`);
              }}
            >
              Accept
            </Button>
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
