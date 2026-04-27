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
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "brilliant";

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
  verdict: Verdict;
}

const PIECE_VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

export function isBookMove(playedHistorySan: string[]): boolean {
  // We're still in book if our prefix exactly matches some catalogue entry.
  const len = playedHistorySan.length;
  return OPENINGS.some(o => o.moves.length >= len && o.moves.slice(0, len).every((m, i) => m === playedHistorySan[i]));
}

const _bookCache = new Map<string, boolean>();
export async function isDatabaseBookMove(fenBefore: string, san: string, ply: number): Promise<boolean> {
  if (ply > 16) return false; // most theory ends well before move 16
  const key = `${fenBefore}|${san}`;
  if (_bookCache.has(key)) return _bookCache.get(key)!;
  try {
    const master = await fetchMasterExplorerData(fenBefore);
    const masterMove = master.moves.find(m => m.san === san);
    if (masterMove && (masterMove.games >= 2 || masterMove.frequency >= 0.5)) {
      _bookCache.set(key, true); return true;
    }
    // Skip the slower lichess fallback after ply 10 (saves a network round trip per move)
    if (ply <= 10) {
      const lichess = await fetchExplorerData(fenBefore);
      const lichessMove = lichess.moves.find(m => m.san === san);
      const ok = !!lichessMove && (lichessMove.games >= 50 || lichessMove.frequency >= 1);
      _bookCache.set(key, ok); return ok;
    }
    _bookCache.set(key, false); return false;
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
  depth?: number;             // engine depth per position (default 12)
  onProgress?: (done: number, total: number) => void;
}

export interface ClassifiedGame {
  moves: ClassifiedMove[];
  accuracyWhite: number;      // 0–100
  accuracyBlack: number;
  counts: Record<Verdict, number>;
}

/**
 * Walk through a game and classify every move. Returns per-move verdicts
 * plus simple per-side accuracy numbers (0-100).
 */
export async function classifyGame(pgn: string, opts: ClassifyOptions = {}): Promise<ClassifiedGame> {
  const depth = opts.depth ?? 10; // depth 10 NNUE is strong enough for classification and ~3-4× faster than 12

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

  let evalBeforeWhitePov = 0;

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const fenBefore = replay.fen();
    const moverColor = move.color as "w" | "b";

    // Fast path: opening book moves don't need engine analysis at all.
    const inLocalBook = isBookMove([...sanSoFar, move.san]);
    const inDbBook = inLocalBook ? true : await isDatabaseBookMove(fenBefore, move.san, i + 1);

    // Apply the actual move first.
    replay.move(move.san);
    sanSoFar.push(move.san);
    const fenAfter = replay.fen();

    let bestUci = "";
    let evalAfterWhitePov = evalBeforeWhitePov;
    let cpLoss = 0;

    if (inDbBook) {
      // Skip engine for book moves – huge speed win in opening phase.
      // Carry previous eval forward; book moves are by definition ~0 cp loss.
    } else {
      // Single engine call: Multi-PV gives us best move + best eval AND the
      // played move's eval (if it's in top lines). Otherwise we evaluate the
      // resulting position once. Net = max 2 engine calls per move (was 3).
      try {
        const lines = await engine.getMultiPV(fenBefore, 2, depth);
        const top = lines[0];
        if (top) {
          bestUci = top.pv[0] ?? "";
          const bestEvalSideToMove = top.mate != null ? (top.mate > 0 ? 10000 : -10000) : top.eval;
          const bestEvalAfterWhitePov = moverColor === "w" ? bestEvalSideToMove : -bestEvalSideToMove;

          const playedUci = `${move.from}${move.to}${move.promotion ?? ""}`;
          const playedLine = lines.find(l => l.pv[0] === playedUci);
          if (playedLine) {
            const playedEvalSideToMove = playedLine.mate != null ? (playedLine.mate > 0 ? 10000 : -10000) : playedLine.eval;
            evalAfterWhitePov = moverColor === "w" ? playedEvalSideToMove : -playedEvalSideToMove;
          } else {
            // Played move wasn't in top 2 → evaluate the resulting position.
            const after = await engine.evaluate(fenAfter, depth);
            evalAfterWhitePov = scoreToWhitePov(fenAfter, after.evaluation, after.mate);
          }

          const moverPovBest = moverColor === "w" ? bestEvalAfterWhitePov : -bestEvalAfterWhitePov;
          const moverPovPlayed = moverColor === "w" ? evalAfterWhitePov : -evalAfterWhitePov;
          cpLoss = Math.max(0, Math.round(moverPovBest - moverPovPlayed));
        }
      } catch { /* fallback values */ }
    }

    let verdict: Verdict;
    if (inDbBook) {
      verdict = "book";
    } else {
      verdict = classifyByCpLoss(cpLoss);
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
      bestMoveSan: bestUci ? uciToSan(fenBefore, bestUci) : undefined,
      verdict,
    });

    evalBeforeWhitePov = evalAfterWhitePov;
    opts.onProgress?.(i + 1, total);
  }

  const cpLossesW = out.filter(m => m.color === "w" && m.verdict !== "book").map(m => m.cpLoss);
  const cpLossesB = out.filter(m => m.color === "b" && m.verdict !== "book").map(m => m.cpLoss);
  const acc = (losses: number[]) => {
    if (losses.length === 0) return 100;
    const avg = losses.reduce((a, b) => a + b, 0) / losses.length;
    return Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(avg) * 5)));
  };

  const counts: Record<Verdict, number> = {
    book: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, brilliant: 0,
  };
  for (const m of out) counts[m.verdict]++;

  return {
    moves: out,
    accuracyWhite: acc(cpLossesW),
    accuracyBlack: acc(cpLossesB),
    counts,
  };
}
