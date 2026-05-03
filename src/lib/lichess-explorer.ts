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
  topGames?: { id: string; white: { name: string; rating: number }; black: { name: string; rating: number }; year: number; month?: string; winner?: string; source: "lichess" | "masters" }[];
  recentGames?: { id: string; white: { name: string; rating: number }; black: { name: string; rating: number }; year: number; month?: string; winner?: string; source: "lichess" | "masters" }[];
}

// ── Player search (Chess.com PubAPI + Lichess) ──
export interface PlayerSummary {
  source: "lichess" | "chesscom";
  username: string;
  url: string;
  title?: string;
  ratings: { bullet?: number; blitz?: number; rapid?: number; classical?: number };
  recentGames: { id: string; url: string; pgn?: string; opponent: string; result: string; timeControl: string; endedAt: number }[];
}

export async function fetchLichessPlayer(username: string): Promise<PlayerSummary | null> {
  try {
    const u = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`).then(r => r.ok ? r.json() : null);
    if (!u) return null;
    const perfs = u.perfs || {};
    const games: PlayerSummary["recentGames"] = [];
    try {
      const txt = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=10&pgnInJson=true&clocks=false&evals=false`, {
        headers: { Accept: "application/x-ndjson" },
      }).then(r => r.text());
      for (const line of txt.split("\n").filter(Boolean).slice(0, 10)) {
        try {
          const g = JSON.parse(line);
          const isWhite = g.players?.white?.user?.name?.toLowerCase() === username.toLowerCase();
          const opp = isWhite ? g.players?.black?.user?.name : g.players?.white?.user?.name;
          const result = g.winner ? (g.winner === (isWhite ? "white" : "black") ? "Win" : "Loss") : "Draw";
          games.push({ id: g.id, url: `https://lichess.org/${g.id}`, pgn: g.pgn, opponent: opp || "?", result, timeControl: g.speed || "?", endedAt: g.lastMoveAt || g.createdAt || 0 });
        } catch {}
      }
    } catch {}
    return {
      source: "lichess", username: u.username, url: `https://lichess.org/@/${u.username}`,
      title: u.title,
      ratings: { bullet: perfs.bullet?.rating, blitz: perfs.blitz?.rating, rapid: perfs.rapid?.rating, classical: perfs.classical?.rating },
      recentGames: games,
    };
  } catch { return null; }
}

export async function fetchChessComPlayer(username: string): Promise<PlayerSummary | null> {
  try {
    const [profileRes, statsRes] = await Promise.all([
      fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`),
      fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`),
    ]);
    if (!profileRes.ok) return null;
    const profile = await profileRes.json();
    const stats = statsRes.ok ? await statsRes.json() : {};
    // Latest archive
    const archivesRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`);
    const archives = archivesRes.ok ? (await archivesRes.json()).archives as string[] : [];
    const latest = archives[archives.length - 1];
    const games: PlayerSummary["recentGames"] = [];
    if (latest) {
      const gRes = await fetch(latest);
      if (gRes.ok) {
        const gData = await gRes.json();
        const arr = (gData.games || []).slice(-10).reverse();
        for (const g of arr) {
          const isWhite = g.white?.username?.toLowerCase() === username.toLowerCase();
          const opp = isWhite ? g.black?.username : g.white?.username;
          const me = isWhite ? g.white : g.black;
          const result = me?.result === "win" ? "Win" : (me?.result === "agreed" || me?.result === "stalemate" || me?.result === "repetition" || me?.result === "insufficient" || me?.result === "50move" || me?.result === "timevsinsufficient") ? "Draw" : "Loss";
          games.push({ id: g.uuid || g.url, url: g.url, pgn: g.pgn, opponent: opp || "?", result, timeControl: g.time_class || "?", endedAt: (g.end_time || 0) * 1000 });
        }
      }
    }
    return {
      source: "chesscom", username: profile.username, url: profile.url,
      title: profile.title,
      ratings: { bullet: stats.chess_bullet?.last?.rating, blitz: stats.chess_blitz?.last?.rating, rapid: stats.chess_rapid?.last?.rating },
      recentGames: games,
    };
  } catch { return null; }
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
  return fetch(url, {
    headers: { "Accept": "application/json" },
  });
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

    const mapGame = (g: any) => ({
      id: g.id,
      white: { name: g.white?.name || "?", rating: g.white?.rating || 0 },
      black: { name: g.black?.name || "?", rating: g.black?.rating || 0 },
      year: g.year || 0,
      month: g.month,
      winner: g.winner,
      source: "lichess" as const,
    });
    const topGames = (raw.topGames || []).slice(0, 5).map(mapGame);
    const recentGames = (raw.recentGames || []).slice(0, 5).map(mapGame);

    const data: ExplorerData = {
      moves,
      white: raw.white || 0,
      draws: raw.draws || 0,
      black: raw.black || 0,
      totalGames,
      opening: raw.opening ? { eco: raw.opening.eco, name: raw.opening.name } : undefined,
      topGames,
      recentGames,
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
