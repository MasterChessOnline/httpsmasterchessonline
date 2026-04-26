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
  // Strip move numbers like "1." or "12."
  const tokens = body.trim().split(/\s+/).filter(t => !/^\d+\.+$/.test(t));
  lines.push({ num, chapter, chapterIdx, sans: tokens });
}

console.log(`Parsed ${lines.length} lines`);

// Validate each line
const errors: { num: number; idx: number; san: string; fen: string; legal: string[] }[] = [];
const validLines: (Line & { legalSans: string[] })[] = [];

for (const line of lines) {
  const c = new Chess();
  const legalSans: string[] = [];
  let ok = true;
  for (let i = 0; i < line.sans.length; i++) {
    const san = line.sans[i];
    try {
      const r = c.move(san);
      if (!r) throw new Error("null");
      legalSans.push(r.san);
    } catch (e) {
      const moves = c.moves().slice(0, 8);
      errors.push({ num: line.num, idx: i, san, fen: c.fen(), legal: moves });
      ok = false;
      break;
    }
  }
  if (ok) validLines.push({ ...line, legalSans });
}

console.log(`Valid: ${validLines.length}, Invalid: ${errors.length}`);
if (errors.length) {
  console.log("\n=== ERRORS ===");
  for (const e of errors) console.log(`Line ${e.num} move ${e.idx + 1} (${e.san}) illegal. FEN ${e.fen}. Legal: ${e.legal.join(",")}`);
}

fs.writeFileSync("/tmp/parsed.json", JSON.stringify({ lines: validLines, errors }, null, 2));
