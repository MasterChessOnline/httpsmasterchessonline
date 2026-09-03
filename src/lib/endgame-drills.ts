// Endgame drills — the single, focused product of MasterChess.
// Each drill is a real, solvable endgame. The player always moves first (white),
// a bot defends. Winning condition is checkmate (or promotion where noted).

export type EndgameDrill = {
  id: string;
  title: string;
  /** Short promise: what the player learns. */
  goal: string;
  fen: string;
  /** Difficulty band for grouping. */
  level: "basic" | "core" | "hard";
  /** Rating of the defending bot (used to pick engine strength). */
  defenderRating: number;
  /** Move budget — drills must be won efficiently, like a real technique test. */
  moveLimit: number;
  /** One-line technique hint shown on request. */
  hint: string;
};

export const ENDGAME_DRILLS: EndgameDrill[] = [
  {
    id: "king-queen-mate",
    title: "King + Queen vs King",
    goal: "The first mate every player must own.",
    fen: "8/8/8/4k3/8/8/4Q3/4K3 w - - 0 1",
    level: "basic",
    defenderRating: 1200,
    moveLimit: 20,
    hint: "Shrink the box with the queen a knight's move away, then bring your king up.",
  },
  {
    id: "king-rook-mate",
    title: "King + Rook vs King",
    goal: "Master the staircase mate.",
    fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
    level: "basic",
    defenderRating: 1200,
    moveLimit: 25,
    hint: "Cut the king off with the rook, walk your king in, then deliver mate on the edge.",
  },
  {
    id: "pawn-promotion-basic",
    title: "King + Pawn vs King",
    goal: "Promote the pawn — key squares decide it.",
    fen: "8/8/8/3k4/8/3K4/3P4/8 w - - 0 1",
    level: "basic",
    defenderRating: 1400,
    moveLimit: 25,
    hint: "King in front of the pawn first. Take the key squares before you push.",
  },
  {
    id: "lucena",
    title: "Lucena Position",
    goal: "The most important rook endgame win.",
    fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
    level: "core",
    defenderRating: 1600,
    moveLimit: 25,
    hint: "Build the bridge: rook to the fourth rank, then shield your king with it.",
  },
  {
    id: "two-bishops",
    title: "Two Bishops Mate",
    goal: "Drive the lone king to the corner.",
    fen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
    level: "core",
    defenderRating: 1500,
    moveLimit: 30,
    hint: "Bishops on adjacent diagonals build a wall; your king pushes the defender back.",
  },
  {
    id: "rook-vs-pawn",
    title: "Rook vs Pawn",
    goal: "Stop the runner, then win it.",
    fen: "8/8/8/8/8/1k6/1p6/1K1R4 w - - 0 1",
    level: "core",
    defenderRating: 1600,
    moveLimit: 25,
    hint: "Attack the pawn from behind or cut the king from it — never chase blindly.",
  },
  {
    id: "queen-vs-rook",
    title: "Queen vs Rook",
    goal: "The hardest basic win in chess.",
    fen: "8/8/8/4k3/4r3/8/4Q3/4K3 w - - 0 1",
    level: "hard",
    defenderRating: 1800,
    moveLimit: 35,
    hint: "Force the rook away from its king with checks, then win it with a fork.",
  },
  {
    id: "philidor-attack",
    title: "Breaking the Philidor Defence",
    goal: "Convert the extra rook pawn under pressure.",
    fen: "8/8/8/8/8/4k3/4p3/4K1R1 w - - 0 1",
    level: "hard",
    defenderRating: 1800,
    moveLimit: 25,
    hint: "Win the pawn with your rook while keeping your king close enough to help.",
  },
];

export const LEVEL_LABEL: Record<EndgameDrill["level"], string> = {
  basic: "Basics",
  core: "Must-know",
  hard: "Advanced",
};

export function getDrill(id: string | undefined) {
  return ENDGAME_DRILLS.find((d) => d.id === id);
}
