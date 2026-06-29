// PredictionsMarket — stake Master Coins on who wins DB Cup. Winners split the pot.
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Coins, Crown, Loader2 } from "lucide-react";

type Player = { id: string; first_name: string | null; last_name: string | null; rating_at_join: number | null };

export default function PredictionsMarket({ tournamentId }: { tournamentId: string }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [predictionPicked, setPredictionPicked] = useState<string>("");
  const [stake, setStake] = useState<number>(100);
  const [existing, setExisting] = useState<any | null>(null);
  const [pot, setPot] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [topPicks, setTopPicks] = useState<Array<{ id: string; name: string; total: number }>>([]);

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      const [{ data: regs }, { data: preds }] = await Promise.all([
        supabase.from("tournament_registrations")
          .select("id, first_name, last_name, rating_at_join")
          .eq("tournament_id", tournamentId)
          .order("rating_at_join", { ascending: false })
          .limit(50),
        supabase.from("tournament_predictions")
          .select("predicted_champion_registration_id, coins_staked, user_id")
          .eq("tournament_id", tournamentId),
      ]);
      setPlayers((regs as any) || []);
      const arr = (preds as any[]) || [];
      setPot(arr.reduce((a, p) => a + p.coins_staked, 0));
      setCount(arr.length);
      if (user?.id) {
        const mine = arr.find((p) => p.user_id === user.id);
        if (mine) {
          setExisting(mine);
          setPredictionPicked(mine.predicted_champion_registration_id);
          setStake(mine.coins_staked);
        }
      }
      const tally: Record<string, number> = {};
      arr.forEach((p) => { tally[p.predicted_champion_registration_id] = (tally[p.predicted_champion_registration_id] || 0) + p.coins_staked; });
      const top = Object.entries(tally).map(([id, total]) => {
        const r = (regs as any[] | null)?.find((x) => x.id === id);
        return { id, total, name: r ? `${r.first_name || ""} ${r.last_name || ""}`.trim() : "Player" };
      }).sort((a, b) => b.total - a.total).slice(0, 5);
      setTopPicks(top);
    })();
  }, [tournamentId, user?.id]);

  const playerName = (p: Player) =>
    `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Player";

  const submit = async () => {
    if (!user) { toast({ title: "Sign in to predict" }); return; }
    if (!predictionPicked) { toast({ title: "Pick a champion" }); return; }
    if (!stake || stake < 10) { toast({ title: "Minimum 10 coins" }); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("tournament_predictions").upsert(
        {
          tournament_id: tournamentId,
          user_id: user.id,
          predicted_champion_registration_id: predictionPicked,
          coins_staked: stake,
        },
        { onConflict: "tournament_id,user_id" }
      );
      if (error) throw error;
      toast({ title: existing ? "Prediction updated" : "Prediction locked in", description: `${stake} coins on your pick.` });
      setExisting({ ...existing, predicted_champion_registration_id: predictionPicked, coins_staked: stake });
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e?.message || String(e), variant: "destructive" });
    } finally { setBusy(false); }
  };

  const selectedLabel = useMemo(
    () => players.find((p) => p.id === predictionPicked),
    [predictionPicked, players]
  );

  return (
    <Card className="p-5 border-yellow-500/30">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="flex items-center gap-2 text-yellow-300">
            <Crown className="h-4 w-4" />
            <h3 className="font-semibold text-foreground">Predictions market</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Stake Master Coins on who wins DB Cup. Correct predictions split the pot proportionally to their stake.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Pot</div>
          <div className="text-2xl font-bold text-yellow-300 inline-flex items-center gap-1">
            <Coins className="h-4 w-4" /> {pot.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground">{count} predictions</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase text-muted-foreground">Your champion pick</label>
          <select
            value={predictionPicked}
            onChange={(e) => setPredictionPicked(e.target.value)}
            className="mt-1 w-full rounded-md bg-background border border-white/10 px-2 py-2 text-sm"
          >
            <option value="">— Pick a player —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {playerName(p)}{p.rating_at_join ? ` (${p.rating_at_join})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-muted-foreground">Coins to stake</label>
          <Input
            type="number" min={10} step={10}
            value={stake}
            onChange={(e) => setStake(Math.max(10, Number(e.target.value) || 0))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button onClick={submit} disabled={busy} className="bg-yellow-500 text-black hover:bg-yellow-400">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : existing ? "Update prediction" : "Lock in prediction"}
        </Button>
        {selectedLabel && (
          <Badge variant="outline" className="text-xs">
            {playerName(selectedLabel)} · {stake} coins
          </Badge>
        )}
      </div>

      {topPicks.length > 0 && (
        <div className="mt-5">
          <div className="text-xs uppercase text-muted-foreground mb-1">Crowd favourites</div>
          <div className="space-y-1.5">
            {topPicks.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 text-muted-foreground">{i + 1}</span>
                <span className="flex-1">{p.name}</span>
                <span className="text-yellow-300 inline-flex items-center gap-1">
                  <Coins className="h-3 w-3" /> {p.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
