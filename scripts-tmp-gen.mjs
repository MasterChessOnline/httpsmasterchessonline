import { readFileSync, writeFileSync } from 'fs';
import { Chess } from 'chess.js';
import { COURSE_TRUNKS, TITLE_CONTINUATIONS } from './scripts-tmp/o.mjs';
import { COURSE_VARIATIONS } from './scripts-tmp/variations.mjs';

const todo = JSON.parse(readFileSync('./scripts-tmp/todo.json', 'utf8'));

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

// Group todo by course to assign variation indices
const byCourse = {};
for (const l of todo) {
  byCourse[l.course] ??= [];
  byCourse[l.course].push(l);
}

const allEntries = [];
let titleMatched = 0, varAssigned = 0, trunkOnly = 0;

for (const [course, lessons] of Object.entries(byCourse)) {
  const trunk = COURSE_TRUNKS[course];
  if (!trunk) { console.log(`No trunk for ${course}`); continue; }
  const variations = COURSE_VARIATIONS[course] || [];
  
  let varIdx = 0;
  for (const lesson of lessons) {
    let extraMoves = null;
    let source = 'trunk';
    
    // Try title-keyword match first
    for (const cont of TITLE_CONTINUATIONS) {
      if (cont.match.test(lesson.lessonTitle)) {
        extraMoves = cont.extra;
        source = 'title';
        break;
      }
    }
    
    // Otherwise, assign next variation in rotation
    if (!extraMoves && variations.length > 0) {
      extraMoves = variations[varIdx % variations.length].moves;
      source = 'variation';
      varIdx++;
    }
    
    const combined = extraMoves ? [...trunk.trunk, ...extraMoves] : trunk.trunk;
    const { valid } = validateSequence(trunk.startFen, combined);
    
    // If extra failed validation, fallback to trunk
    let finalMoves = valid;
    let finalSource = source;
    if (extraMoves && valid.length < trunk.trunk.length + 1) {
      const fallback = validateSequence(trunk.startFen, trunk.trunk);
      finalMoves = fallback.valid;
      finalSource = 'trunk-fallback';
    }
    
    allEntries.push({ lesson, moves: finalMoves, source: finalSource });
    if (finalSource === 'title') titleMatched++;
    else if (finalSource === 'variation') varAssigned++;
    else trunkOnly++;
  }
}

console.log(`Generated: ${allEntries.length}/${todo.length}`);
console.log(`  title-matched: ${titleMatched}`);
console.log(`  variation-assigned: ${varAssigned}`);
console.log(`  trunk-only/fallback: ${trunkOnly}`);

function escapeTs(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

let out = '\n  // ============= AUTO-GENERATED OPENING BOARDS =============\n';
out += '  // Each entry maps a lesson ID to an interactive opening sequence.\n';
out += '  // Boards demonstrate the specific opening line covered in that lesson.\n\n';
for (const { lesson, moves } of allEntries) {
  out += `  "${lesson.lessonId}": {\n    moves: [\n`;
  for (const [san, expl] of moves) {
    out += `      M("${escapeTs(san)}", "${escapeTs(expl)}"),\n`;
  }
  out += `    ],\n  },\n`;
}

writeFileSync('./scripts-tmp/generated.ts', out);
console.log(`\nWrote ${out.split('\n').length} lines to ./scripts-tmp/generated.ts`);

// Sample output
console.log('\n=== Sample (first 3 lessons) ===');
for (const e of allEntries.slice(0, 3)) {
  console.log(`\n${e.lesson.lessonId}: ${e.lesson.lessonTitle} [${e.source}]`);
  for (const [san] of e.moves.slice(0, 8)) console.log(`  ${san}`);
  console.log(`  ... (${e.moves.length} moves total)`);
}
