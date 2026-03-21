import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calculator, BarChart3, BookOpen, Swords, Target, Crown,
  Play, Video, Map, Trophy, Brain, Flame, Puzzle, Clock,
  GraduationCap, Compass, History, Users, Sparkles,
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
      { title: "Video Lessons", desc: "Curated video content for every level", icon: Video, href: "/video-lessons", color: "text-red-400", bg: "bg-red-500/10" },
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
    category: "Community",
    items: [
      { title: "Leaderboard", desc: "See top-rated players", icon: Crown, href: "/leaderboard", color: "text-primary", bg: "bg-primary/10" },
      { title: "Friends", desc: "Connect with other players", icon: Users, href: "/friends", color: "text-green-400", bg: "bg-green-500/10" },
      { title: "Achievements", desc: "Unlock badges and rewards", icon: Sparkles, href: "/achievements", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    ],
  },
];

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
