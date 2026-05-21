// ─────────────────────────────────────────────────────────────────────────────
// Per-move classifier for finished games. Runs Stockfish locally in the
// browser (single-threaded WASM Worker) and assigns each move an honest
// verdict based on centipawn loss vs. the engine's best move at that depth.
//
// Verdict scale (from the player's perspective):
//   "book"        → still inside our local opening database (theory).
//   "best"        → matches engine's #1 choice (cp loss ≤ 5).
//   "excellent"   → cp loss ≤ 20.
//   "good"        → cp loss ≤ 50.
//   "inaccuracy"  → cp loss ≤ 100.
//   "mistake"     → cp loss ≤ 250.
//   "blunder"     → cp loss > 250.
//   "brilliant"   → ONLY when the player sacrifices material AND still plays
//                   the best move (cp loss ≤ 10) AND a clearly worse move
//                   was available. Rare by design — never on move 1.
// ─────────────────────────────────────────────────────────────────────────────

import { Chess } from "chess.js";
import { getStockfishEngine } from "./stockfish-engine";
import { OPENINGS } from "./openings-detector";
import { fetchExplorerData, fetchMasterExplorerData } from "./lichess-explorer";

export type Verdict =
  | "book"
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "miss"
  | "blunder";

export interface TopLine {
  san: string;        // first move of the line in SAN
  pvSan: string[];    // first ~5 moves in SAN (preview)
  eval: number;       // centipawns from the side-to-move POV (positive = mover better)
  mate: number | null;
}

export interface ClassifiedMove {
  ply: number;          // 1-based half-move
  moveNumber: number;   // full move number (1, 1, 2, 2, …)
  color: "w" | "b";
  san: string;
  uci: string;
  fenBefore: string;
  evalBefore: number;   // cp from White's POV before the move
  evalAfter: number;    // cp from White's POV after the move
  cpLoss: number;       // from the mover's POV (≥ 0)
  bestMoveSan?: string; // engine's top suggestion (SAN)
  topLines?: TopLine[]; // top N PV lines at the position BEFORE this move
  verdict: Verdict;
}

const PIECE_VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

export function isBookMove(playedHistorySan: string[]): boolean {
  // We're still in book if our prefix exactly matches some catalogue entry.
  const len = playedHistorySan.length;
  return OPENINGS.some(o => o.moves.length >= len && o.moves.slice(0, len).every((m, i) => m === playedHistorySan[i]));
}

export async function isDatabaseBookMove(fenBefore: string, san: string, ply: number): Promise<boolean> {
  if (ply > 24) return false;
  try {
    const master = await fetchMasterExplorerData(fenBefore);
    const masterMove = master.moves.find(m => m.san === san);
    if (masterMove && (masterMove.games >= 2 || masterMove.frequency >= 0.5)) return true;

    const lichess = await fetchExplorerData(fenBefore);
    const lichessMove = lichess.moves.find(m => m.san === san);
    return !!lichessMove && (lichessMove.games >= 50 || lichessMove.frequency >= 1);
  } catch {
    return false;
  }
}

function scoreToWhitePov(fen: string, evaluation: number, mate: number | null): number {
  const raw = mate != null ? (mate > 0 ? 10000 : -10000) : evaluation;
  return new Chess(fen).turn() === "w" ? raw : -raw;
}

function classifyByCpLoss(cpLoss: number): Verdict {
  if (cpLoss <= 5) return "best";
  if (cpLoss <= 20) return "excellent";
  if (cpLoss <= 50) return "good";
  if (cpLoss <= 100) return "inaccuracy";
  if (cpLoss <= 250) return "mistake";
  return "blunder";
}

function uciToSan(fen: string, uci: string): string {
  if (!uci || uci.length < 4) return "";
  try {
    const c = new Chess(fen);
    const m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as any });
    return m?.san ?? "";
  } catch { return ""; }
}

