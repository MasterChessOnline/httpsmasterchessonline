/**
 * CityLeaderboard
 *
 * Live tabela gradova: igrači po gradu, ukupne pobede, prosečan rejting.
 * - Učitava view `city_leaderboard`
 * - Realtime: refetch na svaku INSERT/UPDATE u `online_games` (kraj partije
 *   menja `games_won` u `profiles` -> view se ponovo agregira).
 * - Auto-sjaj na red kada njegova `total_wins` poraste između refetch-eva.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Trophy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  key: string;
  name: string;
  country_name: string;
  flag: string;
  region: string;
  players: number;
  total_wins: number;
  total_games: number;
  avg_rating: number;
  top_rating: number;
}

export default function CityLeaderboard({ limit = 12 }: { limit?: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [glowKey, setGlowKey] = useState<string | null>(null);
  const prevWinsRef = useRef<Map<string, number>>(new Map());

  const fetchRows = async () => {
    const { data } = await supabase
      .from("city_leaderboard" as any)
      .select("*")
      .order("total_wins", { ascending: false })
      .order("avg_rating", { ascending: false })
      .limit(limit);
    if (!data) return;
    const next = data as unknown as Row[];

    // Detect city whose wins increased since last fetch -> glow
    let bumped: string | null = null;
    for (const r of next) {
      const prev = prevWinsRef.current.get(r.key) ?? r.total_wins;
      if (r.total_wins > prev) bumped = r.key;
      prevWinsRef.current.set(r.key, r.total_wins);
    }
    setRows(next);
    setLoading(false);
    if (bumped) {
      setGlowKey(bumped);
      setTimeout(() => setGlowKey((k) => (k === bumped ? null : k)), 1800);
    }
  };

  useEffect(() => {
    fetchRows();
    const ch = supabase
      .channel("city-leaderboard")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "online_games", filter: "status=eq.finished" },
        () => fetchRows(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const max = useMemo(() => Math.max(1, ...rows.map((r) => r.total_wins)), [rows]);

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-md p-4 shadow-[0_0_40px_hsl(45_60%_30%/0.15)]">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm font-bold tracking-wider uppercase text-foreground">
          City War
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground/70">live</span>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">No data yet.</p>
      ) : (
        <ol className="space-y-1">
          <AnimatePresence initial={false}>
            {rows.map((r, i) => {
              const pct = (r.total_wins / max) * 100;
              const isGlow = glowKey === r.key;
              return (
                <motion.li
                  key={r.key}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative rounded-lg px-2 py-1.5 transition-shadow ${
                    isGlow ? "shadow-[0_0_22px_hsl(45_100%_60%/0.55)]" : ""
                  }`}
                  style={{
                    background: isGlow
                      ? "linear-gradient(90deg, hsl(45 90% 50% / 0.18), transparent)"
                      : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono w-5 text-right text-[11px] text-muted-foreground/70">
                      {i + 1}
                    </span>
                    <span className="text-base">{r.flag}</span>
                    <span className="flex-1 truncate font-medium text-foreground">{r.name}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {r.players}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-bold text-primary">
                      <Trophy className="w-3 h-3" />
                      {r.total_wins}
                    </span>
                  </div>
                  {/* progress bar */}
                  <div className="mt-1 h-0.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(45 95% 55%), hsl(45 100% 75%))",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
    </div>
  );
}
