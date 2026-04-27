/**
 * Stockfish WebAssembly Engine Wrapper
 * Communicates with Stockfish via UCI protocol through a Web Worker.
 */

export interface StockfishResult {
  bestMove: string;
  evaluation?: number;
  depth?: number;
  mate?: number | null;
}

export interface MultiPvLine {
  pv: string[];    // UCI moves
  pvSan: string[]; // SAN moves
  eval: number;
  mate: number | null;
  depth: number;
}

type MessageCallback = (msg: string) => void;

const STOCKFISH_ENGINE_JS = "/engine/stockfish-18-lite-single.js";
const STOCKFISH_ENGINE_WASM = "/engine/stockfish-18-lite-single.wasm";

class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private messageCallbacks: MessageCallback[] = [];
  private initPromise: Promise<void> | null = null;
  private taskQueue: Promise<void> = Promise.resolve();

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        this.worker = new Worker(`${STOCKFISH_ENGINE_JS}#${STOCKFISH_ENGINE_WASM}`);

        const onReady = (e: MessageEvent) => {
          const msg = typeof e.data === "string" ? e.data : "";
          if (msg.includes("uciok")) {
            this.send("setoption name UCI_LimitStrength value false");
            this.send("setoption name Skill Level value 20");
            this.send("setoption name Hash value 64");
            this.send("setoption name Move Overhead value 10");
            this.send("isready");
          }
          if (msg.includes("readyok")) {
            this.worker?.removeEventListener("message", onReady);
            this.ready = true;
            resolve();
          }
        };

        this.worker.addEventListener("message", onReady);
        this.worker.addEventListener("error", (err) => {
          this.initPromise = null;
          reject(err);
        }, { once: true });
        this.worker.addEventListener("message", (e) => {
          const msg = typeof e.data === "string" ? e.data : "";
          for (const cb of this.messageCallbacks) cb(msg);
        });

        this.worker.postMessage("uci");
      } catch (err) {
        this.initPromise = null;
        reject(err);
      }
    });

    return this.initPromise;
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  private runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = this.taskQueue.then(task, task);
    this.taskQueue = run.then(() => undefined, () => undefined);
    return run;
  }

  setSkillLevel(level: number) {
    const clamped = Math.max(0, Math.min(20, level));
    this.send(`setoption name Skill Level value ${clamped}`);
  }

  setMultiPV(count: number) {
    this.send(`setoption name MultiPV value ${Math.max(1, Math.min(5, count))}`);
  }

  newGame() {
    this.send("ucinewgame");
    this.send("setoption name Clear Hash value true");
    this.send("isready");
  }

  getBestMove(fen: string, moveTimeMs = 1000, depth?: number): Promise<StockfishResult> {
    return this.runExclusive(() => new Promise((resolve) => {
      if (!this.worker || !this.ready) {
        resolve({ bestMove: "" });
        return;
      }

      let evaluation = 0;
      let bestDepth = 0;
      let mate: number | null = null;

      const handler: MessageCallback = (msg) => {
        if (msg.startsWith("info") && msg.includes("score")) {
          const depthMatch = msg.match(/depth (\d+)/);
          if (depthMatch) bestDepth = parseInt(depthMatch[1]);

          const cpMatch = msg.match(/score cp (-?\d+)/);
          if (cpMatch) {
            evaluation = parseInt(cpMatch[1]);
            mate = null;
          }

          const mateMatch = msg.match(/score mate (-?\d+)/);
          if (mateMatch) mate = parseInt(mateMatch[1]);
        }

        if (msg.startsWith("bestmove")) {
          const parts = msg.split(" ");
          const bestMove = parts[1] || "";
          this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== handler);
          resolve({ bestMove, evaluation, depth: bestDepth, mate });
        }
      };

      this.messageCallbacks.push(handler);
      this.send(`position fen ${fen}`);
      if (depth) {
        this.send(`go depth ${depth}`);
      } else {
        this.send(`go movetime ${moveTimeMs}`);
      }
    }));
  }

  evaluate(fen: string, depth = 12): Promise<{ evaluation: number; mate: number | null }> {
    return this.runExclusive(() => new Promise((resolve) => {
      if (!this.worker || !this.ready) {
        resolve({ evaluation: 0, mate: null });
        return;
      }

      let evaluation = 0;
      let mate: number | null = null;
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== handler);
        resolve({ evaluation, mate });
      };

      const handler: MessageCallback = (msg) => {
        if (msg.startsWith("info") && msg.includes("score")) {
          const cpMatch = msg.match(/score cp (-?\d+)/);
          if (cpMatch) { evaluation = parseInt(cpMatch[1]); mate = null; }
          const mateMatch = msg.match(/score mate (-?\d+)/);
          if (mateMatch) mate = parseInt(mateMatch[1]);
        }

        if (msg.startsWith("bestmove")) {
          finish();
        }
      };

      const timeoutId = window.setTimeout(() => {
        this.send("stop");
        window.setTimeout(finish, 250);
      }, Math.max(2500, depth * 900));

      this.messageCallbacks.push(handler);
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    }));
  }

  /** Get top N lines (Multi-PV) for a position. */
  getMultiPV(fen: string, numLines: number, depth: number): Promise<MultiPvLine[]> {
    return this.runExclusive(() => new Promise((resolve) => {
      if (!this.worker || !this.ready) {
        resolve([]);
        return;
      }

      this.setMultiPV(numLines);
      const lines: Map<number, MultiPvLine> = new Map();

      const handler: MessageCallback = (msg) => {
        if (msg.startsWith("info") && msg.includes("multipv") && msg.includes("score")) {
          const pvIdxMatch = msg.match(/multipv (\d+)/);
          const depthMatch = msg.match(/depth (\d+)/);
          const pvMovesMatch = msg.match(/ pv (.+)/);
          if (!pvIdxMatch) return;

          const pvIdx = parseInt(pvIdxMatch[1]);
          const d = depthMatch ? parseInt(depthMatch[1]) : 0;
          const pvMoves = pvMovesMatch ? pvMovesMatch[1].split(" ") : [];

          let evalCp = 0;
          let mateVal: number | null = null;
          const cpMatch = msg.match(/score cp (-?\d+)/);
          if (cpMatch) evalCp = parseInt(cpMatch[1]);
          const mateMatch = msg.match(/score mate (-?\d+)/);
          if (mateMatch) mateVal = parseInt(mateMatch[1]);

          lines.set(pvIdx, { pv: pvMoves, pvSan: [], eval: evalCp, mate: mateVal, depth: d });
        }

        if (msg.startsWith("bestmove")) {
          this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== handler);
          // Reset MultiPV to 1
          this.setMultiPV(1);
          resolve(Array.from(lines.entries()).sort(([a], [b]) => a - b).map(([, line]) => line));
        }
      };

      this.messageCallbacks.push(handler);
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    }));
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.initPromise = null;
    this.taskQueue = Promise.resolve();
    this.messageCallbacks = [];
  }
}

let engineInstance: StockfishEngine | null = null;

export function getStockfishEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishEngine();
  }
  return engineInstance;
}

export function difficultyToStockfish(difficulty: "beginner" | "intermediate" | "advanced") {
  switch (difficulty) {
    case "beginner":
      return { skillLevel: 3, moveTimeMs: 300, depth: 5 };
    case "intermediate":
      return { skillLevel: 10, moveTimeMs: 800, depth: 10 };
    case "advanced":
      return { skillLevel: 18, moveTimeMs: 1500, depth: 18 };
  }
}
