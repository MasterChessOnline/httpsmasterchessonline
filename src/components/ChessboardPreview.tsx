import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Zap, Timer, Coffee } from "lucide-react";

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
  { icon: Zap, label: "Bullet", time: "1+0" },
  { icon: Clock, label: "Blitz", time: "5+3" },
  { icon: Timer, label: "Rapid", time: "10+5" },
  { icon: Coffee, label: "Classical", time: "30+0" },
];

const ChessboardPreview = () => {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
          {/* Board */}
          <div className="w-full max-w-sm flex-shrink-0">
            <div className="relative">
              {/* Board glow effect */}
              <div className="absolute -inset-3 rounded-2xl bg-primary/5 blur-xl" />
              <div className="relative grid grid-cols-8 overflow-hidden rounded-2xl border-2 border-border/50 shadow-card">
                {INITIAL_BOARD.flatMap((row, r) =>
                  row.map((piece, c) => {
                    const isLight = (r + c) % 2 === 0;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`aspect-square flex items-center justify-center text-xl sm:text-2xl select-none transition-colors ${
                          isLight ? "bg-board-light" : "bg-board-dark"
                        }`}
                      >
                        {piece ? PIECES[piece] : ""}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center lg:text-left max-w-lg">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">Time Controls</span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Play Anytime, <span className="text-gradient-gold">Anywhere</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
              Jump into a game instantly. Whether you have 1 minute or 1 hour, there's always a match waiting.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {timeControls.map(({ icon: Icon, label, time }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/50 bg-card/80 p-3 text-center hover:border-primary/30 transition-colors group"
                >
                  <Icon className="h-4 w-4 text-primary mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-semibold text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{time}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/play">
                <Button size="lg" className="group shadow-glow">
                  Start a Game
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChessboardPreview;
