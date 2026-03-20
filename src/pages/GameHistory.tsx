import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Swords, Trophy, TrendingUp, Calendar, ArrowLeft, ChevronRight,
  Clock, Eye,
} from "lucide-react";

interface GameRecord {
  id: string;
  result: string | null;
  status: string;
  created_at: string;
  time_control_label: string;
  white_player_id: string;
  black_player_id: string;
  pgn: string;
}

const GameHistory = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    supabase
      .from("online_games")
      .select("id, result, status, created_at, time_control_label, white_player_id, black_player_id, pgn")
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setGames((data as GameRecord[]) || []);
        setFetching(false);
      });
  }, [user]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const winCount = games.filter((g) => {
    const isWhite = g.white_player_id === user.id;
    return (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
  }).length;

  const lossCount = games.filter((g) => {
    const isWhite = g.white_player_id === user.id;
    return (isWhite && g.result === "0-1") || (!isWhite && g.result === "1-0");
  }).length;

  const drawCount = games.filter((g) => g.result === "1/2-1/2").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Game <span className="text-gradient-gold">History</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-6">Your past online games and results.</p>

          {/* Stats summary */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: "Games", value: games.length, icon: Swords, color: "text-primary" },
              { label: "Wins", value: winCount, icon: Trophy, color: "text-green-400" },
              { label: "Losses", value: lossCount, icon: TrendingUp, color: "text-red-400" },
              { label: "Draws", value: drawCount, icon: Clock, color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/50 bg-card/80 p-3 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <p className="font-mono text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Game list */}
          {fetching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-16">
              <Swords className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No games played yet.</p>
              <Link to="/play/online">
                <Button>Play Your First Game</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {games.map((g) => {
                const isWhite = g.white_player_id === user.id;
                const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                const drew = g.result === "1/2-1/2";
                const date = new Date(g.created_at);
                const moveCount = g.pgn ? g.pgn.split(/\d+\./).length - 1 : 0;

                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-xl border border-border/30 bg-card hover:border-primary/20 transition-all px-4 py-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          won
                            ? "bg-green-500/15 text-green-400"
                            : drew
                            ? "bg-muted text-muted-foreground"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {won ? "WIN" : drew ? "DRAW" : "LOSS"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {isWhite ? "White" : "Black"} · {g.time_control_label}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-2.5 h-2.5" />
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {moveCount > 0 && <span>· {moveCount} moves</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {g.result || "N/A"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GameHistory;
