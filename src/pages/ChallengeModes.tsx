import { useState } from "react";
import { Chess } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Ban, Shuffle, Sword, Clock, Flame, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChallengeMode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  rules: string[];
  tag?: string;
}

const CHALLENGE_MODES: ChallengeMode[] = [
  {
    id: "win-in-10",
    title: "Win in 10 Moves",
    subtitle: "Speed Assassin",
    description: "You have only 10 moves to deliver checkmate. If you can't — you lose. Pure aggression.",
    icon: Zap,
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-amber-600/10",
    rules: ["Checkmate within 10 moves to win", "If no checkmate by move 10 — you lose", "Forces aggressive, tactical play"],
    tag: "🔥 Popular",
  },
  {
    id: "no-castling",
    title: "No Castling",
    subtitle: "Exposed King",
    description: "Castling is disabled for both players. Keep your king safe the hard way.",
    icon: Ban,
    color: "text-red-400",
    gradient: "from-red-500/20 to-rose-600/10",
    rules: ["Castling is forbidden for both sides", "King must find safety through piece play", "Tests real defensive skill"],
  },
  {
    id: "random-opening",
    title: "Random Opening",
    subtitle: "Chaos Theory",
    description: "The system plays the first 4 moves for both sides randomly. Adapt or die.",
    icon: Shuffle,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-violet-600/10",
    rules: ["First 4 moves are randomly chosen", "Both players start from the same position", "Tests adaptability and creativity"],
    tag: "🎲 Wild",
  },
  {
    id: "anti-theory",
    title: "Anti-Theory Mode",
    subtitle: "Confuse Your Opponent",
    description: "Automatically generates rare, off-meta openings. No preparation can save you here.",
    icon: Sparkles,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-teal-600/10",
    rules: ["Starts with obscure opening positions", "Forces creative & original play", "No memorized lines will help"],
    tag: "⭐ Signature",
  },
  {
    id: "aggressive",
    title: "Aggressive Mode",
    subtitle: "No Hiding",
    description: "Passive play is punished. Limited pawn moves in the first 10 moves. Attack or perish.",
    icon: Sword,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-amber-600/10",
    rules: ["Max 3 pawn moves in first 10 moves", "Encourages piece development & attacking", "Passive play = penalty"],
  },
];

export default function ChallengeModes() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handlePlay = (modeId: string) => {
    // Navigate to play page with mode parameter
    navigate(`/play?mode=${modeId}`);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <DynamicBackground />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">
            <Flame className="w-3 h-3 mr-1" /> Challenge Modes
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Custom <span className="text-gradient-gold">Challenges</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Unique game modes that test different skills. Pick a challenge and prove yourself.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid gap-4 sm:gap-5">
          {CHALLENGE_MODES.map((mode, i) => {
            const isSelected = selectedMode === mode.id;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className={`relative overflow-hidden border transition-all duration-300 cursor-pointer group ${
                    isSelected
                      ? "border-primary/40 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                      : "border-border/40 hover:border-primary/20"
                  }`}
                  onClick={() => setSelectedMode(isSelected ? null : mode.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-50`} />
                  <CardContent className="relative p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-background/50 border border-border/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <mode.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${mode.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-bold text-foreground">{mode.title}</h3>
                          {mode.tag && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                              {mode.tag}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs font-semibold ${mode.color} mb-1`}>{mode.subtitle}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{mode.description}</p>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                          >
                            <div className="space-y-1.5 mb-4">
                              {mode.rules.map((rule, ri) => (
                                <div key={ri} className="flex items-start gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${mode.color.replace("text-", "bg-")}`} />
                                  <span className="text-xs text-muted-foreground">{rule}</span>
                                </div>
                              ))}
                            </div>
                            <Button
                              onClick={(e) => { e.stopPropagation(); handlePlay(mode.id); }}
                              className="ripple-btn group/btn"
                            >
                              Play Now <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      <ArrowRight className={`w-5 h-5 shrink-0 transition-all duration-300 ${isSelected ? "text-primary rotate-90" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
