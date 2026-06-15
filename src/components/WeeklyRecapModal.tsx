import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Swords, Sparkles } from "lucide-react";

interface RecapData {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  bestStreak: number;
}

const LS_KEY = "mc_last_recap_week";

function getWeekKey(d = new Date()): string {
  // ISO week: yyyy-Www
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export default function WeeklyRecapModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [recap, setRecap] = useState<RecapData | null>(null);

  useEffect(() => {
    if (!user) return;
    const today = new Date();
    // Only trigger on Sundays (day 0) or Mondays (day 1) and only once per ISO week
    if (today.getDay() !== 0 && today.getDay() !== 1) return;
    const wk = getWeekKey(today);
    const seen = localStorage.getItem(LS_KEY);
    if (seen === wk) return;

    // Fetch last 7 days of finished games
    const since = new Date();
    since.setDate(since.getDate() - 7);

    (async () => {
      const { data, error } = await supabase
        .from("online_games")
        .select("id,result,white_player_id,black_player_id,updated_at")
        .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
        .eq("status", "finished")
        .gte("updated_at", since.toISOString())
        .order("updated_at", { ascending: true });

      // re-bind for downstream code
      const _games = data;
        .order("ended_at", { ascending: true });

      if (error || !data || data.length === 0) {
        // No games — don't show empty recap
        localStorage.setItem(LS_KEY, wk);
        return;
      }

      let wins = 0, losses = 0, draws = 0, streak = 0, best = 0;
      for (const g of data) {
        const isWhite = g.white_player_id === user.id;
        const r = (g.result || "").toLowerCase();
        const won = (isWhite && r === "white") || (!isWhite && r === "black");
        const lost = (isWhite && r === "black") || (!isWhite && r === "white");
        if (won) { wins++; streak++; best = Math.max(best, streak); }
        else if (lost) { losses++; streak = 0; }
        else { draws++; }
      }
      setRecap({ games: data.length, wins, losses, draws, bestStreak: best });
      setOpen(true);
      localStorage.setItem(LS_KEY, wk);
    })();
  }, [user]);

  if (!recap) return null;

  const winRate = recap.games > 0 ? Math.round((recap.wins / recap.games) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-primary/30 bg-gradient-to-b from-background to-background/80">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Your week in chess
          </DialogTitle>
          <DialogDescription>Last 7 days, on MasterChess.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          <div className="rounded-xl border border-border/40 bg-card/60 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              <Swords className="h-3 w-3" /> Games
            </div>
            <div className="mt-1 text-3xl font-bold">{recap.games}</div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/60 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              <TrendingUp className="h-3 w-3" /> Win rate
            </div>
            <div className="mt-1 text-3xl font-bold text-primary">{winRate}%</div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/60 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">W / L / D</div>
            <div className="mt-1 text-lg font-mono">
              <span className="text-green-400">{recap.wins}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="text-red-400">{recap.losses}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="text-yellow-400">{recap.draws}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/60 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              <Trophy className="h-3 w-3" /> Best streak
            </div>
            <div className="mt-1 text-3xl font-bold">{recap.bestStreak}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link to="/play/online" onClick={() => setOpen(false)}>Play again</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/stats" onClick={() => setOpen(false)}>See full stats</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
