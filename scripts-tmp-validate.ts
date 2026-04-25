import { Chess } from "chess.js";
import { LESSON_MOVES } from "@/lib/lesson-moves";

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

let errors = 0;
function validateLine(label: string, startFen: string | undefined, moves: any[]) {
  const chess = new Chess(startFen || DEFAULT_FEN);
  for (let i = 0; i < moves.length; i++) {
    const step = moves[i];
    if (step.branches) {
      const fenAtBranch = chess.fen();
      for (const b of step.branches) {
        validateLine(`${label} > [${b.name}]`, fenAtBranch, b.moves);
      }
    }
    try {
      const r = chess.move(step.san);
      if (!r) { console.log(`❌ ${label} #${i + 1} (${step.san}): rejected`); errors++; return; }
    } catch (e: any) {
      console.log(`❌ ${label} #${i + 1} (${step.san}): ${e.message}`); errors++; return;
    }
  }
}

const targets = ["of-4", "of-5", "rl-1", "of-14", "qg-1"];
for (const id of targets) {
  const data = LESSON_MOVES[id];
  if (!data) { console.log(`⚠️  ${id} missing`); continue; }
  if (data.variations) for (const v of data.variations) validateLine(`${id} :: ${v.name}`, v.startFen, v.moves);
  else if (data.moves) validateLine(`${id}`, data.startFen, data.moves);
}
console.log(errors === 0 ? "✅ All sequences valid" : `\nErrors: ${errors}`);
