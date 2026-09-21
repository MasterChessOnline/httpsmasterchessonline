// Tiny helper: does this player hold a given official MasterChess award badge?
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useHasAward(userId?: string | null, badge?: string) {
  const [has, setHas] = useState(false);

  useEffect(() => {
    if (!userId || !badge) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("user_awards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("badge", badge);
      if (!cancelled) setHas((count ?? 0) > 0);
    })();
    return () => { cancelled = true; };
  }, [userId, badge]);

  return has;
}
