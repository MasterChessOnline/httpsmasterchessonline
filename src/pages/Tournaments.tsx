import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, Clock, Users, Zap, Swords, BookOpen, Timer, Lock, Crown, Gem,
  Shield, Star, GitBranch, RefreshCw, Network, Calendar, CalendarDays,
  TrendingUp, Medal, User, Plus, Loader2, Play,
} from "lucide-react";
import { TOURNAMENTS, Tournament, FORMAT_LABELS, TournamentFormat, TournamentAccess } from "@/lib/tournaments-data";
import { hasAccess } from "@/lib/premium-tiers";
import { toast } from "@/hooks/use-toast";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All", icon: Trophy },
  { value: "blitz", label: "Blitz", icon: Zap },
  { value: "rapid", label: "Rapid", icon: Timer },
  { value: "classical", label: "Classical", icon: Clock },
  { value: "themed", label: "Themed", icon: BookOpen },
];

const SCHEDULE_OPTIONS = [
  { value: "all", label: "All", icon: Calendar },
  { value: "daily", label: "Daily", icon: CalendarDays },
  { value: "weekly", label: "Weekly", icon: RefreshCw },
  { value: "monthly", label: "Monthly", icon: Calendar },
];

const statusStyles: Record<string, { bg: string; label: string }> = {
  live: { bg: "bg-accent text-accent-foreground", label: "🔴 Live" },
  active: { bg: "bg-accent text-accent-foreground", label: "🔴 Live" },
  registering: { bg: "bg-primary/10 text-primary", label: "Open" },
  upcoming: { bg: "bg-muted text-muted-foreground", label: "Upcoming" },
  completed: { bg: "bg-muted text-muted-foreground", label: "Completed" },
  finished: { bg: "bg-muted text-muted-foreground", label: "Completed" },
};

const FORMAT_ICONS: Record<TournamentFormat, typeof GitBranch> = {
  swiss: RefreshCw,
  "round-robin": Network,
  "single-elimination": GitBranch,
};

const ACCESS_BADGES: Record<TournamentAccess, { label: string; className: string; icon: typeof Crown }> = {
  free: { label: "Free", className: "bg-accent/20 text-accent-foreground border-accent/30", icon: Trophy },
  premium: { label: "Premium", className: "bg-primary/20 text-primary border-primary/30", icon: Crown },
  vip: { label: "VIP", className: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Gem },
};

type ViewTab = "live" | "free" | "premium" | "vip" | "leaderboard";

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

function TournamentCard({ t, canJoin }: { t: Tournament; canJoin: boolean }) {
  const style = statusStyles[t.status];
  const accessBadge = ACCESS_BADGES[t.access];
  const FmtIcon = FORMAT_ICONS[t.format];

  return (
    <article className="rounded-xl border border-border/50 bg-card p-4 sm:p-5 transition-all hover:border-primary/30 hover:shadow-glow">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="hidden sm:flex rounded-lg bg-primary/10 p-3 shrink-0">
          <Swords className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="font-display text-sm sm:text-base font-semibold text-foreground">{t.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg}`}>{style.label}</span>
            <Badge className={`${accessBadge.className} text-[10px]`}>
              <accessBadge.icon className="w-2.5 h-2.5 mr-0.5" /> {accessBadge.label}
            </Badge>
            <Badge className="bg-secondary/50 text-secondary-foreground border-secondary/30 text-[10px]">
              <FmtIcon className="w-2.5 h-2.5 mr-0.5" /> {FORMAT_LABELS[t.format].label}
            </Badge>
            {t.ratingRange && (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-[10px]">{t.ratingRange}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 flex-wrap">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.timeControl}</span>
            <span className="flex items-center gap-1"><Swords className="h-3 w-3" />{t.rounds}R</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.currentPlayers}/{t.maxPlayers}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.startDate}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {t.trophies.map((trophy) => (
              <span key={trophy.place} className="text-[11px] font-medium text-foreground/70">
                {trophy.emoji} {trophy.label}
              </span>
            ))}
          </div>
        </div>
        <Button
          size="sm"
          variant={t.status === "live" ? "default" : "outline"}
          className="shrink-0"
          disabled={!canJoin || t.status === "upcoming" || t.status === "completed"}
        >
          {!canJoin ? (
            <><Lock className="w-3 h-3 mr-1" /> Locked</>
          ) : t.status === "live" ? "Join Now" : t.status === "registering" ? "Register" : t.status === "upcoming" ? "Coming Soon" : "View"}
        </Button>
      </div>
      {t.currentPlayers > 0 && (
        <div className="mt-3">
          <div className="w-full h-1 bg-muted rounded-full">
            <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${(t.currentPlayers / t.maxPlayers) * 100}%` }} />
          </div>
        </div>
      )}
    </article>
  );
}

