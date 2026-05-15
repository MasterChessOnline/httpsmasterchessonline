import { useEffect, useState } from "react";
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
import { Loader2, Trophy, Swords, TrendingUp, Sparkles } from "lucide-react";
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
}

export default function PublicPlayer() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [card, setCard] = useState<ChessCardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
      const cols = "user_id,display_name,username,avatar_url,rating,peak_rating,games_played,games_won,games_lost,games_drawn,bio,country,country_flag,created_at";
      let data: any = null;
      if (isUuid) {
        const r = await supabase.from("profiles").select(cols).eq("user_id", username).maybeSingle();
        data = r.data;
      } else {
        let r = await supabase.from("profiles").select(cols).eq("username", username).maybeSingle();
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
      setProfile(data as any);
      const { data: gs } = await supabase
        .from("online_games")
        .select("white_player_id,black_player_id,result,pgn,time_control_label,white_time,black_time,created_at")
        .or(`white_player_id.eq.${data.user_id},black_player_id.eq.${data.user_id}`)
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(50);
      const games: ChessCardGame[] = (gs ?? []).map((g) => ({ ...g, source: "online" as const }));
      setCard(computeChessCard(data.user_id, data.rating ?? 1200, games));
      setLoading(false);
    })();
  }, [username]);

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
  const description = `${name} is a ${profile.rating}-rated chess player on MasterChess with ${profile.games_played} games played and a ${winRate}% win rate. View their Chess Card, stats, and recent games.`;

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

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Seo
        title={title}
        description={description}
        path={url}
        image={profile.avatar_url || undefined}
        type="article"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="p-6 md:p-8 border-border/40 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={name} className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/15 ring-4 ring-primary/30 flex items-center justify-center text-3xl font-bold text-primary">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {name}
                  </h1>
                  {profile.country_flag && <span className="text-2xl">{profile.country_flag}</span>}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                  <Badge className="bg-primary/15 text-primary border-primary/30">
                    <TrendingUp className="w-3 h-3 mr-1" /> {profile.rating} ELO
                  </Badge>
                  <RankBadge rating={profile.rating} size="sm" />
                  {profile.peak_rating && profile.peak_rating > profile.rating && (
                    <Badge variant="outline" className="text-xs">Peak {profile.peak_rating}</Badge>
                  )}
                </div>
                {profile.bio && <p className="text-sm text-muted-foreground mb-3 max-w-prose">{profile.bio}</p>}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground"><Swords className="w-3.5 h-3.5" /> {profile.games_played} games</span>
                  <span className="flex items-center gap-1 text-emerald-400"><Trophy className="w-3.5 h-3.5" /> {profile.games_won}W</span>
                  <span className="text-rose-400">{profile.games_lost}L</span>
                  <span className="text-muted-foreground">{profile.games_drawn}D</span>
                  <span className="text-foreground font-semibold">{winRate}% win rate</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Link to="/play/online" className="w-full"><Button className="w-full">Play a game</Button></Link>
                <Link to={`/chess-card?compare=${profile.user_id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Compare cards
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {card && (
          <div className="mb-8">
            <ChessCardView card={card} playerName={name} avatarUrl={profile.avatar_url} />
          </div>
        )}

        <Card className="p-5 border-border/40">
          <h2 className="font-display text-base font-bold text-foreground mb-3">Share this profile</h2>
          <ShareBar
            url={`https://masterchess.live${url}`}
            title={`Check out ${name}'s chess profile (${profile.rating} ELO) on MasterChess`}
          />
        </Card>
      </main>
      <Footer />
    </div>
  );
}
