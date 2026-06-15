import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Crown, Flame, ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface PlayerLite {
  user_id: string;
  display_name: string | null;
  rating: number;
}

interface GameRow {
  id: string;
  result: string | null;
  time_control_label: string;
  white_player_id: string;
  black_player_id: string;
  created_at: string;
}

const Rival = () => {
  const { a, b } = useParams<{ a: string; b: string }>();
  const [players, setPlayers] = useState<Record<string, PlayerLite>>({});
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!a || !b || a === b) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    (async () => {
      const [{ data: profs }, { data: gms }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, display_name, rating")
          .in("user_id", [a, b]),
        supabase
          .from("online_games")
          .select("id, result, time_control_label, white_player_id, black_player_id, created_at")
          .eq("status", "finished")
          .or(
            `and(white_player_id.eq.${a},black_player_id.eq.${b}),and(white_player_id.eq.${b},black_player_id.eq.${a})`
          )
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (!profs || profs.length < 2) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const map: Record<string, PlayerLite> = {};
      for (const p of profs) map[p.user_id] = p as PlayerLite;
      setPlayers(map);
      setGames((gms as GameRow[]) || []);
      setLoading(false);
    })();
  }, [a, b]);

  const stats = useMemo(() => {
    if (!a || !b) return { aWins: 0, bWins: 0, draws: 0, total: 0, streak: 0, streakHolder: null as string | null };
    let aWins = 0, bWins = 0, draws = 0;
    for (const g of games) {
      if (g.result === "1/2-1/2") { draws++; continue; }
      const aIsWhite = g.white_player_id === a;
      const whiteWon = g.result === "1-0";
      const winnerId = whiteWon ? g.white_player_id : g.black_player_id;
      if (winnerId === a) aWins++;
      else if (winnerId === b) bWins++;
      // (aIsWhite line kept for clarity; not needed beyond winner check)
      void aIsWhite;
    }
    // Streak based on last consecutive decisive games
    let streak = 0;
    let streakHolder: string | null = null;
    for (const g of games) {
      if (g.result === "1/2-1/2") break;
      const winnerId = g.result === "1-0" ? g.white_player_id : g.black_player_id;
      if (streakHolder === null) streakHolder = winnerId;
      if (winnerId === streakHolder) streak++;
      else break;
    }
    return { aWins, bWins, draws, total: games.length, streak, streakHolder };
  }, [games, a, b]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto pt-24 pb-24 text-center text-muted-foreground">
          Loading rivalry…
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !a || !b) {
    return (
      <div className="min-h-screen bg-background">
        <Seo title="Rivalry not found — MasterChess" description="No head-to-head record between these two players." path={`/rival/${a}-vs-${b}`} />
        <Navbar />
        <main className="container mx-auto max-w-xl pt-28 pb-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-3">No rivalry yet</h1>
          <p className="text-muted-foreground mb-6">These two players haven't faced each other on MasterChess.</p>
          <Link to="/leaderboard"><Button>Find a player</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pa = players[a];
  const pb = players[b];
  const aName = pa?.display_name || "Player A";
  const bName = pb?.display_name || "Player B";
  const leader = stats.aWins > stats.bWins ? pa : stats.bWins > stats.aWins ? pb : null;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${aName} vs ${bName} — Rivalry on MasterChess`}
        description={`Head-to-head: ${stats.aWins}-${stats.bWins}-${stats.draws}. Every game between ${aName} and ${bName} on MasterChess.`}
        path={`/rival/${a}-vs-${b}`}
        type="website"
      />
      <Navbar />

      <main className="container mx-auto max-w-3xl px-4 pt-24 pb-24">
        <Link to="/leaderboard" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>

        <motion.header
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
            <Swords className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Rivalry</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold mb-2">
            <Link to={`/profile/${a}`} className="hover:text-primary transition-colors">{aName}</Link>{" "}
            <span className="text-muted-foreground">vs</span>{" "}
            <Link to={`/profile/${b}`} className="hover:text-primary transition-colors">{bName}</Link>
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.total === 0
              ? "No games yet — first one writes history."
              : `${stats.total} ${stats.total === 1 ? "game" : "games"} played`}
          </p>
        </motion.header>

        {/* Scoreboard */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur p-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{aName}</p>
            <p className="font-display text-5xl font-bold text-primary">{stats.aWins}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{pa?.rating ?? "—"} ELO</p>
          </div>
          <div className="rounded-2xl border border-border/30 bg-muted/20 backdrop-blur p-5 text-center flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Draws</p>
            <p className="font-display text-4xl font-bold text-muted-foreground">{stats.draws}</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur p-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{bName}</p>
            <p className="font-display text-5xl font-bold text-primary">{stats.bWins}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{pb?.rating ?? "—"} ELO</p>
          </div>
        </motion.section>

        {/* Leader + streak */}
        {(leader || stats.streak > 1) && (
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {leader && (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">{leader.display_name || "Anonymous"} leads</span>
              </div>
            )}
            {stats.streak > 1 && stats.streakHolder && (
              <div className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2">
                <Flame className="w-4 h-4 text-destructive" />
                <span className="text-xs font-semibold">
                  {(players[stats.streakHolder]?.display_name || "Anonymous")} on a {stats.streak}-game streak
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* History */}
        {games.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <span className="h-px flex-1 bg-border/40" />
              History
              <span className="h-px flex-1 bg-border/40" />
            </h2>
            <ul className="space-y-2">
              {games.slice(0, 20).map((g, i) => {
                const winnerId =
                  g.result === "1/2-1/2"
                    ? null
                    : g.result === "1-0"
                      ? g.white_player_id
                      : g.black_player_id;
                const winnerName =
                  winnerId === null ? "Draw" : (players[winnerId]?.display_name || "Anonymous");
                return (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
                    className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/40 backdrop-blur p-3.5"
                  >
                    <div
                      className={`w-2 h-8 rounded-full shrink-0 ${
                        winnerId === null ? "bg-muted-foreground/30" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {winnerId === null ? "Draw" : `${winnerName} won`} · {g.time_control_label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(g.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{g.result || "?"}</span>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Rival;
