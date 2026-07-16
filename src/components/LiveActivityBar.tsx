import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Trophy, Users, Clock } from "lucide-react";

/**
 * Small "live pulse" strip — proves the site is alive to first-time visitors
 * without redesigning the Home. Numbers come from real tables; if a query
 * fails the row silently hides.
 */
type Stats = {
  liveGames: number | null;
  onlinePlayers: number | null;
  nextTournamentAt: string | null;
};

function fmtCountdown(iso: string | null): string | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "starting now";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `in ${Math.floor(h / 24)}d`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

export default function LiveActivityBar() {
  const [stats, setStats] = useState<Stats>({
    liveGames: null,
    onlinePlayers: null,
    nextTournamentAt: null,
  });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [gamesRes, presenceRes, tournRes] = await Promise.all([
        supabase
          .from("online_games")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("heartbeats")
          .select("user_id", { count: "exact", head: true })
          .gte("last_seen", new Date(Date.now() - 2 * 60_000).toISOString()),
        supabase
          .from("tournaments")
          .select("starts_at")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);
      if (!alive) return;
      setStats({
        liveGames: gamesRes.count ?? null,
        onlinePlayers: presenceRes.count ?? null,
        nextTournamentAt: (tournRes.data as any)?.starts_at ?? null,
      });
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  const countdown = fmtCountdown(stats.nextTournamentAt);
  const items = [
    stats.liveGames != null && stats.liveGames > 0
      ? { icon: Activity, label: `${stats.liveGames} live game${stats.liveGames === 1 ? "" : "s"}`, tone: "text-emerald-300" }
      : null,
    stats.onlinePlayers != null && stats.onlinePlayers > 0
      ? { icon: Users, label: `${stats.onlinePlayers} online now`, tone: "text-sky-300" }
      : null,
    countdown
      ? { icon: Trophy, label: `Next tournament ${countdown}`, tone: "text-amber-300" }
      : null,
    { icon: Clock, label: "24/7 open · no queue", tone: "text-muted-foreground" },
  ].filter(Boolean) as Array<{ icon: any; label: string; tone: string }>;

  return (
    <div className="border-y border-white/5 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2 text-xs sm:text-sm">
        {items.map((it, i) => (
          <span key={i} className={`inline-flex items-center gap-1.5 ${it.tone}`}>
            <it.icon className="h-3.5 w-3.5" />
            <span className="font-medium">{it.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
