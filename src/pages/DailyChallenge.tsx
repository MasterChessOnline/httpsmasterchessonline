import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Flame, Zap, Trophy, RefreshCw, Swords } from "lucide-react";

const PUZZLE_MODES = [
  { key: "mateIn1", label: "Mate in 1", difficulty: "Easy" },
  { key: "mateIn2", label: "Mate in 2", difficulty: "Medium" },
  { key: "mateIn3", label: "Mate in 3", difficulty: "Hard" },
  { key: "mateIn4", label: "Mate in 4", difficulty: "Expert" },
  { key: "mateIn5", label: "Mate in 5", difficulty: "Master" },
  { key: "mate", label: "Mixed Mates", difficulty: "Random" },
];

const DailyChallenge = () => {
  const [mode, setMode] = useState("mateIn2");
  const [reloadKey, setReloadKey] = useState(0);

  const src = `https://lichess.org/training/frame/${mode}?theme=brown&bg=dark`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Daily Mate Puzzles
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Solve checkmate puzzles to the very end. Pick your difficulty and sharpen your tactics.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left - Puzzle iframe */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {PUZZLE_MODES.find((m) => m.key === mode)?.label}
                    </h2>
                    <Badge className="bg-destructive/20 text-destructive">
                      {PUZZLE_MODES.find((m) => m.key === mode)?.difficulty}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReloadKey((k) => k + 1)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> New Puzzle
                  </Button>
                </div>

                <div className="rounded-lg overflow-hidden border border-border/50 bg-background">
                  <iframe
                    key={`${mode}-${reloadKey}`}
                    src={src}
                    title="Daily Mate Puzzle"
                    className="w-full block"
                    style={{ height: "560px", border: 0 }}
                    allowTransparency
                  />
                </div>

                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Find the forced mating sequence. You must play every move until checkmate.
                </p>
              </div>

              {/* Mode selector */}
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Swords className="h-4 w-4 text-primary" /> Choose Difficulty
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PUZZLE_MODES.map((m) => (
                    <Button
                      key={m.key}
                      variant={mode === m.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setMode(m.key);
                        setReloadKey((k) => k + 1);
                      }}
                      className="justify-start"
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Sidebar */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" /> How It Works
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• A new mating puzzle loads every time you visit.</li>
                  <li>• You must find every move of the forced mate.</li>
                  <li>• Wrong moves end the attempt — try again with a fresh one.</li>
                  <li>• Difficulty rises with deeper mates (Mate in 3, 4, 5+).</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Tactics Tips
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Look for checks, captures, and threats first.</li>
                  <li>• Identify the king's escape squares.</li>
                  <li>• Sacrifice a piece if it forces mate.</li>
                  <li>• Calculate to the very last move.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-foreground font-semibold mb-1">Train Daily</p>
                <p className="text-[11px] text-muted-foreground">
                  Solving mate puzzles every day is the fastest way to raise your tactical rating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DailyChallenge;
