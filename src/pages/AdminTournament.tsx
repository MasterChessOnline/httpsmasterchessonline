import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Play, FlagOff, Trophy, Download, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Tournament = any;
type Pairing = any;
type Registration = any;

export default function AdminTournament() {
  const { id = "" } = useParams();
  const [t, setT] = useState<Tournament | null>(null);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const load = async () => {
    const [{ data: tData }, { data: rData }, { data: pData }] = await Promise.all([
      supabase.from("tournaments").select("*").eq("id", id).maybeSingle(),
      supabase.from("tournament_registrations").select("*").eq("tournament_id", id).order("score", { ascending: false }),
      supabase.from("tournament_pairings").select("*").eq("tournament_id", id).order("round").order("id"),
    ]);
    setT(tData);
    setRegs(rData ?? []);
    setPairings(pData ?? []);

    // Authorization check
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setAuthorized(false); return; }
    const { data: ok } = await supabase.rpc("is_tournament_admin" as any, { _user: u.user.id, _tid: id });
    setAuthorized(Boolean(ok));
  };

  useEffect(() => { load(); }, [id]);

  // Realtime refresh
  useEffect(() => {
    const ch = supabase
      .channel(`admin-t-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_pairings", filter: `tournament_id=eq.${id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_registrations", filter: `tournament_id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const callEngine = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("tournament-engine", {
        body: { tournament_id: id, action, ...extra },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`${action} ✓`);
      if (action === "validate") setValidation(data);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setBusy(null);
    }
  };

  const exportFormat = async (format: "trf" | "pgn" | "csv") => {
    setBusy(`export-${format}`);
    try {
      const { data, error } = await supabase.functions.invoke("tournament-export", {
        body: { tournament_id: id, format },
      });
      if (error) throw error;
      const blob = new Blob([typeof data === "string" ? data : JSON.stringify(data)], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `tournament-${id}.${format}`; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally { setBusy(null); }
  };

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground mt-2">Only the organizer or super admins can manage this tournament.</p>
          <Link to="/tournaments" className="text-amber-400 underline mt-4 inline-block">Back to tournaments</Link>
        </div>
      </div>
    );
  }
  if (!t || authorized === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  const roundsByNum: Record<number, Pairing[]> = {};
  for (const p of pairings) (roundsByNum[p.round] ??= []).push(p);

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Admin · {t.name}</title></Helmet>

      <header className="border-b border-amber-500/15 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400">Tournament Control</div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{t.name}</h1>
            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
              <span>Status: <Badge variant="outline">{t.status}</Badge></span>
              <span>Round: {t.current_round}/{t.total_rounds}</span>
              <span>Players: {regs.length}</span>
              {t.registration_locked_at && <span className="text-amber-400">Roster locked</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => callEngine("validate")} disabled={busy !== null}>
              <RefreshCw className="w-4 h-4 mr-1" /> Validate
            </Button>
            {!t.registration_locked_at && (
              <Button size="sm" onClick={() => callEngine("lock_registration")} disabled={busy !== null}>
                <Lock className="w-4 h-4 mr-1" /> Lock registration
              </Button>
            )}
            {t.registration_locked_at && t.current_round < t.total_rounds && t.status !== "finished" && (
              <Button size="sm" className="bg-amber-500 text-black hover:bg-amber-400"
                onClick={() => callEngine("start_next_round")} disabled={busy !== null}>
                <Play className="w-4 h-4 mr-1" /> Start round {t.current_round + 1}
              </Button>
            )}
            {t.current_round > 0 && t.status !== "finished" && (
              <Button size="sm" variant="outline" onClick={() => callEngine("close_round", { round: t.current_round })} disabled={busy !== null}>
                <FlagOff className="w-4 h-4 mr-1" /> Close round
              </Button>
            )}
            {t.status !== "finished" && t.current_round >= t.total_rounds && (
              <Button size="sm" variant="default" onClick={() => callEngine("finalize")} disabled={busy !== null}>
                <Trophy className="w-4 h-4 mr-1" /> Finalize
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {validation && (
          <Card className="p-4 mb-4 border-amber-500/20">
            <div className="text-sm font-semibold mb-2">Pre-round validation</div>
            <ul className="text-sm space-y-1">
              {validation.checks?.checks?.map((c: any) => (
                <li key={c.key} className="flex items-center gap-2">
                  {c.ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  <span>{c.key.replace(/_/g, " ")}</span>
                  {c.detail && <span className="text-muted-foreground text-xs">{JSON.stringify(c.detail)}</span>}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Tabs defaultValue="standings" className="w-full">
          <TabsList>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="players">Players ({regs.length})</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="standings" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase">
                  <tr>
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Player</th>
                    <th className="text-right p-2">Pts</th>
                    <th className="text-right p-2">Buch</th>
                    <th className="text-right p-2">BH C1</th>
                    <th className="text-right p-2">SB</th>
                    <th className="text-right p-2">Prog</th>
                    <th className="text-right p-2">Wins</th>
                    <th className="text-right p-2">Perf</th>
                  </tr>
                </thead>
                <tbody>
                  {regs.map((r, i) => (
                    <tr key={r.id} className="border-t border-border/40">
                      <td className="p-2 text-muted-foreground">{i + 1}</td>
                      <td className="p-2 font-medium">{r.display_name_at_join || r.user_id?.slice(0, 8)}</td>
                      <td className="p-2 text-right">{r.score}</td>
                      <td className="p-2 text-right">{Number(r.buchholz ?? 0).toFixed(1)}</td>
                      <td className="p-2 text-right">{Number(r.buchholz_cut1 ?? 0).toFixed(1)}</td>
                      <td className="p-2 text-right">{Number(r.sonneborn ?? 0).toFixed(2)}</td>
                      <td className="p-2 text-right">{Number(r.progressive_score ?? 0).toFixed(1)}</td>
                      <td className="p-2 text-right">{r.wins ?? 0}</td>
                      <td className="p-2 text-right">{r.performance_rating ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="rounds" className="mt-4 space-y-4">
            {Object.keys(roundsByNum).sort((a, b) => Number(b) - Number(a)).map((r) => (
              <Card key={r} className="p-4">
                <div className="font-semibold mb-2">Round {r}</div>
                <table className="w-full text-sm">
                  <tbody>
                    {roundsByNum[Number(r)].map((p, i) => (
                      <tr key={p.id} className="border-t border-border/30">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2">{p.white_player_id?.slice(0, 8)}</td>
                        <td className="p-2 text-center font-mono">{p.result ?? "—"}</td>
                        <td className="p-2">{p.black_player_id ? p.black_player_id.slice(0, 8) : <em className="text-amber-400">BYE</em>}</td>
                        <td className="p-2 text-xs text-muted-foreground">{p.end_reason ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="players" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase">
                  <tr>
                    <th className="text-left p-2">Player</th>
                    <th className="text-left p-2">FIDE ID</th>
                    <th className="text-left p-2">Country</th>
                    <th className="text-right p-2">Rating</th>
                    <th className="text-center p-2">Checked in</th>
                  </tr>
                </thead>
                <tbody>
                  {regs.map((r) => (
                    <tr key={r.id} className="border-t border-border/40">
                      <td className="p-2">{r.display_name_at_join}</td>
                      <td className="p-2 text-xs text-muted-foreground">{r.fide_id ?? "—"}</td>
                      <td className="p-2">{r.country_code ?? "—"}</td>
                      <td className="p-2 text-right">{r.rating_at_join ?? "—"}</td>
                      <td className="p-2 text-center">{r.checked_in ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <Card className="p-6 space-y-3">
              <div className="text-sm text-muted-foreground">Export results for FIDE submission, Chess-Results upload, or PGN archive.</div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => exportFormat("trf")} disabled={busy !== null}>
                  <Download className="w-4 h-4 mr-1" /> TRF16 (FIDE)
                </Button>
                <Button onClick={() => exportFormat("csv")} disabled={busy !== null} variant="outline">
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
                <Button onClick={() => exportFormat("pgn")} disabled={busy !== null} variant="outline">
                  <Download className="w-4 h-4 mr-1" /> PGN bundle
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
