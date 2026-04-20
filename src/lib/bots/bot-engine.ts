// Realistic bot move-picker:
// - Plays its preferred opening repertoire while in book
// - Mixes engine-best moves with inaccuracies / blunders based on bot rating
// - Biases move scoring by personality (aggressive, defensive, positional, etc.)
// - Returns a realistic "think time" so games feel human

import { Chess } from "chess.js";
import { evaluateBoard, getAIMove, type Difficulty } from "../chess-ai";
import type { BotProfile } from "./profiles";
import { OPENING_BOOKS, PLAYSTYLES, type Playstyle } from "./playstyles";

export interface BotMoveDecision {
  move: string;
  /** Engine's centipawn evaluation for the chosen move (player's perspective). */
  evalAfter: number;
  /** Engine's evaluation for the BEST move available. */
  bestEval: number;
  /** Centipawn loss vs best move (>= 0). */
  cpLoss: number;
  /** Classification of this move. */
  quality: "best" | "good" | "inaccuracy" | "mistake" | "blunder";
  /** Whether the bot followed its opening book. */
  fromBook: boolean;
}

/* ---------- Opening book lookup ---------- */

function tryOpeningBook(game: Chess, bot: BotProfile): string | null {
  const ply = game.history().length;
  if (ply >= bot.bookDepth) return null;

  const history = game.history(); // SAN
  const legal = game.moves();

  const candidates: string[] = [];
  for (const repertoire of bot.openings) {
    const lines = OPENING_BOOKS[repertoire];
    if (!lines) continue;
    for (const line of lines) {
      if (ply >= line.plies.length) continue;
      // verify our history matches one of the line's previous-ply options
      let matches = true;
      for (let i = 0; i < ply; i++) {
        const allowed = line.plies[i] ?? [];
        if (allowed.length === 0) continue; // wildcard
        if (!allowed.includes(history[i])) { matches = false; break; }
      }
      if (!matches) continue;
      const next = line.plies[ply] ?? [];
      for (const san of next) {
        if (legal.includes(san)) candidates.push(san);
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* ---------- Move scoring with playstyle bias ---------- */

const KING_FILE_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };

function isPawnStorm(move: string, game: Chess, attackerColor: "w" | "b"): boolean {
  // crude: pawn move (no piece letter) toward enemy king area
  if (/^[a-h]/.test(move) === false) return false;
  if (move.match(/^[NBRQK]/)) return false;
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === "k" && p.color !== attackerColor) {
        const enemyFile = c;
        const moveFile = KING_FILE_MAP[move[0]] ?? -1;
        return Math.abs(moveFile - enemyFile) <= 2;
      }
    }
  }
  return false;
}

function biasedMoveScore(
  move: string,
  game: Chess,
  style: Playstyle,
  movingColor: "w" | "b",
  ply: number,
): number {
  const cfg = PLAYSTYLES[style];
  let s = 0;
  if (move.includes("+") || move.includes("#")) s += cfg.attackBonus;
  if (move.includes("x")) s += cfg.captureBonus;
  if (move.match(/^(N|B)[a-h]?[1-8]?[a-h][1-8]$/) && ply < 14) s += cfg.developmentBonus;
  if (move.startsWith("Q") && move.includes("x") && ply < 12) s += cfg.earlyQueenTradePenalty;
  if (move.includes("=Q") || move.includes("=N")) s += 50;
  if (move === "O-O" || move === "O-O-O") s += cfg.developmentBonus + 10;
  if (isPawnStorm(move, game, movingColor)) s += cfg.pawnStormBonus;
  return s;
}

/* ---------- Evaluate a candidate move with playstyle bias ---------- */

interface ScoredMove {
  move: string;
  rawEval: number; // engine eval after this move (white-positive)
  totalScore: number; // rawEval (from mover's perspective) + style bonus
}

function scoreCandidates(game: Chess, bot: BotProfile, ply: number): ScoredMove[] {
  const moves = game.moves();
  const movingColor = game.turn();
  const sign = movingColor === "w" ? 1 : -1;

  return moves.map(m => {
    game.move(m);
    const ev = evaluateBoard(game);
    game.undo();
    const fromMoverPov = ev * sign;
    const styleBonus = biasedMoveScore(m, game, bot.playstyle, movingColor, ply);
    return { move: m, rawEval: ev, totalScore: fromMoverPov + styleBonus };
  });
}

/* ---------- Pick a "human-like" move with intentional mistakes ---------- */

