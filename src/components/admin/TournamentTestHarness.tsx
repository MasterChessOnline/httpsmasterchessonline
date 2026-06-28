// Admin-only panel: seed N test bots into a tournament, simulate the current
// round, and purge bots before the live event. Visible only to users with the
// `admin` role; safe to render unconditionally (RPC enforces the check too).
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlaskConical, Bot, Trash2, Play } from "lucide-react";

interface Props {
  tournamentId: string;
  currentRound?: number;
}

export default function TournamentTestHarness({ tournamentId, currentRound = 1 }: Props) {
  const [count, setCount] = useState(32);
  const [round, setRound] = useState(currentRound);
  const [busy, setBusy] = useState<string | null>(null);

  async function call(fn: string, body: Record<string, unknown>, label: string) {
    setBusy(label);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) throw error;
      toast.success(`${label} ✓ — ${JSON.stringify(data)}`);
    } catch (e) {
      toast.error(`${label} failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-5 border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="h-5 w-5 text-amber-400" />
        <h3 className="font-bold">Tournament test harness (admin)</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Seed deterministic bots, simulate rounds, and validate FIDE Dutch Swiss pairings + Buchholz tiebreaks
        before the live event. Bots never appear in public leaderboards.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground">Bot count</label>
          <Input type="number" min={2} max={128} value={count} onChange={(e) => setCount(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Round to simulate</label>
          <Input type="number" min={1} value={round} onChange={(e) => setRound(Number(e.target.value) || 1)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!!busy}
          onClick={() => call("tournament-seed-bots", { tournament_id: tournamentId, count, action: "seed" }, `Seed ${count} bots`)}
        >
          <Bot className="h-4 w-4 mr-1" /> Seed {count} bots
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!!busy}
          onClick={() => call("tournament-simulate-round", { tournament_id: tournamentId, round }, `Simulate round ${round}`)}
        >
          <Play className="h-4 w-4 mr-1" /> Simulate round {round}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={!!busy}
          onClick={() => {
            if (!confirm("Purge ALL test bots from this tournament?")) return;
            call("tournament-seed-bots", { tournament_id: tournamentId, action: "purge" }, "Purge test bots");
          }}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Purge bots
        </Button>
      </div>
    </Card>
  );
}
