// Tools landing pages — high-search-volume long-tail SEO
export interface ToolDef {
  slug: string;
  title: string;
  h1: string;
  short: string;
  description: string;
  long: string;       // 800-1200 chars body copy
  features: string[];
  faqs: { q: string; a: string }[];
  cta: { label: string; to: string };
  searchVolume: string; // for internal reference
  icon: string;       // emoji for quick visual
}

export const TOOLS: ToolDef[] = [
  {
    slug: "pgn-viewer",
    title: "Free PGN Viewer Online — Replay Chess Games | MasterChess",
    h1: "PGN Viewer",
    short: "Paste any PGN and replay the game move by move with annotations.",
    description: "Free online PGN viewer. Paste any chess game in PGN format, replay it move by move, navigate variations, and analyze positions instantly.",
    long: "A PGN (Portable Game Notation) viewer is the standard tool for replaying chess games. Whether you exported a game from Chess.com, Lichess, FIDE database, or your own scoresheet, our PGN viewer renders it on a beautiful board with full navigation: forward, back, jump to move, and branch into variations. Supports comments, NAGs (?, !!, ?!), and clock annotations. No upload needed — just paste the PGN text. Perfect for studying GM games, reviewing tournament losses, or sharing brilliancies with friends. Mobile-friendly and instant.",
    features: ["Paste any PGN text", "Auto-detects variations and comments", "Keyboard navigation (arrow keys)", "Copy FEN at any move", "Share link to specific position", "Works on phone and desktop"],
    faqs: [
      { q: "What is a PGN file?", a: "PGN stands for Portable Game Notation — the standard text format used worldwide to record chess games. It includes moves, headers (player names, date, event), and optional comments." },
      { q: "Where can I get PGN files?", a: "Chess.com, Lichess, and Chessbase all let you download games as PGN. FIDE publishes major tournaments in PGN. You can also write your own from a scoresheet." },
      { q: "Can I view games with variations?", a: "Yes — our viewer parses RAV (Recursive Annotation Variations) and lets you click any sub-line to follow it." },
    ],
    cta: { label: "Open PGN Viewer", to: "/analysis" },
    searchVolume: "27k/mo",
    icon: "📜",
  },
  {
    slug: "fen-editor",
    title: "FEN Editor — Set Up Any Chess Position Online | MasterChess",
    h1: "FEN Editor",
    short: "Build any chess position from scratch. Drag pieces, edit FEN, export to engine.",
    description: "Free FEN editor. Drag pieces onto the board, set turn, castling, and en passant rights, then export FEN or analyze the position with Stockfish.",
    long: "FEN (Forsyth-Edwards Notation) is the standard way to describe a chess position in a single line of text. Our editor lets you build positions visually — drag pieces from the palette, click to remove, set whose turn it is, toggle castling rights, and set en passant target squares. Export the FEN string to share, study, or feed into a chess engine. Useful for composing studies, setting up training positions, or recreating that critical moment from your last game.",
    features: ["Drag-and-drop piece placement", "Full FEN string editor", "Toggle castling rights", "Set en passant square", "Validate position legality", "Send directly to analysis"],
    faqs: [
      { q: "What is FEN notation?", a: "FEN encodes a chess position in 6 fields: piece placement, side to move, castling rights, en passant target, halfmove clock, and fullmove number." },
      { q: "How do I share a position?", a: "Copy the FEN string and paste it anywhere. Our analysis page accepts FEN as a URL parameter." },
    ],
    cta: { label: "Open FEN Editor", to: "/analysis" },
    searchVolume: "8k/mo",
    icon: "🎯",
  },
  {
    slug: "elo-calculator",
    title: "Chess ELO Calculator — Predict Rating Changes | MasterChess",
    h1: "ELO Rating Calculator",
    short: "Calculate exactly how many rating points you'll gain or lose before your next game.",
    description: "Free chess ELO calculator. Enter your rating and your opponent's rating to see expected score and potential ELO change for win/draw/loss.",
    long: "The ELO formula was created by Arpad Elo and powers FIDE, Chess.com, Lichess, and most rating systems. Our calculator uses the standard K-factor model: enter your current rating, your opponent's rating, the K-factor (40 for new players, 20 for experienced, 10 for masters), and instantly see the expected score and rating delta for each result. Useful for tournament preparation, deciding whether to risk a higher-rated opponent, or just understanding why beating a 1200 only gave you 4 points.",
    features: ["Standard FIDE ELO formula", "Adjustable K-factor (10/20/40)", "Win, draw, loss outcomes", "Multi-game tournament estimator", "Performance rating calculator", "Mobile-friendly"],
    faqs: [
      { q: "What is K-factor?", a: "K-factor controls how quickly your rating changes. New players use K=40 (faster), experienced players K=20, top masters K=10 (slower, more stable)." },
      { q: "Why is online ELO different from FIDE?", a: "Chess.com and Lichess use modified Glicko/ELO systems that update faster and start at different anchor points. Online ratings tend to run 200-400 above FIDE." },
    ],
    cta: { label: "Open Calculator", to: "/rating-calculator" },
    searchVolume: "14k/mo",
    icon: "📊",
  },
  {
    slug: "chess-clock",
    title: "Online Chess Clock — Free Digital Timer | MasterChess",
    h1: "Online Chess Clock",
    short: "Free digital chess clock with all standard time controls. No download required.",
    description: "Free online chess clock. Bullet, blitz, rapid, classical with increment and delay. Tap to switch sides. Works on phone, tablet, and desktop.",
    long: "Whether you're playing over-the-board chess at home, in a coffee shop, or at a club without a physical clock, our free online chess clock has you covered. Choose from 13 standard time controls (1+0 bullet to 90+30 classical) or set your own custom time + increment. Tap your side of the screen to switch. Includes Fischer increment, Bronstein delay, and simple delay modes. The clock pauses on game start, plays a chime at low time, and locks the clock when time expires.",
    features: ["13 preset time controls", "Custom time + increment", "Fischer / Bronstein / simple delay", "Low-time warning sound", "Pause and resume", "Fullscreen mobile mode"],
    faqs: [
      { q: "What is increment?", a: "Increment adds a fixed number of seconds to your clock after each move. Fischer increment (e.g. 3+2 means 3 minutes + 2 seconds per move) prevents flagging in won positions." },
      { q: "What's the difference between increment and delay?", a: "Increment adds time. Delay holds your clock still for X seconds before counting down — your time doesn't grow." },
    ],
    cta: { label: "Open Chess Clock", to: "/play" },
    searchVolume: "33k/mo",
    icon: "⏱️",
  },
  {
    slug: "notation-converter",
    title: "Chess Notation Converter — PGN, FEN, UCI | MasterChess",
    h1: "Notation Converter",
    short: "Convert between PGN, FEN, UCI, SAN, and LAN chess notation formats.",
    description: "Free chess notation converter. Translate moves between PGN, FEN, UCI (engine), SAN (e4), and LAN (e2-e4) formats instantly.",
    long: "Chess uses several notation systems and they don't always play nicely together. Our converter handles all the major formats: SAN (Standard Algebraic Notation — what humans write: 'e4', 'Nf3'), LAN (Long Algebraic: 'e2-e4'), UCI (engine format: 'e2e4'), PGN (full game), and FEN (single position). Paste in one format, get the others instantly. Useful when feeding moves to an engine, importing from old chess software, or preparing data for a chess library.",
    features: ["SAN ↔ UCI ↔ LAN", "Paste PGN, get FEN at any move", "Validate move legality", "Batch convert", "Copy with one click"],
    faqs: [
      { q: "What is UCI notation?", a: "UCI (Universal Chess Interface) uses long algebraic without piece letters: 'e2e4', 'g1f3'. Engines like Stockfish speak UCI." },
      { q: "Why is my SAN move ambiguous?", a: "When two pieces could move to the same square, SAN disambiguates with file/rank: 'Nbd2' means knight from b-file moves to d2." },
    ],
    cta: { label: "Open Converter", to: "/chess-tools" },
    searchVolume: "3k/mo",
    icon: "🔁",
  },
  {
    slug: "blunder-checker",
    title: "Blunder Checker — Free Chess Mistake Detector | MasterChess",
    h1: "Blunder Checker",
    short: "Paste your game. Stockfish flags every blunder, mistake, and missed brilliancy.",
    description: "Free Stockfish-powered blunder checker. Paste your PGN and instantly see every blunder (??), mistake (?), inaccuracy (?!), and missed brilliancy (!!).",
    long: "The fastest way to improve at chess is to find and learn from your blunders. Our Stockfish-powered blunder checker analyzes every move in your game at depth 18+, classifies each one (best, excellent, good, inaccuracy, mistake, blunder, brilliant), and shows the line you missed. Free, unlimited, no signup. Particularly useful after a tilt session — review the games while the lessons are fresh.",
    features: ["Stockfish 16 NNUE evaluation", "All 6 move classifications", "Best-line refutation", "Win-percent change per move", "Color-coded annotation symbols", "Export annotated PGN"],
    faqs: [
      { q: "What counts as a blunder?", a: "A move that drops the win percentage by more than 30 points (e.g., from +60% to +28%). Mistakes drop 15-30 points, inaccuracies 5-15." },
      { q: "Is it free?", a: "Yes — Stockfish runs in your browser via WASM. No quota, no signup." },
    ],
    cta: { label: "Open Blunder Checker", to: "/analysis" },
    searchVolume: "5k/mo",
    icon: "🚨",
  },
  {
    slug: "opening-explorer",
    title: "Chess Opening Explorer — 60+ Lines with Stats | MasterChess",
    h1: "Opening Explorer",
    short: "Browse opening lines with master statistics, win rates, and popular continuations.",
    description: "Free chess opening explorer. Click through any opening tree, see master win rates, popular moves, and prepare your repertoire.",
    long: "Every grandmaster builds their game around a deep opening repertoire. Our opening explorer lets you browse 60+ named openings tree by tree, see what masters play in each position, and check win rates for White, Black, and draws. Backed by the Lichess opening database (millions of master games). Useful for repertoire building, opening prep before a tournament, or just learning what theory looks like in your favorite line.",
    features: ["60+ named openings", "Master game statistics", "Win-rate per move", "Popular continuations", "Filter by player level", "Save lines to your repertoire"],
    faqs: [
      { q: "Where does the data come from?", a: "Lichess opening database — millions of games filtered to 2200+ rated players. Updated monthly." },
      { q: "Can I save lines?", a: "Yes — sign up to build a personal repertoire across multiple openings." },
    ],
    cta: { label: "Open Explorer", to: "/openings" },
    searchVolume: "12k/mo",
    icon: "🌳",
  },
  {
    slug: "stockfish-online",
    title: "Stockfish Online — Free Chess Engine in Browser | MasterChess",
    h1: "Stockfish Online",
    short: "Run Stockfish 16 NNUE in your browser. No install. Analyze any position.",
    description: "Free Stockfish online. Paste a FEN or PGN, get the best move, top 5 lines, and evaluation in seconds. No download or signup required.",
    long: "Stockfish is the strongest open-source chess engine in the world (~3600 ELO). We compile it to WebAssembly so it runs entirely in your browser — no server round-trips, no quotas, no signup. Paste any FEN or PGN and get evaluation, top 5 moves (multi-PV), and forced sequences. Adjust depth from quick (12) to deep (24+). Perfect for checking your idea, finding tactics in puzzles, or settling that 'what was the best move?' debate.",
    features: ["Stockfish 16 NNUE", "Runs locally in browser", "Adjustable depth (12-30)", "Multi-PV (top 5 lines)", "FEN and PGN input", "Mobile-friendly"],
    faqs: [
      { q: "Is it really Stockfish?", a: "Yes — official Stockfish 16 source compiled to WebAssembly. Slightly slower than native because of WASM overhead, but identical evaluation." },
      { q: "Why doesn't it work on my phone?", a: "Older phones may lack SharedArrayBuffer support needed for multi-threaded WASM. Most phones from 2020+ work fine." },
    ],
    cta: { label: "Open Stockfish", to: "/analysis" },
    searchVolume: "22k/mo",
    icon: "🐟",
  },
  {
    slug: "checkmate-finder",
    title: "Mate-in-N Finder — Find Forced Checkmates | MasterChess",
    h1: "Mate-in-N Finder",
    short: "Paste any position. Stockfish finds the forced mate in 1 to 8 moves.",
    description: "Free mate finder. Paste a FEN or position. Stockfish searches for forced checkmates and shows the exact move sequence.",
    long: "Some positions hide a forced mate that's almost impossible to spot under tournament pressure. Our mate finder uses Stockfish's depth-first search with mate scoring to find any forced mate up to depth 8 — including underpromotion, smothered, and discovered-check mates. Paste your FEN, set the search depth, and get the full mating line. Great for verifying combinations, composing problems, or checking whether you missed a forced win.",
    features: ["Mate in 1 to 8", "Full mating line shown", "Underpromotion detection", "Discovered-check support", "Paste FEN or position", "Free and unlimited"],
    faqs: [
      { q: "How long does it take?", a: "Mate in 1-3 is instant. Mate in 5+ can take 5-30 seconds depending on position complexity." },
      { q: "What if there's no forced mate?", a: "The tool reports 'no forced mate found within depth N' and suggests increasing the depth." },
    ],
    cta: { label: "Open Mate Finder", to: "/analysis" },
    searchVolume: "4k/mo",
    icon: "♚",
  },
  {
    slug: "chess-board",
    title: "Online Chess Board — Free Interactive Setup | MasterChess",
    h1: "Online Chess Board",
    short: "Set up positions, drag pieces, save FENs. Free interactive chess board.",
    description: "Free online interactive chess board. Drag pieces, set up positions, save FENs, and share with friends. No download required.",
    long: "Sometimes you just need a board on screen — to study a problem from a book, to show a friend a tactic, to set up a teaching position. Our online chess board does exactly that. Click to drop pieces, drag to move, right-click for arrows and highlights (just like Chess.com and Lichess). Save the FEN, share via URL, or send to analysis. Mobile-friendly, no signup, no ads.",
    features: ["Drag-and-drop pieces", "Right-click arrows and highlights", "Flip board", "Save and load FEN", "Share via URL", "Touch-optimized for mobile"],
    faqs: [
      { q: "Can I use it offline?", a: "Yes — once loaded, the board works offline. Service Worker caches it." },
      { q: "Can I print the position?", a: "Use your browser's print function — the board renders cleanly on paper." },
    ],
    cta: { label: "Open Board", to: "/analysis" },
    searchVolume: "18k/mo",
    icon: "♛",
  },
];

export const getToolBySlug = (slug: string) => TOOLS.find(t => t.slug === slug);
