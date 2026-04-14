import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Volume2, VolumeX, Crown, Flame, Star, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";


interface ChatMsg {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  role: string;
  message: string;
  is_highlighted: boolean;
  created_at: string;
}

const ROLE_BADGES: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  legend: { icon: Crown, color: "text-yellow-400", label: "👑" },
  vip: { icon: Flame, color: "text-orange-400", label: "🔥" },
  supporter: { icon: Star, color: "text-blue-400", label: "⭐" },
  mod: { icon: Shield, color: "text-green-400", label: "🛡️" },
};

export default function StreamChat() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [slowMode, setSlowMode] = useState(true);
  const [lastSent, setLastSent] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [donorTotals, setDonorTotals] = useState<Record<string, number>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load recent messages + donor totals
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("stream_chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as ChatMsg[]);
    };

    const loadDonorTotals = async () => {
      const { data } = await supabase
        .from("stream_donations")
        .select("username, amount");
      if (data) {
        const totals: Record<string, number> = {};
        data.forEach(d => { totals[d.username] = (totals[d.username] || 0) + d.amount; });
        setDonorTotals(totals);
      }
    };

    loadMessages();
    loadDonorTotals();

    // Subscribe to realtime
    const channel = supabase
      .channel("stream-chat")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "stream_chat_messages",
      }, (payload) => {
        const newMsg = payload.new as ChatMsg;
        setMessages(prev => [...prev.slice(-199), newMsg]);
        if (soundEnabled) {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
          } catch {}
        }
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "stream_donations",
      }, (payload) => {
        const d = payload.new as any;
        setDonorTotals(prev => ({
          ...prev,
          [d.username]: (prev[d.username] || 0) + d.amount,
        }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [soundEnabled]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast({ title: "Sign in to chat", variant: "destructive" });
      return;
    }
    if (slowMode && Date.now() - lastSent < 3000) {
      toast({ title: "Slow mode active", description: "Wait 3 seconds between messages.", variant: "destructive" });
      return;
    }

    const msg = {
      user_id: user.id,
      username: profile?.display_name || "Player",
      avatar_url: profile?.avatar_url || null,
      role: "free",
      message: input.trim().slice(0, 200),
      is_highlighted: false,
    };

    setInput("");
    setLastSent(Date.now());

    const { error } = await supabase.from("stream_chat_messages").insert(msg);
    if (error) {
      toast({ title: "Error sending message", variant: "destructive" });
    }
  };

  return (
    <Card className="border-border/40 bg-card/80 backdrop-blur-sm flex flex-col h-[500px] lg:h-full">
      <div className="p-3 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">Live Chat</h3>
          <Badge variant="outline" className="text-[9px]">{messages.length}</Badge>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {messages.map(msg => {
          const badge = ROLE_BADGES[msg.role];
          const userDonorTotal = donorTotals[msg.username] || 0;
          const isDonor = userDonorTotal >= 100; // $1+
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className={`flex items-start gap-1.5 text-[11px] ${
                msg.is_highlighted
                  ? "bg-primary/10 rounded px-1.5 py-1 border border-primary/20"
                  : isDonor
                    ? "bg-yellow-500/5 rounded px-1.5 py-0.5 border border-yellow-500/10"
                    : ""
              }`}
            >
              {badge && <span className="shrink-0">{badge.label}</span>}
              {userDonorTotal > 0 && <DonorRankBadge totalCents={userDonorTotal} size="sm" />}
              <span className={`font-bold shrink-0 ${
                isDonor ? "text-yellow-400" : badge ? badge.color : "text-primary/80"
              }`}>
                {msg.username}:
              </span>
              <span className="text-foreground/70 break-words">{msg.message}</span>
            </motion.div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="p-2.5 border-t border-border/20">
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-1.5">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={user ? (slowMode ? "Slow mode (3s)..." : "Type a message...") : "Sign in to chat"}
            className="h-8 text-xs bg-muted/20 border-border/30"
            maxLength={200}
            disabled={!user}
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!user}>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
