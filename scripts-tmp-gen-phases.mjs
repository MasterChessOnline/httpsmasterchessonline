import { readFileSync, writeFileSync } from 'fs';
import { Chess } from 'chess.js';
import {
  ENDGAME_POSITIONS,
  TACTICS_POSITIONS,
  BASICS_POSITIONS,
  STRATEGY_POSITIONS,
  MIDDLEGAME_POSITIONS,
} from './scripts-tmp/positions-library.mjs';

const todo = JSON.parse(readFileSync('./scripts-tmp/inventory.json', 'utf8'));

const LIBRARY = {
  endgame: ENDGAME_POSITIONS,
  tactics: TACTICS_POSITIONS,
  basics: BASICS_POSITIONS,
  strategy: STRATEGY_POSITIONS,
  middlegame: MIDDLEGAME_POSITIONS,
};

function validate(startFen, moves) {
  let chess;
  try {
    chess = new Chess(startFen);
  } catch (e) {
    return null;
  }
  const valid = [];
  for (const [san, expl] of moves) {
    try {
      const r = chess.move(san, { sloppy: true });
      if (!r) break;
      valid.push([r.san, expl]);
    } catch { break; }
  }
  return valid;
}

// Find best matching position based on title + content keywords
function pickPosition(lesson) {
  const lib = LIBRARY[lesson.cat];
  if (!lib) return null;
  const haystack = `${lesson.lessonTitle} ${lesson.content}`.toLowerCase();
  // First try exact title match
  for (const pos of lib) {
    if (pos.keys.test(lesson.lessonTitle)) return pos;
  }
  // Then content match
  for (const pos of lib) {
    if (pos.keys.test(haystack)) return pos;
  }
  return null;
}

// Track per-category fallback rotation index
const fallbackIdx = { endgame: 0, tactics: 0, basics: 0, strategy: 0, middlegame: 0 };

function fallbackPos(cat) {
  const lib = LIBRARY[cat];
  if (!lib || lib.length === 0) return null;
  const pos = lib[fallbackIdx[cat] % lib.length];
  fallbackIdx[cat]++;
  return pos;
}

const allEntries = [];
const stats = { matched: 0, fallback: 0, fenOnly: 0, failed: 0 };

for (const lesson of todo) {
  let pos = pickPosition(lesson);
  let source = 'matched';
  if (!pos) {
    pos = fallbackPos(lesson.cat);
    source = 'fallback';
  }
  if (!pos) {
    // Final fallback: use lesson.fen if exists, else starting position with no moves
    if (lesson.fen) {
      allEntries.push({ lesson, startFen: lesson.fen, moves: [], source: 'fen-only' });
      stats.fenOnly++;
    } else {
      stats.failed++;
    }
    continue;
  }
  const startFen = lesson.fen || pos.fen;
  let validMoves = validate(startFen, pos.moves);
  let usedFen = startFen;
  // If start FEN is invalid or moves don't all play, fall back to library FEN
  if ((validMoves === null || validMoves.length < pos.moves.length) && pos.fen !== startFen) {
    const v2 = validate(pos.fen, pos.moves);
    if (v2 !== null) { validMoves = v2; usedFen = pos.fen; }
  }
  if (validMoves === null) {
    // Both FENs failed; use starting position
    validMoves = [];
    usedFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }
  allEntries.push({ lesson, startFen: usedFen, moves: validMoves, source });
  if (source === 'matched') stats.matched++;
  else stats.fallback++;
}

console.log(`Generated: ${allEntries.length}/${todo.length}`);
console.table(stats);

function escapeTs(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

let out = '\n  // ============= AUTO-GENERATED LESSON BOARDS (Phase 2-4) =============\n';
out += '  // Endgame, tactics, basics, strategy, middlegame lesson boards.\n\n';
for (const { lesson, startFen, moves } of allEntries) {
  out += `  "${lesson.lessonId}": {\n`;
  if (startFen && startFen !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    out += `    startFen: "${startFen}",\n`;
  }
  out += `    moves: [\n`;
  for (const [san, expl] of moves) {
    out += `      M("${escapeTs(san)}", "${escapeTs(expl)}"),\n`;
  }
  out += `    ],\n  },\n`;
}

writeFileSync('./scripts-tmp/generated-phases.ts', out);
console.log(`Wrote ${out.split('\n').length} lines to scripts-tmp/generated-phases.ts`);
