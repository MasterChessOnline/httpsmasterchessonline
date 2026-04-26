import { Chess } from "chess.js";
import * as fs from "fs";

const raw = fs.readFileSync("/tmp/lines.txt", "utf8").split(/\n/).filter(Boolean);

interface Line { num: number; chapter: string; chapterIdx: number; sans: string[]; }
const lines: Line[] = [];
let chapter = "";
let chapterIdx = 0;

for (const row of raw) {
  if (row.startsWith("CHAPTER|")) {
    chapter = row.slice("CHAPTER|".length);
    chapterIdx++;
    continue;
  }
  const [numStr, body] = row.split("|");
  const num = parseInt(numStr);
  const tokens = body.trim().split(/\s+/).filter(t => !/^\d+\.+$/.test(t));
  lines.push({ num, chapter, chapterIdx, sans: tokens });
}

// Validate; truncate at first illegal move
const out: { num: number; chapter: string; chapterIdx: number; sans: string[]; truncated: boolean; originalLength: number }[] = [];

for (const line of lines) {
  const c = new Chess();
  const legalSans: string[] = [];
  for (const san of line.sans) {
    try {
      const r = c.move(san);
      if (!r) break;
      legalSans.push(r.san);
    } catch {
      break;
    }
  }
  out.push({
    num: line.num,
    chapter: line.chapter,
    chapterIdx: line.chapterIdx,
    sans: legalSans,
    truncated: legalSans.length !== line.sans.length,
    originalLength: line.sans.length,
  });
}

const truncated = out.filter(l => l.truncated);
console.log(`Total lines: ${out.length}, Truncated: ${truncated.length}`);
truncated.forEach(l => console.log(`  Line ${l.num}: ${l.sans.length}/${l.originalLength} moves`));

fs.writeFileSync("/tmp/parsed.json", JSON.stringify(out));
console.log("Wrote /tmp/parsed.json");

// === Generate annotation text per move ===
function annotate(san: string, moveNum: number, isWhite: boolean): string {
  const prefix = `${moveNum}${isWhite ? "." : "..."}${san}`;
  // Heuristic explanations based on SAN
  const tags: string[] = [];
  if (san === "d4") tags.push("White claims the central dark square — the Jobava starts here.");
  else if (san === "Nc3") tags.push("The Jobava signature: knight to c3 BEFORE c2-c3.");
  else if (san === "Bf4") tags.push("The London bishop, ahead of its pawn chain, eyeing c7.");
  else if (san === "Nb5") tags.push("Typical Jobava jump — pressuring c7 and probing the queenside.");
  else if (san.startsWith("O-O-O")) tags.push("Castling long! White commits to opposite-side attack — soul of the Jobava.");
  else if (san.startsWith("O-O")) tags.push("Castling short, completing development.");
  else if (san === "e3") tags.push("Quiet, solid Jobava — building the center without committing.");
  else if (san === "e4") tags.push("Aggressive Jobava — grabbing the full center fast.");
  else if (san === "Qd2") tags.push("Preparing Bh6 trade and long castling.");
  else if (san === "Bh6") tags.push("Targeting the Bg7 — the heart of opposite-side attack vs the fianchetto.");
  else if (san === "f3") tags.push("Stabilizing e4 and preparing g4/h4 pawn storm.");
  else if (san === "h4") tags.push("The pawn storm begins! Opening lines vs the enemy king.");
  else if (san === "h5") tags.push("Pushing further to crack open the king with hxg6 / h6.");
  else if (san === "g4") tags.push("Pawn storm: opening files toward the enemy king.");
  else if (san === "Ne5") tags.push("The dream square — centralized knight supporting the kingside.");
  else if (san === "Bd3") tags.push("Activating the Jobava battery on the b1-h7 diagonal.");
  else if (san.startsWith("Q") && san.includes("x")) tags.push("Queen captures — calculating concrete tactics.");
  else if (san.includes("x")) tags.push("A forcing capture — reshaping the position.");
  else if (san.includes("+")) tags.push("Check! Forces the opponent's reply.");
  else if (san.startsWith("N")) tags.push("Knight maneuver — improving piece coordination.");
  else if (san.startsWith("B")) tags.push("Bishop development.");
  else if (san.startsWith("R")) tags.push("Rook activation — preparing heavy-piece play.");
  else if (san.startsWith("Q")) tags.push("Queen redeployment.");
  else if (san.startsWith("K")) tags.push("King move — typically forced.");
  else tags.push("Pawn move — staking out space.");
  return `${prefix} — ${tags[0]}`;
}

// Generate TS for LESSON_MOVES
let ts = "";
for (const line of out) {
  ts += `  "jl-${line.num}": {\n    moves: [\n`;
  for (let i = 0; i < line.sans.length; i++) {
    const san = line.sans[i];
    const moveNum = Math.floor(i / 2) + 1;
    const isWhite = i % 2 === 0;
    const ann = annotate(san, moveNum, isWhite).replace(/"/g, '\\"');
    ts += `      M("${san}", "${ann}"),\n`;
  }
  ts += `    ],\n  },\n`;
}

fs.writeFileSync("/tmp/lesson-moves-block.ts", ts);
console.log("Wrote /tmp/lesson-moves-block.ts");

// === Generate course lessons block ===
const titles: Record<number, string> = {
  // Use first key descriptive token from chapter; we'll just label "Variation N: <last move>"
};

// Suggest titles based on chapter + first distinguishing move
function makeTitle(num: number, sans: string[]): string {
  // Use third black move as a discriminator (e.g., 3...c5 → c5)
  const third = sans[5] || sans[sans.length - 1] || "Line";
  return `Line ${num}: ${third}`;
}

let coursesTs = "";
for (const line of out) {
  const title = makeTitle(line.num, line.sans);
  const moveString = line.sans.map((s, i) => {
    const mn = Math.floor(i / 2) + 1;
    return i % 2 === 0 ? `${mn}.${s}` : s;
  }).join(" ");
  const safeMoveString = moveString.replace(/"/g, '\\"');
  const safeTitle = title.replace(/"/g, '\\"');
  coursesTs += `      L("jl-${line.num}", "${safeTitle}", "Sequence: ${safeMoveString}. Play through the moves on the interactive board, then click \\"Practice\\" to test your recall.", ["Memorize the line: ${safeMoveString}", "Understand the typical Jobava plans behind every move.", "Use the practice mode to drill the moves without hints."], "${line.chapter.replace(/"/g, '\\"')}"),\n`;
}
fs.writeFileSync("/tmp/courses-block.ts", coursesTs);
console.log("Wrote /tmp/courses-block.ts");

// Chapter array
const chapters = Array.from(new Set(out.map(l => l.chapter)));
fs.writeFileSync("/tmp/chapters.json", JSON.stringify(chapters, null, 2));
console.log("Chapters:", chapters.length);
