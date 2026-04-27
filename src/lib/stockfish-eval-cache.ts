import { supabase } from "@/integrations/supabase/client";

export interface CachedStockfishEval {
  fen: string;
  depth: number;
  evaluation: number;
  mate: number | null;
}

const ENGINE = "stockfish-18-lite-single";
const CHUNK_SIZE = 80;

function normalizeDepth(depth: number) {
  return Math.max(1, Math.min(64, Math.round(depth || 1)));
}

export async function getCachedStockfishEvals(fens: string[], depth: number): Promise<Map<string, CachedStockfishEval>> {
  const uniqueFens = Array.from(new Set(fens.filter(Boolean)));
  const cache = new Map<string, CachedStockfishEval>();
  if (uniqueFens.length === 0) return cache;

  const d = normalizeDepth(depth);
  for (let i = 0; i < uniqueFens.length; i += CHUNK_SIZE) {
    const chunk = uniqueFens.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase
      .from("stockfish_eval_cache" as any)
      .select("fen, depth, evaluation, mate")
      .eq("engine", ENGINE)
      .eq("depth", d)
      .in("fen", chunk);

    if (error) {
      console.warn("Stockfish cache read skipped", error.message);
      continue;
    }

    for (const row of (data || []) as unknown as CachedStockfishEval[]) {
      cache.set(row.fen, row);
    }
  }

  return cache;
}

export async function saveCachedStockfishEval(fen: string, depth: number, evaluation: number, mate: number | null) {
  const d = normalizeDepth(depth);
  if (!fen || fen.length < 20 || fen.length > 120) return;

  const { error } = await supabase
    .from("stockfish_eval_cache" as any)
    .upsert(
      [{ fen, depth: d, evaluation, mate, engine: ENGINE }],
      { onConflict: "fen,depth,engine", ignoreDuplicates: true } as any,
    );

  if (error) console.warn("Stockfish cache write skipped", error.message);
}
