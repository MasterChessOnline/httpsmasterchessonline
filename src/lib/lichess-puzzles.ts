// Loader + types for the 770 Stockfish-vetted Lichess puzzles in /public/data/lichess-puzzles.json.
// Each puzzle stores the FEN BEFORE the opponent's setup move, then a FULL UCI solution sequence.
// Mate-to-end: the player must play every user move; opponent responses are auto-played from the
// solution[] array. We expose the entire sequence so Training.tsx can drive the multi-step flow.

import { Chess } from "chess.js";
import type { TrainingMode, TrainingPosition } from "./training-positions";

interface RawLichessPuzzle {
  id: string;
  fen: string;
  setup: string;       // UCI of opponent's move that creates the puzzle
  solution: string[];  // UCI sequence: [user move, opp reply, user move, ...]
  rating: number;
  themes: string;
  mode: TrainingMode;
  difficulty: "beginner" | "intermediate" | "advanced";
  bucket: string;
}

let cache: TrainingPosition[] | null = null;
let inflight: Promise<TrainingPosition[]> | null = null;

function themeLabel(themes: string): string {
  const t = themes.toLowerCase();
  if (t.includes("matein1")) return "Mate in 1";
  if (t.includes("matein2")) return "Mate in 2";
  if (t.includes("matein3")) return "Mate in 3";
  if (t.includes("matein4")) return "Mate in 4";
  if (t.includes("matein5")) return "Mate in 5";
  if (t.includes("mate")) return "Forced mate";
  if (t.includes("fork")) return "Tactical fork";
  if (t.includes("pin")) return "Pin tactic";
  if (t.includes("skewer")) return "Skewer";
  if (t.includes("discoveredattack")) return "Discovered attack";
  if (t.includes("sacrifice")) return "Sacrifice for advantage";
  if (t.includes("endgame")) return "Endgame technique";
  if (t.includes("middlegame")) return "Middlegame plan";
  if (t.includes("crushing")) return "Crushing blow";
  return "Stockfish puzzle";
}

function explain(themes: string, rating: number): string {
  const t = themes.toLowerCase();
  if (t.includes("mate")) return `Forced mating sequence — every alternative loses by force. Verified by Stockfish at ${rating} difficulty. Play it through to checkmate.`;
  if (t.includes("fork")) return `Classic fork: one piece simultaneously attacks two enemy targets, winning material.`;
  if (t.includes("pin") || t.includes("skewer")) return `A pinning/skewering motif — the back piece can't move without losing more material.`;
  if (t.includes("sacrifice") || t.includes("attraction")) return `A precise sacrifice that leads to decisive advantage. Stockfish-verified.`;
  if (t.includes("endgame")) return `Correct endgame technique. The other moves let the opponent hold or even escape.`;
  return `Best move per Stockfish. Other moves either lose material or miss the strongest continuation.`;
}

function whyWrong(themes: string): string {
  const t = themes.toLowerCase();
  if (t.includes("mate")) return `Your move missed the forced mating line. Look for checks first — every check the opponent can't escape brings you closer to mate.`;
  if (t.includes("endgame")) return `In endgames, precision matters: every tempo counts. The wrong square lets the opponent activate counterplay.`;
  return `Stockfish prefers a different move — usually one that wins more material, gives a stronger attack, or avoids a hidden tactic.`;
}

/** Extended training position with the full UCI solution sequence (user + opp moves). */
export interface PuzzlePosition extends TrainingPosition {
  /** Full move sequence in UCI starting from `fen` (after setup). Even indices = user moves. */
  solutionUci: string[];
}

export async function loadLichessPuzzles(): Promise<PuzzlePosition[]> {
  if (cache) return cache as PuzzlePosition[];
  if (inflight) return inflight as Promise<PuzzlePosition[]>;
  inflight = (async () => {
    const res = await fetch("/data/lichess-puzzles.json");
    const raw: RawLichessPuzzle[] = await res.json();

    const out: PuzzlePosition[] = [];
    for (const p of raw) {
      try {
        // Apply the setup move so user starts with the right side to play
        const c = new Chess(p.fen);
        const setupMove = c.move({
          from: p.setup.slice(0, 2),
          to: p.setup.slice(2, 4),
          promotion: p.setup.length > 4 ? (p.setup[4] as "q" | "r" | "b" | "n") : undefined,
        });
        if (!setupMove) continue;
        if (!p.solution || p.solution.length === 0) continue;
        out.push({
          id: p.id,
          mode: p.mode,
          fen: c.fen(),
          side: c.turn() as "w" | "b",
          bestMove: p.solution[0],
          acceptable: [p.solution[0]],
          title: themeLabel(p.themes) + ` · ${p.rating}`,
          hint: p.solution[0]
            ? `Look for a strong move involving the piece on ${p.solution[0].slice(0, 2)}.`
            : "Find the strongest move.",
          explanation: explain(p.themes, p.rating),
          whyWrong: whyWrong(p.themes),
          difficulty: p.difficulty,
          solutionUci: p.solution,
        } as PuzzlePosition);
      } catch {
        // skip invalid
      }
    }
    cache = out;
    return out as TrainingPosition[];
  })() as Promise<TrainingPosition[]>;
  return inflight as Promise<PuzzlePosition[]>;
}

export function clearLichessPuzzleCache() {
  cache = null;
  inflight = null;
}
