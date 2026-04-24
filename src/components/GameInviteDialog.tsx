import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Swords, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ShareInviteDialog from "@/components/ShareInviteDialog";

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

const GameInviteDialog = ({ open, onOpenChange, recipientId, recipientName }: Props) => {
  const { user, profile } = useAuth();
  const [tcLabel, setTcLabel] = useState("5+3");
  const [rated, setRated] = useState(true);
  const [sending, setSending] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const senderName = profile?.display_name || profile?.username || "A friend";
  const tcPretty = tcLabel;
  const challengeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/play/online?challenge=${user?.id ?? ""}&tc=${encodeURIComponent(tcLabel)}&rated=${rated ? 1 : 0}`
    : "";
  const shareMessage = `${senderName} is challenging you to a ${tcPretty} ${rated ? "rated" : "casual"} chess game on MasterChess!`;

  const send = async () => {
    if (!user) return;
    const tc = TIME_CONTROLS.find(t => t.label === tcLabel)!;
    setSending(true);
    const { error } = await supabase.from("game_invites" as any).insert({
      sender_id: user.id,
      recipient_id: recipientId,
      time_control_label: tc.label,
      time_control_seconds: tc.seconds,
      time_control_increment: tc.inc,
      is_rated: rated,
    });
    setSending(false);
    if (error) {
      toast({ title: "Could not send invite", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Challenge sent!", description: `Waiting for ${recipientName} to accept...` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <button key={tc.label} onClick={() => setTcLabel(tc.label)}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
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
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Rated</p>
              <p className="text-[10px] text-muted-foreground">Affects your online rating</p>
            </div>
            <Switch checked={rated} onCheckedChange={setRated} />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">Invite expires in 5 minutes</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} disabled={sending}>
            {sending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Send Challenge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameInviteDialog;
