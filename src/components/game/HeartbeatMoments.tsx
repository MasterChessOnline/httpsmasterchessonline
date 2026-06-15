import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Heartbeat {
  move_number: number;
  think_time_ms: number;
  user_id: string;
}

interface Props {
  gameId: string;
  myUserId?: string;
}

export default function HeartbeatMoments({ gameId, myUserId }: Props) {
  const [beats, setBeats] = useState<Heartbeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    supabase
      .rpc("game_heartbeats", { p_game_id: gameId })
      .then(({ data, error }) => {
        if (!error && data) {
          setBeats(data as Heartbeat[]);
        }
        setLoading(false);
      });
  }, [gameId]);

  if (loading) return null;
  if (beats.length === 0) return null;

  const myBeats = myUserId ? beats.filter((b) => b.user_id === myUserId) : beats;
  if (myBeats.length === 0) return null;

  const top3 = myBeats
    .sort((a, b) => b.think_time_ms - a.think_time_ms)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse className="h-4 w-4 text-rose-400" />
        <h4 className="text-sm font-semibold text-rose-300">Heartbeat Moments</h4>
        <span className="text-[10px] text-rose-300/60 uppercase tracking-wider ml-auto">
          Your tension peaks
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {top3.map((beat, i) => (
          <motion.div
            key={beat.move_number}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
          >
            <HeartPulse className="h-3 w-3 text-rose-400" />
            <span className="text-xs text-rose-200 font-medium">
              Move {beat.move_number}
            </span>
            <span className="text-[10px] text-rose-300/70">
              {Math.round(beat.think_time_ms / 1000)}s think
            </span>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-rose-300/40 mt-2">
        Long-think moments where the position demanded your deepest focus. No engine eval — pure human drama.
      </p>
    </motion.div>
  );
}
