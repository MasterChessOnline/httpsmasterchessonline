import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Shield, Users, Trophy, Send, ArrowLeft, Crown, ShieldCheck, LogOut, Loader2, Smile, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/UserAvatar";

interface Club {
  id: string; name: string; description: string; icon: string;
  owner_id: string; member_count: number; avg_rating: number;
}
interface Member {
  user_id: string; role: string; joined_at: string;
  display_name: string | null; username: string | null; rating: number; avatar_url: string | null;
}
interface ClubMsg {
  id: string; user_id: string; message: string; created_at: string;
  display_name?: string | null; avatar_url?: string | null;
}

const ClubDetail = () => {
  const { id: clubId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<ClubMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const myMember = members.find(m => m.user_id === user?.id);
  const myRole = myMember?.role;
  const isMember = !!myMember;
  const isOwnerOrAdmin = myRole === "owner" || myRole === "admin";

  // Sort leaderboard
  const leaderboard = [...members].sort((a, b) => b.rating - a.rating);
  const avgRating = members.length
    ? Math.round(members.reduce((s, m) => s + m.rating, 0) / members.length)
    : 1200;

  useEffect(() => {
    if (!clubId) return;
    let mounted = true;
    (async () => {
      const { data: c } = await supabase.from("clubs" as any).select("*").eq("id", clubId).maybeSingle();
      if (!mounted) return;
      if (!c) { setLoading(false); return; }
      setClub((c as unknown) as Club);

      const { data: mem } = await supabase
        .from("club_members" as any)
        .select("user_id, role, joined_at")
        .eq("club_id", clubId);

      const ids = (mem as any[] || []).map(m => m.user_id);
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("user_id, display_name, username, rating, avatar_url").in("user_id", ids)
        : { data: [] };
      const profMap = new Map((profs || []).map((p: any) => [p.user_id, p]));
      const merged: Member[] = (mem as any[] || []).map(m => ({
        ...m,
        ...(profMap.get(m.user_id) || { display_name: null, username: null, rating: 1200, avatar_url: null }),
      }));
      setMembers(merged);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [clubId, user]);

  // Load + subscribe to chat (only if member)
  useEffect(() => {
    if (!clubId || !isMember) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("club_messages" as any)
        .select("*")
        .eq("club_id", clubId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!mounted) return;
      const rows = ((data as unknown) as ClubMsg[]) || [];
      // Hydrate sender info
      const ids = Array.from(new Set(rows.map(r => r.user_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids)
        : { data: [] };
      const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));
      setMessages(rows.map(r => ({ ...r, display_name: pmap.get(r.user_id)?.display_name, avatar_url: pmap.get(r.user_id)?.avatar_url })));
    })();

    const ch = supabase
      .channel(`club-${clubId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "club_messages", filter: `club_id=eq.${clubId}` },
        async (payload) => {
          const m = payload.new as ClubMsg;
          const { data: p } = await supabase.from("profiles").select("display_name, avatar_url").eq("user_id", m.user_id).maybeSingle();
          setMessages(prev => [...prev, { ...m, display_name: p?.display_name, avatar_url: p?.avatar_url }]);
        })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [clubId, isMember]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMsg = async () => {
    if (!input.trim() || !user || !clubId) return;
    const text = input.trim().slice(0, 1000);
    setInput("");
    await supabase.from("club_messages" as any).insert({ club_id: clubId, user_id: user.id, message: text });
  };

  const joinClub = async () => {
    if (!user || !clubId) return;
    const { error } = await supabase.from("club_members" as any).insert({
      club_id: clubId, user_id: user.id, role: "member",
    });
    if (error) { toast({ title: "Could not join", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Joined club!" });
    location.reload();
  };

  const leaveClub = async () => {
    if (!user || !clubId || !confirm("Leave this club?")) return;
    await supabase.from("club_members" as any).delete().eq("club_id", clubId).eq("user_id", user.id);
    navigate("/clubs");
  };

  const kickMember = async (uid: string) => {
    if (!isOwnerOrAdmin || !confirm("Remove this member?")) return;
    await supabase.from("club_members" as any).delete().eq("club_id", clubId).eq("user_id", uid);
    setMembers(prev => prev.filter(m => m.user_id !== uid));
  };

  const promoteMember = async (uid: string, role: "admin" | "member") => {
    if (myRole !== "owner") return;
    await supabase.from("club_members" as any).update({ role }).eq("club_id", clubId).eq("user_id", uid);
    setMembers(prev => prev.map(m => m.user_id === uid ? { ...m, role } : m));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!club) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <Shield className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Club not found</h1>
          <Button onClick={() => navigate("/clubs")}>Back to Clubs</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <button onClick={() => navigate("/clubs")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> All Clubs
        </button>

        {/* Header */}
        <div className="rounded-2xl border border-border/40 bg-card/80 p-6 mb-6 flex items-center gap-5">
          <div className="text-5xl">{club.icon}</div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground">{club.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{club.description || "No description"}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {members.length} members</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> Avg {avgRating} ELO</span>
            </div>
          </div>
          {!isMember ? (
            <Button onClick={joinClub}>Join Club</Button>
          ) : myRole !== "owner" ? (
            <Button variant="outline" size="sm" onClick={leaveClub}><LogOut className="h-3.5 w-3.5 mr-1.5" /> Leave</Button>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold flex items-center gap-1">
              <Crown className="h-3 w-3" /> Owner
            </span>
          )}
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-sm">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* CHAT */}
          <TabsContent value="chat" className="mt-4">
            <div className="rounded-xl border border-border/40 bg-card/80 flex flex-col h-[60vh]">
              {!isMember ? (
                <div className="flex-1 flex items-center justify-center text-center px-6">
                  <div>
                    <Shield className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Join the club to read and send messages.</p>
                    <Button onClick={joinClub}>Join Club</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && <p className="text-xs text-muted-foreground text-center pt-16">No messages yet. Be the first!</p>}
                    {messages.map(msg => {
                      const mine = msg.user_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                          <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center text-[10px] font-bold text-foreground overflow-hidden flex-shrink-0">
                            {msg.avatar_url ? <img src={msg.avatar_url} className="h-full w-full object-cover" alt="" /> : (msg.display_name || "?")[0]?.toUpperCase()}
                          </div>
                          <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[75%]`}>
                            <span className="text-[10px] text-muted-foreground px-1">{msg.display_name || "Player"}</span>
                            <span className={`inline-block px-3 py-1.5 rounded-2xl text-xs break-words ${
                              mine ? "bg-primary/20 text-primary rounded-br-sm" : "bg-muted/50 text-foreground rounded-bl-sm"
                            }`}>{msg.message}</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-3 border-t border-border/30 flex gap-2 items-center">
                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0"><Smile className="h-4 w-4 text-muted-foreground" /></Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="p-0 border-0 bg-transparent shadow-none w-auto">
                        <EmojiPicker theme={Theme.DARK} emojiStyle={EmojiStyle.NATIVE} width={300} height={350}
                          onEmojiClick={(e) => { setInput(prev => prev + e.emoji); setEmojiOpen(false); }} />
                      </PopoverContent>
                    </Popover>
                    <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Message the club..."
                      className="h-9 text-xs" maxLength={1000}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMsg())} />
                    <Button size="sm" onClick={sendMsg} disabled={!input.trim()} className="h-9 px-3"><Send className="h-3.5 w-3.5" /></Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* LEADERBOARD */}
          <TabsContent value="leaderboard" className="mt-4">
            <div className="rounded-xl border border-border/40 bg-card/80 p-4">
              <div className="space-y-1.5">
                {leaderboard.map((m, i) => (
                  <div key={m.user_id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className={`text-sm font-bold w-6 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </span>
                    <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      {m.avatar_url ? <img src={m.avatar_url} className="h-full w-full object-cover" alt="" /> : (m.display_name || "?")[0]?.toUpperCase()}
                    </div>
                    <Link to={`/profile/${m.user_id}`} className="flex-1 text-sm font-medium text-foreground hover:text-primary truncate">
                      {m.display_name || m.username || "Player"}
                    </Link>
                    <span className="font-mono text-sm text-primary">{m.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* MEMBERS */}
          <TabsContent value="members" className="mt-4">
            <div className="rounded-xl border border-border/40 bg-card/80 p-4">
              <div className="space-y-1.5">
                {members.map(m => (
                  <div key={m.user_id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold overflow-hidden">
                      {m.avatar_url ? <img src={m.avatar_url} className="h-full w-full object-cover" alt="" /> : (m.display_name || "?")[0]?.toUpperCase()}
                    </div>
                    <Link to={`/profile/${m.user_id}`} className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground hover:text-primary truncate">{m.display_name || m.username || "Player"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{m.rating} ELO</p>
                    </Link>
                    {m.role === "owner" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center gap-1"><Crown className="h-2.5 w-2.5" />Owner</span>}
                    {m.role === "admin" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" />Admin</span>}
                    {/* Owner-only controls */}
                    {myRole === "owner" && m.user_id !== user?.id && (
                      <div className="flex items-center gap-1">
                        {m.role === "member" ? (
                          <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => promoteMember(m.user_id, "admin")}>Promote</Button>
                        ) : m.role === "admin" ? (
                          <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => promoteMember(m.user_id, "member")}>Demote</Button>
                        ) : null}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => kickMember(m.user_id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    )}
                    {myRole === "admin" && m.user_id !== user?.id && m.role === "member" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => kickMember(m.user_id)}><Trash2 className="h-3 w-3" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClubDetail;
