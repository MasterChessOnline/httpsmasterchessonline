import { readFileSync, writeFileSync } from 'fs';
const src = readFileSync('src/lib/courses-data.ts', 'utf8');
const moves = readFileSync('src/lib/lesson-moves.ts', 'utf8');
const moveKeys = new Set([...moves.matchAll(/^\s*"([^"]+)":\s*\{/gm)].map(m => m[1]));

// Course id heuristic mapping for "unknown" category courses
const FORCED_CAT = {
  'kings-indian': 'openings',
  'caro-kann': 'openings',
  'calculation-training': 'tactics',
};

const chunks = src.split(/\n  \{\n    id: "/).slice(1);
const out = [];
for (const chunk of chunks) {
  const id = chunk.match(/^([^"]+)"/)?.[1];
  let cat = chunk.match(/category:\s*"([^"]+)"/)?.[1];
  if (!cat || cat === 'unknown') cat = FORCED_CAT[id] || 'strategy';
  const title = chunk.match(/title:\s*"([^"]+)"/)?.[1];
  // L("id","title", "content", [...kp...], "fen"?)
  // capture id, title, content (text), and optional fen at the end before close
  const lessonRegex = /L\("([^"]+)",\s*"([^"]+)",\s*"((?:[^"\\]|\\.)*)",\s*\[([^\]]*)\](?:,\s*"([^"]+)")?\)/g;
  for (const m of chunk.matchAll(lessonRegex)) {
    const lid = m[1];
    if (moveKeys.has(lid)) continue;
    out.push({
      course: id,
      courseTitle: title,
      cat,
      lessonId: lid,
      lessonTitle: m[2],
      content: m[3].slice(0, 200),
      fen: m[5] || null,
    });
  }
}

writeFileSync('scripts-tmp/inventory.json', JSON.stringify(out, null, 2));
const byCat = {};
for (const l of out) {
  byCat[l.cat] ??= 0;
  byCat[l.cat]++;
}
console.log('Missing boards by category:');
console.table(byCat);
console.log('Total missing:', out.length);
