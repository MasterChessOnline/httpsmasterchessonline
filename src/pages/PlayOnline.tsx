import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RotateCcw, Wifi, Flag, Timer, Loader2, Send, Users, Eye, Swords, Trophy, TrendingUp, User } from "lucide-react";
import ChessClock, { TIME_CONTROLS } from "@/components/ChessClock";
import { useOnlineGame } from "@/hooks/use-online-game";
import { playChessSound } from "@/lib/chess-sounds";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♚", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wq: { symbol: "♛", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wr: { symbol: "♜", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wb: { symbol: "♝", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wn: { symbol: "♞", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wp: { symbol: "♟", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  bk: { symbol: "♚", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bq: { symbol: "♛", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  br: { symbol: "♜", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bb: { symbol: "♝", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bn: { symbol: "♞", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bp: { symbol: "♟", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
};

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

const SKILL_TIERS = [
  { key: "all", label: "Any", ratingRange: [0, 9999] },
  { key: "beginner", label: "Beginner", ratingRange: [0, 999] },
  { key: "intermediate", label: "Intermediate", ratingRange: [1000, 1499] },
  { key: "advanced", label: "Advanced", ratingRange: [1500, 9999] },
] as const;

interface LiveGame {
  id: string;
  white_player_id: string;
  black_player_id: string;
  time_control_label: string;
  fen: string;
  turn: string;
}

interface LeaderEntry {
  user_id: string;
  display_name: string | null;
  rating: number;
  games_won: number;
  games_played: number;
}

