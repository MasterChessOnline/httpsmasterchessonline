import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Medal, User } from "lucide-react";
import { Link } from "react-router-dom";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  rating: number;
  games_played: number;
  games_won: number;
}

const Leaderboard = () => {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, user_id, display_name, username, rating, games_played, games_won")
      .order("rating", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setPlayers((data as LeaderboardEntry[]) || []);
        setLoading(false);
      });
  }, []);

  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-5 w-5 text-primary" />;
    if (i === 1) return <Medal className="h-5 w-5 text-gold-light" />;
    if (i === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          <span className="text-gradient-gold">Leaderboard</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">Top players ranked by ELO rating</p>

        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : players.length === 0 ? (
            <p className="text-center text-muted-foreground">No players yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {players.map((player, i) => {
                const winRate = player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0;
                return (
                  <Link
                    key={player.id}
                    to={`/profile/${player.user_id}`}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all hover:border-primary/30 ${
                      i < 3 ? "border-primary/20 bg-primary/5" : "border-border/50 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8">{getRankIcon(i)}</div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {player.display_name || player.username || "Anonymous"}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-lg font-bold text-primary">{player.rating}</p>
                      <p className="text-xs text-muted-foreground">{player.games_played} games · {winRate}% win</p>
                    </div>
                  </Link>
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

export default Leaderboard;
