// /dragan-brakus/live — public live standings page.
// Auto-refreshes every 15s, indexable, no login required.
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, RefreshCw, Download, CheckCircle2, Mail, MailWarning } from "lucide-react";

type Row = {
  registration_id?: string;
  user_id?: string;
  rank?: number;
  score: number;
  buchholz: number;
  buchholz_cut1: number;
  progressive_score: number;
  performance_rating: number | null;
  wins: number;
  first_name: string | null;
  last_name: string | null;
  federation: string | null;
  fide_title: string | null;
  rating_at_join: number;
  fide_verified: boolean | null;
  fide_blitz_rating: number | null;
};


export default function DraganBrakusLive() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [t, setT] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const registered = searchParams.get("registered") === "1";
  const emailState = searchParams.get("email");
  const highlightRegistrationId = searchParams.get("rid");

  async function load() {
    let id = params.id || tournamentId;
    if (!id) {
      const { data } = await supabase
        .from("tournaments").select("*")
        .ilike("name", "%Dragan Brakus%")
        .order("starts_at", { ascending: false }).limit(1).maybeSingle();
      if (!data) { setLoading(false); return; }
      id = data.id; setT(data); setTournamentId(id);
    } else if (!t) {
      const { data } = await supabase.from("tournaments").select("*").eq("id", id).single();
      setT(data);
    }
    const { data: rpcRows, error: rpcError } = await (supabase as any)
      .rpc("get_public_tournament_standings", { p_tournament_id: id });

    let regs = rpcRows;
    if (rpcError) {
      const { data: fallbackRows } = await supabase
        .from("tournament_registrations")
        .select("id, user_id, score, buchholz, buchholz_cut1, progressive_score, performance_rating, wins, first_name, last_name, federation, fide_title, rating_at_join, fide_verified, fide_blitz_rating")
        .eq("tournament_id", id);
      regs = fallbackRows?.map((row: any) => ({ ...row, registration_id: row.id })) || [];
    }

    const sorted = (regs || []).sort((a: any, b: any) => {
      const aRating = a.fide_blitz_rating || a.rating_at_join || 0;
      const bRating = b.fide_blitz_rating || b.rating_at_join || 0;
      const hasPlayed = [a.score, b.score, a.buchholz_cut1, b.buchholz_cut1, a.buchholz, b.buchholz, a.progressive_score, b.progressive_score]
        .some((v) => Number(v || 0) > 0);
      if (!hasPlayed) return bRating - aRating;
      return b.score - a.score ||
        b.buchholz_cut1 - a.buchholz_cut1 ||
        b.buchholz - a.buchholz ||
        b.progressive_score - a.progressive_score ||
        bRating - aRating;
    }) as Row[];
    setRows(sorted);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
    // eslint-disable-next-line
  }, [tournamentId]);

  const SITE = "https://masterchess.live";
  const jsonLd = t ? {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: t.name,
    startDate: t.starts_at,
    eventStatus: t.status === "active" ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled",
    url: `${SITE}/dragan-brakus/live`,
  } : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Dragan Brakus Cup — Live Standings"
        description="Live standings, Buchholz tie-breaks and crosstable for the Dragan Brakus Cup on MasterChess. Auto-refreshes every 15 seconds."
        path="/dragan-brakus/live"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 mb-2">LIVE</Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Dragan Brakus Cup — Live</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t ? `Round ${t.current_round} / ${t.total_rounds} · ${rows.length} players` : "Loading…"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>

        {registered && (
          <Card className="mb-5 border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="font-bold">You are registered.</p>
                  <p className="text-sm text-emerald-100/80">Your name and Blitz rating are now on the standings list.</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-emerald-300/30 px-3 py-2 text-xs font-semibold">
                {emailState === "sent" ? <Mail className="h-4 w-4" /> : <MailWarning className="h-4 w-4" />}
                {emailState === "sent" ? "Confirmation email sent" : "Registered — email pending"}
              </div>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Player</th>
                  <th className="px-3 py-2 text-left">Fed</th>
                  <th className="px-3 py-2 text-right">Rtg</th>
                  <th className="px-3 py-2 text-right">Pts</th>
                  <th className="px-3 py-2 text-right">BHC1</th>
                  <th className="px-3 py-2 text-right">Buch</th>
                  <th className="px-3 py-2 text-right">Prog</th>
                  <th className="px-3 py-2 text-right">Perf</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>}
                {!loading && rows.length === 0 && !user && !authLoading && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                      Sign in to view the participant list. <Link to={`/login?redirect=${encodeURIComponent("/dragan-brakus/live")}`} className="text-yellow-400 underline">Login</Link>
                    </td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (user || authLoading) && (
                  <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">No players visible yet. <Link to="/dragan-brakus/register" className="text-yellow-400 underline">Register now</Link>.</td></tr>
                )}
                {rows.map((r, i) => {
                  const name = [r.last_name, r.first_name].filter(Boolean).join(", ") || "Player";
                  const highlighted = Boolean(highlightRegistrationId && r.registration_id === highlightRegistrationId);
                  return (
                    <tr key={r.registration_id || r.user_id || i} className={`border-t border-white/5 hover:bg-white/5 ${highlighted ? "bg-emerald-400/10" : ""}`}>
                      <td className="px-3 py-2 font-semibold">{i === 0 ? <Trophy className="h-4 w-4 text-yellow-400 inline" /> : (r.rank || i + 1)}</td>
                      <td className="px-3 py-2">
                        {r.fide_title && <span className="text-yellow-400 font-bold mr-1">{r.fide_title}</span>}
                        {name}
                        {r.fide_verified && (
                          <span title="Official FIDE Player Verified" className="ml-1.5 inline-flex items-center gap-0.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 align-middle">
                            ✓ FIDE
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{r.federation || ""}</td>
                      <td className="px-3 py-2 text-right">
                        {r.fide_blitz_rating ? <span className="text-emerald-300 font-semibold">{r.fide_blitz_rating}</span> : r.rating_at_join}
                      </td>

                      <td className="px-3 py-2 text-right font-bold">{Number(r.score).toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">{Number(r.buchholz_cut1).toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">{Number(r.buchholz).toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">{Number(r.progressive_score).toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">{r.performance_rating ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {tournamentId && (
          <div className="mt-6 flex flex-wrap gap-2">
            {(["trf", "pgn", "csv-standings", "csv-crosstable"] as const).map((fmt) => (
              <a key={fmt} className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                 href={`https://kicabdwgdyabibioycbq.supabase.co/functions/v1/tournament-export?tournament_id=${tournamentId}&format=${fmt}`}
                 target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" /> {fmt.toUpperCase()}
              </a>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Before round 1 players are seeded by FIDE Blitz rating. Pairings use Swiss top-half vs bottom-half inside each score group: 100 players → top 50 vs bottom 50; after every round, players with the same points are sorted by rating and paired the same way. Standings tie-breaks: Points → Buchholz Cut 1 → Buchholz → Progressive → Blitz rating.
        </p>
      </main>
      <Footer />
    </div>
  );
}
