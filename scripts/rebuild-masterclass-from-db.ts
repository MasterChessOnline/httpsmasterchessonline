/**
 * Rebuilds every Masterkurs variation as: (1) book moves from the local
 * 110k-game master database (public/data/masterchess), (2) Stockfish best move
 * once the position falls out of book, (3) Stockfish blunder check on the
 * whole line, (4) auto-generated per-move explanations (capture / check /
 * castles / develops / central pawn …). Each lesson keeps its starting line
 * identity (first book move of the existing sequence is preserved).
 *
 * Output: src/lib/masterclass-validated-lines.ts
 */
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Chess, Square } from "chess.js";
import * as fs from "fs";
import * as path from "path";
import { MASTERCLASS_VALIDATED_LINES } from "../src/lib/masterclass-validated-lines";

const SF_BIN = process.env.SF_BIN || "/nix/store/givsmnk5rpawndn3dbcb53q5phg9wcz2-stockfish-17.1/bin/stockfish";
const SF_DEPTH = Number(process.env.SF_DEPTH || 14);
const TARGET_PLIES = Number(process.env.TARGET_PLIES || 22);
const MIN_BOOK_GAMES = Number(process.env.MIN_BOOK_GAMES || 3);
const BLUNDER_CP = Number(process.env.BLUNDER_CP || 200);
const DB_DIR = path.resolve("public/data/masterchess/index-shards");

// ── Local master DB lookup ────────────────────────────────────────────────
interface ShardMove { san: string; uci: string; w: number; d: number; b: number; r: number }
interface ShardEntry { w: number; d: number; b: number; r: number; m: ShardMove[] }
const shardCache = new Map<number, Record<string, ShardEntry> | null>();
function fenKey(fen: string) { return fen.split(" ").slice(0, 4).join(" "); }
function shardId(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  return Math.abs(h) % 256;
}
function loadShard(id: number) {
  if (!shardCache.has(id)) {
    const p = path.join(DB_DIR, `${id}.json`);
    try { shardCache.set(id, JSON.parse(fs.readFileSync(p, "utf8"))); }
    catch { shardCache.set(id, null); }
  }
  return shardCache.get(id)!;
}
function lookupBook(fen: string): ShardMove[] | null {
  const key = fenKey(fen);
  const s = loadShard(shardId(key));
  const e = s?.[key];
  if (!e || !e.m?.length) return null;
  return [...e.m].sort((a, b) => (b.w + b.d + b.b) - (a.w + a.d + a.b));
}

// ── Stockfish wrapper (single persistent process) ─────────────────────────
class SF {
  private p: ChildProcessWithoutNullStreams;
  private buf = "";
  private resolvers: ((line: string) => boolean)[] = [];
  constructor() {
    this.p = spawn(SF_BIN);
    this.p.stdout.on("data", (d: Buffer) => {
      this.buf += d.toString();
      let i; while ((i = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, i).trim();
        this.buf = this.buf.slice(i + 1);
        for (let k = this.resolvers.length - 1; k >= 0; k--)
          if (this.resolvers[k](line)) this.resolvers.splice(k, 1);
      }
    });
  }
  send(c: string) { this.p.stdin.write(c + "\n"); }
  waitFor(t: (l: string) => boolean): Promise<string> {
    return new Promise((res) => this.resolvers.push((l) => { if (t(l)) { res(l); return true; } return false; }));
  }
  async init() {
    this.send("uci"); await this.waitFor((l) => l === "uciok");
    this.send("setoption name Threads value 2");
    this.send("setoption name Hash value 64");
    this.send("setoption name MultiPV value 1");
    this.send("isready"); await this.waitFor((l) => l === "readyok");
  }
  async newGame() { this.send("ucinewgame"); this.send("isready"); await this.waitFor((l) => l === "readyok"); }
  async best(fen: string, depth = SF_DEPTH): Promise<{ uci: string; cp: number } | null> {
    let lastInfo = "";
    const collector = (line: string) => { if (line.startsWith("info ") && line.includes(" pv ")) lastInfo = line; return false; };
    this.resolvers.push(collector);
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
    const bm = await this.waitFor((l) => l.startsWith("bestmove"));
    const idx = this.resolvers.indexOf(collector); if (idx >= 0) this.resolvers.splice(idx, 1);
    const m = bm.match(/bestmove (\S+)/);
    if (!m || m[1] === "(none)") return null;
    let cp = 0;
    const cpM = lastInfo.match(/score cp (-?\d+)/);
    const mateM = lastInfo.match(/score mate (-?\d+)/);
    if (cpM) cp = Number(cpM[1]);
    else if (mateM) cp = Number(mateM[1]) > 0 ? 100000 : -100000;
    return { uci: m[1], cp };
  }
  quit() { this.send("quit"); this.p.kill(); }
}
function uciToSan(fen: string, uci: string): string | null {
  try {
    const g = new Chess(fen);
    const r = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length > 4 ? uci[4] as any : undefined });
    return r ? r.san : null;
  } catch { return null; }
}

