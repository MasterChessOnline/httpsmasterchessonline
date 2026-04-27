// Bridge worker za zvanični Stockfish 16 NNUE single-threaded build.
// Učitava Module factory (stockfish.js) i izlaže UCI preko postMessage.
self.importScripts("/engine/stockfish.js");

let sf = null;
const queue = [];

// Globalna factory iz stockfish.js zove se "Stockfish".
self.Stockfish().then((instance) => {
  sf = instance;
  sf.addMessageListener((line) => {
    self.postMessage(line);
  });
  // Ispraznimo komande koje su stigle pre inicijalizacije
  while (queue.length) sf.postMessage(queue.shift());
});

self.onmessage = (e) => {
  const cmd = e.data;
  if (!sf) {
    queue.push(cmd);
    return;
  }
  sf.postMessage(cmd);
};
