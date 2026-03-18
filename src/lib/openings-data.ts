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
