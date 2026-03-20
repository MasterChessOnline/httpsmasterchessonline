/**
 * Stockfish WebAssembly Engine Wrapper
 * Communicates with Stockfish via UCI protocol through a Web Worker.
 */

export interface StockfishResult {
  bestMove: string; // e.g. "e2e4"
  evaluation?: number; // centipawns from white's perspective
  depth?: number;
  mate?: number | null; // mate in N moves, null if no mate
}

type MessageCallback = (msg: string) => void;

class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private messageCallbacks: MessageCallback[] = [];
  private initPromise: Promise<void> | null = null;

  /** Spin up the engine once and reuse it. */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        this.worker = new Worker("/stockfish.js");

        const onReady = (e: MessageEvent) => {
          const msg = typeof e.data === "string" ? e.data : "";
          if (msg.includes("uciok")) {
            this.ready = true;
            resolve();
          }
        };

        this.worker.addEventListener("message", onReady);
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

  /** Set Stockfish Skill Level (0–20) and corresponding options. */
  setSkillLevel(level: number) {
    const clamped = Math.max(0, Math.min(20, level));
    this.send(`setoption name Skill Level value ${clamped}`);
  }

  /** Start a new game (clears hash tables). */
  newGame() {
    this.send("ucinewgame");
    this.send("isready");
  }

  /**
   * Get the best move for a given FEN position.
   * @param fen - FEN string of the current position
   * @param moveTimeMs - time to think in milliseconds
   * @param depth - optional max depth (overrides moveTime if set)
   */
  getBestMove(fen: string, moveTimeMs = 1000, depth?: number): Promise<StockfishResult> {
    return new Promise((resolve) => {
      if (!this.worker || !this.ready) {
        resolve({ bestMove: "" });
        return;
      }

      let evaluation = 0;
      let bestDepth = 0;
      let mate: number | null = null;

      const handler: MessageCallback = (msg) => {
        // Parse evaluation from info lines
        if (msg.startsWith("info") && msg.includes("score")) {
          const depthMatch = msg.match(/depth (\d+)/);
          if (depthMatch) bestDepth = parseInt(depthMatch[1]);

          const cpMatch = msg.match(/score cp (-?\d+)/);
          if (cpMatch) {
            evaluation = parseInt(cpMatch[1]);
            mate = null;
          }

          const mateMatch = msg.match(/score mate (-?\d+)/);
          if (mateMatch) {
            mate = parseInt(mateMatch[1]);
          }
        }

        // Parse best move
        if (msg.startsWith("bestmove")) {
          const parts = msg.split(" ");
          const bestMove = parts[1] || "";

          // Remove handler
          this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== handler);

          resolve({
            bestMove,
            evaluation,
            depth: bestDepth,
            mate,
          });
        }
      };

      this.messageCallbacks.push(handler);

      this.send(`position fen ${fen}`);
      if (depth) {
        this.send(`go depth ${depth}`);
      } else {
        this.send(`go movetime ${moveTimeMs}`);
      }
    });
  }

  /** Evaluate a position without making a move. */
  evaluate(fen: string, depth = 15): Promise<{ evaluation: number; mate: number | null }> {
    return new Promise((resolve) => {
      if (!this.worker || !this.ready) {
        resolve({ evaluation: 0, mate: null });
        return;
      }

      let evaluation = 0;
      let mate: number | null = null;

      const handler: MessageCallback = (msg) => {
        if (msg.startsWith("info") && msg.includes("score")) {
          const cpMatch = msg.match(/score cp (-?\d+)/);
          if (cpMatch) {
            evaluation = parseInt(cpMatch[1]);
            mate = null;
          }
          const mateMatch = msg.match(/score mate (-?\d+)/);
          if (mateMatch) mate = parseInt(mateMatch[1]);
        }

        if (msg.startsWith("bestmove")) {
          this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== handler);
          resolve({ evaluation, mate });
        }
      };

      this.messageCallbacks.push(handler);
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }

  /** Clean up the worker. */
  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.initPromise = null;
    this.messageCallbacks = [];
  }
}

// Singleton instance
let engineInstance: StockfishEngine | null = null;

export function getStockfishEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishEngine();
  }
  return engineInstance;
}

/**
 * Map our difficulty levels to Stockfish settings.
 * Returns { skillLevel, moveTimeMs, depth }
 */
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
