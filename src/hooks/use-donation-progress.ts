// Public donation progress — total raised + active goal.
// Backed by the SECURITY DEFINER RPC `get_donation_progress` so it works
// for anonymous visitors without exposing private `purchases` rows.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DonationProgress {
  totalCents: number;
  donorCount: number;
  goal: {
    title: string;
    targetCents: number;
    currency: string;
    endDate: string | null;
  } | null;
  loading: boolean;
}

const CACHE_KEY = "mc:donation-progress";
const CACHE_TTL = 60_000; // 1 minute

export function useDonationProgress(): DonationProgress {
  const [state, setState] = useState<DonationProgress>(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.at < CACHE_TTL) {
        return { ...cached.data, loading: false };
      }
    } catch {}
    return { totalCents: 0, donorCount: 0, goal: null, loading: true };
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase.rpc as any)("get_donation_progress");
      if (cancelled || error || !data) {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
        return;
      }
      const next: DonationProgress = {
        totalCents: Number(data.total_cents ?? 0),
        donorCount: Number(data.donor_count ?? 0),
        goal: data.goal
          ? {
              title: data.goal.title,
              targetCents: Number(data.goal.target_cents ?? 0),
              currency: data.goal.currency ?? "usd",
              endDate: data.goal.end_date ?? null,
            }
          : null,
        loading: false,
      };
      setState(next);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: next }));
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
