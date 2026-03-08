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

const ChessboardPreview = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Board */}
          <div className="w-full max-w-md flex-shrink-0">
            <div className="grid grid-cols-8 overflow-hidden rounded-lg border border-border/50 shadow-glow">
              {INITIAL_BOARD.flatMap((row, r) =>
                row.map((piece, c) => {
                  const isLight = (r + c) % 2 === 0;
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl select-none ${
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

          {/* Text */}
          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Play Anytime, <span className="text-gradient-gold">Anywhere</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
              Jump into a game instantly. Whether you have 1 minute or 1 hour, there's always a match waiting for you. Our platform supports all time controls from bullet to correspondence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              {["Bullet", "Blitz", "Rapid", "Classical"].map((mode) => (
                <span
                  key={mode}
                  className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                >
                  {mode}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChessboardPreview;
