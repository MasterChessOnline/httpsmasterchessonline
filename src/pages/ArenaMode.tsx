import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Flame, Swords, Crown, Zap, Users, ArrowRight, Timer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ArenaConfig {
  id: string;
  title: string;
  duration: number; // minutes
  timeControl: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
}

const ARENA_CONFIGS: ArenaConfig[] = [
  {
    id: "blitz-10",
    title: "Blitz Arena",
    duration: 10,
    timeControl: "3+0",
    icon: Zap,
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-amber-600/5",
    description: "10 minutes of non-stop blitz. Play as many games as you can!",
  },
  {
    id: "rapid-30",
    title: "Rapid Arena",
    duration: 30,
    timeControl: "5+3",
    icon: Clock,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-cyan-600/5",
    description: "30 minutes of rapid chess. Strategy meets speed.",
  },
  {
    id: "bullet-5",
    title: "Bullet Frenzy",
    duration: 5,
    timeControl: "1+0",
    icon: Flame,
    color: "text-red-400",
    gradient: "from-red-500/20 to-rose-600/5",
    description: "5 minutes of pure bullet chaos. Only the fastest survive.",
  },
  {
    id: "marathon-60",
    title: "Marathon",
    duration: 60,
    timeControl: "5+3",
    icon: Trophy,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-violet-600/5",
    description: "60-minute endurance arena. The ultimate test of consistency.",
  },
];

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  games: number;
  streak: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "GrandMaster42", score: 24, games: 8, streak: 5 },
  { rank: 2, username: "BlitzKing", score: 21, games: 9, streak: 3 },
  { rank: 3, username: "TacticsPro", score: 18, games: 7, streak: 4 },
  { rank: 4, username: "ChessNinja", score: 15, games: 6, streak: 2 },
  { rank: 5, username: "PawnStorm", score: 12, games: 5, streak: 1 },
];

export default function ArenaMode() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeArena, setActiveArena] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [arenaRunning, setArenaRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  // Arena timer
  useEffect(() => {
    if (!arenaRunning || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setArenaRunning(false);
          toast({ title: "Arena Complete! 🏆", description: `Final score: ${score} points in ${gamesPlayed} games.` });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [arenaRunning, timeRemaining, score, gamesPlayed]);

  const startArena = (config: ArenaConfig) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to join an arena.", variant: "destructive" });
      return;
    }
    setActiveArena(config.id);
    setTimeRemaining(config.duration * 60);
    setArenaRunning(true);
    setScore(0);
    setGamesPlayed(0);
    toast({ title: `${config.title} Started!`, description: `You have ${config.duration} minutes. Go!` });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const selectedConfig = ARENA_CONFIGS.find(c => c.id === activeArena);

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
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">
            <Trophy className="w-3 h-3 mr-1" /> Arena Mode
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
            Arena <span className="text-gradient-gold">Tournaments</span>
          </h1>
          <p className="text-sm text-muted-foreground">Play as many games as possible in the time limit. Most points wins!</p>
        </motion.div>

        {/* Active Arena Banner */}
        {arenaRunning && selectedConfig && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <Card className="border-primary/30 bg-primary/5 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <selectedConfig.icon className={`w-5 h-5 ${selectedConfig.color}`} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">{selectedConfig.title}</h3>
                      <p className="text-xs text-muted-foreground">{selectedConfig.timeControl} • Arena in progress</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-primary">{formatTime(timeRemaining)}</div>
                    <p className="text-[10px] text-muted-foreground">remaining</p>
                  </div>
                </div>
                <Progress value={((selectedConfig.duration * 60 - timeRemaining) / (selectedConfig.duration * 60)) * 100} className="h-2 mb-3" />
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">{score}</span>
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">{gamesPlayed}</span>
                    <span className="text-xs text-muted-foreground">games</span>
                  </div>
                  <div className="ml-auto">
                    <Link to="/play/online">
                      <Button size="sm" className="ripple-btn">
                        <Swords className="w-3 h-3 mr-1" /> Play Next Game
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Arena Selection */}
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4 mb-10">
          {ARENA_CONFIGS.map((config, i) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className={`border-border/40 hover:border-primary/20 transition-all duration-300 overflow-hidden group cursor-pointer ${activeArena === config.id && arenaRunning ? "ring-2 ring-primary/30" : ""}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
                <CardContent className="relative p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-background/50 border border-border/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-base font-bold text-foreground">{config.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{config.timeControl}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          <Timer className="w-3 h-3 mr-0.5" />{config.duration}min
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{config.description}</p>
                  <Button
                    onClick={() => startArena(config)}
                    disabled={arenaRunning}
                    className="w-full ripple-btn"
                    size="sm"
                  >
                    {arenaRunning && activeArena === config.id ? "In Progress..." : "Enter Arena"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Arena Leaderboard</h2>
          </div>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-0">
              {MOCK_LEADERBOARD.map((entry, i) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-4 py-3 ${i < MOCK_LEADERBOARD.length - 1 ? "border-b border-border/20" : ""}`}
                >
                  <span className={`w-7 text-center font-mono font-bold text-sm ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${entry.rank}`}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-1">{entry.username}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{entry.games}G</span>
                    {entry.streak >= 3 && (
                      <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
                        🔥{entry.streak}
                      </Badge>
                    )}
                    <span className="font-bold text-primary">{entry.score}pts</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
