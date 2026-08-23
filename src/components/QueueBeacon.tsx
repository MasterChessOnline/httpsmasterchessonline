// Fixes the #1 problem of a young chess site: you queue, nobody is there.
//
// Two real mechanics, no fake players:
//  1. "Ring the bell" — pings every player who opted in to opponent alerts,
//     telling them a real human is waiting right now.
//  2. "Alert me" — opt in so you get pinged when someone else is waiting.
import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function QueueBeacon({
  waiting = false,
  className = "",
}: {
  /** True while this user actually sits in the matchmaking queue. */
  waiting?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [ringing, setRinging] = useState(false);
  const [rang, setRang] = useState(false);

  useEffect(() => {
    if (!user) {
      setOptedIn(null);
      return;
    }
    (async () => {
      const { data } = await (supabase as any)
        .from("opponent_alert_optins")
        .select("enabled")
        .eq("user_id", user.id)
        .maybeSingle();
      setOptedIn(!!data?.enabled);
    })();
  }, [user?.id]);

  const toggleOptIn = async () => {
    if (!user) return;
    const next = !optedIn;
    setOptedIn(next);
    const { error } = await (supabase as any)
      .from("opponent_alert_optins")
      .upsert({ user_id: user.id, enabled: next }, { onConflict: "user_id" });
    if (error) {
      setOptedIn(!next);
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: next ? "Opponent alerts on" : "Opponent alerts off",
      description: next
        ? "We'll ping you when a real player is waiting for a game."
        : "You won't be notified about waiting players.",
    });
  };

  const ring = async () => {
    if (!user) return;
    setRinging(true);
    try {
      const { data, error } = await supabase.functions.invoke("queue-beacon", { body: {} });
      if (error) throw error;
      const res = data as { ok?: boolean; notified?: number; reason?: string };
      if (res?.reason === "not_in_queue") {
        toast({
          title: "Join the queue first",
          description: "Start a Quick Match, then ring the bell.",
          variant: "destructive",
        });
        return;
      }
      if (res?.reason === "cooldown") {
        toast({ title: "Already rang recently", description: "Try again in a few minutes." });
        return;
      }
      setRang(true);
      toast({
        title: res?.notified ? `Bell rang — ${res.notified} players pinged` : "Bell rang",
        description: res?.notified
          ? "Stay in the queue; whoever opens it first plays you."
          : "Nobody has alerts on yet. Share your challenge link instead.",
      });
    } catch (e: any) {
      toast({ title: "Couldn't ring", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setRinging(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className={`rounded-xl border border-border/50 bg-card/70 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-bold text-foreground">Nobody in the queue?</div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Ring the bell and every player with alerts on gets a notification that you're waiting.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={ring}
          disabled={ringing || !waiting}
          title={waiting ? "" : "Join the queue to ring the bell"}
          className="gap-1.5"
        >
          {ringing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
          {rang ? "Bell rang" : "Ring the bell"}
        </Button>

        <Button
          size="sm"
          variant={optedIn ? "secondary" : "outline"}
          onClick={toggleOptIn}
          className="gap-1.5"
        >
          {optedIn ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          {optedIn ? "Alerts on" : "Alert me"}
        </Button>
      </div>
    </div>
  );
}
