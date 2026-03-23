import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { COURSES } from "@/lib/courses-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, ChevronRight, Swords, BookOpen, Crown, Target, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SkillNode {
  id: string;
  title: string;
  description: string;
  icon: typeof Swords;
  level: number; // 1-5
  unlocked: boolean;
  completed: boolean;
  progress: number; // 0-100
  xpReward: number;
  link: string;
  children: string[];
}

const SKILL_BRANCHES = [
  {
    id: "tactics",
    title: "Tactics",
    color: "from-red-500/20 to-red-500/5",
    borderColor: "border-red-500/30",
    icon: Target,
    iconColor: "text-red-400",
    description: "Forks, pins, skewers & combinations",
    nodes: [
      { id: "t1", title: "Basic Forks", desc: "Knight & pawn forks", level: 1, xp: 50, link: "/learn" },
      { id: "t2", title: "Pins & Skewers", desc: "Absolute and relative pins", level: 2, xp: 75, link: "/learn" },
      { id: "t3", title: "Discovered Attacks", desc: "Discovered checks & attacks", level: 3, xp: 100, link: "/learn" },
      { id: "t4", title: "Combinations", desc: "Multi-move tactical sequences", level: 4, xp: 150, link: "/learn" },
      { id: "t5", title: "Tactical Mastery", desc: "Advanced sacrifice patterns", level: 5, xp: 250, link: "/learn" },
    ],
  },
  {
    id: "strategy",
    title: "Strategy",
    color: "from-blue-500/20 to-blue-500/5",
    borderColor: "border-blue-500/30",
    icon: Shield,
    iconColor: "text-blue-400",
    description: "Pawn structure, piece activity & plans",
    nodes: [
      { id: "s1", title: "Pawn Structure", desc: "Isolated, doubled & passed pawns", level: 1, xp: 50, link: "/learn" },
      { id: "s2", title: "Piece Activity", desc: "Good vs bad pieces", level: 2, xp: 75, link: "/learn" },
      { id: "s3", title: "Positional Play", desc: "Outposts, weak squares", level: 3, xp: 100, link: "/learn" },
      { id: "s4", title: "Planning", desc: "Long-term strategic thinking", level: 4, xp: 150, link: "/learn" },
      { id: "s5", title: "Strategic Mastery", desc: "Complex positional evaluation", level: 5, xp: 250, link: "/learn" },
    ],
  },
  {
    id: "openings",
    title: "Openings",
    color: "from-green-500/20 to-green-500/5",
    borderColor: "border-green-500/30",
    icon: BookOpen,
    iconColor: "text-green-400",
    description: "Opening principles & theory",
    nodes: [
      { id: "o1", title: "Opening Principles", desc: "Center, development, castling", level: 1, xp: 50, link: "/openings" },
      { id: "o2", title: "Italian & Spanish", desc: "Classical 1.e4 openings", level: 2, xp: 75, link: "/openings" },
      { id: "o3", title: "Sicilian Defense", desc: "Most popular Black defense", level: 3, xp: 100, link: "/openings" },
      { id: "o4", title: "Queen's Gambit", desc: "1.d4 main lines", level: 4, xp: 150, link: "/openings" },
      { id: "o5", title: "Opening Mastery", desc: "Rare & sharp openings", level: 5, xp: 250, link: "/openings" },
    ],
  },
  {
    id: "endgame",
    title: "Endgame",
    color: "from-purple-500/20 to-purple-500/5",
    borderColor: "border-purple-500/30",
    icon: Crown,
    iconColor: "text-purple-400",
    description: "King activity, pawn endings & technique",
    nodes: [
      { id: "e1", title: "Basic Checkmates", desc: "K+Q, K+R vs K", level: 1, xp: 50, link: "/learn" },
      { id: "e2", title: "Pawn Endgames", desc: "Opposition & key squares", level: 2, xp: 75, link: "/learn" },
      { id: "e3", title: "Rook Endgames", desc: "Lucena & Philidor positions", level: 3, xp: 100, link: "/learn" },
      { id: "e4", title: "Minor Piece Endings", desc: "Bishop vs Knight, same color", level: 4, xp: 150, link: "/learn" },
      { id: "e5", title: "Endgame Mastery", desc: "Complex multi-piece endings", level: 5, xp: 250, link: "/learn" },
    ],
  },
];

