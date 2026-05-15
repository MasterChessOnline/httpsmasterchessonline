// Long-form SEO content. Each guide ~600+ words across sections.
type Section = { heading: string; body: string };
type GuideEntry = { title: string; description: string; sections: Section[] };

const openingGuide = (name: string, moves: string, idea: string, lines: string[]): GuideEntry => ({
  title: `${name} — Complete Guide & Repertoire`,
  description: `Learn the ${name}: main ideas, key variations, common traps, and how to play it at every level on MasterChess.`,
  sections: [
    {
      heading: "Why Play the " + name,
      body: `The ${name} (${moves}) is one of the most reliable weapons in modern chess. ${idea}\n\nThis guide is built around real human play — no engine spoon-feeding. You'll learn the structures, the ideas, and the practical decisions to make when your opponent goes off-book.`,
    },
    {
      heading: "Main Ideas",
      body: `Every opening is a fight for three things: development, the center, and king safety. The ${name} addresses these in a specific order, and understanding that order matters more than memorizing twenty moves.\n\n${idea}\n\nThink of the opening as a setup — your job is to reach a middlegame you understand better than your opponent.`,
    },
    {
      heading: "Key Variations",
      body: lines.map((l) => "• " + l).join("\n\n"),
    },
    {
      heading: "Common Traps & Mistakes",
      body: `Most rating points in the opening are lost to early piece blunders, neglecting king safety, and chasing material on the queenside while the center collapses.\n\nIn the ${name} specifically, watch for premature pawn pushes that weaken your king, and keep an eye on opponent's queen and bishop diagonals. If you're down to your last 2 minutes in blitz, simplify into structures you've practiced.`,
    },
    {
      heading: "How to Practice on MasterChess",
      body: `Open the Opening Trainer, pick the ${name}, and play 10 rated games online with it this week. Then review your games — without engine assistance during play — to lock in the patterns. Real games beat puzzles every time.`,
    },
  ],
});

const ratingGuide = (target: number, prev: number): GuideEntry => ({
  title: `How to Reach ${target} ELO in Chess`,
  description: `A practical roadmap to climb from ${prev} to ${target} ELO: what to study, what to play, and what to ignore.`,
  sections: [
    {
      heading: `What ${target} ELO Actually Means`,
      body: `${target} is not a magic number — it's a marker. At this level, players make fewer one-move blunders, calculate 2–3 moves ahead consistently, and recognize basic endgames.\n\nIf you're stuck around ${prev}, the gap is almost never about openings. It's about how you handle quiet positions, how fast you blunder under time pressure, and whether you actually finish endgames.`,
    },
    {
      heading: "The 80/20 Plan",
      body: `Spend 80% of your time playing — full-length games, 10+0 or longer. Spend 20% reviewing without an engine first. Pick one opening for White, one for Black against 1.e4, one against 1.d4. That's it. Stop switching.\n\nDo NOT grind tactics puzzles in isolation. They train pattern recognition in a vacuum and your real games suffer because you don't see them in context. Play and review.`,
    },
    {
      heading: "Endgames That Actually Matter",
      body: `K+P vs K, opposition, the square of the pawn, basic rook endgames (Lucena, Philidor) — these alone separate ${prev} from ${target}. Spend two evenings on them and your conversion rate jumps.`,
    },
    {
      heading: "Time Management",
      body: `If you're flagging in 10+0, switch to 15+10 until your decision quality stabilizes. Use the increment to think on opponent's time. Most blunders happen between move 20–30 when both players are tired — that's when you need to slow down, not speed up.`,
    },
    {
      heading: "Tracking Progress",
      body: `On MasterChess your rating, win rate, and play personality are tracked automatically. Check your stats weekly — not daily. Daily fluctuations are noise. Focus on the 30-day trend.`,
    },
  ],
});

const skillGuide = (title: string, intro: string, sections: Section[]): GuideEntry => ({
  title,
  description: intro,
  sections,
});

