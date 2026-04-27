// Compatibility shim: the official Stockfish 16 NNUE build is already a
// complete UCI worker. Loading it here preserves old /engine/sf-worker.js
// references without calling a non-existent global factory.
self.importScripts("/engine/stockfish.js");
