import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Trophy, Swords, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  created_at: string;
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

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!userId) return;

    // Fetch profile
    supabase.from("profiles").select("*").eq("user_id", userId).single()
      .then(({ data }) => {
        setProfileData(data as ProfileData | null);
        setLoading(false);
      });

    // Fetch game history
    supabase.from("online_games").select("*")
      .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { setGames((data as GameHistory[]) || []); });

    // Check friendship status
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-32 rounded-lg bg-muted/30 animate-pulse" />
            <div className="h-48 rounded-lg bg-muted/30 animate-pulse" />
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
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Player not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const winRate = profileData.games_played > 0
    ? Math.round((profileData.games_won / profileData.games_played) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile header */}
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {profileData.display_name || profileData.username || "Player"}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Joined {new Date(profileData.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-3xl font-bold text-primary">{profileData.rating}</p>
                <p className="text-xs text-muted-foreground uppercase">ELO Rating</p>
              </div>
            </div>

            {!isOwnProfile && user && (
              <div className="mt-4">
                {friendStatus === "accepted" ? (
                  <span className="text-sm text-accent-foreground">✓ Friends</span>
                ) : friendStatus === "pending" ? (
                  <span className="text-sm text-muted-foreground">Friend request sent</span>
                ) : (
                  <Button size="sm" variant="outline" onClick={sendFriendRequest}>Add Friend</Button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Games", value: profileData.games_played, icon: Swords },
              { label: "Wins", value: profileData.games_won, icon: Trophy },
              { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp },
              { label: "Draws", value: profileData.games_drawn, icon: Swords },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg border border-border/50 bg-card p-4 text-center">
                <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Match history */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Recent Games</h2>
            {games.length === 0 ? (
              <p className="text-sm text-muted-foreground">No games played yet.</p>
            ) : (
              <div className="space-y-2">
                {games.map(g => {
                  const isWhite = g.white_player_id === userId;
                  const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
                  const drew = g.result === "1/2-1/2";
                  return (
                    <div key={g.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${won ? "bg-accent/20 text-accent-foreground" : drew ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                          {won ? "W" : drew ? "D" : "L"}
                        </span>
                        <span className="text-sm text-foreground">{isWhite ? "White" : "Black"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">{g.time_control_label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{new Date(g.created_at).toLocaleDateString()}</span>
                      </div>
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
