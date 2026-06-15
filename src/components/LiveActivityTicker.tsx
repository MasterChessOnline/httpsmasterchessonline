import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

interface Row {
  id: string;
  result: string;
  bot_id: string;
  moves_count: number | null;
  created_at: string;
  player_name?: string | null;
}

/**
 * Lightweight rolling feed of REAL bot-game outcomes (no fake activity).
 * Pulls last 8 rows and subscribes to new inserts via Realtime.
 */
export default function LiveActivityTicker() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("bot_games")
        .select("id, result, bot_id, moves_count, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (mounted && data) setRows(data as Row[]);
    };
    load();

    const ch = supabase
      .channel("live-activity-bot-games")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bot_games" },
        (payload) => {
          setRows((prev) => [payload.new as Row, ...prev].slice(0, 8));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
          <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Live activity
        </p>
      </div>
      <ul className="space-y-1.5 text-xs">
        {rows.map((r) => {
          const won = r.result === "win";
          const lost = r.result === "loss";
          const verb = won ? "beat" : lost ? "lost to" : "drew with";
          const bot = (r.bot_id || "a bot").replace(/-/g, " ");
          const moves = r.moves_count ? ` in ${r.moves_count} moves` : "";
          return (
            <li key={r.id} className="flex items-center gap-2 text-muted-foreground">
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  won ? "bg-emerald-500" : lost ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
              <span className="truncate">
                Someone <span className="text-foreground font-medium">{verb}</span>{" "}
                <span className="capitalize text-foreground">{bot}</span>
                {moves}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