export const GUIDES: Record<string, GuideEntry> = {
  "italian-game": openingGuide(
    "Italian Game",
    "1.e4 e5 2.Nf3 Nc6 3.Bc4",
    "It targets f7, develops fast, and leads to rich middlegames where understanding beats memorization.",
    ["Giuoco Piano: 3...Bc5 4.c3 — slow buildup, central breaks", "Two Knights: 3...Nf6 4.Ng5 — sharp, requires precision", "Evans Gambit: 4.b4 — romantic and dangerous"],
  ),
  "ruy-lopez": openingGuide("Ruy Lopez", "1.e4 e5 2.Nf3 Nc6 3.Bb5",
    "The most respected open game. Long-term pressure on Black's center.",
    ["Berlin Defense: 3...Nf6 — solid, drawish at top level", "Closed Ruy: 3...a6 4.Ba4 Nf6 5.O-O Be7", "Open Ruy: 5...Nxe4 — sharp counterplay"]),
  "sicilian-defense": openingGuide("Sicilian Defense", "1.e4 c5",
    "Black's most ambitious answer to 1.e4 — fights for the win from move one.",
    ["Najdorf: 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6", "Dragon: 5...g6 — sharp, theoretical", "Kan/Taimanov: 4...e6 — flexible"]),
  "french-defense": openingGuide("French Defense", "1.e4 e6",
    "Solid, strategic, and rich in pawn-structure ideas.",
    ["Advance: 2.d4 d5 3.e5", "Tarrasch: 3.Nd2", "Winawer: 3.Nc3 Bb4"]),
  "caro-kann": openingGuide("Caro-Kann", "1.e4 c6",
    "Solid as granite. Trades early aggression for a healthy structure.",
    ["Classical: 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5", "Advance: 3.e5 Bf5", "Exchange: 3.exd5 cxd5"]),
  "queens-gambit": openingGuide("Queen's Gambit", "1.d4 d5 2.c4",
    "The classical fight for the center — accepted or declined, both lead to deep games.",
    ["QGA: 2...dxc4", "QGD: 2...e6", "Slav: 2...c6"]),
  "kings-indian": openingGuide("King's Indian Defense", "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7",
    "Black gives up the center temporarily, then strikes back with ...e5 or ...c5.",
    ["Mar del Plata: 7.O-O Nc6 8.d5 Ne7 — kingside attack", "Saemisch: 5.f3", "Fianchetto: 5.Nf3 O-O 6.g3"]),
  "nimzo-indian": openingGuide("Nimzo-Indian Defense", "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4",
    "One of Black's most respected defenses — pressures White's center with pieces.",
    ["Rubinstein: 4.e3", "Classical: 4.Qc2", "Saemisch: 4.a3"]),
  "english-opening": openingGuide("English Opening", "1.c4",
    "Flexible, modern, and avoids most of Black's prepared lines against 1.d4.",
    ["Symmetrical: 1...c5", "Reversed Sicilian: 1...e5", "Anglo-Indian: 1...Nf6"]),
  "london-system": openingGuide("London System", "1.d4 d5 2.Nf3 Nf6 3.Bf4",
    "Easy to learn, hard to refute — a system you can play against almost anything.",
    ["Classical setup with c3, e3, Bd3, Nbd2", "Jobava London: 2.Nc3 Nf6 3.Bf4 — sharper", "Anti-King's-Indian setup"]),
  "scandinavian": openingGuide("Scandinavian Defense", "1.e4 d5",
    "Direct, simple, and you get the position you want by move 2.",
    ["Main line: 2.exd5 Qxd5 3.Nc3 Qa5", "Modern: 2...Nf6", "Portuguese: 2...Nf6 3.d4 Bg4"]),
  "pirc-defense": openingGuide("Pirc Defense", "1.e4 d6 2.d4 Nf6 3.Nc3 g6",
    "Hypermodern — let White build the center, then strike at it.",
    ["Austrian Attack: 4.f4", "Classical: 4.Nf3 Bg7 5.Be2", "150 Attack: 4.Be3 Bg7 5.Qd2"]),
  "alekhine-defense": openingGuide("Alekhine Defense", "1.e4 Nf6",
    "Provoke White's pawns forward, then dismantle them.",
    ["Four Pawns Attack: 2.e5 Nd5 3.d4 d6 4.c4 Nb6 5.f4", "Modern: 4.Nf3", "Exchange: 4.c4 Nb6 5.exd6"]),
  "scotch-game": openingGuide("Scotch Game", "1.e4 e5 2.Nf3 Nc6 3.d4",
    "Open the position immediately. Less theory than the Ruy Lopez.",
    ["Classical: 3...exd4 4.Nxd4 Bc5", "Schmidt: 4...Nf6", "Mieses: 4...Nf6 5.Nxc6 bxc6 6.e5 Qe7"]),
  "vienna-game": openingGuide("Vienna Game", "1.e4 e5 2.Nc3",
    "Underrated and full of attacking ideas, especially for club play.",
    ["Vienna Gambit: 2...Nf6 3.f4", "Falkbeer: 2...Nf6 3.Bc4", "Mieses Variation: 2...Nf6 3.g3"]),

  "beginner-800": ratingGuide(800, 400),
  "1000-elo": ratingGuide(1000, 800),
  "1200-elo": ratingGuide(1200, 1000),
  "1400-elo": ratingGuide(1400, 1200),
  "1600-elo": ratingGuide(1600, 1400),
  "1800-elo": ratingGuide(1800, 1600),
  "2000-elo": ratingGuide(2000, 1800),
  "2200-elo": ratingGuide(2200, 2000),

  "endgame-king-pawn": skillGuide(
    "King & Pawn Endgames Made Simple",
    "Master the most fundamental endgame — opposition, the square, and key squares.",
    [
      { heading: "The Square of the Pawn", body: "If your king can step inside the imaginary square of an unsupported passed pawn, you catch it. Memorize this — it decides hundreds of endgames every year." },
      { heading: "Opposition", body: "Two kings face each other with one square between. Whoever does NOT have to move wins (or holds). Practice this in 5 positions and you'll never lose another K+P endgame you should draw." },
      { heading: "Key Squares", body: "For a pawn on its 5th rank or further, the three squares directly in front are key squares. Get your king there — you win." },
      { heading: "Drill It", body: "Set up K+P vs K positions on MasterChess and play them out. 20 minutes of this is worth 200 puzzles." },
    ],
  ),
  "endgame-rook": skillGuide(
    "Rook Endgames Made Simple",
    "Lucena, Philidor, and the active rook principle — the three things that win or save most rook endgames.",
    [
      { heading: "Activity Beats Material", body: "An active rook on the 7th rank is worth a pawn. Always. Before counting material, look at where the rooks are." },
      { heading: "The Lucena Position", body: "K+R+P vs K+R, your pawn is one square from promoting, your king is in front of it. Build a bridge with your rook. Win." },
      { heading: "The Philidor Position", body: "Defending side: keep your rook on the third rank until the enemy pawn arrives, then check from behind. Draw." },
      { heading: "The 20-Minute Drill", body: "Practice both positions five times each. You'll save dozens of points over the next year." },
    ],
  ),
  "middlegame-plans": skillGuide(
    "Middlegame Planning Without an Engine",
    "How to make a plan when no obvious tactic exists — pawn structure, weak squares, piece improvement.",
    [
      { heading: "Identify the Weakest Piece", body: "Look at all your pieces. Which one is doing the least? Improve it. That's a plan." },
      { heading: "Identify the Pawn Structure Type", body: "Is it an IQP? A Maroczy bind? A Carlsbad? Each has known plans. Learn three structures deeply, not twenty shallowly." },
      { heading: "Trade or Avoid Trades", body: "If you're better, keep pieces on. If you're worse, trade pieces but keep pawns. If you're equal and have more space, keep pieces on too." },
      { heading: "Practice on MasterChess", body: "Play long games, not blitz, when training plans. Then review without engine first." },
    ],
  ),
  "pawn-structures": skillGuide(
    "Pawn Structures Every Player Must Know",
    "Five pawn structures that show up in 80% of master games.",
    [
      { heading: "Isolated Queen Pawn (IQP)", body: "Side with the IQP wants piece activity and kingside attack. Side without wants to blockade d5 and trade pieces." },
      { heading: "Hanging Pawns", body: "Two connected pawns on the c and d files, no support. Strong if mobile, weak if blockaded." },
      { heading: "Carlsbad Structure", body: "From Queen's Gambit Exchange. White plays minority attack on the queenside; Black attacks kingside or pushes ...e5." },
      { heading: "Closed Center", body: "When pawns lock, the game is decided on the wings. Find which side YOU should attack on." },
    ],
  ),
  "tactical-patterns": skillGuide(
    "10 Tactical Patterns Without Puzzles",
    "Pattern recognition built from real games, not artificial puzzles.",
    [
      { heading: "Why Not Puzzles?", body: "Puzzles tell you a tactic exists. Real games don't. The skill you need is noticing when a tactic might exist — and that's only trained by playing and reviewing." },
      { heading: "The Patterns", body: "Pin, fork, skewer, discovered attack, double attack, removal of the defender, overloading, in-between move, deflection, back-rank mate. Memorize the names. When you see one in a game, label it out loud." },
      { heading: "How to Train", body: "Play 5 games. Review each without engine. Find one tactical moment per game — yours or your opponent's. Name the pattern. Repeat." },
    ],
  ),
  "calculation-training": skillGuide(
    "Calculation Without Puzzles",
    "Train calculation in real game positions — the only kind that transfers.",
    [
      { heading: "The Two-Move Drill", body: "In any position, calculate every check, capture, and threat — for both sides — to a depth of 2 moves. That's it. Most blunders happen because players skip this." },
      { heading: "Candidate Moves First", body: "List 3 candidate moves. THEN calculate. Most players calculate one move deeply and miss the better one." },
      { heading: "Where Do You Stop?", body: "Stop when the position is quiet (no forcing moves) or when you've reached a clear evaluation. Don't calculate forever in blitz — assess and trust your judgment." },
    ],
  ),
  "time-management": skillGuide(
    "Time Management in Blitz & Rapid",
    "Lose on time less, decide better under pressure.",
    [
      { heading: "Budget Per Move", body: "10+0 = 10 seconds per move average for the first 30 moves. 5+3 = think on opponent's time, 5 seconds per move." },
      { heading: "When to Spend", body: "Spend time on critical moments: pawn breaks, piece sacrifices, endgame transitions. Pre-move only when the position is forced." },
      { heading: "Flag Recovery", body: "Under 30 seconds? Stop calculating long lines. Play principled moves: defend your king, trade pieces if better, give checks if behind." },
    ],
  ),
  "mental-game": skillGuide(
    "The Mental Game of Chess",
    "Tilt control, focus, and the rituals top players use to stay sharp.",
    [
      { heading: "Recognize Tilt", body: "Three losses in a row? Stop. Walk. Come back tomorrow. Continuing is how you go from -150 to -400 in one evening." },
      { heading: "The 30-Second Reset", body: "After a loss, breathe for 30 seconds. Don't queue immediately. The autopilot game you're about to play is rated and you'll lose it." },
      { heading: "Pre-Game Ritual", body: "Same warm-up every time: one quick game review, one cup of water, one deep breath. Pavlov your brain into focus mode." },
    ],
  ),
};
