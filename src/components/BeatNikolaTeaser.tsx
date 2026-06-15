import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tiny live "tried vs beat" badge for the homepage hero — pulls real
 * counts from get_beat_nikola_stats so it feels alive, never fake.
 * Doubles as a CTA into /beat-nikola.
 */
export default function BeatNikolaTeaser() {
  const [stats, setStats] = useState<{ attempts: number; wins: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Defer to idle so it doesn't fight LCP on mobile.
    const idle =
      (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 800));
    idle(async () => {
      const { data } = await supabase.rpc("get_beat_nikola_stats");
      if (cancelled) return;
      if (Array.isArray(data) && data[0]) {
        setStats({
          attempts: Number(data[0].attempts ?? 0),
          wins: Number(data[0].wins ?? 0),
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || stats.attempts === 0) return null;

  return (
    <Link
      to="/beat-nikola"
      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
    >
      <Crown className="h-3.5 w-3.5" />
      <span className="font-mono font-bold">{stats.attempts.toLocaleString()}</span>
      <span className="text-muted-foreground">tried ·</span>
      <Trophy className="h-3.5 w-3.5" />
      <span className="font-mono font-bold">{stats.wins.toLocaleString()}</span>
      <span className="text-muted-foreground">beat me</span>
    </Link>
  );
}
