import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Globe2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CountryStat = { country: string; flag: string; count: number };

export default function PlayerHeatmap() {
  const [stats, setStats] = useState<CountryStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("country, country_flag")
        .not("country", "is", null)
        .limit(5000);
      const grouped = new Map<string, CountryStat>();
      (data ?? []).forEach((p: any) => {
        const k = p.country ?? "Unknown";
        const cur = grouped.get(k) ?? { country: k, flag: p.country_flag ?? "🌍", count: 0 };
        cur.count += 1;
        grouped.set(k, cur);
      });
      const arr = Array.from(grouped.values()).sort((a, b) => b.count - a.count);
      setStats(arr);
      setTotal(arr.reduce((s, x) => s + x.count, 0));
      setLoading(false);
    })();
  }, []);

  const max = stats[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>Players Around the World — MasterChess Global Heatmap</title>
        <meta name="description" content="See where MasterChess players come from. Live country-by-country breakdown of our global chess community." />
        <link rel="canonical" href="https://masterchess.live/players/world" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <Globe2 className="w-3 h-3" /> Global Community
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Players from{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300">
              {stats.length || "—"} countries
            </span>
          </h1>
          <p className="text-zinc-400">
            <Users className="w-4 h-4 inline mr-1" />
            {total.toLocaleString()} verified players in the MasterChess community
          </p>
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-12">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {stats.map((s) => {
              const pct = (s.count / max) * 100;
              return (
                <div
                  key={s.country}
                  className="relative overflow-hidden rounded-xl border border-yellow-500/10 bg-[#121216] p-3"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500/20 to-yellow-500/5"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.flag}</span>
                      <span className="font-medium">{s.country}</span>
                    </div>
                    <span className="text-sm text-yellow-300 font-mono">{s.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && stats.length === 0 && (
          <div className="text-center text-zinc-500 py-12">
            No country data yet. Players will appear here as they sign up.
          </div>
        )}
      </div>
    </div>
  );
}
