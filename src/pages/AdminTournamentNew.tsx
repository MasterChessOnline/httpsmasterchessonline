import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/use-user-roles";
import { useServerTime } from "@/hooks/use-server-time";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Trophy, Calendar, Users, Shield, Eye } from "lucide-react";
import { z } from "zod";

const TIME_PRESETS = [
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

// formSchema is built lazily inside the component so it can use server time.
function buildSchema(serverNowMs: number) {
  return z.object({
    name: z.string().trim().min(3, "At least 3 characters").max(80),
    description: z.string().trim().max(500).optional(),
    tournament_type: z.enum(["arena", "swiss", "round_robin"]),
    time_preset_idx: z.number().int().min(0).max(TIME_PRESETS.length - 1),
    starts_at: z.string().refine(
      v => new Date(v).getTime() > serverNowMs + 60 * 1000,
      "You cannot create a tournament in the past — start time must be at least 1 minute in the future (server time).",
    ),
    registration_deadline: z.string().optional(),
    max_players: z.number().int().min(2).max(1024).optional(),
    total_rounds: z.number().int().min(1).max(15),
    is_rated: z.boolean(),
    visibility: z.enum(["public", "private"]),
    anti_cheat_level: z.enum(["basic", "strict"]),
  });
}

function defaultStartIso() {
  // Default: 30 minutes from now, rounded to next 5 min
  const d = new Date(Date.now() + 30 * 60 * 1000);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  // toISOString → "2026-04-24T20:30:00.000Z" → for datetime-local we need "YYYY-MM-DDTHH:mm" in local tz
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AdminTournamentNew() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { canManageTournaments, loading: rolesLoading } = useUserRoles();

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    tournament_type: "swiss" as "arena" | "swiss" | "round_robin",
    time_preset_idx: 5, // 5+3 Blitz
    starts_at: defaultStartIso(),
    registration_deadline: "",
    max_players: 32,
    total_rounds: 5,
    is_rated: true,
    visibility: "public" as "public" | "private",
    anti_cheat_level: "strict" as "basic" | "strict",
  });

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!canManageTournaments) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-24 text-center">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Restricted</h1>
          <p className="text-muted-foreground">
            Only admins and organizers can create tournaments.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = formSchema.safeParse(form);
      if (!parsed.success) {
        const first = parsed.error.errors[0];
        toast({ title: "Invalid input", description: first.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const data = parsed.data;
      const tc = TIME_PRESETS[data.time_preset_idx];
      const startsAt = new Date(data.starts_at).toISOString();
      const regDeadline = data.registration_deadline
        ? new Date(data.registration_deadline).toISOString()
        : null;

      const { data: row, error } = await supabase
        .from("tournaments")
        .insert({
          name: data.name,
          description: data.description || "",
          tournament_type: data.tournament_type,
          format: data.tournament_type === "round_robin" ? "round-robin" : data.tournament_type,
          category: tc.category,
          time_control_label: tc.label.split(" ")[0],
          time_control_seconds: tc.seconds,
          time_control_increment: tc.increment,
          starts_at: startsAt,
          registration_deadline: regDeadline,
          max_players: data.max_players ?? 32,
          total_rounds: data.total_rounds,
          is_rated: data.is_rated,
          visibility: data.visibility,
          anti_cheat_level: data.anti_cheat_level,
          status: "registering",
          start_time_locked: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Tournament created", description: "Start time is locked." });
      navigate(`/tournaments/${row.id}`);
    } catch (err) {
      toast({
        title: "Failed to create",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Create Tournament</h1>
          </div>
          <p className="text-muted-foreground">
            Once created, the start time is locked. Only super admins can override it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="name">Tournament name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Friday Night Blitz"
                maxLength={80}
                required
              />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Open to all rated players. Prizes for top 3."
                maxLength={500}
                rows={3}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Format</h2>
            </div>
            <div>
              <Label>Tournament type *</Label>
              <Select
                value={form.tournament_type}
                onValueChange={(v: any) => setForm({ ...form, tournament_type: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="arena">Arena (continuous play, instant pairing)</SelectItem>
                  <SelectItem value="swiss">Swiss (fixed rounds, similar-score pairing)</SelectItem>
                  <SelectItem value="round_robin">Round Robin (everyone plays everyone)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time control *</Label>
              <Select
                value={String(form.time_preset_idx)}
                onValueChange={v => setForm({ ...form, time_preset_idx: Number(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_PRESETS.map((p, i) => (
                    <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.tournament_type !== "arena" && (
              <div>
                <Label htmlFor="rounds">Total rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  min={1}
                  max={15}
                  value={form.total_rounds}
                  onChange={e => setForm({ ...form, total_rounds: Number(e.target.value) })}
                />
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Schedule</h2>
            </div>
            <div>
              <Label htmlFor="start" className="flex items-center gap-2">
                Start date & time *
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={form.starts_at}
                onChange={e => setForm({ ...form, starts_at: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Will be locked after creation. Tournament auto-starts at this time.
              </p>
            </div>
            <div>
              <Label htmlFor="deadline">Registration deadline (optional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.registration_deadline}
                onChange={e => setForm({ ...form, registration_deadline: e.target.value })}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Players</h2>
            </div>
            <div>
              <Label htmlFor="max">Max players (2 – 1024)</Label>
              <Input
                id="max"
                type="number"
                min={2}
                max={1024}
                value={form.max_players}
                onChange={e => setForm({ ...form, max_players: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">Rated tournament</p>
                <p className="text-xs text-muted-foreground">Affects player ratings</p>
              </div>
              <Switch
                checked={form.is_rated}
                onCheckedChange={v => setForm({ ...form, is_rated: v })}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Access & fair play</h2>
            </div>
            <div>
              <Label className="flex items-center gap-2"><Eye className="h-4 w-4" />Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(v: any) => setForm({ ...form, visibility: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public — listed for everyone</SelectItem>
                  <SelectItem value="private">Private — invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Anti-cheat level</Label>
              <Select
                value={form.anti_cheat_level}
                onValueChange={(v: any) => setForm({ ...form, anti_cheat_level: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic — flag only</SelectItem>
                  <SelectItem value="strict">Strict — engine analysis + auto-removal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/tournaments")} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trophy className="h-4 w-4 mr-2" />}
              Create tournament
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
