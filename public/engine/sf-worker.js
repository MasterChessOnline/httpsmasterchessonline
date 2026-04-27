/* Stockfish WASM worker bootstrap.
 * Loads stockfish.js (Emscripten Module factory) inside a Web Worker and
 * exposes a simple UCI string interface compatible with the previous
 * `new Worker("/stockfish.js")` API:
 *   worker.postMessage("uci")          -> string commands in
 *   worker.onmessage = (e) => e.data   -> string UCI lines out
 */
self.importScripts("/engine/stockfish.js");

let sf = null;
const queue = [];

Stockfish().then((instance) => {
  sf = instance;
  sf.addMessageListener((line) => {
    self.postMessage(line);
  });
  // Flush any commands that arrived before init finished
  while (queue.length) sf.postMessage(queue.shift());
});

self.onmessage = (e) => {
  const cmd = typeof e.data === "string" ? e.data : "";
  if (!cmd) return;
  if (sf) {
    sf.postMessage(cmd);
  } else {
    queue.push(cmd);
  }
};
