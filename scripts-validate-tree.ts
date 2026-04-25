// Validates a lesson variation tree using chess.js.
// Reads JSON from stdin: { defaultFen, tree: { variations: [...] } }
// Outputs JSON to stdout: { ok: bool, errors: string[] }
import { Chess } from "chess.js";

const data = await new Response(Bun.stdin.stream()).text();
const { defaultFen, tree } = JSON.parse(data);

const errors: string[] = [];

function tryMove(chess: Chess, san: string): boolean {
  try {
    const r = chess.move(san);
    return !!r;
  } catch {
    return false;
  }
}

function validateMoves(label: string, startFen: string, moves: any[]) {
  const chess = new Chess(startFen);
  for (let i = 0; i < moves.length; i++) {
    const step = moves[i];
    if (step.branches) {
      const fenBeforeMove = chess.fen();
      for (const b of step.branches) {
        validateMoves(`${label} > [${b.name}]`, fenBeforeMove, b.moves);
      }
    }
    if (!tryMove(chess, step.san)) {
      errors.push(`${label} #${i + 1} (${step.san}): illegal at ${chess.fen()}`);
      return;
    }
  }
}

for (const v of tree.variations) {
  const start = v.startFen || defaultFen;
  validateMoves(v.name, start, v.moves);
}

console.log(JSON.stringify({ ok: errors.length === 0, errors }));
