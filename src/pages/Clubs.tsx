import { useEffect, useState } from "react";
import { Shield, Users, Trophy, Plus, Search, Loader2, Flame, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ClanTag from "@/components/ClanTag";
import Seo from "@/components/Seo";

interface Club {
  id: string;
  name: string;
  description: string;
  icon: string;
  owner_id: string;
  member_count: number;
  avg_rating: number;
  is_public: boolean;
  tag?: string | null;
  banner_color?: string | null;
  weekly_wins?: number;
  total_wins?: number;
}

interface TopClan {
  id: string;
  name: string;
  tag: string | null;
  icon: string;
  banner_color: string;
  member_count: number;
  avg_rating: number;
  weekly_wins: number;
  total_wins: number;
}

const ICON_OPTIONS = ["♞", "♛", "🏆", "⚡", "📚", "🎯", "🏅", "♚", "🛡️", "⚔️", "🔥", "💎"];
const COLOR_OPTIONS = ["#d4a843", "#e94560", "#3b82f6", "#22c55e", "#a855f7", "#f97316", "#06b6d4", "#ec4899"];

const Clubs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubIds, setMyClubIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "♞", tag: "", banner_color: "#d4a843" });
  const [topClans, setTopClans] = useState<TopClan[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);

  const loadClubs = async () => {
    setLoading(true);
    const { data: cl } = await supabase
      .from("clubs" as any)
      .select("*")
      .order("member_count", { ascending: false });
    setClubs(((cl as unknown) as Club[]) || []);

    if (user) {
      const { data: mine } = await supabase
        .from("club_members" as any)
        .select("club_id")
        .eq("user_id", user.id);
      setMyClubIds(new Set((mine as any[] || []).map(m => m.club_id)));
    }
    setLoading(false);
  };

  const loadTopClans = async () => {
    setLoadingTop(true);
    const { data } = await (supabase.rpc as any)("top_clans", { p_limit: 20 });
    setTopClans(((data as unknown) as TopClan[]) || []);
    setLoadingTop(false);
  };

  useEffect(() => { loadClubs(); loadTopClans(); }, [user]);

  const filtered = clubs.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const createClub = async () => {
    if (!user || !form.name.trim()) return;
    const tagRaw = form.tag.trim().toUpperCase();
    if (tagRaw && !/^[A-Z0-9]{2,5}$/.test(tagRaw)) {
      toast({ title: "Invalid tag", description: "Tag must be 2–5 letters or numbers (A–Z, 0–9).", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from("clubs" as any)
      .insert({
        name: form.name.trim().slice(0, 60),
        description: form.description.trim().slice(0, 300),
        icon: form.icon,
        owner_id: user.id,
        tag: tagRaw || null,
        banner_color: form.banner_color,
      })
      .select()
      .single();
    setCreating(false);
    if (error) {
      const isTag = /tag/i.test(error.message);
      toast({
        title: isTag ? "Tag already taken" : "Could not create club",
        description: isTag ? "Pick a different clan tag." : error.message,
        variant: "destructive",
      });
      return;
    }
    setCreateOpen(false);
    setForm({ name: "", description: "", icon: "♞", tag: "", banner_color: "#d4a843" });
    toast({ title: "Clan created!", description: `Welcome to ${form.name}` });
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
        <Seo title={"Chess Clubs & Clans"} description={"Join or create a chess club. Compete with your clan, climb the team leaderboard, and play in club tournaments on MasterChess."} path={"/clubs"} />
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
            <Shield className="h-7 w-7 text-primary" /> Clans
          </h1>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Clan
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="top" className="gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Top Clans
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search clans..."
                  className="pl-9"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-border/40">
                  <Shield className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No clans yet. Be the first to create one!</p>
                  <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" /> Create Clan</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(club => {
                    const joined = myClubIds.has(club.id);
                    const color = club.banner_color || "#d4a843";
                    return (
                      <div
                        key={club.id}
                        className="rounded-xl border bg-card/80 p-4 flex items-center gap-4 hover:border-primary/30 transition-all"
                        style={{ borderColor: `${color}40` }}
                      >
                        <button onClick={() => navigate(`/clubs/${club.id}`)} className="text-3xl hover:scale-110 transition-transform">
                          {club.icon}
                        </button>
                        <button onClick={() => navigate(`/clubs/${club.id}`)} className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors">{club.name}</h3>
                            <ClanTag tag={club.tag} color={color} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{club.description || "No description"}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" /> {club.member_count} members
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Trophy className="h-3 w-3" /> Avg {club.avg_rating}
                            </span>
                            {(club.weekly_wins ?? 0) > 0 && (
                              <span className="text-[10px] flex items-center gap-1" style={{ color }}>
                                <Flame className="h-3 w-3" /> {club.weekly_wins} wins this week
                              </span>
                            )}
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
            </TabsContent>

            <TabsContent value="top" className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Ranked by wins this week. Win games to push your clan up the chart.
              </p>
              {loadingTop ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : topClans.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-border/40 text-sm text-muted-foreground">
                  No ranked clans yet — be the first!
                </div>
              ) : (
                topClans.map((c, i) => {
                  const color = c.banner_color || "#d4a843";
                  const rankColor = i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-700" : "text-muted-foreground";
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/clubs/${c.id}`)}
                      className="w-full rounded-xl border bg-card/80 p-3 flex items-center gap-3 hover:border-primary/40 hover:bg-card transition-all text-left"
                      style={{ borderColor: `${color}33` }}
                    >
                      <span className={`text-lg font-display font-black w-7 text-center ${rankColor}`}>
                        {i === 0 ? <Crown className="h-5 w-5 inline" /> : `#${i + 1}`}
                      </span>
                      <span className="text-2xl">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground truncate">{c.name}</span>
                          <ClanTag tag={c.tag} color={color} />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                          <span><Users className="h-2.5 w-2.5 inline mr-0.5" />{c.member_count}</span>
                          <span><Trophy className="h-2.5 w-2.5 inline mr-0.5" />{c.avg_rating}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-base font-bold" style={{ color }}>{c.weekly_wins}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">wins</div>
                      </div>
                    </button>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Clan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Tag (2–5)</label>
                <Input
                  value={form.tag}
                  onChange={e => setForm(f => ({ ...f, tag: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) }))}
                  placeholder="GMX"
                  maxLength={5}
                  className="font-mono uppercase tracking-wider"
                />
                {form.tag && (
                  <div className="mt-1.5">
                    <ClanTag tag={form.tag} color={form.banner_color} size="md" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, banner_color: c }))}
                      className={`h-8 w-8 rounded-lg transition-all ${form.banner_color === c ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
                      style={{ background: c, boxShadow: form.banner_color === c ? `0 0 12px ${c}` : "none" }}
                      aria-label={`Pick color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
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
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Awesome Clan" maxLength={60} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's your clan about?" maxLength={300} rows={3} />
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
