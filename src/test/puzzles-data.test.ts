import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";
import { PUZZLES } from "@/lib/puzzles-data";

describe("puzzle integrity", () => {
  it("every puzzle move line is valid and ends in checkmate", () => {
    const failures: string[] = [];

    for (const puzzle of PUZZLES) {
      try {
        const game = new Chess(puzzle.fen);

        if (game.turn() !== puzzle.playerColor) {
          failures.push(`${puzzle.title}: playerColor does not match FEN side to move`);
          continue;
        }

        const expectedLength = puzzle.mateIn * 2 - 1;
        if (puzzle.moves.length !== expectedLength) {
          failures.push(
            `${puzzle.title}: expected ${expectedLength} SAN moves for mateIn ${puzzle.mateIn}, got ${puzzle.moves.length}`
          );
          continue;
        }

        for (const san of puzzle.moves) {
          const move = game.move(san);
          if (!move) {
            failures.push(`${puzzle.title}: invalid SAN move '${san}'`);
            break;
          }
        }

        if (!game.isCheckmate()) {
          failures.push(`${puzzle.title}: final position is not checkmate`);
        }
      } catch (error) {
        failures.push(`${puzzle.title}: ${(error as Error).message}`);
      }
    }

    expect(failures).toEqual([]);
  });
});
