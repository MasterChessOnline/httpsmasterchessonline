// FEATURE FLAGS — plan section 25.
//
// Every big feature can be turned off without a rollback, and rolled out to a
// stable percentage of visitors (10% → 25% → 50% → 100%). The bucket is derived
// from the session id, so a visitor keeps the same experience while browsing.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sessionId } from "@/lib/monitoring";

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  rollout: number;
  description: string | null;
};

const CACHE_KEY = "mc_flags_v1";
const TTL_MS = 5 * 60 * 1000;

let cache: Record<string, FeatureFlag> | null = null;
let inflight: Promise<Record<string, FeatureFlag>> | null = null;

function readLocal(): Record<string, FeatureFlag> | null {
  try {
    const raw = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    if (raw && Date.now() - raw.at < TTL_MS) return raw.flags;
  } catch {
    /* ignore */
  }
  return null;
}

/** Stable 0–99 bucket for this visitor. */
function bucket(): number {
  const id = sessionId();
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  return hash % 100;
}

export async function loadFlags(): Promise<Record<string, FeatureFlag>> {
  if (cache) return cache;
  const local = readLocal();
  if (local) {
    cache = local;
    return local;
  }
  if (inflight) return inflight;
  inflight = (async () => {
    const map: Record<string, FeatureFlag> = {};
    try {
      const { data } = await supabase
        .from("feature_flags")
        .select("key, enabled, rollout, description");
      for (const row of data ?? []) map[row.key] = row as FeatureFlag;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), flags: map }));
    } catch {
      /* offline → fall back to defaults */
    }
    cache = map;
    inflight = null;
    return map;
  })();
  return inflight;
}

function evaluate(flag: FeatureFlag | undefined, fallback: boolean): boolean {
  if (!flag) return fallback;
  if (!flag.enabled) return false;
  return bucket() < flag.rollout;
}

/**
 * Reads one flag. `fallback` is used until the flags arrive (and if the flag
 * has never been created), so a flag lookup can never blank out the UI.
 */
export function useFeatureFlag(key: string, fallback = true): boolean {
  const [on, setOn] = useState(() => evaluate(cache?.[key], fallback));
  useEffect(() => {
    let alive = true;
    loadFlags().then((flags) => {
      if (alive) setOn(evaluate(flags[key], fallback));
    });
    return () => {
      alive = false;
    };
  }, [key, fallback]);
  return on;
}

/** Imperative check for non-React code paths. */
export async function isFeatureOn(key: string, fallback = true): Promise<boolean> {
  const flags = await loadFlags();
  return evaluate(flags[key], fallback);
}
