import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CheckInPanelProps {
  tournamentId: string;
  checkinOpensAt: string | null;
  checkinClosesAt: string | null;
  isRegistered: boolean;
  checkedIn: boolean;
  isAdmin?: boolean;
  onChecked?: () => void;
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function CheckInPanel({
  tournamentId,
  checkinOpensAt,
  checkinClosesAt,
  isRegistered,
  checkedIn,
  isAdmin,
  onChecked,
}: CheckInPanelProps) {
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!checkinOpensAt || !checkinClosesAt) return null;

  const opensMs = new Date(checkinOpensAt).getTime();
  const closesMs = new Date(checkinClosesAt).getTime();
  const beforeWindow = now < opensMs;
  const afterWindow = now > closesMs;
  const inWindow = !beforeWindow && !afterWindow;

  const handleCheckIn = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-tournament", {
        body: { action: "check_in", tournament_id: tournamentId },
      });
      if (error || (data as any)?.error) {
        toast({ title: "Check-in failed", description: (data as any)?.error || error?.message, variant: "destructive" });
      } else {
        toast({ title: "You're checked in ✓", description: "Pairings will be generated when the window closes." });
        onChecked?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForceRemove = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-tournament", {
        body: { action: "remove_unchecked", tournament_id: tournamentId },
      });
      if (error || (data as any)?.error) {
        toast({ title: "Failed", description: (data as any)?.error || error?.message, variant: "destructive" });
      } else {
        toast({ title: "Roster locked", description: `Removed ${(data as any)?.removed_count ?? 0} unchecked players.` });
        onChecked?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Check-in</span>
          {beforeWindow && (
            <Badge variant="outline" className="text-[10px]">Opens in {fmt(opensMs - now)}</Badge>
          )}
          {inWindow && (
            <Badge className="bg-primary text-primary-foreground text-[10px]">Closes in {fmt(closesMs - now)}</Badge>
          )}
          {afterWindow && <Badge variant="destructive" className="text-[10px]">Window closed</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {isRegistered && checkedIn && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Checked in
            </Badge>
          )}
          {isRegistered && !checkedIn && inWindow && (
            <Button size="sm" disabled={submitting} onClick={handleCheckIn}>
              Check in now
            </Button>
          )}
          {isAdmin && afterWindow && (
            <Button size="sm" variant="outline" disabled={submitting} onClick={handleForceRemove}>
              <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Remove unchecked & lock roster
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Players who do not check in during the window are automatically removed from the final roster.
      </p>
    </div>
  );
}
