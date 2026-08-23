// Small, honest counter block: registered players + live online games.
// Real data only (profiles count + active online_games) — no invented numbers.
// Deliberately tiny and off to the side so a small number never dominates the hero.
import { useEffect, useState } from "react";
import { Users, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SiteStatsNote({ className = "" }: { className?: string }) {
  const [players, setPlayers] = useState<number | null>(null);
  const [live, setLive] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const [p, g] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase
            .from("online_games")
            .select("id", { count: "exact", head: true })
            .eq("status", "active")
            .gte("created_at", since),
        ]);
        if (cancelled) return;
        setPlayers(p.count ?? 0);
        setLive(g.count ?? 0);
      } catch {
        /* stay hidden */
      }
    };

    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (players === null) return null;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 text-[11px] text-muted-foreground ${className}`}
      aria-label="MasterChess community stats"
    >
      <span className="inline-flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-foreground">{players.toLocaleString()}</span> registered
      </span>
      <span className="opacity-30">·</span>
      <span className="inline-flex items-center gap-1.5">
        <Swords className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-foreground">{live ?? 0}</span> live games
      </span>
    </div>
  );
}
