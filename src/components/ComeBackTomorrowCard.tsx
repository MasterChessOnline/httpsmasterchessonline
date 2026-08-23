// COME BACK TOMORROW — plan P1 (retention).
//
// Shown right after a finished game, the single highest-intent moment. It gives
// the player three real reasons and one-tap ways to return:
//   1. Their live streak + what tomorrow's streak reward is.
//   2. Push reminder for the daily 20:00 prime-time hour.
//   3. Opponent alerts — a ping when a real player is actually waiting.
// Everything here is real data. No fake counts, no fake players.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, BellRing, Check, Clock, Flame, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDailyStreak } from "@/hooks/use-daily-streak";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { getNextReward } from "@/lib/streak-rewards";
import { trackRetention } from "@/lib/funnel";

export default function ComeBackTomorrowCard({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: streak } = useDailyStreak();
  const { status, busy, enable, supported } = usePushSubscription();
  const [alerts, setAlerts] = useState(false);
  const [savingAlerts, setSavingAlerts] = useState(false);

  const current = streak?.current_streak ?? 0;
  const nextReward = getNextReward(current);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("opponent_alert_optins")
        .select("enabled")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setAlerts(!!data?.enabled);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!user) return null;

  const enablePush = async () => {
    const ok = await enable();
    trackRetention("reminder_optin", { channel: "push", ok: !!ok });
    toast({
      title: ok ? "Reminder on" : "Couldn't turn on reminders",
      description: ok
        ? "We'll ping you at 20:00 for prime-time games."
        : "Your browser blocked notifications — you can allow them in site settings.",
      variant: ok ? undefined : "destructive",
    });
  };

  const toggleAlerts = async () => {
    const next = !alerts;
    setAlerts(next);
    setSavingAlerts(true);
    const { error } = await (supabase as any)
      .from("opponent_alert_optins")
      .upsert({ user_id: user.id, enabled: next }, { onConflict: "user_id" });
    setSavingAlerts(false);
    if (error) {
      setAlerts(!next);
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    trackRetention("reminder_optin", { channel: "opponent_alerts", ok: next });
    toast({
      title: next ? "Opponent alerts on" : "Opponent alerts off",
      description: next
        ? "We'll tell you when a real player is waiting for a game."
        : "You won't be notified about waiting players.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-primary/25 bg-card/70 p-4 text-left ${className}`}
    >
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-primary" />
        <p className="font-display text-sm font-bold">
          {current > 0 ? `${current}-day streak` : "Start your streak"}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {nextReward
          ? `Play one game tomorrow to reach day ${nextReward.day} — ${nextReward.label ?? "streak reward"}.`
          : "Play one game a day to keep your streak alive."}
      </p>

      <div className="mt-3 grid gap-2">
        {supported && status !== "subscribed" && (
          <Button variant="outline" size="sm" className="justify-start" disabled={busy} onClick={enablePush}>
            <Clock className="mr-2 h-4 w-4" /> Remind me at 20:00 (prime time)
          </Button>
        )}
        {status === "subscribed" && (
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            <Check className="h-4 w-4 text-primary" /> Prime-time reminder is on
          </div>
        )}

        <Button
          variant={alerts ? "secondary" : "outline"}
          size="sm"
          className="justify-start"
          disabled={savingAlerts}
          onClick={toggleAlerts}
        >
          {alerts ? <BellRing className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
          {alerts ? "Opponent alerts on" : "Ping me when someone is waiting"}
        </Button>

        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link to="/missions" onClick={() => trackRetention("missions_click", { surface: "post_game" })}>
            <Gift className="mr-2 h-4 w-4" /> See today's missions
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
