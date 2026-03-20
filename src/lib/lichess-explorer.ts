/**
 * Lichess Opening Explorer API
 * Fetches real game statistics for any chess position.
 * API docs: https://lichess.org/api#tag/Opening-Explorer
 */

export interface ExplorerMove {
  san: string;
  uci: string;
  white: number;   // wins for white
  draws: number;
  black: number;   // wins for black
  averageRating: number;
  games: number;   // total games
  winRate: number;  // white win %
  drawRate: number;
  lossRate: number; // black win %
  frequency: number; // % of all games at this position
  openingName?: string;
}

export interface ExplorerData {
  moves: ExplorerMove[];
  white: number;
  draws: number;
  black: number;
  totalGames: number;
  opening?: { eco: string; name: string };
  topGames?: { id: string; white: { name: string; rating: number }; black: { name: string; rating: number }; year: number; winner?: string }[];
}

const CACHE = new Map<string, { data: ExplorerData; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MS = 1200; // Lichess asks for ~1 req/sec
let lastRequest = 0;

function simplifyFen(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequest));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequest = Date.now();
  return fetch(url);
}

/**
 * Fetch opening explorer data from Lichess for a given FEN.
 * Combines master + lichess database for best coverage.
 */
export async function fetchExplorerData(fen: string, ratings: string[] = ["1600", "1800", "2000", "2200", "2500"]): Promise<ExplorerData> {
  const key = simplifyFen(fen);
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const encodedFen = encodeURIComponent(fen);
  const ratingsParam = ratings.join(",");

  try {
    // Fetch from Lichess database (has most games)
    const lichessUrl = `https://explorer.lichess.org/lichess?fen=${encodedFen}&ratings=${ratingsParam}&speeds=rapid,classical,blitz&topGames=3`;
    const response = await rateLimitedFetch(lichessUrl);

    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }

    const raw = await response.json();
    const totalGames = (raw.white || 0) + (raw.draws || 0) + (raw.black || 0);

    const moves: ExplorerMove[] = (raw.moves || []).map((m: any) => {
      const w = m.white || 0;
      const d = m.draws || 0;
      const b = m.black || 0;
      const total = w + d + b;
      return {
        san: m.san,
        uci: m.uci,
        white: w,
        draws: d,
        black: b,
        averageRating: m.averageRating || 0,
        games: total,
        winRate: total > 0 ? (w / total) * 100 : 0,
        drawRate: total > 0 ? (d / total) * 100 : 0,
        lossRate: total > 0 ? (b / total) * 100 : 0,
        frequency: totalGames > 0 ? (total / totalGames) * 100 : 0,
      };
    });

    const topGames = (raw.topGames || []).slice(0, 3).map((g: any) => ({
      id: g.id,
      white: { name: g.white?.name || "?", rating: g.white?.rating || 0 },
      black: { name: g.black?.name || "?", rating: g.black?.rating || 0 },
      year: g.year || 0,
      winner: g.winner,
    }));

    const data: ExplorerData = {
      moves,
      white: raw.white || 0,
      draws: raw.draws || 0,
      black: raw.black || 0,
      totalGames,
      opening: raw.opening ? { eco: raw.opening.eco, name: raw.opening.name } : undefined,
      topGames,
    };

    CACHE.set(key, { data, ts: Date.now() });
    return data;
  } catch (err) {
    console.warn("Lichess explorer fetch failed, returning empty:", err);
    return { moves: [], white: 0, draws: 0, black: 0, totalGames: 0 };
  }
}

/**
 * Fetch master-level games explorer data.
 */
export async function fetchMasterExplorerData(fen: string): Promise<ExplorerData> {
  const key = `master_${simplifyFen(fen)}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const encodedFen = encodeURIComponent(fen);

  try {
    const url = `https://explorer.lichess.org/masters?fen=${encodedFen}&topGames=3`;
    const response = await rateLimitedFetch(url);
    if (!response.ok) throw new Error(`Master API error: ${response.status}`);

    const raw = await response.json();
    const totalGames = (raw.white || 0) + (raw.draws || 0) + (raw.black || 0);

    const moves: ExplorerMove[] = (raw.moves || []).map((m: any) => {
      const w = m.white || 0;
      const d = m.draws || 0;
      const b = m.black || 0;
      const total = w + d + b;
      return {
        san: m.san, uci: m.uci, white: w, draws: d, black: b,
        averageRating: m.averageRating || 0, games: total,
        winRate: total > 0 ? (w / total) * 100 : 0,
        drawRate: total > 0 ? (d / total) * 100 : 0,
        lossRate: total > 0 ? (b / total) * 100 : 0,
        frequency: totalGames > 0 ? (total / totalGames) * 100 : 0,
      };
    });

    const data: ExplorerData = {
      moves, white: raw.white || 0, draws: raw.draws || 0, black: raw.black || 0,
      totalGames,
      opening: raw.opening ? { eco: raw.opening.eco, name: raw.opening.name } : undefined,
    };
    CACHE.set(key, { data, ts: Date.now() });
    return data;
  } catch {
    return { moves: [], white: 0, draws: 0, black: 0, totalGames: 0 };
  }
}
