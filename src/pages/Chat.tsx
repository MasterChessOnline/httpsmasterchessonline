import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Users, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  display_name: string | null;
  rating: number;
}

interface Message {
  id: string;
  from: string;
  message: string;
  time: string;
}

const Chat = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchFriends = async () => {
      const { data } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (!data) return;

      const friendIds = data.map(f => f.user_id === user.id ? f.friend_id : f.user_id);
      if (friendIds.length === 0) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, rating")
        .in("user_id", friendIds);

      if (profiles) {
        setFriends(profiles.map(p => ({
          id: p.user_id,
          user_id: p.user_id,
          friend_id: p.user_id,
          display_name: p.display_name,
          rating: p.rating,
        })));
      }
    };
    fetchFriends();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !selectedFriend || !user) return;
    setMessages(prev => [...prev, {
      id: `${Date.now()}`,
      from: user.id,
      message: input.trim(),
      time: new Date().toISOString(),
    }]);
    setInput("");
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
    !searchQuery || f.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-primary" /> Chat
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 max-w-4xl mx-auto h-[60vh]">
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
              filtered.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFriend(f)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-colors text-left ${
                    selectedFriend?.id === f.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold text-foreground">
                    {(f.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{f.display_name || "Player"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{f.rating} ELO</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat area */}
          <div className="rounded-xl border border-border/40 bg-card/80 flex flex-col">
            {selectedFriend ? (
              <>
                <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {(selectedFriend.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedFriend.display_name || "Player"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{selectedFriend.rating} ELO</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center pt-16">Start the conversation! Say hi 👋</p>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === user.id ? "justify-end" : "justify-start"}`}>
                      <span className={`inline-block px-3 py-1.5 rounded-2xl text-xs max-w-[80%] ${
                        msg.from === user.id
                          ? "bg-primary/20 text-primary rounded-br-sm"
                          : "bg-muted/50 text-foreground rounded-bl-sm"
                      }`}>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-border/30 flex gap-2">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="h-9 text-xs"
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                  />
                  <Button size="sm" onClick={sendMessage} className="h-9 px-3">
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
