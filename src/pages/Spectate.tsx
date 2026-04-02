import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, Users, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DynamicBackground from "@/components/DynamicBackground";

interface LiveGame {
  id: string;
  white_player_id: string;
  black_player_id: string;
  time_control_label: string;
  turn: string;
  created_at: string;
  fen: string;
}

interface PlayerName {
  user_id: string;
  display_name: string | null;
  rating: number;
}

const Spectate = () => {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [playerNames, setPlayerNames] = useState<Record<string, PlayerName>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from("online_games")
        .select("id, white_player_id, black_player_id, time_control_label, turn, created_at, fen")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setLiveGames(data as LiveGame[]);
        // Fetch player names
        const ids = [...new Set(data.flatMap(g => [g.white_player_id, g.black_player_id]))];
        if (ids.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name, rating")
            .in("user_id", ids);
          if (profiles) {
            const map: Record<string, PlayerName> = {};
            profiles.forEach(p => { map[p.user_id] = p as PlayerName; });
            setPlayerNames(map);
          }
        }
      }
      setLoading(false);
    };

    fetchGames();
    const interval = setInterval(fetchGames, 10000);
    return () => clearInterval(interval);
  }, []);

  const getMoveCount = (fen: string) => {
    const parts = fen.split(" ");
    return parseInt(parts[5] || "1");
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
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">
            <Eye className="w-3 h-3 mr-1" /> Live Games
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
            Watch <span className="text-gradient-gold">Live Games</span>
          </h1>
          <p className="text-sm text-muted-foreground">Spectate ongoing matches in real-time</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : liveGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No live games right now</p>
            <p className="text-xs text-muted-foreground mb-6">Games will appear here when players are competing</p>
            <Link to="/play/online">
              <Button>Start a Game</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {liveGames.map((game, i) => {
              const white = playerNames[game.white_player_id];
              const black = playerNames[game.black_player_id];
              const moveNum = getMoveCount(game.fen);

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-muted-foreground">LIVE</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {game.time_control_label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">♔</span>
                          <span className="text-sm font-medium text-foreground truncate">
                            {white?.display_name || "Player"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({white?.rating || "?"})
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">♚</span>
                          <span className="text-sm font-medium text-foreground truncate">
                            {black?.display_name || "Player"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({black?.rating || "?"})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Move {moveNum}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {game.turn === "w" ? "White" : "Black"} to move
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Spectate;
