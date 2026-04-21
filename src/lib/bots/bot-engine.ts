// Realistic, RATING-ACCURATE bot move-picker.
//
// Powered by Stockfish (WASM) for true engine strength, with:
// - UCI Skill Level + UCI_LimitStrength + UCI_Elo mapped from each bot's rating
// - Rating-scaled depth and movetime so bots actually FEEL like their Elo
// - Opening book preference per bot personality
// - Personality bias on top of engine candidates (≤ ~1900 only — strong bots play pure engine)
// - Synchronous heuristic fallback while Stockfish is still warming up
//
// Public API kept compatible: getBotMove(game, bot) returns a BotMoveDecision,
// estimateMoveQuality(game, move) for review, getBotThinkMs(bot, opts) for UI delay.

import { Chess } from "chess.js";
import { evaluateBoard, getAIMove, type Difficulty } from "../chess-ai";
import type { BotProfile } from "./profiles";
import { OPENING_BOOKS, PLAYSTYLES, type Playstyle } from "./playstyles";
import { getStockfishEngine } from "../stockfish-engine";

export interface BotMoveDecision {
  /** SAN move the bot plays. */
  move: string;
  /** Engine's centipawn evaluation for the chosen move (white-positive). */
  evalAfter: number;
  /** Engine's evaluation for the BEST move available. */
  bestEval: number;
  /** Centipawn loss vs best move (>= 0, mover's perspective). */
  cpLoss: number;
  /** Classification of this move. */
  quality: "best" | "good" | "inaccuracy" | "mistake" | "blunder";
  /** Whether the bot followed its opening book. */
  fromBook: boolean;
}

/* ---------- Stockfish lifecycle ---------- */

let stockfishReady = false;
let stockfishInitPromise: Promise<void> | null = null;

function ensureStockfish(): Promise<void> {
  if (stockfishReady) return Promise.resolve();
  if (stockfishInitPromise) return stockfishInitPromise;
  const engine = getStockfishEngine();
  stockfishInitPromise = engine
    .init()
    .then(() => {
      stockfishReady = true;
    })
    .catch((err) => {
      console.warn("[bot-engine] Stockfish init failed, falling back to heuristic:", err);
      stockfishInitPromise = null;
    });
  return stockfishInitPromise;
}

// Eagerly start warming up Stockfish so first bot move is fast.
if (typeof window !== "undefined") {
  // fire-and-forget
  ensureStockfish();
}

/* ---------- Rating → engine settings ----------
 *
 * We use TWO complementary mechanisms for realism:
 *  - UCI_LimitStrength + UCI_Elo (1320..3190 in modern Stockfish) for sub-master bots,
 *    which makes the engine play like an actual rated human.
 *  - Skill Level (0..20) as a fallback / additional dampener.
 *  - Depth + movetime caps so weak bots also THINK less.
 */

interface EngineSettings {
  useElo: boolean;     // use UCI_LimitStrength + UCI_Elo
  uciElo: number;      // target Elo (clamped to engine support range)
  skillLevel: number;  // 0..20
  depth: number;       // search depth cap
  moveTimeMs: number;  // search time cap
}

