// SEO copy and FAQs per opening, layered on top of OPENINGS_DATABASE.
// Targets high-volume Google queries like "italian game opening moves" or "sicilian najdorf explained".

export interface OpeningSeoMeta {
  id: string;                     // matches Opening.id in OPENINGS_DATABASE when available
  slug: string;                   // URL slug
  searchVolume?: number;          // monthly Google volume (rough)
  longTitle: string;              // <60 chars
  longDescription: string;        // <160 chars
  keyIdeas: string[];             // 3-5 strategic ideas
  famousGames?: string[];         // line items
  faqs: { q: string; a: string }[];
  // Standalone fallback fields — used when there's no matching OPENINGS_DATABASE entry
  name?: string;
  eco?: string;
  category?: string;
  difficulty?: string;
  startingMoves?: string;
  description?: string;
}

export const OPENING_SEO: Record<string, OpeningSeoMeta> = {
  "italian-game": {
    id: "italian-game",
    slug: "italian-game",
    searchVolume: 8100,
    longTitle: "Italian Game — Moves, Theory & Best Lines",
    longDescription: "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) — moves, ideas, Giuoco Piano, Two Knights, Evans Gambit. Free interactive trainer.",
    keyIdeas: [
      "Develop fast and target f7 — Black's weakest square",
      "Build a central pawn duo with c3 + d4",
      "Castle short within the first 8 moves",
      "Maneuver the knight to g3 via Nbd2-Nf1-Ng3",
      "Switch to a kingside attack once development is finished",
    ],
    famousGames: [
      "Greco vs NN, 1620 — earliest recorded brilliancy",
      "Anderssen vs Kieseritzky, 1851 'Immortal Game'",
      "Carlsen vs Karjakin, 2016 World Championship Game 12",
    ],
    faqs: [
      { q: "Is the Italian Game good for beginners?", a: "Yes — it teaches every classical principle (fast development, central control, kingside attack) without weird traps." },
      { q: "Italian Game vs Ruy Lopez — which is better?", a: "Both are world-class. The Italian is friendlier for beginners; the Ruy Lopez is sharper and more theoretical." },
      { q: "What is the Fried Liver Attack?", a: "A famous Italian Two Knights line: 4.Ng5 d5 5.exd5 Nxd5 6.Nxf7 — sacrifices a knight for a devastating king-hunt." },
    ],
  },
  "sicilian-defense": {
    id: "sicilian-defense",
    slug: "sicilian-defense",
    searchVolume: 27100,
    longTitle: "Sicilian Defense — Najdorf, Dragon, Sveshnikov & More",
    longDescription: "Sicilian Defense (1.e4 c5) — Black's sharpest weapon. Najdorf, Dragon, Sveshnikov, Taimanov lines explained with Stockfish.",
    keyIdeas: [
      "Fight for the center asymmetrically — c5 vs e4",
      "Open the c-file for the queen and rooks",
      "Use the queenside pawn majority in the endgame",
      "Counter-attack on opposite sides after castling",
      "Embrace complications — the Sicilian rewards aggression",
    ],
    famousGames: [
      "Fischer vs Spassky, 1972 World Championship Game 6",
      "Kasparov vs Topalov, 1999 'Kasparov's Immortal'",
      "Carlsen vs Caruana, 2018 World Championship",
    ],
    faqs: [
      { q: "Is the Sicilian good for beginners?", a: "Below 1400 ELO, its theory burden outweighs the rewards. Try the Caro-Kann or Scandinavian first." },
      { q: "What is the best Sicilian variation?", a: "The Najdorf is statistically the most successful; the Sveshnikov is the modern elite favorite." },
      { q: "Why is it called 'Sicilian'?", a: "First analyzed by Italian priest Pietro Carrera in 1617 — his book 'Il Gioco degli Scacchi' named the line after the island of Sicily." },
    ],
  },
  "french-defense": {
    id: "french-defense",
    slug: "french-defense",
    searchVolume: 14800,
    longTitle: "French Defense — Solid Reply to 1.e4 (Full Guide)",
    longDescription: "French Defense (1.e4 e6) — solid, asymmetric, counter-attacking. Winawer, Tarrasch, Advance, Exchange lines explained.",
    keyIdeas: [
      "Concede the center temporarily to strike back with …c5 and …f6",
      "Accept the bad light-squared bishop in exchange for a rock-solid pawn chain",
      "Pressure white's d4 pawn relentlessly",
      "Counter-attack on the queenside",
      "Play for long-term positional advantages — endgame skills matter",
    ],
    famousGames: [
      "Botvinnik vs Capablanca, 1938 AVRO — eternal positional masterpiece",
      "Kortschnoj vs Karpov, 1978 World Championship",
    ],
    faqs: [
      { q: "Is the French Defense good?", a: "Yes — used by every world champion at some point. Slightly worse statistically than the Sicilian, but vastly less theoretical." },
      { q: "What's the main weakness of the French?", a: "Black's light-squared bishop on c8 is often passive for many moves. Trading it is a long-term goal." },
    ],
  },
  "ruy-lopez": {
    id: "ruy-lopez",
    slug: "ruy-lopez-spanish",
    searchVolume: 12100,
    longTitle: "Ruy Lopez (Spanish Opening) — Moves & Main Lines",
    longDescription: "Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5) — the Spanish Opening. Berlin, Closed, Marshall, Exchange variations.",
    keyIdeas: [
      "Pressure Black's knight on c6 — the defender of e5",
      "Build a strong center with c3 + d4 when ready",
      "Long maneuvering games — patience is key",
      "Knight tour Nb1-d2-f1-g3 is a Spanish signature",
      "Switch between kingside and queenside attack depending on Black's setup",
    ],
    famousGames: [
      "Capablanca vs Marshall, 1918 — the Marshall Attack is born",
      "Fischer vs Spassky, 1992 Rematch Game 1",
      "Kramnik vs Kasparov, 2000 — Berlin Wall makes a comeback",
    ],
    faqs: [
      { q: "Why is it called Ruy Lopez?", a: "Named after Spanish priest Ruy López de Segura, who analyzed it in 1561." },
      { q: "Is the Ruy Lopez too theoretical?", a: "The main lines are deep, but the Exchange Variation (4.Bxc6) is friendly to club players." },
    ],
  },
  "queens-gambit": {
    id: "queens-gambit",
    slug: "queens-gambit",
    searchVolume: 33100,
    longTitle: "Queen's Gambit — Accepted, Declined, Slav (Full Guide)",
    longDescription: "Queen's Gambit (1.d4 d5 2.c4) — Accepted, Declined, and Slav explained. The opening that made the Netflix series famous.",
    keyIdeas: [
      "Challenge Black's d5 pawn immediately to weaken the center",
      "Develop knights to c3 and f3 fast",
      "Bishops to f4 or g5 to pressure the kingside",
      "Recover the gambit pawn at leisure if Black accepts",
      "Build a minority attack on the queenside in the Exchange QGD",
    ],
    famousGames: [
      "Botvinnik vs Capablanca, 1938",
      "Kasparov vs Karpov, 1985 World Championship",
      "Carlsen vs Anand, 2014 World Championship",
    ],
    faqs: [
      { q: "Is the Queen's Gambit a real gambit?", a: "Technically yes, but white almost always recovers the pawn within a few moves." },
      { q: "Should I accept the Queen's Gambit?", a: "Playable but theoretically slightly worse. Most strong players decline with 2…e6 or play the Slav." },
    ],
  },
  "kings-indian": {
    id: "kings-indian",
    slug: "kings-indian-defense",
    searchVolume: 6600,
    longTitle: "King's Indian Defense — Counter-Attacking 1.d4",
    longDescription: "King's Indian Defense (1.d4 Nf6 2.c4 g6) — Kasparov and Fischer's favorite counter-attacker. Mar del Plata, Sämisch, Classical.",
    keyIdeas: [
      "Concede space in the opening to launch a kingside pawn storm later",
      "Place the bishop on g7 — eyes the long diagonal",
      "Trigger …e5 and …f5 to attack the white king",
      "Accept positional disadvantages for dynamic attacking chances",
      "Castle short, then race white's queenside attack",
    ],
    famousGames: [
      "Fischer vs Reshevsky, 1958",
      "Kasparov vs Karpov, 1990 World Championship Game 24",
    ],
    faqs: [
      { q: "Is the King's Indian still good in 2026?", a: "It's slightly out of favor at the very top but produces tactical fireworks at club level — Hikaru Nakamura plays it." },
      { q: "How do I play the King's Indian?", a: "Develop with …Nf6, …g6, …Bg7, …d6, …O-O, then …Nbd7 and …e5. Strike with …f5 in the middlegame." },
    ],
  },
  "london-system": {
    id: "london-system",
    slug: "london-system",
    searchVolume: 18100,
    longTitle: "London System — Easiest 1.d4 Opening (Full Guide)",
    longDescription: "London System (1.d4, 2.Nf3, 3.Bf4) — easy to learn, hard to beat. Used by Magnus Carlsen at the top level.",
    keyIdeas: [
      "Same setup against almost any black response — easy to memorize",
      "Develop the dark-squared bishop to f4 BEFORE playing e3",
      "Aim for c3, Bd3, Nbd2, h3 setup behind the pawn chain",
      "Castle short and play for a long maneuvering game",
      "Trade dark-squared bishops to exploit weak dark squares",
    ],
    famousGames: [
      "Carlsen vs Karjakin, 2016 World Championship Tiebreak",
      "Carlsen vs Anand, 2014 World Championship",
    ],
    faqs: [
      { q: "Is the London System for beginners?", a: "Perfect for beginners. Easy to learn, hard to lose in the opening." },
      { q: "Is the London System boring?", a: "Reputation is unfair. Modern lines with h4 are very aggressive." },
    ],
  },
  "caro-kann": {
    id: "caro-kann",
    slug: "caro-kann-defense",
    searchVolume: 9900,
    longTitle: "Caro-Kann Defense — Solid Reply to 1.e4",
    longDescription: "Caro-Kann (1.e4 c6) — solid, principled, rock-solid pawn structure. Karpov and Anand's favorite.",
    keyIdeas: [
      "Support the …d5 break with a pawn instead of a knight",
      "Avoid Sicilian theory with similar central control",
      "Accept a slightly passive bishop on c8 for structural soundness",
      "Counter-attack the queenside in the endgame",
      "Trade light-squared bishops via …Bf5 in the main line",
    ],
    famousGames: [
      "Capablanca vs Nimzowitsch, 1927",
      "Karpov vs Kasparov, 1984 — many games in the World Championship marathon",
    ],
    faqs: [
      { q: "Caro-Kann vs French — which is better?", a: "Both are sound. The Caro-Kann is slightly more flexible; the French is sharper." },
      { q: "Is the Caro-Kann for beginners?", a: "Excellent for beginners — low theory, principled, high winning chances against unprepared opponents." },
    ],
  },
  "english-opening": {
    id: "english-opening",
    slug: "english-opening",
    searchVolume: 8100,
    longTitle: "English Opening — Hypermodern Power for White (1.c4)",
    longDescription: "English Opening (1.c4) — flexible, hypermodern, the choice of Magnus Carlsen and Bobby Fischer.",
    keyIdeas: [
      "Control e4 from the flank instead of occupying it",
      "Transpose into d4 or stay independent",
      "Fianchetto the king's bishop for long-diagonal pressure",
      "Avoid mainline 1.e4 and 1.d4 theory",
      "Aim for positional pressure with subtle pawn structures",
    ],
    famousGames: [
      "Fischer vs Spassky, 1972 World Championship Game 6",
      "Carlsen vs Ding Liren, 2019 Sinquefield Cup",
    ],
    faqs: [
      { q: "Is 1.c4 a good opening?", a: "Yes — it's been a top-level opening for over a century and is currently popular with elite players." },
      { q: "Can the English transpose into other openings?", a: "Yes — into the Reti, the QGD, the Symmetrical English, and even the King's Indian. Very flexible." },
    ],
  },
  "scandinavian": {
    id: "scandinavian",
    slug: "scandinavian-defense",
    searchVolume: 4400,
    longTitle: "Scandinavian Defense — Easy 1.e4 Reply for Black",
    longDescription: "Scandinavian Defense (1.e4 d5) — bold central challenge with almost zero theory. Perfect for club players.",
    keyIdeas: [
      "Challenge white's center immediately with …d5",
      "Develop the queen actively (or recapture with the knight)",
      "Play …c6 to support the queen on a5 (Mieses Variation)",
      "Castle queenside in some lines for opposite-side attacks",
      "Use the open d-file for the rooks",
    ],
    famousGames: [
      "Anand vs Lautier, 1997 — main-line Scandinavian masterclass",
    ],
    faqs: [
      { q: "Is the Scandinavian good at master level?", a: "Played by Carlsen and Anand in serious games. Solid but slightly passive." },
      { q: "Why is it called Scandinavian?", a: "Popular in 19th-century Scandinavia and once known as the 'Center Counter Defense'." },
    ],
  },
  "kings-gambit": {
    id: "kings-gambit",
    slug: "kings-gambit",
    searchVolume: 6600,
    longTitle: "King's Gambit — Romantic Attack & Theory",
    longDescription: "King's Gambit (1.e4 e5 2.f4) — sacrifice a pawn for open lines and a kingside attack. Famous lines, traps, and modern theory.",
    keyIdeas: [
      "Sacrifice the f-pawn to open the f-file fast",
      "Aim Bc4 at f7 and the exposed Black king",
      "Push d4 to seize the center after castling",
      "Convert dynamic compensation into a direct mating attack",
    ],
    famousGames: [
      "Anderssen vs Kieseritzky, 1851 — the Immortal Game",
      "Spassky vs Fischer, 1960 — masterclass in defense",
    ],
    faqs: [
      { q: "Is the King's Gambit still playable?", a: "Yes — surprise weapon at all levels. Sound enough with the Bishop's Gambit (3.Bc4) or Falkbeer setups." },
      { q: "How do you refute the King's Gambit?", a: "Black should accept (2...exf4) and aim for ...d5 to free the position; the Modern Defense (2...exf4 3.Nf3 d6) is solid." },
    ],
  },
  "vienna-game": {
    id: "vienna-game",
    slug: "vienna-game",
    searchVolume: 5400,
    longTitle: "Vienna Game — Flexible 1.e4 e5 Weapon",
    longDescription: "Vienna Game (1.e4 e5 2.Nc3) — flexible knight development, sharp f4 push, surprising traps and modern lines.",
    keyIdeas: [
      "Knight before bishop — keep the c4 / Bb5 choice open",
      "Strike with f4 once the king is safe",
      "Aim for a delayed King's Gambit setup",
      "Punish ...Nf6 with the Frankenstein-Dracula trap",
    ],
    faqs: [
      { q: "Is the Vienna Game good for beginners?", a: "Excellent — simple development with sharp attacking ideas baked in." },
      { q: "What is the Vienna Gambit?", a: "1.e4 e5 2.Nc3 Nf6 3.f4 — a delayed King's Gambit hitting Black's developed knight." },
    ],
  },
  "pirc-defense": {
    id: "pirc-defense",
    slug: "pirc-defense",
    searchVolume: 4400,
    longTitle: "Pirc Defense — Hypermodern Counterattack",
    longDescription: "Pirc Defense (1.e4 d6 2.d4 Nf6 3.Nc3 g6) — let White build the center, then strike with ...c5 or ...e5.",
    keyIdeas: [
      "Fianchetto the bishop to g7 for long-diagonal pressure",
      "Provoke an over-extended center, then dynamite it",
      "Use ...c5 or ...e5 as the main counter-break",
      "Castle short, then play on the queenside",
    ],
    faqs: [
      { q: "Is the Pirc Defense sound?", a: "Yes — used by Azmaiparashvili, Seirawan, and many GMs as a fighting weapon against 1.e4." },
      { q: "Pirc vs Modern Defense?", a: "Pirc commits ...Nf6 early; Modern (1.e4 g6) keeps the knight flexible for ...Nh6 or ...Nf6 later." },
    ],
  },
  "alekhines-defense": {
    id: "alekhines-defense",
    slug: "alekhines-defense",
    searchVolume: 4200,
    longTitle: "Alekhine's Defense — Provoke the Center",
    longDescription: "Alekhine's Defense (1.e4 Nf6) — bait White's pawns forward, then dismantle the over-extended center.",
    keyIdeas: [
      "Lure White into the Four Pawns Attack, then counter-break",
      "Use the knight on b6 to harass the d-pawn",
      "Trade pieces to expose the over-extended pawns",
      "Strike with ...c5 or ...f6 at the right moment",
    ],
    faqs: [
      { q: "Is Alekhine's Defense good?", a: "Sharp and underestimated. Strong as a surprise weapon — Carlsen has played it in serious games." },
      { q: "Best line for White?", a: "Modern Variation (4.Nf3) — solid, no overextension, keeps a small space edge." },
    ],
  },
  "nimzo-indian-defense": {
    id: "nimzo-indian-defense",
    slug: "nimzo-indian-defense",
    searchVolume: 7400,
    longTitle: "Nimzo-Indian Defense — Strategy & Best Lines",
    longDescription: "Nimzo-Indian (1.d4 Nf6 2.c4 e6 3.Nc3 Bb4) — pin the knight, double White's c-pawns, dominate dark squares.",
    keyIdeas: [
      "Pin Nc3 with Bb4 and threaten to trade for doubled c-pawns",
      "Place the bishop on b7 for a powerful long diagonal",
      "Aim for ...d5 / ...c5 breaks in the center",
      "Use prophylactic moves like ...h6 before kingside expansion",
    ],
    famousGames: [
      "Capablanca vs Réti, 1928 — classical Nimzo handling",
      "Kasparov vs Karpov, 1985 WCC — both sides showed mastery",
    ],
    faqs: [
      { q: "Is the Nimzo-Indian sound?", a: "One of the most respected defenses in chess history — used by every World Champion since 1930." },
      { q: "Main White answers?", a: "Rubinstein 4.e3, Classical 4.Qc2, and Sämisch 4.a3 — each leads to completely different middlegames." },
    ],
  },
  "slav-defense": {
    id: "slav-defense",
    slug: "slav-defense",
    searchVolume: 6100,
    longTitle: "Slav Defense — Rock-Solid vs 1.d4",
    longDescription: "Slav Defense (1.d4 d5 2.c4 c6) — keep the c8-bishop alive, lock the structure, build a fortress that any GM trusts.",
    keyIdeas: [
      "Support d5 with c6 instead of locking the bishop in",
      "Develop the bishop outside the pawn chain via ...Bf5 or ...Bg4",
      "Counter in the center with ...e5 or ...c5",
      "Aim for the dependable Czech / Semi-Slav structures",
    ],
    famousGames: [
      "Botvinnik vs Bronstein, 1951 — model Slav middlegame",
      "Anand vs Kramnik, 2008 WCC — Meran Variation showdown",
    ],
    faqs: [
      { q: "Slav vs Queen's Gambit Declined?", a: "Slav keeps the light-squared bishop active; QGD locks it in but supports d5 more naturally." },
      { q: "Is the Slav too passive?", a: "Far from it — Meran and Botvinnik lines are razor-sharp tactical fights." },
    ],
  },
};

