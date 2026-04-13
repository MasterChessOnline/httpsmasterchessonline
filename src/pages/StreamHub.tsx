import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Radio, Users, MessageCircle, Swords, Send, Play, ExternalLink, Crown, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

interface QueueEntry {
  id: string;
  username: string;
  rating: number;
  joinedAt: string;
}

const FEATURED_STREAM = {
  channelId: "UCweCc7bSMX5J4jEH7HFImng", // Placeholder — user can customize
  title: "MasterChess Live",
  description: "Watch top players compete live and join the viewer queue to challenge the streamer!",
};

export default function StreamHub() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", user: "System", text: "Welcome to MasterChess Live! 🎬", time: "now", isSystem: true },
    { id: "2", user: "System", text: "Join the queue to play vs the streamer.", time: "now", isSystem: true },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [inQueue, setInQueue] = useState(false);
  const [viewerCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to chat.", variant: "destructive" });
      return;
    }
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: profile?.display_name || "Player",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput("");
  };

  const joinQueue = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to join the queue.", variant: "destructive" });
      return;
    }
    if (inQueue) return;
    const entry: QueueEntry = {
      id: user.id,
      username: profile?.display_name || "Player",
      rating: profile?.rating || 1200,
      joinedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setQueue(prev => [...prev, entry]);
    setInQueue(true);
    setChatMessages(prev => [
      ...prev,
      { id: Date.now().toString(), user: "System", text: `${entry.username} joined the queue! Position #${queue.length + 1}`, time: "now", isSystem: true },
    ]);
    toast({ title: "Queue joined!", description: `You are #${queue.length + 1} in line.` });
  };

  const leaveQueue = () => {
    if (!user) return;
    setQueue(prev => prev.filter(e => e.id !== user.id));
    setInQueue(false);
    toast({ title: "Left queue" });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <DynamicBackground />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs mb-3">
            <Radio className="w-3 h-3 mr-1 animate-pulse" /> Live Stream
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
            Stream <span className="text-gradient-gold">Hub</span>
          </h1>
          <p className="text-sm text-muted-foreground">Watch, chat, and challenge the streamer</p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_340px] gap-5">
          {/* Video + Queue */}
          <div className="space-y-4">
            {/* YouTube Embed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm"
            >
              <div className="aspect-video bg-black/90 flex items-center justify-center relative">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">No stream is live right now</p>
                    <p className="text-xs text-muted-foreground mt-1">Check back later or browse replays</p>
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge className="bg-black/60 text-white border-0 text-[10px]">
                    <Users className="w-3 h-3 mr-1" /> {viewerCount} viewers
                  </Badge>
                </div>
              </div>
              <div className="p-4 border-t border-border/20">
                <h2 className="font-display text-lg font-bold text-foreground">{FEATURED_STREAM.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">{FEATURED_STREAM.description}</p>
              </div>
            </motion.div>

            {/* Viewer Queue */}
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">Viewer Queue</h3>
                    <Badge variant="outline" className="text-[10px]">{queue.length} waiting</Badge>
                  </div>
                  {inQueue ? (
                    <Button size="sm" variant="outline" onClick={leaveQueue} className="text-xs h-8">Leave Queue</Button>
                  ) : (
                    <Button size="sm" onClick={joinQueue} className="text-xs h-8 ripple-btn">
                      <Swords className="w-3 h-3 mr-1" /> Join Queue
                    </Button>
                  )}
                </div>
                {queue.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No one in queue. Be the first!</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {queue.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20"
                      >
                        <span className="text-xs font-bold text-primary w-5">#{i + 1}</span>
                        <span className="text-sm text-foreground flex-1">{entry.username}</span>
                        <Badge variant="outline" className="text-[10px]">{entry.rating}</Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm flex flex-col h-[600px] lg:h-auto">
            <div className="p-3 border-b border-border/20 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Live Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={msg.isSystem ? "text-center" : ""}
                >
                  {msg.isSystem ? (
                    <span className="text-[10px] text-primary/70 italic">{msg.text}</span>
                  ) : (
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs font-bold text-primary shrink-0">{msg.user}:</span>
                      <span className="text-xs text-foreground/80 break-words">{msg.text}</span>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border/20">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="h-9 text-xs bg-muted/20 border-border/30"
                  maxLength={200}
                />
                <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
