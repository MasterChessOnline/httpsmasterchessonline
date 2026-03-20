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
import { motion } from "framer-motion";

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
  const [tab, setTab] = useState<"elo">("elo");

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
    if (i === 0) return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center shadow-glow">
        <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
    );
    if (i === 1) return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Medal className="h-5 w-5 text-primary/70" />
      </div>
    );
    if (i === 2) return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center">
        <Medal className="h-5 w-5 text-muted-foreground" />
      </div>
    );
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted/50 flex items-center justify-center">
        <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
      </div>
    );
  };

  const premiumPlayers = players
    .filter(p => p.games_played >= 5)
    .sort((a, b) => {
      const wrA = a.games_won / a.games_played;
      const wrB = b.games_won / b.games_played;
      return wrB - wrA || b.rating - a.rating;
    })
    .slice(0, 50);

  const renderTopThree = (list: LeaderboardEntry[]) => {
    const top3 = list.slice(0, 3);
    if (top3.length < 3) return null;

    return (
      <div className="flex items-end justify-center gap-3 sm:gap-6 mb-8">
        {/* 2nd place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted/60 border-2 border-border/50 flex items-center justify-center mb-2">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground truncate max-w-[80px] sm:max-w-[100px]">
            {top3[1].display_name || "Anonymous"}
          </p>
          <p className="font-mono text-lg font-bold text-primary">{top3[1].rating}</p>
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-t-xl bg-muted/40 border border-border/30 flex items-center justify-center mt-2">
            <Medal className="h-6 w-6 text-muted-foreground/60" />
          </div>
        </motion.div>

        {/* 1st place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center mb-2 shadow-glow">
            <Crown className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </div>
          <p className="text-sm sm:text-base font-semibold text-foreground truncate max-w-[80px] sm:max-w-[120px]">
            {top3[0].display_name || "Anonymous"}
          </p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-primary drop-shadow-[0_0_8px_hsl(43_80%_55%/0.4)]">{top3[0].rating}</p>
          <div className="w-16 sm:w-20 h-24 sm:h-28 rounded-t-xl bg-primary/10 border border-primary/20 flex items-center justify-center mt-2">
            <Crown className="h-8 w-8 text-primary/40" />
          </div>
        </motion.div>

        {/* 3rd place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted/40 border-2 border-border/30 flex items-center justify-center mb-2">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground truncate max-w-[80px] sm:max-w-[100px]">
            {top3[2].display_name || "Anonymous"}
          </p>
          <p className="font-mono text-lg font-bold text-primary">{top3[2].rating}</p>
          <div className="w-16 sm:w-20 h-12 sm:h-14 rounded-t-xl bg-muted/30 border border-border/20 flex items-center justify-center mt-2">
            <Medal className="h-5 w-5 text-muted-foreground/40" />
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground text-center mb-2">
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
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all border ${
                tab === t.key
                  ? "border-primary bg-primary/10 text-primary shadow-glow"
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
                <>
                  {renderTopThree(players)}
                  <div className="space-y-1.5">
                    {players.slice(3).map((player, idx) => {
                      const i = idx + 3;
                      const winRate = player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0;
                      const isMe = user?.id === player.user_id;
                      return (
                        <Link
                          key={player.id}
                          to={`/profile/${player.user_id}`}
                          className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-primary/30 ${
                            isMe ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card/60 backdrop-blur-sm"
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
                </>
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
