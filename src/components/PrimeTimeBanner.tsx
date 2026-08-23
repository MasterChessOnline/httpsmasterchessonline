// Prime-time hour: one fixed hour every day (20:00 local) when players are told
// to show up together, so the matchmaking queue is not empty.
//
// The only "social proof" here is real: the number of signed-in players who
// pressed "I'll play tonight" today. No fake players, no fake counts.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Swords, Check, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PRIME_HOUR = 20; // 20:00 local time

function msUntilNextPrime(now: Date) {
  const next = new Date(now);
  next.setHours(PRIME_HOUR, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function PrimeTimeBanner({ className = "" }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());
  const { user } = useAuth();
  const { toast } = useToast();
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);
  const [mine, setMine] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadCount = useCallback(async () => {
    try {
      const { data } = await (supabase.rpc as any)("prime_time_rsvp_count", { _day: todayKey() });
      if (typeof data === "number") setRsvpCount(data);
    } catch {
      /* keep hidden */
    }
  }, []);

  useEffect(() => {
    loadCount();
    const id = window.setInterval(loadCount, 60_000);
    return () => window.clearInterval(id);
  }, [loadCount]);

  useEffect(() => {
    if (!user) {
      setMine(false);
      return;
    }
    (async () => {
      const { data } = await (supabase as any)
        .from("prime_time_rsvp")
        .select("id")
        .eq("user_id", user.id)
        .eq("play_date", todayKey())
        .maybeSingle();
      setMine(!!data);
    })();
  }, [user?.id]);

  const toggleRsvp = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (mine) {
        await (supabase as any)
          .from("prime_time_rsvp")
          .delete()
          .eq("user_id", user.id)
          .eq("play_date", todayKey());
        setMine(false);
        setRsvpCount((c) => (c === null ? c : Math.max(0, c - 1)));
      } else {
        const { error } = await (supabase as any)
          .from("prime_time_rsvp")
          .insert({ user_id: user.id, play_date: todayKey() });
        if (error && !/duplicate|unique/i.test(error.message)) throw error;
        setMine(true);
        setRsvpCount((c) => (c === null ? c : c + 1));
        toast({
          title: "See you at 20:00",
          description: "You're on tonight's list. Show up and there will be opponents.",
        });
      }
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
      loadCount();
    }
  };

  const isLive = now.getHours() === PRIME_HOUR;
  const remaining = isLive
    ? new Date(now).setHours(PRIME_HOUR + 1, 0, 0, 0) - now.getTime()
    : msUntilNextPrime(now);

  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 ${
        isLive ? "border-primary/40 bg-primary/10" : "border-border/50 bg-card/70"
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-bold text-foreground">
            {isLive ? "Prime Time is live — 20:00" : "Prime Time — every day at 20:00"}
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {isLive
              ? `Everyone queues in this hour. Ends in ${fmt(remaining)}.`
              : `Everyone queues at the same hour, so you get a real opponent fast. Starts in ${fmt(remaining)}.`}
          </p>
        </div>
        <Link
          to="/play/online"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Swords className="h-3.5 w-3.5" /> Play
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
        {user ? (
          <button
            onClick={toggleRsvp}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
              mine
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-border/60 bg-background/40 text-foreground hover:border-primary/40"
            }`}
          >
            {mine ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
            {mine ? "You're in tonight" : "I'll play tonight"}
          </button>
        ) : (
          <Link
            to="/signup?from=prime_time"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400"
          >
            <Bell className="h-3.5 w-3.5" /> Sign up to join tonight
          </Link>
        )}

        {rsvpCount !== null && rsvpCount > 0 && (
          <span className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{rsvpCount}</span>{" "}
            {rsvpCount === 1 ? "player is" : "players are"} signed up for tonight
          </span>
        )}
      </div>
    </div>
  );
}
