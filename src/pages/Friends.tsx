import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  UserPlus,
  Check,
  X,
  Loader2,
  Swords,
  Circle,
  Search as SearchIcon,
  Users as UsersIcon,
  Bell,
  Share2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GameInviteDialog from "@/components/GameInviteDialog";
import InviteFriendsCard from "@/components/friends/InviteFriendsCard";
import { toast } from "sonner";

interface FriendRow {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

interface ProfileLite {
  user_id: string;
  display_name: string | null;
  username: string | null;
  rating: number;
  avatar_url?: string | null;
}

type ProfileMap = Record<string, ProfileLite>;

const TAB_HASH_MAP: Record<string, string> = {
  "#all": "all",
  "#add": "add",
  "#requests": "requests",
  "#challenge": "challenge",
  "#invite": "invite",
};

const Friends = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [friendships, setFriendships] = useState<FriendRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [inviteTarget, setInviteTarget] = useState<{ id: string; name: string } | null>(null);

  const [tab, setTab] = useState<string>(TAB_HASH_MAP[location.hash] || "all");

  // Add Friend search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    setTab(TAB_HASH_MAP[location.hash] || "all");
  }, [location.hash]);

  const loadFriendships = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    const rows = (data as FriendRow[]) || [];
    setFriendships(rows);

    const userIds = new Set<string>();
    rows.forEach((r) => {
      userIds.add(r.user_id);
      userIds.add(r.friend_id);
    });
    userIds.delete(user.id);

    if (userIds.size > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, rating, avatar_url")
        .in("user_id", Array.from(userIds));
      const map: ProfileMap = {};
      profs?.forEach((p) => {
        map[p.user_id] = p as ProfileLite;
      });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadFriendships();
  }, [user]);

  // Search users by username/display name (debounced)
  useEffect(() => {
    if (!user) return;
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, rating, avatar_url")
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .neq("user_id", user.id)
        .limit(15);
      setSearchResults((data as ProfileLite[]) || []);
      setSearching(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm, user]);

  const acceptFriend = async (id: string) => {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    setFriendships((prev) => prev.map((f) => (f.id === id ? { ...f, status: "accepted" } : f)));
    toast.success("Friend request accepted");
  };

  const declineFriend = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    setFriendships((prev) => prev.filter((f) => f.id !== id));
  };

  const removeFriend = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    setFriendships((prev) => prev.filter((f) => f.id !== id));
    toast.success("Friend removed");
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!user) return;
    setSendingTo(targetId);
    const { error } = await supabase
      .from("friendships")
      .insert({ user_id: user.id, friend_id: targetId, status: "pending" });
    setSendingTo(null);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Request already sent" : "Could not send request");
      return;
    }
    toast.success("Friend request sent");
    loadFriendships();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) {
    navigate("/login");
    return null;
  }

  const incoming = friendships.filter((f) => f.friend_id === user.id && f.status === "pending");
  const accepted = friendships.filter((f) => f.status === "accepted");
  const outgoing = friendships.filter((f) => f.user_id === user.id && f.status === "pending");

  const getOtherId = (f: FriendRow) => (f.user_id === user.id ? f.friend_id : f.user_id);
  const getName = (uid: string) =>
    profiles[uid]?.display_name || profiles[uid]?.username || "Player";

  // Map of relationships involving the current user, keyed by other-user id
  const relationByUserId = useMemo(() => {
    const map = new Map<string, FriendRow>();
    friendships.forEach((f) => {
      const other = getOtherId(f);
      map.set(other, f);
    });
    return map;
  }, [friendships]);

  const onTabChange = (v: string) => {
    setTab(v);
    const hash = Object.keys(TAB_HASH_MAP).find((k) => TAB_HASH_MAP[k] === v);
    if (hash) navigate(`/friends${hash}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          <span className="text-gradient-gold">Friends</span>
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Manage your friends, find new players, and challenge them to a game.
        </p>

        <div className="max-w-2xl mx-auto">
          <Tabs value={tab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid grid-cols-5 w-full mb-6">
              <TabsTrigger value="all" className="text-xs">
                <UsersIcon className="h-3.5 w-3.5 mr-1.5" />
                All ({accepted.length})
              </TabsTrigger>
              <TabsTrigger value="add" className="text-xs">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Add
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-xs">
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                Requests {incoming.length > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground px-1">
                    {incoming.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="challenge" className="text-xs">
                <Swords className="h-3.5 w-3.5 mr-1.5" />
                Challenge
              </TabsTrigger>
              <TabsTrigger value="invite" className="text-xs">
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Invite
              </TabsTrigger>
            </TabsList>

            {/* All Friends */}
            <TabsContent value="all" className="space-y-2">
              {loading ? (
                <div className="h-20 rounded-lg bg-muted/30 animate-pulse" />
              ) : accepted.length === 0 ? (
                <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
                  <UsersIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">You don't have any friends yet.</p>
                  <Button size="sm" onClick={() => onTabChange("add")}>
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Find Friends
                  </Button>
                </div>
              ) : (
                accepted.map((f) => {
                  const otherId = getOtherId(f);
                  const isOnline = otherId.charCodeAt(0) % 3 === 0;
                  return (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 hover:border-primary/30 transition-all"
                    >
                      <div className="relative">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Circle
                          className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 ${
                            isOnline
                              ? "fill-green-500 text-green-500"
                              : "fill-muted-foreground/40 text-muted-foreground/40"
                          }`}
                        />
                      </div>
                      <Link
                        to={`/profile/${otherId}`}
                        className="flex-1 font-medium text-foreground hover:text-primary min-w-0 truncate"
                      >
                        {getName(otherId)}
                      </Link>
                      <span className="font-mono text-sm text-primary">
                        {profiles[otherId]?.rating || 1200}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInviteTarget({ id: otherId, name: getName(otherId) })}
                        className="h-7 text-xs text-primary hover:bg-primary/10"
                      >
                        <Swords className="h-3 w-3 mr-1" /> Challenge
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFriend(f.id)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Remove friend"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Add Friend */}
            <TabsContent value="add" className="space-y-3">
              <div className="rounded-lg border border-border/50 bg-card p-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">
                  Search players by username or name
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Type at least 2 characters…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {searching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!searching && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No players match "{searchTerm}".
                  </p>
                )}
                {searchResults.map((p) => {
                  const rel = relationByUserId.get(p.user_id);
                  const alreadyFriend = rel?.status === "accepted";
                  const alreadyPending = rel?.status === "pending";
                  return (
                    <div
                      key={p.user_id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Link
                        to={`/profile/${p.user_id}`}
                        className="flex-1 font-medium text-foreground hover:text-primary min-w-0 truncate"
                      >
                        {p.display_name || p.username || "Player"}
                        {p.username && (
                          <span className="ml-2 text-xs text-muted-foreground">@{p.username}</span>
                        )}
                      </Link>
                      <span className="font-mono text-sm text-primary">{p.rating}</span>
                      {alreadyFriend ? (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Friend
                        </span>
                      ) : alreadyPending ? (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => sendFriendRequest(p.user_id)}
                          disabled={sendingTo === p.user_id}
                          className="h-7 text-xs"
                        >
                          {sendingTo === p.user_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3 mr-1" /> Add
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Requests */}
            <TabsContent value="requests" className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Incoming
                </h2>
                {incoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">No incoming requests.</p>
                ) : (
                  incoming.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3"
                    >
                      <User className="h-4 w-4 text-primary" />
                      <Link
                        to={`/profile/${getOtherId(f)}`}
                        className="flex-1 font-medium text-foreground hover:text-primary"
                      >
                        {getName(getOtherId(f))}
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => acceptFriend(f.id)}
                        className="h-7 text-xs"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => declineFriend(f.id)}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Sent by you
                </h2>
                {outgoing.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">No pending outgoing requests.</p>
                ) : (
                  outgoing.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3"
                    >
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-foreground">{getName(getOtherId(f))}</span>
                      <span className="text-xs text-muted-foreground">Pending</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => declineFriend(f.id)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Cancel request"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Challenge */}
            <TabsContent value="challenge" className="space-y-2">
              {accepted.length === 0 ? (
                <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
                  <Swords className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Add at least one friend before you can send a challenge.
                  </p>
                  <Button size="sm" onClick={() => onTabChange("add")}>
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Find Friends
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Pick a friend to send a game invite.
                  </p>
                  {accepted.map((f) => {
                    const otherId = getOtherId(f);
                    return (
                      <button
                        key={f.id}
                        onClick={() => setInviteTarget({ id: otherId, name: getName(otherId) })}
                        className="w-full flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 font-medium text-foreground truncate">
                          {getName(otherId)}
                        </span>
                        <span className="font-mono text-sm text-primary">
                          {profiles[otherId]?.rating || 1200}
                        </span>
                        <Swords className="h-4 w-4 text-primary" />
                      </button>
                    );
                  })}
                </>
              )}
            </TabsContent>

            {/* Invite via link / social */}
            <TabsContent value="invite">
              <InviteFriendsCard
                username={profile?.username}
                displayName={profile?.display_name}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      {inviteTarget && (
        <GameInviteDialog
          open={!!inviteTarget}
          onOpenChange={(v) => !v && setInviteTarget(null)}
          recipientId={inviteTarget.id}
          recipientName={inviteTarget.name}
        />
      )}
    </div>
  );
};

export default Friends;
