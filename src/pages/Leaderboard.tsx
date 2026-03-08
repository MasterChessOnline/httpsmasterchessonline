import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Medal, User, Crown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"elo" | "puzzle">("elo");
  const [puzzleLeaders, setPuzzleLeaders] = useState<{ user_id: string; count: number; display_name: string }[]>([]);

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

    // Puzzle leaderboard - top solvers this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    supabase
      .from("puzzle_solves")
      .select("user_id")
      .eq("solved", true)
      .gte("puzzle_date", monthStart.toISOString().split("T")[0])
      .then(async ({ data }) => {
        if (!data) return;
        const counts: Record<string, number> = {};
        data.forEach(d => { counts[d.user_id] = (counts[d.user_id] || 0) + 1; });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20);
        if (sorted.length === 0) return;
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", sorted.map(s => s[0]));
        const nameMap: Record<string, string> = {};
        profiles?.forEach(p => { nameMap[p.user_id] = p.display_name || "Player"; });
        setPuzzleLeaders(sorted.map(([uid, count]) => ({
          user_id: uid,
          count,
          display_name: nameMap[uid] || "Player",
        })));
      });
  }, []);

  const getRankDisplay = (i: number) => {
    if (i === 0) return <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Crown className="h-4 w-4 text-primary" /></div>;
    if (i === 1) return <div className="w-8 h-8 rounded-full bg-gold-light/20 flex items-center justify-center"><Medal className="h-4 w-4 text-gold-light" /></div>;
    if (i === 2) return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Medal className="h-4 w-4 text-muted-foreground" /></div>;
    return <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"><span className="text-xs font-bold text-muted-foreground">{i + 1}</span></div>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          <span className="text-gradient-gold">Leaderboard</span>
        </h1>
        <p className="text-center text-muted-foreground mb-6">See who's on top</p>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { key: "elo" as const, label: "ELO Ratings", icon: TrendingUp },
            { key: "puzzle" as const, label: "Puzzle Solvers", icon: Trophy },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all border ${
                tab === t.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {tab === "elo" && (
            <>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />)}
                </div>
              ) : players.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No players yet. Be the first!</p>
              ) : (
                <div className="space-y-1.5">
                  {players.map((player, i) => {
                    const winRate = player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0;
                    const isMe = user?.id === player.user_id;
                    return (
                      <Link
                        key={player.id}
                        to={`/profile/${player.user_id}`}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-primary/30 ${
                          isMe ? "border-primary/30 bg-primary/5" : i < 3 ? "border-primary/10 bg-card" : "border-border/50 bg-card"
                        }`}
                      >
                        {getRankDisplay(i)}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className={`font-medium truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                            {player.display_name || player.username || "Anonymous"}
                            {isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-lg font-bold text-primary">{player.rating}</p>
                          <p className="text-[10px] text-muted-foreground">{player.games_played}G · {winRate}%W</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === "puzzle" && (
            <>
              {puzzleLeaders.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No puzzle data this month yet. Solve today's puzzle to get on the board!</p>
              ) : (
                <div className="space-y-1.5">
                  {puzzleLeaders.map((entry, i) => {
                    const isMe = user?.id === entry.user_id;
                    return (
                      <Link
                        key={entry.user_id}
                        to={`/profile/${entry.user_id}`}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-primary/30 ${
                          isMe ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card"
                        }`}
                      >
                        {getRankDisplay(i)}
                        <span className={`font-medium flex-1 truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                          {entry.display_name}
                          {isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                        </span>
                        <span className="font-mono text-lg font-bold text-primary">{entry.count}</span>
                        <span className="text-[10px] text-muted-foreground">puzzles</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
