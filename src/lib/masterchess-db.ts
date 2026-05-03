/**
 * MasterChess Database — local, sharded master-game index.
 * Data lives in /public/data/masterchess/ (built from 110,341 elite-level games).
 * 100% offline. No external services.
 */

export interface MasterMove {
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
}

export interface MasterGame {
  id: string;
  white: { name: string; rating: number };
  black: { name: string; rating: number };
  year: number;
  event?: string;
  winner?: "white" | "black" | "draw";
  pgn: string;
  source: "masterchess";
}

export interface MasterExplorerData {
  moves: MasterMove[];
  white: number;
  draws: number;
  black: number;
  totalGames: number;
  opening?: { eco: string; name: string };
  topGames?: MasterGame[];
}

interface ShardMove { san: string; uci: string; w: number; d: number; b: number; r: number }
interface ShardEntry { w: number; d: number; b: number; r: number; m: ShardMove[]; g: string[] }
type IndexShard = Record<string, ShardEntry>;
interface RawGame {
  id: string;
  white: { name: string; rating: number };
  black: { name: string; rating: number };
  year: number;
  event?: string;
  winner?: "white" | "black" | "draw";
  pgn: string;
}
type GameShard = Record<string, RawGame>;

const BASE = "/data/masterchess";
const indexCache = new Map<number, Promise<IndexShard | null>>();
const gameCache = new Map<number, Promise<GameShard | null>>();

function fenKey(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

function shardId(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  return Math.abs(h) % 256;
}

async function loadIndexShard(id: number): Promise<IndexShard | null> {
  if (!indexCache.has(id)) {
    indexCache.set(id, fetch(`${BASE}/index-shards/${id}.json`).then(r => r.ok ? r.json() : null).catch(() => null));
  }
  return indexCache.get(id)!;
}

async function loadGameShard(id: number): Promise<GameShard | null> {
  if (!gameCache.has(id)) {
    gameCache.set(id, fetch(`${BASE}/game-shards/${id}.json`).then(r => r.ok ? r.json() : null).catch(() => null));
  }
  return gameCache.get(id)!;
}

function gameShardOf(id: string): number {
  // ids look like "mc12345"
  const num = parseInt(id.replace(/^\D+/, ""), 10);
  return Number.isFinite(num) ? Math.floor(num / 500) : 0;
}

export async function fetchMasterChessExplorer(fen: string): Promise<MasterExplorerData> {
  const key = fenKey(fen);
  const shard = await loadIndexShard(shardId(key));
  const entry = shard?.[key];
  if (!entry) return { moves: [], white: 0, draws: 0, black: 0, totalGames: 0, topGames: [] };

  const totalGames = entry.w + entry.d + entry.b;
  const moves: MasterMove[] = entry.m.map(m => {
    const total = m.w + m.d + m.b;
    return {
      san: m.san, uci: m.uci, white: m.w, draws: m.d, black: m.b,
      averageRating: m.r, games: total,
      winRate: total > 0 ? (m.w / total) * 100 : 0,
      drawRate: total > 0 ? (m.d / total) * 100 : 0,
      lossRate: total > 0 ? (m.b / total) * 100 : 0,
      frequency: totalGames > 0 ? (total / totalGames) * 100 : 0,
    };
  }).sort((a, b) => b.games - a.games);

  // Hydrate top games (lazy, async)
  const topGames: MasterGame[] = [];
  const ids = (entry.g || []).slice(0, 10);
  // Group by shard for parallel fetch
  const byShard = new Map<number, string[]>();
  for (const id of ids) {
    const s = gameShardOf(id);
    if (!byShard.has(s)) byShard.set(s, []);
    byShard.get(s)!.push(id);
  }
  const shardData = await Promise.all(Array.from(byShard.keys()).map(loadGameShard));
  const gameMap = new Map<string, RawGame>();
  let i = 0;
  for (const ids2 of byShard.values()) {
    const data = shardData[i++];
    if (!data) continue;
    for (const id of ids2) if (data[id]) gameMap.set(id, data[id]);
  }
  for (const id of ids) {
    const g = gameMap.get(id);
    if (g) topGames.push({ ...g, source: "masterchess" });
  }

  return { moves, white: entry.w, draws: entry.d, black: entry.b, totalGames, topGames };
}

export async function getMasterGameById(id: string): Promise<MasterGame | undefined> {
  const data = await loadGameShard(gameShardOf(id));
  const g = data?.[id];
  return g ? { ...g, source: "masterchess" } : undefined;
}

export async function getRandomMasterGames(count: number): Promise<MasterGame[]> {
  // Pick random game shards and a random game from each
  const out: MasterGame[] = [];
  const tried = new Set<number>();
  while (out.length < count && tried.size < 50) {
    const s = Math.floor(Math.random() * 221);
    if (tried.has(s)) continue;
    tried.add(s);
    const data = await loadGameShard(s);
    if (!data) continue;
    const keys = Object.keys(data);
    if (keys.length === 0) continue;
    const k = keys[Math.floor(Math.random() * keys.length)];
    out.push({ ...data[k], source: "masterchess" });
  }
  return out;
}
