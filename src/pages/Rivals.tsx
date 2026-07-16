import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Flame, Zap } from "lucide-react";

type Rivalry = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  wins_a: number;
  wins_b: number;
  draws: number;
  total_games: number;
  last_played_at: string | null;
  streak_holder_id: string | null;
  streak_count: number;
};

type Profile = { id: string; username: string | null; avatar_url: string | null; rating: number | null };

export default function Rivals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<(Rivalry & { opponent: Profile | null; myWins: number; theirWins: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Rivalstva — MasterChess";
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("rivalries")
        .select("*")
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order("last_played_at", { ascending: false })
        .limit(50);
      const list = (data ?? []) as Rivalry[];
      const oppIds = list.map((r) => (r.user_a_id === user.id ? r.user_b_id : r.user_a_id));
      const { data: profs } = oppIds.length
        ? await supabase.from("profiles").select("id, username, avatar_url, rating").in("id", oppIds)
        : { data: [] as Profile[] };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      const enriched = list.map((r) => {
        const oppId = r.user_a_id === user.id ? r.user_b_id : r.user_a_id;
        const myWins = r.user_a_id === user.id ? r.wins_a : r.wins_b;
        const theirWins = r.user_a_id === user.id ? r.wins_b : r.wins_a;
        return { ...r, opponent: map.get(oppId) ?? null, myWins, theirWins };
      });
      setRows(enriched);
      setLoading(false);
    })();
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-neutral-300">
        <p>Prijavi se da vidiš rivalstva.</p>
        <Button onClick={() => navigate("/login?next=/rivals")}>Prijava</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Swords className="text-amber-400" size={28} />
          <div>
            <h1 className="text-3xl font-bold">Rivalstva</h1>
            <p className="text-sm text-neutral-400">
              Igrači sa kojima ti se najviše ukršta put.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-neutral-500">Učitavanje…</p>
        ) : rows.length === 0 ? (
          <Card className="p-10 text-center bg-neutral-950 border-neutral-900">
            <p className="text-neutral-400">Još nemaš rivala.</p>
            <p className="text-xs text-neutral-500 mt-2">
              Igraj online partije — automatski se prati H2H sa svakim protivnikom.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <RivalRow key={r.id} r={r} meId={user.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RivalRow({
  r,
  meId,
}: {
  r: Rivalry & { opponent: Profile | null; myWins: number; theirWins: number };
  meId: string;
}) {
  const total = r.total_games || 1;
  const myPct = (r.myWins / total) * 100;
  const theirPct = (r.theirWins / total) * 100;
  const iLead = r.myWins > r.theirWins;
  const isTied = r.myWins === r.theirWins;
  const iHoldStreak = r.streak_holder_id === meId && r.streak_count >= 2;
  const theyHoldStreak = r.streak_holder_id && r.streak_holder_id !== meId && r.streak_count >= 2;

  return (
    <Card className="p-4 bg-neutral-950 border-neutral-900">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          to={r.opponent?.username ? `/u/${r.opponent.username}` : "#"}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden shrink-0">
            {r.opponent?.avatar_url ? (
              <img src={r.opponent.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">♟</div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{r.opponent?.username ?? "?"}</div>
            <div className="text-xs text-neutral-500">
              {r.total_games} partij{r.total_games === 1 ? "a" : "a"}
              {r.opponent?.rating && ` · ${r.opponent.rating}`}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {iHoldStreak && (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Flame size={12} className="mr-1" /> {r.streak_count} u nizu
            </Badge>
          )}
          {theyHoldStreak && (
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
              <Flame size={12} className="mr-1" /> Gube {r.streak_count}
            </Badge>
          )}
          <Badge
            className={
              iLead
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : isTied
                  ? "bg-neutral-700/40 text-neutral-300"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
            }
          >
            {r.myWins}–{r.draws}–{r.theirWins}
          </Badge>
        </div>
      </div>

      {/* H2H bar */}
      <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-neutral-800">
        <div className="bg-green-500/70" style={{ width: `${myPct}%` }} />
        <div className="bg-neutral-600" style={{ width: `${(r.draws / total) * 100}%` }} />
        <div className="bg-red-500/70" style={{ width: `${theirPct}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>{r.last_played_at ? `Poslednja: ${new Date(r.last_played_at).toLocaleDateString("sr-RS")}` : ""}</span>
        <Link to={`/play?opponent=${r.opponent?.username ?? ""}`} className="text-amber-400 hover:underline">
          <Zap size={12} className="inline mr-1" />
          Izazovi
        </Link>
      </div>
    </Card>
  );
}
