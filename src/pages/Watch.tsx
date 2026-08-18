// /watch — list of games actually in progress right now.
// Guests can watch without an account: it gives ad traffic something to do in
// the first 5 seconds and keeps them on the site (dwell time = ranking signal).
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Loader2, Timer, Swords } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import MiniFenBoard from "@/components/MiniFenBoard";
import EmptyLobbyActions from "@/components/EmptyLobbyActions";
import CreateFreeAccountCta from "@/components/CreateFreeAccountCta";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LiveGame {
  id: string;
  fen: string;
  turn: string;
  move_number: number;
  time_control_label: string;
  is_rated: boolean;
  white_player_id: string;
  black_player_id: string;
  whiteName?: string;
  blackName?: string;
}

export default function Watch() {
  const { user } = useAuth();
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("online_games")
      .select("id, fen, turn, move_number, time_control_label, is_rated, white_player_id, black_player_id, streamer_only")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(24);

    const rows = ((data as any[]) || []).filter((g) => !g.streamer_only) as LiveGame[];
    const ids = Array.from(new Set(rows.flatMap((g) => [g.white_player_id, g.black_player_id])));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, rating")
        .in("user_id", ids);
      const map = new Map((profs || []).map((p: any) => [p.user_id, p]));
      rows.forEach((g) => {
        g.whiteName = map.get(g.white_player_id)?.display_name || map.get(g.white_player_id)?.username || "Player";
        g.blackName = map.get(g.black_player_id)?.display_name || map.get(g.black_player_id)?.username || "Player";
      });
    }
    setGames(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 6000);
    return () => window.clearInterval(t);
  }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Watch Live Chess Games Free | MasterChess"
        description="Watch chess games in progress right now, move by move, with no account and no download. Live boards from real players."
        canonical="https://masterchess.live/watch"
      />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
            <Eye className="h-7 w-7 text-primary" /> Watch live
          </h1>
          <p className="text-muted-foreground">
            Real games, happening now. Click any board to follow it move by move.
          </p>
        </header>

        {loading ? (
          <div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : games.length === 0 ? (
          <EmptyLobbyActions
            title="No games in progress this second"
            subtitle="Start one yourself — the lobby shows your challenge to everyone online."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {games.map((g) => (
              <Link
                key={g.id}
                to={`/watch/${g.id}`}
                className="group rounded-2xl border border-border/60 bg-card/50 p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-center mb-3">
                  <MiniFenBoard fen={g.fen} size={180} alt={`${g.whiteName} vs ${g.blackName}`} />
                </div>
                <div className="text-sm font-medium truncate">{g.whiteName} vs {g.blackName}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" />{g.time_control_label}</span>
                  <span>move {Math.max(1, g.move_number)}</span>
                  <span>{g.is_rated ? "Rated" : "Casual"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/lobby"><Swords className="h-4 w-4" /> Play a game yourself</Link>
          </Button>
        </div>

        {!user && <CreateFreeAccountCta className="mt-10" reason="watch" />}
      </main>

      <Footer />
    </div>
  );
}
