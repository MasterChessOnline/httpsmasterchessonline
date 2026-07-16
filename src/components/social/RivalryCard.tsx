import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Swords, Flame, Zap } from "lucide-react";

type Rivalry = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  wins_a: number;
  wins_b: number;
  draws: number;
  total_games: number;
  streak_holder_id: string | null;
  streak_count: number;
};

/**
 * Widget on a player's public profile. Shows H2H between the viewer and the profile user.
 */
export default function RivalryCard({ profileUserId, profileUsername }: { profileUserId: string; profileUsername?: string | null }) {
  const { user } = useAuth();
  const [r, setR] = useState<Rivalry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === profileUserId) {
      setLoading(false);
      return;
    }
    (async () => {
      const [a, b] = user.id < profileUserId ? [user.id, profileUserId] : [profileUserId, user.id];
      const { data } = await supabase
        .from("rivalries")
        .select("*")
        .eq("user_a_id", a)
        .eq("user_b_id", b)
        .maybeSingle();
      setR((data as Rivalry) ?? null);
      setLoading(false);
    })();
  }, [user, profileUserId]);

  if (!user || user.id === profileUserId || loading) return null;

  if (!r) {
    return (
      <Card className="p-4 bg-neutral-950 border-neutral-900">
        <div className="flex items-center gap-2 mb-2">
          <Swords size={16} className="text-amber-400" />
          <h3 className="font-semibold">Rivalstvo</h3>
        </div>
        <p className="text-sm text-neutral-400">Još niste igrali. Vreme za prvu partiju.</p>
        <Link to={`/play?opponent=${profileUsername ?? ""}`}>
          <Button size="sm" className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-black">
            <Zap size={14} className="mr-1" /> Izazovi
          </Button>
        </Link>
      </Card>
    );
  }

  const myWins = r.user_a_id === user.id ? r.wins_a : r.wins_b;
  const theirWins = r.user_a_id === user.id ? r.wins_b : r.wins_a;
  const iLead = myWins > theirWins;
  const isTied = myWins === theirWins;
  const iHoldStreak = r.streak_holder_id === user.id && r.streak_count >= 2;
  const theyHoldStreak = r.streak_holder_id && r.streak_holder_id !== user.id && r.streak_count >= 2;
  const total = r.total_games || 1;

  return (
    <Card className="p-4 bg-neutral-950 border-neutral-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Swords size={16} className="text-amber-400" />
          <h3 className="font-semibold">Rivalstvo</h3>
        </div>
        <Badge
          className={
            iLead
              ? "bg-green-500/20 text-green-300 border-green-500/30"
              : isTied
                ? "bg-neutral-700/40 text-neutral-300"
                : "bg-red-500/20 text-red-300 border-red-500/30"
          }
        >
          {myWins}–{r.draws}–{theirWins}
        </Badge>
      </div>

      <div className="flex h-2 rounded-full overflow-hidden bg-neutral-800">
        <div className="bg-green-500/70" style={{ width: `${(myWins / total) * 100}%` }} />
        <div className="bg-neutral-600" style={{ width: `${(r.draws / total) * 100}%` }} />
        <div className="bg-red-500/70" style={{ width: `${(theirWins / total) * 100}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-neutral-500">{r.total_games} partija</span>
        {iHoldStreak && (
          <span className="text-amber-400 flex items-center gap-1">
            <Flame size={12} /> {r.streak_count} u nizu za tebe
          </span>
        )}
        {theyHoldStreak && (
          <span className="text-red-400 flex items-center gap-1">
            <Flame size={12} /> Vodi {r.streak_count}
          </span>
        )}
      </div>

      <Link to={`/play?opponent=${profileUsername ?? ""}`}>
        <Button size="sm" className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-black">
          <Zap size={14} className="mr-1" /> Izazovi ponovo
        </Button>
      </Link>
    </Card>
  );
}
