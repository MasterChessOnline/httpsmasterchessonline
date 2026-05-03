import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calculator, BarChart3, BookOpen, Swords, Target, Crown,
  Play, Video, Map, Trophy, Brain, Flame, Puzzle, Clock,
  GraduationCap, Compass, History, Users, Sparkles, ArrowRight,
} from "lucide-react";

const TOOLS = [
  {
    category: "Calculators",
    items: [
      { title: "ELO Calculator", desc: "Calculate rating changes after a game", icon: Calculator, href: "/rating-calculator", color: "text-green-400", bg: "bg-green-500/10" },
      { title: "Performance Rating", desc: "Calculate tournament performance", icon: BarChart3, href: "/rating-calculator", color: "text-blue-400", bg: "bg-blue-500/10" },
    ],
  },
  {
    category: "Play",
    items: [
      { title: "vs Computer", desc: "Play against AI with adjustable difficulty", icon: Brain, href: "/play", color: "text-purple-400", bg: "bg-purple-500/10" },
      { title: "Online Multiplayer", desc: "Play against real players worldwide", icon: Users, href: "/play/online", color: "text-primary", bg: "bg-primary/10" },
      { title: "Daily Challenge", desc: "Solve today's puzzle challenge", icon: Puzzle, href: "/daily-challenge", color: "text-orange-400", bg: "bg-orange-500/10" },
      { title: "Tournaments", desc: "Compete in Swiss tournaments", icon: Trophy, href: "/tournaments", color: "text-primary", bg: "bg-primary/10" },
    ],
  },
  {
    category: "Learn",
    items: [
      { title: "Courses", desc: "50+ structured lessons from beginner to advanced", icon: GraduationCap, href: "/learn", color: "text-green-400", bg: "bg-green-500/10" },
      { title: "Coming Soon", desc: "New features are on the way", icon: Clock, href: "/coming-soon", color: "text-yellow-400", bg: "bg-yellow-500/10" },
      { title: "Opening Trainer", desc: "Practice your opening repertoire", icon: BookOpen, href: "/openings", color: "text-blue-400", bg: "bg-blue-500/10" },
      { title: "Story Mode", desc: "14-chapter chess adventure", icon: Flame, href: "/story", color: "text-orange-400", bg: "bg-orange-500/10" },
    ],
  },
  {
    category: "Analyze",
    items: [
      { title: "Game Analysis", desc: "Analyze games with Stockfish engine", icon: Target, href: "/analysis", color: "text-primary", bg: "bg-primary/10" },
      { title: "Opening Explorer", desc: "Explore millions of master games", icon: Compass, href: "/opening-explorer", color: "text-purple-400", bg: "bg-purple-500/10" },
      { title: "Game History", desc: "Review your past games", icon: History, href: "/history", color: "text-blue-400", bg: "bg-blue-500/10" },
    ],
  },
  {
    category: "Improve",
    items: [
      { title: "Skill Tree", desc: "Unlock skills across Tactics, Strategy, Openings & Endgames", icon: Target, href: "/skill-tree", color: "text-purple-400", bg: "bg-purple-500/10" },
      { title: "Advanced Stats", desc: "Deep analytics: win rate by color, time control, streaks", icon: BarChart3, href: "/stats", color: "text-blue-400", bg: "bg-blue-500/10" },
      { title: "1v1 Challenge", desc: "Challenge anyone with a shareable link", icon: Swords, href: "/challenge", color: "text-red-400", bg: "bg-red-500/10" },
      { title: "Piece Values", desc: "Learn relative piece values", icon: Crown, href: "/piece-values", color: "text-primary", bg: "bg-primary/10" },
    ],
  },
  {
    category: "Community",
    items: [
      { title: "Leaderboard", desc: "See top-rated players", icon: Crown, href: "/leaderboard", color: "text-primary", bg: "bg-primary/10" },
      { title: "Friends", desc: "Connect with other players", icon: Users, href: "/friends", color: "text-green-400", bg: "bg-green-500/10" },
      { title: "Achievements", desc: "Unlock badges and rewards", icon: Sparkles, href: "/achievements", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    ],
  },
];

function QuickEloWidget() {
  const [yourRating, setYourRating] = useState(1200);
  const [oppRating, setOppRating] = useState(1200);
  const [k, setK] = useState(32);

  const { expected, win, draw, loss } = useMemo(() => {
    const exp = 1 / (1 + Math.pow(10, (oppRating - yourRating) / 400));
    return {
      expected: exp,
      win: Math.round(k * (1 - exp)),
      draw: Math.round(k * (0.5 - exp)),
      loss: Math.round(k * (0 - exp)),
    };
  }, [yourRating, oppRating, k]);

  return (
    <Card className="border-primary/30 bg-card mb-8">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Quick ELO Calculator</h3>
            <p className="text-[11px] text-muted-foreground">See your rating change in real time.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <Label className="text-[11px]">Your rating</Label>
            <Input type="number" value={yourRating} onChange={(e) => setYourRating(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-[11px]">Opponent rating</Label>
            <Input type="number" value={oppRating} onChange={(e) => setOppRating(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-[11px]">K-factor</Label>
            <Input type="number" value={k} onChange={(e) => setK(parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2">
            <p className="text-[10px] text-muted-foreground">Win</p>
            <p className="text-lg font-bold text-green-400">+{win}</p>
          </div>
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2">
            <p className="text-[10px] text-muted-foreground">Draw</p>
            <p className="text-lg font-bold text-yellow-400">{draw >= 0 ? "+" : ""}{draw}</p>
          </div>
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2">
            <p className="text-[10px] text-muted-foreground">Loss</p>
            <p className="text-lg font-bold text-red-400">{loss}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Expected score: {(expected * 100).toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  );
}

const ChessTools = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
      <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
          <Swords className="w-3 h-3 mr-1" /> All-in-One
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold font-display">
          Chess <span className="text-gradient-gold">Tools</span>
        </h1>
        <p className="text-muted-foreground mt-2">Everything you need to play, learn, and improve — all in one place.</p>
      </motion.div>

      <QuickEloWidget />

      {TOOLS.map((section, si) => (
        <motion.div
          key={section.category}
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
        >
          <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-border/50" />
            {section.category}
            <div className="h-px flex-1 bg-border/50" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.items.map((tool) => (
              <Link key={tool.title} to={tool.href}>
                <Card className="border-border/50 hover:border-primary/40 bg-card transition-all cursor-pointer hover:shadow-glow group h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`rounded-lg ${tool.bg} p-2.5 shrink-0 group-hover:scale-110 transition-transform`}>
                      <tool.icon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{tool.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      ))}
    </main>
    <Footer />
  </div>
);

export default ChessTools;
