// Admin-only panel: seed N test bots into a tournament, simulate the current
// round, and purge bots before the live event. Visible only to users with the
// `admin` role; safe to render unconditionally (RPC enforces the check too).
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlaskConical, Bot, Trash2, Play, Rocket } from "lucide-react";

interface Props {
  tournamentId: string;
  currentRound?: number;
}

export default function TournamentTestHarness({ tournamentId, currentRound = 1 }: Props) {
  const [count, setCount] = useState(64);
  const [round, setRound] = useState(currentRound);
  const [busy, setBusy] = useState<string | null>(null);
  const [audit, setAudit] = useState<any>(null);

  async function call(fn: string, body: Record<string, unknown>, label: string) {
    setBusy(label);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) throw error;
      toast.success(`${label} ✓`);
      return data;
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
          variant="default"
          disabled={!!busy}
          onClick={async () => {
            setAudit(null);
            const data = await call("tournament-simulate-full", { tournament_id: tournamentId }, "Simulate full Swiss");
            if (data) setAudit(data);
          }}
        >
          <Rocket className="h-4 w-4 mr-1" /> Simulate full Swiss
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

      {audit?.audit && (
        <div className="mt-4 p-3 rounded-md border bg-background/40 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full font-semibold ${audit.audit.pass ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
              {audit.audit.pass ? "PASS" : "FAIL"}
            </span>
            <span className="text-muted-foreground">
              {audit.players} players · {audit.pairings} pairings · {audit.rounds_attempted} rounds
            </span>
          </div>
          {(["repeats", "color_streaks", "color_imbalance", "multi_bye"] as const).map((k) => {
            const arr: string[] = audit.audit[k] || [];
            if (!arr.length) return null;
            return (
              <details key={k} className="mb-1">
                <summary className="cursor-pointer text-red-300">{k} ({arr.length})</summary>
                <pre className="whitespace-pre-wrap text-[10px] mt-1 text-muted-foreground">{arr.slice(0, 20).join("\n")}</pre>
              </details>
            );
          })}
        </div>
      )}
    </Card>
  );
}

