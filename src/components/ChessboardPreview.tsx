import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Zap, Timer, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

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
  { icon: Zap, label: "Bullet", time: "1+0", desc: "Fast & furious" },
  { icon: Clock, label: "Blitz", time: "5+3", desc: "Most popular" },
  { icon: Timer, label: "Rapid", time: "10+5", desc: "Think deeper" },
  { icon: Coffee, label: "Classical", time: "30+0", desc: "Full strategy" },
];

const ChessboardPreview = () => {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
          <ScrollReveal direction="left" className="w-full max-w-sm flex-shrink-0">
            <div className="relative group">
              {/* Board glow effect */}
              <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
              <div className="relative grid grid-cols-8 overflow-hidden rounded-2xl border-2 border-border/50 shadow-card group-hover:shadow-glow-lg transition-shadow duration-700">
                {INITIAL_BOARD.flatMap((row, r) =>
                  row.map((piece, c) => {
                    const isLight = (r + c) % 2 === 0;
                    return (
                      <motion.div
                        key={`${r}-${c}`}
                        className={`aspect-square flex items-center justify-center text-xl sm:text-2xl select-none ${
                          isLight ? "bg-board-light" : "bg-board-dark"
                        }`}
                        whileHover={piece ? { scale: 1.25, zIndex: 10 } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        {piece ? (
                          <motion.span
                            initial={{ opacity: 0, scale: 0, rotate: -20 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (r * 8 + c) * 0.012, duration: 0.4, type: "spring" }}
                            className="cursor-pointer drop-shadow-lg"
                          >
                            {PIECES[piece]}
                          </motion.span>
                        ) : ""}
                      </motion.div>
                    );
                  })
                )}
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
              {timeControls.map(({ icon: Icon, label, time, desc }, i) => (
                <motion.div
                  key={label}
                  className="rounded-xl border border-border/50 bg-card/80 p-4 text-center hover:border-primary/30 transition-all duration-300 group cursor-pointer card-cinematic"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-foreground">{label}</div>
                  <div className="text-base font-display font-bold text-primary">{time}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{desc}</div>
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
