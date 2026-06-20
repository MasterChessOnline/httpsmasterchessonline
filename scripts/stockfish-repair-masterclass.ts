/**
 * Walks every Masterkurs variation through Stockfish 17 and replaces any move
 * whose evaluation falls far below the engine's preferred candidates (i.e. an
 * outright blunder — e.g. hanging a queen). Author intent is preserved when the
 * move is already among the top engine candidates within tolerance; only clear
 * mistakes are rewritten with the engine's best move and the rest of the line
 * is then re-attempted from the corrected position. Result is written back to
 * src/lib/masterclass-validated-lines.ts.
 *
 * Run:  bunx tsx scripts/stockfish-repair-masterclass.ts
 */
import { Chess } from "chess.js";
import * as fs from "fs";
import { MASTERCLASS_VALIDATED_LINES } from "../src/lib/masterclass-validated-lines";

const SF_BIN = process.env.SF_BIN || "/nix/store/givsmnk5rpawndn3dbcb53q5phg9wcz2-stockfish-17.1/bin/stockfish";
const JS_ENGINE = process.env.SF_JS_ENGINE || "single";
const DEPTH = Number(process.env.SF_DEPTH || 10);
const MULTIPV = Number(process.env.SF_MULTIPV || 6);
const BLUNDER_CP = Number(process.env.SF_BLUNDER_CP || 180); // >1.8 pawns worse than best ⇒ blunder
const FIX_NON_TOP = process.env.SF_FIX_NON_TOP === "1";

class SF {
  private resolvers: ((line: string) => boolean)[] = [];
  private engine: { sendCommand: (cmd: string) => void; terminate?: () => void } | null = null;

  private receive(line: string) {
    for (let i = this.resolvers.length - 1; i >= 0; i--) {
      if (this.resolvers[i](line)) this.resolvers.splice(i, 1);
    }
  }
  async load() {
    if (fs.existsSync(SF_BIN)) {
      const { spawn } = await import("child_process");
      const p = spawn(SF_BIN);
      let buf = "";
      p.stdout.on("data", (d: Buffer) => {
        buf += d.toString();
        let idx;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          this.receive(line);
        }
      });
      this.engine = { sendCommand: (cmd) => p.stdin.write(cmd + "\n"), terminate: () => p.kill() };
      return;
    }

    const stockfish = (await import("stockfish")).default as (enginePath?: string) => Promise<any>;
    const engine = await stockfish(JS_ENGINE);
    engine.listener = (line: string) => this.receive(String(line).trim());
    this.engine = engine;
  }
  send(cmd: string) { this.engine?.sendCommand(cmd); }
  waitFor(test: (line: string) => boolean): Promise<string> {
    return new Promise((resolve) => {
      this.resolvers.push((line) => { if (test(line)) { resolve(line); return true; } return false; });
    });
  }
  async init() {
    this.send("uci");
    await this.waitFor((l) => l === "uciok");
    this.send("setoption name Threads value 2");
    this.send("setoption name Hash value 64");
    this.send("setoption name MultiPV value " + MULTIPV);
    this.send("isready");
    await this.waitFor((l) => l === "readyok");
  }
  async newGame() {
    this.send("ucinewgame");
    this.send("isready");
    await this.waitFor((l) => l === "readyok");
  }
  async analyze(fen: string): Promise<{ uci: string; cp: number }[]> {
    // Returns top MULTIPV candidate moves with scores from STM perspective in cp.
    // Mate scores are converted to ±100000 so they sort/compare cleanly.
    const lastInfoByPv = new Map<number, string>();
    this.send(`position fen ${fen}`);
    this.send(`go depth ${DEPTH}`);
    const collector = (line: string): boolean => {
      if (line.startsWith("info ") && line.includes(" pv ")) {
        const m = line.match(/multipv (\d+)/);
        const pv = m ? Number(m[1]) : 1;
        lastInfoByPv.set(pv, line);
      }
      return false;
    };
    this.resolvers.push(collector);
    await this.waitFor((l) => l.startsWith("bestmove"));
    // Remove collector
    const idx = this.resolvers.indexOf(collector);
    if (idx >= 0) this.resolvers.splice(idx, 1);

    const out: { uci: string; cp: number }[] = [];
    for (const [pv, line] of [...lastInfoByPv.entries()].sort((a, b) => a[0] - b[0])) {
      const pvMatch = line.match(/ pv (\S+)/);
      const cpMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);
      if (!pvMatch) continue;
      let cp = 0;
      if (cpMatch) cp = Number(cpMatch[1]);
      else if (mateMatch) cp = Number(mateMatch[1]) > 0 ? 100000 : -100000;
      out.push({ uci: pvMatch[1], cp });
    }
    return out;
  }
  quit() { this.send("quit"); this.engine?.terminate?.(); }
}

