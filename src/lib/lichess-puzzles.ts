// Backwards-compat shim — the file used to live here under a third-party name.
// New code should import from "@/lib/masterchess-puzzles".
export {
  loadPuzzles as loadLichessPuzzles,
  clearPuzzleCache as clearLichessPuzzleCache,
} from "./masterchess-puzzles";
export type { PuzzlePosition } from "./masterchess-puzzles";