function settingsForRating(rating: number): EngineSettings {
  // Stockfish UCI_Elo supported range is roughly 1320..3190.
  // Engine search is kept SHORT (≤1.2s) so the UI delay can do most of the
  // 6–8s "thinking" without making the bot feel sluggish or lag the page.
  if (rating <= 600) {
    return { useElo: true, uciElo: 1320, skillLevel: 0, depth: 4, moveTimeMs: 150 };
  }
  if (rating <= 900) {
    return { useElo: true, uciElo: 1320, skillLevel: 1, depth: 5, moveTimeMs: 200 };
  }
  if (rating <= 1200) {
    return { useElo: true, uciElo: 1400, skillLevel: 3, depth: 6, moveTimeMs: 250 };
  }
  if (rating <= 1500) {
    return { useElo: true, uciElo: 1600, skillLevel: 6, depth: 7, moveTimeMs: 350 };
  }
  if (rating <= 1800) {
    return { useElo: true, uciElo: 1850, skillLevel: 10, depth: 9, moveTimeMs: 450 };
  }
  if (rating <= 2000) {
    return { useElo: true, uciElo: 2050, skillLevel: 13, depth: 10, moveTimeMs: 550 };
  }
  if (rating <= 2200) {
    return { useElo: true, uciElo: 2250, skillLevel: 16, depth: 12, moveTimeMs: 700 };
  }
  if (rating <= 2400) {
    return { useElo: true, uciElo: 2450, skillLevel: 18, depth: 13, moveTimeMs: 850 };
  }
  if (rating <= 2600) {
    return { useElo: true, uciElo: 2650, skillLevel: 20, depth: 14, moveTimeMs: 1000 };
  }
  if (rating <= 2900) {
    // Top GM / world-elite — full strength, capped depth for snappy UX.
    return { useElo: false, uciElo: 3000, skillLevel: 20, depth: 16, moveTimeMs: 1100 };
  }
  // 👑 MasterChess and beyond — UNBEATABLE: max engine strength.
  // Engine time still capped so total reply stays within the 6–8s window.
  return { useElo: false, uciElo: 3200, skillLevel: 20, depth: 20, moveTimeMs: 1200 };
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
      let matches = true;
      for (let i = 0; i < ply; i++) {
        const allowed = line.plies[i] ?? [];
        if (allowed.length === 0) continue;
        if (!allowed.includes(history[i])) {
          matches = false;
          break;
        }
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

/* ---------- Personality bias (only for ≤1900 rated bots) ---------- */

const KING_FILE_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };

function isPawnStorm(move: string, game: Chess, attackerColor: "w" | "b"): boolean {
  if (!/^[a-h]/.test(move)) return false;
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

/* ---------- Synchronous heuristic fallback (used while Stockfish warms up) ---------- */

interface ScoredMove {
  move: string;
  rawEval: number; // engine eval after this move (white-positive)
  totalScore: number;
}

function scoreCandidates(game: Chess, bot: BotProfile, ply: number): ScoredMove[] {
  const moves = game.moves();
  const movingColor = game.turn();
  const sign = movingColor === "w" ? 1 : -1;

  return moves.map((m) => {
    game.move(m);
    const ev = evaluateBoard(game);
    game.undo();
    const fromMoverPov = ev * sign;
    const styleBonus = biasedMoveScore(m, game, bot.playstyle, movingColor, ply);
    return { move: m, rawEval: ev, totalScore: fromMoverPov + styleBonus };
  });
}

function fallbackHeuristicMove(game: Chess, bot: BotProfile): BotMoveDecision {
  const ply = game.history().length;
  const movingColor = game.turn();
  const sign = movingColor === "w" ? 1 : -1;

  const scored = scoreCandidates(game, bot, ply);
  if (scored.length === 0) {
    return { move: "", evalAfter: 0, bestEval: 0, cpLoss: 0, quality: "best", fromBook: false };
  }
  const byEngine = [...scored].sort((a, b) => (b.rawEval - a.rawEval) * sign);
  const best = byEngine[0];

  // Apply blunder/inaccuracy distribution
  const r = Math.random();
  let chosen = best;
  if (r < bot.blunderRate && byEngine.length > 1) {
    const worstThird = byEngine.slice(Math.max(1, Math.floor(byEngine.length * 0.66)));
    chosen = worstThird[Math.floor(Math.random() * worstThird.length)];
  } else if (r < bot.blunderRate + bot.inaccuracyRate && byEngine.length > 2) {
    const start = Math.max(1, Math.floor(byEngine.length * 0.25));
    const end = Math.max(2, Math.floor(byEngine.length * 0.6));
    chosen = byEngine.slice(start, end)[0] ?? byEngine[1];
  } else {
    // Top-N weighted by accuracy + style bias
    const topN = Math.min(byEngine.length, bot.accuracy >= 0.95 ? 2 : bot.accuracy >= 0.8 ? 3 : 5);
    const top = scored
      .filter((s) => byEngine.slice(0, topN).some((b) => b.move === s.move))
      .sort((a, b) => b.totalScore - a.totalScore);
    const idx = Math.random() < bot.accuracy ? 0 : Math.min(top.length - 1, Math.floor(Math.random() * top.length));
    chosen = top[idx] ?? best;
  }

  // Very weak bots fallback to legacy random/heuristic occasionally
  if (bot.rating < 700 && Math.random() < 0.25) {
    const fb = getAIMove(game, "beginner");
    if (fb) {
      const probe = new Chess(game.fen());
      probe.move(fb);
      const ev = evaluateBoard(probe);
      const cpLoss = Math.max(0, (best.rawEval - ev) * sign);
      return { move: fb, evalAfter: ev, bestEval: best.rawEval, cpLoss, quality: classifyCpLoss(cpLoss), fromBook: false };
    }
  }

  const cpLoss = Math.max(0, (best.rawEval - chosen.rawEval) * sign);
  return {
    move: chosen.move,
    evalAfter: chosen.rawEval,
    bestEval: best.rawEval,
    cpLoss,
    quality: classifyCpLoss(cpLoss),
    fromBook: false,
  };
}

/* ---------- UCI helpers ---------- */

/** Convert UCI move (e.g. "e2e4", "g7g8q") into legal SAN, or null if illegal. */
function uciToSan(game: Chess, uci: string): string | null {
  if (!uci || uci.length < 4) return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length >= 5 ? uci[4] : undefined;
  const probe = new Chess(game.fen());
  try {
    const m = probe.move({ from, to, promotion: promotion as any });
    return m ? m.san : null;
  } catch {
    return null;
  }
}

/** Send Skill Level + (optional) UCI_LimitStrength / UCI_Elo to the engine. */
function applyEngineSettings(s: EngineSettings) {
  const eng = getStockfishEngine();
  // The stockfish-engine wrapper only exposes setSkillLevel publicly.
  // We post raw UCI options for limit-strength / elo via the same private channel.
  const send = (cmd: string) => (eng as unknown as { send: (c: string) => void }).send?.(cmd);

  eng.setSkillLevel(s.skillLevel);
  if (s.useElo) {
    send?.("setoption name UCI_LimitStrength value true");
    send?.(`setoption name UCI_Elo value ${Math.round(s.uciElo)}`);
  } else {
    send?.("setoption name UCI_LimitStrength value false");
  }
}

/* ---------- Main: get a rating-accurate bot move ---------- */

export async function getBotMove(game: Chess, bot: BotProfile): Promise<BotMoveDecision> {
  if (game.isGameOver()) {
    return { move: "", evalAfter: 0, bestEval: 0, cpLoss: 0, quality: "best", fromBook: false };
  }

  const ply = game.history().length;
  const movingColor = game.turn();
  const sign = movingColor === "w" ? 1 : -1;

  // 1) Opening book — every bot prefers its prepared lines first.
  const bookMove = tryOpeningBook(game, bot);
  if (bookMove) {
    const probe = new Chess(game.fen());
    probe.move(bookMove);
    const evalAfter = evaluateBoard(probe);
    return {
      move: bookMove,
      evalAfter,
      bestEval: evalAfter,
      cpLoss: 0,
      quality: "best",
      fromBook: true,
    };
  }

  // 2) Try Stockfish for true rating-accurate strength.
  try {
    if (!stockfishReady) {
      // Kick off init, but don't block forever.
      const initWait = ensureStockfish();
      const timeout = new Promise<void>((res) => setTimeout(res, 1200));
      await Promise.race([initWait, timeout]);
    }

    if (stockfishReady) {
      const settings = settingsForRating(bot.rating);
      applyEngineSettings(settings);
      const eng = getStockfishEngine();
      const result = await eng.getBestMove(game.fen(), settings.moveTimeMs, settings.depth);
      const sfSan = result.bestMove ? uciToSan(game, result.bestMove) : null;

      if (sfSan) {
        // For low/mid-rated bots: occasionally let personality bias override the engine
        // pick to keep play feeling human. Strong bots (≥1900) trust the engine.
        let chosenSan = sfSan;
        if (bot.rating < 1900) {
          const styleOverrideChance = Math.max(0, 0.35 - (bot.rating - 800) / 4000);
          if (Math.random() < styleOverrideChance) {
            const scored = scoreCandidates(game, bot, ply);
            const byEngine = [...scored].sort((a, b) => (b.rawEval - a.rawEval) * sign);
            const topN = Math.min(byEngine.length, bot.rating < 1200 ? 6 : bot.rating < 1500 ? 4 : 3);
            const top = scored
              .filter((s) => byEngine.slice(0, topN).some((b) => b.move === s.move))
              .sort((a, b) => b.totalScore - a.totalScore);
            if (top[0]) chosenSan = top[0].move;
          }
        }

        // Compute eval after the chosen move (for review/coach overlays)
        const probe = new Chess(game.fen());
        const played = probe.move(chosenSan);
        const evalAfter = played ? evaluateBoard(probe) : 0;
        // Stockfish's score is from side-to-move's perspective (centipawns).
        // Convert to white-positive to match evaluateBoard.
        const bestEvalWhite = (result.evaluation ?? 0) * sign;
        const cpLoss = Math.max(0, (bestEvalWhite - evalAfter) * sign);

        return {
          move: chosenSan,
          evalAfter,
          bestEval: bestEvalWhite,
          cpLoss,
          quality: classifyCpLoss(cpLoss),
          fromBook: false,
        };
      }
    }
  } catch (err) {
    console.warn("[bot-engine] Stockfish move failed, using fallback:", err);
  }

  // 3) Fallback heuristic (only if Stockfish isn't available yet)
  return fallbackHeuristicMove(game, bot);
}

/* ---------- Move quality estimator (sync, used for player move review) ---------- */

export function classifyCpLoss(cp: number): BotMoveDecision["quality"] {
  if (cp < 20) return "best";
  if (cp < 60) return "good";
  if (cp < 150) return "inaccuracy";
  if (cp < 300) return "mistake";
  return "blunder";
}

export interface MoveQualityEstimate {
  cpLoss: number;
  quality: BotMoveDecision["quality"];
  bestMove: string | null;
  bestEval: number;
  evalAfter: number;
}

export function estimateMoveQuality(
  game: Chess,
  moveInput: string | { from: string; to: string; promotion?: string },
): MoveQualityEstimate {
  const legalMoves = game.moves();
  if (legalMoves.length === 0) {
    return { cpLoss: 0, quality: "best", bestMove: null, bestEval: 0, evalAfter: 0 };
  }

  const movingColor = game.turn();
  const sign = movingColor === "w" ? 1 : -1;
  const scored = legalMoves.map((move) => {
    game.move(move);
    const evalAfter = evaluateBoard(game);
    game.undo();
    return { move, evalAfter };
  });

  const best = [...scored].sort((a, b) => (b.evalAfter - a.evalAfter) * sign)[0];

  const probe = new Chess(game.fen());
  const played = probe.move(moveInput as any);
  if (!played) {
    return {
      cpLoss: 0,
      quality: "best",
      bestMove: best?.move ?? null,
      bestEval: best?.evalAfter ?? 0,
      evalAfter: best?.evalAfter ?? 0,
    };
  }

  const evalAfter = evaluateBoard(probe);
  const cpLoss = Math.max(0, ((best?.evalAfter ?? evalAfter) - evalAfter) * sign);

  return {
    cpLoss,
    quality: classifyCpLoss(cpLoss),
    bestMove: best?.move ?? null,
    bestEval: best?.evalAfter ?? evalAfter,
    evalAfter,
  };
}

/* ---------- Adaptive "thinking time" (UI delay) ---------- */

export interface ThinkTimeOpts {
  baseSeconds: number;
  ply: number;
  fromBook: boolean;
  critical: boolean;
}

export function getBotThinkMs(bot: BotProfile, opts: ThinkTimeOpts): number {
  if (opts.fromBook) return 200 + Math.random() * 200;

  // Snappy UX: target most moves under ~2.5s, with a hard cap so no move ever
  // exceeds ~6s of UI delay (engine search is also capped separately).
  const ratingFactor = Math.min(1, bot.rating / 2400);
  let base = 300 + ratingFactor * 700; // 300ms .. ~1.0s

  if (opts.baseSeconds > 0 && opts.baseSeconds <= 180) base *= 0.4;
  else if (opts.baseSeconds > 0 && opts.baseSeconds <= 600) base *= 0.6;

  if (opts.critical) base *= 1.5;
  if (opts.ply < 12) base *= 0.6;
  if (opts.ply > 40) base *= 1.15;

  const jitter = (Math.random() - 0.3) * 200;
  // Hard cap at 6000ms so total bot reply (engine ~1.5s + delay) stays ≤ ~7–8s.
  return Math.min(6000, Math.max(180, Math.round(base + jitter)));
}

/* ---------- Adaptive difficulty (light) ---------- */

export function adaptDifficulty(currentDifficulty: Difficulty, playerRecentScore: number): Difficulty {
  const order: Difficulty[] = ["beginner", "intermediate", "advanced", "expert", "master"];
  const idx = order.indexOf(currentDifficulty);
  if (playerRecentScore > 0.6 && idx < order.length - 1) return order[idx + 1];
  if (playerRecentScore < -0.6 && idx > 0) return order[idx - 1];
  return currentDifficulty;
}
