import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Swords, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recipientId: string;
  recipientName: string;
}

const TIME_CONTROLS = [
  { label: "1+0",  category: "Bullet",   seconds: 60,   inc: 0 },
  { label: "2+1",  category: "Bullet",   seconds: 120,  inc: 1 },
  { label: "3+0",  category: "Blitz",    seconds: 180,  inc: 0 },
  { label: "5+0",  category: "Blitz",    seconds: 300,  inc: 0 },
  { label: "5+3",  category: "Blitz",    seconds: 300,  inc: 3 },
  { label: "10+0", category: "Rapid",    seconds: 600,  inc: 0 },
  { label: "10+5", category: "Rapid",    seconds: 600,  inc: 5 },
  { label: "15+10",category: "Rapid",    seconds: 900,  inc: 10 },
  { label: "30+0", category: "Classical",seconds: 1800, inc: 0 },
];

type SenderColor = "white" | "black" | "random";

const GameInviteDialog = ({ open, onOpenChange, recipientId, recipientName }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tcLabel, setTcLabel] = useState("5+3");
  const [rated, setRated] = useState(true);
  const [color, setColor] = useState<SenderColor>("random");
  const [sending, setSending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Track the active invite + cleanup hooks so the user can cancel it before
  // the recipient responds.
  const [activeInviteId, setActiveInviteId] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cancel the in-flight invite: mark it as cancelled in the DB so the
  // recipient's listener stops showing it, and reset local UI state.
  const cancelInvite = async () => {
    if (!activeInviteId || cancelling) return;
    setCancelling(true);
    await supabase
      .from("game_invites" as any)
      .update({ status: "cancelled", responded_at: new Date().toISOString() })
      .eq("id", activeInviteId)
      .eq("sender_id", user?.id ?? "")
      .eq("status", "pending");
    cleanupRef.current?.();
    cleanupRef.current = null;
    setActiveInviteId(null);
    setWaiting(false);
    setCancelling(false);
    toast({ title: "Challenge cancelled", description: `You cancelled the challenge to ${recipientName}.` });
    onOpenChange(false);
  };

  // Make sure we clean up subscriptions/poll if the component unmounts mid-wait.
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const send = async () => {
    if (!user) return;
    const tc = TIME_CONTROLS.find(t => t.label === tcLabel)!;
    setSending(true);
    const { data: invite, error } = await supabase.from("game_invites" as any).insert({
      sender_id: user.id,
      recipient_id: recipientId,
      time_control_label: tc.label,
      time_control_seconds: tc.seconds,
      time_control_increment: tc.inc,
      is_rated: rated,
      sender_color: color,
    }).select().single();
    setSending(false);

    if (error || !invite) {
      toast({ title: "Could not send invite", description: error?.message, variant: "destructive" });
      return;
    }

    const inviteId = (invite as any).id;
    setActiveInviteId(inviteId);
    setWaiting(true);
    toast({ title: "Challenge sent!", description: `Waiting for ${recipientName} to accept...` });

    // Subscribe for the recipient's response — when they accept, the invite gets a game_id
    const channel = supabase
      .channel(`invite-response-${inviteId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "game_invites",
        filter: `id=eq.${inviteId}`,
      }, (payload) => {
        const inv = payload.new as any;
        if (inv.status === "accepted" && inv.game_id) {
          cleanupRef.current?.();
          cleanupRef.current = null;
          setActiveInviteId(null);
          setWaiting(false);
          onOpenChange(false);
          toast({ title: "Challenge accepted!", description: "Entering game..." });
          navigate(`/play/online?game=${inv.game_id}`);
        } else if (inv.status === "declined") {
          cleanupRef.current?.();
          cleanupRef.current = null;
          setActiveInviteId(null);
          setWaiting(false);
          toast({ title: "Challenge declined", description: `${recipientName} declined your challenge.`, variant: "destructive" });
        }
      })
      .subscribe();

    // Fallback poll in case realtime drops
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from("game_invites" as any)
        .select("status, game_id")
        .eq("id", inviteId)
        .maybeSingle();
      const d = data as any;
      if (d?.status === "accepted" && d?.game_id) {
        cleanupRef.current?.();
        cleanupRef.current = null;
        setActiveInviteId(null);
        setWaiting(false);
        onOpenChange(false);
        navigate(`/play/online?game=${d.game_id}`);
      } else if (d?.status === "declined" || d?.status === "expired" || d?.status === "cancelled") {
        cleanupRef.current?.();
        cleanupRef.current = null;
        setActiveInviteId(null);
        setWaiting(false);
      }
    }, 2000);

    // Stop polling after 5 min (invite expiry)
    const expiryTimer = setTimeout(() => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setActiveInviteId(null);
      setWaiting(false);
    }, 5 * 60 * 1000);

    // Single cleanup hook used by accept/decline/cancel/unmount.
    cleanupRef.current = () => {
      clearInterval(poll);
      clearTimeout(expiryTimer);
      supabase.removeChannel(channel);
    };
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!waiting) onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" /> Challenge {recipientName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Time Control</label>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_CONTROLS.map(tc => (
                <button key={tc.label} onClick={() => setTcLabel(tc.label)} disabled={waiting}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all disabled:opacity-50 ${
                    tcLabel === tc.label
                      ? "bg-primary/20 ring-2 ring-primary text-primary"
                      : "bg-muted/40 hover:bg-muted/60 text-foreground"
                  }`}>
                  <div>{tc.label}</div>
                  <div className="text-[9px] text-muted-foreground font-sans uppercase mt-0.5">{tc.category}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">I play as</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => setColor("white")} disabled={waiting}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                  color === "white" ? "bg-primary/20 ring-2 ring-primary text-primary" : "bg-muted/40 hover:bg-muted/60 text-foreground"
                }`}>
                <span className="text-base">♔</span> White
              </button>
              <button onClick={() => setColor("random")} disabled={waiting}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                  color === "random" ? "bg-primary/20 ring-2 ring-primary text-primary" : "bg-muted/40 hover:bg-muted/60 text-foreground"
                }`}>
                <Shuffle className="h-3.5 w-3.5" /> Random
              </button>
              <button onClick={() => setColor("black")} disabled={waiting}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                  color === "black" ? "bg-primary/20 ring-2 ring-primary text-primary" : "bg-muted/40 hover:bg-muted/60 text-foreground"
                }`}>
                <span className="text-base">♚</span> Black
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Rated</p>
              <p className="text-[10px] text-muted-foreground">Affects your online rating</p>
            </div>
            <Switch checked={rated} onCheckedChange={setRated} disabled={waiting} />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">Invite expires in 5 minutes</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={waiting}>Cancel</Button>
          <Button onClick={send} disabled={sending || waiting}>
            {(sending || waiting) && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {waiting ? "Waiting for response..." : "Send Challenge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameInviteDialog;
