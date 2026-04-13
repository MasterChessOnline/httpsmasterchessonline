import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Radio, Users, MessageCircle, Swords, Send, ExternalLink,
  Crown, Clock, Heart, Flame, ThumbsUp, Sparkles, BarChart3,
  DollarSign, Play, SmilePlus, Volume2, VolumeX
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@DailyChess_12";
const YOUTUBE_CHANNEL_ID = "UCweCc7bSMX5J4jEH7HFImng"; // Placeholder — will be resolved by API

// ─── Chat Message Type ───
interface ChatMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  time: string;
  isSystem?: boolean;
  isDonation?: boolean;
  donationAmount?: number;
}

// ─── Queue Entry ───
interface QueueEntry {
  id: string;
  username: string;
  rating: number;
  timeControl: string;
}

// ─── Poll ───
interface Poll {
  question: string;
  options: { label: string; votes: number }[];
  totalVotes: number;
  active: boolean;
}

// ─── Floating Reaction ───
interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

const QUICK_REACTIONS = ["🔥", "😂", "👏", "❤️", "😮", "💪", "♟️", "👑"];

export default function StreamHub() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "sys1", user: "System", text: "Welcome to DailyChess_12 Live! 🎬", time: "now", isSystem: true },
    { id: "sys2", user: "System", text: "Chat, donate, and join the queue to play!", time: "now", isSystem: true },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [slowMode, setSlowMode] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Queue
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [inQueue, setInQueue] = useState(false);
  const [selectedTimeControl, setSelectedTimeControl] = useState("3+0");

  // Poll
  const [poll, setPoll] = useState<Poll>({
    question: "What opening should we play?",
    options: [
      { label: "Sicilian Defense", votes: 12 },
      { label: "Queen's Gambit", votes: 8 },
      { label: "King's Indian", votes: 5 },
      { label: "Italian Game", votes: 15 },
    ],
    totalVotes: 40,
    active: true,
  });
  const [votedPoll, setVotedPoll] = useState(false);

  // Reactions
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Donation
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Check live status periodically
  useEffect(() => {
    const checkLive = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("youtube-live-check");
        if (data && !error) {
          setIsLive(data.isLive);
          if (data.videoId) setLiveVideoId(data.videoId);
          if (data.viewerCount) setViewerCount(data.viewerCount);
        }
      } catch {
        // Silently fail — edge function may not be deployed yet
      }
    };
    checkLive();
    const interval = setInterval(checkLive, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Send chat message
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to chat.", variant: "destructive" });
      return;
    }
    if (slowMode && Date.now() - lastMessageTime < 5000) {
      toast({ title: "Slow mode", description: "Wait a few seconds between messages.", variant: "destructive" });
      return;
    }
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: profile?.display_name || "Player",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages(prev => [...prev.slice(-200), msg]); // Keep last 200
    setChatInput("");
    setLastMessageTime(Date.now());
  };

  // Join queue
  const joinQueue = () => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    if (inQueue) return;
    const entry: QueueEntry = {
      id: user.id,
      username: profile?.display_name || "Player",
      rating: profile?.rating || 1200,
      timeControl: selectedTimeControl,
    };
    setQueue(prev => [...prev, entry]);
    setInQueue(true);
    setChatMessages(prev => [
      ...prev,
      { id: `q${Date.now()}`, user: "System", text: `⚔️ ${entry.username} joined the queue! (#${queue.length + 1})`, time: "now", isSystem: true },
    ]);
    toast({ title: "Queue joined!", description: `Position #${queue.length + 1}` });
  };

  const leaveQueue = () => {
    if (!user) return;
    setQueue(prev => prev.filter(e => e.id !== user.id));
    setInQueue(false);
  };

  // Vote on poll
  const votePoll = (idx: number) => {
    if (votedPoll || !poll.active) return;
    setPoll(prev => {
      const updated = { ...prev };
      updated.options = prev.options.map((o, i) =>
        i === idx ? { ...o, votes: o.votes + 1 } : o
      );
      updated.totalVotes = prev.totalVotes + 1;
      return updated;
    });
    setVotedPoll(true);
  };

  // Send reaction
  const sendReaction = (emoji: string) => {
    const id = `r${Date.now()}${Math.random()}`;
    const x = 10 + Math.random() * 80;
    setReactions(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  // Donation
  const handleDonate = async () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount < 1) {
      toast({ title: "Invalid amount", description: "Minimum donation is $1.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    // Add donation message to chat
    const donMsg: ChatMessage = {
      id: `don${Date.now()}`,
      user: profile?.display_name || "Player",
      text: donationMessage || "Donated!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isDonation: true,
      donationAmount: amount,
    };
    setChatMessages(prev => [...prev, donMsg]);
    setDonationAmount("");
    setDonationMessage("");

    // Trigger Stripe payment
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { amount: Math.round(amount * 100), item_type: "stream_donation", message: donationMessage },
      });
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast({ title: "Payment error", variant: "destructive" });
    }
  };

  const embedUrl = isLive && liveVideoId
    ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=0`
    : `https://www.youtube.com/embed?listType=user_uploads&list=DailyChess_12`;

  return (
    <div className="min-h-screen bg-background relative">
      <DynamicBackground />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            {isLive && (
              <Badge className="bg-red-500 text-white border-0 text-xs animate-pulse">
                <Radio className="w-3 h-3 mr-1" /> LIVE
              </Badge>
            )}
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              <Play className="w-3 h-3 mr-1" /> Stream Hub
            </Badge>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
            DailyChess<span className="text-gradient-gold">_12</span> Live
          </h1>
          <p className="text-sm text-muted-foreground mb-3">Watch, chat, donate & challenge the streamer</p>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <ExternalLink className="w-4 h-4 mr-2" /> Subscribe on YouTube 🔴
            </Button>
          </a>
        </motion.div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_360px] gap-5">
          {/* Left Column — Video + Queue + Poll */}
          <div className="space-y-4">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden border border-border/40 bg-black relative"
            >
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="DailyChess_12 Stream"
                />
              </div>
              {/* Floating reactions */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <AnimatePresence>
                  {reactions.map(r => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 1, y: "100%", x: `${r.x}%` }}
                      animate={{ opacity: 0, y: "10%" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      className="absolute text-3xl"
                      style={{ left: `${r.x}%` }}
                    >
                      {r.emoji}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {/* Viewer count overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {isLive && (
                  <Badge className="bg-red-600 text-white border-0 text-[10px] font-bold animate-pulse">
                    🔴 LIVE
                  </Badge>
                )}
                <Badge className="bg-black/70 text-white border-0 text-[10px]">
                  <Users className="w-3 h-3 mr-1" /> {viewerCount} viewers
                </Badge>
              </div>
            </motion.div>

            {/* Reactions Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground mr-1">React:</span>
              {QUICK_REACTIONS.map(emoji => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 1.4 }}
                  onClick={() => sendReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>

            {/* Play vs Streamer Queue */}
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">Play vs DailyChess_12</h3>
                    <Badge variant="outline" className="text-[10px]">{queue.length} in queue</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {["1+0", "3+0", "5+0"].map(tc => (
                    <Button
                      key={tc}
                      size="sm"
                      variant={selectedTimeControl === tc ? "default" : "outline"}
                      onClick={() => setSelectedTimeControl(tc)}
                      className="text-xs h-7 px-3"
                    >
                      {tc === "1+0" ? "Bullet" : tc === "3+0" ? "Blitz" : "Rapid"} {tc}
                    </Button>
                  ))}
                </div>
                {inQueue ? (
                  <Button size="sm" variant="outline" onClick={leaveQueue} className="w-full text-xs h-8">
                    Leave Queue (Position #{queue.findIndex(e => e.id === user?.id) + 1})
                  </Button>
                ) : (
                  <Button size="sm" onClick={joinQueue} className="w-full ripple-btn text-xs h-8">
                    <Swords className="w-3 h-3 mr-1" /> Join Queue
                  </Button>
                )}
                {queue.length > 0 && (
                  <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                    {queue.slice(0, 10).map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/10 text-xs"
                      >
                        <span className="font-bold text-primary w-5">#{i + 1}</span>
                        <span className="text-foreground flex-1">{entry.username}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{entry.rating}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{entry.timeControl}</Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Poll */}
            {poll.active && (
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">Live Poll</h3>
                    <Badge variant="outline" className="text-[10px]">{poll.totalVotes} votes</Badge>
                  </div>
                  <p className="text-sm text-foreground mb-3">{poll.question}</p>
                  <div className="space-y-2">
                    {poll.options.map((opt, i) => {
                      const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                      return (
                        <button
                          key={i}
                          onClick={() => votePoll(i)}
                          disabled={votedPoll}
                          className={`w-full text-left rounded-lg px-3 py-2 relative overflow-hidden transition-all ${
                            votedPoll ? "cursor-default" : "hover:bg-primary/5 cursor-pointer"
                          }`}
                        >
                          <div
                            className="absolute inset-0 bg-primary/10 rounded-lg transition-all"
                            style={{ width: `${pct}%` }}
                          />
                          <div className="relative flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{opt.label}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column — Chat + Donate */}
          <div className="flex flex-col gap-4">
            {/* Chat */}
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm flex flex-col h-[500px]">
              <div className="p-3 border-b border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-sm font-bold text-foreground">Live Chat</h3>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {chatMessages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {msg.isSystem ? (
                      <div className="text-center py-0.5">
                        <span className="text-[10px] text-primary/60 italic">{msg.text}</span>
                      </div>
                    ) : msg.isDonation ? (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 my-1">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-bold text-primary">{msg.user}</span>
                          <span className="text-[10px] text-primary/70">donated ${msg.donationAmount}</span>
                        </div>
                        <p className="text-xs text-foreground/80 mt-0.5 ml-5">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 group">
                        <span className="text-[11px] font-bold text-primary/80 shrink-0">{msg.user}:</span>
                        <span className="text-[11px] text-foreground/70 break-words">{msg.text}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-2.5 border-t border-border/20">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-center gap-1.5"
                >
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={slowMode ? "Slow mode (5s)..." : "Type a message..."}
                    className="h-8 text-xs bg-muted/20 border-border/30"
                    maxLength={200}
                  />
                  <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </Card>

            {/* Donation Panel */}
            <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-red-400" />
                  <h3 className="font-display text-sm font-bold text-foreground">Support the Stream</h3>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  {[5, 10, 25, 50].map(amt => (
                    <Button
                      key={amt}
                      size="sm"
                      variant={donationAmount === String(amt) ? "default" : "outline"}
                      onClick={() => setDonationAmount(String(amt))}
                      className="text-xs h-7 flex-1"
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="1"
                  value={donationAmount}
                  onChange={e => setDonationAmount(e.target.value)}
                  placeholder="Custom amount ($)"
                  className="h-8 text-xs bg-muted/20 border-border/30 mb-2"
                />
                <Input
                  value={donationMessage}
                  onChange={e => setDonationMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  className="h-8 text-xs bg-muted/20 border-border/30 mb-3"
                  maxLength={100}
                />
                <Button onClick={handleDonate} className="w-full ripple-btn text-xs h-9">
                  <DollarSign className="w-3.5 h-3.5 mr-1" /> Donate 💰
                </Button>
              </CardContent>
            </Card>

            {/* Subscribe CTA */}
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-red-400 font-semibold mb-1">Support DailyChess_12</p>
                  <p className="text-[10px] text-muted-foreground mb-2">Subscribe for daily chess content</p>
                  <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">
                    Subscribe on YouTube 🔴
                  </Button>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