export function getBotMove(game: Chess, bot: BotProfile): BotMoveDecision {
  if (game.isGameOver()) {
    return { move: "", evalAfter: 0, bestEval: 0, cpLoss: 0, quality: "best", fromBook: false };
  }

  const ply = game.history().length;
  const movingColor = game.turn();
  const sign = movingColor === "w" ? 1 : -1;

  // 1) Try opening book
  const bookMove = tryOpeningBook(game, bot);
  if (bookMove) {
    game.move(bookMove);
    const evalAfter = evaluateBoard(game);
    game.undo();
    return {
      move: bookMove,
      evalAfter,
      bestEval: evalAfter,
      cpLoss: 0,
      quality: "best",
      fromBook: true,
    };
  }

  // 2) Score every legal move (style-biased) and find engine-best
  const scored = scoreCandidates(game, bot, ply);
  if (scored.length === 0) {
    return { move: "", evalAfter: 0, bestEval: 0, cpLoss: 0, quality: "best", fromBook: false };
  }
  // sort by raw engine eval from mover's perspective — best first
  const byEngine = [...scored].sort((a, b) => (b.rawEval - a.rawEval) * sign);
  const best = byEngine[0];
  const bestFromMoverPov = best.rawEval * sign;

  // 3) Decide if the bot will play a non-best move (blunder / inaccuracy / style choice)
  const r = Math.random();

  // Blunder: pick a clearly worse move
  if (r < bot.blunderRate && byEngine.length > 1) {
    // Pick a move from the worst third
    const worstThird = byEngine.slice(Math.max(1, Math.floor(byEngine.length * 0.66)));
    const pick = worstThird[Math.floor(Math.random() * worstThird.length)];
    return finalize(game, bot, pick.move, best.rawEval, byEngine);
  }
  // Inaccuracy: pick from the middle of the pack
  if (r < bot.blunderRate + bot.inaccuracyRate && byEngine.length > 2) {
    const start = Math.floor(byEngine.length * 0.25);
    const end = Math.floor(byEngine.length * 0.6);
    const slice = byEngine.slice(Math.max(1, start), Math.max(2, end));
    const pick = slice[Math.floor(Math.random() * slice.length)] ?? byEngine[1];
    return finalize(game, bot, pick.move, best.rawEval, byEngine);
  }

  // 4) Otherwise — pick weighted by accuracy among top-N + style bias
  const topN = Math.min(byEngine.length, bot.accuracy >= 0.95 ? 2 : bot.accuracy >= 0.8 ? 3 : 5);
  const top = scored
    .filter(s => byEngine.slice(0, topN).some(b => b.move === s.move))
    .sort((a, b) => b.totalScore - a.totalScore);
  // strong bots almost always play the very top of this list; weak bots roll dice
  const accIdx = Math.random() < bot.accuracy ? 0 : Math.min(top.length - 1, Math.floor(Math.random() * top.length));
  const chosen = top[accIdx] ?? best;

  // 5) For very weak bots — fallback to legacy random/heuristic engine some of the time
  if (bot.rating < 700 && Math.random() < 0.25) {
    const fallback = getAIMove(game, "beginner");
    if (fallback) return finalize(game, bot, fallback, best.rawEval, byEngine);
  }

  return finalize(game, bot, chosen.move, best.rawEval, byEngine);
}

function finalize(game: Chess, bot: BotProfile, move: string, bestEvalRaw: number, byEngine: ScoredMove[]): BotMoveDecision {
  const movingColor = game.turn();
  const sign = movingColor === "w" ? 1 : -1;
  game.move(move);
  const evalAfter = evaluateBoard(game);
  game.undo();
  const cpLoss = Math.max(0, (bestEvalRaw - evalAfter) * sign);
  const quality = classifyCpLoss(cpLoss);
  return { move, evalAfter, bestEval: bestEvalRaw, cpLoss, quality, fromBook: false };
}

export function classifyCpLoss(cp: number): BotMoveDecision["quality"] {
  if (cp < 20) return "best";
  if (cp < 60) return "good";
  if (cp < 150) return "inaccuracy";
  if (cp < 300) return "mistake";
  return "blunder";
}

/* ---------- Adaptive "thinking time" ---------- */

export interface ThinkTimeOpts {
  /** Time control base seconds (0 = unlimited). */
  baseSeconds: number;
  /** Plies played so far. */
  ply: number;
  /** Was this a book move? Bots play book instantly. */
  fromBook: boolean;
  /** Is the position critical? (close eval, in check, etc.) */
  critical: boolean;
}

export function getBotThinkMs(bot: BotProfile, opts: ThinkTimeOpts): number {
  if (opts.fromBook) return 250 + Math.random() * 250;

  // Base think time scales with rating (stronger = more thoughtful, but capped for snappy UX)
  const ratingFactor = Math.min(1, bot.rating / 2400);
  let base = 350 + ratingFactor * 700; // 350ms .. ~1.05s

  // Bullet/blitz speed up
  if (opts.baseSeconds > 0 && opts.baseSeconds <= 180) base *= 0.45;
  else if (opts.baseSeconds > 0 && opts.baseSeconds <= 600) base *= 0.7;

  // Critical positions: think longer
  if (opts.critical) base *= 1.6;

  // Opening (after book) — quicker
  if (opts.ply < 12) base *= 0.7;

  // Endgame (low ply count after long game) — careful
  if (opts.ply > 40) base *= 1.15;

  // Human-like jitter
  const jitter = (Math.random() - 0.3) * 250;
  return Math.max(180, Math.round(base + jitter));
}

/* ---------- Adaptive difficulty (light) ---------- */

export function adaptDifficulty(currentDifficulty: Difficulty, playerRecentScore: number): Difficulty {
  // playerRecentScore in [-1, 1], positive = winning a lot, negative = losing a lot
  const order: Difficulty[] = ["beginner", "intermediate", "advanced", "expert", "master"];
  const idx = order.indexOf(currentDifficulty);
  if (playerRecentScore > 0.6 && idx < order.length - 1) return order[idx + 1];
  if (playerRecentScore < -0.6 && idx > 0) return order[idx - 1];
  return currentDifficulty;
}
