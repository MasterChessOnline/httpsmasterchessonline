import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlayerRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  rating: number | null;
  username_style: string | null;
}

export default function Ranked() {
  const [top, setTop] = useState<PlayerRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, rating, username_style")
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(25);
      setTop((data ?? []) as PlayerRow[]);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Helmet>
        <title>Ranked Chess — Competitive ELO ladder | MasterChess</title>
        <meta name="description" content="Compete in ranked online chess. Climb the live ELO ladder, earn titles, and unlock exclusive board themes — no ads, no cheats, pure chess." />
        <link rel="canonical" href="https://masterchess.live/ranked" />
        <meta property="og:title" content="Ranked Chess — Live ELO ladder" />
        <meta property="og:description" content="Compete in ranked online chess. Earn ELO, titles, and exclusive cosmetics." />
        <meta property="og:url" content="https://masterchess.live/ranked" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Ranked Chess — Live ELO ladder",
          url: "https://masterchess.live/ranked",
        })}</script>
      </Helmet>

      <div className="container mx-auto max-w-5xl px-4 py-12">
        <header className="mb-10 text-center">
          <Trophy className="mx-auto mb-3 h-12 w-12 text-yellow-400" />
          <h1 className="text-4xl font-bold md:text-5xl">Ranked Chess</h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Real opponents. Live ELO. Permanent stakes. Win to climb, lose to drop, repeat.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
              <Link to="/play/online">Play Ranked Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/tournaments">Join Tournament</Link>
            </Button>
          </div>
        </header>

        <section className="mb-12 grid gap-4 md:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-950 p-5">
            <TrendingUp className="mb-2 h-6 w-6 text-cyan-400" />
            <h3 className="mb-1 font-semibold">Live ELO</h3>
            <p className="text-sm text-zinc-400">Every ranked game changes your rating. Track wins, streaks, and color performance.</p>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950 p-5">
            <Trophy className="mb-2 h-6 w-6 text-yellow-400" />
            <h3 className="mb-1 font-semibold">Titles & Cosmetics</h3>
            <p className="text-sm text-zinc-400">Champions earn animated usernames, exclusive piece sets, and Hall of Fame entries.</p>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950 p-5">
            <Zap className="mb-2 h-6 w-6 text-fuchsia-400" />
            <h3 className="mb-1 font-semibold">No Cheats</h3>
            <p className="text-sm text-zinc-400">Engine assistance is detected and banned. Every win on the ladder is human.</p>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Top 25 Ladder</h2>
          <Card className="divide-y divide-zinc-800 border-zinc-800 bg-zinc-950">
            {top.map((p, i) => (
              <Link
                key={p.id}
                to={p.username ? `/u/${p.username}` : "#"}
                className="flex items-center gap-4 p-3 hover:bg-zinc-900"
              >
                <span className="w-8 text-center text-lg font-bold text-zinc-500">{i + 1}</span>
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-800" />
                )}
                <span className={`flex-1 truncate font-medium ${
                  p.username_style === "gold_animated"
                    ? "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent animate-pulse"
                    : ""
                }`}>
                  @{p.username ?? "player"}
                </span>
                <span className="font-mono text-yellow-300">{p.rating ?? 1200}</span>
              </Link>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
