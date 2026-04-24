import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Users, Search, Smile, Check, CheckCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/UserAvatar";

interface Friend {
  user_id: string;
  display_name: string | null;
  username: string | null;
  rating: number;
  avatar_url: string | null;
}

interface DM {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [unreadByFriend, setUnreadByFriend] = useState<Record<string, number>>({});
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<DM[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load friend list + unread counts
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fr } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      const ids = (fr || []).map(f => f.user_id === user.id ? f.friend_id : f.user_id);
      if (!ids.length) return;

      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, rating, avatar_url")
        .in("user_id", ids);
      setFriends((profs as Friend[]) || []);

      // Unread counts
      const { data: unread } = await supabase
        .from("direct_messages" as any)
        .select("sender_id")
        .eq("recipient_id", user.id)
        .is("read_at", null);
      const counts: Record<string, number> = {};
      (unread as any[] || []).forEach((m) => {
        counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
      });
      setUnreadByFriend(counts);
    })();
  }, [user]);

  // Load thread when friend selected
  useEffect(() => {
    if (!user || !selectedFriend) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("direct_messages" as any)
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${selectedFriend.user_id}),and(sender_id.eq.${selectedFriend.user_id},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(200);
      if (!mounted) return;
      setMessages(((data as unknown) as DM[]) || []);

      // Mark unread from this friend as read
      await supabase
        .from("direct_messages" as any)
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", selectedFriend.user_id)
        .eq("recipient_id", user.id)
        .is("read_at", null);
      setUnreadByFriend(prev => ({ ...prev, [selectedFriend.user_id]: 0 }));
    })();

    // Realtime subscription for new messages in this thread
    const channel = supabase
      .channel(`dm-${user.id}-${selectedFriend.user_id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const m = payload.new as DM;
          const inThread =
            (m.sender_id === user.id && m.recipient_id === selectedFriend.user_id) ||
            (m.sender_id === selectedFriend.user_id && m.recipient_id === user.id);
          if (inThread) setMessages(prev => [...prev, m]);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user, selectedFriend]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedFriend || !user) return;
    const text = input.trim().slice(0, 2000);
    setInput("");
    const { error } = await supabase.from("direct_messages" as any).insert({
      sender_id: user.id,
      recipient_id: selectedFriend.user_id,
      message: text,
    });
    if (error) console.error(error);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Chat</h1>
          <p className="text-muted-foreground mb-6">Log in to chat with friends.</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </main>
      </div>
    );
  }

  const filtered = friends.filter(f =>
    !searchQuery || (f.display_name || f.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-primary" /> Chat
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 max-w-4xl mx-auto h-[70vh]">
          {/* Friends list */}
          <div className="rounded-xl border border-border/40 bg-card/80 p-3 space-y-2 overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="pl-8 h-9 text-xs"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No friends yet. Add friends to start chatting!</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate("/friends")}>
                  Find Friends
                </Button>
              </div>
            ) : (
              filtered.map(f => {
                const name = f.display_name || f.username || "Player";
                const unread = unreadByFriend[f.user_id] || 0;
                return (
                  <button
                    key={f.user_id}
                    onClick={() => setSelectedFriend(f)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-colors text-left ${
                      selectedFriend?.user_id === f.user_id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold text-foreground overflow-hidden">
                      {f.avatar_url ? <img src={f.avatar_url} alt={name} className="h-full w-full object-cover" /> : name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{f.rating} ELO</p>
                    </div>
                    {unread > 0 && (
                      <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Chat area */}
          <div className="rounded-xl border border-border/40 bg-card/80 flex flex-col">
            {selectedFriend ? (
              <>
                <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                    {selectedFriend.avatar_url
                      ? <img src={selectedFriend.avatar_url} alt="" className="h-full w-full object-cover" />
                      : (selectedFriend.display_name || selectedFriend.username || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedFriend.display_name || selectedFriend.username || "Player"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">{selectedFriend.rating} ELO</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center pt-16">Start the conversation! Say hi 👋</p>
                  )}
                  {messages.map(msg => {
                    const mine = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[80%]`}>
                          <span className={`inline-block px-3 py-1.5 rounded-2xl text-xs break-words ${
                            mine
                              ? "bg-primary/20 text-primary rounded-br-sm"
                              : "bg-muted/50 text-foreground rounded-bl-sm"
                          }`}>
                            {msg.message}
                          </span>
                          <span className="text-[9px] text-muted-foreground mt-0.5 px-1 flex items-center gap-1">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            {mine && (msg.read_at ? <CheckCheck className="h-2.5 w-2.5 text-primary" /> : <Check className="h-2.5 w-2.5" />)}
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
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                        <Smile className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="p-0 border-0 bg-transparent shadow-none w-auto">
                      <EmojiPicker
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.NATIVE}
                        width={300}
                        height={350}
                        onEmojiClick={(e) => {
                          setInput(prev => prev + e.emoji);
                          setEmojiOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="h-9 text-xs"
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    maxLength={2000}
                  />
                  <Button size="sm" onClick={sendMessage} className="h-9 px-3" disabled={!input.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a friend to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
