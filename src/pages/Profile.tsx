import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Trophy, Swords, TrendingUp, Calendar, Edit, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import RankBadge from "@/components/RankBadge";
import TitleBadge from "@/components/TitleBadge";
import { getRank as getRankFromLib } from "@/lib/ranks";
import { getTitle, getNextTitle, getTitleProgress } from "@/lib/titles";
import { findCountry } from "@/lib/countries";
import { Link } from "react-router-dom";
import { analyzePersonality } from "@/lib/play-personality";
import StreakBadge from "@/components/StreakBadge";
import SeasonBanner from "@/components/SeasonBanner";
import BadgeGrid from "@/components/BadgeGrid";
import { getStreakState, type StreakState } from "@/lib/progression";

import RatingHistoryGraph, { type RatingPoint } from "@/components/RatingHistoryGraph";

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  rating: number;
  bot_rating?: number;
  bot_games_played?: number;
  bot_games_won?: number;
  bot_games_lost?: number;
  bot_games_drawn?: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  created_at: string;
  country?: string | null;
  country_flag?: string | null;
  peak_rating?: number;
  bot_peak_rating?: number;
  highest_title_key?: string | null;
}

interface GameHistory {
  id: string;
  white_player_id: string;
  black_player_id: string;
  result: string | null;
  time_control_label: string;
  created_at: string;
  status: string;
}

// Legacy local badge stub kept only for backward types — UI now uses BadgeGrid.

