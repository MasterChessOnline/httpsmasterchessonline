import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PulseEvent {
  id: string;
  white: string;
  black: string;
  result: string | null;
  status: string;
  time_control_label: string | null;
  created_at: string;
}

/**
 * Real-time activity feed pulling live + recently-finished games from online_games.
 * Strictly real data — no simulated events.
 */
export default function ActivityPulse() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [entryReleased, setEntryReleased] = useState(() => (window as any).__mcEntryReleased === true);

  const load = async () => {
    const { data: games } = await supabase
      .from("online_games")
      .select("id, white_player_id, black_player_id, result, status, time_control_label, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!games?.length) return;

    const playerIds = Array.from(
      new Set(games.flatMap((g) => [g.white_player_id, g.black_player_id]).filter(Boolean)),
    );
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", playerIds);

    const nameMap = new Map(profiles?.map((p) => [p.user_id, p.display_name || "Player"]) ?? []);

    setEvents(
      games.map((g) => ({
        id: g.id,
        white: nameMap.get(g.white_player_id) || "Player",
        black: nameMap.get(g.black_player_id) || "Player",
        result: g.result,
        status: g.status,
        time_control_label: g.time_control_label,
        created_at: g.created_at,
      })),
    );

    const { count } = await supabase
      .from("online_games")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    setLiveCount(count ?? 0);
  };

  useEffect(() => {
    if ((window as any).__mcEntryReleased === true) {
      setEntryReleased(true);
      return;
    }

    const release = () => setEntryReleased(true);
    window.addEventListener("mc:entry-finished", release, { once: true });
    const fallback = window.setTimeout(release, 5250);
    return () => {
      window.removeEventListener("mc:entry-finished", release);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!user || !entryReleased) return;

    load();
    const channel = supabase
      .channel("activity-pulse")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "online_games" },
        () => load(),
      )
      .subscribe();
    const t = setInterval(load, 15000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(t);
    };
  }, [entryReleased, user?.id]);

  if (!events.length) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="h-3.5 w-3.5 text-primary" />
          </span>
          Live Pulse
        </h3>
        {liveCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>
              <span className="text-emerald-400 font-bold">{liveCount}</span> playing now
            </span>
          </div>
        )}
      </div>
      <ul className="space-y-1.5 text-sm">
        <AnimatePresence initial={false}>
          {events.slice(0, 6).map((e) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Swords className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span className="truncate">
                <span className="text-foreground font-medium">{e.white}</span>
                {" "}vs{" "}
                <span className="text-foreground font-medium">{e.black}</span>
                {e.result && e.status === "finished" && (
                  <span className="ml-2 text-xs text-primary/80">{e.result}</span>
                )}
                {e.status === "active" && (
                  <span className="ml-2 text-xs text-emerald-400">live</span>
                )}
                {e.time_control_label && (
                  <span className="ml-2 text-xs opacity-60">{e.time_control_label}</span>
                )}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <Link
        to="/spectate"
        className="text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
      >
        Watch live games →
      </Link>
    </div>
  );
}
