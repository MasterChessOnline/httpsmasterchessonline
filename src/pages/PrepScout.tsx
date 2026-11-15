import { useMemo, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { Chess } from "chess.js";
import { Search, Upload, Download, Share2, ChevronLeft, ChevronRight, RotateCcw, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { openingStats, parseScoutPgn, PREP_TOPICS, type ScoutGame, type ScoutPlayer, type ScoutReport } from "@/lib/prep-scout";

export default function PrepScout() {
  const [params, setParams] = useSearchParams();
  const { topic } = useParams();
  const guide = PREP_TOPICS.find(t => t.slug === topic);
  const [query, setQuery] = useState(params.get("q") || "");
  const [players, setPlayers] = useState<ScoutPlayer[]>([]);
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [color, setColor] = useState<"white" | "black">("white");
  const [active, setActive] = useState<ScoutGame | null>(null);
  const [ply, setPly] = useState(0);
  const [imported, setImported] = useState<ScoutGame[]>([]);
  const stats = useMemo(() => openingStats(report?.games || [], report?.player.name || "", color), [report, color]);
  const replay = useMemo(() => {
    const board = new Chess();
    if (!active) return { board, moves: [] as string[] };
    try {
      const full = new Chess(); full.loadPgn(active.pgn);
      const moves = full.history();
      const initial = full.getHeaders().FEN;
      if (initial) board.load(initial);
      for (const move of moves.slice(0, ply)) board.move(move);
      return { board, moves };
    } catch { return { board, moves: [] as string[] }; }
  }, [active, ply]);
  async function search() {
    setBusy(true); setNotice(""); setReport(null); setPlayers([]); setImported([]); setActive(null); setWarnings([]);
    setParams({ q: query.trim() });
    try {
      const { data, error } = await supabase.functions.invoke("prep-scout", { body: { action: "search", query: query.trim() } });
      if (error || data?.error) throw new Error(data?.error || "Search unavailable. Try again or import PGN.");
      setPlayers(data.players || []); setWarnings(data.warnings || []);
      if (!data.players?.length) setNotice("No matching player found. Try an exact account, official ID or PGN file.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Search unavailable."); }
    finally { setBusy(false); }
  }
  async function select(player: ScoutPlayer) {
    setActive(null); setReport(null); setNotice("");
    if (imported.length) { setReport({ player, games: imported, warnings: [], fetchedAt: new Date().toISOString() }); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("prep-scout", { body: { action: "report", id: player.id, kind: player.kind } });
      if (error || data?.error) throw new Error(data?.error || "Player report unavailable.");
      setReport(data); setWarnings([]);
    } catch (e) { setNotice(e instanceof Error ? e.message : "Report unavailable."); }
    finally { setBusy(false); }
  }
  async function importFile(file?: File) {
    if (!file) return;
    setReport(null); setActive(null); setNotice(""); setWarnings([]);
    if (file.size > 5 * 1024 * 1024) { setNotice("Choose a PGN file smaller than 5 MB."); return; }
    const { games, rejected } = parseScoutPgn(await file.text());
    setImported(games);
    const names = [...new Set(games.flatMap(g => [g.white, g.black]))].filter(n => n !== "Unknown");
    setPlayers(names.map((name, i) => ({ id: `import-${i}`, name, kind: "online" })));
    setNotice(games.length ? `${games.length} completed games imported. Choose the player.${rejected ? ` ${rejected} invalid or unfinished entries skipped.` : ""}` : "No valid completed games found in this file.");
  }
  function download() {
    if (!report?.games.length) return;
    const url = URL.createObjectURL(new Blob([report.games.map(g => g.pgn).join("\n\n")], { type: "application/x-chess-pgn" }));
    const a = document.createElement("a"); a.href = url; a.download = "masterchess-preparation.pgn"; a.click(); URL.revokeObjectURL(url);
  }
  return <div className="min-h-screen bg-background text-foreground pb-28">
    <Seo path={guide ? `/prep/${guide.slug}` : "/prep"} title={`${guide?.title || "Prep Scout — Chess Opponent Preparation"} | MasterChess`} description={guide?.description || "Search public chess players, inspect completed games, compare White and Black opening repertoires, and import PGN for tournament preparation."} />
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-primary text-xs font-semibold uppercase flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> New · Before the round</p>
        <h1 className="font-display text-4xl font-bold">Prep Scout</h1>
        <p className="text-muted-foreground max-w-2xl">{guide?.description || "Know your opponent. Their games. Their openings. Your preparation."}</p>
      </header>
      <section className="space-y-4" aria-label="Player search">
        <form onSubmit={e => { e.preventDefault(); void search(); }} className="flex gap-2 flex-wrap">
          <Input aria-label="Player name, account or official ID" placeholder="Player name, exact account or official ID" value={query} onChange={e => setQuery(e.target.value)} className="h-12 flex-1 min-w-[180px]" maxLength={80} />
          <Button type="submit" disabled={busy || query.trim().length < 2} className="h-12"><Search className="w-4 h-4 mr-2" /> Search</Button>
          <Button type="button" variant="outline" className="h-12" asChild><label className="cursor-pointer"><Upload className="w-4 h-4 mr-2" /> Import PGN<input aria-label="Import PGN file" type="file" accept=".pgn,.txt" className="sr-only" onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ""; }} /></label></Button>
        </form>
        <p className="text-xs text-muted-foreground">Public records only. Namesakes stay separate. Game coverage depends on the available archive; private databases are not included.</p>
        {guide && <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4">{guide.detail}</p>}
        {busy && <p role="status" className="flex items-center gap-2 text-primary"><Loader2 className="w-4 h-4 animate-spin" /> Searching public records…</p>}
        {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
        {warnings.map(w => <p key={w} className="text-sm text-muted-foreground">{w}</p>)}
        {!!players.length && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{players.map(p => <Button key={`${p.kind}-${p.id}`} variant="outline" disabled={busy} onClick={() => void select(p)} className="h-auto min-h-16 justify-between whitespace-normal text-left gap-2"><span className="min-w-0 break-words">{p.title && `${p.title} `}{p.name}<span className="block text-xs text-muted-foreground">{imported.length ? "PGN identity" : p.kind === "fide" ? `Official record · ${p.id}` : `Online account · ${p.id}`}</span></span><ArrowRight className="w-4 h-4 shrink-0" /></Button>)}</div>}
      </section>
      {report && <section className="space-y-6 border-t border-border pt-6" aria-label="Player report">
        <div className="flex justify-between gap-4 flex-wrap"><div><h2 className="font-display text-2xl font-bold">{report.player.title} {report.player.name}</h2><p className="text-xs text-muted-foreground">{report.games.length} completed games in this sample · Retrieved {new Date(report.fetchedAt).toLocaleDateString()}</p></div><div className="flex gap-2"><Button variant="outline" size="icon" title="Download PGN" aria-label="Download PGN" disabled={!report.games.length} onClick={download}><Download className="w-4 h-4" /></Button><Button variant="outline" size="icon" title="Copy search link" aria-label="Copy search link" onClick={async () => { try { await navigator.clipboard.writeText(`https://masterchess.live/prep?q=${encodeURIComponent(query || report.player.name)}`); setNotice("Search link copied."); } catch { setNotice("Could not copy link. Copy the address from your browser."); } }}><Share2 className="w-4 h-4" /></Button></div></div>
        {report.ratings && <dl className="flex gap-6 flex-wrap">{Object.entries(report.ratings).map(([key, value]) => <div key={key}><dt className="text-xs capitalize text-muted-foreground">{key}</dt><dd className="text-xl font-bold tabular-nums">{value}</dd></div>)}</dl>}
        {report.player.kind === "fide" && <a href={`https://ratings.fide.com/profile/${report.player.id}`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm underline">Official rating record</a>}
        {report.warnings.map(w => <p key={w} className="text-sm text-muted-foreground">{w}</p>)}
        <div className="flex gap-2"><Button variant={color === "white" ? "default" : "outline"} onClick={() => setColor("white")}>As White</Button><Button variant={color === "black" ? "default" : "outline"} onClick={() => setColor("black")}>As Black</Button></div>
        <h3 className="font-display text-lg font-semibold">Opening repertoire <span className="text-sm text-muted-foreground font-normal">· {stats.total} games as {color}</span></h3>
        {stats.total ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-muted-foreground border-b border-border"><tr>{["Opening", "Games", "Frequency", "W / D / L", "Score"].map(s => <th key={s} className="text-left py-3 pr-4 whitespace-nowrap">{s}</th>)}</tr></thead><tbody>{stats.openings.map(o => <tr key={`${o.eco}-${o.opening}`} className="border-b border-border/50"><td className="py-3 pr-4"><span className="text-primary mr-2">{o.eco}</span>{o.opening}</td><td>{o.games}</td><td>{o.frequency}%</td><td className="whitespace-nowrap">{o.wins} / {o.draws} / {o.losses}</td><td>{o.score}%</td></tr>)}</tbody></table></div> : <p className="text-muted-foreground text-sm">No completed games for this side in the available sample.</p>}
        {!!report.games.length && <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2"><h3 className="font-semibold">Games & events</h3><div className="max-h-[480px] overflow-y-auto space-y-2">{report.games.filter(g => g[color].toLowerCase() === report.player.name.toLowerCase()).map(g => <Button key={g.id} variant={active?.id === g.id ? "secondary" : "outline"} className="h-auto w-full py-3 text-left justify-start whitespace-normal" onClick={() => { setActive(g); setPly(0); }}><span><span className="block">{g.white} — {g.black} · {g.result}</span><span className="text-xs text-muted-foreground">{g.date} · {g.event}</span></span></Button>)}</div></div>
          {active && <div className="min-w-0 space-y-3"><ChessBoard game={replay.board} flipped={color === "black"} selectedSquare={null} legalMoves={[]} lastMove={null} isGameOver={false} isPlayerTurn={false} onSquareClick={() => {}} /><div className="flex items-center justify-center gap-3"><Button size="icon" variant="outline" aria-label="Restart replay" onClick={() => setPly(0)}><RotateCcw className="w-4 h-4" /></Button><Button size="icon" variant="outline" aria-label="Previous move" disabled={!ply} onClick={() => setPly(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button><span className="text-xs tabular-nums">{ply} / {replay.moves.length}</span><Button size="icon" variant="outline" aria-label="Next move" disabled={ply >= replay.moves.length} onClick={() => setPly(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button></div><p className="text-sm break-words text-muted-foreground">{replay.moves.slice(0, ply).join(" ") || "Starting position"}</p></div>}
        </div>}
      </section>}
      <nav aria-label="Preparation topics" className="border-t border-border pt-6 grid sm:grid-cols-2 gap-4">{PREP_TOPICS.map(t => <Link key={t.slug} to={`/prep/${t.slug}`} className="text-sm text-primary hover:underline">{t.title} <ArrowRight className="inline w-3 h-3" /></Link>)}</nav>
    </main>
  </div>;
}