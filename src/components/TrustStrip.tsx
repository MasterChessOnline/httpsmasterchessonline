import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Swords, Globe2, ShieldCheck } from "lucide-react";

interface Stats {
  gamesToday: number;
  totalPlayers: number;
  countries: number;
  loading: boolean;
}

const formatNum = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export default function TrustStrip() {
  const [stats, setStats] = useState<Stats>({
    gamesToday: 0,
    totalPlayers: 0,
    countries: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const iso = todayStart.toISOString();

        const [online, bot, players, countriesData] = await Promise.all([
          supabase
            .from("online_games")
            .select("id", { count: "exact", head: true })
            .gte("created_at", iso),
          supabase
            .from("bot_games")
            .select("id", { count: "exact", head: true })
            .gte("created_at", iso),
          supabase
            .from("profiles")
            .select("user_id", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("country")
            .not("country", "is", null)
            .limit(1000),
        ]);

        const uniqueCountries = new Set(
          (countriesData.data ?? [])
            .map((r: any) => (r.country || "").trim().toLowerCase())
            .filter(Boolean)
        );

        if (cancelled) return;
        setStats({
          gamesToday: (online.count ?? 0) + (bot.count ?? 0),
          totalPlayers: players.count ?? 0,
          countries: uniqueCountries.size,
          loading: false,
        });
      } catch {
        if (!cancelled) setStats((s) => ({ ...s, loading: false }));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    {
      icon: Swords,
      label: "Games today",
      value: stats.loading ? "—" : formatNum(stats.gamesToday),
    },
    {
      icon: Users,
      label: "Members",
      value: stats.loading ? "—" : formatNum(stats.totalPlayers),
    },
    {
      icon: Globe2,
      label: "Countries",
      value: stats.loading ? "—" : String(stats.countries),
    },
    {
      icon: ShieldCheck,
      label: "Fair play",
      value: "100%",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
      aria-label="Community trust signals"
    >
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-primary/15 glass-4d px-3 py-3 sm:py-4 flex items-center gap-3"
        >
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <it.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg sm:text-xl font-bold text-foreground leading-none">
              {it.value}
            </div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
              {it.label}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
