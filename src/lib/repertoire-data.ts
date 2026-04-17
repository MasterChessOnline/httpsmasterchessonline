// Curated repertoire recommendations by color × playstyle
export type Color = "white" | "black";
export type Style = "aggressive" | "positional" | "tactical" | "solid";

export interface RepertoireLine {
  name: string;
  eco: string;
  moves: string;
  idea: string;
  keySquares: string[];
  plan: string[];
  trap?: string;
}

export interface RepertoireRecommendation {
  color: Color;
  style: Style;
  primary: RepertoireLine;
  alternative: RepertoireLine;
}

const DB: RepertoireRecommendation[] = [
  // WHITE
  {
    color: "white", style: "aggressive",
    primary: {
      name: "King's Gambit", eco: "C30-C39", moves: "1.e4 e5 2.f4",
      idea: "Sacrifice a pawn for rapid development and a kingside attack.",
      keySquares: ["f4", "f7"],
      plan: ["Open the f-file fast", "Get the king to safety with O-O", "Pile pieces on f7"],
      trap: "After 2…exf4 3.Nf3 g5 4.Bc4 g4? 5.O-O! gxf3 6.Qxf3 — devastating attack on f7.",
    },
    alternative: {
      name: "Italian — Evans Gambit", eco: "C51-C52", moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4",
      idea: "Sacrifice the b-pawn to win tempo and build a strong center.",
      keySquares: ["d4", "f7"],
      plan: ["Play c3 and d4 quickly", "Castle short", "Open the position for the bishops"],
    },
  },
  {
    color: "white", style: "positional",
    primary: {
      name: "London System", eco: "D02", moves: "1.d4 d5 2.Nf3 Nf6 3.Bf4",
      idea: "Solid setup with bishop on f4. Same pieces every game — easy to learn, hard to crack.",
      keySquares: ["e5", "c4"],
      plan: ["Develop e3, Bd3, Nbd2, c3, O-O", "Trade dark-squared bishops carefully", "Push e4 at the right moment"],
      trap: "If Black plays …Nh5 to chase the bishop: Bg5! f6 Bh4 g5 Bg3 Nxg3 hxg3 — open h-file for attack.",
    },
    alternative: {
      name: "Catalan", eco: "E00-E09", moves: "1.d4 Nf6 2.c4 e6 3.g3",
      idea: "Long-diagonal pressure with the g2-bishop and small structural advantages.",
      keySquares: ["c4", "long diagonal a8-h1"],
      plan: ["Castle short fast", "Pressure d5 and the queenside", "Trade into a slightly better endgame"],
    },
  },
  {
    color: "white", style: "tactical",
    primary: {
      name: "Italian — Giuoco Piano", eco: "C53", moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3",
      idea: "Build a big center with d4, then look for combinations on f7.",
      keySquares: ["d4", "f7", "e5"],
      plan: ["c3 and d4 to grab the center", "Aim Nbd2-f1-g3 for kingside attack", "Watch for Bxf7+ shots"],
    },
    alternative: {
      name: "Scotch Game", eco: "C45", moves: "1.e4 e5 2.Nf3 Nc6 3.d4",
      idea: "Open the position immediately — excellent for tactical players.",
      keySquares: ["d4", "e5"],
      plan: ["Trade in the center", "Develop with tempo", "Use open files to attack"],
    },
  },
  {
    color: "white", style: "solid",
    primary: {
      name: "Queen's Gambit", eco: "D06-D69", moves: "1.d4 d5 2.c4",
      idea: "Pressure d5 from the side. Time-tested, strategically rich.",
      keySquares: ["c4", "d5", "c-file"],
      plan: ["Develop knights to f3 and c3", "Castle short", "Use the c-file as a long-term plan"],
    },
    alternative: {
      name: "English Opening", eco: "A10-A39", moves: "1.c4",
      idea: "Flexible flank opening — transposes to many systems based on Black's reply.",
      keySquares: ["d5", "c4"],
      plan: ["Fianchetto the king bishop with g3", "Pressure the queenside", "Choose pawn structure based on Black's setup"],
    },
  },
  // BLACK
  {
    color: "black", style: "aggressive",
    primary: {
      name: "Sicilian Najdorf", eco: "B90-B99", moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6",
      idea: "Most ambitious answer to 1.e4 — fight for a win, not a draw.",
      keySquares: ["b5", "e5", "queenside"],
      plan: ["…e5 or …e6 to fight for d5", "Queenside expansion with …b5", "Often opposite-side castling — race to attack"],
      trap: "Against the English Attack, …Ng4 hitting f2 can be very strong if White is careless.",
    },
    alternative: {
      name: "King's Indian Defense", eco: "E60-E99", moves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6",
      idea: "Let White have the center, then break it with …e5 and storm the kingside.",
      keySquares: ["f4", "g4", "kingside"],
      plan: ["Castle short and play …e5", "Push …f5-f4 for kingside attack", "Sac material on the king"],
    },
  },
  {
    color: "black", style: "positional",
    primary: {
      name: "Caro-Kann", eco: "B10-B19", moves: "1.e4 c6 2.d4 d5",
      idea: "Solid pawn structure, no weaknesses. The endgame is your friend.",
      keySquares: ["d5", "c6"],
      plan: ["Get the light-squared bishop outside the pawn chain (…Bf5)", "Aim for a healthy structure", "Trade into endgames"],
    },
    alternative: {
      name: "Slav Defense", eco: "D10-D19", moves: "1.d4 d5 2.c4 c6",
      idea: "Reinforce d5 without locking in the bishop.",
      keySquares: ["d5", "e4"],
      plan: ["Develop the c8-bishop actively", "Solid structure", "Strike with …e5 or …c5 at the right moment"],
    },
  },
  {
    color: "black", style: "tactical",
    primary: {
      name: "Sicilian Dragon", eco: "B70-B79", moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6",
      idea: "Bishop on g7 hits the long diagonal. Razor-sharp, theory-heavy.",
      keySquares: ["g7", "c-file", "long diagonal h8-a1"],
      plan: ["Castle short", "Push …a6, …b5 on the queenside", "Sacrifice exchange on c3 if needed"],
    },
    alternative: {
      name: "Benoni Defense", eco: "A60-A79", moves: "1.d4 Nf6 2.c4 c5 3.d5 e6",
      idea: "Asymmetric, dynamic, full of imbalances.",
      keySquares: ["d6", "e5", "c-file"],
      plan: ["Fianchetto the king bishop", "Push …b5 with a sacrifice", "Activate pieces on the queenside"],
    },
  },
  {
    color: "black", style: "solid",
    primary: {
      name: "French Defense", eco: "C00-C19", moves: "1.e4 e6 2.d4 d5",
      idea: "Closed center, clear plans, hard to break.",
      keySquares: ["d5", "e6", "c5"],
      plan: ["Strike with …c5", "Develop the queenside", "Patient maneuvering"],
    },
    alternative: {
      name: "Nimzo-Indian", eco: "E20-E59", moves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4",
      idea: "Pin the knight, double White's pawns, control e4.",
      keySquares: ["e4", "c4"],
      plan: ["Trade Bxc3 to ruin White's pawns", "Blockade light squares", "Slowly outplay in the middlegame"],
    },
  },
];

export function getRepertoire(color: Color, style: Style): RepertoireRecommendation {
  return DB.find((r) => r.color === color && r.style === style)!;
}

export const STYLE_INFO: Record<Style, { label: string; desc: string; icon: string }> = {
  aggressive: { label: "Aggressive", desc: "Attack, sacrifice, go for the king", icon: "⚔️" },
  positional: { label: "Positional", desc: "Slow squeeze, structure, endgames", icon: "🧠" },
  tactical: { label: "Tactical", desc: "Open positions, combinations, calculation", icon: "💥" },
  solid: { label: "Solid", desc: "No weaknesses, principled play", icon: "🛡️" },
};