const Tournaments = () => {
  const { user, isPremium, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [viewTab, setViewTab] = useState<ViewTab>("live");
  const [category, setCategory] = useState("all");
  const [schedule, setSchedule] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // DB tournaments
  const [dbTournaments, setDbTournaments] = useState<DbTournament[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Leaderboard state
  const [lbPlayers, setLbPlayers] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  const isElitePlus = hasAccess(subscriptionTier, "elite");

  // Fetch DB tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      setDbLoading(true);
      const { data } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        // Get player counts
        const tournaments = data as DbTournament[];
        const ids = tournaments.map(t => t.id);
        if (ids.length > 0) {
          for (const t of tournaments) {
            const { count } = await supabase
              .from("tournament_registrations")
              .select("id", { count: "exact", head: true })
              .eq("tournament_id", t.id);
            t.player_count = count || 0;
          }
        }
        setDbTournaments(tournaments);
      }
      setDbLoading(false);
    };
    fetchTournaments();

    // Subscribe to tournament changes
    const channel = supabase.channel("tournaments-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments" }, () => {
        fetchTournaments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
        // Auto-join
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

  const getFilteredTournaments = (access: TournamentAccess) => {
    return TOURNAMENTS.filter((t) => {
      if (t.access !== access) return false;
      if (category !== "all" && t.category !== category) return false;
      if (schedule !== "all" && t.schedule !== schedule) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  };

  const freeTournaments = getFilteredTournaments("free");
  const premiumTournaments = getFilteredTournaments("premium");
  const vipTournaments = getFilteredTournaments("vip");

  const liveDbTournaments = dbTournaments.filter(t => t.status === "active" || t.status === "registering");
  const finishedDbTournaments = dbTournaments.filter(t => t.status === "finished");

  const liveCount = TOURNAMENTS.filter((t) => t.access === "free" && t.status === "live").length + liveDbTournaments.length;

  const getRankDisplay = (i: number) => {
    if (i === 0) return <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center"><Crown className="h-3.5 w-3.5 text-primary" /></div>;
    if (i === 1) return <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><Medal className="h-3.5 w-3.5 text-primary/70" /></div>;
    if (i === 2) return <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><Medal className="h-3.5 w-3.5 text-muted-foreground" /></div>;
    return <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center"><span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span></div>;
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
            Join free daily & weekly tournaments or unlock premium competitions. Everyone can play!
          </p>
          {liveCount > 0 && (
            <div className="mt-3">
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                🔴 {liveCount} tournament{liveCount > 1 ? "s" : ""} live now
              </Badge>
            </div>
          )}
        </div>

        {/* Main tabs */}
        <div className="flex justify-center gap-1.5 mb-6 flex-wrap">
          {[
            { key: "live" as ViewTab, label: "Live Tournaments", icon: Zap },
            { key: "free" as ViewTab, label: "Free Events", icon: Trophy },
            { key: "premium" as ViewTab, label: "Premium", icon: Crown },
            { key: "vip" as ViewTab, label: "VIP & GM", icon: Gem },
            { key: "leaderboard" as ViewTab, label: "Leaderboard", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all border ${
                viewTab === tab.key
                  ? tab.key === "vip"
                    ? "border-purple-500 bg-purple-500/10 text-purple-400"
                    : "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ============ LIVE DB TOURNAMENTS ============ */}
        {viewTab === "live" && (
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Online Tournaments</h2>
              <Button onClick={handleCreateTournament} disabled={creating} size="sm">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Create Tournament
              </Button>
            </div>

            {dbLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
              </div>
            ) : liveDbTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No live tournaments right now.</p>
                <Button onClick={handleCreateTournament} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                  Create One
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {liveDbTournaments.map(t => {
                  const style = statusStyles[t.status] || statusStyles.registering;
                  return (
                    <Link key={t.id} to={`/tournaments/${t.id}`}
                      className="block rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-glow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-display text-sm font-semibold text-foreground">{t.name}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg}`}>{style.label}</span>
                            <Badge className="bg-secondary/50 text-secondary-foreground border-secondary/30 text-[10px]">
                              {t.format}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.time_control_label}</span>
                            <span className="flex items-center gap-1"><Swords className="h-3 w-3" />{t.total_rounds}R</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.player_count || 0}/{t.max_players}</span>
                            {t.status === "active" && (
                              <span className="flex items-center gap-1 text-primary"><Zap className="h-3 w-3" />Round {t.current_round}/{t.total_rounds}</span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant={t.status === "active" ? "default" : "outline"}>
                          {t.status === "active" ? <><Play className="w-3 h-3 mr-1" /> View</> : "Join"}
                        </Button>
                      </div>
                      {(t.player_count || 0) > 0 && (
                        <div className="mt-3">
                          <div className="w-full h-1 bg-muted rounded-full">
                            <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${((t.player_count || 0) / t.max_players) * 100}%` }} />
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Recent finished tournaments */}
            {finishedDbTournaments.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">Recently Completed</h3>
                <div className="space-y-2">
                  {finishedDbTournaments.slice(0, 5).map(t => (
                    <Link key={t.id} to={`/tournaments/${t.id}`}
                      className="block rounded-lg border border-border/30 bg-card/50 p-3 transition-all hover:border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-foreground">{t.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{t.player_count || 0} players</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">Finished</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ FREE TOURNAMENTS ============ */}
        {viewTab === "free" && (
          <>
            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              {SCHEDULE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSchedule(opt.value)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                    schedule === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <opt.icon className="h-3 w-3" /> {opt.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              {CATEGORY_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setCategory(opt.value)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                    category === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <opt.icon className="h-3 w-3" /> {opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-1.5 mb-6">
              {["all", "live", "registering", "upcoming"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all border ${
                    statusFilter === s ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {!isPremium && (
              <div className="max-w-2xl mx-auto mb-5 rounded-lg border border-border/40 bg-card p-3 flex items-center gap-3">
                <Crown className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  Playing free tournaments? <span className="text-primary font-medium cursor-pointer" onClick={() => navigate("/premium")}>Upgrade to Premium</span> for exclusive tournaments with bigger prizes!
                </p>
              </div>
            )}

            <div className="mx-auto max-w-2xl space-y-2.5">
              {freeTournaments.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No free tournaments match your filters.</p>
              ) : freeTournaments.map((t) => (
                <TournamentCard key={t.id} t={t} canJoin={true} />
              ))}
            </div>
          </>
        )}

        {/* ============ PREMIUM TOURNAMENTS ============ */}
        {viewTab === "premium" && (
          <>
            {!isPremium ? (
              <div className="max-w-md mx-auto text-center py-16">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2 font-display">Premium Tournaments</h2>
                <p className="text-muted-foreground mb-2">
                  Exclusive tournaments for Premium members with special prizes, badges, and ELO tracking.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Required: <span className="text-primary font-semibold">Premium ($4.99/mo)</span> or higher
                </p>
                <Button onClick={() => navigate("/premium")}>
                  <Crown className="w-4 h-4 mr-2" /> View Plans
                </Button>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                <div className="text-center mb-5">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Crown className="w-3 h-3 mr-1" /> Premium Tournament Arena
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {premiumTournaments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No premium tournaments match your filters.</p>
                  ) : premiumTournaments.map((t) => (
                    <TournamentCard key={t.id} t={t} canJoin={isPremium} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============ VIP TOURNAMENTS ============ */}
        {viewTab === "vip" && (
          <>
            {!isElitePlus ? (
              <div className="max-w-md mx-auto text-center py-16">
                <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2 font-display">VIP & Grandmaster Tournaments</h2>
                <p className="text-muted-foreground mb-2">
                  Compete in exclusive VIP tournaments with premium prizes and elite competition.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Required: <span className="text-purple-400 font-semibold">Elite ($15/mo)</span> or higher
                </p>
                <Button onClick={() => navigate("/premium")}>
                  <Gem className="w-4 h-4 mr-2" /> View Plans
                </Button>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                <div className="text-center mb-5">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Gem className="w-3 h-3 mr-1" /> VIP Tournament Arena
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {vipTournaments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No VIP tournaments match your filters.</p>
                  ) : vipTournaments.map((t) => (
                    <TournamentCard key={t.id} t={t} canJoin={isElitePlus} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============ TOURNAMENT LEADERBOARD ============ */}
        {viewTab === "leaderboard" && (
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-5">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <TrendingUp className="w-3 h-3 mr-1" /> Tournament Leaderboard
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Top players ranked by ELO rating</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Free Tournaments", value: TOURNAMENTS.filter((t) => t.access === "free").length, icon: Trophy },
                { label: "Online Tournaments", value: dbTournaments.length, icon: Zap },
                { label: "Live Now", value: liveDbTournaments.length, icon: Play },
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
                    <Link
                      key={player.id}
                      to={`/profile/${player.user_id}`}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all hover:border-primary/30 ${
                        isMe ? "border-primary/30 bg-primary/5" : i < 3 ? "border-primary/10 bg-card" : "border-border/40 bg-card"
                      }`}
                    >
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