// ── Auto-explanation generator ────────────────────────────────────────────
const PIECE_NAME: Record<string, string> = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" };
const CENTER = new Set(["d4", "e4", "d5", "e5"]);
const EXTENDED_CENTER = new Set(["c4", "c5", "d4", "d5", "e4", "e5", "f4", "f5", "c3", "c6", "d3", "d6", "e3", "e6", "f3", "f6"]);
function explainMove(fenBefore: string, san: string, plyIdx: number, isFirstBookMove: boolean, openingName?: string): string {
  const g = new Chess(fenBefore);
  const r = g.move(san);
  if (!r) return "";
  const piece = PIECE_NAME[r.piece] ?? "Piece";
  const parts: string[] = [];
  if (isFirstBookMove && openingName) parts.push(openingName + ".");

  if (r.flags.includes("k")) parts.push("Castles kingside — king to safety, rook activated.");
  else if (r.flags.includes("q")) parts.push("Castles queenside — king to safety, rook joins the attack.");
  else if (r.flags.includes("e")) parts.push(`En passant capture on ${r.to}.`);
  else if (r.flags.includes("c") || r.flags.includes("cp")) parts.push(`${piece} captures on ${r.to}.`);
  else if (r.promotion) parts.push(`Promotes to ${PIECE_NAME[r.promotion]} on ${r.to}.`);
  else if (r.piece === "p") {
    if (CENTER.has(r.to)) parts.push(`Stakes a claim in the center with ${r.to}.`);
    else if (EXTENDED_CENTER.has(r.to)) parts.push(`Pawn supports the center on ${r.to}.`);
    else parts.push(`Pawn to ${r.to}.`);
  } else if (r.piece === "n" || r.piece === "b") {
    parts.push(`Develops the ${piece.toLowerCase()} to ${r.to}.`);
  } else if (r.piece === "r") {
    parts.push(`Rook to ${r.to} — activates on the file.`);
  } else if (r.piece === "q") {
    parts.push(`Queen to ${r.to}.`);
  } else if (r.piece === "k") {
    parts.push(`King step to ${r.to}.`);
  }

  if (r.san.endsWith("#")) parts.push("Checkmate!");
  else if (r.san.endsWith("+")) parts.push("Check.");

  return parts.join(" ").trim();
}

// ── Pipeline per lesson ───────────────────────────────────────────────────
interface Built { sans: string[]; explanations: string[]; startFen?: string; bookPlies: number; sfPlies: number; }

