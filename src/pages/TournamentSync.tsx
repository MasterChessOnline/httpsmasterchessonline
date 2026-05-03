/**
 * Tournament Sync Dashboard
 * Paste a Lichess or Chess.com tournament URL → fetch live standings + rounds.
 * Pure frontend integration (Lichess + Chess.com public APIs).
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Clock, RefreshCw, AlertTriangle, Link as LinkIcon, Search, Crown, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Standing {
  rank: number;
  username: string;
  rating?: number;
  score: number;
  wins?: number;
  draws?: number;
  losses?: number;
  performance?: number;
  title?: string;
}

interface RoundGame {
  white: string;
  black: string;
  result: string;
  whiteScore?: number;
  blackScore?: number;
}

interface TournamentData {
  source: "lichess" | "chesscom";
  id: string;
  name: string;
  status: "upcoming" | "live" | "finished";
  startsAt?: number;
  finishesAt?: number;
  nbPlayers: number;
  timeControl?: string;
  variant?: string;
  description?: string;
  standings: Standing[];
  rounds?: { round: number; games: RoundGame[] }[];
  url: string;
}

// ── Helpers: URL parsing ──
function parseTournamentUrl(input: string): { source: "lichess" | "chesscom"; id: string; type: "swiss" | "arena" | "tour" } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Lichess swiss: https://lichess.org/swiss/<id>
  const lswiss = trimmed.match(/lichess\.org\/swiss\/([a-zA-Z0-9]+)/);
  if (lswiss) return { source: "lichess", id: lswiss[1], type: "swiss" };
  // Lichess arena: https://lichess.org/tournament/<id>
  const larena = trimmed.match(/lichess\.org\/tournament\/([a-zA-Z0-9]+)/);
  if (larena) return { source: "lichess", id: larena[1], type: "arena" };
  // Chess.com tournament: https://www.chess.com/tournament/live/<slug>
  const ccm = trimmed.match(/chess\.com\/tournament\/(?:live\/)?([a-zA-Z0-9-_]+)/);
  if (ccm) return { source: "chesscom", id: ccm[1], type: "tour" };
  return null;
}

// ── Lichess fetchers ──
async function fetchLichessSwiss(id: string): Promise<TournamentData> {
  const meta = await fetch(`https://lichess.org/api/swiss/${id}`).then(r => {
    if (!r.ok) throw new Error("Tournament not found on Lichess.");
    return r.json();
  });
  // ndjson standings
  const standingsRes = await fetch(`https://lichess.org/api/swiss/${id}/results?nb=200`);
  const text = await standingsRes.text();
  const standings: Standing[] = text
    .split("\n").filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean)
    .map((r: any) => ({
      rank: r.rank, username: r.username, rating: r.rating,
      score: r.points, performance: r.performance, title: r.title,
    }));
  const now = Date.now();
  const startsAt = meta.startsAt ? new Date(meta.startsAt).getTime() : undefined;
  const finishesAt = meta.finishesAt ? new Date(meta.finishesAt).getTime() : undefined;
  const status: TournamentData["status"] =
    meta.status === "finished" ? "finished" :
    (startsAt && now < startsAt) ? "upcoming" : "live";
  return {
    source: "lichess", id, name: meta.name, status, startsAt, finishesAt,
    nbPlayers: meta.nbPlayers ?? standings.length,
    timeControl: meta.clock ? `${meta.clock.limit / 60}+${meta.clock.increment}` : undefined,
    variant: meta.variant, description: meta.description,
    standings, url: `https://lichess.org/swiss/${id}`,
  };
}

async function fetchLichessArena(id: string): Promise<TournamentData> {
  const meta = await fetch(`https://lichess.org/api/tournament/${id}`).then(r => {
    if (!r.ok) throw new Error("Tournament not found on Lichess.");
    return r.json();
  });
  const standings: Standing[] = (meta.standing?.players ?? []).map((p: any, i: number) => ({
    rank: i + 1, username: p.name, rating: p.rating, score: p.score,
    performance: p.performance, title: p.title,
  }));
  const now = Date.now();
  const startsAt = meta.startsAt ? new Date(meta.startsAt).getTime() : undefined;
  const finishesAt = meta.finishesAt ? new Date(meta.finishesAt).getTime() : undefined;
  const status: TournamentData["status"] =
    meta.isFinished ? "finished" :
    (startsAt && now < startsAt) ? "upcoming" : "live";
  return {
    source: "lichess", id, name: meta.fullName ?? meta.name, status, startsAt, finishesAt,
    nbPlayers: meta.nbPlayers ?? standings.length,
    timeControl: meta.clock ? `${meta.clock.limit / 60}+${meta.clock.increment}` : undefined,
    variant: meta.perf?.name, description: meta.description,
    standings, url: `https://lichess.org/tournament/${id}`,
  };
}

// ── Chess.com fetcher ──
async function fetchChessComTournament(slug: string): Promise<TournamentData> {
  const meta = await fetch(`https://api.chess.com/pub/tournament/${slug}`).then(r => {
    if (!r.ok) throw new Error("Tournament not found on Chess.com.");
    return r.json();
  });
  // Aggregate standings across all rounds/groups (top finishers list)
  const seen = new Map<string, Standing>();
  const players: any[] = meta.players ?? [];
  players.forEach((p, i) => {
    seen.set(p.username, {
      rank: i + 1, username: p.username, score: p.points ?? 0, rating: undefined,
      wins: p.wins, draws: p.draws, losses: p.losses,
    });
  });
  const standings = Array.from(seen.values())
    .sort((a, b) => (b.score - a.score) || a.username.localeCompare(b.username))
    .map((s, i) => ({ ...s, rank: i + 1 }));
  const status: TournamentData["status"] =
    meta.status === "finished" ? "finished" :
    meta.status === "in_progress" ? "live" : "upcoming";
  const startsAt = meta.start_time ? meta.start_time * 1000 : undefined;
  const finishesAt = meta.finish_time ? meta.finish_time * 1000 : undefined;
  return {
    source: "chesscom", id: slug, name: meta.name ?? slug, status, startsAt, finishesAt,
    nbPlayers: standings.length, timeControl: meta.settings?.time_class,
    variant: meta.settings?.rules, description: meta.description,
    standings, url: `https://www.chess.com/tournament/${slug}`,
  };
}

async function fetchTournament(parsed: ReturnType<typeof parseTournamentUrl>): Promise<TournamentData> {
  if (!parsed) throw new Error("Invalid URL.");
  if (parsed.source === "lichess" && parsed.type === "swiss") return fetchLichessSwiss(parsed.id);
  if (parsed.source === "lichess" && parsed.type === "arena") return fetchLichessArena(parsed.id);
  if (parsed.source === "chesscom") return fetchChessComTournament(parsed.id);
  throw new Error("Unsupported source.");
}

// ── Countdown component ──
function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return (
    <span className="font-mono tabular-nums">
      {d > 0 && <span>{d}d </span>}
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ── Main page ──
export default function TournamentSync() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const parsed = useMemo(() => parseTournamentUrl(url), [url]);

  const load = useCallback(async () => {
    setError(null); setLoading(true);
    try {
      const p = parseTournamentUrl(url);
      if (!p) throw new Error("Could not detect a Lichess or Chess.com tournament URL.");
      const td = await fetchTournament(p);
      setData(td);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load tournament. The API may be temporarily unavailable.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  // Auto-refresh live tournaments every 30s
  useEffect(() => {
    if (!data || data.status !== "live") return;
    const t = setInterval(() => { void load(); }, 30000);
    return () => clearInterval(t);
  }, [data, load]);

  const filteredStandings = useMemo(() => {
    if (!data) return [];
    const f = filter.trim().toLowerCase();
    if (!f) return data.standings;
    return data.standings.filter(s => s.username.toLowerCase().includes(f));
  }, [data, filter]);

  return (
    <div className="min-h-screen bg-[hsl(220,20%,10%)] text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MasterChess Tournament Sync</h1>
              <p className="text-xs text-muted-foreground">Paste a Lichess or Chess.com tournament URL — see standings, rounds, and a live countdown.</p>
            </div>
          </div>
        </div>

        {/* URL input */}
        <div className="rounded-xl border border-border/30 bg-[hsl(220,18%,15%)] p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://lichess.org/swiss/… or https://www.chess.com/tournament/…"
                className="pl-10 bg-[hsl(220,18%,18%)] border-border/40"
                onKeyDown={(e) => { if (e.key === "Enter") void load(); }}
              />
            </div>
            <Button onClick={() => void load()} disabled={loading || !parsed} className="bg-primary text-primary-foreground">
              {loading ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Loading…</> : <><Search className="w-4 h-4 mr-1" /> Sync</>}
            </Button>
          </div>
          {parsed && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Detected <span className="font-mono text-primary">{parsed.source}</span> · <span className="font-mono">{parsed.type}</span> · ID <span className="font-mono">{parsed.id}</span>
            </p>
          )}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
        </div>

        {!data && !loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Lichess Swiss", url: "https://lichess.org/swiss/…", color: "from-purple-500/20 to-purple-500/5" },
              { label: "Lichess Arena", url: "https://lichess.org/tournament/…", color: "from-blue-500/20 to-blue-500/5" },
              { label: "Chess.com Live Tournament", url: "https://www.chess.com/tournament/live/…", color: "from-emerald-500/20 to-emerald-500/5" },
              { label: "Chess.com Open", url: "https://www.chess.com/tournament/…", color: "from-amber-500/20 to-amber-500/5" },
            ].map((t, i) => (
              <div key={i} className={`rounded-xl border border-border/30 p-4 bg-gradient-to-br ${t.color}`}>
                <h3 className="text-sm font-semibold">{t.label}</h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-1 truncate">{t.url}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tournament view */}
        {data && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Meta card */}
            <div className="rounded-xl border border-border/30 bg-[hsl(220,18%,15%)] p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[10px] uppercase tracking-wider ${
                      data.status === "live" ? "bg-emerald-500 text-black" :
                      data.status === "upcoming" ? "bg-amber-500 text-black" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {data.status === "live" ? "● Live" : data.status === "upcoming" ? "Upcoming" : "Finished"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{data.source === "lichess" ? "Lichess" : "Chess.com"}</Badge>
                    {data.timeControl && <Badge variant="outline" className="text-[10px] font-mono">{data.timeControl}</Badge>}
                    {data.variant && <Badge variant="outline" className="text-[10px]">{data.variant}</Badge>}
                  </div>
                  <h2 className="text-xl font-bold mt-2">{data.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {data.nbPlayers} players</span>
                    {data.startsAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {data.status === "upcoming" ? <>Starts in <Countdown target={data.startsAt} /></> :
                         new Date(data.startsAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <a href={data.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-1">
                    Open source <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Standings */}
            <div className="rounded-xl border border-border/30 bg-[hsl(220,18%,15%)] overflow-hidden">
              <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Standings</h3>
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter players…"
                  className="h-8 max-w-xs bg-[hsl(220,18%,18%)] border-border/40 text-xs"
                />
              </div>
              {filteredStandings.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No standings available yet.</p>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[hsl(220,18%,12%)] text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left w-10">#</th>
                        <th className="px-3 py-2 text-left">Player</th>
                        <th className="px-3 py-2 text-right w-16">Rating</th>
                        <th className="px-3 py-2 text-right w-16">Score</th>
                        <th className="px-3 py-2 text-right w-20 hidden sm:table-cell">Perf.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStandings.map((s, i) => (
                        <tr key={`${s.username}-${i}`} className={`border-t border-border/10 hover:bg-[hsl(220,18%,18%)] ${s.rank <= 3 ? "bg-primary/5" : ""}`}>
                          <td className="px-3 py-2 font-mono">
                            {s.rank === 1 ? <Crown className="w-3.5 h-3.5 text-yellow-400 inline" /> : s.rank}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {s.title && <Badge className="mr-1.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/30">{s.title}</Badge>}
                            {s.username}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground">{s.rating ?? "—"}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold">{s.score}</td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground hidden sm:table-cell">{s.performance ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
