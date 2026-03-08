import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Medal, User, Crown, TrendingUp, Star, Gem, Shield, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasAccess } from "@/lib/premium-tiers";

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
  const { user, isPremium, subscriptionTier } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"elo" | "premium">("elo");

  const isElitePlus = hasAccess(subscriptionTier, "elite");

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

  const getRankDisplay = (i: number) => {
    if (i === 0) return <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Crown className="h-4 w-4 text-primary" /></div>;
    if (i === 1) return <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Medal className="h-4 w-4 text-primary/70" /></div>;
    if (i === 2) return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Medal className="h-4 w-4 text-muted-foreground" /></div>;
    return <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"><span className="text-xs font-bold text-muted-foreground">{i + 1}</span></div>;
  };

  // Premium leaderboard: top players filtered by high win rate + high games played
  const premiumPlayers = players
    .filter(p => p.games_played >= 5)
    .sort((a, b) => {
      const wrA = a.games_won / a.games_played;
      const wrB = b.games_won / b.games_played;
      return wrB - wrA || b.rating - a.rating;
    })
    .slice(0, 50);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          <span className="text-gradient-gold">Leaderboard</span>
        </h1>
        <p className="text-center text-muted-foreground mb-6">See who's on top</p>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { key: "elo" as const, label: "ELO Ratings", icon: TrendingUp },
            { key: "premium" as const, label: "VIP Board", icon: Gem },
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
              {t.key === "premium" && <Crown className="h-3 w-3 text-purple-400" />}
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

          {tab === "premium" && (
            <>
              {!isElitePlus ? (
                <div className="text-center py-16">
                  <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>VIP Leaderboard</h2>
                  <p className="text-muted-foreground mb-2">
                    The VIP leaderboard ranks players by win rate and is exclusive to Elite and Grandmaster members.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Required tier: <span className="text-purple-400 font-semibold">Elite ($15/mo)</span> or higher
                  </p>
                  <Link to="/premium">
                    <Button className="bg-primary text-primary-foreground">
                      <Gem className="w-4 h-4 mr-2" /> View Plans
                    </Button>
                  </Link>
                </div>
              ) : premiumPlayers.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No qualifying players yet (minimum 5 games).</p>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Gem className="w-3 h-3 mr-1" /> VIP Leaderboard — Ranked by Win Rate
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {premiumPlayers.map((player, i) => {
                      const winRate = Math.round((player.games_won / player.games_played) * 100);
                      const isMe = user?.id === player.user_id;
                      return (
                        <Link
                          key={player.id}
                          to={`/profile/${player.user_id}`}
                          className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-purple-500/30 ${
                            isMe ? "border-purple-500/30 bg-purple-500/5" : i < 3 ? "border-purple-500/10 bg-card" : "border-border/50 bg-card"
                          }`}
                        >
                          {getRankDisplay(i)}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className={`font-medium truncate ${isMe ? "text-purple-400" : "text-foreground"}`}>
                              {player.display_name || player.username || "Anonymous"}
                              {isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono text-lg font-bold text-purple-400">{winRate}%</p>
                            <p className="text-[10px] text-muted-foreground">{player.rating} ELO · {player.games_played}G</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
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
