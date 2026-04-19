import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart3, PieChart, Swords, Crown, BookOpen, Flame, Dna, Lightbulb, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { computeChessDNA, type DNAGame } from "@/lib/chess-dna";

const Stats = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [recentGames, setRecentGames] = useState<DNAGame[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("online_games")
      .select("id, result, white_player_id, black_player_id, time_control_label, pgn, white_time, black_time, created_at")
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setRecentGames((data as any) || []));
  }, [user]);

  const dna = useMemo(() => user ? computeChessDNA(user.id, recentGames) : null, [user, recentGames]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  const winRate = profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0;
  const drawRate = profile.games_played > 0 ? Math.round((profile.games_drawn / profile.games_played) * 100) : 0;
  const lossRate = profile.games_played > 0 ? 100 - winRate - drawRate : 0;

  // Color stats from recent games
  let whiteGames = 0, whiteWins = 0, blackGames = 0, blackWins = 0;
  const timeControlStats: Record<string, { games: number; wins: number }> = {};

  recentGames.forEach(g => {
    const isWhite = g.white_player_id === user!.id;
    const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
    if (isWhite) { whiteGames++; if (won) whiteWins++; }
    else { blackGames++; if (won) blackWins++; }
    const tc = g.time_control_label || "unknown";
    if (!timeControlStats[tc]) timeControlStats[tc] = { games: 0, wins: 0 };
    timeControlStats[tc].games++;
    if (won) timeControlStats[tc].wins++;
  });

  const whiteWinRate = whiteGames > 0 ? Math.round((whiteWins / whiteGames) * 100) : 0;
  const blackWinRate = blackGames > 0 ? Math.round((blackWins / blackGames) * 100) : 0;

  // Rating tier
  const getTier = (r: number) => {
    if (r >= 2400) return { name: "Grandmaster", color: "text-red-400", bg: "bg-red-500/10" };
    if (r >= 2000) return { name: "Master", color: "text-purple-400", bg: "bg-purple-500/10" };
    if (r >= 1600) return { name: "Expert", color: "text-blue-400", bg: "bg-blue-500/10" };
    if (r >= 1200) return { name: "Intermediate", color: "text-green-400", bg: "bg-green-500/10" };
    if (r >= 800) return { name: "Beginner", color: "text-yellow-400", bg: "bg-yellow-500/10" };
    return { name: "Novice", color: "text-muted-foreground", bg: "bg-muted/20" };
  };
  const tier = getTier(profile.rating);

  // Win streak from recent
  let currentStreak = 0;
  for (const g of recentGames) {
    const isWhite = g.white_player_id === user!.id;
    const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
    if (won) currentStreak++;
    else break;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
            <span className="text-gradient-gold">Advanced Stats</span>
          </h1>
          <p className="text-muted-foreground">Deep dive into your chess performance</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Rating & Tier */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Rating</p>
                <p className="font-mono text-5xl font-bold text-primary drop-shadow-[0_0_12px_hsl(43_80%_55%/0.3)]">
                  {profile.rating}
                </p>
                <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full ${tier.bg}`}>
                  <Crown className={`h-3.5 w-3.5 ${tier.color}`} />
                  <span className={`text-xs font-bold ${tier.color}`}>{tier.name}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="font-mono text-lg font-bold text-foreground">{currentStreak}</span>
                  <span className="text-xs text-muted-foreground">win streak</span>
                </div>
                <p className="text-xs text-muted-foreground">{profile.games_played} total games</p>
              </div>
            </div>
          </motion.div>

          {/* Win/Loss/Draw breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Wins", value: profile.games_won, pct: winRate, color: "text-green-400", bg: "bg-green-500/10", bar: "bg-green-500" },
              { label: "Draws", value: profile.games_drawn, pct: drawRate, color: "text-muted-foreground", bg: "bg-muted/20", bar: "bg-muted-foreground" },
              { label: "Losses", value: profile.games_lost, pct: lossRate, color: "text-red-400", bg: "bg-red-500/10", bar: "bg-red-500" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border border-border/40 ${s.bg} p-4 text-center`}
              >
                <p className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label} ({s.pct}%)</p>
                <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chess DNA */}
          {dna && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 space-y-5"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
                    <Dna className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your Chess DNA</p>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Playstyle: <span className="text-primary">{dna.style}</span>
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</p>
                  <p className="font-mono text-lg font-bold text-foreground">{Math.round(dna.styleConfidence * 100)}%</p>
                </div>
              </div>

              {/* Behavioral metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg border border-border/40 bg-card/60 p-3 text-center">
                  <p className="font-mono text-lg font-bold text-foreground">{dna.totalGames}</p>
                  <p className="text-[10px] text-muted-foreground">Games analyzed</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/60 p-3 text-center">
                  <p className="font-mono text-lg font-bold text-foreground">{dna.avgMovesPerGame}</p>
                  <p className="text-[10px] text-muted-foreground">Avg moves/game</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/60 p-3 text-center">
                  <p className="font-mono text-lg font-bold text-orange-400">{dna.blunderProxyRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Early collapses</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/60 p-3 text-center">
                  <p className="font-mono text-lg font-bold text-red-400">{dna.timePressureLossRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Time-trouble losses</p>
                </div>
              </div>

              {/* Insights */}
              {dna.insights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="h-3 w-3" /> Insights
                  </p>
                  {dna.insights.slice(0, 4).map((ins, i) => (
                    <div key={i} className="rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-sm text-foreground">
                      {ins}
                    </div>
                  ))}
                </div>
              )}

              {/* Opening win rates */}
              {dna.openings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" /> Opening performance
                  </p>
                  {dna.openings.slice(0, 5).map(op => (
                    <div key={op.name} className="flex items-center gap-3">
                      <span className="text-xs text-foreground w-32 shrink-0 truncate">{op.name}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{op.games} games</span>
                          <span className="text-[10px] font-bold text-foreground">{op.winRate}% win</span>
                        </div>
                        <Progress value={op.winRate} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Link to="/training" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2"><Brain className="h-3.5 w-3.5" /> Train weaknesses</Button>
                </Link>
                <Link to="/coach" className="flex-1">
                  <Button size="sm" className="w-full gap-2"><Target className="h-3.5 w-3.5" /> Ask coach</Button>
                </Link>
              </div>
            </motion.div>
          )}

          <div className="rounded-xl border border-border/40 bg-card/80 p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> Win Rate by Color
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/30 bg-muted/10 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-foreground mx-auto mb-2 border-2 border-border/50" />
                <p className="font-mono text-xl font-bold text-foreground">{whiteWinRate}%</p>
                <p className="text-xs text-muted-foreground">White · {whiteGames} games</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-muted/10 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[hsl(220,20%,12%)] mx-auto mb-2 border-2 border-border/50" />
                <p className="font-mono text-xl font-bold text-foreground">{blackWinRate}%</p>
                <p className="text-xs text-muted-foreground">Black · {blackGames} games</p>
              </div>
            </div>
          </div>

          {/* Time control breakdown */}
          <div className="rounded-xl border border-border/40 bg-card/80 p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Performance by Time Control
            </h3>
            {Object.keys(timeControlStats).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Play games to see statistics here.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(timeControlStats)
                  .sort((a, b) => b[1].games - a[1].games)
                  .map(([tc, stats]) => {
                    const wr = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
                    return (
                      <div key={tc} className="flex items-center gap-3">
                        <span className="text-sm font-mono font-semibold text-primary w-14 shrink-0">{tc}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">{stats.games} games</span>
                            <span className="text-xs font-bold text-foreground">{wr}% win</span>
                          </div>
                          <Progress value={wr} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <Link to="/history" className="flex-1">
              <Button variant="outline" className="w-full"><Swords className="mr-2 h-4 w-4" /> Game History</Button>
            </Link>
            <Link to="/analysis" className="flex-1">
              <Button className="w-full"><Target className="mr-2 h-4 w-4" /> Analyze</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Stats;
