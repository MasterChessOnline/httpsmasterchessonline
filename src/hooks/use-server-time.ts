import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns a function `serverNow()` that gives the best estimate of the real
 * server timestamp (in ms), correcting for the user's device clock skew.
 *
 * This is critical for tournament code: a user with a wrong/manipulated system
 * clock must NOT be able to bypass "no past dates" checks or fake the countdown.
 *
 * On mount we call the `server_now()` Postgres function once and store
 * `(serverMs - clientMs)` as the offset. Subsequent reads are zero-cost.
 */
export function useServerTime() {
  const [offsetMs, setOffsetMs] = useState<number>(0);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const t0 = Date.now();
      const { data, error } = await supabase.rpc("server_now");
      const t1 = Date.now();
      if (cancelled || error || !data) return;
      const serverMs = new Date(data as string).getTime();
      // Account for half the round-trip latency
      const rtt = (t1 - t0) / 2;
      const clientAtServerCall = t0 + rtt;
      setOffsetMs(serverMs - clientAtServerCall);
      setSynced(true);
    };
    void sync();
    // Re-sync every 5 minutes to handle long sessions
    const id = setInterval(sync, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const serverNow = () => Date.now() + offsetMs;
  return { serverNow, offsetMs, synced };
}
