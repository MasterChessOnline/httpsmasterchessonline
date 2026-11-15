import { Chess } from "chess.js";

export interface ScoutPlayer { id: string; name: string; kind: "online" | "fide"; title?: string; federation?: string; rating?: number; }
export interface ScoutGame { id: string; white: string; black: string; result: string; date: string; event: string; opening: string; eco: string; pgn: string; }
export interface ScoutReport { player: ScoutPlayer; games: ScoutGame[]; ratings?: Record<string, number>; warnings: string[]; fetchedAt: string; }
export const PREP_TOPICS = [
  { slug: "opening-repertoire", title: "Opening repertoire", description: "White and Black opening frequencies from a player's completed games.", detail: "Select a player or import PGN, then separate White from Black. Frequency describes the available sample, not every game the player has ever played." },
  { slug: "tournament-preparation", title: "Tournament preparation", description: "Opponent research before your next tournament round.", detail: "Confirm the name and official ID first. Review event names, dates and completed games. Preparation is for before the round, never assistance during a live game." },
  { slug: "pgn-scout", title: "PGN opponent scout", description: "Build a preparation report from your own game archive.", detail: "Import a PGN file you are entitled to use. Pick the exact player name recorded in its headers. Your imported file stays on this device." },
  { slug: "player-search", title: "Chess player search", description: "Find public chess identities without mixing up namesakes.", detail: "Official player records and online accounts are separate identities. Similar names do not prove they belong to the same person. Select the correct result before reviewing any games." },
] as const;

export function parseScoutPgn(text: string): { games: ScoutGame[]; rejected: number } {
  const blocks = text.trim().split(/(?=\[Event\s+")/g).filter(s => s.trim());
  const games: ScoutGame[] = [];
  let rejected = 0;
  for (const block of blocks) {
    try {
      const chess = new Chess();
      chess.loadPgn(block);
      const h = chess.getHeaders();
      // Only completed games enter preparation statistics.
      if (!chess.history().length || !["1-0", "0-1", "1/2-1/2"].includes(h.Result)) { rejected++; continue; }
      games.push({ id: `pgn-${games.length}`, white: h.White || "Unknown", black: h.Black || "Unknown", result: h.Result, date: h.Date || "Unknown", event: h.Event || "Imported game", opening: h.Opening || chess.history().slice(0, 6).join(" "), eco: h.ECO || "—", pgn: block.trim() });
    } catch { rejected++; }
  }
  return { games, rejected };
}

export function openingStats(games: ScoutGame[], name: string, color: "white" | "black") {
  const sample = games.filter(g => g[color].toLowerCase() === name.toLowerCase() && ["1-0", "0-1", "1/2-1/2"].includes(g.result));
  const grouped = new Map<string, { opening: string; eco: string; games: number; wins: number; draws: number; losses: number }>();
  for (const g of sample) {
    const key = `${g.eco}:${g.opening}`;
    const item = grouped.get(key) || { opening: g.opening || "Unclassified", eco: g.eco, games: 0, wins: 0, draws: 0, losses: 0 };
    item.games++;
    if (g.result === "1/2-1/2") item.draws++;
    else if (g.result === (color === "white" ? "1-0" : "0-1")) item.wins++;
    else item.losses++;
    grouped.set(key, item);
  }
  return { total: sample.length, openings: [...grouped.values()].sort((a, b) => b.games - a.games).map(g => ({ ...g, frequency: Math.round(100 * g.games / sample.length), score: Math.round(100 * (g.wins + g.draws / 2) / g.games) })) };
}