function materialDelta(fenBefore: string, fenAfter: string, mover: "w" | "b"): number {
  // Positive = mover lost material on this move (i.e. sacrificed).
  const count = (fen: string) => {
    const board = fen.split(" ")[0];
    let w = 0, b = 0;
    for (const ch of board) {
      if (/[A-Z]/.test(ch) && PIECE_VALUE[ch.toLowerCase()]) w += PIECE_VALUE[ch.toLowerCase()];
      else if (/[a-z]/.test(ch) && PIECE_VALUE[ch]) b += PIECE_VALUE[ch];
    }
    return { w, b };
  };
  const before = count(fenBefore);
  const after = count(fenAfter);
  const myBefore = mover === "w" ? before.w : before.b;
  const myAfter = mover === "w" ? after.w : after.b;
  return myBefore - myAfter; // >0 means mover has less material now
}

export interface ClassifyOptions {
  depth?: number;             // engine depth per position (default 14)
  multiPv?: number;           // number of top variants to capture (default 3)
  onProgress?: (done: number, total: number) => void;
}

export interface ClassifiedGame {
  moves: ClassifiedMove[];
  accuracyWhite: number;      // 0–100
  accuracyBlack: number;
  counts: Record<Verdict, number>;
}

/** Convert a UCI PV line to SAN moves played from the given FEN. */
function pvUciToSan(fen: string, pvUci: string[], maxMoves = 5): string[] {
  const c = new Chess(fen);
  const sans: string[] = [];
  for (const uci of pvUci.slice(0, maxMoves)) {
    if (!uci || uci.length < 4) break;
    try {
      const m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as any });
      if (!m) break;
      sans.push(m.san);
    } catch { break; }
  }
  return sans;
}

/**
 * Walk through a game and classify every move. Returns per-move verdicts
 * plus simple per-side accuracy numbers (0-100). Uses MultiPV to capture the
 * top N candidate lines at every position for precise cp-loss + UI display.
 */
