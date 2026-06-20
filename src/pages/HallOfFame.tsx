import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, Sparkles, Flame, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TitleRow {
  id: string;
  user_id: string;
  title_key: string;
  title_label: string;
  season: string | null;
  tournament_id: string | null;
  awarded_at: string;
  metadata: any;
  profile?: { username: string | null; avatar_url: string | null; username_style: string | null } | null;
}

interface UniqueBadgeRow {
  badge_key: string;
  badge_label: string;
  description: string | null;
  current_owner_id: string | null;
  awarded_at: string | null;
  owner?: { username: string | null; avatar_url: string | null } | null;
}

const ICON: Record<string, JSX.Element> = {
  tournament_champion: <Crown className="h-5 w-5 text-yellow-400" />,
  tournament_runner_up: <Trophy className="h-5 w-5 text-zinc-300" />,
  tournament_bronze: <Medal className="h-5 w-5 text-amber-600" />,
  unbeaten_player: <Sparkles className="h-5 w-5 text-cyan-300" />,
  tactical_genius: <Zap className="h-5 w-5 text-fuchsia-400" />,
  checkmate_killer: <Flame className="h-5 w-5 text-red-400" />,
  weekly_champion: <Crown className="h-5 w-5 text-yellow-500" />,
};

export default function HallOfFame() {
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [uniques, setUniques] = useState<UniqueBadgeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: tData }, { data: bData }] = await Promise.all([
        supabase
          .from("tournament_titles")
          .select("*")
          .order("awarded_at", { ascending: false })
          .limit(200),
        supabase
          .from("unique_badges")
          .select("*")
          .order("awarded_at", { ascending: false, nullsFirst: false }),
      ]);

      const userIds = new Set<string>();
      (tData ?? []).forEach((t: any) => userIds.add(t.user_id));
      (bData ?? []).forEach((b: any) => b.current_owner_id && userIds.add(b.current_owner_id));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, username_style")
        .in("id", Array.from(userIds).slice(0, 1000));
      const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

      setTitles((tData ?? []).map((t: any) => ({ ...t, profile: pmap.get(t.user_id) })));
      setUniques((bData ?? []).map((b: any) => ({ ...b, owner: b.current_owner_id ? pmap.get(b.current_owner_id) : null })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Helmet>
        <title>Hall of Fame — MasterChess Champions & Legends</title>
        <meta name="description" content="The greatest tournament champions, unbeaten players, and 1-of-1 badge holders on MasterChess. Live ranking of every legendary title ever awarded." />
        <link rel="canonical" href="https://masterchess.live/hall-of-fame" />
        <meta property="og:title" content="MasterChess Hall of Fame" />
        <meta property="og:description" content="Every champion, every legendary badge — one wall of fame." />
        <meta property="og:url" content="https://masterchess.live/hall-of-fame" />
      </Helmet>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <header className="mb-12 text-center">
          <Crown className="mx-auto mb-4 h-14 w-14 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
          <h1 className="bg-gradient-to-b from-yellow-200 to-yellow-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            Hall of Fame
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
            Every champion. Every legendary badge. Held forever.
          </p>
        </header>

        {/* 1-of-1 unique badges */}
        <section className="mb-16">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <Sparkles className="h-6 w-6 text-yellow-400" /> 1-of-1 Legendary Badges
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {uniques.map((u) => (
              <Card key={u.badge_key} className="border-yellow-500/30 bg-gradient-to-br from-yellow-950/40 to-black p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span className="text-lg font-semibold">{u.badge_label}</span>
                </div>
                <p className="mb-4 text-sm text-zinc-400">{u.description}</p>
                {u.owner ? (
                  <Link to={`/u/${u.owner.username}`} className="flex items-center gap-2 hover:underline">
                    {u.owner.avatar_url && (
                      <img src={u.owner.avatar_url} alt={u.owner.username ?? ""} className="h-8 w-8 rounded-full" />
                    )}
                    <span className="font-medium text-yellow-200">@{u.owner.username}</span>
                  </Link>
                ) : (
                  <span className="text-sm italic text-zinc-500">Unclaimed — win it to become the first owner.</span>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Tournament titles feed */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <Trophy className="h-6 w-6 text-yellow-400" /> Recent Title Awards
          </h2>
          {loading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : titles.length === 0 ? (
            <Card className="border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
              No titles awarded yet. <Link to="/tournaments" className="text-yellow-400 underline">Join a tournament</Link> and be the first.
            </Card>
          ) : (
            <div className="space-y-2">
              {titles.map((t) => (
                <Card key={t.id} className="flex items-center gap-4 border-zinc-800 bg-zinc-950/70 p-4 hover:bg-zinc-900">
                  <div className="shrink-0">{ICON[t.title_key] ?? <Trophy className="h-5 w-5 text-yellow-400" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={t.profile?.username ? `/u/${t.profile.username}` : "#"}
                        className={`font-semibold ${
                          t.profile?.username_style === "gold_animated"
                            ? "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent animate-pulse"
                            : ""
                        }`}
                      >
                        @{t.profile?.username ?? "player"}
                      </Link>
                      <Badge variant="outline" className="border-yellow-500/40 text-yellow-300">
                        {t.title_label}
                      </Badge>
                      {t.season && <span className="text-xs text-zinc-500">Season {t.season}</span>}
                    </div>
                    {t.metadata?.tournament_name && (
                      <p className="truncate text-sm text-zinc-400">{t.metadata.tournament_name}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-zinc-500">
                    {new Date(t.awarded_at).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
