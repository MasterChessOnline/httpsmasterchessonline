import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio, Users, ExternalLink, Play,
  Volume2, VolumeX, BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StreamChat from "@/components/stream/StreamChat";
import StreamQueue from "@/components/stream/StreamQueue";

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

  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [recentVideos, setRecentVideos] = useState<{ id: string; title: string; thumbnail: string; publishedAt: string }[]>([]);

  // Reactions
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Send reaction
  const sendReaction = (emoji: string) => {
    const id = `r${Date.now()}${Math.random()}`;
    const x = 10 + Math.random() * 80;
    setReactions(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
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

      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            {isLive && (
              <Badge className="bg-red-500 text-white border-0 text-xs animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6),0_0_30px_rgba(239,68,68,0.3)]">
                <Radio className="w-3 h-3 mr-1" /> LIVE NOW
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
            Watch live streams & videos — chat with the community
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
                  <Badge className="bg-red-600 text-white border-0 text-[10px] font-bold animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]">
                    🔴 LIVE NOW
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

            {/* Tabs: Queue / Poll */}
            <Tabs defaultValue="queue" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-muted/20">
                <TabsTrigger value="queue" className="text-xs">⚔️ Queue</TabsTrigger>
                <TabsTrigger value="poll" className="text-xs">📊 Poll</TabsTrigger>
              </TabsList>

              <TabsContent value="queue">
                <StreamQueue />
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
            </Tabs>
          </div>

          {/* Right: Chat */}
          <div className="flex flex-col lg:min-h-[700px]">
            <StreamChat />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
