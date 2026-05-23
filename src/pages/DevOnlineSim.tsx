// Admin-only dev page: two synchronized PlayOnline panels in a single tab.
// Lets us beta-test realtime sync, resign and draw without spinning up a second
// browser. The right-hand "secondary" panel runs on its own in-memory Supabase
// client so the two sessions don't clobber each other's localStorage.
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Chess, Square } from "chess.js";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ChessBoard from "@/components/chess/ChessBoard";
import { TIME_CONTROLS } from "@/components/ChessClock";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// In-memory storage so the secondary client never touches localStorage.
function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
}

function makeIsolatedClient(tag: string): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      storage: memoryStorage() as any,
      storageKey: `sb-sim-${tag}`,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

type SessionInfo = {
  client: SupabaseClient<Database>;
  userId: string;
  email: string;
  displayName: string;
  rating: number;
};

type GameRow = Database["public"]["Tables"]["online_games"]["Row"];
type DrawOffer = Database["public"]["Tables"]["online_draw_offers"]["Row"];

interface SimPanelProps {
  label: string;
  accent: "primary" | "accent";
  initialClient: SupabaseClient<Database>;
  /** true → this panel reuses the page's primary session (no login form) */
  usePrimarySession?: boolean;
}

function SimPanel({ label, accent, initialClient, usePrimarySession }: SimPanelProps) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [tcIdx, setTcIdx] = useState(2); // 5+0 blitz default
  const [queueing, setQueueing] = useState(false);
  const [game, setGame] = useState<GameRow | null>(null);
  const [pendingOffer, setPendingOffer] = useState<DrawOffer | null>(null);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legal, setLegal] = useState<Square[]>([]);
  const chessRef = useRef<Chess>(new Chess());
  const pollRef = useRef<number | null>(null);

  // ── Auth bootstrap ────────────────────────────────────────────────────────
  const bootstrap = useCallback(async (client: SupabaseClient<Database>) => {
    const { data: s } = await client.auth.getSession();
    const u = s.session?.user;
    if (!u) {
      setSession(null);
      return;
    }
    const { data: p } = await client.from("profiles")
      .select("display_name, rating").eq("user_id", u.id).maybeSingle();
    setSession({
      client,
      userId: u.id,
      email: u.email ?? "",
      displayName: (p as any)?.display_name ?? u.email ?? "Player",
      rating: (p as any)?.rating ?? 1200,
    });
  }, []);

  useEffect(() => { bootstrap(initialClient); }, [initialClient, bootstrap]);

  const handleLogin = async () => {
    setAuthLoading(true);
    const { error } = await initialClient.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) { toast.error(`${label}: ${error.message}`); return; }
    await bootstrap(initialClient);
    toast.success(`${label}: signed in`);
  };

  const handleLogout = async () => {
    await initialClient.auth.signOut();
    setSession(null); setGame(null); setPendingOffer(null);
  };

  // ── Game polling (active + finished) ──────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    const client = session.client;
    const fetchActive = async () => {
      // Most recent game involving me (active OR very recently finished)
      const { data } = await client.from("online_games")
        .select("*")
        .or(`white_player_id.eq.${session.userId},black_player_id.eq.${session.userId}`)
        .order("created_at", { ascending: false })
        .limit(1);
      const g = (data?.[0] ?? null) as GameRow | null;
      setGame(prev => {
        // Drop stale: only adopt newer last_move_at OR status change
        if (!g) return prev;
        if (!prev || prev.id !== g.id) return g;
        const prevTs = prev.last_move_at ? new Date(prev.last_move_at).getTime() : 0;
        const newTs = g.last_move_at ? new Date(g.last_move_at).getTime() : 0;
        if (newTs >= prevTs || g.status !== prev.status) return g;
        return prev;
      });

      if (g && g.status === "active") {
        const { data: offers } = await client.from("online_draw_offers")
          .select("*")
          .eq("game_id", g.id)
          .eq("status", "pending")
          .neq("from_user_id", session.userId)
          .order("created_at", { ascending: false })
          .limit(1);
        setPendingOffer((offers?.[0] ?? null) as DrawOffer | null);
      } else {
        setPendingOffer(null);
      }
    };
    fetchActive();
    pollRef.current = window.setInterval(fetchActive, 1000);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, [session]);

  // Sync chess.js to authoritative FEN
  useEffect(() => {
    if (!game) { chessRef.current = new Chess(); setSelected(null); setLegal([]); return; }
    try {
      chessRef.current = new Chess(game.fen);
      setSelected(null); setLegal([]);
    } catch {/* ignore */}
  }, [game?.fen, game?.id]);

  // ── Matchmaking ──────────────────────────────────────────────────────────
  const joinQueue = async () => {
    if (!session) return;
    setQueueing(true);
    const tc = TIME_CONTROLS[tcIdx];
    const client = session.client;
    const { data: gate } = await client.rpc("assert_can_queue" as any);
    if (gate && (gate as any).ok === false) {
      toast.error(`${label}: ${(gate as any).error}`);
      setQueueing(false);
      return;
    }
    // Look for opponent in queue
    const { data: q } = await client.from("matchmaking_queue")
      .select("*")
      .eq("time_control_label", tc.label)
      .neq("user_id", session.userId)
      .order("created_at", { ascending: true })
      .limit(1);
    if (q && q.length > 0) {
      const opp = q[0] as any;
      await client.from("matchmaking_queue").delete().eq("id", opp.id);
      const { data: startRes } = await client.rpc("start_online_game" as any, {
        p_white_id: session.userId,
        p_black_id: opp.user_id,
        p_white_time: tc.seconds || 600,
        p_black_time: tc.seconds || 600,
        p_time_control_label: tc.label,
        p_increment: tc.increment,
      });
      if (!(startRes as any)?.ok) {
        toast.error(`${label}: start failed (${(startRes as any)?.error ?? "?"})`);
      } else {
        toast.success(`${label}: matched`);
      }
    } else {
      const { error } = await client.from("matchmaking_queue").insert({
        user_id: session.userId,
        rating: session.rating,
        time_control_label: tc.label,
      });
      if (error) toast.error(`${label}: queue failed`);
      else toast.message(`${label}: in queue (${tc.label})`);
    }
    setQueueing(false);
  };

  const leaveQueue = async () => {
    if (!session) return;
    await session.client.from("matchmaking_queue").delete().eq("user_id", session.userId);
    toast.message(`${label}: left queue`);
  };

  // ── Move ─────────────────────────────────────────────────────────────────
  const myColor: "w" | "b" | null = game && session
    ? (game.white_player_id === session.userId ? "w" : "b") : null;
  const isMyTurn = !!(game && game.status === "active" && myColor && game.turn === myColor);

  const handleSquareClick = async (sq: Square) => {
    if (!isMyTurn || !game || !session) return;
    const c = chessRef.current;
    const piece = c.get(sq);
    if (selected) {
      if (sq === selected) { setSelected(null); setLegal([]); return; }
      // Attempt move
      try {
        const fenBefore = c.fen();
        const result = c.move({ from: selected, to: sq, promotion: "q" });
        if (!result) {
          if (piece && piece.color === myColor) {
            setSelected(sq);
            setLegal(c.moves({ square: sq, verbose: true }).map((m: any) => m.to));
          }
          return;
        }
        const fenAfter = c.fen();
        const turnAfter = c.turn();
        let endResult: string | null = null;
        let endReason: string | null = null;
        if (c.isCheckmate()) {
          endResult = myColor === "w" ? "1-0" : "0-1";
          endReason = "checkmate";
        } else if (c.isStalemate()) { endResult = "1/2-1/2"; endReason = "stalemate"; }
        else if (c.isThreefoldRepetition()) { endResult = "1/2-1/2"; endReason = "threefold"; }
        else if (c.isInsufficientMaterial()) { endResult = "1/2-1/2"; endReason = "insufficient_material"; }
        else if (c.isDraw()) { endResult = "1/2-1/2"; endReason = "fifty_move"; }

        const { data: res } = await session.client.rpc("commit_online_move" as any, {
          p_game_id: game.id,
          p_expected_move_number: game.move_number ?? 0,
          p_fen_before: fenBefore,
          p_fen_after: fenAfter,
          p_san: result.san,
          p_pgn_after: c.pgn(),
          p_from: selected,
          p_to: sq,
          p_promotion: result.promotion ?? "",
          p_color: myColor!,
          p_turn_after: turnAfter,
          p_white_time: game.white_time,
          p_black_time: game.black_time,
          p_result: endResult,
          p_end_reason: endReason,
        });
        if (!(res as any)?.ok) {
          toast.error(`${label}: move rejected (${(res as any)?.error ?? "?"})`);
          chessRef.current = new Chess(game.fen);
        }
        setSelected(null); setLegal([]);
      } catch (e: any) {
        toast.error(`${label}: ${e.message}`);
        setSelected(null); setLegal([]);
      }
    } else if (piece && piece.color === myColor) {
      setSelected(sq);
      setLegal(c.moves({ square: sq, verbose: true }).map((m: any) => m.to));
    }
  };

  // ── Resign / Draw ────────────────────────────────────────────────────────
  const resign = async () => {
    if (!game || !session || !myColor) return;
    const result = myColor === "w" ? "0-1" : "1-0";
    const { data, error } = await session.client.rpc("finalize_online_game" as any, {
      p_game_id: game.id, p_result: result, p_end_reason: "resignation",
    });
    if (error || !(data as any)?.ok) toast.error(`${label}: resign failed`);
    else toast.success(`${label}: resigned`);
  };

  const offerDraw = async () => {
    if (!game || !session) return;
    const { data, error } = await session.client.rpc("offer_draw" as any, { p_game_id: game.id });
    if (error || !(data as any)?.ok) toast.error(`${label}: offer failed`);
    else toast.message(`${label}: draw offer sent`);
  };

  const respondDraw = async (accept: boolean) => {
    if (!pendingOffer || !session) return;
    const { data, error } = await session.client.rpc("respond_draw_offer" as any, {
      p_offer_id: pendingOffer.id, p_accept: accept,
    });
    if (error || !(data as any)?.ok) toast.error(`${label}: respond failed`);
    else toast.success(`${label}: ${accept ? "accepted" : "declined"} draw`);
  };

  const abort = async () => {
    if (!game || !session) return;
    const { data, error } = await session.client.rpc("abort_online_game" as any, { p_game_id: game.id });
    if (error || !(data as any)?.ok) toast.error(`${label}: abort failed (${(data as any)?.error ?? "?"})`);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const accentClass = accent === "primary"
    ? "border-primary/40 bg-primary/5"
    : "border-amber-500/40 bg-amber-500/5";

  return (
    <Card className={`p-4 flex flex-col gap-3 ${accentClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm tracking-wide uppercase">{label}</h2>
        {session && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{session.displayName}</Badge>
            <Badge className="text-xs">{session.rating}</Badge>
            {!usePrimarySession && (
              <Button size="sm" variant="ghost" onClick={handleLogout}>Sign out</Button>
            )}
          </div>
        )}
      </div>

      {!session ? (
        usePrimarySession ? (
          <p className="text-sm text-muted-foreground">Loading primary session…</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Sign in as a second account (independent session, never touches localStorage).
            </p>
            <Input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} />
            <Button size="sm" disabled={authLoading || !email || !password} onClick={handleLogin}>
              {authLoading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        )
      ) : !game || game.status === "finished" ? (
        <div className="flex flex-col gap-2">
          {game?.status === "finished" && (
            <div className="rounded border border-border p-2 text-sm">
              <div className="font-medium">Last game finished</div>
              <div className="text-xs text-muted-foreground">
                {game.result} · {game.end_reason} · elo_applied: {String(game.elo_applied)}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <select value={tcIdx} onChange={e => setTcIdx(parseInt(e.target.value))}
              className="rounded border border-border bg-background px-2 py-1 text-sm">
              {TIME_CONTROLS.map((tc, i) => (
                <option key={tc.label} value={i}>{tc.label}</option>
              ))}
            </select>
            <Button size="sm" onClick={joinQueue} disabled={queueing}>
              {queueing ? "…" : "Join queue"}
            </Button>
            <Button size="sm" variant="outline" onClick={leaveQueue}>Leave</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
            <span>color: <b>{myColor}</b></span>
            <span>turn: <b>{game.turn}</b></span>
            <span>move#: {game.move_number}</span>
            <span>status: {game.status}</span>
            <span className={isMyTurn ? "text-primary font-semibold" : ""}>
              {isMyTurn ? "YOUR TURN" : "waiting…"}
            </span>
          </div>
          <ChessBoard
            game={chessRef.current}
            flipped={myColor === "b"}
            selectedSquare={selected}
            legalMoves={legal}
            lastMove={game.last_move_from && game.last_move_to
              ? { from: game.last_move_from, to: game.last_move_to } : null}
            isGameOver={game.status !== "active"}
            isPlayerTurn={isMyTurn}
            onSquareClick={handleSquareClick}
          />
          {pendingOffer && (
            <div className="rounded border border-amber-500/50 bg-amber-500/10 p-2 text-xs flex items-center justify-between">
              <span>Opponent offered a draw</span>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => respondDraw(true)}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => respondDraw(false)}>Decline</Button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="destructive" onClick={resign}>Resign</Button>
            <Button size="sm" variant="outline" onClick={offerDraw}>Offer draw</Button>
            {(game.move_number ?? 0) === 0 && (
              <Button size="sm" variant="ghost" onClick={abort}>Abort</Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

export default function DevOnlineSim() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role" as any, { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data))
      .catch(() => setIsAdmin(false));
  }, [user]);

  // Two isolated clients: left reuses the page's primary session via the
  // singleton supabase client; right gets a fresh in-memory client.
  const primaryClient = useMemo(() => supabase as unknown as SupabaseClient<Database>, []);
  const secondaryClient = useMemo(() => makeIsolatedClient("b"), []);

  if (loading || isAdmin === null) {
    return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/login?redirect=/dev/online-sim" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
        <h1 className="text-2xl font-semibold">Admin only</h1>
        <p className="text-muted-foreground text-sm">This dev tool is restricted to admins.</p>
        <Button asChild variant="outline"><Link to="/">Back home</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Online Sim · Two-Board Tester</h1>
          <p className="text-sm text-muted-foreground">
            Both panels hit production matchmaking. Pick the same time control on both sides → they pair instantly.
            Test resign, draw offers, abort, realtime sync. Rating changes apply for real.
          </p>
        </div>
        <Button asChild size="sm" variant="outline"><Link to="/play/online">Back to PlayOnline</Link></Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimPanel label="Primary (you)" accent="primary"
          initialClient={primaryClient} usePrimarySession />
        <SimPanel label="Secondary" accent="accent"
          initialClient={secondaryClient} />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        ⚠️ The secondary client uses an in-memory session — refreshing the page will sign it out.
        Rating changes from these games are real; use a dedicated test account.
      </p>
    </div>
  );
}
