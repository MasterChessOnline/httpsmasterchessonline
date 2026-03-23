import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Medal, User, Crown, TrendingUp, Flame, Swords, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { calculateXP, getLevelFromXP } from "@/lib/gamification";
import XPLevelBadge from "@/components/XPLevelBadge";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  games_drawn: number;
  games_lost: number;
}

type SortBy = "rating" | "xp" | "wins" | "winrate";

const Leaderboard = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "top50" | "active">("all");
  const [sortBy, setSortBy] = useState<SortBy>("rating");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, user_id, display_name, username, rating, games_played, games_won, games_drawn, games_lost")
      .order("rating", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setPlayers((data as LeaderboardEntry[]) || []);
        setLoading(false);
      });
  }, []);

  const getXP = (p: LeaderboardEntry) => calculateXP(p);
  const getWinRate = (p: LeaderboardEntry) => p.games_played > 0 ? (p.games_won / p.games_played) * 100 : 0;

  const getSorted = (list: LeaderboardEntry[]) => {
    return [...list].sort((a, b) => {
      if (sortBy === "xp") return getXP(b) - getXP(a);
      if (sortBy === "wins") return b.games_won - a.games_won;
      if (sortBy === "winrate") return getWinRate(b) - getWinRate(a);
      return b.rating - a.rating;
    });
  };

  const getRankBadge = (i: number) => {
    if (i === 0) return (
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 flex items-center justify-center shadow-glow">
        <Crown className="h-5 w-5 text-primary" />
      </div>
    );
    if (i === 1) return (
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-muted to-muted/50 border-2 border-border/50 flex items-center justify-center">
        <Medal className="h-5 w-5 text-foreground/70" />
      </div>
    );
    if (i === 2) return (
      <div className="w-11 h-11 rounded-full bg-muted/60 border-2 border-border/30 flex items-center justify-center">
        <Medal className="h-4 w-4 text-muted-foreground" />
      </div>
    );
    return (
      <div className="w-11 h-11 rounded-full bg-muted/30 flex items-center justify-center">
        <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
      </div>
    );
  };

  const renderPodium = (list: LeaderboardEntry[]) => {
    const top3 = list.slice(0, 3);
    if (top3.length < 3) return null;

    const podiumData = [
      { player: top3[1], rank: 2, height: "h-20", size: "w-16 h-16", delay: 0.1 },
      { player: top3[0], rank: 1, height: "h-28", size: "w-20 h-20", delay: 0 },
      { player: top3[2], rank: 3, height: "h-14", size: "w-14 h-14", delay: 0.2 },
    ];

    return (
      <div className="flex items-end justify-center gap-4 sm:gap-8 mb-10 pt-8">
        {podiumData.map(({ player, rank, height, size, delay }) => {
          const xp = getXP(player);
          const lvl = getLevelFromXP(xp);
          return (
            <motion.div
              key={player.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay, type: "spring", stiffness: 200 }}
            >
              <Link to={`/profile/${player.user_id}`} className="flex flex-col items-center hover:scale-105 transition-transform">
                <div className={`${size} rounded-full border-2 ${rank === 1 ? "border-primary/50 shadow-glow" : "border-border/40"} bg-gradient-to-br from-muted to-card flex items-center justify-center mb-2 relative`}>
                  <span className="text-xl">{lvl.icon}</span>
                  <div className={`absolute -bottom-1 -right-1 ${rank === 1 ? "bg-primary" : "bg-muted-foreground"} text-primary-foreground text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
                    {lvl.level}
                  </div>
                </div>
                <p className={`text-sm font-semibold truncate max-w-[90px] ${rank === 1 ? "text-primary" : "text-foreground"}`}>
                  {player.display_name || "Anonymous"}
                </p>
                <p className={`font-mono font-bold ${rank === 1 ? "text-2xl text-primary drop-shadow-[0_0_8px_hsl(43_80%_55%/0.4)]" : "text-lg text-foreground"}`}>
                  {player.rating}
                </p>
                <p className="text-[10px] text-muted-foreground">{xp.toLocaleString()} XP</p>
              </Link>
              <div className={`w-20 sm:w-24 ${height} rounded-t-xl mt-2 flex items-center justify-center ${
                rank === 1 ? "bg-gradient-to-t from-primary/10 to-primary/25 border border-primary/30" :
                rank === 2 ? "bg-gradient-to-t from-muted/30 to-muted/50 border border-border/30" :
                "bg-gradient-to-t from-muted/20 to-muted/30 border border-border/20"
              }`}>
                <span className={`font-display text-2xl font-bold ${rank === 1 ? "text-primary" : "text-muted-foreground/60"}`}>
                  {rank}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const getFiltered = () => {
    let filtered = players;
    if (filter === "top50") filtered = players.slice(0, 50);
    if (filter === "active") filtered = players.filter(p => p.games_played >= 5);
    return getSorted(filtered);
  };

  const sorted = getFiltered();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
            <span className="text-gradient-gold">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">Top players ranked by skill & dedication</p>
        </motion.div>

        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
          <div className="flex justify-center gap-1.5 flex-wrap">
            {[
              { key: "all" as const, label: "All Players" },
              { key: "top50" as const, label: "Top 50" },
              { key: "active" as const, label: "Active (5+)" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-2 text-xs font-medium border transition-all ${
                  filter === f.key
                    ? "border-primary bg-primary/10 text-primary shadow-glow"
                    : "border-border/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {[
              { key: "rating" as SortBy, label: "ELO", icon: TrendingUp },
              { key: "xp" as SortBy, label: "XP", icon: Flame },
              { key: "wins" as SortBy, label: "Wins", icon: Trophy },
              { key: "winrate" as SortBy, label: "Win%", icon: Swords },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium border transition-all ${
                  sortBy === s.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <s.icon className="h-3 w-3" /> {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />)}
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No players yet. Be the first!</p>
          ) : (
            <>
              {renderPodium(sorted)}
              <div className="space-y-1.5">
                {sorted.slice(3).map((player, idx) => {
                  const i = idx + 3;
                  const xp = getXP(player);
                  const lvl = getLevelFromXP(xp);
                  const winRate = player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0;
                  const isMe = user?.id === player.user_id;
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                    >
                      <Link
                        to={`/profile/${player.user_id}`}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-primary/30 hover:bg-card/90 group ${
                          isMe ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card/60 backdrop-blur-sm"
                        }`}
                      >
                        {getRankBadge(i)}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium truncate text-sm ${isMe ? "text-primary" : "text-foreground"}`}>
                                {player.display_name || player.username || "Anonymous"}
                                {isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                                Lv.{lvl.level}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {player.games_played}G · {winRate}%W · {xp.toLocaleString()} XP
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-lg font-bold text-primary group-hover:drop-shadow-[0_0_6px_hsl(43_80%_55%/0.3)]">
                            {player.rating}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
