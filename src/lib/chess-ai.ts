import { Chess } from "chess.js";

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Positional bonus tables (simplified, from white's perspective)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5,  5,  5,  5,  5,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0,
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
];

const POSITION_TABLES: Record<string, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  k: KING_TABLE,
};

function getPositionBonus(piece: string, index: number, isWhite: boolean): number {
  const table = POSITION_TABLES[piece];
  if (!table) return 0;
  const i = isWhite ? index : 63 - index;
  return table[i];
}

// Fast incremental evaluation without mobility (used in search)
function evaluateMaterial(game: Chess): number {
  const board = game.board();
  let score = 0;

  if (game.isCheckmate()) {
    return game.turn() === "w" ? -50000 : 50000;
  }
  if (game.isDraw() || game.isStalemate()) return 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] || 0;
      const posBonus = getPositionBonus(piece.type, r * 8 + c, piece.color === "w");
      if (piece.color === "w") {
        score += value + posBonus;
      } else {
        score -= value + posBonus;
      }
    }
  }

  return score;
}

export function evaluateBoard(game: Chess): number {
  let score = evaluateMaterial(game);
  // Mobility bonus (only at root for display purposes)
  const currentMoves = game.moves().length;
  score += (game.turn() === "w" ? 1 : -1) * currentMoves * 2;
  return score;
}

// Move ordering heuristic: score moves to search best candidates first
function scoreMove(game: Chess, move: string): number {
  let score = 0;
  game.move(move);
  if (game.isCheckmate()) { game.undo(); return 100000; }
  if (game.inCheck()) score += 500;
  game.undo();

  // Captures: MVV-LVA heuristic
  // SAN-based detection: captures contain 'x'
  if (move.includes("x")) score += 1000;
  // Promotions
  if (move.includes("=")) score += 800;

  return score;
}

function orderMoves(game: Chess, moves: string[]): string[] {
  const scored = moves.map(m => ({ move: m, score: scoreMove(game, m) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.move);
}

// Quiescence search to avoid horizon effect on captures
function quiescence(game: Chess, alpha: number, beta: number, isMaximizing: boolean, maxQDepth: number): number {
  const standPat = evaluateMaterial(game);

  if (maxQDepth <= 0) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  // Only search captures
  const allMoves = game.moves();
  const captures = allMoves.filter(m => m.includes("x"));
  if (captures.length === 0) return standPat;

  if (isMaximizing) {
    for (const move of captures) {
      game.move(move);
      const eval_ = quiescence(game, alpha, beta, false, maxQDepth - 1);
      game.undo();
      if (eval_ > alpha) alpha = eval_;
      if (beta <= alpha) break;
    }
    return alpha;
  } else {
    for (const move of captures) {
      game.move(move);
      const eval_ = quiescence(game, alpha, beta, true, maxQDepth - 1);
      game.undo();
      if (eval_ < beta) beta = eval_;
      if (beta <= alpha) break;
    }
    return beta;
  }
}

// Minimax with alpha-beta pruning + move ordering + quiescence
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return quiescence(game, alpha, beta, isMaximizing, 3);
  }

  const moves = orderMoves(game, game.moves());

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export type Difficulty = "beginner" | "casual" | "intermediate" | "advanced" | "master";

export interface AILevel {
  value: Difficulty;
  label: string;
  rating: number;
  desc: string;
  depth: number;
  mistakeChance: number;
}

export const AI_LEVELS: AILevel[] = [
  { value: "beginner", label: "Novice", rating: 400, desc: "Random blunders, learns the basics", depth: 1, mistakeChance: 0.5 },
  { value: "casual", label: "Casual", rating: 800, desc: "Sees simple tactics", depth: 2, mistakeChance: 0.25 },
  { value: "intermediate", label: "Club", rating: 1200, desc: "Solid tactical awareness", depth: 3, mistakeChance: 0.1 },
  { value: "advanced", label: "Expert", rating: 1600, desc: "Strong positional play", depth: 3, mistakeChance: 0.02 },
  { value: "master", label: "Master", rating: 2000, desc: "Deep calculation, rarely blunders", depth: 4, mistakeChance: 0 },
];

export function getAIMove(game: Chess, difficulty: Difficulty): string | null {
  const moves = game.moves();
  if (moves.length === 0) return null;

  const level = AI_LEVELS.find((l) => l.value === difficulty)!;

  // Random mistake chance
  if (Math.random() < level.mistakeChance) {
    if (level.rating >= 800) {
      const evaluated = moves.map((move) => {
        game.move(move);
        const score = evaluateMaterial(game);
        game.undo();
        return { move, score };
      });
      const isWhite = game.turn() === "w";
      evaluated.sort((a, b) => isWhite ? b.score - a.score : a.score - b.score);
      const mid = Math.floor(evaluated.length / 2);
      const range = Math.max(1, Math.floor(evaluated.length / 4));
      return evaluated[mid + Math.floor(Math.random() * range) - Math.floor(range / 2)]?.move ?? moves[0];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = level.depth;
  const isWhite = game.turn() === "w";

  // Use move ordering at root level too
  const orderedMoves = orderMoves(game, moves);

  let bestMove = orderedMoves[0];
  let bestEval = isWhite ? -Infinity : Infinity;

  for (const move of orderedMoves) {
    game.move(move);
    const eval_ = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite ? eval_ > bestEval : eval_ < bestEval) {
      bestEval = eval_;
      bestMove = move;
    }
  }

  return bestMove;
}
