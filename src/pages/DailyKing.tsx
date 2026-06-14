import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Crown, TrendingUp, Calendar, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface KingRow {
  reign_date: string;
  user_id: string;
  rating_gain: number;
  games_played: number;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

export default function DailyKing() {
  const [rows, setRows] = useState<KingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: kings } = await supabase
        .from("daily_kings" as any)
        .select("*")
        .order("reign_date", { ascending: false })
        .limit(30);
      const list = (kings as unknown as KingRow[]) ?? [];
      const ids = Array.from(new Set(list.map((k) => k.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
        list.forEach((k) => {
          const p = map.get(k.user_id);
          if (p) {
            k.username = p.username;
            k.display_name = p.display_name;
            k.avatar_url = p.avatar_url;
          }
        });
      }
      setRows(list);
      setLoading(false);
    })();
  }, []);

  const today = rows[0];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Daily King · MasterChess</title>
        <meta name="description" content="The MasterChess player who gained the most ELO in the last 24 hours wears the crown today." />
        <link rel="canonical" href="https://masterchess.live/daily-king" />
      </Helmet>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <Crown className="mx-auto h-14 w-14 text-[#f3d97a] drop-shadow-[0_0_20px_rgba(243,217,122,0.6)] mb-3" fill="currentColor" />
          <h1 className="text-4xl sm:text-5xl font-display font-black bg-gradient-to-r from-[#f3d97a] to-[#d4a843] bg-clip-text text-transparent">
            Daily King
          </h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            One crown a day. Goes to whoever climbed the most ELO yesterday (min 3 games).
            The reigning king gets a gold crown next to their name across the whole site.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : today ? (
          <>
            <Link
              to={`/u/${today.username || today.user_id}`}
              className="block rounded-3xl border border-[#d4a843]/50 bg-gradient-to-br from-[#1a1408] via-[#2a1f0a] to-[#15110a] p-8 shadow-[0_0_60px_rgba(212,168,67,0.2)] hover:shadow-[0_0_80px_rgba(243,217,122,0.35)] transition-all"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#d4a843] mb-2">Reigning today</div>
              <div className="flex items-center gap-4">
                {today.avatar_url ? (
                  <img src={today.avatar_url} alt="" className="h-20 w-20 rounded-full ring-2 ring-[#f3d97a]" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[#d4a843]/20 ring-2 ring-[#f3d97a]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-3xl font-display font-bold truncate">
                    {today.display_name || today.username || "Anonymous"}
                  </div>
                  <div className="text-sm text-muted-foreground">@{today.username || "anon"}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="h-4 w-4" /> +{today.rating_gain} ELO
                    </span>
                    <span className="text-muted-foreground">· {today.games_played} games</span>
                  </div>
                </div>
                <Crown className="h-12 w-12 text-[#f3d97a]" fill="currentColor" />
              </div>
            </Link>

            <h2 className="mt-12 mb-4 text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Past kings (last 30 days)
            </h2>
            <div className="space-y-2">
              {rows.slice(1).map((k) => (
                <Link
                  key={k.reign_date}
                  to={`/u/${k.username || k.user_id}`}
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 px-4 py-3 hover:border-[#d4a843]/40 hover:bg-card/60 transition-colors"
                >
                  <div className="w-24 text-xs text-muted-foreground tabular-nums">
                    {new Date(k.reign_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  {k.avatar_url ? (
                    <img src={k.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted" />
                  )}
                  <div className="flex-1 truncate font-medium">
                    {k.display_name || k.username || "Anonymous"}
                  </div>
                  <div className="text-sm text-emerald-400 tabular-nums">+{k.rating_gain}</div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Crown className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p>No king has been crowned yet. Play 3+ ranked games today to be tomorrow's first king.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
