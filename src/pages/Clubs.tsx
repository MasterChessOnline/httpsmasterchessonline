import { useEffect, useState } from "react";
import { Shield, Users, Trophy, Plus, Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Club {
  id: string;
  name: string;
  description: string;
  icon: string;
  owner_id: string;
  member_count: number;
  avg_rating: number;
  is_public: boolean;
}

const ICON_OPTIONS = ["♞", "♛", "🏆", "⚡", "📚", "🎯", "🏅", "♚", "🛡️", "⚔️", "🔥", "💎"];

const Clubs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubIds, setMyClubIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "♞" });

  const loadClubs = async () => {
    setLoading(true);
    const { data: cl } = await supabase
      .from("clubs" as any)
      .select("*")
      .order("member_count", { ascending: false });
    setClubs((cl as Club[]) || []);

    if (user) {
      const { data: mine } = await supabase
        .from("club_members" as any)
        .select("club_id")
        .eq("user_id", user.id);
      setMyClubIds(new Set((mine as any[] || []).map(m => m.club_id)));
    }
    setLoading(false);
  };

  useEffect(() => { loadClubs(); }, [user]);

  const filtered = clubs.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const createClub = async () => {
    if (!user || !form.name.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("clubs" as any)
      .insert({
        name: form.name.trim().slice(0, 60),
        description: form.description.trim().slice(0, 300),
        icon: form.icon,
        owner_id: user.id,
      })
      .select()
      .single();
    setCreating(false);
    if (error) {
      toast({ title: "Could not create club", description: error.message, variant: "destructive" });
      return;
    }
    setCreateOpen(false);
    setForm({ name: "", description: "", icon: "♞" });
    toast({ title: "Club created!", description: `Welcome to ${form.name}` });
    if (data) navigate(`/clubs/${(data as any).id}`);
  };

  const joinClub = async (clubId: string) => {
    if (!user) { navigate("/login"); return; }
    const { error } = await supabase.from("club_members" as any).insert({
      club_id: clubId, user_id: user.id, role: "member",
    });
    if (error) {
      toast({ title: "Could not join", description: error.message, variant: "destructive" });
      return;
    }
    setMyClubIds(prev => new Set([...prev, clubId]));
    toast({ title: "Joined club!" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Clubs</h1>
          <p className="text-muted-foreground mb-6">Log in to join chess clubs.</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6 max-w-3xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" /> Clubs
          </h1>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Club
          </Button>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/40">
              <Shield className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No clubs yet. Be the first to create one!</p>
              <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" /> Create Club</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(club => {
                const joined = myClubIds.has(club.id);
                return (
                  <div key={club.id} className="rounded-xl border border-border/40 bg-card/80 p-4 flex items-center gap-4 hover:border-primary/30 transition-all">
                    <button onClick={() => navigate(`/clubs/${club.id}`)} className="text-3xl hover:scale-110 transition-transform">
                      {club.icon}
                    </button>
                    <button onClick={() => navigate(`/clubs/${club.id}`)} className="flex-1 min-w-0 text-left">
                      <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors">{club.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{club.description || "No description"}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> {club.member_count} members
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Avg {club.avg_rating}
                        </span>
                      </div>
                    </button>
                    {joined ? (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/clubs/${club.id}`)}>Open</Button>
                    ) : (
                      <Button size="sm" onClick={() => joinClub(club.id)}>Join</Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Club</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Icon</label>
              <div className="flex gap-1.5 flex-wrap">
                {ICON_OPTIONS.map(ic => (
                  <button
                    key={ic}
                    onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`h-10 w-10 rounded-lg text-xl transition-all ${form.icon === ic ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/40 hover:bg-muted/60"}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Name</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Awesome Club" maxLength={60} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's your club about?" maxLength={300} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createClub} disabled={!form.name.trim() || creating}>
              {creating && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clubs;
