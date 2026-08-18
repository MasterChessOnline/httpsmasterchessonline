// /watch/:id — spectate one live game in realtime (read-only board).
// Public on purpose: a shared link to a live game is a page a guest can land on
// with zero friction, which is exactly what we want from social traffic.
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, Loader2, Timer, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MiniFenBoard from "@/components/MiniFenBoard";
import CreateFreeAccountCta from "@/components/CreateFreeAccountCta";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SpectatedGame {
  id: string;
  fen: string;
  pgn: string;
  turn: string;
  status: string;
  result: string | null;
  end_reason: string | null;
  move_number: number;
  white_time: number;
  black_time: number;
  time_control_label: string;
  is_rated: boolean;
  white_player_id: string;
  black_player_id: string;
}

const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

export default function WatchGame() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<SpectatedGame | null>(null);
  const [names, setNames] = useState<{ white: string; black: string }>({ white: "White", black: "Black" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("online_games")
      .select("id, fen, pgn, turn, status, result, end_reason, move_number, white_time, black_time, time_control_label, is_rated, white_player_id, black_player_id")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      const g = data as SpectatedGame;
      setGame(g);
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", [g.white_player_id, g.black_player_id]);
      const map = new Map((profs || []).map((p: any) => [p.user_id, p.display_name || p.username || "Player"]));
      setNames({
        white: map.get(g.white_player_id) || "White",
        black: map.get(g.black_player_id) || "Black",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    if (!id) return;
    const channel = supabase
      .channel(`spectate-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "online_games", filter: `id=eq.${id}` }, (payload) => {
        setGame((prev) => (prev ? { ...prev, ...(payload.new as SpectatedGame) } : (payload.new as SpectatedGame)));
      })
      .subscribe();
    const t = window.setInterval(load, 5000); // safety net if realtime drops
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(t);
    };
  }, [id, load]);

  const moves = (game?.pgn || "")
    .replace(/\{[^}]*\}/g, "")
    .split(/\s+/)
    .filter((tok) => tok && !/^\d+\.$/.test(tok) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(tok));

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${names.white} vs ${names.black} — Live Chess | MasterChess`}
        description={`Follow ${names.white} vs ${names.black} live, move by move. Free chess spectating, no account needed.`}
        canonical={`https://masterchess.live/watch/${id || ""}`}
      />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <Link to="/watch" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> All live games
        </Link>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : !game ? (
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold mb-2">Game not found</h1>
            <p className="text-muted-foreground mb-6">It may have finished and been archived.</p>
            <Button asChild><Link to="/lobby">Go to the lobby</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" /> {names.white} vs {names.black}
            </h1>
            <div className="text-sm text-muted-foreground flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{game.time_control_label}</span>
              <Badge variant="outline">{game.is_rated ? "Rated" : "Casual"}</Badge>
              {game.status === "active"
                ? <span className="text-primary">{game.turn === "w" ? `${names.white} to move` : `${names.black} to move`}</span>
                : <span>{game.result || "Finished"}{game.end_reason ? ` · ${game.end_reason}` : ""}</span>}
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-full flex items-center justify-between text-sm">
                <span className="font-medium">{names.black}</span>
                <span className="font-mono">{fmt(game.black_time)}</span>
              </div>
              <MiniFenBoard fen={game.fen} size={340} alt={`${names.white} vs ${names.black} position`} />
              <div className="w-full flex items-center justify-between text-sm">
                <span className="font-medium">{names.white}</span>
                <span className="font-mono">{fmt(game.white_time)}</span>
              </div>
            </div>

            {moves.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Moves</h2>
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm font-mono leading-7 break-words">
                  {moves.map((m, i) => (
                    <span key={i} className="mr-2">
                      {i % 2 === 0 && <span className="text-muted-foreground mr-1">{i / 2 + 1}.</span>}
                      {m}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {!user && <CreateFreeAccountCta className="mt-10" reason="watch-game" title="Want to be on this board?" subtitle="Create a free account and you are matched with a real opponent in seconds." />}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
