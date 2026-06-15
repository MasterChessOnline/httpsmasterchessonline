import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Swords, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DailyKing {
  user_id: string;
  rating_gain: number;
  games_played: number;
  reign_date: string;
  profile?: { display_name: string | null; rating: number | null } | null;
}

export default function DailyKingSpotlight() {
  const [king, setKing] = useState<DailyKing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKing() {
      const { data: kingRow } = await supabase
        .from("daily_kings")
        .select("user_id, rating_gain, games_played, reign_date")
        .order("reign_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!kingRow) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, rating")
        .eq("user_id", kingRow.user_id)
        .maybeSingle();

      setKing({ ...kingRow, profile });
      setLoading(false);
    }
    fetchKing();
  }, []);

  if (loading || !king) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-amber-500/10 to-yellow-600/5 p-6"
    >
      {/* Crown sparkle */}
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-3 right-4"
      >
        <Crown className="h-6 w-6 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
      </motion.div>

      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Flame className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
            Daily King
          </h3>
          <p className="text-[10px] text-amber-300/60">
            Reigning since {new Date(king.reign_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg font-bold text-amber-300">
          {king.display_name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {king.profile?.display_name ?? "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground">
            Rating {Math.round(king.profile?.rating ?? 0)} · {king.games_played} games today
          </p>
        </div>
        <Link
          to={`/profile/${king.user_id}`}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
        >
          <Swords className="h-3 w-3" />
          Challenge
        </Link>
      </div>
    </motion.div>
  );
}
