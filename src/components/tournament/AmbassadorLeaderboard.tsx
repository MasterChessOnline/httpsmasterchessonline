// AmbassadorLeaderboard — most-invites ranking for a tournament.
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

type Row = { inviter_user_id: string; confirmed_invites: number; invite_links_created: number; username?: string };

export default function AmbassadorLeaderboard({ tournamentId }: { tournamentId: string }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      const { data } = await supabase
        .from("tournament_ambassador_v")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("confirmed_invites", { ascending: false })
        .limit(10);
      const list = ((data as any[]) || []).filter((r) => r.inviter_user_id);
      if (list.length === 0) { setRows([]); return; }
      const ids = list.map((r) => r.inviter_user_id);
      const { data: profs } = await supabase.from("profiles").select("id, username").in("id", ids);
      const map = new Map<string, string>(((profs as any[]) || []).map((p) => [p.id, p.username]));
      setRows(list.map((r) => ({ ...r, username: map.get(r.inviter_user_id) || "Anonymous" })));
    })();
  }, [tournamentId]);

  if (rows.length === 0) return null;

  return (
    <Card className="p-5 border-pink-500/30">
      <div className="flex items-center gap-2 text-pink-300 mb-2">
        <Trophy className="h-4 w-4" />
        <h3 className="font-semibold text-foreground">Ambassador leaderboard</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Most confirmed invites wins <span className="text-yellow-300">10,000 coins</span> + permanent
        <Badge variant="outline" className="ml-1 text-xs">Brakus Ambassador</Badge> badge.
      </p>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={r.inviter_user_id} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-muted-foreground">{i + 1}</span>
            <span className="flex-1">{r.username}</span>
            <span className="text-pink-300">{r.confirmed_invites} invites</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
