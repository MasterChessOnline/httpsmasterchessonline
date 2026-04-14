import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio, Users, ExternalLink, DollarSign, Play, Heart,
  Volume2, VolumeX, Crown, BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StreamChat from "@/components/stream/StreamChat";
import StreamQueue from "@/components/stream/StreamQueue";
import SubscriptionTiers from "@/components/stream/SubscriptionTiers";
import DonationAlert from "@/components/stream/DonationAlert";
import type { DonationAlertData } from "@/components/stream/DonationAlert";
import DonationGoalBar from "@/components/stream/DonationGoalBar";
import RecentDonationsFeed from "@/components/stream/RecentDonationsFeed";
import SponsorAMove from "@/components/stream/SponsorAMove";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@DailyChess_12";
const YOUTUBE_CHANNEL_ID = "UC8W92XBMdu20Z0tKBbwsaWA";

const QUICK_REACTIONS = ["🔥", "😂", "👏", "❤️", "😮", "💪", "♟️", "👑"];

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

interface PollOption {
  label: string;
  votes: number;
}

export default function StreamHub() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [recentVideos, setRecentVideos] = useState<{ id: string; title: string; thumbnail: string; publishedAt: string }[]>([]);

  // Reactions
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Donation
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  // Alerts
  const [alertQueue, setAlertQueue] = useState<DonationAlertData[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Poll
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { label: "Sicilian Defense", votes: 12 },
    { label: "Queen's Gambit", votes: 8 },
    { label: "King's Indian", votes: 5 },
    { label: "Italian Game", votes: 15 },
  ]);
  const [votedPoll, setVotedPoll] = useState(false);
  const totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0);

  // Check live status
  useEffect(() => {
    const checkLive = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("youtube-live-check");
        if (data && !error) {
          setIsLive(data.isLive);
          if (data.videoId) setLiveVideoId(data.videoId);
          if (data.viewerCount) setViewerCount(data.viewerCount);
          if (data.recentVideos) setRecentVideos(data.recentVideos);
        }
      } catch {}
    };
    checkLive();
    const interval = setInterval(checkLive, 45000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to donation alerts via realtime
  useEffect(() => {
    const channel = supabase
      .channel("stream-donations-alerts")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "stream_donations",
      }, (payload) => {
        const d = payload.new as any;
        setAlertQueue(prev => [...prev, {
          id: d.id,
          username: d.username,
          amount: d.amount,
          message: d.message,
          type: "donation",
        }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAlertShown = useCallback((id: string) => {
    setAlertQueue(prev => prev.filter(a => a.id !== id));
  }, []);

  // Send reaction
  const sendReaction = (emoji: string) => {
    const id = `r${Date.now()}${Math.random()}`;
    const x = 10 + Math.random() * 80;
    setReactions(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

  // Donation
  const handleDonate = async () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount < 0.5) {
      toast({ title: "Minimum donation is $0.50", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: Math.round(amount * 100),
          item_type: "stream_donation",
          message: donationMessage,
        },
      });
      if (data?.url) {
        window.open(data.url, "_blank");
      } else if (error) {
        toast({ title: "Payment error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Payment error", variant: "destructive" });
    }
  };

  // Vote
  const votePoll = (idx: number) => {
    if (votedPoll) return;
    setPollOptions(prev => prev.map((o, i) => i === idx ? { ...o, votes: o.votes + 1 } : o));
    setVotedPoll(true);
  };

  const latestVideoId = recentVideos.length > 0 ? recentVideos[0].id : null;
  const embedUrl = isLive && liveVideoId
    ? `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=0`
    : latestVideoId
      ? `https://www.youtube.com/embed/${latestVideoId}`
      : null;

  return (
    <div className="min-h-screen bg-background relative">
      <DynamicBackground />
      <Navbar />

      {/* Donation Alert Overlay */}
      <DonationAlert
        alerts={alertQueue}
        onAlertShown={handleAlertShown}
        soundEnabled={soundEnabled}
        ttsEnabled={ttsEnabled}
      />

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
          <p className="text-sm text-muted-foreground mb-3">
            My live streams & videos — watch, chat & support
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Subscribe on YouTube 🔴
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-xs text-muted-foreground"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 mr-1" /> : <VolumeX className="w-3.5 h-3.5 mr-1" />}
              Sound
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="text-xs text-muted-foreground"
            >
              TTS {ttsEnabled ? "ON" : "OFF"}
            </Button>
          </div>
        </motion.div>

        {/* Main 2-column layout */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-5">
          {/* Left: Video + Below */}
          <div className="space-y-4">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden border border-border/40 bg-black relative"
            >
              <div className="aspect-video">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="DailyChess_12 Stream"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20">
                    <Radio className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">Stream is offline</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Check back when DailyChess_12 goes live</p>
                  </div>
                )}
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
              {/* Overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {isLive && (
                  <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px] font-bold animate-pulse">
                    🔴 LIVE
                  </Badge>
                )}
                {isLive && (
                  <Badge className="bg-black/70 text-white border-0 text-[10px]">
                    <Users className="w-3 h-3 mr-1" /> {viewerCount} viewers
                  </Badge>
                )}
                {!isLive && embedUrl && (
                  <Badge className="bg-muted/80 text-muted-foreground border-0 text-[10px]">
                    📺 Latest Upload
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* My Videos Grid */}
            {recentVideos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">📹 My Videos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recentVideos.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setLiveVideoId(null)}
                      className="group relative rounded-lg overflow-hidden border border-border/30 hover:border-primary/40 transition-colors"
                    >
                      <a href={`https://www.youtube.com/embed/${v.id}`} onClick={(e) => {
                        e.preventDefault();
                        // Update embed to this video
                        setRecentVideos(prev => {
                          const clicked = prev.find(rv => rv.id === v.id);
                          if (!clicked) return prev;
                          return [clicked, ...prev.filter(rv => rv.id !== v.id)];
                        });
                      }}>
                        <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-[10px] text-muted-foreground p-1.5 line-clamp-2 leading-tight">{v.title}</p>
                      </a>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions bar */}
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

            {/* Tabs: Queue / Poll / Subscribe */}
            <Tabs defaultValue="queue" className="w-full">
              <TabsList className="w-full grid grid-cols-4 bg-muted/20">
                <TabsTrigger value="queue" className="text-xs">⚔️ Queue</TabsTrigger>
                <TabsTrigger value="sponsor" className="text-xs">♟️ Sponsor</TabsTrigger>
                <TabsTrigger value="poll" className="text-xs">📊 Poll</TabsTrigger>
                <TabsTrigger value="subscribe" className="text-xs">👑 Sub</TabsTrigger>
              </TabsList>

              <TabsContent value="queue">
                <StreamQueue />
              </TabsContent>

              <TabsContent value="sponsor">
                <SponsorAMove />
              </TabsContent>

              <TabsContent value="poll">
                <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <h3 className="font-display text-sm font-bold text-foreground">Live Poll</h3>
                      <Badge variant="outline" className="text-[10px]">{totalVotes} votes</Badge>
                    </div>
                    <p className="text-sm text-foreground mb-3">What opening should we play?</p>
                    <div className="space-y-2">
                      {pollOptions.map((opt, i) => {
                        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        return (
                          <button
                            key={i}
                            onClick={() => votePoll(i)}
                            disabled={votedPoll}
                            className={`w-full text-left rounded-lg px-3 py-2 relative overflow-hidden transition-all ${
                              votedPoll ? "cursor-default" : "hover:bg-primary/5 cursor-pointer"
                            }`}
                          >
                            <div className="absolute inset-0 bg-primary/10 rounded-lg" style={{ width: `${pct}%` }} />
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
              </TabsContent>

              <TabsContent value="subscribe">
                <SubscriptionTiers />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Chat + Donate */}
          <div className="flex flex-col gap-4 lg:min-h-[700px]">
            <div className="flex-1">
              <StreamChat />
            </div>

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
                  placeholder="Add a message (optional, max 120 chars)"
                  className="h-8 text-xs bg-muted/20 border-border/30 mb-3"
                  maxLength={120}
                />
                <Button onClick={handleDonate} className="w-full text-xs h-9">
                  <DollarSign className="w-3.5 h-3.5 mr-1" /> Donate 💰
                </Button>
                {ttsEnabled && (
                  <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
                    🔊 Donations $2+ will be read aloud via TTS
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