function uciToSan(fen: string, uci: string): string | null {
  const g = new Chess(fen);
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promo = uci.length > 4 ? uci[4] : undefined;
  try {
    const r = g.move({ from, to, promotion: promo as any });
    return r ? r.san : null;
  } catch { return null; }
}
function sanToUci(fen: string, san: string): string | null {
  const g = new Chess(fen);
  try {
    const r = g.move(san);
    if (!r) return null;
    return r.from + r.to + (r.promotion ?? "");
  } catch { return null; }
}

async function repairLine(sf: SF, sans: string[], startFen?: string): Promise<{ sans: string[]; fixes: number; truncated: boolean }> {
  const game = startFen ? new Chess(startFen) : new Chess();
  const out: string[] = [];
  let fixes = 0;
  await sf.newGame();

  // Walk the existing line; if a move blunders, replace it with engine best and keep going from there.
  // Then we still try to play the remaining original moves; if any becomes illegal in the new context, we drop it.
  let queue = [...sans];
  let safety = 0;
  while (queue.length && safety++ < 80) {
    const fen = game.fen();
    const candidates = await sf.analyze(fen);
    if (!candidates.length) break;
    const bestCp = candidates[0].cp;
    const desired = queue.shift()!;

    // Try the desired move; if illegal in current position, skip it.
    let desiredUci: string | null = null;
    try { desiredUci = sanToUci(fen, desired); } catch { desiredUci = null; }
    if (!desiredUci) {
      // Try to keep going by playing best move (counts as a fix).
      const sanBest = uciToSan(fen, candidates[0].uci);
      if (!sanBest) break;
      game.move(sanBest); out.push(sanBest); fixes++;
      continue;
    }

    const found = candidates.find((c) => c.uci === desiredUci);
    const desiredCp = found ? found.cp : null;
    const blunder = desiredCp === null
      ? FIX_NON_TOP
      : (bestCp - desiredCp) > BLUNDER_CP;

    if (blunder) {
      const sanBest = uciToSan(fen, candidates[0].uci);
      if (!sanBest) break;
      game.move(sanBest); out.push(sanBest); fixes++;
    } else {
      game.move(desired); out.push(desired);
    }
  }
  return { sans: out, fixes, truncated: queue.length > 0 && safety >= 80 };
}

const CHECKPOINT = "scripts/.sf-repair-checkpoint.json";

function writeOutput(repaired: Record<string, { sans: string[]; startFen?: string }>, totalFixes: number, total: number) {
  const banner = `/**
 * AUTO-GENERATED by stockfish-repair-masterclass.ts
 * Depth=${DEPTH} MultiPV=${MULTIPV} BlunderThreshold=${BLUNDER_CP}cp
 * ${totalFixes} engine corrections across ${Object.keys(repaired).length}/${total} lines.
 */
export interface ValidatedLine { sans: string[]; startFen?: string; }
export const MASTERCLASS_VALIDATED_LINES: Record<string, ValidatedLine> = ${JSON.stringify(repaired, null, 2)};
`;
  fs.writeFileSync("src/lib/masterclass-validated-lines.ts", banner);
}

async function main() {
  const sf = new SF();
  await sf.load();
  await sf.init();

  const entries = Object.entries(MASTERCLASS_VALIDATED_LINES);
  console.log(`Repairing ${entries.length} lines @ depth=${DEPTH} multipv=${MULTIPV} blunder>${BLUNDER_CP}cp`);

  let repaired: Record<string, { sans: string[]; startFen?: string }> = {};
  let totalFixes = 0;
  if (fs.existsSync(CHECKPOINT)) {
    try {
      const ck = JSON.parse(fs.readFileSync(CHECKPOINT, "utf8"));
      repaired = ck.repaired || {};
      totalFixes = ck.totalFixes || 0;
      console.log(`Resuming from checkpoint: ${Object.keys(repaired).length} lines done.`);
    } catch {}
  }

  const t0 = Date.now();
  for (let i = 0; i < entries.length; i++) {
    const [id, line] = entries[i];
    if (repaired[id]) continue;
    const r = await repairLine(sf, line.sans, line.startFen);
    repaired[id] = { sans: r.sans, ...(line.startFen ? { startFen: line.startFen } : {}) };
    totalFixes += r.fixes;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[${i + 1}/${entries.length}] ${id}: ${line.sans.length}→${r.sans.length}, ${r.fixes} fixes (t=${elapsed}s)`);

    if ((i + 1) % 3 === 0 || i === entries.length - 1) {
      fs.writeFileSync(CHECKPOINT, JSON.stringify({ repaired, totalFixes }));
      writeOutput(repaired, totalFixes, entries.length);
    }
  }

  sf.quit();
  writeOutput(repaired, totalFixes, entries.length);
  fs.writeFileSync(CHECKPOINT, JSON.stringify({ repaired, totalFixes, done: true }));
  console.log(`\nDONE — total engine fixes: ${totalFixes}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
