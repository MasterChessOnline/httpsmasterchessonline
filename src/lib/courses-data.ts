export interface Lesson {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  fen?: string; // optional board position to illustrate
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
  lessons: Lesson[];
}

export const COURSES: Course[] = [
  {
    id: "opening-fundamentals",
    title: "Opening Fundamentals",
    description: "Master the key opening principles and popular systems.",
    level: "Beginner",
    icon: "BookOpen",
    lessons: [
      {
        id: "of-1",
        title: "Control the Center",
        content: "The center squares (e4, d4, e5, d5) are the most important squares on the board. Controlling them gives your pieces maximum mobility and flexibility. Start by advancing your e-pawn or d-pawn two squares forward.",
        keyPoints: ["Place pawns on e4/d4", "Central pawns control key squares", "Avoid moving the same piece twice early"],
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      },
      {
        id: "of-2",
        title: "Develop Your Pieces",
        content: "After establishing center control, bring your knights and bishops into the game. Knights should typically go to f3/c3 (or f6/c6 for Black). Bishops should be placed on active diagonals where they can influence the game.",
        keyPoints: ["Knights before bishops", "Develop toward the center", "Don't move the queen too early"],
        fen: "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2",
      },
      {
        id: "of-3",
        title: "Castle Early",
        content: "Castling serves two purposes: it moves your king to safety behind a wall of pawns, and it connects your rooks. Try to castle within the first 10 moves. Kingside castling (O-O) is usually safer than queenside (O-O-O).",
        keyPoints: ["King safety is paramount", "Castle within 10 moves", "Don't move pawns in front of castled king"],
        fen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      },
      {
        id: "of-4",
        title: "The Italian Game",
        content: "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) is one of the oldest and most natural openings. White develops the bishop to c4, targeting the weak f7 square. It leads to rich tactical play.",
        keyPoints: ["Targets f7 pawn", "Natural development", "Good for beginners to learn"],
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      },
      {
        id: "of-5",
        title: "The Sicilian Defense",
        content: "The Sicilian Defense (1.e4 c5) is the most popular response to 1.e4 at all levels. Black immediately fights for the center asymmetrically. It leads to sharp, unbalanced positions with chances for both sides.",
        keyPoints: ["Asymmetric pawn structure", "Black fights for d4 control", "Sharp tactical play"],
        fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
      },
    ],
  },
  {
    id: "tactical-patterns",
    title: "Tactical Patterns",
    description: "Learn forks, pins, skewers, discovered attacks, and more.",
    level: "Intermediate",
    icon: "Target",
    lessons: [
      {
        id: "tp-1",
        title: "The Fork",
        content: "A fork is when a single piece attacks two or more enemy pieces simultaneously. Knights are especially good at forking because they attack in an unusual pattern that's hard to defend against. The most devastating fork is a royal fork — attacking both the king and queen.",
        keyPoints: ["One piece attacks two+ pieces", "Knights are natural forkers", "Look for undefended pieces on same color"],
      },
      {
        id: "tp-2",
        title: "The Pin",
        content: "A pin occurs when an attacking piece restricts the movement of a defending piece because moving it would expose a more valuable piece behind it. An absolute pin is against the king (the pinned piece cannot legally move). A relative pin is against another piece.",
        keyPoints: ["Bishops and rooks create pins", "Absolute pins are against the king", "Exploit pinned pieces — they can't move"],
      },
      {
        id: "tp-3",
        title: "The Skewer",
        content: "A skewer is the reverse of a pin: the more valuable piece is in front, and when it moves, the less valuable piece behind is captured. Skewers are most effective along diagonals (bishops) and ranks/files (rooks, queens).",
        keyPoints: ["Reverse of a pin", "Valuable piece is attacked first", "Common in endgames with rooks"],
      },
      {
        id: "tp-4",
        title: "Discovered Attack",
        content: "A discovered attack happens when one piece moves out of the way, revealing an attack from a piece behind it. If the piece that moves also delivers a threat, it's called a discovered check or double attack — extremely powerful.",
        keyPoints: ["Moving piece reveals hidden attacker", "Discovered checks are very powerful", "Can win material with double threats"],
      },
      {
        id: "tp-5",
        title: "Double Check",
        content: "A double check occurs when two pieces give check simultaneously. The only way to escape a double check is to move the king — you cannot block or capture both checking pieces. This makes double checks extremely dangerous.",
        keyPoints: ["Two pieces check at once", "King MUST move", "Often leads to checkmate"],
      },
      {
        id: "tp-6",
        title: "Deflection & Decoy",
        content: "Deflection forces a defending piece away from its important task. Decoy lures a piece to a specific square where it becomes vulnerable. Both tactics work by exploiting overloaded defenders.",
        keyPoints: ["Force defenders away from key squares", "Decoy to create weaknesses", "Look for overloaded pieces"],
      },
    ],
  },
  {
    id: "endgame-mastery",
    title: "Endgame Mastery",
    description: "King and pawn endings, rook endings, and theoretical draws.",
    level: "Advanced",
    icon: "Crown",
    lessons: [
      {
        id: "em-1",
        title: "King & Pawn vs King",
        content: "The most fundamental endgame. The key concept is 'opposition' — when kings stand facing each other with one square between them. The player NOT to move has the opposition, which is an advantage. With opposition, the attacking king can shepherd the pawn to promotion.",
        keyPoints: ["Opposition is key", "King must lead the pawn", "Know the drawing zone"],
        fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
      },
      {
        id: "em-2",
        title: "The Lucena Position",
        content: "The Lucena position is the most important winning technique in rook endings. With a rook and a pawn on the 7th rank (with the king in front), you win by 'building a bridge' — using your rook to shield the king from checks.",
        keyPoints: ["Build a bridge with the rook", "King shelters behind rook", "Must know this position by heart"],
        fen: "1K1k4/1P6/8/8/8/8/2r5/5R2 w - - 0 1",
      },
      {
        id: "em-3",
        title: "The Philidor Position",
        content: "The Philidor position is the most important defensive technique in rook endings. The defending side keeps the rook on the 6th rank to prevent the enemy king from advancing, then switches to checking from behind once the pawn advances.",
        keyPoints: ["Rook on 6th rank blocks king", "Switch to checks from behind", "Key defensive drawing technique"],
        fen: "4k3/8/4r3/8/8/8/3KP3/8R w - - 0 1",
      },
      {
        id: "em-4",
        title: "Passed Pawn Endgames",
        content: "A passed pawn is a pawn with no enemy pawns blocking or able to capture it. In endgames, passed pawns are extremely powerful. The rule of the square helps determine if a king can catch a passed pawn. Outside passed pawns are particularly strong as decoys.",
        keyPoints: ["Passed pawns must be pushed", "Rule of the square for calculation", "Outside passed pawn = winning advantage"],
      },
      {
        id: "em-5",
        title: "Bishop vs Knight Endgames",
        content: "Bishops are generally better in open positions with pawns on both sides. Knights are better in closed positions. A bishop can control squares of only one color, so pawns should be placed on the opposite color. Knights need outpost squares to be effective.",
        keyPoints: ["Bishop prefers open positions", "Knight needs outposts", "Wrong color bishop can draw"],
      },
    ],
  },
  {
    id: "positional-play",
    title: "Positional Play",
    description: "Understand pawn structures, outposts, and piece activity.",
    level: "Intermediate",
    icon: "Layout",
    lessons: [
      {
        id: "pp-1",
        title: "Pawn Structure Basics",
        content: "Pawns are the soul of chess. Your pawn structure determines piece placement, plans, and endgame prospects. Key structures include: isolated pawns (weak but give piece activity), doubled pawns (usually weak), and pawn chains (strong diagonal formations).",
        keyPoints: ["Pawns determine the game's character", "Avoid creating weaknesses", "Pawn moves are permanent"],
      },
      {
        id: "pp-2",
        title: "Outposts",
        content: "An outpost is a square that cannot be attacked by enemy pawns, where you can place a piece (especially a knight). Outposts on the 5th or 6th rank are extremely strong. Creating and occupying outposts is a key positional strategy.",
        keyPoints: ["Safe from pawn attacks", "Knights love outposts", "5th/6th rank outposts are powerful"],
      },
      {
        id: "pp-3",
        title: "Piece Activity",
        content: "Active pieces are more valuable than passive ones. A bishop blocked by its own pawns is a 'bad bishop.' Rooks belong on open files and the 7th rank. Always ask: are my pieces doing something useful?",
        keyPoints: ["Active pieces > passive pieces", "Rooks on open files", "Avoid bad bishops"],
      },
      {
        id: "pp-4",
        title: "Weak Squares & Color Complexes",
        content: "When pawns advance, they leave behind weak squares that can never be controlled by pawns again. If many weak squares share the same color, that's a weak color complex. The opponent's bishop of that color becomes extremely strong.",
        keyPoints: ["Pawn moves create permanent weaknesses", "Watch for color complex weaknesses", "Place pieces on opponent's weak squares"],
      },
      {
        id: "pp-5",
        title: "Space Advantage",
        content: "Having more space means your pieces have more room to maneuver. A space advantage restricts the opponent's pieces. However, overextension is a risk — advanced pawns can become targets if not supported.",
        keyPoints: ["More space = more options", "Don't overextend", "Cramped positions need exchanges"],
      },
    ],
  },
  {
    id: "checkmate-patterns",
    title: "Checkmate Patterns",
    description: "Recognize and execute the most common mating patterns.",
    level: "Beginner",
    icon: "Crosshair",
    lessons: [
      {
        id: "cm-1",
        title: "Back Rank Mate",
        content: "The back rank mate occurs when a rook or queen checkmates a king trapped on its first rank by its own pawns. This is one of the most common tactical themes. Always be aware of back rank vulnerability — consider creating a 'luft' (escape square) for your king.",
        keyPoints: ["King trapped by own pawns", "Rook or queen delivers mate", "Create an escape square (h3/g3)"],
        fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
      },
      {
        id: "cm-2",
        title: "Scholar's Mate",
        content: "Scholar's Mate (1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6?? 4.Qxf7#) targets the f7 square. While it's easily defended, understanding it teaches the importance of protecting f7/f2 and not ignoring threats.",
        keyPoints: ["Targets weak f7 square", "Easily defended with knowledge", "Teaches threat awareness"],
        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
      },
      {
        id: "cm-3",
        title: "Smothered Mate",
        content: "Smothered mate is a checkmate delivered by a knight when the enemy king is completely surrounded by its own pieces. The classic pattern involves a knight check on the back rank while the king cannot escape because friendly pieces block all escape squares.",
        keyPoints: ["Knight delivers the final blow", "King blocked by own pieces", "Often involves a queen sacrifice"],
      },
      {
        id: "cm-4",
        title: "Arabian Mate",
        content: "The Arabian mate uses a rook and knight working together. The knight controls escape squares while the rook delivers checkmate, typically in the corner. This is one of the oldest known mating patterns.",
        keyPoints: ["Rook and knight coordinate", "Usually in the corner", "Knight covers escape squares"],
      },
      {
        id: "cm-5",
        title: "Anastasia's Mate",
        content: "Anastasia's mate typically occurs when a knight on e7 and a rook on the h-file combine to checkmate the king on h8 or g8. The knight cuts off escape while the rook delivers the final blow along the h-file.",
        keyPoints: ["Knight + rook combination", "h-file attack", "King trapped on the edge"],
      },
    ],
  },
  {
    id: "strategy-masterclass",
    title: "Strategy Masterclass",
    description: "Deep strategic concepts for serious improvement.",
    level: "Advanced",
    icon: "Brain",
    lessons: [
      {
        id: "sm-1",
        title: "Prophylaxis",
        content: "Prophylaxis means preventing the opponent's plans before improving your own position. Ask 'What does my opponent want to do?' before each move. Great players like Karpov and Petrosian were masters of prophylactic thinking.",
        keyPoints: ["Ask what opponent wants", "Prevent before improving", "Key skill of world champions"],
      },
      {
        id: "sm-2",
        title: "Pawn Breaks",
        content: "A pawn break is a pawn advance that challenges the opponent's pawn structure. Timing the break correctly is crucial — too early can be premature, too late can be too slow. Common breaks: c4 in the Queen's Gambit, f5 in the King's Indian.",
        keyPoints: ["Timing is everything", "Opens lines for pieces", "Changes the pawn structure"],
      },
      {
        id: "sm-3",
        title: "Piece Exchanges",
        content: "Knowing when to exchange pieces is a critical skill. Generally: exchange pieces when ahead in material, exchange attacking pieces when under pressure, keep pieces when you have the initiative. Bad pieces should be exchanged for good ones.",
        keyPoints: ["Exchange when ahead", "Keep active pieces", "Trade bad pieces for good ones"],
      },
      {
        id: "sm-4",
        title: "The Two Bishops Advantage",
        content: "Having both bishops (the 'bishop pair') is a significant advantage, especially in open positions. The two bishops control squares of both colors and become increasingly powerful as the position opens up and pieces get exchanged.",
        keyPoints: ["Bishop pair is strong in open games", "Gets stronger with fewer pieces", "Worth about half a pawn extra"],
      },
      {
        id: "sm-5",
        title: "Minority Attack",
        content: "A minority attack is when you advance pawns on a wing where you have fewer pawns than your opponent, aiming to create weaknesses. The classic example is advancing b4-b5 against a c6-d5 pawn structure to create an isolated pawn.",
        keyPoints: ["Advance fewer pawns against more", "Creates structural weaknesses", "Classic queenside strategy"],
      },
    ],
  },
];
