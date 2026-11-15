import { describe, it, expect } from "vitest";
import { openingStats, parseScoutPgn } from "./prep-scout";
const pgn = '[Event "Club final"]\n[White "Vuk"]\n[Black "Nikola"]\n[Result "0-1"]\n\n1. f3 e5 2. g4 Qh4# 0-1';
describe("Prep Scout", () => {
  it("reads completed games and tournament headers", () => {
    const { games, rejected } = parseScoutPgn(pgn);
    expect(rejected).toBe(0); expect(games[0].event).toBe("Club final"); expect(games[0].black).toBe("Nikola");
  });
  it("separates white and black statistics", () => {
    const { games } = parseScoutPgn(pgn);
    expect(openingStats(games, "Nikola", "white").total).toBe(0);
    expect(openingStats(games, "Nikola", "black").openings[0].wins).toBe(1);
    expect(openingStats(games, "Vuk", "white").openings[0].losses).toBe(1);
  });
  it("does not merge namesakes or unfinished games", () => {
    const { games } = parseScoutPgn(pgn);
    expect(openingStats(games, "Vuk Georgijev", "white").total).toBe(0);
    expect(parseScoutPgn(pgn.replaceAll('0-1', '*')).games).toHaveLength(0);
  });
  it("rejects illegal moves", () => { expect(parseScoutPgn(pgn.replace('f3', 'Qh8')).rejected).toBe(1); });
});