// Small, honest counter block: registered players + live online games.
// Real data only (profiles count + active online_games) — no invented numbers.
// Deliberately tiny and off to the side so a small number never dominates the hero.
import { useEffect, useState } from "react";
import { Users, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";


export default function SiteStatsNote({ className = "" }: { className?: string }) {
  const [players, setPlayers] = useState<number | null>(null);
  const [live, setLive] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // One public aggregate call — works for anonymous visitors and never
        // exposes any row-level data.
        const { data } = await (supabase.rpc as any)("get_open_stats");
        if (cancelled || !data) return;
        setPlayers(Number(data.players_total ?? 0));
        setLive(Number(data.live_games_now ?? 0));
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
    <Link
      to="/open"
      className={`inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground ${className}`}
      aria-label="MasterChess community stats — see our open numbers"
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
      <span className="hidden sm:inline opacity-60">· open numbers</span>
    </Link>
  );
}

