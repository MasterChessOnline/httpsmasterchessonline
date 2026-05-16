/**
 * Local stub — MasterChess is fully independent from Lichess/Chess.com.
 * This file exists only to satisfy legacy imports; all functions return
 * empty data. Use `@/lib/masterchess-db` for real opening explorer data.
 */

export interface ExplorerMove {
  san: string;
  uci: string;
  white: number;
  draws: number;
  black: number;
  averageRating: number;
  games: number;
  winRate: number;
  drawRate: number;
  lossRate: number;
  frequency: number;
  openingName?: string;
}

export interface ExplorerData {
  moves: ExplorerMove[];
  white: number;
  draws: number;
  black: number;
  totalGames: number;
  opening?: { eco: string; name: string };
  topGames?: any[];
  recentGames?: any[];
}

export interface PlayerSummary {
  source: "masterchess";
  username: string;
  url: string;
  title?: string;
  ratings: { bullet?: number; blitz?: number; rapid?: number; classical?: number };
  recentGames: { id: string; url: string; pgn?: string; opponent: string; result: string; timeControl: string; endedAt: number }[];
}

const EMPTY: ExplorerData = {
  moves: [], white: 0, draws: 0, black: 0, totalGames: 0,
  topGames: [], recentGames: [],
};

export async function fetchExplorerData(_fen: string, _ratings?: string[]): Promise<ExplorerData> {
  return EMPTY;
}

export async function fetchMasterExplorerData(_fen: string): Promise<ExplorerData> {
  return EMPTY;
}

export async function fetchLichessPlayer(_username: string): Promise<PlayerSummary | null> {
  return null;
}

export async function fetchChessComPlayer(_username: string): Promise<PlayerSummary | null> {
  return null;
}
