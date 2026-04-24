import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Medal, Crown, TrendingUp, Flame, Swords, Filter, Bot, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { calculateXP, getLevelFromXP } from "@/lib/gamification";
import TitleBadge from "@/components/TitleBadge";
import SeasonBanner from "@/components/SeasonBanner";
import { findCountry } from "@/lib/countries";
import { TITLES, getTitle } from "@/lib/titles";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  rating: number;
  bot_rating: number;
  games_played: number;
  games_won: number;
  games_drawn: number;
  games_lost: number;
  bot_games_played: number;
  bot_games_won: number;
  bot_games_drawn: number;
  bot_games_lost: number;
  country?: string | null;
  country_flag?: string | null;
  highest_title_key?: string | null;
}

type Mode = "online" | "bot";
type SortBy = "rating" | "xp" | "wins" | "winrate";

const Leaderboard = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("online");
  const [filter, setFilter] = useState<"all" | "top50" | "active">("all");
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [titleFilter, setTitleFilter] = useState<string>("all");

  const titleBands = TITLES.filter((t) => t.key.startsWith("mc-"));

  useEffect(() => {
    supabase
      .from("profiles")
      .select(
        "id, user_id, display_name, username, rating, bot_rating, games_played, games_won, games_drawn, games_lost, bot_games_played, bot_games_won, bot_games_drawn, bot_games_lost, country, country_flag, highest_title_key"
      )
      .order("rating", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setPlayers((data as LeaderboardEntry[]) || []);
        setLoading(false);
      });
  }, []);

  // Helpers per-mode
  const ratingOf = (p: LeaderboardEntry) => (mode === "online" ? p.rating : p.bot_rating ?? 1200);
  const gamesOf = (p: LeaderboardEntry) => (mode === "online" ? p.games_played : p.bot_games_played);
  const winsOf = (p: LeaderboardEntry) => (mode === "online" ? p.games_won : p.bot_games_won);
  const winRateOf = (p: LeaderboardEntry) => {
    const g = gamesOf(p);
    return g > 0 ? (winsOf(p) / g) * 100 : 0;
  };
  const getXP = (p: LeaderboardEntry) => calculateXP(p);

  const sorted = useMemo(() => {
    let list = [...players];

    // Title filter applies to the active mode's rating
    if (titleFilter !== "all") {
      list = list.filter((p) => {
        const key = p.highest_title_key || getTitle(ratingOf(p)).key;
        return key === titleFilter;
      });
    }

    if (filter === "active") list = list.filter((p) => gamesOf(p) >= 5);

    list.sort((a, b) => {
      if (sortBy === "xp") return getXP(b) - getXP(a);
      if (sortBy === "wins") return winsOf(b) - winsOf(a);
      if (sortBy === "winrate") return winRateOf(b) - winRateOf(a);
      return ratingOf(b) - ratingOf(a);
    });

    if (filter === "top50") list = list.slice(0, 50);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, mode, sortBy, filter, titleFilter]);

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
              key={`${mode}-${player.id}`}
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
                <div className="mt-0.5 mb-0.5">
                  <TitleBadge titleKey={player.highest_title_key ?? undefined} rating={ratingOf(player)} size="xs" />
                </div>
                <p className={`font-mono font-bold ${rank === 1 ? "text-2xl text-primary drop-shadow-[0_0_8px_hsl(43_80%_55%/0.4)]" : "text-lg text-foreground"}`}>
                  {ratingOf(player)}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{mode === "online" ? "Online" : "Bot"}</p>
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

  const renderList = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />)}
        </div>
      );
    }
    if (sorted.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-12">
          {titleFilter !== "all"
            ? "No players in this title band yet."
            : `No ${mode === "online" ? "online" : "bot"} ranked players yet. Be the first!`}
        </p>
      );
    }
    return (
      <>
        {renderPodium(sorted)}
        <div className="space-y-1.5">
          {sorted.slice(3).map((player, idx) => {
            const i = idx + 3;
            const xp = getXP(player);
            const lvl = getLevelFromXP(xp);
            const wr = Math.round(winRateOf(player));
            const isMe = user?.id === player.user_id;
            return (
              <motion.div
                key={`${mode}-${player.id}`}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium truncate text-sm ${isMe ? "text-primary" : "text-foreground"}`}>
                          {player.display_name || player.username || "Anonymous"}
                          {isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                        </span>
                        <TitleBadge titleKey={player.highest_title_key ?? undefined} rating={ratingOf(player)} size="xs" />
                        {player.country_flag && (
                          <span className="text-xs" title={findCountry(player.country)?.name ?? ""}>{player.country_flag}</span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                          Lv.{lvl.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {gamesOf(player)}G · {wr}%W · {xp.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-mono text-lg font-bold group-hover:drop-shadow-[0_0_6px_hsl(43_80%_55%/0.3)] ${
                      mode === "online" ? "text-primary" : "text-[hsl(190_85%_60%)]"
                    }`}>
                      {ratingOf(player)}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      {mode === "online" ? "Online" : "Bot"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2 uppercase tracking-wider">
            <span className="text-gradient-neon">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground text-sm">Top players ranked by skill & dedication</p>
        </motion.div>

        <div className="max-w-2xl mx-auto mb-6">
          <SeasonBanner />
        </div>

        {/* Mode Tabs: Online vs Bot */}
        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as Mode);
            setTitleFilter("all");
          }}
          className="max-w-2xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-card/60 border border-border/40 backdrop-blur-sm">
            <TabsTrigger
              value="online"
              className="flex items-center gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-glow rounded-md font-semibold uppercase tracking-wider text-xs"
            >
              <Globe className="h-4 w-4" /> Online Rating
            </TabsTrigger>
            <TabsTrigger
              value="bot"
              className="flex items-center gap-2 data-[state=active]:bg-[hsl(190_85%_60%/0.15)] data-[state=active]:text-[hsl(190_85%_60%)] rounded-md font-semibold uppercase tracking-wider text-xs"
            >
              <Bot className="h-4 w-4" /> Bot Rating
            </TabsTrigger>
          </TabsList>

          {/* Filters + Sort (shared, but operate per-mode) */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6 mb-6">
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
                { key: "rating" as SortBy, label: "Rating", icon: TrendingUp },
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

          {/* MasterChess Title band filter */}
          <div className="flex justify-center gap-1.5 flex-wrap mb-8">
            <button
              onClick={() => setTitleFilter("all")}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                titleFilter === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Filter className="h-3 w-3" /> All Titles
            </button>
            {titleBands.map((t) => {
              const active = titleFilter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTitleFilter(t.key)}
                  title={`${t.fullName} (${t.minRating}+)`}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                    active
                      ? `${t.bgColor} ${t.color} ${t.borderColor} shadow-glow`
                      : "border-border/50 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              );
            })}
          </div>

          <TabsContent value="online" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="online-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderList()}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="bot" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="bot-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderList()}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
