import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, TrendingDown, Target, Trophy,
  Plus, Trash2, BarChart3, Zap, Shield, Award, Info,
  ArrowRight, Swords, Scale,
} from "lucide-react";

/* ── ELO Calculator Logic ── */
function calcEloChange(myElo: number, oppElo: number, result: number, k = 32) {
  const expected = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
  const change = Math.round(k * (result - expected));
  return { change, expected, newElo: myElo + change };
}

function getWinProbability(myElo: number, oppElo: number) {
  return 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
}

/* ── Performance Rating ── */
function calcPerformanceRating(games: { oppElo: number; result: number }[]) {
  if (games.length === 0) return 0;
  const avgOpp = games.reduce((s, g) => s + g.oppElo, 0) / games.length;
  const score = games.reduce((s, g) => s + g.result, 0) / games.length;
  if (score >= 1) return Math.round(avgOpp + 800);
  if (score <= 0) return Math.round(avgOpp - 800);
  const dp = -400 * Math.log10(1 / score - 1);
  return Math.round(avgOpp + dp);
}

/* ── Rating Category ── */
function getRatingCategory(elo: number) {
  if (elo < 800) return { label: "Beginner", color: "text-green-400", icon: Shield };
  if (elo < 1200) return { label: "Intermediate", color: "text-blue-400", icon: Zap };
  if (elo < 1600) return { label: "Advanced", color: "text-purple-400", icon: Award };
  if (elo < 2000) return { label: "Expert", color: "text-orange-400", icon: Trophy };
  if (elo < 2200) return { label: "Candidate Master", color: "text-primary", icon: Trophy };
  if (elo < 2400) return { label: "FIDE Master", color: "text-primary", icon: Trophy };
  if (elo < 2500) return { label: "International Master", color: "text-primary", icon: Trophy };
  return { label: "Grandmaster", color: "text-primary", icon: Trophy };
}

