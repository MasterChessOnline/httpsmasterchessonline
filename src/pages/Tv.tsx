import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaticBoard from "@/components/chess/StaticBoard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Tv as TvIcon, Users, Clock, RotateCcw, Crown } from "lucide-react";
import DynamicBackground from "@/components/DynamicBackground";
import EmptyLobbyActions from "@/components/EmptyLobbyActions";

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

const ROTATE_SECONDS = 15;

export default function Tv() {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [playerNames, setPlayerNames] = useState<Record<string, PlayerName>>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tick, setTick] = useState(0);

  const fetchGames = async () => {
    const { data } = await supabase
      .from("online_games")
      .select("id, white_player_id, black_player_id, time_control_label, turn, created_at, fen")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setLiveGames(data as LiveGame[]);
      const ids = [...new Set(data.flatMap((g) => [g.white_player_id, g.black_player_id]))];
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, rating")
          .in("user_id", ids);
        if (profiles) {
          const map: Record<string, PlayerName> = {};
          profiles.forEach((p) => { map[p.user_id] = p as PlayerName; });
          setPlayerNames(map);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate every ROTATE_SECONDS
  useEffect(() => {
    if (liveGames.length <= 1) return;
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      setCurrentIndex((idx) => (idx + 1) % liveGames.length);
    }, ROTATE_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [liveGames.length]);

  // Pick highest-rated game initially
  useEffect(() => {
    if (liveGames.length === 0) return;
    const ranked = liveGames.map((g, i) => {
      const wr = playerNames[g.white_player_id]?.rating || 0;
      const br = playerNames[g.black_player_id]?.rating || 0;
      return { i, score: wr + br };
    }).sort((a, b) => b.score - a.score);
    if (ranked.length > 0) setCurrentIndex(ranked[0].i);
  }, [liveGames.length > 0 && Object.keys(playerNames).length > 0]);

  const game = liveGames[currentIndex];
  const white = game ? playerNames[game.white_player_id] : null;
  const black = game ? playerNames[game.black_player_id] : null;
  const totalRating = (white?.rating || 0) + (black?.rating || 0);

  const moveCount = useMemo(() => {
    if (!game?.fen) return 1;
    const parts = game.fen.split(" ");
    return parseInt(parts[5] || "1");
  }, [game?.fen]);

  return (
    <>
      <Helmet>
        <title>MasterChess TV — Watch Live Chess Games</title>
        <meta name="description" content="Watch the highest-rated live chess games on MasterChess TV. Auto-rotating spectating, no account needed." />
        <link rel="canonical" href="https://masterchess.live/tv" />
        <meta property="og:title" content="MasterChess TV — Live Chess Games" />
        <meta property="og:description" content="Spectate top live chess games as they happen." />
        <meta property="og:url" content="https://masterchess.live/tv" />
      </Helmet>

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
              <TvIcon className="w-3 h-3 mr-1" /> Live Channel
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
              MasterChess <span className="text-gradient-gold">TV</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Auto-rotating the strongest live game every {ROTATE_SECONDS}s
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : liveGames.length === 0 ? (
            <EmptyLobbyActions
              title="No live games right now"
              subtitle="Start a match and MasterChess TV will pick it up automatically."
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6 items-start">
                <motion.div
                  key={game.id + tick}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-bold text-green-500">LIVE</span>
                      <Badge variant="outline" className="text-[10px]">{game.time_control_label}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Move {moveCount} · {game.turn === "w" ? "White" : "Black"} to move
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <StaticBoard
                      fen={game.fen}
                      flipped={false}
                      lastMove={null}
                      size="lg"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span>♔</span>
                        <span className="font-medium">{white?.display_name || "White"}</span>
                        <span className="text-xs text-muted-foreground">({white?.rating || "?"})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <div className="flex items-center gap-1.5">
                        <span>♚</span>
                        <span className="font-medium">{black?.display_name || "Black"}</span>
                        <span className="text-xs text-muted-foreground">({black?.rating || "?"})</span>
                      </div>
                    </div>
                    {totalRating > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Crown className="w-3 h-3 mr-1" />
                        {totalRating} combined ELO
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link to={`/game/${game.id}/story`}>
                        <Eye className="w-4 h-4 mr-2" /> Watch with story
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/spectate">
                        <Users className="w-4 h-4 mr-2" /> All live games
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTick((t) => t + 1);
                        setCurrentIndex((idx) => (idx + 1) % liveGames.length);
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Next game
                    </Button>
                  </div>
                </motion.div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-2">Live Games</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {liveGames.length} game{liveGames.length !== 1 ? "s" : ""} currently live
                    </p>
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {liveGames.map((g, i) => {
                        const wp = playerNames[g.white_player_id];
                        const bp = playerNames[g.black_player_id];
                        const score = (wp?.rating || 0) + (bp?.rating || 0);
                        const active = i === currentIndex;
                        return (
                          <button
                            key={g.id}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-full text-left rounded-lg border p-3 transition-all ${
                              active
                                ? "border-primary/50 bg-primary/10"
                                : "border-border/40 bg-card/40 hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-medium truncate">
                                {wp?.display_name || "White"} ({wp?.rating || "?"}) vs{" "}
                                {bp?.display_name || "Black"} ({bp?.rating || "?"})
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                                {g.time_control_label}
                              </Badge>
                            </div>
                            {score > 0 && (
                              <div className="text-[10px] text-muted-foreground mt-1">
                                Combined ELO: {score}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      Channel refreshes every 5s · Rotates every {ROTATE_SECONDS}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
