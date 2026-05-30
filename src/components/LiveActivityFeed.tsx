// Live Activity Feed — REAL signals only (no fake data).
// Sources: finished online_games (recent wins), profile rating jumps, tournament joins.
// Polls every 25s. Falls back silently if Supabase is offline.
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Flame, Swords, Trophy, Sparkles, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type FeedItem = {
  id: string;
  ts: number;
  icon: React.ElementType;
  accent: string;
  text: React.ReactNode;
  href?: string;
};

const timeAgo = (ts: number) => {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function LiveActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

        const [gamesRes, topRes, tournRes] = await Promise.all([
          (supabase as any)
            .from("online_games")
            .select("id, result, white_player_id, black_player_id, updated_at, time_control_label")
            .eq("status", "finished")
            .gte("updated_at", since)
            .order("updated_at", { ascending: false })
            .limit(12),
          (supabase as any)
            .from("profiles")
            .select("user_id, display_name, rating, peak_rating, updated_at")
            .gte("updated_at", since)
            .order("rating", { ascending: false })
            .limit(8),
          (supabase as any)
            .from("tournaments")
            .select("id, name, status, updated_at")
            .in("status", ["active", "in_progress"])
            .order("updated_at", { ascending: false })
            .limit(3),
        ]);

        const winnerIds = new Set<string>();
        for (const g of gamesRes.data ?? []) {
          if (g.result === "1-0") winnerIds.add(g.white_player_id);
          else if (g.result === "0-1") winnerIds.add(g.black_player_id);
        }
        const allIds = new Set<string>([
          ...winnerIds,
          ...((topRes.data ?? []).map((p: any) => p.user_id)),
        ]);

        let nameMap = new Map<string, { name: string; rating: number }>();
        if (allIds.size > 0) {
          const { data: profs } = await (supabase as any)
            .from("profiles")
            .select("user_id, display_name, rating")
            .in("user_id", Array.from(allIds));
          for (const p of profs ?? []) {
            nameMap.set(p.user_id, { name: p.display_name || "Player", rating: p.rating || 0 });
          }
        }

        const out: FeedItem[] = [];

        for (const g of gamesRes.data ?? []) {
          const winnerId =
            g.result === "1-0" ? g.white_player_id : g.result === "0-1" ? g.black_player_id : null;
          if (!winnerId) continue;
          const w = nameMap.get(winnerId);
          if (!w) continue;
          out.push({
            id: `g-${g.id}`,
            ts: new Date(g.updated_at).getTime(),
            icon: Swords,
            accent: "150 70% 55%",
            href: `/u/${encodeURIComponent(w.name)}`,
            text: (
              <>
                <span className="font-semibold text-foreground">{w.name}</span>{" "}
                <span className="text-muted-foreground">won a</span>{" "}
                <span className="text-emerald-400 font-medium">
                  {g.time_control_label || "rated"}
                </span>{" "}
                <span className="text-muted-foreground">game</span>
              </>
            ),
          });
        }

        for (const p of topRes.data ?? []) {
          if ((p.rating ?? 0) >= 2000 && (p.peak_rating ?? 0) <= (p.rating ?? 0)) {
            out.push({
              id: `r-${p.user_id}`,
              ts: new Date(p.updated_at).getTime(),
              icon: Crown,
              accent: "43 95% 60%",
              href: `/u/${encodeURIComponent(p.display_name || "Player")}`,
              text: (
                <>
                  <span className="font-semibold text-foreground">
                    {p.display_name || "Player"}
                  </span>{" "}
                  <span className="text-muted-foreground">reached</span>{" "}
                  <span className="text-primary font-bold">{p.rating}</span>{" "}
                  <span className="text-muted-foreground">rating</span>
                </>
              ),
            });
          }
        }

        for (const t of tournRes.data ?? []) {
          out.push({
            id: `t-${t.id}`,
            ts: new Date(t.updated_at).getTime(),
            icon: Trophy,
            accent: "38 92% 50%",
            href: `/tournaments/${t.id}`,
            text: (
              <>
                <span className="font-semibold text-foreground">{t.name}</span>{" "}
                <span className="text-muted-foreground">is live now</span>
              </>
            ),
          });
        }

        out.sort((a, b) => b.ts - a.ts);
        if (!cancelled) setItems(out.slice(0, 10));
      } catch {
        /* silent */
      }
    };
    load();
    const id = setInterval(load, 25_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const empty = items.length === 0;

  return (
    <section
      aria-label="Live activity feed"
      className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
      style={{ boxShadow: "0 20px 50px -20px hsl(43 90% 55% / 0.25)" }}
    >
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            Live Activity
          </h3>
        </div>
        <Link
          to="/leaderboard"
          className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          Leaderboard →
        </Link>
      </div>

      <div className="relative max-h-[320px] overflow-hidden">
        {empty ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            <Sparkles className="h-5 w-5 mx-auto mb-2 text-primary/60" />
            Waiting for the next game to finish…
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.li
                  key={it.id}
                  layout
                  initial={{ opacity: 0, x: -20, backgroundColor: `hsla(${it.accent} / 0.15)` }}
                  animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group"
                >
                  <Link
                    to={it.href || "#"}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-primary/5 transition-colors"
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        background: `hsla(${it.accent} / 0.12)`,
                        borderColor: `hsla(${it.accent} / 0.35)`,
                        boxShadow: `0 0 16px -4px hsla(${it.accent} / 0.5)`,
                      }}
                    >
                      <it.icon className="h-4 w-4" style={{ color: `hsl(${it.accent})` }} />
                    </div>
                    <div className="flex-1 min-w-0 text-sm leading-snug truncate">{it.text}</div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                      {timeAgo(it.ts)}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}
