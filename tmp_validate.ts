import { Chess } from "chess.js";
import { COURSES } from "@/lib/courses-data";
import { MASTERCLASS_PRACTICE_EXTRAS } from "@/lib/masterclass-practice-extras";

function buildMoves(lesson: any) {
  const pl = (lesson.practiceLine && (lesson.practiceLine.moves?.length || lesson.practiceLine.autoResponses?.length))
    ? lesson.practiceLine
    : MASTERCLASS_PRACTICE_EXTRAS[lesson.id];
  if (!pl) return null;
  let firstSide: "w"|"b" = "w";
  if (pl.startFen) {
    const parts = pl.startFen.split(" ");
    if (parts[1] === "b") firstSide = "b";
  }
  const playerFirst = firstSide === pl.playerColor;
  const out: string[] = [];
  let pi=0,ai=0,turn=playerFirst;
  const total=(pl.moves?.length??0)+(pl.autoResponses?.length??0);
  for (let i=0;i<total;i++){
    if (turn && pi<pl.moves.length){out.push(pl.moves[pi].move);pi++;}
    else if (!turn && ai<pl.autoResponses.length){out.push(pl.autoResponses[ai]);ai++;}
    else if (pi<pl.moves.length){out.push(pl.moves[pi].move);pi++;}
    else if (ai<pl.autoResponses.length){out.push(pl.autoResponses[ai]);ai++;}
    turn=!turn;
  }
  return { moves: out, startFen: pl.startFen };
}

const ids = ["masterkurs-queens-gambit","masterkurs-ruy-lopez","masterkurs-caro-kann","masterkurs-najdorf"];
for (const cid of ids) {
  const c = COURSES.find(x=>x.id===cid)!;
  let bad = 0; const fails: string[] = [];
  let nonStart = 0;
  for (const l of c.lessons) {
    const built = buildMoves(l);
    if (!built) { bad++; fails.push(l.id+":no-data"); continue; }
    if (built.startFen) nonStart++;
    const g = built.startFen ? new Chess(built.startFen) : new Chess();
    let ok = true;
    for (const san of built.moves) {
      try { const r = g.move(san); if (!r) { ok=false; break; } }
      catch { ok=false; break; }
    }
    if (!ok) { bad++; fails.push(l.id+":illegal-move"); }
  }
  console.log(cid, "bad:", bad, "withStartFen(notFromInitial):", nonStart, "/", c.lessons.length);
  if (fails.length) console.log("  fails:", fails.slice(0,10));
}
