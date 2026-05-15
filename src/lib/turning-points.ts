// Engine-free heuristic to surface the "turning points" of a game from PGN.
// Detects: hanging captures, large material swings, first check that flips
// momentum, mate threats. Never uses Stockfish — keeps human-vs-human pure.

import { Chess } from "chess.js";

export interface TurningPoint {
  ply: number;
  moveNumber: number;
  side: "w" | "b";
  san: string;
  fen: string;
  type: "swing" | "blunder-capture" | "mate-threat" | "first-check";
  label: string;
  swing?: number; // material delta for this move (+ favors mover)
}

const PIECE_VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function materialBalance(fen: string): number {
  // White minus Black raw material from FEN.
  const board = fen.split(" ")[0];
  let bal = 0;
  for (const ch of board) {
    if (ch === "/") continue;
    if (/[1-8]/.test(ch)) continue;
    const v = PIECE_VAL[ch.toLowerCase()] ?? 0;
    bal += ch === ch.toUpperCase() ? v : -v;
  }
  return bal;
}

export function detectTurningPoints(pgn: string, max = 3): TurningPoint[] {
  const c = new Chess();
  try { c.loadPgn(pgn); } catch { return []; }
  const history = c.history({ verbose: true }) as any[];
  if (!history.length) return [];

  // Replay to gather per-ply state.
  const replay = new Chess();
  let prevBal = 0;
  let firstCheckSeen = false;
  const candidates: TurningPoint[] = [];

  history.forEach((mv, i) => {
    replay.move(mv.san);
    const fenAfter = replay.fen();
    const bal = materialBalance(fenAfter);
    const swingForMover = mv.color === "w" ? bal - prevBal : -(bal - prevBal);
    const ply = i + 1;
    const moveNumber = Math.ceil(ply / 2);

    // Mate: end of game.
    if (replay.isCheckmate()) {
      candidates.push({
        ply, moveNumber, side: mv.color, san: mv.san, fen: fenAfter,
        type: "mate-threat",
        label: `Checkmate by ${mv.color === "w" ? "White" : "Black"}`,
      });
    } else if (Math.abs(swingForMover) >= 3) {
      const t: "swing" | "blunder-capture" = mv.captured && swingForMover >= 3 ? "blunder-capture" : "swing";
      candidates.push({
        ply, moveNumber, side: mv.color, san: mv.san, fen: fenAfter,
        type: t,
        label: t === "blunder-capture"
          ? `${mv.color === "w" ? "White" : "Black"} wins material (+${swingForMover})`
          : `Material swing (${swingForMover > 0 ? "+" : ""}${swingForMover})`,
        swing: swingForMover,
      });
    } else if (!firstCheckSeen && replay.inCheck()) {
      firstCheckSeen = true;
      candidates.push({
        ply, moveNumber, side: mv.color, san: mv.san, fen: fenAfter,
        type: "first-check",
        label: `First check of the game`,
      });
    }
    prevBal = bal;
  });

  // Prefer mate first, then largest swings, then first-check.
  const ranked = [...candidates].sort((a, b) => {
    const w = (t: TurningPoint["type"]) => t === "mate-threat" ? 100 : t === "blunder-capture" ? 50 + Math.abs(a.swing ?? 0) : t === "swing" ? 30 + Math.abs(a.swing ?? 0) : 10;
    return w(b.type) - w(a.type);
  });

  // De-duplicate by ply, keep up to `max`.
  const seen = new Set<number>();
  const out: TurningPoint[] = [];
  for (const t of ranked) {
    if (seen.has(t.ply)) continue;
    seen.add(t.ply);
    out.push(t);
    if (out.length >= max) break;
  }
  return out.sort((a, b) => a.ply - b.ply);
}