async function buildLesson(sf: SF, originalSans: string[], startFen: string | undefined, openingHint?: string): Promise<Built> {
  await sf.newGame();
  const game = startFen ? new Chess(startFen) : new Chess();
  const outSans: string[] = [];
  const outExpl: string[] = [];
  let bookPlies = 0, sfPlies = 0;

  for (let i = 0; i < TARGET_PLIES; i++) {
    const fen = game.fen();
    const desired = originalSans[i];
    const book = lookupBook(fen);
    let chosenSan: string | null = null;
    let isBook = false;

    if (book && book.length) {
      const totalGames = book.reduce((a, b) => a + b.w + b.d + b.b, 0);
      const topGames = book[0].w + book[0].d + book[0].b;
      const desiredEntry = desired ? book.find((m) => m.san === desired) : undefined;
      if (desiredEntry && (desiredEntry.w + desiredEntry.d + desiredEntry.b) >= MIN_BOOK_GAMES) {
        chosenSan = desiredEntry.san; isBook = true;
      } else if (topGames >= MIN_BOOK_GAMES || totalGames >= MIN_BOOK_GAMES * 2) {
        chosenSan = book[0].san; isBook = true;
      }
    }

    if (!chosenSan) {
      const b = await sf.best(fen);
      if (!b) break;
      chosenSan = uciToSan(fen, b.uci);
      if (!chosenSan) break;
    }

    const expl = explainMove(fen, chosenSan, i, i === 0, openingHint);
    try { game.move(chosenSan); } catch { break; }
    outSans.push(chosenSan); outExpl.push(expl);
    if (isBook) bookPlies++; else sfPlies++;
  }

  const verifiedSans: string[] = []; const verifiedExpl: string[] = [];
  const g2 = startFen ? new Chess(startFen) : new Chess();
  for (let i = 0; i < outSans.length; i++) {
    const fen = g2.fen();
    const b = await sf.best(fen);
    if (!b) break;
    const bestSan = uciToSan(fen, b.uci);
    const playedSan = outSans[i];
    let chosen = playedSan;
    if (bestSan && playedSan !== bestSan) {
      const probe = new Chess(fen);
      try { probe.move(playedSan); } catch { chosen = bestSan; }
      const after = probe.fen();
      const eAfter = await sf.best(after);
      const playedScore = eAfter ? -eAfter.cp : -100000;
      if ((b.cp - playedScore) > BLUNDER_CP) chosen = bestSan;
    }
    if (chosen !== playedSan) verifiedExpl.push(explainMove(fen, chosen, i, false));
    else verifiedExpl.push(outExpl[i]);
    try { g2.move(chosen); } catch { break; }
    verifiedSans.push(chosen);
  }

  return { sans: verifiedSans, explanations: verifiedExpl, startFen, bookPlies, sfPlies };
}

// ── Lesson title hints (opening names) ────────────────────────────────────
import { COURSES } from "../src/lib/courses-data";
function titleFor(lessonId: string): string | undefined {
  for (const c of COURSES) {
    const l = c.lessons.find((x) => x.id === lessonId);
    if (l) return l.title;
  }
  return undefined;
}

async function main() {
  if (!fs.existsSync(SF_BIN)) { console.error("Stockfish not found:", SF_BIN); process.exit(1); }
  const sf = new SF(); await sf.init();

  const ids = Object.keys(MASTERCLASS_VALIDATED_LINES);
  console.log(`Rebuilding ${ids.length} lines @ depth=${SF_DEPTH} target=${TARGET_PLIES}plies bookMin=${MIN_BOOK_GAMES}games`);
  const out: Record<string, { sans: string[]; explanations: string[]; startFen?: string }> = {};
  let totalBook = 0, totalSf = 0;
  const t0 = Date.now();
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const cur = MASTERCLASS_VALIDATED_LINES[id];
    const built = await buildLesson(sf, cur.sans, cur.startFen, titleFor(id));
    out[id] = { sans: built.sans, explanations: built.explanations, ...(cur.startFen ? { startFen: cur.startFen } : {}) };
    totalBook += built.bookPlies; totalSf += built.sfPlies;
    const t = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[${i + 1}/${ids.length}] ${id}: ${built.sans.length} plies (book=${built.bookPlies} sf=${built.sfPlies}) t=${t}s`);
  }
  sf.quit();

  const banner = `/**
 * AUTO-GENERATED. Each Masterkurs variation is rebuilt from a 110k-game local
 * master-game database (book theory) and extended/blunder-checked with
 * Stockfish 17 (depth ${SF_DEPTH}). Per-move explanations are auto-generated
 * from move features. Totals: ${totalBook} book plies, ${totalSf} engine-best plies.
 *
 * Re-run:  bunx tsx scripts/rebuild-masterclass-from-db.ts
 */
export interface ValidatedLine { sans: string[]; explanations?: string[]; startFen?: string; }
export const MASTERCLASS_VALIDATED_LINES: Record<string, ValidatedLine> = ${JSON.stringify(out, null, 2)};
`;
  fs.writeFileSync("src/lib/masterclass-validated-lines.ts", banner);
  console.log(`\nWrote src/lib/masterclass-validated-lines.ts`);
}
main().catch((e) => { console.error(e); process.exit(1); });
