// Real social proof for the homepage hero: registered players, games played and
// live game count. Every number comes from the database — no placeholders, no
// invented activity. Renders nothing until real numbers are available.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LivePlayerCounter from "@/components/LivePlayerCounter";

type Counts = { players: number; games: number };

export default function HomeProofRow() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [players, games] = await Promise.all([
          supabase.from("profiles").select("user_id", { count: "exact", head: true }),
          supabase.from("online_games").select("id", { count: "exact", head: true }),
        ]);
        if (cancelled) return;
        setCounts({ players: players.count ?? 0, games: games.count ?? 0 });
      } catch {
        if (!cancelled) setCounts(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pill = "rounded-full border border-white/10 bg-white/5 px-3 py-1";

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
      <LivePlayerCounter />
      {counts && counts.players > 0 && (
        <span className={pill}>{counts.players.toLocaleString()} registered players</span>
      )}
      {counts && counts.games > 0 && (
        <span className={pill}>{counts.games.toLocaleString()} games played</span>
      )}
      <span className={pill}>No ads · No subscription</span>
    </div>
  );
}