const SkillTree = () => {
  const { user, profile } = useAuth();
  const { getCourseProgress } = useLessonProgress();
  const [expandedBranch, setExpandedBranch] = useState<string | null>("tactics");

  // Simulate progress based on games & lessons
  const gamesPlayed = profile?.games_played || 0;
  const getNodeUnlocked = (branchIdx: number, nodeIdx: number) => {
    if (nodeIdx === 0) return true;
    const threshold = nodeIdx * 5 + branchIdx * 3;
    return gamesPlayed >= threshold;
  };
  const getNodeProgress = (branchIdx: number, nodeIdx: number) => {
    if (!getNodeUnlocked(branchIdx, nodeIdx)) return 0;
    const base = Math.min(100, Math.floor((gamesPlayed / (nodeIdx * 10 + 5)) * 100));
    return Math.min(100, base);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
            <span className="text-gradient-gold">Skill Tree</span>
          </h1>
          <p className="text-muted-foreground">Unlock new skills as you improve. Master all branches to become a complete player.</p>
        </motion.div>

        {/* Overall progress */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center shadow-glow">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-sm font-semibold text-foreground">Overall Mastery</span>
                <span className="text-xs text-primary font-bold">
                  {SKILL_BRANCHES.reduce((sum, b, bi) => sum + b.nodes.filter((_, ni) => getNodeProgress(bi, ni) >= 100).length, 0)}/{SKILL_BRANCHES.reduce((s, b) => s + b.nodes.length, 0)} skills
                </span>
              </div>
              <Progress
                value={
                  (SKILL_BRANCHES.reduce((sum, b, bi) => sum + b.nodes.reduce((ns, _, ni) => ns + getNodeProgress(bi, ni), 0), 0) /
                    (SKILL_BRANCHES.reduce((s, b) => s + b.nodes.length, 0) * 100)) * 100
                }
                className="h-2.5"
              />
            </div>
          </div>
        </div>

        {/* Branches */}
        <div className="max-w-3xl mx-auto space-y-4">
          {SKILL_BRANCHES.map((branch, bi) => {
            const isExpanded = expandedBranch === branch.id;
            const completedNodes = branch.nodes.filter((_, ni) => getNodeProgress(bi, ni) >= 100).length;

            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bi * 0.1 }}
              >
                {/* Branch header */}
                <button
                  onClick={() => setExpandedBranch(isExpanded ? null : branch.id)}
                  className={`w-full rounded-xl border bg-gradient-to-r ${branch.color} ${branch.borderColor} p-4 flex items-center gap-4 transition-all hover:shadow-lg group`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-card/80 border border-border/50 flex items-center justify-center`}>
                    <branch.icon className={`h-6 w-6 ${branch.iconColor}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{branch.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-card/60 text-muted-foreground font-medium">
                        {completedNodes}/{branch.nodes.length}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{branch.description}</p>
                    <Progress value={(completedNodes / branch.nodes.length) * 100} className="h-1.5 mt-2" />
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {/* Nodes */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-6 mt-2 space-y-1.5 relative"
                  >
                    {/* Connecting line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/30" />

                    {branch.nodes.map((node, ni) => {
                      const unlocked = getNodeUnlocked(bi, ni);
                      const progress = getNodeProgress(bi, ni);
                      const completed = progress >= 100;

                      return (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ni * 0.05 }}
                          className="relative"
                        >
                          {/* Node dot on line */}
                          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 z-10 ${
                            completed ? "bg-primary border-primary" :
                            unlocked ? "bg-card border-primary/50" :
                            "bg-muted border-border/50"
                          }`} />

                          <Link
                            to={unlocked ? node.link : "#"}
                            className={`block ml-10 rounded-lg border p-3 transition-all ${
                              completed ? "border-primary/30 bg-primary/5" :
                              unlocked ? "border-border/40 bg-card/80 hover:border-primary/30 hover:bg-card" :
                              "border-border/20 bg-muted/20 opacity-50 cursor-not-allowed"
                            }`}
                            onClick={(e) => { if (!unlocked) e.preventDefault(); }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                ) : !unlocked ? (
                                  <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                ) : (
                                  <span className="text-xs font-bold text-primary w-4 text-center">L{node.level}</span>
                                )}
                                <div>
                                  <p className={`text-sm font-medium ${completed ? "text-primary" : unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                                    {node.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">{node.desc}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-bold text-primary">+{node.xp} XP</span>
                                {unlocked && !completed && (
                                  <div className="mt-1">
                                    <Progress value={progress} className="h-1 w-16" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SkillTree;
