import { Chess, Square, Piece } from "chess.js";

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

const POSITION_TABLES: Record<string, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
};

function getPositionBonus(piece: string, index: number, isWhite: boolean): number {
  const table = POSITION_TABLES[piece];
  if (!table) return 0;
  const i = isWhite ? index : 63 - index;
  return table[i];
}

// Evaluate the board from white's perspective
export function evaluateBoard(game: Chess): number {
  const board = game.board();
  let score = 0;

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

// Minimax with alpha-beta pruning
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves();

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

export type Difficulty = "beginner" | "intermediate" | "advanced";

const DEPTH_MAP: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// Beginner makes random mistakes sometimes
const MISTAKE_CHANCE: Record<Difficulty, number> = {
  beginner: 0.4,
  intermediate: 0.1,
  advanced: 0,
};

export function getAIMove(game: Chess, difficulty: Difficulty): string | null {
  const moves = game.moves();
  if (moves.length === 0) return null;

  // Random mistake chance
  if (Math.random() < MISTAKE_CHANCE[difficulty]) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = DEPTH_MAP[difficulty];
  const isWhite = game.turn() === "w";

  let bestMove = moves[0];
  let bestEval = isWhite ? -Infinity : Infinity;

  for (const move of moves) {
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
