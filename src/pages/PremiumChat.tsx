import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Send, Lock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null; rating: number } | null;
}

const PremiumChat = () => {
  const { user, isPremium, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [profilesMap, setProfilesMap] = useState<Record<string, { display_name: string | null; rating: number }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user]);

  // Fetch messages
  useEffect(() => {
    if (!isPremium) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("premium_chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (data) {
        setMessages(data);
        // Fetch profiles for unique user_ids
        const userIds = [...new Set(data.map((m) => m.user_id))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name, rating")
            .in("user_id", userIds);
          if (profiles) {
            const map: Record<string, { display_name: string | null; rating: number }> = {};
            profiles.forEach((p) => { map[p.user_id] = p; });
            setProfilesMap(map);
          }
        }
      }
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel("premium-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "premium_chat_messages" }, async (payload) => {
        const msg = payload.new as ChatMessage;
        setMessages((prev) => [...prev, msg]);
        // Fetch profile if unknown
        if (!profilesMap[msg.user_id]) {
          const { data } = await supabase.from("profiles").select("user_id, display_name, rating").eq("user_id", msg.user_id).single();
          if (data) setProfilesMap((prev) => ({ ...prev, [data.user_id]: data }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isPremium]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);
    await supabase.from("premium_chat_messages").insert({ user_id: user.id, message: newMessage.trim() });
    setNewMessage("");
    setSending(false);
  };

  if (loading) return <div className="min-h-screen bg-background" />;

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-16 max-w-2xl text-center">
          <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Premium Strategy Lounge
          </h1>
          <p className="text-muted-foreground mb-8">
            This exclusive chat room is available to Premium members. Discuss strategies, share analysis, and connect with top players.
          </p>
          <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">
            <Crown className="w-4 h-4 mr-2" /> Upgrade to Premium
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-4 max-w-3xl flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Crown className="w-3 h-3 mr-1" /> Premium
          </Badge>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Strategy Lounge
          </h1>
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{messages.length} messages</span>
        </div>

        <div className="flex-1 bg-card border border-border rounded-lg p-4 overflow-y-auto max-h-[60vh] space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No messages yet. Start the conversation!</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            const profile = profilesMap[msg.user_id];
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMe ? "bg-primary/20 border border-primary/30" : "bg-muted"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {profile?.display_name || "Player"}
                    </span>
                    {profile && (
                      <span className="text-[10px] text-muted-foreground">({profile.rating})</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90">{msg.message}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 mt-3 mb-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PremiumChat;
