import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Trophy, Clock, Zap, Timer, Swords, Calendar, Flame } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

const TIME_CONTROLS = [
  { label: "1+0 Bullet", seconds: 60, increment: 0, category: "bullet" },
  { label: "2+1 Bullet", seconds: 120, increment: 1, category: "bullet" },
  { label: "3+0 Blitz", seconds: 180, increment: 0, category: "blitz" },
  { label: "3+2 Blitz", seconds: 180, increment: 2, category: "blitz" },
  { label: "5+0 Blitz", seconds: 300, increment: 0, category: "blitz" },
  { label: "5+3 Blitz", seconds: 300, increment: 3, category: "blitz" },
  { label: "10+0 Rapid", seconds: 600, increment: 0, category: "rapid" },
  { label: "10+5 Rapid", seconds: 600, increment: 5, category: "rapid" },
  { label: "15+10 Rapid", seconds: 900, increment: 10, category: "rapid" },
  { label: "30+0 Classical", seconds: 1800, increment: 0, category: "classical" },
];

type TFormat = "swiss" | "arena" | "daily_cup" | "blitz_royale" | "knockout" | "koth";

const FORMAT_PRESETS: Record<TFormat, {
  label: string; desc: string; icon: any; rounds: number; durationMin?: number; tcIdx: number;
}> = {
  swiss:        { label: "Swiss",         desc: "Classic paired rounds — no eliminations",        icon: Trophy,  rounds: 5, tcIdx: 5 },
  knockout:     { label: "Knockout",      desc: "Lose once and you're out. Bracket-style drama.", icon: Swords,  rounds: 5, tcIdx: 4 },
  koth:         { label: "King of the Hill", desc: "One champion. Challenge them to take the crown.", icon: Crown, rounds: 1, tcIdx: 2 },
  arena:        { label: "MasterChess Arena", desc: "Play as many games as you can in a fixed window", icon: Swords, rounds: 99, durationMin: 60, tcIdx: 4 },
  daily_cup:    { label: "Daily Cup",     desc: "Featured short event, rotating daily", icon: Calendar, rounds: 7, durationMin: 45, tcIdx: 3 },
  blitz_royale: { label: "Blitz Royale",  desc: "Fast & furious, every game counts",   icon: Flame,    rounds: 99, durationMin: 30, tcIdx: 2 },
};

export const CreateTournamentDialog = ({ trigger, onCreated }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [tFormat, setTFormat] = useState<TFormat>("swiss");
  const [tcIdx, setTcIdx] = useState("5"); // default 5+3
  const [rounds, setRounds] = useState("5");
  const [maxPlayers, setMaxPlayers] = useState("32");
  const [startsIn, setStartsIn] = useState("5"); // minutes

  const tc = TIME_CONTROLS[parseInt(tcIdx)];
  const preset = FORMAT_PRESETS[tFormat];
  const isArenaLike = tFormat !== "swiss";

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-tournament", {
        body: {
          action: "create",
          name: name.trim() || undefined,
          time_control_label: tc.label.split(" ")[0],
          time_control_seconds: tc.seconds,
          time_control_increment: tc.increment,
          category: tc.category,
          format: tFormat,
          arena_duration_minutes: preset.durationMin ?? null,
          total_rounds: parseInt(rounds),
          max_players: parseInt(maxPlayers),
          starts_in_minutes: parseInt(startsIn),
        },
      });
      if (error) throw error;
      const tid = data?.tournament?.id;
      if (tid) {
        await supabase.functions.invoke("manage-tournament", {
          body: { action: "join", tournament_id: tid },
        });
        toast({ title: "Tournament created!", description: `Auto-starts in ${startsIn} min.` });
        setOpen(false);
        onCreated?.();
        navigate(`/tournaments/${tid}`);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create", variant: "destructive" });
    }
    setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Create
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Create Tournament
          </DialogTitle>
          <DialogDescription>
            Set up your tournament. It will start automatically at the scheduled time if at least 2 players are registered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format picker */}
          <div className="space-y-1.5">
            <Label className="text-xs">Format</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(FORMAT_PRESETS) as TFormat[]).map((k) => {
                const p = FORMAT_PRESETS[k];
                const Icon = p.icon;
                const active = tFormat === k;
                return (
                  <button
                    type="button"
                    key={k}
                    onClick={() => {
                      setTFormat(k);
                      setRounds(String(p.rounds === 99 ? 9 : p.rounds));
                      setTcIdx(String(p.tcIdx));
                    }}
                    className={`text-left rounded-lg border p-2 transition-all ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border/40 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-xs font-semibold">{p.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-name" className="text-xs">Name (optional)</Label>
            <Input id="t-name" placeholder={isArenaLike ? `My ${preset.label}` : "My Friday Night Arena"} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Time control</Label>
            <Select value={tcIdx} onValueChange={setTcIdx}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIME_CONTROLS.map((t, i) => (
                  <SelectItem key={t.label} value={String(i)}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Zap className="h-3 w-3" /> Rounds</Label>
              <Select value={rounds} onValueChange={setRounds}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 9].map(r => <SelectItem key={r} value={String(r)}>{r} rounds</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max players</Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[8, 16, 32, 64, 128].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Timer className="h-3 w-3" /> Starts in</Label>
            <Select value={startsIn} onValueChange={setStartsIn}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Tournament will auto-start at the scheduled time.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>Cancel</Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            Create & Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