// Standalone fallback fields for openings NOT in OPENINGS_DATABASE.
// Lets us ship dedicated SEO landing pages without bloating the trainer DB.
const STANDALONE: Record<string, Pick<OpeningSeoMeta, "name" | "eco" | "category" | "difficulty" | "startingMoves" | "description">> = {
  "kings-gambit":         { name: "King's Gambit",          eco: "C30–C39", category: "open game",        difficulty: "advanced",     startingMoves: "1.e4 e5 2.f4",                    description: "The romantic era's sharpest weapon — sacrifice a pawn for open lines and a kingside attack on the f-file." },
  "vienna-game":          { name: "Vienna Game",            eco: "C25–C29", category: "open game",        difficulty: "intermediate", startingMoves: "1.e4 e5 2.Nc3",                   description: "Flexible knight development that keeps a delayed King's Gambit on the table and threatens sharp f4 breaks." },
  "pirc-defense":         { name: "Pirc Defense",           eco: "B07–B09", category: "hypermodern",      difficulty: "advanced",     startingMoves: "1.e4 d6 2.d4 Nf6 3.Nc3 g6",       description: "A hypermodern reply against 1.e4 — let White build a center, then dynamite it with ...c5 and ...e5." },
  "alekhines-defense":    { name: "Alekhine's Defense",     eco: "B02–B05", category: "hypermodern",      difficulty: "advanced",     startingMoves: "1.e4 Nf6",                        description: "Provoke White's pawns forward, then dismantle the over-extended center — Alekhine's wild brainchild." },
  "nimzo-indian-defense": { name: "Nimzo-Indian Defense",   eco: "E20–E59", category: "indian defense",   difficulty: "intermediate", startingMoves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4",     description: "Pin the c3 knight, double White's c-pawns, and dominate the dark squares — a defense every World Champion has trusted." },
  "slav-defense":         { name: "Slav Defense",           eco: "D10–D19", category: "queen's pawn",     difficulty: "intermediate", startingMoves: "1.d4 d5 2.c4 c6",                description: "Rock-solid Slav structure — keep the c8-bishop alive while building a fortress against the Queen's Gambit." },
};

// Categories we expose to programmatic SEO (excludes 'masterclass-*' courses which aren't separate openings).
import { EXTRA_OPENINGS } from "./extra-opening-seo";

export const SEO_OPENING_IDS = [...Object.keys(OPENING_SEO), ...Object.keys(EXTRA_OPENINGS)];

export const ALL_OPENING_SLUGS: string[] = [
  ...Object.values(OPENING_SEO).map((o) => o.slug),
  ...Object.values(EXTRA_OPENINGS).map((o) => o.slug),
];

export const getOpeningBySlug = (slug: string): OpeningSeoMeta | null => {
  const extra = Object.values(EXTRA_OPENINGS).find((o) => o.slug === slug);
  if (extra) return extra;
  const found = Object.values(OPENING_SEO).find((o) => o.slug === slug);
  if (!found) return null;
  const fallback = STANDALONE[found.id];
  return fallback ? { ...fallback, ...found } : found;
};