const PlayOnline = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    status: onlineStatus, game: onlineGame, myColor, error: onlineError,
    searchMatch, cancelSearch, makeMove, endGame, resign, reset: resetOnline,
  } = useOnlineGame();

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [timeoutWinner, setTimeoutWinner] = useState<string | null>(null);
  const [timeControlIdx, setTimeControlIdx] = useState(4);
  const [skillTier, setSkillTier] = useState("all");
  const gameRef = useRef(new Chess());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [opponentProfile, setOpponentProfile] = useState<{ display_name: string | null; rating: number; avatar_url: string | null } | null>(null);

  // Live stats
  const [activePlayers, setActivePlayers] = useState(0);
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [topPlayers, setTopPlayers] = useState<LeaderEntry[]>([]);

  const tc = TIME_CONTROLS[timeControlIdx];
  const unlimited = tc.seconds === 0;
  const [whiteTime, setWhiteTime] = useState(tc.seconds);
  const [blackTime, setBlackTime] = useState(tc.seconds);
  const [gameStarted, setGameStarted] = useState(false);

  const opponentId = onlineGame
    ? myColor === "w" ? onlineGame.black_player_id : onlineGame.white_player_id
    : null;

  useEffect(() => {
    if (!opponentId) return;
    supabase.from("profiles").select("display_name, rating, avatar_url").eq("user_id", opponentId).single().then(({ data }) => {
      if (data) setOpponentProfile(data);
    });
  }, [opponentId]);

  // Fetch live stats (active players, live games, leaderboard)
  useEffect(() => {
    if (onlineStatus !== "idle") return;

    const fetchStats = async () => {
      // Count active games
      const { data: games } = await supabase
        .from("online_games")
        .select("id, white_player_id, black_player_id, time_control_label, fen, turn")
        .eq("status", "active")
        .limit(20);
      
      if (games) {
        setLiveGames(games as LiveGame[]);
        const playerIds = new Set<string>();
        games.forEach(g => { playerIds.add(g.white_player_id); playerIds.add(g.black_player_id); });
        setActivePlayers(playerIds.size);
      }

      // Top 10 leaderboard
      const { data: leaders } = await supabase
        .from("profiles")
        .select("user_id, display_name, rating, games_won, games_played")
        .order("rating", { ascending: false })
        .limit(10);
      if (leaders) setTopPlayers(leaders as LeaderEntry[]);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [onlineStatus]);

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!timeoutWinner || onlineStatus === "finished";

  // Subscribe to chat
  useEffect(() => {
    if (!onlineGame || onlineStatus !== "playing") return;
    
    // Load existing messages
    supabase.from("game_messages").select("*").eq("game_id", onlineGame.id)
      .order("created_at", { ascending: true }).then(({ data }) => {
        if (data) setChatMessages(data as ChatMessage[]);
      });

    const channel = supabase.channel(`chat-${onlineGame.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "game_messages",
        filter: `game_id=eq.${onlineGame.id}`,
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [onlineGame?.id, onlineStatus]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const sendChat = async () => {
    if (!chatInput.trim() || !onlineGame || !user) return;
    await supabase.from("game_messages").insert({
      game_id: onlineGame.id, user_id: user.id, message: chatInput.trim(),
    });
    setChatInput("");
  };

  // Sync board when online game updates
  useEffect(() => {
    if (!onlineGame || onlineStatus !== "playing") return;
    if (onlineGame.fen !== game.fen()) {
      const prevFen = game.fen();
      gameRef.current = new Chess(onlineGame.fen);
      setSelectedSquare(null);
      setLegalMoves([]);
      setGameStarted(true);
      if (onlineGame.pgn) setMoveHistory(onlineGame.pgn.split(" ").filter(Boolean));
      // Play sound for opponent's move (when FEN changed and it's now our turn)
      if (prevFen !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" && gameRef.current.turn() === myColor) {
        const g = gameRef.current;
        if (g.isCheckmate() || g.isDraw() || g.isStalemate()) {
          playChessSound("gameOver");
        } else if (g.isCheck()) {
          playChessSound("check");
        } else {
          // Check last move for capture by looking at SAN
          const moves = onlineGame.pgn?.split(" ").filter(Boolean) || [];
          const lastSan = moves[moves.length - 1] || "";
          playChessSound(lastSan.includes("x") ? "capture" : "move");
        }
      }
    }
    setWhiteTime(onlineGame.white_time);
    setBlackTime(onlineGame.black_time);
  }, [onlineGame]);

  useEffect(() => {
    if (onlineGame && onlineStatus === "playing") {
      setWhiteTime(onlineGame.white_time);
      setBlackTime(onlineGame.black_time);
      gameRef.current = new Chess(onlineGame.fen);
      if (onlineGame.pgn) setMoveHistory(onlineGame.pgn.split(" ").filter(Boolean));
      setGameStarted(true);
      playChessSound("start");
    }
  }, [onlineStatus]);

  const boardFlipped = myColor === "b";
  const displayFiles = boardFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = boardFlipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();
  const lastMove = onlineGame?.last_move_from && onlineGame?.last_move_to
    ? { from: onlineGame.last_move_from, to: onlineGame.last_move_to } : null;

  const handleTimeOut = useCallback((color: "w" | "b") => {
    const result = color === "w" ? "0-1" : "1-0";
    setTimeoutWinner(color === "w" ? "Black" : "White");
    playChessSound("gameOver");
    if (onlineGame) endGame(result);
  }, [onlineGame, endGame]);

  const handleSquareClick = (square: Square) => {
    if (isGameOver || onlineStatus !== "playing" || game.turn() !== myColor) return;

    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setMoveHistory(prev => [...prev, move.san]);
        setGameStarted(true);
        let wt = whiteTime, bt = blackTime;
        if (!unlimited && onlineGame && onlineGame.increment > 0) {
          if (move.color === "w") { wt += onlineGame.increment; setWhiteTime(wt); }
          else { bt += onlineGame.increment; setBlackTime(bt); }
        }
        makeMove(game.fen(), move.san, move.from, move.to, game.turn(), wt, bt);
        // Sound effects
        if (game.isCheckmate() || game.isDraw() || game.isStalemate()) {
          playChessSound("gameOver");
        } else if (game.isCheck()) {
          playChessSound("check");
        } else if (move.captured) {
          playChessSound("capture");
        } else {
          playChessSound("move");
        }
        if (game.isCheckmate()) endGame(game.turn() === "w" ? "0-1" : "1-0");
        else if (game.isDraw() || game.isStalemate()) endGame("1/2-1/2");
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const activeClockColor = isGameOver || !gameStarted ? null : game.turn();

  const statusText = onlineGame?.status === "finished"
    ? onlineGame.result === "1-0" ? "White wins!" : onlineGame.result === "0-1" ? "Black wins!" : "Draw!"
    : timeoutWinner ? `${timeoutWinner} wins on time!`
    : game.isCheckmate() ? `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`
    : game.isDraw() ? "Draw!" : game.isStalemate() ? "Stalemate!"
    : game.isCheck() ? `${game.turn() === "w" ? "White" : "Black"} is in check!`
    : onlineStatus === "playing" && game.turn() === myColor ? "Your turn"
    : onlineStatus === "playing" ? "Opponent's turn" : "";

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <Wifi className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Play Online</h1>
          <p className="text-muted-foreground mb-6">Log in to play against other players online.</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (onlineStatus === "idle" || onlineStatus === "searching") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
            Free <span className="text-gradient-gold">Online</span> Games
          </h1>
          <p className="text-center text-muted-foreground mb-2">Play against real opponents — no Premium required</p>

          {/* Live stats bar */}
          <div className="flex items-center justify-center gap-6 mb-8 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <Users className="h-3.5 w-3.5" /> {activePlayers} online
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Swords className="h-3.5 w-3.5" /> {liveGames.length} games live
            </span>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="play" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="play">Find Match</TabsTrigger>
                <TabsTrigger value="spectate"><Eye className="h-3.5 w-3.5 mr-1" /> Spectate</TabsTrigger>
                <TabsTrigger value="leaderboard"><Trophy className="h-3.5 w-3.5 mr-1" /> Leaderboard</TabsTrigger>
              </TabsList>

              {/* FIND MATCH TAB */}
              <TabsContent value="play">
                <div className="max-w-md mx-auto space-y-6">
                  {/* Time control */}
                  <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Timer className="h-3 w-3" /> Time Control</p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                      {TIME_CONTROLS.filter((_, i) => i < TIME_CONTROLS.length - 1).map((t, i) => (
                        <button key={t.label} onClick={() => setTimeControlIdx(i)} disabled={onlineStatus === "searching"}
                          className={`rounded-lg px-1.5 py-2.5 text-center transition-all border text-xs font-medium ${timeControlIdx === i ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"} disabled:opacity-50`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skill tier */}
                  <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill Level</p>
                    <div className="grid grid-cols-4 gap-2">
                      {SKILL_TIERS.map(tier => (
                        <button key={tier.key} onClick={() => setSkillTier(tier.key)} disabled={onlineStatus === "searching"}
                          className={`rounded-lg px-2 py-3 text-center transition-all border text-sm font-medium ${skillTier === tier.key ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"} disabled:opacity-50`}>
                          {tier.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {skillTier === "all" ? "Match with anyone" : `Rating ${SKILL_TIERS.find(t => t.key === skillTier)?.ratingRange[0]}–${SKILL_TIERS.find(t => t.key === skillTier)?.ratingRange[1]}`}
                    </p>
                  </div>

                  {/* Player card */}
                  <div className="rounded-lg border border-border/50 bg-card p-4">
                    <p className="text-sm text-muted-foreground">Playing as</p>
                    <p className="font-display text-lg font-bold text-foreground">{profile?.display_name || profile?.username || "Player"}</p>
                    <p className="text-xs text-muted-foreground">Rating: {profile?.rating || 1200}</p>
                  </div>

                  {onlineError && <p className="text-sm text-destructive text-center">{onlineError}</p>}
                  {onlineStatus === "searching" ? (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="font-medium">Looking for an opponent…</span>
                      </div>
                      <Button variant="outline" onClick={cancelSearch}>Cancel</Button>
                    </div>
                  ) : (
                    <Button className="w-full" size="lg" onClick={() => searchMatch(timeControlIdx)}>
                      <Wifi className="mr-2 h-5 w-5" /> Find Match
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* SPECTATE TAB */}
              <TabsContent value="spectate">
                <div className="max-w-2xl mx-auto">
                  {liveGames.length === 0 ? (
                    <div className="text-center py-16">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No live games right now. Check back soon!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-4">{liveGames.length} game{liveGames.length !== 1 ? "s" : ""} in progress</p>
                      {liveGames.map(g => (
                        <div key={g.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{g.time_control_label} Game</p>
                              <p className="text-xs text-muted-foreground">{g.turn === "w" ? "White" : "Black"} to move</p>
                            </div>
                          </div>
                          <Link to={`/play/online?spectate=${g.id}`}>
                            <Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5 mr-1" /> Watch</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* LEADERBOARD TAB */}
              <TabsContent value="leaderboard">
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-1.5">
                    {topPlayers.map((p, i) => {
                      const winRate = p.games_played > 0 ? Math.round((p.games_won / p.games_played) * 100) : 0;
                      const isMe = user?.id === p.user_id;
                      return (
                        <Link key={p.user_id} to={`/profile/${p.user_id}`}
                          className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-primary/30 ${isMe ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card"}`}>
                          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                            {i < 3 ? <Trophy className={`h-4 w-4 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} /> :
                            <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className={`font-medium truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                              {p.display_name || "Anonymous"}{isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono text-lg font-bold text-primary">{p.rating}</p>
                            <p className="text-[10px] text-muted-foreground">{p.games_played}G · {winRate}%W</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="text-center mt-6">
                    <Link to="/leaderboard"><Button variant="outline" size="sm">View Full Leaderboard</Button></Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch opponent profile
  const [opponentProfile, setOpponentProfile] = useState<{ display_name: string | null; rating: number; avatar_url: string | null } | null>(null);
  const opponentId = onlineGame
    ? myColor === "w" ? onlineGame.black_player_id : onlineGame.white_player_id
    : null;

  useEffect(() => {
    if (!opponentId) return;
    supabase.from("profiles").select("display_name, rating, avatar_url").eq("user_id", opponentId).single().then(({ data }) => {
      if (data) setOpponentProfile(data);
    });
  }, [opponentId]);

  const myName = profile?.display_name || profile?.username || "You";
  const myRating = profile?.rating || 1200;
  const oppName = opponentProfile?.display_name || "Opponent";
  const oppRating = opponentProfile?.rating || 1200;

  const topPlayer = boardFlipped ? { name: myName, rating: myRating, isMe: true, time: myColor === "w" ? whiteTime : blackTime, color: myColor }
    : { name: oppName, rating: oppRating, isMe: false, time: myColor === "w" ? blackTime : whiteTime, color: myColor === "w" ? "b" : "w" };
  const bottomPlayer = boardFlipped ? { name: oppName, rating: oppRating, isMe: false, time: myColor === "w" ? blackTime : whiteTime, color: myColor === "w" ? "b" : "w" }
    : { name: myName, rating: myRating, isMe: true, time: myColor === "w" ? whiteTime : blackTime, color: myColor };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const PlayerBar = ({ player, isTop }: { player: typeof topPlayer; isTop: boolean }) => {
    const isActive = !isGameOver && gameStarted && game.turn() === player.color;
    return (
      <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all duration-300 ${
        isActive ? "border-primary/50 bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.1)]" : "border-border/40 bg-card/60"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${
            player.color === "w" ? "bg-foreground text-background" : "bg-muted-foreground/20 text-foreground"
          }`}>
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${player.isMe ? "text-primary" : "text-foreground"}`}>{player.name}</span>
              {isActive && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
            </div>
            <span className="text-xs text-muted-foreground font-mono">{player.rating} ELO</span>
          </div>
        </div>
        {!unlimited && (
          <div className={`font-mono text-xl font-bold px-3 py-1 rounded-lg ${
            isActive ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground"
          } ${player.time <= 30 && isActive ? "text-red-400 animate-pulse" : ""}`}>
            {formatTime(player.time)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
          {/* Board column */}
          <div className="w-full max-w-[min(90vw,520px)] space-y-2">
            <PlayerBar player={topPlayer} isTop />

            {!unlimited && (
              <div className="sr-only">
                <ChessClock whiteTime={whiteTime} blackTime={blackTime} activeColor={activeClockColor}
                  isGameOver={isGameOver} onTimeOut={handleTimeOut} setWhiteTime={setWhiteTime} setBlackTime={setBlackTime} unlimited={unlimited} />
              </div>
            )}

            <div className="rounded-xl overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.08)] border border-border/30" role="grid" aria-label="Chess board">
              {displayRanks.map((rank) => (
                <div key={rank} className="flex" role="row">
                  {displayFiles.map((file) => {
                    const square = `${file}${rank}` as Square;
                    const origRi = RANKS.indexOf(rank);
                    const origFi = FILES.indexOf(file);
                    const isLight = (origRi + origFi) % 2 === 0;
                    const piece = board[origRi][origFi];
                    const isSelected = selectedSquare === square;
                    const isLegal = legalMoves.includes(square);
                    const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
                    const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                    const pieceDisplay = pieceKey ? PIECE_DISPLAY[pieceKey] : null;

                    let bgClass = isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
                    if (isSelected) bgClass = "bg-primary/40";
                    else if (isLastMove) bgClass = isLight ? "bg-primary/20" : "bg-primary/25";

                    return (
                      <button key={square} role="gridcell"
                        aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                        className={`aspect-square w-[12.5%] flex items-center justify-center select-none transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset relative
                          ${bgClass}
                          ${isLegal || (game.turn() === myColor && !isGameOver) ? "cursor-pointer active:scale-95" : "cursor-default"}`}
                        onClick={() => handleSquareClick(square)} tabIndex={0}>
                        {isLegal && !piece && <span className="block h-[26%] w-[26%] rounded-full bg-foreground/20" />}
                        {isLegal && pieceDisplay && <span className="absolute inset-[6%] rounded-full border-[3px] border-foreground/25" />}
                        {pieceDisplay && <span className={`text-[min(7vw,3.4rem)] sm:text-[min(6vw,3.2rem)] leading-none ${pieceDisplay.className}`}>{pieceDisplay.symbol}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <PlayerBar player={bottomPlayer} isTop={false} />

            {/* Status + actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-sm font-medium text-foreground">{statusText}</p>
              <div className="flex gap-2">
                {onlineStatus === "playing" && !isGameOver && (
                  <Button onClick={resign} variant="destructive" size="sm"><Flag className="mr-1.5 h-3.5 w-3.5" /> Resign</Button>
                )}
                {isGameOver && (
                  <Button onClick={resetOnline} size="sm"><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New Game</Button>
                )}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full max-w-xs space-y-3 lg:mt-0">
            {/* Move history */}
            <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Moves</h3>
              <div className="max-h-48 overflow-y-auto">
                {moveHistory.length === 0 ? <p className="text-xs text-muted-foreground italic">Game starting…</p> : (
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
                    {moveHistory.map((move, i) => i % 2 === 0 ? (
                      <div key={i} className="contents">
                        <span className="text-muted-foreground/60 text-xs font-mono">{Math.floor(i / 2) + 1}.</span>
                        <span className="text-foreground font-medium font-mono">{move}</span>
                        <span className="text-muted-foreground font-mono">{moveHistory[i + 1] || ""}</span>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>
            </div>

            {/* Chat */}
            {onlineGame && (
              <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Game Chat</h3>
                <div className="h-40 overflow-y-auto space-y-1.5 px-1">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-muted-foreground/50 italic text-center pt-12">Say hi to your opponent!</p>
                  )}
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.user_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <span className={`inline-block px-3 py-1.5 rounded-2xl text-xs max-w-[85%] ${
                        msg.user_id === user?.id
                          ? "bg-primary/20 text-primary rounded-br-sm"
                          : "bg-muted/50 text-foreground rounded-bl-sm"
                      }`}>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-1.5">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message…" className="h-9 text-xs rounded-xl"
                    onKeyDown={e => e.key === "Enter" && sendChat()} />
                  <Button size="sm" variant="ghost" onClick={sendChat} className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10">
                    <Send className="h-3.5 w-3.5 text-primary" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlayOnline;
