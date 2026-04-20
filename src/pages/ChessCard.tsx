import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessCardView from "@/components/ChessCard";
import ChessCardCompare from "@/components/ChessCardCompare";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useChessCard } from "@/hooks/use-chess-card";
import { computeChessCard, type ChessCardProfile, type ChessCardGame } from "@/lib/chess-card";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Sparkles, X, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface OpponentProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  rating: number;
  avatar_url: string | null;
}

const ChessCardPage = () => {
  const { user, profile } = useAuth();
  const [params, setParams] = useSearchParams();

  const myCard = useChessCard(user?.id, profile?.rating);

  const compareId = params.get("compare");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OpponentProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [opponent, setOpponent] = useState<OpponentProfile | null>(null);
  const [opponentCard, setOpponentCard] = useState<ChessCardProfile | null>(null);
  const [opponentLoading, setOpponentLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,display_name,username,rating,avatar_url")
        .or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .neq("user_id", user?.id ?? "")
        .limit(8);
      setSearchResults((data as any) ?? []);
      setSearching(false);
    }, 280);
    return () => clearTimeout(t);
  }, [searchQuery, user?.id]);

  useEffect(() => {
    if (!compareId) {
      setOpponent(null);
      setOpponentCard(null);
      return;
    }
    setOpponentLoading(true);
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id,display_name,username,rating,avatar_url")
        .eq("user_id", compareId)
        .maybeSingle();
      if (!prof) {
        setOpponentLoading(false);
        return;
      }
      setOpponent(prof as any);
      const { data: gs } = await supabase
        .from("online_games")
        .select("white_player_id,black_player_id,result,pgn,time_control_label,white_time,black_time,created_at")
        .or(`white_player_id.eq.${compareId},black_player_id.eq.${compareId}`)
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(50);
      const games: ChessCardGame[] = (gs ?? []).map(g => ({ ...g, source: "online" as const }));
      setOpponentCard(computeChessCard(compareId, (prof as any).rating ?? 1200, games));
      setOpponentLoading(false);
    })();
  }, [compareId]);

  const startCompare = (id: string) => {
    setParams({ compare: id });
    setSearchQuery("");
    setSearchResults([]);
  };

  const clearCompare = () => setParams({});

  // Logged-out preview: show a sample card so the page is never empty
  if (!user) {
    const sample = computeChessCard("preview", 1450, []);
    return (
      <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center mb-8">
            <Badge className="bg-primary/15 text-primary border-primary/30 text-xs mb-3">
              <Sparkles className="w-3 h-3 mr-1" /> Personal Analytics
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
              Your <span className="text-gradient-gold">Chess Card</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Sign in to unlock your personalised Chess Card and compare with any other MasterChess player.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Link to="/login"><Button variant="default">Sign In</Button></Link>
              <Link to="/signup"><Button variant="outline">Create account</Button></Link>
            </div>
          </div>
          <div className="max-w-3xl mx-auto opacity-60 pointer-events-none select-none">
            <ChessCardView card={sample} playerName="Sample Player" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const myName = profile?.display_name || profile?.username || "You";

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="bg-primary/15 text-primary border-primary/30 text-xs mb-3">
            <Sparkles className="w-3 h-3 mr-1" /> Personal Analytics
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
            Your <span className="text-gradient-gold">Chess Card</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Seven core skills, derived automatically from every rated game you play. Compare side-by-side with any other player.
          </p>
        </motion.div>

        {myCard.loading && (
          <div className="max-w-3xl mx-auto h-96 rounded-2xl bg-muted/20 animate-pulse" />
        )}

        {myCard.error && !myCard.loading && (
          <Card className="max-w-md mx-auto p-6 text-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Couldn't load your Chess Card: {myCard.error}</p>
          </Card>
        )}

        {!myCard.loading && myCard.card && !compareId && (
          <div className="max-w-3xl mx-auto space-y-6">
            <ChessCardView
              card={myCard.card}
              playerName={myName}
              avatarUrl={profile?.avatar_url}
            />

            <Card className="p-5 border-border/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">Compare with another player</h2>
                  <p className="text-xs text-muted-foreground">Find a player by name to see a head-to-head Chess Card.</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search players by name…"
                  className="pl-10"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                  {searchResults.map(p => (
                    <button
                      key={p.user_id}
                      onClick={() => startCompare(p.user_id)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {(p.display_name || p.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {p.display_name || p.username || "Player"}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground shrink-0">{p.rating}</span>
                    </button>
                  ))}
                </div>
              )}
              {searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">Searching…</p>
              )}
              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">No players found.</p>
              )}
            </Card>
          </div>
        )}

        {!myCard.loading && myCard.card && compareId && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="border-accent/40 text-accent">
                Comparing Chess Cards
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearCompare}>
                <X className="w-3.5 h-3.5 mr-1" /> Exit compare
              </Button>
            </div>

            {opponentLoading ? (
              <div className="h-96 rounded-2xl bg-muted/20 animate-pulse" />
            ) : opponent && opponentCard ? (
              <>
                <ChessCardCompare
                  cardA={myCard.card}
                  cardB={opponentCard}
                  nameA={myName}
                  nameB={opponent.display_name || opponent.username || "Player"}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChessCardView
                    card={myCard.card}
                    playerName={myName}
                    avatarUrl={profile?.avatar_url}
                    compact
                  />
                  <ChessCardView
                    card={opponentCard}
                    playerName={opponent.display_name || opponent.username || "Player"}
                    avatarUrl={opponent.avatar_url}
                    compact
                  />
                </div>
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Player not found.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={clearCompare}>Back</Button>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ChessCardPage;
