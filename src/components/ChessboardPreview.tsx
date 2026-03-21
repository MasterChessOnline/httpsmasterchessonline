import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Zap, Timer, Coffee, Crown } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useState, useEffect } from "react";

const PIECES: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const INITIAL_BOARD = [
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"],
];

const timeControls = [
  { icon: Zap, label: "Bullet", time: "1+0", desc: "Fast & furious", color: "from-red-500/10 to-red-500/5" },
  { icon: Clock, label: "Blitz", time: "5+3", desc: "Most popular", color: "from-primary/10 to-primary/5", popular: true },
  { icon: Timer, label: "Rapid", time: "10+5", desc: "Think deeper", color: "from-emerald/10 to-emerald/5" },
  { icon: Coffee, label: "Classical", time: "30+0", desc: "Full strategy", color: "from-accent/10 to-accent/5" },
];

// Animate a sample game
const sampleMoves = [
  { from: [6,4], to: [4,4] }, // e4
  { from: [1,4], to: [3,4] }, // e5
  { from: [7,6], to: [5,5] }, // Nf3
  { from: [0,1], to: [2,2] }, // Nc6
];

const ChessboardPreview = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [moveIdx, setMoveIdx] = useState(0);
  const [lastMove, setLastMove] = useState<{from: number[], to: number[]} | null>(null);

  useEffect(() => {
    if (moveIdx >= sampleMoves.length) return;
    const timeout = setTimeout(() => {
      const move = sampleMoves[moveIdx];
      setBoard(prev => {
        const next = prev.map(row => [...row]);
        next[move.to[0]][move.to[1]] = next[move.from[0]][move.from[1]];
        next[move.from[0]][move.from[1]] = "";
        return next;
      });
      setLastMove(move);
      setMoveIdx(i => i + 1);
    }, 1500 + moveIdx * 800);
    return () => clearTimeout(timeout);
  }, [moveIdx]);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
          <ScrollReveal direction="left" className="w-full max-w-sm flex-shrink-0">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-border/50 shadow-card group-hover:shadow-glow-lg transition-shadow duration-700">
                {/* Player bar top */}
                <div className="flex items-center justify-between px-3 py-2 bg-card/90 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px]">♟</div>
                    <span className="text-xs font-semibold text-foreground">Opponent</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">1350</span>
                </div>
                
                <div className="grid grid-cols-8">
                  {board.flatMap((row, r) =>
                    row.map((piece, c) => {
                      const isLight = (r + c) % 2 === 0;
                      const isLastFrom = lastMove?.from[0] === r && lastMove?.from[1] === c;
                      const isLastTo = lastMove?.to[0] === r && lastMove?.to[1] === c;
                      return (
                        <motion.div
                          key={`${r}-${c}`}
                          className={`aspect-square flex items-center justify-center text-xl sm:text-2xl select-none relative ${
                            isLight ? "bg-board-light" : "bg-board-dark"
                          }`}
                          whileHover={piece ? { scale: 1.15, zIndex: 10 } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          {/* Highlight last move */}
                          {(isLastFrom || isLastTo) && (
                            <motion.div
                              className="absolute inset-0 bg-primary/20"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          {piece ? (
                            <motion.span
                              className="cursor-pointer drop-shadow-lg relative z-10"
                              initial={{ opacity: 0, scale: 0 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: (r * 8 + c) * 0.01, duration: 0.3, type: "spring" }}
                              layout
                            >
                              {PIECES[piece]}
                            </motion.span>
                          ) : ""}
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Player bar bottom */}
                <div className="flex items-center justify-between px-3 py-2 bg-card/90 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">
                      <Crown className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-primary">You</span>
                  </div>
                  <span className="text-xs font-mono text-primary font-bold">1200</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.15} className="text-center lg:text-left max-w-lg">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">Time Controls</span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Play Anytime, <span className="text-gradient-gold">Anywhere</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
              Jump into a game instantly. Whether you have 1 minute or 1 hour, there's always a match waiting.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {timeControls.map(({ icon: Icon, label, time, desc, color, popular }, i) => (
                <motion.div
                  key={label}
                  className={`relative rounded-xl border border-border/50 bg-card/80 p-4 text-center hover:border-primary/30 transition-all duration-300 group cursor-pointer overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  {popular && (
                    <span className="absolute top-1 right-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                      Popular
                    </span>
                  )}
                  <div className="relative">
                    <Icon className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-bold text-foreground">{label}</div>
                    <div className="text-base font-display font-bold text-primary">{time}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/play">
                <Button size="lg" className="group shadow-glow btn-glow animate-glow-pulse">
                  Start a Game
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ChessboardPreview;
