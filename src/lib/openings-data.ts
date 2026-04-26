// Comprehensive chess openings database with variation trees
export interface OpeningMove {
  san: string;          // Standard Algebraic Notation
  explanation?: string; // Short teaching note
  children: OpeningMove[];
  isMainLine?: boolean;
  highlightSquares?: string[]; // Squares to emphasize
}

export interface Opening {
  id: string;
  name: string;
  eco: string;            // ECO code
  category: "king-pawn" | "queen-pawn" | "flank" | "indian";
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  startingMoves: string;  // e.g. "1.e4 e5"
  tree: OpeningMove[];
  totalVariations: number;
}

// Helper to build trees concisely
function m(san: string, explanation: string, children: OpeningMove[] = [], isMainLine = true, highlightSquares: string[] = []): OpeningMove {
  return { san, explanation, children, isMainLine, highlightSquares };
}
function s(san: string, explanation: string, children: OpeningMove[] = [], highlightSquares: string[] = []): OpeningMove {
  return { san, explanation, children, isMainLine: false, highlightSquares };
}

export const OPENINGS_DATABASE: Opening[] = [
  // ═══════════════════════════════════════════
  // ITALIAN GAME
  // ═══════════════════════════════════════════
  {
    id: "italian-game",
    name: "Italian Game",
    eco: "C50-C54",
    category: "king-pawn",
    description: "A classical opening aiming for rapid development and control of the center. One of the oldest and most popular openings.",
    difficulty: "beginner",
    icon: "⚔️",
    startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bc4",
    totalVariations: 8,
    tree: [
      m("e4", "King's pawn opening — control the center", [
        m("e5", "Black mirrors, fighting for the center", [
          m("Nf3", "Develop the knight and attack e5", [
            m("Nc6", "Black defends e5 with the knight", [
              m("Bc4", "The Italian — targets f7, the weakest square", [
                // Giuoco Piano
                m("Bc5", "Giuoco Piano — equal development", [
                  m("c3", "Preparing d4 to build a strong center", [
                    m("Nf6", "Black develops and attacks e4", [
                      m("d4", "Striking the center! The main idea", [
                        m("exd4", "Black captures", [
                          m("cxd4", "Recapture — now White has a strong center", [
                            m("Bb4+", "Check! Black pins the knight", [
                              m("Bd2", "Block the check and develop", [], true, ["d2"]),
                              s("Nc3", "Sacrifice a pawn for rapid development — the Möller Attack", [], ["c3"]),
                            ], true, ["b4"]),
                          ]),
                        ]),
                      ], true, ["d4"]),
                    ]),
                    s("d6", "Solid approach — Black keeps the center closed", [
                      m("d4", "White still pushes for center control", []),
                    ]),
                  ], true, ["c3"]),
                  s("d3", "Giuoco Pianissimo — slow but solid", [
                    m("Nf6", "Natural development", [
                      m("O-O", "Castle for safety first", []),
                    ]),
                  ]),
                ], true, ["c5"]),
                // Two Knights Defense
                s("Nf6", "Two Knights Defense — aggressive counterattack!", [
                  m("Ng5", "Attacking f7 directly — very sharp!", [
                    m("d5", "Black sacrifices a pawn to open lines", [
                      m("exd5", "Accept the pawn", [
                        m("Na5", "Traxler-style — attacking the bishop", [
                          m("Bb5+", "Check first, then retreat", [
                            m("c6", "Block and gain tempo", []),
                          ]),
                        ]),
                        s("Nd4", "Fritz Variation — a sharp sacrifice!", []),
                      ]),
                    ], true, ["d5"]),
                  ], false, ["g5"]),
                  s("d3", "Quiet approach against Two Knights", [
                    m("Be7", "Solid development", []),
                  ]),
                ]),
                // Hungarian Defense
                s("Be7", "Hungarian Defense — passive but solid", [
                  m("d4", "Seize the center immediately", []),
                ]),
              ], true, ["c4", "f7"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // SICILIAN DEFENSE
  // ═══════════════════════════════════════════
  {
    id: "sicilian-defense",
    name: "Sicilian Defense",
    eco: "B20-B99",
    category: "king-pawn",
    description: "The most popular response to 1.e4. Black fights for an asymmetrical position with counterattacking chances.",
    difficulty: "intermediate",
    icon: "🏴",
    startingMoves: "1.e4 c5",
    totalVariations: 12,
    tree: [
      m("e4", "King's pawn opening", [
        m("c5", "The Sicilian! Asymmetric fight for the center", [
          // Open Sicilian
          m("Nf3", "The main move — heading for the Open Sicilian", [
            m("d6", "Najdorf/Dragon setup — flexible", [
              m("d4", "Open the center!", [
                m("cxd4", "Exchange is forced", [
                  m("Nxd4", "Recapture with the knight — Open Sicilian reached", [
                    // Najdorf
                    m("Nf6", "Attacking e4 — Najdorf preparation", [
                      m("Nc3", "Defend e4 and develop", [
                        m("a6", "The Najdorf! Bobby Fischer's weapon", [
                          m("Be2", "Classical Najdorf — solid and positional", [
                            m("e5", "Black grabs space", []),
                          ]),
                          s("Bg5", "Aggressive — threatening to double pawns", [
                            m("e6", "Solid response", [
                              m("f4", "English Attack — very aggressive!", []),
                            ]),
                          ]),
                          s("f3", "English Attack — aiming for g4 and kingside storm", [
                            m("e5", "Fighting for central space", []),
                          ]),
                        ], true, ["a6"]),
                        s("e6", "Scheveningen — solid pawn triangle", [
                          m("Be2", "Classical development", []),
                        ]),
                      ]),
                    ]),
                    // Dragon
                    s("g6", "The Dragon! Fianchetto the bishop", [
                      m("Nc3", "Standard development", [
                        m("Bg7", "Dragon bishop — powerful on the long diagonal", [
                          m("Be3", "Yugoslav Attack preparation", [
                            m("Nf6", "Natural development", [
                              m("f3", "Yugoslav Attack! Kingside storm incoming", [
                                m("O-O", "Castle before the storm hits", []),
                              ], true, ["f3"]),
                            ]),
                          ]),
                          s("Be2", "Classical Dragon — calmer approach", []),
                        ], true, ["g7"]),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
            s("Nc6", "Classical approach", [
              m("d4", "Open the position", [
                m("cxd4", "Capture", [
                  m("Nxd4", "Recapture", [
                    m("Nf6", "Develop with tempo", [
                      m("Nc3", "Standard", [
                        m("e5", "Sveshnikov! Dynamic and modern", [
                          m("Ndb5", "Jump to b5 — targeting d6", [
                            m("d6", "Hold the center", []),
                          ]),
                        ]),
                        s("d6", "Classical Sicilian", []),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
            s("e6", "French-Sicilian hybrid", [
              m("d4", "Open the center", [
                m("cxd4", "Exchange", [
                  m("Nxd4", "Recapture", [
                    m("a6", "Kan Variation — flexible", []),
                    s("Nf6", "Four Knights Sicilian", []),
                  ]),
                ]),
              ]),
            ]),
          ]),
          // Alapin
          s("c3", "Alapin Variation — simple and solid", [
            m("d5", "Strike back immediately!", [
              m("exd5", "Accept", [
                m("Qxd5", "Recapture with the queen", [
                  m("d4", "Gain space", []),
                ]),
              ]),
            ]),
            s("Nf6", "Develop and attack e4", [
              m("e5", "Push the knight away", [
                m("Nd5", "Knight retreats to strong square", []),
              ]),
            ]),
          ]),
          // Smith-Morra
          s("d4", "Smith-Morra Gambit — sacrifice a pawn for development!", [
            m("cxd4", "Accept the gambit", [
              m("c3", "Offering another pawn!", [
                m("dxc3", "Take the second pawn", [
                  m("Nxc3", "Rapid development in return", []),
                ]),
                s("Nf6", "Decline — solid choice", []),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // FRENCH DEFENSE
  // ═══════════════════════════════════════════
  {
    id: "french-defense",
    name: "French Defense",
    eco: "C00-C19",
    category: "king-pawn",
    description: "A solid, strategic defense. Black builds a fortress and counterattacks on the queenside.",
    difficulty: "intermediate",
    icon: "🏰",
    startingMoves: "1.e4 e6",
    totalVariations: 8,
    tree: [
      m("e4", "King's pawn", [
        m("e6", "The French! Preparing ...d5", [
          m("d4", "Claim the center with two pawns", [
            m("d5", "Strike back — the defining move of the French", [
              // Advance Variation
              m("e5", "Advance Variation — grab space", [
                m("c5", "Attack the d4 pawn chain base", [
                  m("c3", "Support d4", [
                    m("Nc6", "Develop and pressure d4", [
                      m("Nf3", "Standard development", [
                        m("Qb6", "Attack b2 and d4 — classic plan", []),
                      ]),
                    ]),
                  ]),
                  s("Nf3", "Flexible development", [
                    m("Nc6", "Natural", []),
                  ]),
                ], true, ["c5", "d4"]),
              ]),
              // Tarrasch Variation
              s("Nd2", "Tarrasch — avoids blocking the c-pawn", [
                m("Nf6", "Develop naturally", [
                  m("e5", "Push the pawn", [
                    m("Nfd7", "Retreat — standard in the French", [
                      m("Bd3", "Develop the bishop", [
                        m("c5", "Counterattack the chain", []),
                      ]),
                    ]),
                  ]),
                  s("Bd3", "Quiet development", [
                    m("c5", "Strike at d4", []),
                  ]),
                ]),
                s("c5", "Immediately attack d4", [
                  m("exd5", "Exchange", [
                    m("exd5", "Recapture — IQP position", []),
                  ]),
                ]),
              ]),
              // Winawer Variation
              s("Nc3", "Main line — most popular", [
                m("Bb4", "Winawer! Pin the knight — sharp and complex", [
                  m("e5", "Advance — the main battleground", [
                    m("c5", "Counter the center", [
                      m("a3", "Ask the bishop — take or retreat?", [
                        m("Bxc3+", "Exchange — double White's pawns", [
                          m("bxc3", "Doubled pawns but bishop pair", []),
                        ]),
                      ]),
                    ]),
                  ]),
                ], true, ["b4"]),
                s("Nf6", "Classical French — solid", [
                  m("Bg5", "Pin the knight — Burn Variation", [
                    m("Be7", "Break the pin", [
                      m("e5", "Advance", [
                        m("Nfd7", "Standard retreat", []),
                      ]),
                    ]),
                    s("dxe4", "Rubinstein — simplify early", [
                      m("Nxe4", "Recapture", []),
                    ]),
                  ]),
                ]),
              ]),
              // Exchange Variation
              s("exd5", "Exchange Variation — symmetrical and drawish", [
                m("exd5", "Recapture", [
                  m("Nf3", "Simple development", [
                    m("Nf6", "Mirror development", []),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // RUY LOPEZ
  // ═══════════════════════════════════════════
  {
    id: "ruy-lopez",
    name: "Ruy Lopez",
    eco: "C60-C99",
    category: "king-pawn",
    description: "The Spanish Game — one of the oldest and most deeply analyzed openings. Rich in strategic ideas.",
    difficulty: "advanced",
    icon: "👑",
    startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bb5",
    totalVariations: 10,
    tree: [
      m("e4", "King's pawn", [
        m("e5", "Classical reply", [
          m("Nf3", "Attack e5", [
            m("Nc6", "Defend e5", [
              m("Bb5", "Ruy Lopez! Indirect pressure on e5 through the knight", [
                // Morphy Defense (main)
                m("a6", "Morphy Defense — the most popular reply", [
                  m("Ba4", "Retreat — maintaining the pin threat", [
                    m("Nf6", "Develop and attack e4", [
                      m("O-O", "Castle — ignoring the e4 threat!", [
                        m("Be7", "Closed Ruy Lopez — the tabiya", [
                          m("Re1", "Support e4 and prepare for the center", [
                            m("b5", "Push the bishop away", [
                              m("Bb3", "Safe retreat", [
                                m("d6", "Solid — complete the setup", [
                                  m("c3", "Prepare d4", [
                                    m("O-O", "Both sides castled — deep middlegame begins", []),
                                  ]),
                                ]),
                                s("O-O", "Castle first — Marshall Attack territory", [
                                  m("c3", "Prepare d4", [
                                    m("d5", "Marshall Attack! Pawn sacrifice for initiative", [
                                      m("exd5", "Accept", [
                                        m("Nxd5", "Black gets active pieces", []),
                                      ]),
                                    ], true, ["d5"]),
                                  ]),
                                ]),
                              ]),
                            ]),
                          ]),
                        ], true, ["e7"]),
                        s("Nxe4", "Open Ruy Lopez — take the pawn!", [
                          m("d4", "Strike back at the center", [
                            m("b5", "Push the bishop", [
                              m("Bb3", "Retreat", [
                                m("d5", "Central break", []),
                              ]),
                            ]),
                          ]),
                        ]),
                      ]),
                    ]),
                    s("b5", "Immediately push the bishop", [
                      m("Bb3", "Safe square", [
                        m("Nf6", "Develop the knight", []),
                      ]),
                    ]),
                  ]),
                  s("Bxc6", "Exchange Variation — damage the pawn structure", [
                    m("dxc6", "Recapture — doubled pawns but bishop pair", [
                      m("Nxe5", "Win the pawn", [
                        m("Qd4", "Fork the knight and e4!", []),
                      ]),
                      s("d3", "Solid approach", []),
                    ]),
                  ]),
                ], true, ["a6"]),
                // Berlin Defense
                s("Nf6", "Berlin Defense — the drawing weapon!", [
                  m("O-O", "Castle", [
                    m("Nxe4", "Berlin endgame territory", [
                      m("d4", "Open the position", [
                        m("Nd6", "Retreat to d6", [
                          m("Bxc6", "Exchange on c6", [
                            m("dxc6", "The famous Berlin endgame — very drawish", []),
                          ]),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
                // Schliemann Defense
                s("f5", "Schliemann / Jaenisch Gambit — aggressive!", [
                  m("Nc3", "Develop and defend", [
                    m("fxe4", "Take the pawn", [
                      m("Nxe4", "Recapture", []),
                    ]),
                  ]),
                  s("d3", "Solid reply", []),
                ]),
              ], true, ["b5"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // QUEEN'S GAMBIT
  // ═══════════════════════════════════════════
  {
    id: "queens-gambit",
    name: "Queen's Gambit",
    eco: "D06-D69",
    category: "queen-pawn",
    description: "A classic opening where White offers a pawn to gain central control. Not a true gambit — the pawn can usually be recovered.",
    difficulty: "beginner",
    icon: "♛",
    startingMoves: "1.d4 d5 2.c4",
    totalVariations: 9,
    tree: [
      m("d4", "Queen's pawn — solid central control", [
        m("d5", "Symmetrical center", [
          m("c4", "The Queen's Gambit! Challenging d5", [
            // QGD
            m("e6", "Queen's Gambit Declined — solid and popular", [
              m("Nc3", "Develop the knight", [
                m("Nf6", "Natural development", [
                  m("Bg5", "Pin the knight! The main line", [
                    m("Be7", "Break the pin calmly", [
                      m("e3", "Solid center support", [
                        m("O-O", "Castle for safety", [
                          m("Nf3", "Complete development", [
                            m("Nbd7", "Prepare ...c5 break", []),
                          ]),
                        ]),
                      ]),
                    ]),
                    s("Nbd7", "Prepare to break the pin differently", [
                      m("e3", "Support the center", [
                        m("c6", "Slav-QGD hybrid", []),
                      ]),
                    ]),
                  ], true, ["g5"]),
                  s("Nf3", "Quiet development", [
                    m("Be7", "Develop the bishop", [
                      m("Bf4", "London-style setup", []),
                    ]),
                  ]),
                ]),
                s("Be7", "Develop bishop first", [
                  m("Nf3", "Knight to f3", []),
                ]),
              ]),
            ]),
            // QGA
            s("dxc4", "Queen's Gambit Accepted — take the pawn!", [
              m("Nf3", "Develop naturally — will recover the pawn", [
                m("Nf6", "Develop", [
                  m("e3", "Prepare to recapture on c4", [
                    m("e6", "Solid structure", [
                      m("Bxc4", "Recover the pawn — White stands well", [
                        m("c5", "Counter-strike at d4!", []),
                      ]),
                    ]),
                  ]),
                ]),
                s("a6", "Preparing ...b5 to keep the pawn", [
                  m("e3", "Still aiming to recover c4", [
                    m("Nf6", "Develop", []),
                  ]),
                ]),
              ]),
            ]),
            // Slav Defense
            s("c6", "Slav Defense — protect d5 without locking in the bishop", [
              m("Nf3", "Develop the knight", [
                m("Nf6", "Natural development", [
                  m("Nc3", "Standard", [
                    m("dxc4", "Semi-Slav capture", [
                      m("a4", "Prevent ...b5", [
                        m("Bf5", "Develop the light bishop — the point of the Slav!", []),
                      ]),
                    ]),
                    s("e6", "Semi-Slav — enter Meran territory", [
                      m("Bg5", "Pin", [
                        m("Nbd7", "Prepare to break free", []),
                      ]),
                      s("e3", "Quiet Semi-Slav", [
                        m("Bd6", "Active development", []),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // KING'S INDIAN DEFENSE
  // ═══════════════════════════════════════════
  {
    id: "kings-indian",
    name: "King's Indian Defense",
    eco: "E60-E99",
    category: "indian",
    description: "A hypermodern defense where Black lets White build a big center, then attacks it. Dynamic and aggressive.",
    difficulty: "advanced",
    icon: "🐯",
    startingMoves: "1.d4 Nf6 2.c4 g6",
    totalVariations: 7,
    tree: [
      m("d4", "Queen's pawn", [
        m("Nf6", "Indian Defense setup", [
          m("c4", "Grab more space", [
            m("g6", "King's Indian! Fianchetto incoming", [
              m("Nc3", "Develop the knight", [
                m("Bg7", "The powerful KID bishop on the long diagonal", [
                  // Classical
                  m("e4", "Build the big center — Classical variation", [
                    m("d6", "Flexible — keeping options open", [
                      m("Nf3", "Standard development", [
                        m("O-O", "Castle kingside", [
                          m("Be2", "Classical main line", [
                            m("e5", "Strike! The thematic break", [
                              m("d5", "Close the center — kingside vs queenside race!", [
                                m("Ne8", "Reroute knight to f7 or d7 — standard plan", []),
                                s("Nh5", "Prepare ...f5 — aggressive!", []),
                              ], true, ["d5"]),
                            ], true, ["e5"]),
                            s("Nbd7", "Flexible — delay ...e5", []),
                          ]),
                          s("Bg5", "Averbakh — pin the knight", [
                            m("h6", "Challenge the bishop", [
                              m("Be3", "Retreat to a good square", []),
                            ]),
                          ]),
                        ]),
                      ]),
                      // Sämisch
                      s("f3", "Sämisch Variation — fortress center", [
                        m("O-O", "Castle", [
                          m("Be3", "Develop", [
                            m("e5", "Still the thematic break", []),
                          ]),
                        ]),
                      ]),
                    ]),
                  ]),
                  // Fianchetto Variation
                  s("Nf3", "Fianchetto setup", [
                    m("O-O", "Castle first", [
                      m("g3", "Fianchetto the bishop too!", [
                        m("d6", "Standard", [
                          m("Bg2", "Bishop to g2 — battling for the long diagonal", [
                            m("Nbd7", "Develop and prepare ...e5", []),
                          ]),
                        ]),
                      ]),
                    ]),
                  ]),
                ], true, ["g7"]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // LONDON SYSTEM
  // ═══════════════════════════════════════════
  {
    id: "london-system",
    name: "London System",
    eco: "D02",
    category: "queen-pawn",
    description: "A universal system where White develops the same way regardless of Black's setup. Easy to learn, hard to crack.",
    difficulty: "beginner",
    icon: "🎩",
    startingMoves: "1.d4 d5 2.Bf4",
    totalVariations: 5,
    tree: [
      m("d4", "Queen's pawn", [
        m("d5", "Classical response", [
          m("Bf4", "The London! Develop the bishop early", [
            m("Nf6", "Natural development", [
              m("e3", "Solid pyramid structure", [
                m("c5", "Black challenges d4", [
                  m("c3", "Support d4 — the London pyramid is complete", [
                    m("Nc6", "Develop", [
                      m("Nd2", "Prepare Ngf3", [
                        m("e6", "Solid", [
                          m("Ngf3", "Complete development — the London setup is ready!", []),
                        ]),
                      ]),
                    ]),
                    s("Qb6", "Attack b2 — a common try", [
                      m("Qb3", "Trade queens or defend b2", [
                        m("c4", "Aggressive — push the queen", []),
                      ]),
                    ]),
                  ]),
                ]),
                s("e6", "Quiet — play it safe", [
                  m("Nd2", "Flexible development", [
                    m("Bd6", "Challenge the London bishop", [
                      m("Bg3", "Trade or retreat — White keeps the bishop", []),
                    ]),
                  ]),
                ]),
              ]),
            ]),
            s("c5", "Immediately challenge d4", [
              m("e3", "Support d4", [
                m("Nc6", "Develop", [
                  m("Nf3", "Natural", [
                    m("Nf6", "Standard development", [
                      m("c3", "Complete the pyramid", []),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
        s("Nf6", "Indian setup", [
          m("Bf4", "London still works!", [
            m("g6", "Fianchetto attempt", [
              m("e3", "Pyramid", [
                m("Bg7", "Complete the fianchetto", [
                  m("Nf3", "Develop", [
                    m("O-O", "Castle", [
                      m("Be2", "Prepare to castle", [
                        m("d6", "Flexible", []),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // CARO-KANN DEFENSE
  // ═══════════════════════════════════════════
  {
    id: "caro-kann",
    name: "Caro-Kann Defense",
    eco: "B10-B19",
    category: "king-pawn",
    description: "A rock-solid defense. Black maintains a healthy pawn structure and develops the light-squared bishop freely.",
    difficulty: "intermediate",
    icon: "🛡️",
    startingMoves: "1.e4 c6",
    totalVariations: 7,
    tree: [
      m("e4", "King's pawn", [
        m("c6", "Caro-Kann! Preparing ...d5 while keeping the bishop free", [
          m("d4", "Claim the center", [
            m("d5", "Strike! The main idea", [
              // Advance
              m("e5", "Advance Variation — gain space", [
                m("Bf5", "Develop the bishop BEFORE ...e6 — Caro-Kann's advantage!", [
                  m("Nf3", "Develop", [
                    m("e6", "Now lock in the structure", [
                      m("Be2", "Quiet and solid", [
                        m("c5", "Counterattack the chain", []),
                      ]),
                    ]),
                  ]),
                  s("Bd3", "Challenge the bishop", [
                    m("Bxd3", "Exchange — simplify", [
                      m("Qxd3", "Recapture with queen", []),
                    ]),
                  ]),
                ], true, ["f5"]),
              ]),
              // Classical
              s("Nd2", "Classical approach", [
                m("dxe4", "Take the pawn", [
                  m("Nxe4", "Recapture", [
                    m("Bf5", "Develop with tempo!", [
                      m("Ng3", "Knight retreats", [
                        m("Bg6", "Keep the bishop", [
                          m("h4", "Push! Creating threats", [
                            m("h6", "Stop h5", []),
                          ]),
                        ]),
                      ]),
                    ]),
                    s("Nd7", "Smyslov Variation — flexible", [
                      m("Nf3", "Develop", [
                        m("Ngf6", "Standard", []),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
              // Exchange
              s("exd5", "Exchange Variation", [
                m("cxd5", "Recapture — symmetric position", [
                  m("Bd3", "Develop", [
                    m("Nc6", "Natural", [
                      m("c3", "Support the center", [
                        m("Nf6", "Standard development", []),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
              // Panov Attack
              s("Nc3", "Two Knights — or Panov after cxd5", [
                m("dxe4", "Take", [
                  m("Nxe4", "Recapture", [
                    m("Bf5", "Develop the bishop — key Caro-Kann idea", []),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // ENGLISH OPENING
  // ═══════════════════════════════════════════
  {
    id: "english-opening",
    name: "English Opening",
    eco: "A10-A39",
    category: "flank",
    description: "A flexible flank opening. White controls the center from the side and can transpose into many systems.",
    difficulty: "intermediate",
    icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    startingMoves: "1.c4",
    totalVariations: 6,
    tree: [
      m("c4", "The English! Control d5 from the flank", [
        // Symmetrical
        m("c5", "Symmetrical English", [
          m("Nf3", "Develop the knight", [
            m("Nc6", "Mirror development", [
              m("g3", "Fianchetto — very common", [
                m("g6", "Black fianchettoes too", [
                  m("Bg2", "Powerful bishop on the long diagonal", [
                    m("Bg7", "Symmetrical fianchetto — battling for the diagonal", [
                      m("O-O", "Castle", [
                        m("O-O", "Both castled — complex middlegame", []),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
              s("Nc3", "Standard development", [
                m("g6", "Fianchetto", [
                  m("g3", "Mirror fianchetto", []),
                ]),
              ]),
            ]),
          ]),
        ]),
        // Reversed Sicilian
        s("e5", "Reversed Sicilian — Black plays like White in the Sicilian", [
          m("Nc3", "Develop the knight", [
            m("Nf6", "Natural", [
              m("g3", "Fianchetto", [
                m("d5", "Strike the center!", [
                  m("cxd5", "Accept", [
                    m("Nxd5", "Recapture — active piece", []),
                  ]),
                ]),
                s("Bb4", "Pin the knight", []),
              ]),
              s("Nf3", "Double knights", [
                m("Nc6", "Develop", []),
              ]),
            ]),
          ]),
        ]),
        // Anglo-Indian
        s("Nf6", "Anglo-Indian setup", [
          m("Nc3", "Standard", [
            m("e6", "Preparing ...d5", [
              m("e4", "Grab the center — English Four Knights", [
                m("d5", "Strike!", []),
              ]),
              s("Nf3", "Flexible", [
                m("Bb4", "Pin", []),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  // ═══════════════════════════════════════════
  // SCANDINAVIAN DEFENSE
  // ═══════════════════════════════════════════
  {
    id: "scandinavian",
    name: "Scandinavian Defense",
    eco: "B01",
    category: "king-pawn",
    description: "An immediate counterattack in the center. Simple to learn with clear plans, popular at club level.",
    difficulty: "beginner",
    icon: "⚡",
    startingMoves: "1.e4 d5",
    totalVariations: 5,
    tree: [
      m("e4", "King's pawn", [
        m("d5", "Scandinavian! Immediately challenge the center", [
          m("exd5", "Accept — almost always played", [
            m("Qxd5", "Main line — recapture with the queen", [
              m("Nc3", "Attack the queen — gain tempo", [
                m("Qa5", "Qa5 — the most common retreat", [
                  m("d4", "Claim the center", [
                    m("Nf6", "Develop naturally", [
                      m("Nf3", "Standard", [
                        m("Bf5", "Classic Scandinavian setup — bishop outside the chain", [
                          m("Bc4", "Active development", []),
                          s("Be2", "Solid approach", []),
                        ]),
                      ]),
                    ]),
                    s("c6", "Prepare ...Bf5 with extra support", []),
                  ]),
                ]),
                s("Qd6", "Modern retreat — flexible", [
                  m("d4", "Center control", [
                    m("Nf6", "Develop", [
                      m("Nf3", "Standard", [
                        m("a6", "Prepare ...b5 and ...Bb7", []),
                      ]),
                    ]),
                  ]),
                ]),
                s("Qd8", "Retreat all the way — the solid option", [
                  m("d4", "Big center", [
                    m("Nf6", "Develop", []),
                  ]),
                ]),
              ]),
            ]),
            s("Nf6", "Modern Scandinavian — don't recapture with the queen!", [
              m("d4", "Hold the extra pawn and play naturally", [
                m("Nxd5", "Recover the pawn later", [
                  m("Nf3", "Develop", [
                    m("g6", "Fianchetto plan", []),
                  ]),
                ]),
              ]),
              s("Nf3", "Simple development", [
                m("Nxd5", "Recapture", []),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
  // ═══════════════════════════════════════════
  // MASTERCLASS — JOBAVA LONDON SYSTEM (30 variations)
  // ═══════════════════════════════════════════
  {
    id: "masterclass-jobava-london",
    name: "MasterKurs: Jobava London System",
    eco: "D00",
    category: "queen-pawn",
    description: "30-variation deep masterclass on the Jobava London System (1.d4 + 2.Nc3 + 3.Bf4). A complete weapon for White covering positional, tactical, and opposite-side attacking lines.",
    difficulty: "advanced",
    icon: "👑",
    startingMoves: "1.d4 2.Nc3 3.Bf4",
    totalVariations: 30,
    tree: [
      m("d4", "1.d4 — White claims the center.", [
        m("d5", "1...d5 — Continuing the line.", [
          m("Nc3", "2.Nc3 — The Jobava signature: knight develops before c3.", [
            m("Nf6", "2...Nf6 — Continuing the line.", [
              m("Bf4", "3.Bf4 — The London bishop, eyeing c7.", [
                m("e6", "3...e6 — Continuing the line.", [
                  m("e3", "4.e3 — Continuing the line.", [
                    m("Bd6", "4...Bd6 — Continuing the line.", [
                      m("Bg3", "5.Bg3 — Continuing the line.", [
                        m("O-O", "5...O-O — Continuing the line.", [
                          m("Bd3", "6.Bd3 — Continuing the line.", [
                            m("c5", "6...c5 — Continuing the line.", [
                              m("Nf3", "7.Nf3 — Continuing the line.", [
                                m("Nc6", "7...Nc6 — Continuing the line.", [
                                  m("O-O", "8.O-O — Continuing the line.", [
                                    m("b6", "8...b6 — Continuing the line.", [
                                      m("Ne5", "9.Ne5 — Continuing the line.", [
                                        m("Bb7", "9...Bb7 — Continuing the line.", [
                                          m("f4", "Variation 1: Main Solid System", [])
                                        ])
                                      ]),
                                      s("Re1", "9.Re1 — Continuing the line.", [
                                        s("Bb7", "9...Bb7 — Continuing the line.", [
                                          s("e4", "Variation 26: Slow Build Attack", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ]),
                            s("b6", "6...b6 — Continuing the line.", [
                              s("Nf3", "7.Nf3 — Continuing the line.", [
                                s("Bb7", "7...Bb7 — Continuing the line.", [
                                  s("Ne5", "8.Ne5 — Continuing the line.", [
                                    s("Nbd7", "8...Nbd7 — Continuing the line.", [
                                      s("f4", "9.f4 — Continuing the line.", [
                                        s("c5", "9...c5 — Continuing the line.", [
                                          s("Bh4", "Variation 13: Classical Jobava Setup", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ]),
                    s("c5", "4...c5 — Continuing the line.", [
                      s("Nb5", "5.Nb5 — Continuing the line.", [
                        s("Na6", "5...Na6 — Continuing the line.", [
                          s("Nf3", "6.Nf3 — Continuing the line.", [
                            s("Bd7", "6...Bd7 — Continuing the line.", [
                              s("c3", "7.c3 — Continuing the line.", [
                                s("Be7", "7...Be7 — Continuing the line.", [
                                  s("a4", "8.a4 — Continuing the line.", [
                                    s("O-O", "8...O-O — Continuing the line.", [
                                      s("Bd3", "9.Bd3 — Continuing the line.", [
                                        s("Bd6", "9...Bd6 — Continuing the line.", [
                                          s("O-O", "Variation 9: Positional Squeeze", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ]),
                  s("f3", "4.f3 — Continuing the line.", [
                    s("c5", "4...c5 — Continuing the line.", [
                      s("e4", "5.e4 — Continuing the line.", [
                        s("cxd4", "5...cxd4 — Continuing the line.", [
                          s("Qxd4", "6.Qxd4 — Continuing the line.", [
                            s("Nc6", "6...Nc6 — Continuing the line.", [
                              s("Bb5", "7.Bb5 — Continuing the line.", [
                                s("Bd7", "7...Bd7 — Continuing the line.", [
                                  s("Bxc6", "8.Bxc6 — Continuing the line.", [
                                    s("Bxc6", "8...Bxc6 — Continuing the line.", [
                                      s("O-O-O", "Variation 2: Early Center Break", [])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ]),
                        s("Nc6", "5...Nc6 — Continuing the line.", [
                          s("Nb5", "6.Nb5 — Continuing the line.", [
                            s("e5", "6...e5 — Continuing the line.", [
                              s("dxe5", "7.dxe5 — Continuing the line.", [
                                s("Nh5", "7...Nh5 — Continuing the line.", [
                                  s("exd5", "8.exd5 — Continuing the line.", [
                                    s("Nxf4", "8...Nxf4 — Continuing the line.", [
                                      s("dxc6", "9.dxc6 — Continuing the line.", [
                                        s("Qxd1+", "9...Qxd1+ — Continuing the line.", [
                                          s("Rxd1", "Variation 24: Open Center Attack", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ]),
                  s("Qd2", "4.Qd2 — Continuing the line.", [
                    s("Be7", "4...Be7 — Continuing the line.", [
                      s("O-O-O", "5.O-O-O — Continuing the line.", [
                        s("O-O", "5...O-O — Continuing the line.", [
                          s("h4", "6.h4 — Continuing the line.", [
                            s("c5", "6...c5 — Continuing the line.", [
                              s("e4", "7.e4 — Continuing the line.", [
                                s("cxd4", "7...cxd4 — Continuing the line.", [
                                  s("Qxd4", "8.Qxd4 — Continuing the line.", [
                                    s("Nc6", "8...Nc6 — Continuing the line.", [
                                      s("Qe3", "9.Qe3 — Continuing the line.", [
                                        s("d4", "1.d4 — White claims the center.", [
                                          s("Qg3", "Variation 4: Opposite-side Attack", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ]),
                                s("Nc6", "7...Nc6 — Continuing the line.", [
                                  s("dxc5", "8.dxc5 — Continuing the line.", [
                                    s("Bxc5", "8...Bxc5 — Continuing the line.", [
                                      s("h5", "9.h5 — Continuing the line.", [
                                        s("Re8", "9...Re8 — Continuing the line.", [
                                          s("h6", "Variation 21: Kingside Pressure", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ]),
                            s("b6", "6...b6 — Continuing the line.", [
                              s("h5", "7.h5 — Continuing the line.", [
                                s("Bb7", "7...Bb7 — Continuing the line.", [
                                  s("Nf3", "8.Nf3 — Continuing the line.", [
                                    s("Nbd7", "8...Nbd7 — Continuing the line.", [
                                      s("Ne5", "9.Ne5 — Continuing the line.", [
                                        s("Nxe5", "9...Nxe5 — Continuing the line.", [
                                          s("dxe5", "Variation 10: Pawn Storm Attack", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ]),
                  s("Nf3", "4.Nf3 — Continuing the line.", [
                    s("Bd6", "4...Bd6 — Continuing the line.", [
                      s("Bg3", "5.Bg3 — Continuing the line.", [
                        s("O-O", "5...O-O — Continuing the line.", [
                          s("e3", "6.e3 — Continuing the line.", [
                            s("c5", "6...c5 — Continuing the line.", [
                              s("Bd3", "7.Bd3 — Continuing the line.", [
                                s("Nc6", "7...Nc6 — Continuing the line.", [
                                  s("O-O", "8.O-O — Continuing the line.", [
                                    s("Nb4", "8...Nb4 — Continuing the line.", [
                                      s("Nb5", "9.Nb5 — Continuing the line.", [
                                        s("Bxg3", "9...Bxg3 — Continuing the line.", [
                                          s("Bxh7+", "Variation 15: Flexible Development", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ]),
                s("c5", "3...c5 — Continuing the line.", [
                  s("e3", "4.e3 — Continuing the line.", [
                    s("Nc6", "4...Nc6 — Continuing the line.", [
                      s("Nb5", "5.Nb5 — Continuing the line.", [
                        s("e5", "5...e5 — Continuing the line.", [
                          s("dxe5", "6.dxe5 — Continuing the line.", [
                            s("Ne4", "6...Ne4 — Continuing the line.", [
                              s("Qxd5", "7.Qxd5 — Continuing the line.", [
                                s("Qa5+", "7...Qa5+ — Continuing the line.", [
                                  s("c3", "8.c3 — Continuing the line.", [
                                    s("Bf5", "8...Bf5 — Continuing the line.", [
                                      s("Nd6+", "9.Nd6+ — Continuing the line.", [
                                        s("Nxd6", "9...Nxd6 — Continuing the line.", [
                                          s("exd6", "Variation 3: Anti ...c5 Tactical", [])
                                        ]),
                                        s("Bxd6", "9...Bxd6 — Continuing the line.", [
                                          s("exd6", "Variation 16: Early c5 Counterattack", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ]),
                        s("Qa5+", "5...Qa5+ — Continuing the line.", [
                          s("c3", "6.c3 — Continuing the line.", [
                            s("cxd4", "6...cxd4 — Continuing the line.", [
                              s("exd4", "7.exd4 — Continuing the line.", [
                                s("e5", "7...e5 — Continuing the line.", [
                                  s("dxe5", "8.dxe5 — Continuing the line.", [
                                    s("Ne4", "8...Ne4 — Continuing the line.", [
                                      s("Qxd5", "9.Qxd5 — Continuing the line.", [
                                        s("Bf5", "9...Bf5 — Continuing the line.", [
                                          s("Nd6+", "Variation 27: Early Queen Activity", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ]),
                  s("dxc5", "4.dxc5 — Continuing the line.", [
                    s("e6", "4...e6 — Continuing the line.", [
                      s("e4", "5.e4 — Continuing the line.", [
                        s("Bxc5", "5...Bxc5 — Continuing the line.", [
                          s("exd5", "6.exd5 — Continuing the line.", [
                            s("exd5", "6...exd5 — Continuing the line.", [
                              s("Bb5+", "7.Bb5+ — Continuing the line.", [
                                s("Nc6", "7...Nc6 — Continuing the line.", [
                                  s("Nge2", "8.Nge2 — Continuing the line.", [
                                    s("O-O", "8...O-O — Continuing the line.", [
                                      s("O-O", "9.O-O — Continuing the line.", [
                                        s("Bd6", "9...Bd6 — Continuing the line.", [
                                          s("Bg5", "Variation 29: King-Attack Speed", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ])
          ])
        ]),
        s("Nf6", "1...Nf6 — Continuing the line.", [
          s("Nc3", "2.Nc3 — The Jobava signature: knight develops before c3.", [
            s("g6", "2...g6 — Continuing the line.", [
              s("Bf4", "3.Bf4 — The London bishop, eyeing c7.", [
                s("Bg7", "3...Bg7 — Continuing the line.", [
                  s("e4", "4.e4 — Continuing the line.", [
                    s("d6", "4...d6 — Continuing the line.", [
                      s("Qd2", "5.Qd2 — Continuing the line.", [
                        s("O-O", "5...O-O — Continuing the line.", [
                          s("O-O-O", "6.O-O-O — Continuing the line.", [
                            s("c6", "6...c6 — Continuing the line.", [
                              s("Bh6", "7.Bh6 — Continuing the line.", [
                                s("b5", "7...b5 — Continuing the line.", [
                                  s("h4", "8.h4 — Continuing the line.", [
                                    s("b4", "8...b4 — Continuing the line.", [
                                      s("Nce2", "9.Nce2 — Continuing the line.", [
                                        s("Nxe4", "9...Nxe4 — Continuing the line.", [
                                          s("Qe3", "Variation 5: King's Indian Setup", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ]),
                            s("a6", "6...a6 — Continuing the line.", [
                              s("Bh6", "7.Bh6 — Continuing the line.", [
                                s("b5", "7...b5 — Continuing the line.", [
                                  s("h4", "8.h4 — Continuing the line.", [
                                    s("Bb7", "8...Bb7 — Continuing the line.", [
                                      s("h5", "9.h5 — Continuing the line.", [
                                        s("Nxh5", "9...Nxh5 — Continuing the line.", [
                                          s("Rxh5", "10.Rxh5 — Continuing the line.", [
                                            s("gxh5", "Variation 30: Final Master Attack", [])
                                          ])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ]),
                        s("Nc6", "5...Nc6 — Continuing the line.", [
                          s("O-O-O", "6.O-O-O — Continuing the line.", [
                            s("O-O", "6...O-O — Continuing the line.", [
                              s("f3", "7.f3 — Continuing the line.", [
                                s("e5", "7...e5 — Continuing the line.", [
                                  s("dxe5", "8.dxe5 — Continuing the line.", [
                                    s("dxe5", "8...dxe5 — Continuing the line.", [
                                      s("Be3", "9.Be3 — Continuing the line.", [
                                        s("Qe7", "9...Qe7 — Continuing the line.", [
                                          s("Nh3", "Variation 23: Modern Attack Plan", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ]),
                  s("e3", "4.e3 — Continuing the line.", [
                    s("d6", "4...d6 — Continuing the line.", [
                      s("h4", "5.h4 — Continuing the line.", [
                        s("h5", "5...h5 — Continuing the line.", [
                          s("Nf3", "6.Nf3 — Continuing the line.", [
                            s("O-O", "6...O-O — Continuing the line.", [
                              s("Ng5", "7.Ng5 — Continuing the line.", [
                                s("c5", "7...c5 — Continuing the line.", [
                                  s("dxc5", "8.dxc5 — Continuing the line.", [
                                    s("Qa5", "8...Qa5 — Continuing the line.", [
                                      s("cxd6", "9.cxd6 — Continuing the line.", [
                                        s("exd6", "9...exd6 — Continuing the line.", [
                                          s("Qxd6", "Variation 6: Fianchetto Control", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ]),
                        s("O-O", "5...O-O — Continuing the line.", [
                          s("h5", "6.h5 — Continuing the line.", [
                            s("c5", "6...c5 — Continuing the line.", [
                              s("hxg6", "7.hxg6 — Continuing the line.", [
                                s("fxg6", "7...fxg6 — Continuing the line.", [
                                  s("Nf3", "8.Nf3 — Continuing the line.", [
                                    s("Nc6", "8...Nc6 — Continuing the line.", [
                                      s("Bc4+", "9.Bc4+ — Continuing the line.", [
                                        s("Kh8", "9...Kh8 — Continuing the line.", [
                                          s("Ng5", "Variation 25: King Safety Pressure", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ]),
            s("e6", "2...e6 — Continuing the line.", [
              s("Bf4", "3.Bf4 — The London bishop, eyeing c7.", [
                s("Bb4", "3...Bb4 — Continuing the line.", [
                  s("e3", "4.e3 — Continuing the line.", [
                    s("c5", "4...c5 — Continuing the line.", [
                      s("a3", "5.a3 — Continuing the line.", [
                        s("Bxc3+", "5...Bxc3+ — Continuing the line.", [
                          s("bxc3", "6.bxc3 — Continuing the line.", [
                            s("Qa5", "6...Qa5 — Continuing the line.", [
                              s("Ne2", "7.Ne2 — Continuing the line.", [
                                s("Nd5", "7...Nd5 — Continuing the line.", [
                                  s("Qd2", "8.Qd2 — Continuing the line.", [
                                    s("Nc6", "8...Nc6 — Continuing the line.", [
                                      s("Bd6", "9.Bd6 — Continuing the line.", [
                                        s("cxd4", "9...cxd4 — Continuing the line.", [
                                          s("exd4", "Variation 7: Nimzo Structure Exchange", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ]),
                s("c5", "3...c5 — Continuing the line.", [
                  s("d5", "4.d5 — Continuing the line.", [
                    s("exd5", "4...exd5 — Continuing the line.", [
                      s("Nxd5", "5.Nxd5 — Continuing the line.", [
                        s("Nxd5", "5...Nxd5 — Continuing the line.", [
                          s("Qxd5", "6.Qxd5 — Continuing the line.", [
                            s("Nc6", "6...Nc6 — Continuing the line.", [
                              s("O-O-O", "7.O-O-O — Continuing the line.", [
                                s("Be7", "7...Be7 — Continuing the line.", [
                                  s("e4", "8.e4 — Continuing the line.", [
                                    s("O-O", "8...O-O — Continuing the line.", [
                                      s("Nf3", "9.Nf3 — Continuing the line.", [
                                        s("d6", "9...d6 — Continuing the line.", [
                                          s("Bd6", "Variation 18: Central Exchange System", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ]),
                            s("d6", "6...d6 — Continuing the line.", [
                              s("Nf3", "7.Nf3 — Continuing the line.", [
                                s("Nc6", "7...Nc6 — Continuing the line.", [
                                  s("O-O-O", "8.O-O-O — Continuing the line.", [
                                    s("Be7", "8...Be7 — Continuing the line.", [
                                      s("e4", "9.e4 — Continuing the line.", [
                                        s("O-O", "9...O-O — Continuing the line.", [
                                          s("Bd3", "Variation 20: Early Tactical Explosion", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ]),
                s("d5", "3...d5 — Continuing the line.", [
                  s("Nb5", "4.Nb5 — Continuing the line.", [
                    s("Na6", "4...Na6 — Continuing the line.", [
                      s("e3", "5.e3 — Continuing the line.", [
                        s("c5", "5...c5 — Continuing the line.", [
                          s("c3", "6.c3 — Continuing the line.", [
                            s("Bd7", "6...Bd7 — Continuing the line.", [
                              s("a4", "7.a4 — Continuing the line.", [
                                s("Be7", "7...Be7 — Continuing the line.", [
                                  s("Nf3", "8.Nf3 — Continuing the line.", [
                                    s("O-O", "8...O-O — Continuing the line.", [
                                      s("Bd3", "9.Bd3 — Continuing the line.", [
                                        s("Bd6", "9...Bd6 — Continuing the line.", [
                                          s("O-O", "Variation 28: Positional Edge", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ]),
            s("c5", "2...c5 — Continuing the line.", [
              s("d5", "3.d5 — Continuing the line.", [
                s("g6", "3...g6 — Continuing the line.", [
                  s("Bf4", "4.Bf4 — Continuing the line.", [
                    s("Bg7", "4...Bg7 — Continuing the line.", [
                      s("e4", "5.e4 — Continuing the line.", [
                        s("d6", "5...d6 — Continuing the line.", [
                          s("Qd2", "6.Qd2 — Continuing the line.", [
                            s("O-O", "6...O-O — Continuing the line.", [
                              s("O-O-O", "7.O-O-O — Continuing the line.", [
                                s("e6", "7...e6 — Continuing the line.", [
                                  s("dxe6", "8.dxe6 — Continuing the line.", [
                                    s("Bxe6", "8...Bxe6 — Continuing the line.", [
                                      s("Bxd6", "9.Bxd6 — Continuing the line.", [
                                        s("Re8", "9...Re8 — Continuing the line.", [
                                          s("e5", "Variation 8: Benoni Structure", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ]),
                s("e6", "3...e6 — Continuing the line.", [
                  s("e4", "4.e4 — Continuing the line.", [
                    s("exd5", "4...exd5 — Continuing the line.", [
                      s("exd5", "5.exd5 — Continuing the line.", [
                        s("d6", "5...d6 — Continuing the line.", [
                          s("Nf3", "6.Nf3 — Continuing the line.", [
                            s("Be7", "6...Be7 — Continuing the line.", [
                              s("Bd3", "7.Bd3 — Continuing the line.", [
                                s("O-O", "7...O-O — Continuing the line.", [
                                  s("O-O", "8.O-O — Continuing the line.", [
                                    s("a6", "8...a6 — Continuing the line.", [
                                      s("Re1", "9.Re1 — Continuing the line.", [
                                        s("b5", "9...b5 — Continuing the line.", [
                                          s("a4", "Variation 19: Benoni Structure Active", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ]),
            s("b6", "2...b6 — Continuing the line.", [
              s("Bf4", "3.Bf4 — The London bishop, eyeing c7.", [
                s("Bb7", "3...Bb7 — Continuing the line.", [
                  s("f3", "4.f3 — Continuing the line.", [
                    s("e6", "4...e6 — Continuing the line.", [
                      s("e4", "5.e4 — Continuing the line.", [
                        s("Bb4", "5...Bb4 — Continuing the line.", [
                          s("Bd3", "6.Bd3 — Continuing the line.", [
                            s("c5", "6...c5 — Continuing the line.", [
                              s("dxc5", "7.dxc5 — Continuing the line.", [
                                s("bxc5", "7...bxc5 — Continuing the line.", [
                                  s("Ne2", "8.Ne2 — Continuing the line.", [
                                    s("O-O", "8...O-O — Continuing the line.", [
                                      s("O-O", "9.O-O — Continuing the line.", [
                                        s("d6", "9...d6 — Continuing the line.", [
                                          s("Bd6", "Variation 11: Queen's Indian Style", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ]),
            s("d6", "2...d6 — Continuing the line.", [
              s("Bf4", "3.Bf4 — The London bishop, eyeing c7.", [
                s("g6", "3...g6 — Continuing the line.", [
                  s("e4", "4.e4 — Continuing the line.", [
                    s("Bg7", "4...Bg7 — Continuing the line.", [
                      s("Qd2", "5.Qd2 — Continuing the line.", [
                        s("O-O", "5...O-O — Continuing the line.", [
                          s("O-O-O", "6.O-O-O — Continuing the line.", [
                            s("c6", "6...c6 — Continuing the line.", [
                              s("Bh6", "7.Bh6 — Continuing the line.", [
                                s("b5", "7...b5 — Continuing the line.", [
                                  s("h4", "8.h4 — Continuing the line.", [
                                    s("Bxh6", "8...Bxh6 — Continuing the line.", [
                                      s("Qxh6", "9.Qxh6 — Continuing the line.", [
                                        s("Nbd7", "9...Nbd7 — Continuing the line.", [
                                          s("h5", "Variation 12: Modern Dragon Structure", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ]),
            s("d5", "2...d5 — Continuing the line.", [
              s("Bf4", "3.Bf4 — The London bishop, eyeing c7.", [
                s("Ne4", "3...Ne4 — Continuing the line.", [
                  s("Nxe4", "4.Nxe4 — Continuing the line.", [
                    s("dxe4", "4...dxe4 — Continuing the line.", [
                      s("e3", "5.e3 — Continuing the line.", [
                        s("c5", "5...c5 — Continuing the line.", [
                          s("c3", "6.c3 — Continuing the line.", [
                            s("Nc6", "6...Nc6 — Continuing the line.", [
                              s("Qc2", "7.Qc2 — Continuing the line.", [
                                s("f5", "7...f5 — Continuing the line.", [
                                  s("f3", "8.f3 — Continuing the line.", [
                                    s("exf3", "8...exf3 — Continuing the line.", [
                                      s("Nxf3", "9.Nxf3 — Continuing the line.", [
                                        s("e6", "9...e6 — Continuing the line.", [
                                          s("Bd3", "Variation 14: Tactical Center Break", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ]),
                s("c5", "3...c5 — Continuing the line.", [
                  s("dxc5", "4.dxc5 — Continuing the line.", [
                    s("Nc6", "4...Nc6 — Continuing the line.", [
                      s("e4", "5.e4 — Continuing the line.", [
                        s("e5", "5...e5 — Continuing the line.", [
                          s("Bg5", "6.Bg5 — Continuing the line.", [
                            s("d4", "1.d4 — White claims the center.", [
                              s("Nd5", "7.Nd5 — Continuing the line.", [
                                s("Bxc5", "7...Bxc5 — Continuing the line.", [
                                  s("Bxf6", "8.Bxf6 — Continuing the line.", [
                                    s("gxf6", "8...gxf6 — Continuing the line.", [
                                      s("Qf3", "9.Qf3 — Continuing the line.", [
                                        s("Be6", "9...Be6 — Continuing the line.", [
                                          s("Nxf6+", "Variation 17: Queen Activity Line", [])
                                        ])
                                      ])
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ])
          ])
        ])
      ])
    ],
  },
  // ═══════════════════════════════════════════
  // MASTERCLASS — SICILIAN KALASHNIKOV (50 variations)
  // ═══════════════════════════════════════════
  {
    id: "masterclass-kalashnikov",
    name: "MasterKurs: Sicilian Kalashnikov",
    eco: "B32",
    category: "king-pawn",
    description: "50-variation deep masterclass on the Sicilian Kalashnikov (1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 e5). Stockfish-vetted modern mainline (7…b5 8.Nd5 Nge7) plus the critical 5.Nf5 / 5.Nf3 / 5.Nb3 / 5.Ne2 sidelines, organized into 6 chapters with full move-by-move annotations and a Practice mode.",
    difficulty: "advanced",
    icon: "🔥",
    startingMoves: "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 e5",
    totalVariations: 50,
    tree: [
      m("e4", "1.e4 — King's pawn opening, the gateway to the Kalashnikov.", [
        m("c5", "1...c5 — The Sicilian.", [
          m("Nf3", "2.Nf3 — Standard development.", [
            m("Nc6", "2...Nc6 — Heading for the Kalashnikov.", [
              m("d4", "3.d4 — Opening the center.", [
                m("cxd4", "3...cxd4 — The Open Sicilian.", [
                  m("Nxd4", "4.Nxd4 — Recapture.", [
                    m("e5", "4...e5! — The Kalashnikov pawn break.", []),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
];

// Utility: flatten all moves in a tree to get a list of variation paths
export function countVariationPaths(moves: OpeningMove[]): number {
  let count = 0;
  function walk(nodes: OpeningMove[]) {
    for (const node of nodes) {
      if (node.children.length === 0) {
        count++;
      } else {
        walk(node.children);
      }
    }
  }
  walk(moves);
  return count;
}

// Get all leaf paths (complete variations)
export function getAllVariationPaths(tree: OpeningMove[]): OpeningMove[][] {
  const paths: OpeningMove[][] = [];
  function walk(nodes: OpeningMove[], current: OpeningMove[]) {
    for (const node of nodes) {
      const path = [...current, node];
      if (node.children.length === 0) {
        paths.push(path);
      } else {
        walk(node.children, path);
      }
    }
  }
  walk(tree, []);
  return paths;
}

// Get the main line (always follow isMainLine = true)
export function getMainLine(tree: OpeningMove[]): OpeningMove[] {
  const line: OpeningMove[] = [];
  let nodes = tree;
  while (nodes.length > 0) {
    const main = nodes.find(n => n.isMainLine) || nodes[0];
    line.push(main);
    nodes = main.children;
  }
  return line;
}
