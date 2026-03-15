import { useState, useEffect, useMemo, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getTodaysPuzzle, getTodayDateString } from "@/lib/daily-puzzles";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Flame, Clock, CheckCircle, XCircle, RotateCcw,
  Lightbulb, Star, Medal, Zap, Target, Users
} from "lucide-react";
import { Link } from "react-router-dom";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  streak: number;
  rank: number;
}

const POINTS_CORRECT = 10;
const POINTS_FAST_BONUS = 20;
const FAST_SOLVER_LIMIT = 10;

const DailyChallenge = () => {
  const { user, profile } = useAuth();
  const puzzle = getTodaysPuzzle();
  const todayStr = getTodayDateString();

  // Game state
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);

  // Challenge state
  const [status, setStatus] = useState<"playing" | "solved" | "failed">("playing");
  const [alreadySolved, setAlreadySolved] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [fastBonus, setFastBonus] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [solversCount, setSolversCount] = useState(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStreak, setUserStreak] = useState(0);

  // Timer
  useEffect(() => {
    if (status !== "playing" || alreadySolved) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [status, alreadySolved]);

  // Check if already solved today & load leaderboard
  useEffect(() => {
    if (!user) return;

    // Check today's solve
    supabase
      .from("puzzle_solves")
      .select("solved, time_seconds")
      .eq("user_id", user.id)
      .eq("puzzle_date", todayStr)
      .eq("puzzle_index", 0)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.solved) {
          setAlreadySolved(true);
          setStatus("solved");
        }
      });

    // Count today's solvers (for fast bonus)
    supabase
      .from("puzzle_solves")
      .select("id", { count: "exact", head: true })
      .eq("puzzle_date", todayStr)
      .eq("solved", true)
      .eq("puzzle_index", 0)
      .then(({ count }) => {
        setSolversCount(count || 0);
      });

    // Load streak
    loadStreak(user.id);
    loadLeaderboard();
  }, [user, todayStr]);

  const loadStreak = async (userId: string) => {
    const { data } = await supabase
      .from("puzzle_solves")
      .select("puzzle_date")
      .eq("user_id", userId)
      .eq("solved", true)
      .order("puzzle_date", { ascending: false })
      .limit(60);

    if (!data || data.length === 0) { setUserStreak(0); return; }

    const dates = [...new Set(data.map(d => d.puzzle_date))].sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toISOString().split("T")[0]) {
        streak++;
      } else break;
    }
    setUserStreak(streak);
  };

  const loadLeaderboard = async () => {
    // Get all solves for current month
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStr = monthStart.toISOString().split("T")[0];

    const { data } = await supabase
      .from("puzzle_solves")
      .select("user_id, solved, puzzle_date")
      .eq("solved", true)
      .gte("puzzle_date", monthStr)
      .order("puzzle_date", { ascending: false });

    if (!data) return;

    // Aggregate points per user
    const userPoints: Record<string, { points: number; dates: Set<string> }> = {};
    data.forEach(s => {
      if (!userPoints[s.user_id]) userPoints[s.user_id] = { points: 0, dates: new Set() };
      userPoints[s.user_id].points += POINTS_CORRECT;
      userPoints[s.user_id].dates.add(s.puzzle_date);
    });

    // Calculate streaks and build entries
    const userIds = Object.keys(userPoints);
    if (userIds.length === 0) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const profileMap: Record<string, string> = {};
    profiles?.forEach(p => { profileMap[p.user_id] = p.display_name || "Player"; });

    const entries: LeaderboardEntry[] = userIds
      .map(uid => ({
        user_id: uid,
        display_name: profileMap[uid] || "Player",
        total_points: userPoints[uid].points,
        streak: userPoints[uid].dates.size,
        rank: 0,
      }))
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 20)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    setLeaderboard(entries);
  };

  const handleSquareClick = useCallback((square: Square) => {
    if (status !== "playing" || alreadySolved) return;

    const piece = game.get(square);

    if (selectedSquare) {
      // Try to make the move
      const moveUci = `${selectedSquare}${square}`;
      const expectedMove = puzzle.solution[moveIndex];

      if (moveUci === expectedMove) {
        // Correct move
        const moveMade = game.move({ from: selectedSquare, to: square });
        if (moveMade) {
          const newGame = new Chess(game.fen());
          setGame(newGame);
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);

          if (moveIndex + 1 >= puzzle.solution.length) {
            // Puzzle solved!
            handleSolved();
          } else {
            setMoveIndex(moveIndex + 1);
          }
        }
      } else {
        // Wrong move
        setStatus("failed");
        setSelectedSquare(null);
        setLegalMoves([]);
        if (user) {
          supabase.from("puzzle_solves").upsert({
            user_id: user.id,
            puzzle_date: todayStr,
            puzzle_index: 0,
            solved: false,
            time_seconds: timer,
          }, { onConflict: "user_id,puzzle_date,puzzle_index" as any });
        }
      }
    } else if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
    }
  }, [selectedSquare, game, status, moveIndex, puzzle, alreadySolved, user, timer, todayStr]);

  const handleSolved = async () => {
    setStatus("solved");
    const isFast = solversCount < FAST_SOLVER_LIMIT;
    const streakBonus = userStreak >= 3 ? 5 : userStreak >= 7 ? 10 : 0;
    const points = POINTS_CORRECT + (isFast ? POINTS_FAST_BONUS : 0) + streakBonus;
    setEarnedPoints(points);
    setFastBonus(isFast);

    if (user) {
      await supabase.from("puzzle_solves").upsert({
        user_id: user.id,
        puzzle_date: todayStr,
        puzzle_index: 0,
        solved: true,
        time_seconds: timer,
      }, { onConflict: "user_id,puzzle_date,puzzle_index" as any });

      setSolversCount(prev => prev + 1);
      loadLeaderboard();
      loadStreak(user.id);
    }
  };

  const handleRetry = () => {
    setGame(new Chess(puzzle.fen));
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setMoveIndex(0);
    setStatus("playing");
    setHintSquare(null);
  };

  const handleHint = () => {
    if (hintUsed || status !== "playing") return;
    const move = puzzle.solution[moveIndex];
    const fromSq = move.substring(0, 2) as Square;
    setHintSquare(fromSq);
    setHintUsed(true);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const typeColors: Record<string, string> = {
    "mate-in-2": "bg-destructive/20 text-destructive",
    tactical: "bg-primary/20 text-primary",
    endgame: "bg-accent/20 text-accent-foreground",
  };

  const diffColors: Record<string, string> = {
    easy: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    hard: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">Daily Chess Challenge</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Solve today's puzzle to earn points and climb the leaderboard!
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Left - Puzzle Board */}
            <div className="space-y-4">
              {/* Puzzle info bar */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg font-semibold text-foreground">{puzzle.title}</h2>
                    <Badge className={typeColors[puzzle.type]}>{puzzle.type.replace("-", " ")}</Badge>
                    <Badge className={diffColors[puzzle.difficulty]}>{puzzle.difficulty}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {formatTime(timer)}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-primary font-mono font-bold">
                      <Star className="h-4 w-4" /> {puzzle.points} pts
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{puzzle.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {game.turn() === "w" ? "⬜ White" : "⬛ Black"} to move
                </p>
              </div>

              {/* Chess Board */}
              <ChessBoard
                game={game}
                flipped={game.turn() === "b"}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isGameOver={status !== "playing"}
                isPlayerTurn={status === "playing" && !alreadySolved}
                hintSquare={hintSquare}
                onSquareClick={handleSquareClick}
              />

              {/* Controls */}
              <div className="flex flex-wrap gap-2 justify-center">
                {status === "playing" && !alreadySolved && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleHint} disabled={hintUsed}>
                      <Lightbulb className="mr-2 h-4 w-4" /> {hintUsed ? "Hint Used" : "Get Hint"}
                    </Button>
                  </>
                )}
                {status === "failed" && (
                  <Button size="sm" onClick={handleRetry}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                  </Button>
                )}
              </div>

              {/* Result banner */}
              {status === "solved" && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center animate-in fade-in duration-500">
                  <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">
                    {alreadySolved ? "Already Solved Today!" : "Puzzle Solved! 🎉"}
                  </h3>
                  {!alreadySolved && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Time: {formatTime(timer)}</p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Badge className="bg-primary/20 text-primary">+{POINTS_CORRECT} points</Badge>
                        {fastBonus && <Badge className="bg-yellow-500/20 text-yellow-400">+{POINTS_FAST_BONUS} fast bonus!</Badge>}
                        {userStreak >= 3 && <Badge className="bg-orange-500/20 text-orange-400">+{userStreak >= 7 ? 10 : 5} streak bonus</Badge>}
                      </div>
                      <p className="text-lg font-bold text-primary font-mono mt-1">Total: +{earnedPoints} pts</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">Come back tomorrow for a new challenge!</p>
                </div>
              )}

              {status === "failed" && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center animate-in fade-in duration-500">
                  <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">Wrong Move!</h3>
                  <p className="text-sm text-muted-foreground">Try again to find the correct solution.</p>
                </div>
              )}
            </div>

            {/* Right - Sidebar */}
            <div className="space-y-4">
              {/* User stats card */}
              {user && (
                <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                  <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" /> Your Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center rounded-lg bg-muted/30 p-3">
                      <p className="font-mono text-2xl font-bold text-primary">{userStreak}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Day Streak</p>
                    </div>
                    <div className="text-center rounded-lg bg-muted/30 p-3">
                      <p className="font-mono text-2xl font-bold text-foreground">{solversCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Solved Today</p>
                    </div>
                  </div>
                  {userStreak >= 3 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-orange-400">
                      <Flame className="h-3 w-3" />
                      <span>{userStreak >= 7 ? "🔥 On fire! +10 streak bonus" : "Streak bonus active! +5 pts"}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reward info */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Rewards
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" /> Correct answer
                    </span>
                    <span className="font-mono text-primary font-bold">+10 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-yellow-400" /> First 10 solvers
                    </span>
                    <span className="font-mono text-yellow-400 font-bold">+20 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-orange-400" /> 3+ day streak
                    </span>
                    <span className="font-mono text-orange-400 font-bold">+5 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-red-400" /> 7+ day streak
                    </span>
                    <span className="font-mono text-red-400 font-bold">+10 pts</span>
                  </div>
                </div>
              </div>

              {/* Fast solver progress */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Medal className="h-4 w-4 text-yellow-400" /> Fast Solver Bonus
                </h3>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{solversCount} / {FAST_SOLVER_LIMIT} slots taken</span>
                    <span>{Math.max(0, FAST_SOLVER_LIMIT - solversCount)} remaining</span>
                  </div>
                  <Progress value={(solversCount / FAST_SOLVER_LIMIT) * 100} className="h-2" />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {solversCount < FAST_SOLVER_LIMIT
                    ? "Solve now for +20 bonus points!"
                    : "Fast solver slots are full for today."}
                </p>
              </div>

              {/* Leaderboard */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" /> Monthly Leaderboard
                </h3>
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No solvers yet this month. Be the first!</p>
                ) : (
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {leaderboard.map(entry => {
                      const isMe = user?.id === entry.user_id;
                      const medalColors = ["text-yellow-400", "text-gray-400", "text-amber-600"];
                      return (
                        <div
                          key={entry.user_id}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                            isMe ? "bg-primary/10 border border-primary/20" : "bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`font-mono text-xs font-bold w-5 ${entry.rank <= 3 ? medalColors[entry.rank - 1] : "text-muted-foreground"}`}>
                              {entry.rank <= 3 ? "🏆".slice(0, 1) : `#${entry.rank}`}
                              {entry.rank === 1 && "🥇"}
                              {entry.rank === 2 && "🥈"}
                              {entry.rank === 3 && "🥉"}
                            </span>
                            <Link
                              to={`/profile/${entry.user_id}`}
                              className="text-foreground hover:text-primary truncate transition-colors"
                            >
                              {entry.display_name}
                            </Link>
                          </div>
                          <span className="font-mono text-xs text-primary font-bold shrink-0">{entry.total_points} pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {!user && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium mb-2">Sign in to track your progress!</p>
                  <Link to="/login">
                    <Button size="sm" className="w-full">Sign In</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DailyChallenge;
