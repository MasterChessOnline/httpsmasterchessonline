/**
 * Build a single source of truth of fully-validated SAN sequences for every
 * masterclass lesson. Uses chess.js to walk the written `Sequence:` first,
 * then falls back to practiceLine and recovers from desync between `moves`
 * (player) and `autoResponses` (opponent) by trying either queue when the
 * expected one is illegal. Writes the result to
 * src/lib/masterclass-validated-lines.ts as a Record<lessonId, string[]>.
 */
import { Chess } from "chess.js";
import { COURSES } from "../src/lib/courses-data";
import { MASTERCLASS_PRACTICE_EXTRAS } from "../src/lib/masterclass-practice-extras";
import * as fs from "fs";

const MC_COURSES = [
  "masterkurs-jobava-london",
  "masterkurs-kalashnikov",
  "masterkurs-kid",
  "masterkurs-queens-gambit",
  "masterkurs-ruy-lopez",
  "masterkurs-caro-kann",
  "masterkurs-najdorf",
];

interface Built { sans: string[]; startFen?: string; truncatedAt?: number; sourceLen: number; source: "sequence" | "practice"; }

function cleanSanToken(token: string): string {
  return token
    .trim()
    .replace(/^\d+\.{1,3}/, "")
    .replace(/[?!]+$/, "")
    .replace(/[+#]+$/, "")
    .replace(/[.,;:]+$/, "")
    .trim();
}

function extractSequenceSans(content: string): string[] {
  const match = content.match(/Sequence:\s*([\s\S]*?)(?:\s+Play through|$)/i);
  if (!match) return [];
  return match[1]
    .split(/\s+/)
    .map(cleanSanToken)
    .filter((token) => token.length > 0 && !/^\d+\.{1,3}$/.test(token));
}

function validateFromInitial(sans: string[]): Built | null {
  if (!sans.length) return null;
  const game = new Chess();
  const out: string[] = [];
  let truncatedAt: number | undefined;
  for (const san of sans) {
    try {
      if (!game.move(san)) {
        truncatedAt = out.length;
        break;
      }
      out.push(san);
    } catch {
      truncatedAt = out.length;
      break;
    }
  }
  return { sans: out, truncatedAt, sourceLen: sans.length, source: "sequence" };
}

// Map of known startFen → SAN prefix played from the initial position.
// This lets every masterclass variation start from move 1 (like Jobava London)
// rather than mid-position, so users always see the full game build-up.
const STARTFEN_PREFIX: Record<string, string[]> = {
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": ["e4"],
  "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1": ["d4"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2": ["e4", "e5"],
};

function buildLesson(lesson: any): Built | null {
  const sequence = validateFromInitial(extractSequenceSans(lesson.content || ""));
  if (sequence?.sans.length) return sequence;

  const pl = (lesson.practiceLine && (lesson.practiceLine.moves?.length || lesson.practiceLine.autoResponses?.length))
    ? lesson.practiceLine
    : MASTERCLASS_PRACTICE_EXTRAS[lesson.id];
  if (!pl) return null;

  // If we know how to reach pl.startFen from the initial position, replay the
  // prefix moves from move 1 so the line starts at the very beginning.
  const knownPrefix = pl.startFen ? STARTFEN_PREFIX[pl.startFen] : null;
  const startFromInitial = !pl.startFen || !!knownPrefix;

  let firstSide: "w" | "b" = "w";
  if (!startFromInitial && pl.startFen && pl.startFen.split(" ")[1] === "b") firstSide = "b";
  // After replaying the known prefix, side-to-move is whatever pl.startFen said.
  if (startFromInitial && pl.startFen && pl.startFen.split(" ")[1] === "b") firstSide = "b";
  const playerFirst = firstSide === pl.playerColor;

  const game = (() => {
    try {
      if (startFromInitial) {
        const g = new Chess();
        for (const san of (knownPrefix ?? [])) g.move(san);
        return g;
      }
      return pl.startFen ? new Chess(pl.startFen) : new Chess();
    } catch { return new Chess(); }
  })();
  const out: string[] = startFromInitial ? [...(knownPrefix ?? [])] : [];
  let pi = 0, ai = 0, turn = playerFirst;
  const sourceLen = (pl.moves?.length ?? 0) + (pl.autoResponses?.length ?? 0);

  const tryQueue = (q: "p" | "a"): boolean => {
    if (q === "p") {
      while (pi < pl.moves.length) {
        const move = pl.moves[pi++];
        try { if (game.move(move.move)) { out.push(move.move); return true; } } catch { /* skip illegal player entry */ }
      }
    } else {
      while (ai < pl.autoResponses.length) {
        const san = pl.autoResponses[ai++];
        try { if (game.move(san)) { out.push(san); return true; } } catch { /* skip illegal response entry */ }
      }
    }
    return false;
  };

  let truncatedAt: number | undefined;
  for (let i = 0; i < sourceLen; i++) {
    const ok = tryQueue(turn ? "p" : "a");
    if (!ok) { truncatedAt = out.length; break; }
    turn = !turn;
  }
  return { sans: out, startFen: startFromInitial ? undefined : pl.startFen, truncatedAt, sourceLen, source: "practice" };
}

const result: Record<string, { sans: string[]; startFen?: string }> = {};
const report: string[] = [];

for (const cid of MC_COURSES) {
  const c = COURSES.find(x => x.id === cid)!;
  let truncCount = 0, totalLessons = 0, totalPliesIn = 0, totalPliesOut = 0;
  for (const l of c.lessons) {
    const b = buildLesson(l);
    if (!b) continue;
    totalLessons++;
    totalPliesIn += b.sourceLen;
    totalPliesOut += b.sans.length;
    if (b.truncatedAt !== undefined) truncCount++;
    result[l.id] = { sans: b.sans, ...(b.startFen ? { startFen: b.startFen } : {}) };
  }
  report.push(`${cid}: lessons=${totalLessons} truncated=${truncCount} sourcePlies=${totalPliesIn} validatedPlies=${totalPliesOut}`);
}

const banner = `/**
 * AUTO-GENERATED by scripts/build-masterclass-validated.ts.
 * For each masterclass lesson, the full chess.js-validated SAN sequence
 * (interleaved player + opponent moves), starting from \`startFen\` if any,
 * else from the initial position. Use as the single source of truth on the
 * interactive trainer board so every variation plays cleanly start-to-end.
 *
 * Build report:
${report.map(r => " *   - " + r).join("\n")}
 *
 * Re-generate after editing courses-data.ts or masterclass-practice-extras.ts:
 *   bunx tsx scripts/build-masterclass-validated.ts
 */
export interface ValidatedLine { sans: string[]; startFen?: string; }
export const MASTERCLASS_VALIDATED_LINES: Record<string, ValidatedLine> = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync("src/lib/masterclass-validated-lines.ts", banner);
console.log("Wrote src/lib/masterclass-validated-lines.ts");
console.log(report.join("\n"));
