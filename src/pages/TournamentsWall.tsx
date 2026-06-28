// "Live Bracket Wall" — TV-mode view of every active tournament game across the
// platform. Refreshes every 5s; one click on a card jumps into spectate mode.
// Brutally simple read: pull active tournaments + their in-progress pairings,
// render as a dense grid that auto-fills the viewport.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Trophy, Users } from "lucide-react";

interface ActivePair {
  id: string;
  tournament_id: string;
  round: number;
  white_player_id: string;
  black_player_id: string | null;
  result: string | null;
  online_game_id: string | null;
  tournament_name: string;
  tournament_category: string;
  white_username: string | null;
  black_username: string | null;
  white_rating: number | null;
  black_rating: number | null;
}

export default function TournamentsWall() {
  const [pairs, setPairs] = useState<ActivePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancel = false;
    async function load() {
      const { data: tours } = await supabase
        .from("tournaments")
        .select("id, name, category, current_round, status")
        .eq("status", "active");
      const ids = (tours || []).map((t) => t.id);
      if (!ids.length) { if (!cancel) { setPairs([]); setLoading(false); } return; }

      const { data: pairings } = await supabase
        .from("tournament_pairings")
        .select("id, tournament_id, round, white_player_id, black_player_id, result, online_game_id")
        .in("tournament_id", ids)
        .is("result", null);

      const userIds = new Set<string>();
      (pairings || []).forEach((p) => {
        if (p.white_player_id) userIds.add(p.white_player_id);
        if (p.black_player_id) userIds.add(p.black_player_id);
      });
      const { data: profiles } = userIds.size
        ? await supabase.from("profiles").select("id, username, rating").in("id", [...userIds])
        : { data: [] as any[] };
      const pmap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const tmap = new Map((tours || []).map((t: any) => [t.id, t]));

      const merged: ActivePair[] = (pairings || []).map((p: any) => {
        const t = tmap.get(p.tournament_id);
        const w = pmap.get(p.white_player_id);
        const b = p.black_player_id ? pmap.get(p.black_player_id) : null;
        return {
          ...p,
          tournament_name: t?.name || "Tournament",
          tournament_category: t?.category || "",
          white_username: w?.username || null,
          black_username: b?.username || null,
          white_rating: w?.rating ?? null,
          black_rating: b?.rating ?? null,
        };
      });
      if (!cancel) { setPairs(merged); setLoading(false); }
    }
    load();
    const id = setInterval(load, 5000);
    const tickId = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { cancel = true; clearInterval(id); clearInterval(tickId); };
  }, []);

  const grouped = useMemo(() => {
    const g = new Map<string, ActivePair[]>();
    for (const p of pairs) {
      const arr = g.get(p.tournament_name) || [];
      arr.push(p);
      g.set(p.tournament_name, arr);
    }
    return [...g.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [pairs]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Live Bracket Wall — All Active Tournament Games | MasterChess</title>
        <meta name="description" content="Every active tournament game on MasterChess in one TV-mode wall. Click any board to spectate live." />
      </Helmet>

      <div className="container mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Radio className="h-6 w-6 text-emerald-400 animate-pulse" />
              Live Bracket Wall
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Every active tournament game, refreshed every 5 seconds · tick {tick}
            </p>
          </div>
          <Link to="/tournaments" className="text-sm text-primary hover:underline">All tournaments →</Link>
        </div>

        {loading && <p className="text-muted-foreground">Loading live boards…</p>}
        {!loading && !pairs.length && (
          <Card className="p-8 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
            No active tournament games right now. Check back when the next round starts.
          </Card>
        )}

        {grouped.map(([tname, list]) => (
          <section key={tname} className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5" /> {tname}
              <Badge variant="outline" className="ml-1 text-[10px]">
                <Users className="h-3 w-3 mr-1" /> {list.length} live boards
              </Badge>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {list.map((p) => {
                const href = p.online_game_id ? `/online/${p.online_game_id}` : `/tournaments/${p.tournament_id}`;
                return (
                  <Link key={p.id} to={href} className="group">
                    <Card className="p-3 hover:border-primary/60 transition-colors bg-card/60 backdrop-blur">
                      <div className="text-[10px] text-muted-foreground mb-1">Round {p.round}</div>
                      <div className="text-xs font-semibold truncate" title={p.white_username || ""}>
                        ♔ {p.white_username || "—"} <span className="text-muted-foreground">({p.white_rating ?? "?"})</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-center my-1">vs</div>
                      <div className="text-xs font-semibold truncate" title={p.black_username || ""}>
                        ♚ {p.black_username || (p.black_player_id ? "—" : "BYE")} <span className="text-muted-foreground">({p.black_rating ?? "?"})</span>
                      </div>
                      <div className="mt-2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition">
                        Spectate →
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
