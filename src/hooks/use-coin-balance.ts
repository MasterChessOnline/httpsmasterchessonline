import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Live-subscribed coin balance for the current user. Refreshes on:
 *  - mount / auth change
 *  - Supabase realtime profile updates
 *  - a window `mc:coins-changed` CustomEvent (dispatched by RPC wrappers)
 */
export function useCoinBalance(): { balance: number | null; loading: boolean; refresh: () => void } {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchBal = async () => {
      if (!user) { setBalance(null); setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase.rpc("get_my_profile");
      const row = Array.isArray(data) ? data[0] : data;
      if (!cancelled) {
        setBalance(((row as any)?.master_coins ?? 0) as number);
        setLoading(false);
      }
    };
    fetchBal();

    const onCustom = () => fetchBal();
    window.addEventListener("mc:coins-changed", onCustom);

    let channel: any = null;
    if (user) {
      channel = supabase
        .channel(`coins:${user.id}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            const next = payload?.new?.master_coins;
            if (typeof next === "number") setBalance(next);
          }
        )
        .subscribe();
    }

    return () => {
      cancelled = true;
      window.removeEventListener("mc:coins-changed", onCustom);
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    balance,
    loading,
    refresh: () => window.dispatchEvent(new CustomEvent("mc:coins-changed")),
  };
}

export function notifyCoinsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mc:coins-changed"));
  }
}
