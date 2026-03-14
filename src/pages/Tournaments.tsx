import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, Clock, Users, Zap, Swords, Timer, Crown, Gem,
  RefreshCw, Network, GitBranch, Calendar,
  TrendingUp, Medal, User, Plus, Loader2, Play, Lock, Search, Flame,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { hasAccess } from "@/lib/premium-tiers";
import { toast } from "@/hooks/use-toast";
import { useStreak } from "@/hooks/use-streak";
import { useActiveTournament } from "@/hooks/use-active-tournament";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All", icon: Trophy },
  { value: "bullet", label: "Bullet", icon: Zap },
  { value: "blitz", label: "Blitz", icon: Zap },
  { value: "rapid", label: "Rapid", icon: Timer },
  { value: "classical", label: "Classical", icon: Clock },
];

const SKILL_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner", maxRating: 1000 },
  { value: "intermediate", label: "Intermediate", maxRating: 1400 },
  { value: "advanced", label: "Advanced", maxRating: 9999 },
];

const statusStyles: Record<string, { bg: string; label: string }> = {
  active: { bg: "bg-accent text-accent-foreground", label: "🔴 Live" },
  registering: { bg: "bg-primary/10 text-primary", label: "Open" },
  finished: { bg: "bg-muted text-muted-foreground", label: "Completed" },
};

const FORMAT_ICONS: Record<string, typeof GitBranch> = {
  swiss: RefreshCw,
  "round-robin": Network,
  "single-elimination": GitBranch,
};

type ViewTab = "all" | "leaderboard";

interface DbTournament {
  id: string;
  name: string;
  description: string;
  category: string;
  format: string;
  total_rounds: number;
  current_round: number;
  max_players: number;
  status: string;
  time_control_label: string;
  starts_at: string;
  player_count?: number;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  rating: number;
  games_played: number;
  games_won: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);

  if (diffH < 0 && diffH > -24) return "In progress";
  if (diffH >= 0 && diffH < 1) return `In ${Math.round(diffMs / 60000)} min`;
  if (diffH >= 1 && diffH < 24) return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getSkillLabel(category: string) {
  switch (category) {
    case "blitz": return "⚡ Speed";
    case "rapid": return "🎯 Tactical";
    case "classical": return "🧠 Strategic";
    default: return category;
  }
}

