import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { User, UserPlus, Check, X, Loader2, Swords, Circle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface FriendRow {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

interface ProfileMap {
  [userId: string]: { display_name: string | null; username: string | null; rating: number };
}

const Friends = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [friendships, setFriendships] = useState<FriendRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      const rows = (data as FriendRow[]) || [];
      setFriendships(rows);

      // Fetch profiles of all related users
      const userIds = new Set<string>();
      rows.forEach(r => { userIds.add(r.user_id); userIds.add(r.friend_id); });
      userIds.delete(user.id);

      if (userIds.size > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name, username, rating")
          .in("user_id", Array.from(userIds));
        const map: ProfileMap = {};
        profs?.forEach(p => { map[p.user_id] = p; });
        setProfiles(map);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const acceptFriend = async (id: string) => {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    setFriendships(prev => prev.map(f => f.id === id ? { ...f, status: "accepted" } : f));
  };

  const removeFriend = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    setFriendships(prev => prev.filter(f => f.id !== id));
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) { navigate("/login"); return null; }

  const incoming = friendships.filter(f => f.friend_id === user.id && f.status === "pending");
  const accepted = friendships.filter(f => f.status === "accepted");
  const pending = friendships.filter(f => f.user_id === user.id && f.status === "pending");

  const getOtherId = (f: FriendRow) => f.user_id === user.id ? f.friend_id : f.user_id;
  const getName = (uid: string) => profiles[uid]?.display_name || profiles[uid]?.username || "Player";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-8">
          <span className="text-gradient-gold">Friends</span>
        </h1>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Incoming requests */}
          {incoming.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Friend Requests</h2>
              {incoming.map(f => (
                <div key={f.id} className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <User className="h-4 w-4 text-primary" />
                  <Link to={`/profile/${getOtherId(f)}`} className="flex-1 font-medium text-foreground hover:text-primary">{getName(getOtherId(f))}</Link>
                  <Button size="sm" variant="ghost" onClick={() => acceptFriend(f.id)} className="text-accent-foreground"><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeFriend(f.id)} className="text-destructive"><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}

          {/* Friends list */}
          <div className="space-y-2">
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Friends ({accepted.length})</h2>
            {loading ? (
              <div className="h-20 rounded-lg bg-muted/30 animate-pulse" />
            ) : accepted.length === 0 ? (
              <p className="text-sm text-muted-foreground">No friends yet. Visit player profiles to add friends!</p>
            ) : (
              accepted.map(f => {
                const otherId = getOtherId(f);
                // Simple online heuristic: random for demo
                const isOnline = otherId.charCodeAt(0) % 3 === 0;
                return (
                  <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 hover:border-primary/30 transition-all">
                    <div className="relative">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Circle className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 ${isOnline ? "fill-green-500 text-green-500" : "fill-muted-foreground/40 text-muted-foreground/40"}`} />
                    </div>
                    <Link to={`/profile/${otherId}`} className="flex-1 font-medium text-foreground hover:text-primary min-w-0 truncate">
                      {getName(otherId)}
                    </Link>
                    <span className="font-mono text-sm text-primary">{profiles[otherId]?.rating || 1200}</span>
                    <Link to="/play">
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:bg-primary/10">
                        <Swords className="h-3 w-3 mr-1" /> Challenge
                      </Button>
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Pending requests sent */}
          {pending.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</h2>
              {pending.map(f => (
                <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-foreground">{getName(getOtherId(f))}</span>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Friends;