const Profile = () => {
  const { userId } = useParams();
  const { user, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [onlineHistory, setOnlineHistory] = useState<RatingPoint[]>([]);
  const [botHistory, setBotHistory] = useState<RatingPoint[]>([]);
  const [streak, setStreak] = useState<StreakState | null>(null);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!userId) return;

    supabase.from("profiles").select("*").eq("user_id", userId).single()
      .then(({ data }) => {
        setProfileData(data as ProfileData | null);
        if (data) setEditName((data as ProfileData).display_name || "");
        setLoading(false);
      });

    supabase.from("online_games").select("*")
      .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { setGames((data as GameHistory[]) || []); });

    // Rating history (last 30 entries each)
    supabase.from("rating_history" as any).select("*")
      .eq("user_id", userId).eq("rating_type", "online")
      .order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => setOnlineHistory(((data as any[]) || []).reverse() as RatingPoint[]));

    supabase.from("rating_history" as any).select("*")
      .eq("user_id", userId).eq("rating_type", "bot")
      .order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => setBotHistory(((data as any[]) || []).reverse() as RatingPoint[]));

    // Fetch best streak (bot rating type = primary progression track)
    getStreakState(userId, "bot").then(setStreak);

    if (user && user.id !== userId) {
      supabase.from("friendships").select("status")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) setFriendStatus(data[0].status);
        });
    }
  }, [userId, user]);

  const sendFriendRequest = async () => {
    if (!user || !userId) return;
    await supabase.from("friendships").insert({ user_id: user.id, friend_id: userId });
    setFriendStatus("pending");
  };

  const saveProfile = async () => {
    if (!user || !profileData) return;
    await supabase.from("profiles").update({ display_name: editName.trim() || "Player" }).eq("user_id", user.id);
    setProfileData({ ...profileData, display_name: editName.trim() || "Player" });
    setEditing(false);
    refreshProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-40 rounded-2xl bg-muted/30 animate-pulse" />
            <div className="h-48 rounded-2xl bg-muted/30 animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Player not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const winRate = profileData.games_played > 0
    ? Math.round((profileData.games_won / profileData.games_played) * 100) : 0;

  const tier = getRankFromLib(profileData.rating);
  const personality = analyzePersonality(profileData);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Profile header */}
          <motion.div
            className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-5 sm:p-6 glass-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 shadow-glow overflow-hidden">
                {profileData.avatar_url ? (
                  <img src={profileData.avatar_url} alt={profileData.display_name || "Player"} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="h-9 max-w-[200px]"
                      maxLength={50}
                    />
                    <Button size="sm" onClick={saveProfile}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground truncate">
                      {profileData.display_name || profileData.username || "Player"}
                    </h1>
                    {isOwnProfile && (
                      <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {profileData.country_flag && (
                    <span className="text-xs text-muted-foreground">{profileData.country_flag} {findCountry(profileData.country)?.name ?? ""}</span>
                  )}
                  <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Joined {new Date(profileData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <TitleBadge titleKey={profileData.highest_title_key ?? getTitle(profileData.bot_rating ?? 1200).key} size="sm" hideUnranked={false} />
                  <RankBadge rating={profileData.rating} size="sm" />
                  {streak && (
                    <StreakBadge streak={streak.current_streak} best={streak.best_streak} size="sm" showBest />
                  )}
                </div>
              </div>
            </div>

            {/* Title progress (driven by bot rating — the MasterChess title ladder) */}
            {(() => {
              const botRating = profileData.bot_rating ?? 1200;
              const next = getNextTitle(botRating);
              if (!next) return null;
              const progress = getTitleProgress(botRating);
              return (
                <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Next MasterChess title</span>
                    <span className={`font-bold ${next.color}`}>{next.icon} {next.label}</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                    {botRating} / {next.minRating} bot rating
                  </p>
                </div>
              );
            })()}

            {/* Dual rating display */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Online Rating</p>
                <p className="font-mono text-3xl font-bold text-primary drop-shadow-glow">{profileData.rating}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Peak {profileData.peak_rating ?? profileData.rating}</p>
              </div>
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bot Rating</p>
                <p className="font-mono text-3xl font-bold text-accent">{profileData.bot_rating ?? 1200}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Peak {profileData.bot_peak_rating ?? profileData.bot_rating ?? 1200}</p>
              </div>
            </div>

            {/* Rating history graphs */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Online history</p>
                <RatingHistoryGraph points={onlineHistory} color="hsl(var(--primary))" />
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Bot history</p>
                <RatingHistoryGraph points={botHistory} color="hsl(var(--accent))" />
              </div>
            </div>

            {/* Friend actions */}
            {user && !isOwnProfile && (
              <div className="mt-4 flex justify-center">
                {!friendStatus ? (
                  <Button size="sm" onClick={sendFriendRequest}>Add Friend</Button>
                ) : friendStatus === "pending" ? (
                  <Badge variant="outline" className="text-muted-foreground">Friend Request Pending</Badge>
                ) : friendStatus === "accepted" ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Friends ✓</Badge>
                ) : null}
              </div>
            )}
          </motion.div>

          {/* Chess Card CTA */}
          <Link to={isOwnProfile ? "/chess-card" : `/chess-card?compare=${userId}`} className="block">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.01 }}
              className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-4 cursor-pointer hover:shadow-glow transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-xl">
                  ✨
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-foreground">Chess Card</h3>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px]">NEW</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isOwnProfile ? "View your 7-skill profile and compare with other players" : "Compare Chess Cards head-to-head"}
                  </p>
                </div>
                <span className="text-primary text-sm font-bold">→</span>
              </div>
            </motion.div>
          </Link>

          {/* Play Personality */}
          {profileData.games_played >= 1 && (
            <motion.div
              className="rounded-xl border border-border/50 bg-card/80 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                  {personality.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">Play Style</h3>
                    <Badge variant="outline" className={`text-[10px] ${personality.color}`}>
                      {personality.style}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{personality.description}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Season Banner */}
          <SeasonBanner />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Played", value: profileData.games_played, icon: Swords },
              { label: "Won", value: profileData.games_won, icon: Trophy },
              { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp },
              { label: "Best Streak", value: streak?.best_streak ?? 0, icon: Trophy },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card/80 p-3 text-center">
                <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Achievement Badges */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-display text-sm font-semibold text-foreground">Achievement Badges</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Earned through ranked play</p>
            </div>
            <BadgeGrid userId={userId!} />
          </div>

          {/* Game History */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Recent Games</h3>
            {games.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No games played yet.</p>
            ) : (
              <div className="space-y-1.5">
                {games.map(g => {
                  const isWhite = g.white_player_id === userId;
                  const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                  const drew = g.result === "1/2-1/2";
                  return (
                    <div key={g.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${won ? "bg-accent/20 text-accent-foreground" : drew ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                          {won ? "W" : drew ? "D" : "L"}
                        </span>
                        <span className="text-xs text-foreground">{isWhite ? "White" : "Black"}</span>
                        <span className="text-[10px] text-muted-foreground">{g.time_control_label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
