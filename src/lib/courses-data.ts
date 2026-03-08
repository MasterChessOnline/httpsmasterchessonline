export interface PracticeMove {
  move: string;       // SAN notation e.g. "e4"
  explanation: string; // shown after correct move
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  fen?: string;
  practiceLine?: {
    startFen?: string; // defaults to starting position
    playerColor: "w" | "b";
    moves: PracticeMove[]; // the moves the student must find (alternating with auto-responses)
    autoResponses: string[]; // opponent responses after each student move (SAN)
    completionMessage: string;
  };
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
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "e4", explanation: "Great! 1.e4 — control the center with your king's pawn." },
            { move: "d4", explanation: "2.d4! Now you occupy both central squares." },
          ],
          autoResponses: ["e5", "exd4"],
          completionMessage: "Excellent! You've learned the basics of center control.",
        },
      },
      {
        id: "of-2",
        title: "Develop Your Pieces",
        content: "After establishing center control, bring your knights and bishops into the game. Knights should typically go to f3/c3 (or f6/c6 for Black). Bishops should be placed on active diagonals where they can influence the game.",
        keyPoints: ["Knights before bishops", "Develop toward the center", "Don't move the queen too early"],
        fen: "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2",
        practiceLine: {
          startFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
          playerColor: "w",
          moves: [
            { move: "Nf3", explanation: "1.Nf3 — develop the knight toward the center, attacking e5." },
            { move: "Bc4", explanation: "2.Bc4 — the bishop targets the weak f7 square." },
          ],
          autoResponses: ["Nc6", "Nf6"],
          completionMessage: "Well done! Knights and bishops developed efficiently.",
        },
      },
      {
        id: "of-3",
        title: "Castle Early",
        content: "Castling serves two purposes: it moves your king to safety behind a wall of pawns, and it connects your rooks. Try to castle within the first 10 moves. Kingside castling (O-O) is usually safer than queenside (O-O-O).",
        keyPoints: ["King safety is paramount", "Castle within 10 moves", "Don't move pawns in front of castled king"],
        fen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        practiceLine: {
          startFen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
          playerColor: "w",
          moves: [
            { move: "O-O", explanation: "Castling kingside! Your king is safe and your rook is now connected." },
          ],
          autoResponses: [],
          completionMessage: "Perfect! You've castled early and secured your king.",
        },
      },
      {
        id: "of-4",
        title: "The Italian Game",
        content: "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) is one of the oldest and most natural openings. White develops the bishop to c4, targeting the weak f7 square. It leads to rich tactical play.",
        keyPoints: ["Targets f7 pawn", "Natural development", "Good for beginners to learn"],
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "e4", explanation: "1.e4 — start by controlling the center." },
            { move: "Nf3", explanation: "2.Nf3 — develop your knight and attack e5." },
            { move: "Bc4", explanation: "3.Bc4 — the Italian Game! Targeting the f7 pawn." },
          ],
          autoResponses: ["e5", "Nc6", "Bc5"],
          completionMessage: "You've played the Italian Game opening! This is a classic setup for beginners.",
        },
      },
      {
        id: "of-5",
        title: "The Sicilian Defense",
        content: "The Sicilian Defense (1.e4 c5) is the most popular response to 1.e4 at all levels. Black immediately fights for the center asymmetrically. It leads to sharp, unbalanced positions with chances for both sides.",
        keyPoints: ["Asymmetric pawn structure", "Black fights for d4 control", "Sharp tactical play"],
        fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "c5", explanation: "1...c5 — the Sicilian Defense! Fighting for the d4 square." },
            { move: "d6", explanation: "2...d6 — solid development, preparing for Nf6." },
            { move: "Nf6", explanation: "3...Nf6 — developing the knight and attacking the e4 pawn." },
          ],
          autoResponses: ["Nf3", "d4", "Nc3"],
          completionMessage: "You've played the Sicilian Defense! The most popular response to 1.e4.",
        },
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
  {
    id: "queens-gambit",
    title: "The Queen's Gambit",
    description: "Master the most classical 1.d4 opening system with both White and Black.",
    level: "Intermediate",
    icon: "Crown",
    lessons: [
      {
        id: "qg-1",
        title: "Queen's Gambit Basics",
        content: "The Queen's Gambit (1.d4 d5 2.c4) is one of the oldest and most respected openings. White offers a pawn to gain central control. Despite its name, it's not a true gambit — Black can't hold the pawn easily.",
        keyPoints: ["1.d4 d5 2.c4 — offer a pawn for center control", "Not a true gambit", "One of the most classical openings"],
        fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "d4", explanation: "1.d4 — control the center with the queen's pawn." },
            { move: "c4", explanation: "2.c4 — the Queen's Gambit! Challenging Black's center." },
            { move: "Nc3", explanation: "3.Nc3 — develop the knight, supporting the center." },
          ],
          autoResponses: ["d5", "e6", "Nf6"],
          completionMessage: "You've played the Queen's Gambit! A classical and powerful opening.",
        },
      },
      {
        id: "qg-2",
        title: "Queen's Gambit Declined",
        content: "In the QGD (1.d4 d5 2.c4 e6), Black declines the gambit and builds a solid center. This leads to strategic, positional games. The key plan for White is to develop pieces and prepare e4.",
        keyPoints: ["Black plays e6 to support d5", "Solid but slightly passive for Black", "White aims for e4 break"],
        fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "d4", explanation: "1.d4 — start the Queen's Gambit." },
            { move: "c4", explanation: "2.c4 — challenge the center." },
            { move: "Nc3", explanation: "3.Nc3 — develop and pressure d5." },
            { move: "Bg5", explanation: "4.Bg5 — pin the knight! Classic QGD move." },
          ],
          autoResponses: ["d5", "e6", "Nf6", "Be7"],
          completionMessage: "The Queen's Gambit Declined — a battleground of strategic ideas!",
        },
      },
      {
        id: "qg-3",
        title: "Queen's Gambit Accepted",
        content: "In the QGA (1.d4 d5 2.c4 dxc4), Black takes the pawn. White should not rush to recapture — instead develop pieces and win it back naturally. Black often struggles to hold the pawn.",
        keyPoints: ["Black takes on c4", "Don't rush to recapture", "White gets strong center with e4"],
        fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "d4", explanation: "1.d4 — start with the queen's pawn." },
            { move: "c4", explanation: "2.c4 — offer the Queen's Gambit." },
            { move: "Nf3", explanation: "3.Nf3 — develop first, don't rush to recapture!" },
            { move: "e3", explanation: "4.e3 — preparing Bxc4 to win the pawn back." },
          ],
          autoResponses: ["d5", "dxc4", "Nf6", "e6"],
          completionMessage: "Queen's Gambit Accepted — you'll win the pawn back with better development!",
        },
      },
      {
        id: "qg-4",
        title: "Slav Defense",
        content: "The Slav Defense (1.d4 d5 2.c4 c6) is Black's most solid response to the Queen's Gambit. Black supports d5 with c6, keeping the light-squared bishop free. It's favored by many world champions.",
        keyPoints: ["c6 supports d5 solidly", "Keeps light-squared bishop active", "Favorite of world champions"],
        fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "d5", explanation: "1...d5 — meet White's center directly." },
            { move: "c6", explanation: "2...c6 — the Slav! Supporting d5 solidly." },
            { move: "Nf6", explanation: "3...Nf6 — natural development." },
            { move: "Bf5", explanation: "4...Bf5 — develop the bishop BEFORE playing e6!" },
          ],
          autoResponses: ["c4", "Nf3", "Nc3", "e3"],
          completionMessage: "The Slav Defense — rock solid with an active bishop!",
        },
      },
    ],
  },
  {
    id: "ruy-lopez",
    title: "The Ruy Lopez",
    description: "The 'Spanish Game' — the most classical e4 e5 opening.",
    level: "Intermediate",
    icon: "BookOpen",
    lessons: [
      {
        id: "rl-1",
        title: "Ruy Lopez Basics",
        content: "The Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5) is one of the most important openings in chess. The bishop on b5 puts pressure on the knight that defends e5, creating long-term tension.",
        keyPoints: ["3.Bb5 pressures the e5 defender", "Creates long-term strategic tension", "Played at the highest levels for centuries"],
        fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "e4", explanation: "1.e4 — king's pawn opening." },
            { move: "Nf3", explanation: "2.Nf3 — attack the e5 pawn." },
            { move: "Bb5", explanation: "3.Bb5 — the Ruy Lopez! Pressuring the knight on c6." },
            { move: "Ba4", explanation: "4.Ba4 — maintain the pin, retreat the bishop to safety." },
          ],
          autoResponses: ["e5", "Nc6", "a6", "Nf6"],
          completionMessage: "The Ruy Lopez — a timeless classical opening!",
        },
      },
      {
        id: "rl-2",
        title: "The Morphy Defense",
        content: "After 3.Bb5 a6, Black plays the Morphy Defense, asking the bishop what it wants to do. White usually retreats with Ba4, maintaining pressure. This is the most common line in the Ruy Lopez.",
        keyPoints: ["3...a6 challenges the bishop", "White retreats Ba4", "Most common continuation"],
        fen: "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "e4", explanation: "1.e4 — start the game." },
            { move: "Nf3", explanation: "2.Nf3 — develop and attack." },
            { move: "Bb5", explanation: "3.Bb5 — the Ruy Lopez." },
            { move: "Ba4", explanation: "4.Ba4 — maintain the tension." },
            { move: "O-O", explanation: "5.O-O — castle early, classic Ruy Lopez." },
          ],
          autoResponses: ["e5", "Nc6", "a6", "Nf6", "Be7"],
          completionMessage: "The Morphy Defense — you've mastered the main line!",
        },
      },
      {
        id: "rl-3",
        title: "The Berlin Defense",
        content: "The Berlin Defense (3...Nf6) became famous after Kramnik used it to beat Kasparov for the World Championship. It leads to an endgame after 4.O-O Nxe4 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5 — the 'Berlin Wall.'",
        keyPoints: ["3...Nf6 — the Berlin Defense", "Leads to safe endgame for Black", "Used by Kramnik to become World Champion"],
        fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "e5", explanation: "1...e5 — mirror White's center." },
            { move: "Nc6", explanation: "2...Nc6 — defend the pawn." },
            { move: "Nf6", explanation: "3...Nf6 — the Berlin Defense! Counter-attacking e4." },
          ],
          autoResponses: ["Nf3", "Bb5", "O-O"],
          completionMessage: "The Berlin Defense — a world championship weapon!",
        },
      },
    ],
  },
  {
    id: "kings-indian",
    title: "The King's Indian Defense",
    description: "A hypermodern fighting system for Black against 1.d4.",
    level: "Advanced",
    icon: "Brain",
    lessons: [
      {
        id: "ki-1",
        title: "King's Indian Setup",
        content: "The King's Indian Defense (1.d4 Nf6 2.c4 g6) is a hypermodern opening where Black allows White to build a big center, then attacks it. Black fianchettos the bishop on g7 and prepares a kingside attack with ...e5 and ...f5.",
        keyPoints: ["Let White build the center, then attack it", "Fianchetto the dark-squared bishop", "Prepare ...e5 and ...f5 pawn storm"],
        fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "Nf6", explanation: "1...Nf6 — flexible knight development." },
            { move: "g6", explanation: "2...g6 — preparing to fianchetto the bishop." },
            { move: "Bg7", explanation: "3...Bg7 — the bishop on the long diagonal! Powerful." },
            { move: "O-O", explanation: "4...O-O — castle and prepare the kingside attack." },
          ],
          autoResponses: ["c4", "Nc3", "e4", "Nf3"],
          completionMessage: "The King's Indian setup — ready for a kingside assault!",
        },
      },
      {
        id: "ki-2",
        title: "The Classical Variation",
        content: "In the Classical KID, after 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2, Black plays ...e5 to challenge the center. The typical plan is ...Nc6-d7, ...f5, and a kingside pawn storm.",
        keyPoints: ["...e5 challenges the center", "Regroup knight to d7", "...f5 launches the attack"],
        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQq - 5 6",
        practiceLine: {
          startFen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQq - 5 6",
          playerColor: "b",
          moves: [
            { move: "e5", explanation: "6...e5! Challenge the center — the main idea." },
            { move: "Nc6", explanation: "7...Nc6 — develop and prepare to reroute to d7." },
            { move: "Nd7", explanation: "8...Nd7 — clear the f-file for the f5 push!" },
          ],
          autoResponses: ["O-O", "d5", "Be3"],
          completionMessage: "Classical King's Indian — your kingside attack is brewing!",
        },
      },
      {
        id: "ki-3",
        title: "The Sämisch Variation",
        content: "The Sämisch (1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3) is White's aggressive system. White plays f3 to support e4 and prepares Be3 + Qd2 + O-O-O for a queenside attack. Black must counter quickly on the kingside.",
        keyPoints: ["White plays f3 for a strong center", "White often castles queenside", "Both sides attack on opposite wings"],
        fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq - 0 5",
        practiceLine: {
          startFen: "rnbqkb1r/ppp1pp1p/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq - 0 5",
          playerColor: "b",
          moves: [
            { move: "O-O", explanation: "5...O-O — get your king to safety first." },
            { move: "c5", explanation: "6...c5! — strike at the center before White consolidates." },
          ],
          autoResponses: ["Be3", "Nge2"],
          completionMessage: "Fighting the Sämisch — you know how to counter White's aggression!",
        },
      },
    ],
  },
  {
    id: "french-defense",
    title: "The French Defense",
    description: "A solid and strategic defense against 1.e4 for Black.",
    level: "Intermediate",
    icon: "Layout",
    lessons: [
      {
        id: "fr-1",
        title: "French Defense Basics",
        content: "The French Defense (1.e4 e6) is a solid, strategic opening for Black. After 2.d4 d5, Black creates a pawn chain and fights for the center. The main challenge is the light-squared bishop, which is often blocked behind the pawns.",
        keyPoints: ["1...e6 — solid but slightly passive", "Creates a strong pawn chain", "The light-squared bishop problem"],
        fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "e6", explanation: "1...e6 — the French Defense! Solid and strategic." },
            { move: "d5", explanation: "2...d5 — challenge the center directly." },
            { move: "Nf6", explanation: "3...Nf6 — develop and attack e4." },
          ],
          autoResponses: ["d4", "Nc3", "e5"],
          completionMessage: "The French Defense — solid and full of strategic ideas!",
        },
      },
      {
        id: "fr-2",
        title: "The Advance Variation",
        content: "After 1.e4 e6 2.d4 d5 3.e5, White advances and gains space. Black's plan is to attack the pawn chain with ...c5, chipping away at d4. The position becomes very strategic with clear plans for both sides.",
        keyPoints: ["White gains space with e5", "Black attacks the chain with ...c5", "Clear strategic plans for both sides"],
        fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
        practiceLine: {
          startFen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
          playerColor: "b",
          moves: [
            { move: "c5", explanation: "3...c5! — attack the base of White's pawn chain." },
            { move: "Nc6", explanation: "4...Nc6 — develop and pressure d4." },
            { move: "Qb6", explanation: "5...Qb6 — attack the b2 and d4 pawns." },
          ],
          autoResponses: ["c3", "Nf3", "Be2"],
          completionMessage: "The Advance French — you know how to attack the pawn chain!",
        },
      },
      {
        id: "fr-3",
        title: "The Winawer Variation",
        content: "The Winawer (1.e4 e6 2.d4 d5 3.Nc3 Bb4) is the sharpest line of the French. Black pins the knight and provokes complications. After 4.e5 c5 5.a3 Bxc3+ 6.bxc3, White has the bishop pair but doubled pawns.",
        keyPoints: ["3...Bb4 pins the knight", "Very sharp and tactical", "Leads to imbalanced positions"],
        fen: "rnbqk1nr/pppp1ppp/4p3/8/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "e6", explanation: "1...e6 — the French Defense." },
            { move: "d5", explanation: "2...d5 — challenge the center." },
            { move: "Bb4", explanation: "3...Bb4 — the Winawer! Pin the knight aggressively." },
            { move: "c5", explanation: "4...c5 — attack the center, classic French play." },
          ],
          autoResponses: ["d4", "Nc3", "e5", "a3"],
          completionMessage: "The Winawer French — sharp, tactical, and ambitious!",
        },
      },
    ],
  },
  {
    id: "caro-kann",
    title: "The Caro-Kann Defense",
    description: "A rock-solid defense against 1.e4 — favored by world champions.",
    level: "Intermediate",
    icon: "Target",
    lessons: [
      {
        id: "ck-1",
        title: "Caro-Kann Basics",
        content: "The Caro-Kann (1.e4 c6) prepares ...d5 while keeping the light-squared bishop free (unlike the French). It's one of the most solid defenses, used by Karpov, Anand, and many other champions.",
        keyPoints: ["1...c6 prepares ...d5", "Bishop stays active (unlike French)", "Ultra-solid and reliable"],
        fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "c6", explanation: "1...c6 — the Caro-Kann! Preparing d5." },
            { move: "d5", explanation: "2...d5 — challenge the center." },
            { move: "Bf5", explanation: "3...Bf5 — develop the bishop OUTSIDE the pawn chain!" },
          ],
          autoResponses: ["d4", "Nc3", "Nf3"],
          completionMessage: "The Caro-Kann — solid as a rock with an active bishop!",
        },
      },
      {
        id: "ck-2",
        title: "The Classical Variation",
        content: "After 1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5, Black develops the bishop to its ideal square. White often plays Ng3 to chase the bishop. The position is solid and strategic.",
        keyPoints: ["Take on e4 to open the position", "Bf5 is the key developing move", "Solid strategic play"],
        fen: "rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5",
        practiceLine: {
          startFen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
          playerColor: "b",
          moves: [
            { move: "dxe4", explanation: "3...dxe4 — capture to open the position." },
            { move: "Bf5", explanation: "4...Bf5 — the star move! Bishop is active outside the chain." },
            { move: "Bg6", explanation: "5...Bg6 — retreat the bishop to a safe square." },
          ],
          autoResponses: ["Nxe4", "Ng3", "h4"],
          completionMessage: "Classical Caro-Kann — your bishop is perfectly placed!",
        },
      },
    ],
  },
  {
    id: "london-system",
    title: "The London System",
    description: "A universal opening system for White — easy to learn, hard to crack.",
    level: "Beginner",
    icon: "BookOpen",
    lessons: [
      {
        id: "ls-1",
        title: "London System Setup",
        content: "The London System (1.d4, 2.Bf4, 3.e3, 4.Nf3, 5.Bd3) is a flexible, easy-to-learn system. White develops the dark-squared bishop to f4 before playing e3, avoiding it getting locked in. It works against almost any Black setup.",
        keyPoints: ["Bf4 before e3 — don't trap the bishop!", "Works against nearly everything", "Safe, solid, and easy to play"],
        fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "d4", explanation: "1.d4 — start the London System." },
            { move: "Bf4", explanation: "2.Bf4 — develop the bishop BEFORE e3!" },
            { move: "e3", explanation: "3.e3 — now solidify the center." },
            { move: "Nf3", explanation: "4.Nf3 — natural development." },
            { move: "Bd3", explanation: "5.Bd3 — complete the London setup! All pieces developed." },
          ],
          autoResponses: ["d5", "Nf6", "e6", "c5", "Nc6"],
          completionMessage: "The London System — simple, effective, and solid!",
        },
      },
      {
        id: "ls-2",
        title: "London vs King's Indian",
        content: "When Black plays a King's Indian setup (...Nf6, ...g6, ...Bg7), the London remains effective. White plays Nbd2, c3, and prepares e4 when the time is right.",
        keyPoints: ["Same setup works against KID", "Nbd2 supports e4", "c3 reinforces the center"],
        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/3P1B2/4PN2/PPPN1PPP/R2QKB1R w KQ - 0 6",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "d4", explanation: "1.d4 — begin the London." },
            { move: "Bf4", explanation: "2.Bf4 — always develop this bishop first." },
            { move: "e3", explanation: "3.e3 — solid center." },
            { move: "Nf3", explanation: "4.Nf3 — develop naturally." },
            { move: "Nbd2", explanation: "5.Nbd2 — support a future e4 push." },
          ],
          autoResponses: ["Nf6", "g6", "Bg7", "O-O", "d6"],
          completionMessage: "London vs King's Indian — you know the plan!",
        },
      },
    ],
  },
  {
    id: "english-opening",
    title: "The English Opening",
    description: "A flexible 1.c4 system — the reversed Sicilian for White.",
    level: "Advanced",
    icon: "Brain",
    lessons: [
      {
        id: "en-1",
        title: "English Opening Basics",
        content: "The English Opening (1.c4) is a flexible, positional system. White controls the d5 square and can transpose into many different structures. It's essentially a reversed Sicilian with an extra tempo.",
        keyPoints: ["1.c4 controls d5", "Extremely flexible — many transpositions", "Reversed Sicilian concept"],
        fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "c4", explanation: "1.c4 — the English Opening! Control d5." },
            { move: "Nc3", explanation: "2.Nc3 — develop and reinforce control of d5." },
            { move: "g3", explanation: "3.g3 — prepare to fianchetto the bishop." },
            { move: "Bg2", explanation: "4.Bg2 — bishop on the long diagonal, very powerful." },
          ],
          autoResponses: ["e5", "Nf6", "Nc6", "Bb4"],
          completionMessage: "The English Opening — flexible and full of potential!",
        },
      },
      {
        id: "en-2",
        title: "Symmetrical English",
        content: "After 1.c4 c5, both sides mirror each other. White typically plays Nc3, g3, Bg2, aiming for a Maroczy Bind (c4 + e4) or transposing to a Hedgehog structure.",
        keyPoints: ["1...c5 mirrors White", "Aim for Maroczy Bind (c4 + e4)", "Strategic and positional"],
        fen: "rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq c6 0 2",
        practiceLine: {
          playerColor: "w",
          moves: [
            { move: "c4", explanation: "1.c4 — the English." },
            { move: "Nc3", explanation: "2.Nc3 — develop centrally." },
            { move: "g3", explanation: "3.g3 — fianchetto coming." },
            { move: "Bg2", explanation: "4.Bg2 — powerful bishop on the diagonal." },
            { move: "e4", explanation: "5.e4! — the Maroczy Bind! Controlling d5 completely." },
          ],
          autoResponses: ["c5", "Nc6", "g6", "Bg7", "d6"],
          completionMessage: "The Maroczy Bind — total control of the center!",
        },
      },
    ],
  },
  {
    id: "scandinavian-defense",
    title: "The Scandinavian Defense",
    description: "A direct and aggressive response to 1.e4 — simple and effective.",
    level: "Beginner",
    icon: "Crosshair",
    lessons: [
      {
        id: "sc-1",
        title: "Scandinavian Basics",
        content: "The Scandinavian (1.e4 d5) immediately challenges White's center. After 2.exd5 Qxd5 3.Nc3, the queen must move — but Black gets rapid development. It's simple and direct.",
        keyPoints: ["1...d5 immediately challenges e4", "Queen comes out early but develops fast", "Simple plans for Black"],
        fen: "rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "d5", explanation: "1...d5 — the Scandinavian! Direct challenge." },
            { move: "Qxd5", explanation: "2...Qxd5 — recapture with the queen." },
            { move: "Qa5", explanation: "3...Qa5 — safe square for the queen, eyeing e1." },
            { move: "Nf6", explanation: "4...Nf6 — develop and attack the center." },
          ],
          autoResponses: ["exd5", "Nc3", "d4", "Nf3"],
          completionMessage: "The Scandinavian — direct, simple, and effective!",
        },
      },
      {
        id: "sc-2",
        title: "The Modern Scandinavian",
        content: "Instead of 2...Qxd5, Black can play 2...Nf6 — the Modern Scandinavian. Black delays recapturing the pawn to develop faster. After 3.d4 Nxd5, the knight is well-placed and Black has a flexible position.",
        keyPoints: ["2...Nf6 delays recapture", "Knight on d5 is well-placed", "More modern approach"],
        fen: "rnbqkb1r/ppp1pppp/5n2/3P4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "d5", explanation: "1...d5 — challenge the center." },
            { move: "Nf6", explanation: "2...Nf6 — the Modern Scandinavian! Develop first." },
            { move: "Nxd5", explanation: "3...Nxd5 — recapture with the knight, well-placed." },
          ],
          autoResponses: ["exd5", "d4", "Nf3"],
          completionMessage: "Modern Scandinavian — flexible and dynamic!",
        },
      },
    ],
  },
  {
    id: "dutch-defense",
    title: "The Dutch Defense",
    description: "An aggressive counter to 1.d4 — fighting for the initiative as Black.",
    level: "Advanced",
    icon: "Crosshair",
    lessons: [
      {
        id: "du-1",
        title: "Dutch Defense Basics",
        content: "The Dutch Defense (1.d4 f5) is an aggressive, unbalanced response to 1.d4. Black immediately stakes a claim on the kingside and prepares for a kingside attack. It's risky but full of attacking chances.",
        keyPoints: ["1...f5 fights for e4 control", "Commits to kingside play", "Risky but very aggressive"],
        fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq f6 0 2",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "f5", explanation: "1...f5 — the Dutch! Aggressive and bold." },
            { move: "Nf6", explanation: "2...Nf6 — develop naturally." },
            { move: "g6", explanation: "3...g6 — the Leningrad Dutch! Fianchetto the bishop." },
            { move: "Bg7", explanation: "4...Bg7 — powerful bishop on the long diagonal." },
          ],
          autoResponses: ["c4", "Nc3", "g3", "Bg2"],
          completionMessage: "The Leningrad Dutch — aggressive and full of fight!",
        },
      },
      {
        id: "du-2",
        title: "The Stonewall Dutch",
        content: "The Stonewall (pawns on d5, e6, f5, c6) creates an impregnable center. The knight goes to e4 (an incredible outpost), and Black attacks on the kingside. The downside is the dark-squared bishop is often passive.",
        keyPoints: ["Pawns on d5-e6-f5-c6 form a wall", "Knight on e4 is dream outpost", "Dark-squared bishop problem"],
        fen: "rnbq1rk1/ppp1b1pp/4pn2/3p1p2/2PP4/5NP1/PP2PPBP/RNBQK2R w KQ - 0 6",
        practiceLine: {
          startFen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
          playerColor: "b",
          moves: [
            { move: "f5", explanation: "1...f5 — Dutch Defense!" },
            { move: "Nf6", explanation: "2...Nf6 — develop." },
            { move: "e6", explanation: "3...e6 — building the Stonewall." },
            { move: "d5", explanation: "4...d5 — the wall is complete! d5-e6-f5." },
          ],
          autoResponses: ["c4", "g3", "Bg2", "Nf3"],
          completionMessage: "The Stonewall Dutch — an unbreakable fortress!",
        },
      },
    ],
  },
];

