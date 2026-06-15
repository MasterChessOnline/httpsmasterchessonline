import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const EMOJIS = ["🔥", "🧠", "😂", "😱", "👏", "💎", "🐐", "💀"];

interface Row {
  id: string;
  emoji: string;
  user_id: string;
}

export default function EchoReactions({ gameId }: { gameId: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("game_reactions")
      .select("id, emoji, user_id")
      .eq("game_id", gameId);
    setRows((data as Row[]) ?? []);
  }, [gameId]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`echo:${gameId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_reactions", filter: `game_id=eq.${gameId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [gameId, load]);

  const counts = EMOJIS.map(e => ({
    emoji: e,
    count: rows.filter(r => r.emoji === e).length,
    mine: !!user && rows.some(r => r.emoji === e && r.user_id === user.id),
  }));

  const toggle = async (emoji: string, mine: boolean) => {
    if (!user) { toast.error("Sign in to react"); return; }
    if (busy) return;
    setBusy(true);
    try {
      if (mine) {
        await supabase.from("game_reactions").delete().eq("game_id", gameId).eq("user_id", user.id).eq("emoji", emoji);
      } else {
        await supabase.from("game_reactions").insert({ game_id: gameId, user_id: user.id, emoji });
      }
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full rounded-xl border border-border/40 bg-card/80 p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Echo — react to this game</h3>
      <div className="flex flex-wrap gap-2">
        {counts.map(({ emoji, count, mine }) => (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => toggle(emoji, mine)}
            className={`relative px-3 py-2 rounded-full border text-lg transition-colors ${mine ? "border-primary bg-primary/20" : "border-border/40 bg-background/60 hover:bg-muted/40"}`}
          >
            <span>{emoji}</span>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="ml-1 text-xs font-bold text-foreground/80"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
