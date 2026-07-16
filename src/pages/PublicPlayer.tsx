import { useEffect, useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import ShareBar from "@/components/ShareBar";
import ChessCardView from "@/components/ChessCard";
import RankBadge from "@/components/RankBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Trophy, Swords, TrendingUp, Sparkles, Zap, Timer,
  Crown, Flame, ShieldCheck, Coins, Star, Award,
} from "lucide-react";
import { computeChessCard, type ChessCardGame, type ChessCardProfile } from "@/lib/chess-card";
import { motion } from "framer-motion";

interface PublicProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  rating: number;
  peak_rating: number | null;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  bio: string | null;
  country: string | null;
  country_flag: string | null;
  created_at: string;
  profile_banner: string | null;
  master_coins: number | null;
  total_xp: number | null;
  skill_level: number | null;
  fide_title: string | null;
  highest_title_key: string | null;
}

interface RatingRow {
  rating_type: string | null;
  new_rating: number | null;
  old_rating: number | null;
  created_at: string;
}

interface RecentGame {
  white_player_id: string;
  black_player_id: string;
  result: string | null;
  time_control_label: string | null;
  created_at: string;
  pgn: string | null;
  white_time: number | null;
  black_time: number | null;
}

interface TrophyRow {
  id: string;
  title_key: string;
  title_label: string;
  season: string | null;
  awarded_at: string;
}

// Map any raw time-control label to one of the 4 standard buckets
function classifyTC(label: string | null | undefined): "bullet" | "blitz" | "rapid" | "classical" | null {
  if (!label) return null;
  const s = String(label).toLowerCase();
  if (s.includes("bullet")) return "bullet";
  if (s.includes("blitz")) return "blitz";
  if (s.includes("rapid")) return "rapid";
  if (s.includes("classic")) return "classical";
  // Numeric fallback: "3+2", "5+0", "10+5", "30+0"
  const m = s.match(/^(\d+)/);
  if (m) {
    const mins = parseInt(m[1], 10);
    if (mins < 3) return "bullet";
    if (mins < 10) return "blitz";
    if (mins < 30) return "rapid";
    return "classical";
  }
  return null;
}

const TC_META: Record<string, { label: string; icon: any; accent: string }> = {
  bullet: { label: "Bullet", icon: Zap,   accent: "from-rose-500/25 to-rose-500/5" },
  blitz:  { label: "Blitz",  icon: Flame, accent: "from-amber-500/25 to-amber-500/5" },
  rapid:  { label: "Rapid",  icon: Timer, accent: "from-sky-500/25 to-sky-500/5" },
  classical: { label: "Classical", icon: Crown, accent: "from-emerald-500/25 to-emerald-500/5" },
};

function RatingSparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <div className="h-8 flex items-center text-[10px] text-muted-foreground/60">Not enough data</div>;
  }
  const w = 120, h = 32, pad = 2;
  const min = Math.min(...points), max = Math.max(...points);
  const range = Math.max(1, max - min);
  const d = points
    .map((p, i) => {
      const x = pad + (i * (w - pad * 2)) / (points.length - 1);
      const y = pad + (h - pad * 2) * (1 - (p - min) / range);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8">
      <path d={d} fill="none" stroke={up ? "hsl(var(--primary))" : "hsl(0 70% 60%)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PublicPlayer() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [card, setCard] = useState<ChessCardProfile | null>(null);
  const [ratingHistory, setRatingHistory] = useState<RatingRow[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [trophies, setTrophies] = useState<TrophyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
      const cols =
        "user_id,display_name,username,avatar_url,rating,peak_rating,games_played,games_won,games_lost,games_drawn,bio,country,country_flag,created_at,profile_banner,master_coins,total_xp,skill_level,fide_title,highest_title_key";
      let data: any = null;
      if (isUuid) {
        const r = await supabase.from("profiles").select(cols).eq("user_id", username).maybeSingle();
        data = r.data;
      } else {
        const r = await supabase.from("profiles").select(cols).eq("username", username).maybeSingle();
        data = r.data;
        if (!data) {
          const r2 = await supabase.from("profiles").select(cols).ilike("display_name", username).limit(1).maybeSingle();
          data = r2.data as any;
        }
      }
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(data as PublicProfile);

      const [{ data: gs }, { data: rh }, { data: tr }] = await Promise.all([
        supabase
          .from("online_games")
          .select("white_player_id,black_player_id,result,pgn,time_control_label,white_time,black_time,created_at")
          .or(`white_player_id.eq.${data.user_id},black_player_id.eq.${data.user_id}`)
          .eq("status", "finished")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("rating_history")
          .select("rating_type,new_rating,old_rating,created_at")
          .eq("user_id", data.user_id)
          .order("created_at", { ascending: true })
          .limit(200),
        supabase
          .from("tournament_titles")
          .select("id,title_key,title_label,season,awarded_at")
          .eq("user_id", data.user_id)
          .order("awarded_at", { ascending: false })
          .limit(12),
      ]);

      const games: ChessCardGame[] = (gs ?? []).map((g) => ({ ...g, source: "online" as const }));
      setCard(computeChessCard(data.user_id, data.rating ?? 1200, games));
      setRatingHistory((rh ?? []) as RatingRow[]);
      setRecentGames((gs ?? []) as RecentGame[]);
      setTrophies((tr ?? []) as TrophyRow[]);
      setLoading(false);
    })();
  }, [username]);

  // Per-time-control aggregates from rating_history + online_games
  const tcStats = useMemo(() => {
    const buckets: Record<string, { current: number | null; points: number[]; games: number; wins: number; losses: number; draws: number }> = {
      bullet: { current: null, points: [], games: 0, wins: 0, losses: 0, draws: 0 },
      blitz: { current: null, points: [], games: 0, wins: 0, losses: 0, draws: 0 },
      rapid: { current: null, points: [], games: 0, wins: 0, losses: 0, draws: 0 },
      classical: { current: null, points: [], games: 0, wins: 0, losses: 0, draws: 0 },
    };
    for (const r of ratingHistory) {
      const t = classifyTC(r.rating_type);
      if (!t || r.new_rating == null) continue;
      buckets[t].points.push(r.new_rating);
      buckets[t].current = r.new_rating;
    }
    if (profile) {
      for (const g of recentGames) {
        const t = classifyTC(g.time_control_label);
        if (!t) continue;
        buckets[t].games++;
        const isWhite = g.white_player_id === profile.user_id;
        if (g.result === "1-0") isWhite ? buckets[t].wins++ : buckets[t].losses++;
        else if (g.result === "0-1") isWhite ? buckets[t].losses++ : buckets[t].wins++;
        else if (g.result === "1/2-1/2") buckets[t].draws++;
      }
    }
    return buckets;
  }, [ratingHistory, recentGames, profile]);

  const overallSpark = useMemo(
    () => ratingHistory.map((r) => r.new_rating ?? 0).filter((n) => n > 0).slice(-40),
    [ratingHistory],
  );

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Seo
          title={`${username} — chess player profile not found | MasterChess`}
          description={`We couldn't find a player named ${username} on MasterChess. Browse the leaderboard for active players.`}
          path={`/u/${username}`}
        />
        <main className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Player not found</h1>
          <p className="text-muted-foreground mb-6">No player named "{username}" on MasterChess.</p>
          <Link to="/leaderboard"><Button>Browse leaderboard</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const name = profile.display_name || profile.username || "Player";
  const winRate = profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0;
  const url = `/u/${profile.username || username}`;
  const title = `${name} — ${profile.rating} ELO chess player | MasterChess`;
  const description = `${name} is a ${profile.rating}-rated chess player on MasterChess with ${profile.games_played} games played and a ${winRate}% win rate. Ratings, trophies, and progress on their profile.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@context": "https://schema.org",
        "@type": ["Person", "Athlete"],
        name,
        alternateName: profile.username ?? undefined,
        url: `https://masterchess.live${url}`,
        image: profile.avatar_url || `https://masterchess.live/og-image.jpg`,
        description: profile.bio || description,
        nationality: profile.country ?? undefined,
        sport: "Chess",
        award: `${profile.rating} ELO · peak ${profile.peak_rating ?? profile.rating}`,
        affiliation: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live" },
        memberOf: { "@type": "Organization", name: "MasterChess" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
        { "@type": "ListItem", position: 2, name: "Players", item: "https://masterchess.live/leaderboard" },
        { "@type": "ListItem", position: 3, name, item: `https://masterchess.live${url}` },
      ],
    },
  ];

  const isVerified = !!(profile.fide_title || profile.highest_title_key);
  const bannerBg = profile.profile_banner
    ? `url(${profile.profile_banner})`
    : "linear-gradient(120deg, hsl(43 90% 55% / 0.35), hsl(280 70% 40% / 0.25), hsl(200 80% 45% / 0.30))";

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Seo title={title} description={description} path={url} image={profile.avatar_url || undefined} type="article" jsonLd={jsonLd} />
      <Navbar />

      <main className="pb-16">
        {/* ─────────────── ANIMATED BANNER ─────────────── */}
        <div className="relative overflow-hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: bannerBg, backgroundSize: "cover", backgroundPosition: "center" }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Animated gold aurora */}
          <motion.div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{ background: "radial-gradient(1200px 300px at 30% 0%, hsl(43 90% 55% / 0.35), transparent 60%), radial-gradient(1000px 300px at 80% 100%, hsl(280 70% 55% / 0.25), transparent 60%)" }}
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Drifting chess glyphs */}
          {["♞", "♛", "♜", "♝"].map((g, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute text-white/10 font-serif select-none pointer-events-none"
              style={{ fontSize: `${72 + i * 12}px`, left: `${8 + i * 22}%`, top: `${10 + (i % 2) * 30}%` }}
              animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            >
              {g}
            </motion.span>
          ))}
          {/* Fade to bg */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

          <div className="relative container mx-auto max-w-5xl px-4 pt-24 pb-28 sm:pt-28 sm:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center sm:items-end gap-5"
            >
              <div className="relative shrink-0">
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.55), transparent 70%)", filter: "blur(20px)" }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={name} className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-primary/60 shadow-2xl" />
                ) : (
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary/15 ring-4 ring-primary/60 flex items-center justify-center text-4xl font-bold text-primary shadow-2xl">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg ring-2 ring-background" title={profile.fide_title || profile.highest_title_key || "Verified"}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  {profile.fide_title && (
                    <Badge className="bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[10px]">
                      {profile.fide_title}
                    </Badge>
                  )}
                  <h1 className="font-display text-3xl sm:text-5xl font-black text-foreground drop-shadow-lg">{name}</h1>
                  {profile.country_flag && <span className="text-2xl sm:text-3xl">{profile.country_flag}</span>}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <RankBadge rating={profile.rating} size="sm" />
                  <Badge className="bg-primary/20 text-primary border-primary/40">
                    <TrendingUp className="w-3 h-3 mr-1" /> {profile.rating} ELO
                  </Badge>
                  {profile.peak_rating && profile.peak_rating > profile.rating && (
                    <Badge variant="outline" className="text-xs">Peak {profile.peak_rating}</Badge>
                  )}
                  {profile.skill_level != null && (
                    <Badge variant="outline" className="text-xs"><Star className="w-3 h-3 mr-1" /> Lvl {profile.skill_level}</Badge>
                  )}
                </div>
                {profile.bio && <p className="text-sm text-white/80 max-w-prose mx-auto sm:mx-0 drop-shadow">{profile.bio}</p>}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Link to="/play/online" className="w-full"><Button className="w-full h-11">Play a game</Button></Link>
                <Link to={`/chess-card?compare=${profile.user_id}`} className="w-full">
                  <Button variant="outline" className="w-full h-10 bg-background/50 backdrop-blur">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Compare cards
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─────────────── STAT PILLS ─────────────── */}
        <section className="container mx-auto max-w-5xl px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Games", value: profile.games_played, icon: Swords, tone: "text-foreground" },
              { label: "Win rate", value: `${winRate}%`, icon: TrendingUp, tone: "text-emerald-400" },
              { label: "Master Coins", value: profile.master_coins ?? 0, icon: Coins, tone: "text-amber-400" },
              { label: "XP", value: (profile.total_xp ?? 0).toLocaleString(), icon: Star, tone: "text-primary" },
            ].map((s) => (
              <Card key={s.label} className="p-4 border-border/40 bg-card/70 backdrop-blur">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  <s.icon className="w-3 h-3" /> {s.label}
                </div>
                <div className={`font-display text-xl font-bold ${s.tone}`}>{s.value}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* ─────────────── RATING CARDS (Bullet/Blitz/Rapid/Classical) ─────────────── */}
        <section className="container mx-auto max-w-5xl px-4 mt-6">
          <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">Ratings</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.keys(TC_META) as (keyof typeof TC_META)[]).map((k) => {
              const meta = TC_META[k];
              const b = tcStats[k];
              const Icon = meta.icon;
              const wr = b.games > 0 ? Math.round((b.wins / b.games) * 100) : null;
              return (
                <Card
                  key={k}
                  className={`relative overflow-hidden p-4 border-border/40 bg-gradient-to-br ${meta.accent}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-foreground/80" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{meta.label}</span>
                    </div>
                    {b.games > 0 && <span className="text-[10px] text-muted-foreground">{b.games}g</span>}
                  </div>
                  <div className="font-display text-3xl font-black text-foreground leading-none">
                    {b.current ?? <span className="text-muted-foreground/50">—</span>}
                  </div>
                  <div className="mt-2 h-8">
                    <RatingSparkline points={b.points.slice(-20)} />
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {wr != null ? `${wr}% win · ${b.wins}W ${b.losses}L ${b.draws}D` : "No rated games yet"}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ─────────────── OVERALL RATING GRAPH ─────────────── */}
        {overallSpark.length >= 2 && (
          <section className="container mx-auto max-w-5xl px-4 mt-6">
            <Card className="p-5 border-border/40">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground">Rating progress</h2>
                <span className="text-xs text-muted-foreground">last {overallSpark.length} games</span>
              </div>
              <div className="h-20"><RatingSparkline points={overallSpark} /></div>
            </Card>
          </section>
        )}

        {/* ─────────────── TROPHIES ─────────────── */}
        {trophies.length > 0 && (
          <section className="container mx-auto max-w-5xl px-4 mt-6">
            <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Trophies · {trophies.length}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {trophies.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-4 flex items-center gap-3"
                >
                  <Award className="w-8 h-8 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{t.title_label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t.season || new Date(t.awarded_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────── RECENT GAMES ─────────────── */}
        {recentGames.length > 0 && (
          <section className="container mx-auto max-w-5xl px-4 mt-6">
            <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">Recent games</h2>
            <Card className="border-border/40 divide-y divide-border/30">
              {recentGames.slice(0, 10).map((g, i) => {
                const isWhite = g.white_player_id === profile.user_id;
                let outcome: "W" | "L" | "D" | "?" = "?";
                if (g.result === "1-0") outcome = isWhite ? "W" : "L";
                else if (g.result === "0-1") outcome = isWhite ? "L" : "W";
                else if (g.result === "1/2-1/2") outcome = "D";
                const tone =
                  outcome === "W" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  outcome === "L" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                  outcome === "D" ? "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" :
                  "bg-muted text-muted-foreground";
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <Badge className={`w-7 h-7 justify-center p-0 font-black ${tone}`}>{outcome}</Badge>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider w-16">
                      {classifyTC(g.time_control_label) || "casual"}
                    </span>
                    <span className="text-muted-foreground text-xs">{isWhite ? "as White" : "as Black"}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {new Date(g.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </Card>
          </section>
        )}

        {/* ─────────────── CHESS CARD + SHARE ─────────────── */}
        {card && (
          <section className="container mx-auto max-w-5xl px-4 mt-6">
            <ChessCardView card={card} playerName={name} avatarUrl={profile.avatar_url} />
          </section>
        )}

        <section className="container mx-auto max-w-5xl px-4 mt-6">
          <Card className="p-5 border-border/40">
            <h2 className="font-display text-base font-bold text-foreground mb-3">Share this profile</h2>
            <ShareBar
              url={`https://masterchess.live${url}`}
              title={`Check out ${name}'s chess profile (${profile.rating} ELO) on MasterChess`}
            />
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
