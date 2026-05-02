import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Swords, Trophy, TrendingUp, Calendar, ArrowLeft,
  Clock, Eye, Search, Star, X, Brain,
} from "lucide-react";
import { detectOpening, formatOpeningLabel } from "@/lib/openings-detector";
import { Chess } from "chess.js";

interface GameRecord {
  id: string;
  result: string | null;
  status: string;
  created_at: string;
  time_control_label: string;
  white_player_id: string;
  black_player_id: string;
  pgn: string;
}

interface BotGameRecord {
  id: string;
  bot_name: string;
  bot_rating: number;
  player_color: "w" | "b";
  result: string;
  outcome: "win" | "loss" | "draw";
  pgn: string;
  move_count: number;
  time_control_label: string;
  rating_change: number | null;
  created_at: string;
}

interface OpponentProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  rating: number;
  country_flag: string | null;
}

const FAV_KEY = "chess-fav-games";
const FILTER_KEY = "chess-history-filters";
const SOURCE_KEY = "chess-history-source";

type ResultFilter = "all" | "wins" | "losses" | "draws" | "favorites";
type SortMode = "newest" | "oldest";
type HistorySource = "online" | "bot";

const PAGE_SIZE = 10;

const GameHistory = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [botGames, setBotGames] = useState<BotGameRecord[]>([]);
  const [opponents, setOpponents] = useState<Record<string, OpponentProfile>>({});
  const [fetching, setFetching] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [source, setSource] = useState<HistorySource>(() => {
    try {
      const v = localStorage.getItem(SOURCE_KEY);
      if (v === "bot" || v === "online") return v;
    } catch {}
    return "online";
  });

  // Persist source tab
  useEffect(() => {
    try { localStorage.setItem(SOURCE_KEY, source); } catch {}
    // Reset paging whenever the user switches tabs
    setVisibleCount(PAGE_SIZE);
  }, [source]);

  // Filters (persisted)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [sort, setSort] = useState<SortMode>("newest");

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load persisted filters + favorites
  useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
      if (f.resultFilter) setResultFilter(f.resultFilter);
      if (f.sort) setSort(f.sort);
    } catch {}
    try {
      const fav = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      setFavorites(new Set(fav));
    } catch {}
  }, []);

  // Persist filters
  useEffect(() => {
    localStorage.setItem(FILTER_KEY, JSON.stringify({ resultFilter, sort }));
  }, [resultFilter, sort]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);

    // Fetch both online + bot games in parallel so switching tabs is instant.
    Promise.all([
      supabase
        .from("online_games")
        .select("id, result, status, created_at, time_control_label, white_player_id, black_player_id, pgn")
        .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("bot_games" as any)
        .select("id, bot_name, bot_rating, player_color, result, outcome, pgn, move_count, time_control_label, rating_change, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]).then(async ([online, bots]) => {
      const list = (online.data as GameRecord[]) || [];
      setGames(list);
      setBotGames(((bots.data as unknown) as BotGameRecord[]) || []);

      // Fetch opponent profiles (only for online games)
      const opponentIds = Array.from(
        new Set(list.map((g) => (g.white_player_id === user.id ? g.black_player_id : g.white_player_id)))
      );
      if (opponentIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url, rating, country_flag")
          .in("user_id", opponentIds);
        const map: Record<string, OpponentProfile> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p; });
        setOpponents(map);
      }
      setFetching(false);
    });
  }, [user]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const getOpening = (pgn: string): string | null => {
    if (!pgn) return null;
    try {
      const c = new Chess();
      c.loadPgn(pgn);
      const moves = c.history();
      const op = detectOpening(moves.slice(0, 12));
      return op ? formatOpeningLabel(op) : null;
    } catch { return null; }
  };

  const enrichedOnline = useMemo(() => {
    if (!user) return [];
    return games.map((g) => {
      const isWhite = g.white_player_id === user.id;
      const opponentId = isWhite ? g.black_player_id : g.white_player_id;
      const opponent = opponents[opponentId];
      const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
      const drew = g.result === "1/2-1/2";
      const lost = !won && !drew;
      const opening = getOpening(g.pgn);
      return {
        kind: "online" as const,
        id: g.id,
        created_at: g.created_at,
        time_control_label: g.time_control_label,
        result_str: g.result,
        won, drew, lost, opening,
        isWhite,
        opponent,
        pgn: g.pgn,
      };
    });
  }, [games, opponents, user]);

  const enrichedBot = useMemo(() => {
    return botGames.map((b) => {
      const won = b.outcome === "win";
      const drew = b.outcome === "draw";
      const lost = b.outcome === "loss";
      const opening = getOpening(b.pgn);
      return {
        kind: "bot" as const,
        id: b.id,
        created_at: b.created_at,
        time_control_label: b.time_control_label,
        result_str: b.result,
        won, drew, lost, opening,
        isWhite: b.player_color === "w",
        bot_name: b.bot_name,
        bot_rating: b.bot_rating,
        rating_change: b.rating_change,
        move_count: b.move_count,
        pgn: b.pgn,
      };
    });
  }, [botGames]);

  type EnrichedEntry =
    | typeof enrichedOnline[number]
    | typeof enrichedBot[number];
  const enriched: EnrichedEntry[] =
    source === "online" ? enrichedOnline : enrichedBot;

  const filtered = useMemo(() => {
    let list = enriched;
    if (resultFilter === "wins") list = list.filter((e) => e.won);
    else if (resultFilter === "losses") list = list.filter((e) => e.lost);
    else if (resultFilter === "draws") list = list.filter((e) => e.drew);
    else if (resultFilter === "favorites") list = list.filter((e) => favorites.has(e.id));

    if (debouncedSearch) {
      list = list.filter((e) => {
        const name = e.kind === "online"
          ? (e.opponent?.display_name || e.opponent?.username || "").toLowerCase()
          : e.bot_name.toLowerCase();
        const op = (e.opening || "").toLowerCase();
        return name.includes(debouncedSearch) || op.includes(debouncedSearch) ||
          e.time_control_label.toLowerCase().includes(debouncedSearch);
      });
    }

    if (sort === "oldest") list = [...list].reverse();
    return list;
  }, [enriched, resultFilter, debouncedSearch, sort, favorites]);

  // Group by Today / Yesterday / Older
  const groups = useMemo(() => {
    const today: typeof filtered = [];
    const yesterday: typeof filtered = [];
    const older: typeof filtered = [];
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startYesterday = startToday - 86400000;
    filtered.slice(0, visibleCount).forEach((e) => {
      const t = new Date(e.created_at).getTime();
      if (t >= startToday) today.push(e);
      else if (t >= startYesterday) yesterday.push(e);
      else older.push(e);
    });
    return { today, yesterday, older };
  }, [filtered, visibleCount]);

  const winCount = enriched.filter((e) => e.won).length;
  const lossCount = enriched.filter((e) => e.lost).length;
  const drawCount = enriched.filter((e) => e.drew).length;

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const renderCard = (e: EnrichedEntry) => {
    const { won, drew, opening, isWhite } = e;
    const date = new Date(e.created_at);
    const isFav = favorites.has(e.id);

    // Bot game vs Online game — different metadata, same shell
    const isBot = e.kind === "bot";
    const opponent = !isBot ? e.opponent : null;
    const initials = isBot
      ? "🤖"
      : (opponent?.display_name || opponent?.username || "?").slice(0, 2).toUpperCase();
    const displayName = isBot
      ? e.bot_name
      : (opponent?.display_name || opponent?.username || "Opponent");
    const displayRating = isBot ? e.bot_rating : opponent?.rating;

    // Bot games go to /analysis?pgn=… (no DB row id mapping); online go to ?game=
    const href = isBot
      ? `/analysis?pgn=${encodeURIComponent(e.pgn || "")}`
      : `/analysis?game=${e.id}`;

    return (
      <Link
        to={href}
        key={e.id}
        className="group flex items-center justify-between rounded-xl border border-border/40 bg-card hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_0_20px_-8px_hsl(var(--primary)/0.4)] transition-all px-3 sm:px-4 py-3 gap-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${
              won
                ? "bg-green-500/15 text-green-400"
                : drew
                ? "bg-muted text-muted-foreground"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {won ? "WIN" : drew ? "DRAW" : "LOSS"}
          </span>

          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/50">
            {!isBot && opponent?.avatar_url && <AvatarImage src={opponent.avatar_url} />}
            <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
              {!isBot && opponent?.country_flag && <span className="text-sm">{opponent.country_flag}</span>}
              <span className="truncate">{displayName}</span>
              {displayRating != null && (
                <span className="text-[10px] text-muted-foreground font-mono">({displayRating})</span>
              )}
              {isBot && (
                <span className="text-[9px] uppercase tracking-wider text-primary/70 font-bold border border-primary/30 rounded px-1 py-0">
                  Bot
                </span>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-muted/50">{e.time_control_label}</span>
              <span>· {isWhite ? "♔ White" : "♚ Black"}</span>
              <Calendar className="w-2.5 h-2.5" />
              {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {opening && <span className="truncate">· {opening}</span>}
              {isBot && typeof e.rating_change === "number" && (
                <span className={`font-mono ${e.rating_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  · {e.rating_change >= 0 ? "+" : ""}{e.rating_change}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(ev) => { ev.preventDefault(); toggleFavorite(e.id); }}
            className={`p-1.5 rounded-md hover:bg-muted/60 transition-all ${isFav ? "text-yellow-400" : "text-muted-foreground/50 hover:text-yellow-400"}`}
            aria-label="Favorite"
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
          </button>
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{e.result_str || "N/A"}</Badge>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-primary hover:bg-primary/10 group-hover:bg-primary/10">
            <Eye className="w-3 h-3" /> Review
          </Button>
        </div>
      </Link>
    );
  };

  const renderGroup = (label: string, items: typeof filtered) => {
    if (!items.length) return null;
    return (
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pl-1 mt-4 first:mt-0">{label}</h3>
        {items.map(renderCard)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Game <span className="text-gradient-gold">History</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            {source === "online"
              ? "Your past online matches · click any card to review."
              : "Your matches against bots · click any card to review."}
          </p>

          {/* Online / Bot source tabs */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-border/40 bg-card/40 p-1 mb-6">
            {([
              { key: "online", label: "Online", icon: Swords, count: enrichedOnline.length },
              { key: "bot", label: "vs Bots", icon: Brain, count: enrichedBot.length },
            ] as { key: HistorySource; label: string; icon: any; count: number }[]).map((t) => {
              const active = source === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setSource(t.key)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_-4px_hsl(var(--primary)/0.6)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? "bg-primary-foreground/15" : "bg-muted/40"}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Games", value: enriched.length, icon: Swords, color: "text-primary" },
              { label: "Wins", value: winCount, icon: Trophy, color: "text-green-400" },
              { label: "Losses", value: lossCount, icon: TrendingUp, color: "text-red-400" },
              { label: "Draws", value: drawCount, icon: Clock, color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/50 bg-card/80 p-3 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <p className="font-mono text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div className="space-y-3 mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search opponent, opening, or time control…"
                className="pl-9 pr-9 bg-card/60 border-border/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {([
                { key: "all", label: "All" },
                { key: "wins", label: "Wins" },
                { key: "losses", label: "Losses" },
                { key: "draws", label: "Draws" },
                { key: "favorites", label: "★ Favorites" },
              ] as { key: ResultFilter; label: string }[]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setResultFilter(f.key)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                    resultFilter === f.key
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/40 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1 text-[11px]">
                <span className="text-muted-foreground">Sort:</span>
                <button
                  onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
                  className="px-2 py-1 rounded-md border border-border/40 hover:border-primary/40 transition-colors"
                >
                  {sort === "newest" ? "Newest first" : "Oldest first"}
                </button>
              </div>
            </div>
          </div>

          {/* Game list */}
          {fetching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : enriched.length === 0 ? (
            <div className="text-center py-16">
              <Swords className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {source === "online" ? "No online games played yet." : "No bot games played yet."}
              </p>
              <Link to={source === "online" ? "/play/online" : "/play"}>
                <Button>{source === "online" ? "Play Your First Online Game" : "Challenge a Bot"}</Button>
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/40">
              <p className="text-sm text-muted-foreground">No games match your filters.</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-[11px]"
                onClick={() => { setSearch(""); setResultFilter("all"); }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              {renderGroup("Today", groups.today)}
              {renderGroup("Yesterday", groups.yesterday)}
              {renderGroup("Older", groups.older)}

              {visibleCount < filtered.length && (
                <InfiniteScrollSentinel
                  onIntersect={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  remaining={filtered.length - visibleCount}
                />
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function InfiniteScrollSentinel({ onIntersect, remaining }: { onIntersect: () => void; remaining: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: "200px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [onIntersect]);
  return (
    <div ref={ref} className="mt-6 flex flex-col items-center gap-2 py-4">
      <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <p className="text-[10px] text-muted-foreground">Loading more… ({remaining} left)</p>
    </div>
  );
}

export default GameHistory;
