import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Users, Plus, Clock, Trophy, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Battle = {
  id: string;
  name: string;
  description: string;
  team_a_name: string;
  team_b_name: string;
  team_a_score: number;
  team_b_score: number;
  status: string;
  starts_at: string;
  time_control_label: string;
  max_per_team: number;
  created_by: string;
};

type Member = { id: string; battle_id: string; user_id: string; team: "a" | "b"; score: number };

export default function TeamBattles() {
  const { user } = useAuth();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [members, setMembers] = useState<Record<string, Member[]>>({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", team_a_name: "Knights", team_b_name: "Bishops", time_control_label: "5+3" });
  const [creating, setCreating] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const { data: b } = await supabase
      .from("team_battles")
      .select("*")
      .order("starts_at", { ascending: true })
      .limit(50);
    setBattles((b as any) || []);
    if (b && b.length) {
      const ids = b.map((x: any) => x.id);
      const { data: m } = await supabase.from("team_battle_members").select("*").in("battle_id", ids);
      const grouped: Record<string, Member[]> = {};
      (m as any[] | null)?.forEach((mem) => {
        (grouped[mem.battle_id] = grouped[mem.battle_id] || []).push(mem);
      });
      setMembers(grouped);
    } else {
      setMembers({});
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const ch = supabase
      .channel("team-battles")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_battles" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_battle_members" }, loadAll)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createBattle = async () => {
    if (!user) {
      toast.error("Prijavi se da bi napravio bitku.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Unesi naziv bitke.");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("team_battles").insert({
      name: form.name.trim(),
      description: form.description.trim(),
      created_by: user.id,
      team_a_name: form.team_a_name || "Team A",
      team_b_name: form.team_b_name || "Team B",
      time_control_label: form.time_control_label,
    } as any);
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bitka kreirana!");
    setCreateOpen(false);
    setForm({ name: "", description: "", team_a_name: "Knights", team_b_name: "Bishops", time_control_label: "5+3" });
    loadAll();
  };

  const join = async (battle: Battle, team: "a" | "b") => {
    if (!user) {
      toast.error("Prijavi se da bi se pridružio.");
      return;
    }
    const ms = members[battle.id] || [];
    if (ms.some((m) => m.user_id === user.id)) {
      toast.info("Već si u ovoj bitki.");
      return;
    }
    const teamCount = ms.filter((m) => m.team === team).length;
    if (teamCount >= battle.max_per_team) {
      toast.error("Tim je pun.");
      return;
    }
    const { error } = await supabase
      .from("team_battle_members")
      .insert({ battle_id: battle.id, user_id: user.id, team } as any);
    if (error) toast.error(error.message);
    else toast.success(`Pridružio si se ${team === "a" ? battle.team_a_name : battle.team_b_name}!`);
  };

  const leave = async (battle: Battle) => {
    if (!user) return;
    const { error } = await supabase
      .from("team_battle_members")
      .delete()
      .eq("battle_id", battle.id)
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Napustio si bitku.");
  };

  return (
    <>
      <Seo title="Team Battles — MasterChess" description="Bori se rame uz rame sa svojim timom u realnom vremenu." />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold flex items-center gap-3">
              <Swords className="w-9 h-9 text-primary" /> Team Battles
            </h1>
            <p className="text-muted-foreground mt-2">Sastavi tim, izazovi rivale, osvoji slavu zajedno.</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-neon gap-2">
                <Plus className="w-4 h-4" /> Napravi bitku
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-neon">
              <DialogHeader>
                <DialogTitle>Nova Team Battle</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Naziv bitke" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Textarea placeholder="Opis (opciono)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Ime tima A" value={form.team_a_name} onChange={(e) => setForm({ ...form, team_a_name: e.target.value })} />
                  <Input placeholder="Ime tima B" value={form.team_b_name} onChange={(e) => setForm({ ...form, team_b_name: e.target.value })} />
                </div>
                <select
                  value={form.time_control_label}
                  onChange={(e) => setForm({ ...form, time_control_label: e.target.value })}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm"
                >
                  {["1+0", "3+0", "3+2", "5+0", "5+3", "10+0", "10+5", "15+10"].map((tc) => (
                    <option key={tc} value={tc}>{tc}</option>
                  ))}
                </select>
                <Button onClick={createBattle} disabled={creating} className="w-full btn-neon">
                  {creating ? "Kreiranje…" : "Kreiraj"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Učitavanje…</div>
        ) : battles.length === 0 ? (
          <div className="glass-neon rounded-2xl p-12 text-center">
            <Swords className="w-12 h-12 mx-auto mb-4 text-primary/60" />
            <p className="text-lg font-semibold mb-1">Još nema bitki</p>
            <p className="text-sm text-muted-foreground">Budi prvi koji će kreirati Team Battle.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {battles.map((battle, idx) => {
              const ms = members[battle.id] || [];
              const teamA = ms.filter((m) => m.team === "a");
              const teamB = ms.filter((m) => m.team === "b");
              const myMember = user ? ms.find((m) => m.user_id === user.id) : null;
              return (
                <motion.div
                  key={battle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass-neon rounded-2xl p-5 card-hover"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" /> {battle.name}
                      </h3>
                      {battle.description && <p className="text-sm text-muted-foreground mt-1">{battle.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          <Clock className="w-3 h-3" /> {battle.time_control_label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/40">
                          <Users className="w-3 h-3" /> max {battle.max_per_team}/tim
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted/40 capitalize">{battle.status}</span>
                      </div>
                    </div>
                    {myMember && (
                      <Button size="sm" variant="ghost" onClick={() => leave(battle)}>
                        Napusti
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {(["a", "b"] as const).map((t) => {
                      const isA = t === "a";
                      const name = isA ? battle.team_a_name : battle.team_b_name;
                      const score = isA ? battle.team_a_score : battle.team_b_score;
                      const list = isA ? teamA : teamB;
                      const full = list.length >= battle.max_per_team;
                      const joined = !!myMember && myMember.team === t;
                      return (
                        <div
                          key={t}
                          className={`rounded-xl border p-4 transition-all ${
                            isA ? "border-primary/40 bg-primary/5" : "border-secondary/40 bg-secondary/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Crown className={`w-4 h-4 ${isA ? "text-primary" : "text-secondary-foreground"}`} />
                              <span className="font-semibold">{name}</span>
                            </div>
                            <span className="text-2xl font-bold text-gradient-gold">{score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {list.length}/{battle.max_per_team} igrača
                          </p>
                          {!myMember && (
                            <Button
                              size="sm"
                              variant={isA ? "default" : "secondary"}
                              disabled={full}
                              onClick={() => join(battle, t)}
                              className="w-full"
                            >
                              {full ? "Tim pun" : `Pridruži se`}
                            </Button>
                          )}
                          {joined && (
                            <p className="text-xs text-primary text-center font-medium">✓ Ti si u ovom timu</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
