// Checkmate patterns — programmatic SEO for "X mate" searches
export interface MatePattern {
  slug: string;
  name: string;
  short: string;
  long: string;
  fen: string;        // example position
  moves: string;      // forced mate sequence in SAN
  era?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  searchVolume: string;
}

export const MATE_PATTERNS: MatePattern[] = [
  {
    slug: "back-rank-mate",
    name: "Back-Rank Mate",
    short: "Checkmate on the 1st or 8th rank because the king is trapped behind its own pawns.",
    long: "The most common mate in real games at every level — beginner to grandmaster. After castling, the king's escape squares (h2, g2, f2 for White) are blocked by its own pawns. A single rook or queen on the back rank delivers mate. The defense is 'luft' — pushing h3 or g3 to give the king air. Always check for back-rank weaknesses before trading queens or simplifying into an endgame. The Capablanca-Bernstein 1914 game is the textbook example.",
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    moves: "1. Ra8#",
    difficulty: "beginner",
    searchVolume: "9k/mo",
  },
  {
    slug: "smothered-mate",
    name: "Smothered Mate",
    short: "Checkmate by a knight where the king is surrounded by its own pieces.",
    long: "The most beautiful pattern in chess. The classic sequence — Philidor's Legacy — sacrifices the queen to force the smothered mate: 1.Qe6+ Kh8 2.Nf7+ Kg8 3.Nh6+ Kh8 4.Qg8+! Rxg8 5.Nf7#. The knight is the only piece that can deliver smothered mate because only knights jump over pieces. Look for it whenever the enemy king sits in the corner with its own pieces around it.",
    fen: "6rk/5Npp/8/8/8/8/8/6K1 w - - 0 1",
    moves: "1. Nf7#",
    era: "Philidor 1749",
    difficulty: "intermediate",
    searchVolume: "12k/mo",
  },
  {
    slug: "anastasia-mate",
    name: "Anastasia's Mate",
    short: "A knight and rook combine to mate a king on the side of the board.",
    long: "Named after Wilhelm Heinse's novel 'Anastasia und Schachspiel' (1803). The pattern: knight on e7 controls g6 and c6, rook delivers mate on h-file (or a-file) where the king is trapped on h7. Often arises from kingside attacks against a fianchettoed setup. A two-move pattern that's lethal once the knight reaches e7.",
    fen: "5rk1/4N1pp/8/8/8/8/8/3R3K w - - 0 1",
    moves: "1. Rd8+ Rxd8 2. Nh6#",
    difficulty: "intermediate",
    searchVolume: "5k/mo",
  },
  {
    slug: "boden-mate",
    name: "Boden's Mate",
    short: "Two bishops cross-fire to mate a castled king.",
    long: "Discovered in the Schulder-Boden 1853 game. Two bishops on intersecting diagonals trap a king that has castled queenside (or kingside, mirrored). The classic setup: White bishops on b5 and h6, Black king on c8, mate is Bxa6#. Often preceded by a queen sacrifice to clear lines. Memorable and rare — but appears more often than you'd think against unprepared queenside-castled kings.",
    fen: "1nbk3r/ppp2ppp/8/8/4B3/8/PPPP1PPP/R1B1K2R w KQ - 0 1",
    moves: "1. Bxa6#",
    era: "Schulder-Boden 1853",
    difficulty: "advanced",
    searchVolume: "3k/mo",
  },
  {
    slug: "legal-mate",
    name: "Légal's Mate",
    short: "A queen sacrifice followed by three minor pieces delivering checkmate.",
    long: "The oldest recorded brilliancy (Légal de Kermeur, 1750). Pattern: White plays Nxe5! sacrificing the queen to a pinned knight (Bg4 pin), and after Bxd1 the mate is Bxf7+ Ke7 Nd5#. The lesson: never pin a knight that has tactical resources, and never grab the queen if the position is wide open. Common trap in the Italian Game and Philidor Defense.",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1",
    moves: "1. Nxe5 (Légal trap setup)",
    era: "Légal 1750",
    difficulty: "intermediate",
    searchVolume: "7k/mo",
  },
  {
    slug: "arabian-mate",
    name: "Arabian Mate",
    short: "A knight and rook deliver mate to a king in the corner.",
    long: "One of the oldest known mates — described in Arabic chess manuscripts from the 9th century. The knight on f6 (or h6) covers escape squares while the rook gives check on h-file. Particularly common in the endgame because rooks become more active and corner kings are vulnerable. The minimum material to force this mate is just king + rook + knight against a lone king.",
    fen: "7k/8/5N2/8/8/8/8/6KR w - - 0 1",
    moves: "1. Rh1#",
    difficulty: "intermediate",
    searchVolume: "4k/mo",
  },
  {
    slug: "scholars-mate",
    name: "Scholar's Mate",
    short: "The classic 4-move beginner mate: 1.e4 e5 2.Bc4 Bc5 3.Qh5 Nf6?? 4.Qxf7#.",
    long: "Every chess player learns Scholar's Mate twice — once when they fall for it, and again when they try it. The bishop and queen team up against the f7 pawn, defended only by the king. Easily prevented with 3...Qe7 or 3...g6 attacking the queen. Don't bring your queen out early — but do know this trap to set it for unprepared opponents and refute it as Black.",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/2B1P2Q/8/PPPP1PPP/RNB1K1NR b KQkq - 4 3",
    moves: "1. e4 e5 2. Bc4 Bc5 3. Qh5 Nf6?? 4. Qxf7#",
    difficulty: "beginner",
    searchVolume: "85k/mo",
  },
  {
    slug: "fools-mate",
    name: "Fool's Mate",
    short: "The fastest possible checkmate in chess: 1.f3 e5 2.g4 Qh4#.",
    long: "Two moves. The shortest possible checkmate in chess. White weakens the diagonal toward the king (f3 and g4) and Black's queen swoops in. Almost no one falls for it in real games, but every beginner needs to see it once to internalize how dangerous early king exposure is. The lesson: don't move the f or g pawn early — protect the diagonal toward your king.",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 2",
    moves: "1. f3 e5 2. g4 Qh4#",
    difficulty: "beginner",
    searchVolume: "60k/mo",
  },
  {
    slug: "hook-mate",
    name: "Hook Mate",
    short: "Knight, rook, pawn, and king combine to mate a sideways-trapped king.",
    long: "An advanced pattern: a knight is supported by a pawn, the rook delivers check, and the king's only escape is blocked. Common in attacking middlegames where one side has pushed pawns near the enemy king. Hook mate teaches piece coordination — every defender plays a role.",
    fen: "5rk1/4Np1p/6N1/8/8/8/8/4R2K w - - 0 1",
    moves: "1. Re8#",
    difficulty: "advanced",
    searchVolume: "2k/mo",
  },
  {
    slug: "damiano-mate",
    name: "Damiano's Mate",
    short: "A queen and supporting pawn deliver mate against a king pushed to the corner.",
    long: "Pedro Damiano (1512). The pattern: rook sacrifice on h-file forces the king to h8, then queen delivers mate on h-file supported by a pawn on g6. Demonstrates how a single supporting pawn can be the key to forcing mate — and why pushing pawns toward the enemy king is so dangerous for the defender.",
    fen: "5rk1/6P1/6K1/8/8/8/8/7Q w - - 0 1",
    moves: "1. Qh7#",
    era: "Damiano 1512",
    difficulty: "intermediate",
    searchVolume: "1k/mo",
  },
  {
    slug: "morphy-mate",
    name: "Morphy's Mate",
    short: "A bishop delivers mate after a rook sacrifice clears the diagonal.",
    long: "Named after Paul Morphy. A rook is sacrificed on the back rank to clear a diagonal, and a bishop delivers mate on the long diagonal pointing at the king. Common pattern in opposite-side castling attacks where one side opens lines on the king with sacrifices.",
    fen: "6k1/5p2/6p1/8/8/8/3B4/6K1 w - - 0 1",
    moves: "1. Bh6#",
    era: "Morphy 1850s",
    difficulty: "intermediate",
    searchVolume: "1k/mo",
  },
  {
    slug: "epaulette-mate",
    name: "Epaulette Mate",
    short: "A king is mated because its own rooks block its escape squares.",
    long: "The king sits between two of its own rooks (or pieces) on the back rank, like the shoulder pads (epaulettes) of an old military uniform. A queen delivers check from in front and the king has nowhere to go because its own pieces block the escape. Often arises from miscalculated rook trades.",
    fen: "3rkr2/8/4Q3/8/8/8/8/6K1 w - - 0 1",
    moves: "1. Qe7#",
    difficulty: "intermediate",
    searchVolume: "2k/mo",
  },
];

export const getMateBySlug = (slug: string) => MATE_PATTERNS.find(m => m.slug === slug);
