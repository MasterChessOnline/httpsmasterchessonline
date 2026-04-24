import { readFileSync, writeFileSync } from 'fs';
import { Chess } from 'chess.js';
import { COURSE_TRUNKS, TITLE_CONTINUATIONS } from './scripts-tmp/o.mjs';

const todo = JSON.parse(readFileSync('./scripts-tmp/todo.json', 'utf8'));

// Validate a sequence — return {ok, validMoves, finalFen}
function validateSequence(startFen, moves) {
  const chess = new Chess(startFen);
  const valid = [];
  for (const [san, expl] of moves) {
    try {
      const result = chess.move(san, { sloppy: true });
      if (!result) break;
      valid.push([result.san, expl]);
    } catch (e) {
      break;
    }
  }
  return { valid, finalFen: chess.fen() };
}

// Build entry for one lesson
function buildEntry(lesson) {
  const trunk = COURSE_TRUNKS[lesson.course];
  if (!trunk) return null;
  
  // Find a continuation matching the title
  let extraMoves = [];
  for (const cont of TITLE_CONTINUATIONS) {
    if (cont.match.test(lesson.lessonTitle)) {
      extraMoves = cont.extra;
      break;
    }
  }
  
  // Combine trunk + extra
  const combined = [...trunk.trunk, ...extraMoves];
  const { valid } = validateSequence(trunk.startFen, combined);
  
  // If extra invalid (e.g. doesn't fit move order), fall back to trunk only
  if (valid.length < trunk.trunk.length + 1 && extraMoves.length > 0) {
    const trunkOnly = validateSequence(trunk.startFen, trunk.trunk);
    return {
      lessonId: lesson.lessonId,
      moves: trunkOnly.valid,
      hasExtra: false,
    };
  }
  
  return {
    lessonId: lesson.lessonId,
    moves: valid,
    hasExtra: extraMoves.length > 0,
  };
}

const entries = [];
let withExtra = 0, trunkOnly = 0, failed = 0;
for (const lesson of todo) {
  const entry = buildEntry(lesson);
  if (!entry) { failed++; continue; }
  entries.push({ lesson, entry });
  if (entry.hasExtra) withExtra++; else trunkOnly++;
}

console.log(`Generated: ${entries.length}/${todo.length}`);
console.log(`  with custom continuation: ${withExtra}`);
console.log(`  trunk only (explore mode): ${trunkOnly}`);
console.log(`  failed: ${failed}`);

// Now produce TS code to insert
function escapeTs(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

let out = '\n  // ============= AUTO-GENERATED OPENING BOARDS =============\n';
for (const { lesson, entry } of entries) {
  out += `  "${entry.lessonId}": {\n    moves: [\n`;
  for (const [san, expl] of entry.moves) {
    out += `      M("${escapeTs(san)}", "${escapeTs(expl)}"),\n`;
  }
  out += `    ],\n  },\n`;
}

writeFileSync('./scripts-tmp/generated.ts', out);
console.log(`\nWrote ${out.split('\n').length} lines to ./scripts-tmp/generated.ts`);
