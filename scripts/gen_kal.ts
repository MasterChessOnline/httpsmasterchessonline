import { Chess } from "chess.js";
import * as fs from "fs";

const raw = fs.readFileSync("/tmp/kal_lines.txt", "utf8").trim().split("\n");

// Move-name -> friendly Kalashnikov annotation
function annotate(san: string, moveNumber: number, isWhite: boolean): string {
  const num = `${moveNumber}${isWhite ? "." : "..."}`;
  // Symbol-based heuristics
  if (san.includes("O-O-O")) return `${num}${san} — Castling long, opposite-side attack mode.`;
  if (san.includes("O-O")) return `${num}${san} — Castling short, completing development.`;
  if (san.startsWith("N")) return `${num}${san} — Knight maneuver — fighting for key squares in the Kalashnikov.`;
  if (san.startsWith("B")) return `${num}${san} — Bishop development — eyeing critical diagonals.`;
  if (san.startsWith("R")) return `${num}${san} — Rook activation — claiming an open file.`;
  if (san.startsWith("Q")) return `${num}${san} — Queen move — coordinating the attack.`;
  if (san.startsWith("K")) return `${num}${san} — King step — careful tactics in the open.`;
  if (san.includes("x")) return `${num}${san} — Capture — concrete tactics in the Kalashnikov.`;
  return `${num}${san} — Pawn move — staking out space in the Kalashnikov center.`;
}

interface Parsed {
  title: string;
  chapter: string;
  sans: string[]; // validated, possibly truncated
  raw: string;
}

const parsed: Parsed[] = [];

for (let i = 0; i < raw.length; i++) {
  const line = raw[i];
  const [title, , chapter, movetext] = line.split("|");
  // Strip move numbers like "1." "1..." and dots
  const tokens = movetext
    .replace(/\d+\.\.\./g, " ")
    .replace(/\d+\./g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const chess = new Chess();
  const validSans: string[] = [];
  for (const tok of tokens) {
    try {
      const r = chess.move(tok);
      if (!r) break;
      validSans.push(r.san);
    } catch {
      console.error(`Line ${i + 1} (${title}): illegal move "${tok}" at ply ${validSans.length + 1}`);
      break;
    }
  }
  if (validSans.length !== tokens.length) {
    console.error(`  -> truncated to ${validSans.length}/${tokens.length} moves`);
  }
  parsed.push({ title, chapter, sans: validSans, raw: movetext.trim() });
}

// === Generate lesson-moves entries ===
const lessonMovesOut: string[] = [];
lessonMovesOut.push(`\n  // ===== KALASHNIKOV MASTERKURS (50 LINES · 6 CHAPTERS) =====`);
parsed.forEach((p, i) => {
  const id = `kal-${i + 1}`;
  lessonMovesOut.push(`  "${id}": {`);
  lessonMovesOut.push(`    moves: [`);
  let mn = 1;
  let isWhite = true;
  for (const san of p.sans) {
    const expl = annotate(san, mn, isWhite).replace(/"/g, '\\"');
    lessonMovesOut.push(`      M("${san}", "${expl}"),`);
    if (!isWhite) mn++;
    isWhite = !isWhite;
  }
  lessonMovesOut.push(`    ],`);
  lessonMovesOut.push(`  },`);
});
fs.writeFileSync("/tmp/kal_lesson_moves.txt", lessonMovesOut.join("\n"));

// === Generate courses-data lessons ===
const coursesOut: string[] = [];
parsed.forEach((p, i) => {
  const id = `kal-${i + 1}`;
  // Build readable PGN-like sequence string
  const chess = new Chess();
  const display: string[] = [];
  let mn = 1;
  for (let j = 0; j < p.sans.length; j++) {
    chess.move(p.sans[j]);
    if (j % 2 === 0) display.push(`${mn}.${p.sans[j]}`);
    else { display.push(p.sans[j]); mn++; }
  }
  const seq = display.join(" ");
  const title = p.title.replace(/"/g, '\\"');
  const chapter = p.chapter.replace(/"/g, '\\"');
  const content = `Sequence: ${seq}. Play through the moves on the interactive board, then click \\"Practice\\" to test your recall.`;
  const kp1 = `Memorize the line: ${seq}`;
  const kp2 = `Understand the typical Kalashnikov plans behind every move.`;
  const kp3 = `Use the practice mode to drill the moves without hints.`;
  coursesOut.push(`      LC("${id}", "${title}", "${content}", ["${kp1}", "${kp2}", "${kp3}"], "${chapter}"),`);
});
fs.writeFileSync("/tmp/kal_courses.txt", coursesOut.join("\n"));

console.log(`Generated ${parsed.length} lessons.`);
console.log(`Lesson-moves block: /tmp/kal_lesson_moves.txt`);
console.log(`Courses block: /tmp/kal_courses.txt`);
