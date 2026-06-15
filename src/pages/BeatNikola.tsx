import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Crown, Swords, Trophy, Skull, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import nikolaAvatar from "@/assets/nikola-bot-avatar.jpg";
import serbiaFlag from "@/assets/serbia-flag.png.asset.json";

interface LeaderRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  rating: number | null;
  move_count: number;
  time_control_label: string;
  created_at: string;
}

/**
 * /beat-nikola — viral landing.
 * Single CTA: launch a game against the strongest bot on the site (Nikola,
 * uncapped Stockfish). Live "X tried, Y beat" counter + Wall of Fame, both
 * pulled from real bot_games via SECURITY DEFINER RPCs (no fake numbers).
 */
export default function BeatNikola() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ attempts: number; wins: number } | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, l] = await Promise.all([
        supabase.rpc("get_beat_nikola_stats"),
        supabase.rpc("get_beat_nikola_leaderboard", { _limit: 50 }),
      ]);
      if (cancelled) return;
      if (s.data && Array.isArray(s.data) && s.data[0]) {
        setStats({
          attempts: Number(s.data[0].attempts ?? 0),
          wins: Number(s.data[0].wins ?? 0),
        });
      } else {
        setStats({ attempts: 0, wins: 0 });
      }
      setLeaders((l.data as LeaderRow[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startChallenge = () => {
    try {
      sessionStorage.setItem(
        "play-from-position",
        JSON.stringify({
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          botId: "nikola-sakotic",
          playerColor: "w",
        }),
      );
    } catch {
      /* ignore */
    }
    navigate("/play");
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/beat-nikola` : "";
    const text = "I'm trying to beat a 13-year-old's 3500-rated chess bot. Can you?";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Beat Nikola — MasterChess", text, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      /* ignore */
    }
  };

  const winRate =
    stats && stats.attempts > 0 ? ((stats.wins / stats.attempts) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Beat Nikola — Can you defeat the 13-year-old founder's chess bot?"
        description="MasterChess founder Nikola Šakotić (13 yo, 3500 rated) challenges you. Real stats, public leaderboard. No signup needed to try."
        path="/beat-nikola"
        type="website"
      />
      <Navbar />

      <main className="container mx-auto px-4 pt-20 pb-24 max-w-4xl">
        {/* ── HERO ── */}
        <section className="relative rounded-3xl border border-primary/40 bg-gradient-to-br from-amber-500/10 via-card/60 to-background p-6 sm:p-10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_right,hsl(43_90%_55%/0.25),transparent_60%)]" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <img
              src={nikolaAvatar}
              alt="Nikola Šakotić, 13-year-old founder of MasterChess"
              width={160}
              height={160}
              className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl object-cover ring-2 ring-primary/60 shadow-2xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center justify-center sm:justify-start gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm overflow-hidden ring-1 ring-foreground/10">
                  <img src={serbiaFlag.url} alt="Serbia" className="w-full h-full object-cover" />
                </span>
                Nikola Sakotić · Founder · 3500
              </p>
              <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight mt-2 leading-[1.05]">
                Beat <span className="text-gradient-gold">Nikola</span>.
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl">
                I'm 13. I built this whole site. My bot plays at full Stockfish strength — no
                blunders, no inaccuracies. Most people get crushed in under 25 moves. Think you're
                different?
              </p>
            </div>
          </div>

          {/* ── LIVE STATS ── */}
          <div className="relative mt-6 grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border border-border/30 bg-card/60 p-3 sm:p-4 text-center">
              <Swords className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="font-mono text-xl sm:text-3xl font-bold text-foreground">
                {loading ? "—" : stats?.attempts.toLocaleString() ?? 0}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-0.5">
                Tried
              </p>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 sm:p-4 text-center">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="font-mono text-xl sm:text-3xl font-bold text-primary">
                {loading ? "—" : stats?.wins.toLocaleString() ?? 0}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-primary/80 mt-0.5">
                Beat me
              </p>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 sm:p-4 text-center">
              <Skull className="h-4 w-4 mx-auto mb-1 text-destructive" />
              <p className="font-mono text-xl sm:text-3xl font-bold text-destructive">
                {loading ? "—" : `${winRate}%`}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-destructive/80 mt-0.5">
                Win rate
              </p>
            </div>
          </div>

          {/* ── PRIMARY CTA ── */}
          <div className="relative mt-6 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            <Button
              onClick={startChallenge}
              size="lg"
              className="h-14 px-10 text-base font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg"
            >
              <Crown className="h-5 w-5 mr-2" />
              Try Me Now
            </Button>
            <Button
              onClick={share}
              size="lg"
              variant="outline"
              className="h-14 px-6 text-base border-border/40 hover:bg-muted/20 rounded-xl"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Dare a friend
            </Button>
          </div>
        </section>

        {/* ── WALL OF FAME ── */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-5">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-bold uppercase tracking-wider">
              Wall of Fame
            </h2>
            <span className="text-xs text-muted-foreground ml-auto">
              {leaders.length} {leaders.length === 1 ? "winner" : "winners"}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/40 bg-card/30 p-8 text-center">
              <Skull className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-display text-lg font-bold">Nobody. Has. Beaten me. Yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first. Your name goes here, permanently.
              </p>
            </div>
          ) : (
            <ol className="space-y-2">
              {leaders.map((row, i) => (
                <li key={`${row.user_id}-${row.created_at}`}>
                  <Link
                    to={`/u/${encodeURIComponent(row.display_name ?? row.user_id)}`}
                    className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/40 p-3 hover:border-primary/40 hover:bg-card/60 transition-colors"
                  >
                    <span className="w-6 text-center text-xs font-mono font-bold text-muted-foreground shrink-0">
                      #{i + 1}
                    </span>
                    {row.avatar_url ? (
                      <img
                        src={row.avatar_url}
                        alt=""
                        loading="lazy"
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-border/50 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center text-primary font-bold text-sm shrink-0">
                        {(row.display_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {row.display_name ?? "Player"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {row.rating ? `${row.rating} ELO · ` : ""}
                        {row.move_count} moves · {row.time_control_label}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