/* ── Visual ELO Bar ── */
function EloBar({ label, elo, change }: { label: string; elo: number; change: number }) {
  const cat = getRatingCategory(elo);
  const CatIcon = cat.icon;
  return (
    <div className="flex items-center gap-3">
      <CatIcon className={`w-5 h-5 ${cat.color} shrink-0`} />
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className={`font-mono font-bold ${cat.color}`}>{elo}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((elo / 3000) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1">
          <span className={cat.color}>{cat.label}</span>
          {change !== 0 && (
            <span className={change > 0 ? "text-green-400" : "text-red-400"}>
              {change > 0 ? `+${change}` : change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const RatingCalculator = () => {
  // ELO Calculator
  const [myElo, setMyElo] = useState(1200);
  const [oppElo, setOppElo] = useState(1200);
  const [kFactor, setKFactor] = useState(32);

  const eloResults = useMemo(() => ({
    win: calcEloChange(myElo, oppElo, 1, kFactor),
    draw: calcEloChange(myElo, oppElo, 0.5, kFactor),
    loss: calcEloChange(myElo, oppElo, 0, kFactor),
    winProb: getWinProbability(myElo, oppElo),
  }), [myElo, oppElo, kFactor]);

  // Performance Rating
  const [perfGames, setPerfGames] = useState<{ oppElo: number; result: number }[]>([
    { oppElo: 1300, result: 1 },
    { oppElo: 1400, result: 0.5 },
    { oppElo: 1200, result: 1 },
  ]);

  const perfRating = useMemo(() => calcPerformanceRating(perfGames), [perfGames]);

  const addPerfGame = () => setPerfGames([...perfGames, { oppElo: 1200, result: 1 }]);
  const removePerfGame = (i: number) => setPerfGames(perfGames.filter((_, idx) => idx !== i));
  const updatePerfGame = (i: number, field: "oppElo" | "result", val: number) => {
    const next = [...perfGames];
    next[i] = { ...next[i], [field]: val };
    setPerfGames(next);
  };

  const totalScore = perfGames.reduce((s, g) => s + g.result, 0);
  const avgOpp = perfGames.length > 0 ? Math.round(perfGames.reduce((s, g) => s + g.oppElo, 0) / perfGames.length) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
            <Calculator className="w-3 h-3 mr-1" /> Chess Tools
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            Rating <span className="text-gradient-gold">Calculator</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Calculate ELO changes, win probability, and tournament performance rating.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── ELO Calculator ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                  <Swords className="w-5 h-5 text-primary" /> ELO Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Your Rating</label>
                    <input
                      type="number"
                      value={myElo}
                      onChange={(e) => setMyElo(Number(e.target.value))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Opponent Rating</label>
                    <input
                      type="number"
                      value={oppElo}
                      onChange={(e) => setOppElo(Number(e.target.value))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* K-Factor */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    K-Factor
                    <span className="text-[10px] text-muted-foreground/60">(FIDE: 40 new, 20 &gt;2400, 10 &gt;2500)</span>
                  </label>
                  <div className="flex gap-2">
                    {[10, 20, 32, 40].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKFactor(k)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          kFactor === k ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        K={k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Win Probability */}
                <div className="rounded-xl bg-muted/30 border border-border/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Scale className="w-3 h-3" /> Win Probability
                    </span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden bg-red-500/30 flex">
                    <motion.div
                      className="h-full bg-green-500 rounded-l-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${eloResults.winProb * 100}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-green-400 font-mono">{(eloResults.winProb * 100).toFixed(1)}% You</span>
                    <span className="text-red-400 font-mono">{((1 - eloResults.winProb) * 100).toFixed(1)}% Opp</span>
                  </div>
                </div>

                {/* Results Table */}
                <div className="space-y-2">
                  {[
                    { label: "Win", icon: TrendingUp, data: eloResults.win, color: "text-green-400", bg: "bg-green-500/10" },
                    { label: "Draw", icon: Scale, data: eloResults.draw, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                    { label: "Loss", icon: TrendingDown, data: eloResults.loss, color: "text-red-400", bg: "bg-red-500/10" },
                  ].map(({ label, icon: Icon, data, color, bg }) => (
                    <div key={label} className={`flex items-center justify-between rounded-lg ${bg} border border-border/20 px-4 py-3`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-mono text-sm font-bold ${color}`}>
                          {data.change > 0 ? `+${data.change}` : data.change}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-sm text-foreground">{data.newElo}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visual bars */}
                <div className="space-y-3 pt-2">
                  <EloBar label="Your Rating" elo={myElo} change={0} />
                  <EloBar label="Opponent" elo={oppElo} change={0} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Performance Rating ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                  <BarChart3 className="w-5 h-5 text-primary" /> Performance Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Enter your tournament results to calculate your performance rating.
                </p>

                {/* Games list */}
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {perfGames.map((game, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg border border-border/20 px-3 py-2">
                      <span className="text-[10px] text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                      <input
                        type="number"
                        value={game.oppElo}
                        onChange={(e) => updatePerfGame(i, "oppElo", Number(e.target.value))}
                        className="w-20 bg-muted/50 border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                        placeholder="Opp ELO"
                      />
                      <div className="flex gap-1 flex-1">
                        {[
                          { val: 1, label: "W", color: "bg-green-500/20 text-green-400 border-green-500/30" },
                          { val: 0.5, label: "D", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
                          { val: 0, label: "L", color: "bg-red-500/20 text-red-400 border-red-500/30" },
                        ].map(({ val, label, color }) => (
                          <button
                            key={val}
                            onClick={() => updatePerfGame(i, "result", val)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                              game.result === val ? color : "bg-muted/50 border-border/30 text-muted-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => removePerfGame(i)} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button onClick={addPerfGame} variant="outline" size="sm" className="w-full">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Game
                </Button>

                {/* Summary */}
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5">
                  <div className="text-center mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Performance Rating</p>
                    <motion.p
                      className="text-4xl font-bold font-mono text-primary"
                      key={perfRating}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {perfRating}
                    </motion.p>
                    <p className="text-xs text-muted-foreground mt-1">{getRatingCategory(perfRating).label}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-card/50 rounded-lg p-2">
                      <p className="text-lg font-bold font-mono text-foreground">{perfGames.length}</p>
                      <p className="text-[10px] text-muted-foreground">Games</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-2">
                      <p className="text-lg font-bold font-mono text-foreground">{totalScore}/{perfGames.length}</p>
                      <p className="text-[10px] text-muted-foreground">Score</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-2">
                      <p className="text-lg font-bold font-mono text-foreground">{avgOpp}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Opp</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-muted/20 rounded-lg p-3">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Performance rating = average opponent rating ± 400 × ln(score/(1-score)). Used in FIDE tournaments to measure single-event strength.</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Rating Scale Reference ── */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <Target className="w-5 h-5 text-primary" /> Rating Scale Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { range: "0–800", title: "Beginner", desc: "Learning basics", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                  { range: "800–1200", title: "Intermediate", desc: "Club player", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  { range: "1200–1600", title: "Advanced", desc: "Strong club", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                  { range: "1600–2000", title: "Expert", desc: "Tournament player", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                  { range: "2000–2200", title: "Candidate Master", desc: "CM title", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
                  { range: "2200–2400", title: "FIDE Master", desc: "FM title", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                  { range: "2400–2500", title: "Int'l Master", desc: "IM title", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                  { range: "2500+", title: "Grandmaster", desc: "GM title", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                ].map((tier) => (
                  <div key={tier.range} className={`rounded-lg ${bg} border ${tier.border} ${tier.bg} p-3`}>
                    <p className={`font-mono text-sm font-bold ${tier.color}`}>{tier.range}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{tier.title}</p>
                    <p className="text-[10px] text-muted-foreground">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default RatingCalculator;
