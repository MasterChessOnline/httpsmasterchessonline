import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Chess } from "chess.js";
import { supabase } from "@/integrations/supabase/client";
import { detectOpening } from "@/lib/openings-detector";

interface Props {
  userId: string;
}

interface Detected {
  white?: { name: string; eco: string; trainerId?: string };
  black?: { name: string; eco: string; trainerId?: string };
}

/**
 * Looks at the user's last 30 finished online games, runs the lightweight
 * opening detector against the first ~6 plies of each PGN, and shows the
 * most-played opening per color as a chip pair.
 */
export default function MainOpeningChip({ userId }: Props) {
  const [data, setData] = useState<Detected>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: games } = await supabase
        .from("online_games")
        .select("pgn, white_player_id, black_player_id")
        .eq("status", "finished")
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(30);
      if (cancelled || !games) return;

      const tally: Record<"white" | "black", Map<string, { name: string; eco: string; trainerId?: string; n: number }>> = {
        white: new Map(),
        black: new Map(),
      };

      for (const g of games) {
        if (!g.pgn) continue;
        try {
          const c = new Chess();
          c.loadPgn(g.pgn);
          const moves = c.history().slice(0, 8);
          if (moves.length < 2) continue;
          const op = detectOpening(moves);
          if (!op) continue;
          const side = g.white_player_id === userId ? "white" : "black";
          const key = op.eco + ":" + op.name;
          const cur = tally[side].get(key) ?? { name: op.name, eco: op.eco, trainerId: op.trainerId, n: 0 };
          cur.n++;
          tally[side].set(key, cur);
        } catch { /* skip malformed pgn */ }
      }

      const top = (m: Map<string, { name: string; eco: string; trainerId?: string; n: number }>) =>
        [...m.values()].sort((a, b) => b.n - a.n)[0];

      setData({
        white: top(tally.white) ? { name: top(tally.white)!.name, eco: top(tally.white)!.eco, trainerId: top(tally.white)!.trainerId } : undefined,
        black: top(tally.black) ? { name: top(tally.black)!.name, eco: top(tally.black)!.eco, trainerId: top(tally.black)!.trainerId } : undefined,
      });
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (!data.white && !data.black) return null;

  const Chip = ({ side, op }: { side: "white" | "black"; op: { name: string; eco: string; trainerId?: string } }) => {
    const inner = (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[11px] font-medium hover:bg-primary/10 transition-colors">
        <Crown className={`h-3 w-3 ${side === "white" ? "text-foreground" : "text-muted-foreground"}`} />
        <span className="text-muted-foreground/80">{side === "white" ? "as White" : "as Black"}:</span>
        <span className="text-foreground">{op.name}</span>
        <span className="text-[9px] text-primary/80 font-mono">{op.eco}</span>
      </span>
    );
    return op.trainerId ? <Link to={`/openings/${op.trainerId}`}>{inner}</Link> : inner;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {data.white && <Chip side="white" op={data.white} />}
      {data.black && <Chip side="black" op={data.black} />}
    </div>
  );
}