const Tournaments = () => {
  const { user, isPremium, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const { streak } = useStreak(user?.id);
  const { activeTournament } = useActiveTournament(user?.id);
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dbTournaments, setDbTournaments] = useState<DbTournament[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<Set<string>>(new Set());

  const [lbPlayers, setLbPlayers] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  const fetchTournaments = async () => {
    setDbLoading(true);
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("starts_at", { ascending: true })
      .limit(50);

    if (data) {
      const tournaments = data as DbTournament[];
      for (const t of tournaments) {
        const { count } = await supabase
          .from("tournament_registrations")
          .select("id", { count: "exact", head: true })
          .eq("tournament_id", t.id);
        t.player_count = count || 0;
      }
      setDbTournaments(tournaments);
    }
    setDbLoading(false);
  };

  const fetchMyRegistrations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("tournament_registrations")
      .select("tournament_id")
      .eq("user_id", user.id);
    if (data) setMyRegistrations(new Set(data.map(r => r.tournament_id)));
  };

  useEffect(() => {
    fetchTournaments();
    fetchMyRegistrations();

    const channel = supabase.channel("tournaments-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments" }, () => {
        fetchTournaments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (viewTab === "leaderboard" && lbPlayers.length === 0) {
      setLbLoading(true);
      supabase
        .from("profiles")
        .select("id, user_id, display_name, username, rating, games_played, games_won")
        .order("rating", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          setLbPlayers((data as LeaderboardEntry[]) || []);
          setLbLoading(false);
        });
    }
  }, [viewTab]);

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) { navigate("/login"); return; }
    setJoiningId(tournamentId);
    try {
      const { error } = await supabase.functions.invoke("manage-tournament", {
        body: { action: "join", tournament_id: tournamentId },
      });
      if (error) throw error;
      toast({ title: "Joined!", description: "You're registered for the tournament." });
      setMyRegistrations(prev => new Set([...prev, tournamentId]));
      fetchTournaments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setJoiningId(null);
  };

  const handleCreateTournament = async () => {
    if (!user) { navigate("/login"); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-tournament", {
        body: {
          action: "create",
          time_control_label: "5+3",
          time_control_seconds: 300,
          time_control_increment: 3,
          category: "blitz",
          format: "swiss",
          total_rounds: 5,
          max_players: 32,
        },
      });
      if (error) throw error;
      if (data?.tournament?.id) {
        await supabase.functions.invoke("manage-tournament", {
          body: { action: "join", tournament_id: data.tournament.id },
        });
        navigate(`/tournaments/${data.tournament.id}`);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setCreating(false);
  };

  // Filter tournaments
  const filtered = dbTournaments.filter(t => {
    if (category !== "all" && t.category !== category) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (skillFilter !== "all") {
      // Map skill tier to time control ranges as a proxy
      const tcSec = parseInt(t.time_control_label.split("+")[0]) * 60 || 300;
      if (skillFilter === "beginner" && tcSec < 180) return false; // beginners skip bullet
      if (skillFilter === "advanced" && tcSec > 600) return false; // advanced skip classical
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.time_control_label.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const liveTournaments = filtered.filter(t => t.status === "active");
  const openTournaments = filtered.filter(t => t.status === "registering");
  const finishedTournaments = filtered.filter(t => t.status === "finished");

  const totalLive = dbTournaments.filter(t => t.status === "active").length;
  const totalOpen = dbTournaments.filter(t => t.status === "registering").length;

  const getRankDisplay = (i: number) => {
    if (i === 0) return <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center"><Crown className="h-3.5 w-3.5 text-primary" /></div>;
    if (i === 1) return <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><Medal className="h-3.5 w-3.5 text-primary/70" /></div>;
    if (i === 2) return <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><Medal className="h-3.5 w-3.5 text-muted-foreground" /></div>;
    return <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center"><span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span></div>;
  };

  const renderTournamentCard = (t: DbTournament) => {
    const style = statusStyles[t.status] || statusStyles.registering;
    const FmtIcon = FORMAT_ICONS[t.format] || RefreshCw;
    const isJoined = myRegistrations.has(t.id);
    const isJoiningThis = joiningId === t.id;
    const isFull = (t.player_count || 0) >= t.max_players;
    const hasActiveTournament = !!activeTournament && activeTournament.tournament_id !== t.id;
    const cannotJoin = isJoiningThis || isFull || hasActiveTournament;

    return (
      <article key={t.id} className="rounded-xl border border-border/50 bg-card p-4 sm:p-5 transition-all hover:border-primary/30 hover:shadow-glow">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="hidden sm:flex rounded-lg bg-primary/10 p-3 shrink-0">
            <Swords className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-display text-sm sm:text-base font-semibold text-foreground">{t.name}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg}`}>{style.label}</span>
              <Badge className="bg-secondary/50 text-secondary-foreground border-secondary/30 text-[10px]">
                <FmtIcon className="w-2.5 h-2.5 mr-0.5" /> {t.format}
              </Badge>
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-[10px]">
                {getSkillLabel(t.category)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.time_control_label}</span>
              <span className="flex items-center gap-1"><Swords className="h-3 w-3" />{t.total_rounds} rounds</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.player_count || 0}/{t.max_players}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(t.starts_at)}</span>
              {t.status === "active" && (
                <span className="flex items-center gap-1 text-primary font-medium"><Zap className="h-3 w-3" />Round {t.current_round}/{t.total_rounds}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-medium text-foreground/70">🥇 Gold</span>
              <span className="text-[11px] font-medium text-foreground/70">🥈 Silver</span>
              <span className="text-[11px] font-medium text-foreground/70">🥉 Bronze</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {t.status === "registering" && !isJoined && (
              <div className="flex flex-col items-end gap-1">
                <Button size="sm" onClick={() => handleJoinTournament(t.id)} disabled={cannotJoin}>
                  {isJoiningThis ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {isFull ? "Full" : hasActiveTournament ? "In Tournament" : "Join"}
                </Button>
                {hasActiveTournament && (
                  <span className="text-[10px] text-muted-foreground">Leave current first</span>
                )}
              </div>
            )}
            {t.status === "registering" && isJoined && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/tournaments/${t.id}`)}>
                Joined ✓
              </Button>
            )}
            {t.status === "active" && (
              <Button size="sm" onClick={() => navigate(`/tournaments/${t.id}`)}>
                <Play className="w-3 h-3 mr-1" /> View
              </Button>
            )}
            {t.status === "finished" && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/tournaments/${t.id}`)}>
                Results
              </Button>
            )}
          </div>
        </div>
        {(t.player_count || 0) > 0 && (
          <div className="mt-3">
            <div className="w-full h-1 bg-muted rounded-full">
              <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${((t.player_count || 0) / t.max_players) * 100}%` }} />
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3 text-sm">
            <Trophy className="w-3.5 h-3.5 mr-1" /> Tournaments
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Compete & <span className="text-gradient-gold">Climb</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join free online tournaments, compete by skill level, and earn badges. All logged-in players welcome!
          </p>
          {(totalLive > 0 || totalOpen > 0) && (
            <div className="mt-3 flex justify-center gap-2">
              {totalLive > 0 && (
                <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                  🔴 {totalLive} live now
                </Badge>
              )}
              {totalOpen > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  {totalOpen} open for registration
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Main tabs */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[
            { key: "all" as ViewTab, label: "Tournaments", icon: Trophy },
            { key: "leaderboard" as ViewTab, label: "Leaderboard", icon: TrendingUp },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setViewTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                viewTab === tab.key ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/30"
              }`}>
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ============ TOURNAMENTS ============ */}
        {viewTab === "all" && (
          <div className="mx-auto max-w-2xl">
            {/* Search + Filters + Create */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or time control (e.g. 3+0, bullet)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border/50"
              />
            </div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setCategory(opt.value)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                      category === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
                    }`}>
                    <opt.icon className="h-3 w-3" /> {opt.label}
                  </button>
                ))}
              </div>
              <Button onClick={handleCreateTournament} disabled={creating} size="sm">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Create
              </Button>
            </div>

            <div className="flex gap-1.5 mb-3 flex-wrap">
              {["all", "active", "registering", "finished"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all border ${
                    statusFilter === s ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
                  }`}>
                  {s === "all" ? "All" : s === "active" ? "🔴 Live" : s === "registering" ? "Open" : "Finished"}
                </button>
              ))}
            </div>

            {/* Skill tier filter */}
            <div className="flex gap-1.5 mb-5 flex-wrap">
              {SKILL_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSkillFilter(opt.value)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all border ${
                    skillFilter === opt.value ? "border-accent bg-accent/20 text-accent-foreground" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-accent/30"
                  }`}>
                  {opt.value === "beginner" ? "🟢 " : opt.value === "intermediate" ? "🟡 " : opt.value === "advanced" ? "🔴 " : ""}{opt.label}
                </button>
              ))}
            </div>

            {/* Streak banner */}
            {user && streak && streak.current_streak > 0 && (
              <div className="mb-5 rounded-lg border border-accent/30 bg-accent/10 p-3 flex items-center gap-3">
                <Flame className="w-5 h-5 text-accent-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    🔥 {streak.current_streak}-day streak!
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {streak.total_tournaments_played} tournaments played · Best streak: {streak.longest_streak} days
                  </p>
                </div>
              </div>
            )}

            {/* Active tournament banner */}
            {activeTournament && (
              <div className="mb-5 rounded-lg border border-primary/30 bg-primary/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      You're in: {activeTournament.tournament_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {activeTournament.tournament_status === "active"
                        ? `Round ${activeTournament.current_round}/${activeTournament.total_rounds} · ${activeTournament.time_control_label}`
                        : `Starting soon · ${activeTournament.time_control_label}`}
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate(`/tournaments/${activeTournament.tournament_id}`)}>
                  Go to Lobby
                </Button>
              </div>
            )}

            {!isPremium && (
              <div className="mb-5 rounded-lg border border-border/40 bg-card p-3 flex items-center gap-3">
                <Crown className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  <span className="text-primary font-medium cursor-pointer" onClick={() => navigate("/premium")}>Upgrade to Premium</span> for exclusive tournaments with bigger prizes and special badges!
                </p>
              </div>
            )}

            {dbLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No tournaments match your filters.</p>
                <Button onClick={handleCreateTournament} disabled={creating}>
                  <Plus className="h-4 w-4 mr-1" /> Create One
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Live tournaments first */}
                {liveTournaments.length > 0 && (
                  <>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Zap className="h-3 w-3 text-primary" /> Live Now
                    </h3>
                    {liveTournaments.map(renderTournamentCard)}
                  </>
                )}

                {/* Open for registration */}
                {openTournaments.length > 0 && (
                  <>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mt-4">
                      <Calendar className="h-3 w-3" /> Open for Registration
                    </h3>
                    {openTournaments.map(renderTournamentCard)}
                  </>
                )}

                {/* Finished */}
                {finishedTournaments.length > 0 && (
                  <>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mt-4">
                      <Trophy className="h-3 w-3" /> Completed
                    </h3>
                    {finishedTournaments.map(renderTournamentCard)}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============ LEADERBOARD ============ */}
        {viewTab === "leaderboard" && (
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-5">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <TrendingUp className="w-3 h-3 mr-1" /> Global Leaderboard
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Top players ranked by ELO rating</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total Tournaments", value: dbTournaments.length, icon: Trophy },
                { label: "Live Now", value: totalLive, icon: Zap },
                { label: "Open", value: totalOpen, icon: Calendar },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/40 bg-card p-3 text-center">
                  <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground font-mono">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {lbLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />)}
              </div>
            ) : lbPlayers.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No players yet. Be the first!</p>
            ) : (
              <div className="space-y-1.5">
                {lbPlayers.map((player, i) => {
                  const winRate = player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0;
                  const isMe = user?.id === player.user_id;
                  return (
                    <Link key={player.id} to={`/profile/${player.user_id}`}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all hover:border-primary/30 ${
                        isMe ? "border-primary/30 bg-primary/5" : i < 3 ? "border-primary/10 bg-card" : "border-border/40 bg-card"
                      }`}>
                      {getRankDisplay(i)}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className={`text-sm font-medium truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                          {player.display_name || player.username || "Anonymous"}
                          {isMe && <span className="text-[10px] ml-1 opacity-70">(you)</span>}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm font-bold text-primary">{player.rating}</p>
                        <p className="text-[10px] text-muted-foreground">{player.games_played}G · {winRate}%W</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Tournaments;