export async function classifyGame(pgn: string, opts: ClassifyOptions = {}): Promise<ClassifiedGame> {
  const depth = opts.depth ?? 14;
  const multiPv = Math.max(1, Math.min(5, opts.multiPv ?? 3));

  const game = new Chess();
  game.loadPgn(pgn);
  const history = game.history({ verbose: true });
  const total = history.length;

  const engine = getStockfishEngine();
  await engine.init();
  engine.newGame();

  const replay = new Chess();
  const sanSoFar: string[] = [];
  const out: ClassifiedMove[] = [];

  // Eval before move 1 = 0 (start position is equal).
  let evalBeforeWhitePov = 0;

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const fenBefore = replay.fen();
    const moverColor = move.color as "w" | "b";

    // One MultiPV call gives us: best move, top-N lines (with SAN previews)
    // AND a side-to-move eval for the position itself (== best line's eval).
    let topLines: TopLine[] = [];
    let bestUci = "";
    let bestEvalSideToMove = 0;
    let bestMateSideToMove: number | null = null;
    try {
      const lines = await engine.getMultiPV(fenBefore, multiPv, depth);
      topLines = lines.map(l => {
        const pvSan = pvUciToSan(fenBefore, l.pv, 5);
        return {
          san: pvSan[0] ?? "",
          pvSan,
          eval: l.eval,
          mate: l.mate,
        };
      }).filter(l => l.san);
      if (lines[0]) {
        bestUci = lines[0].pv[0] ?? "";
        bestEvalSideToMove = lines[0].eval;
        bestMateSideToMove = lines[0].mate;
      }
    } catch { /* fallback below */ }

    // White-POV evals.
    const evalBeforeSideToMove = bestMateSideToMove != null
      ? (bestMateSideToMove > 0 ? 10000 : -10000)
      : bestEvalSideToMove;
    const evalBeforeFromMover = moverColor === "w" ? evalBeforeSideToMove : -evalBeforeSideToMove;
    // The eval BEFORE this move, from White's POV. If no engine result, keep previous.
    evalBeforeWhitePov = topLines.length > 0
      ? (moverColor === "w" ? evalBeforeSideToMove : -evalBeforeSideToMove)
      : evalBeforeWhitePov;

    // Apply the actual move.
    replay.move(move.san);
    sanSoFar.push(move.san);
    const fenAfter = replay.fen();
    const bookMove = isBookMove(sanSoFar) || await isDatabaseBookMove(fenBefore, move.san, i + 1);

    // Eval AFTER the played move (from White POV). If the played move is the
    // engine's #1 choice, we already know — skip the extra call.
    let evalAfterWhitePov = evalBeforeWhitePov;
    const playedIsBest = !!bestUci && bestUci.slice(0, 4) === `${move.from}${move.to}`;
    if (playedIsBest && topLines[0]) {
      // After the engine's best move, the score for the opponent is the same
      // magnitude with opposite sign (side to move flips).
      const afterSideToMove = topLines[0].mate != null
        ? (topLines[0].mate > 0 ? -10000 : 10000)
        : -topLines[0].eval;
      // afterSideToMove is from the new side-to-move (opponent). Convert to White.
      const newSideIsWhite = moverColor === "b"; // opponent of mover
      evalAfterWhitePov = newSideIsWhite ? afterSideToMove : -afterSideToMove;
    } else {
      try {
        const after = await engine.evaluate(fenAfter, depth);
        evalAfterWhitePov = scoreToWhitePov(fenAfter, after.evaluation, after.mate);
      } catch { /* keep previous */ }
    }

    // CP loss from the mover's POV.
    const moverPovBest = evalBeforeFromMover;                          // best continuation value for mover
    const moverPovPlayed = moverColor === "w" ? evalAfterWhitePov : -evalAfterWhitePov;
    const cpLoss = Math.max(0, Math.round(moverPovBest - moverPovPlayed));

    // Classify.
    let verdict: Verdict;
    // Book only if it's ALSO a sound move (theory move that hangs material
    // must be labeled honestly).
    if (bookMove && cpLoss <= 30) {
      verdict = "book";
    } else {
      verdict = classifyByCpLoss(cpLoss);

      // GREAT: only move — best line is dramatically better than second
      // best (>=150cp), and the player found it.
      const second = topLines[1];
      const gap = topLines[0] && second
        ? Math.abs(topLines[0].eval - second.eval)
        : 0;
      if (cpLoss <= 10 && gap >= 150 && verdict !== "best") {
        verdict = "great";
      }

      // MISS: had a winning chance (best move was at least +200 from mover
      // POV) but the played move dropped that advantage by 150cp or more.
      if (moverPovBest >= 200 && cpLoss >= 150 && (verdict === "mistake" || verdict === "blunder" || verdict === "inaccuracy")) {
        verdict = "miss";
      }

      // BRILLIANT: sacrificed material AND still played near-best AND there
      // was a clearly worse alternative.
      const sacrificed = materialDelta(fenBefore, fenAfter, moverColor);
      const isCapture = /x/.test(move.san);
      if (sacrificed >= 200 && cpLoss <= 10 && !isCapture && i >= 6) {
        verdict = "brilliant";
      }
    }

    out.push({
      ply: i + 1,
      moveNumber: Math.floor(i / 2) + 1,
      color: moverColor,
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      fenBefore,
      evalBefore: evalBeforeWhitePov,
      evalAfter: evalAfterWhitePov,
      cpLoss,
      bestMoveSan: bestUci ? uciToSan(fenBefore, bestUci) : (topLines[0]?.san || undefined),
      topLines,
      verdict,
    });

    evalBeforeWhitePov = evalAfterWhitePov;
    opts.onProgress?.(i + 1, total);
  }

  // Accuracy = simple harmonic-ish formula based on average cp loss per side.
  const cpLossesW = out.filter(m => m.color === "w" && m.verdict !== "book").map(m => m.cpLoss);
  const cpLossesB = out.filter(m => m.color === "b" && m.verdict !== "book").map(m => m.cpLoss);
  const acc = (losses: number[]) => {
    if (losses.length === 0) return 100;
    const avg = losses.reduce((a, b) => a + b, 0) / losses.length;
    // 0 cp loss → 100, 50 → ~85, 100 → ~70, 200 → ~50, 400+ → <30
    return Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(avg) * 5)));
  };

  const counts: Record<Verdict, number> = {
    book: 0, best: 0, excellent: 0, good: 0, great: 0, miss: 0,
    inaccuracy: 0, mistake: 0, blunder: 0, brilliant: 0,
  };
  for (const m of out) counts[m.verdict]++;

  return {
    moves: out,
    accuracyWhite: acc(cpLossesW),
    accuracyBlack: acc(cpLossesB),
    counts,
  };
}
