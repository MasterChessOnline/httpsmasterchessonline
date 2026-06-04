import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Crown, Users, Timer, Trophy, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type Match = {
  id: string;
  session_id: string;
  round: number;
  slot: number;
  player_a: string | null;
  player_b: string | null;
  winner_id: string | null;
  status: string;
};
type Session = {
  id: string;
  status: string;
  winner_id: string | null;
};
type Profile = { user_id: string; username: string | null; avatar_url: string | null; rating: number };

const ROUND_LABEL: Record<number, string> = { 1: "Quarterfinals", 2: "Semifinals", 3: "Final" };

export default function BattleRoyale() {
  const { user } = useAuth();
  const [queueCount, setQueueCount] = useState(0);
  const [inQueue, setInQueue] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [busy, setBusy] = useState(false);

  // ---- queue ----
  async function refreshQueue() {
    const { data, count } = await supabase
      .from("battle_royale_queue" as any)
      .select("user_id", { count: "exact" });
    setQueueCount(count ?? 0);
    setInQueue(!!(data as any[])?.find((q) => q.user_id === user?.id));
  }

  async function loadActiveSession() {
    if (!user) return;
    // find a session where the user is still alive (has a pending match) within last 24h
    const { data: mine } = await supabase
      .from("battle_royale_matches" as any)
      .select("session_id, status")
      .or(`player_a.eq.${user.id},player_b.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(20);
    const sessionId = (mine as any[])?.find((m) => m.status !== "done" || true)?.session_id;
    if (!sessionId) {
      setSession(null);
      setMatches([]);
      return;
    }
    const [{ data: sess }, { data: ms }] = await Promise.all([
      supabase.from("battle_royale_sessions" as any).select("id, status, winner_id").eq("id", sessionId).maybeSingle(),
      supabase.from("battle_royale_matches" as any).select("*").eq("session_id", sessionId).order("round").order("slot"),
    ]);
    setSession((sess as any) ?? null);
    setMatches(((ms as any[]) ?? []) as Match[]);
  }

  // load profile cards
  useEffect(() => {
    const ids = new Set<string>();
    matches.forEach((m) => { if (m.player_a) ids.add(m.player_a); if (m.player_b) ids.add(m.player_b); });
    const missing = [...ids].filter((id) => !profiles[id]);
    if (missing.length === 0) return;
    supabase.from("profiles").select("user_id, username, avatar_url, rating").in("user_id", missing).then(({ data }) => {
      const next = { ...profiles };
      ((data as any[]) ?? []).forEach((p) => (next[p.user_id] = p));
      setProfiles(next);
    });
  }, [matches]);

  useEffect(() => {
    refreshQueue();
    loadActiveSession();
    const ch = supabase
      .channel("battle-royale")
      .on("postgres_changes", { event: "*", schema: "public", table: "battle_royale_queue" }, () => refreshQueue())
      .on("postgres_changes", { event: "*", schema: "public", table: "battle_royale_matches" }, () => loadActiveSession())
      .on("postgres_changes", { event: "*", schema: "public", table: "battle_royale_sessions" }, () => loadActiveSession())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  async function joinRoyale() {
    if (!user || busy) return;
    setBusy(true);
    const { data, error } = await (supabase.rpc as any)("join_battle_royale");
    setBusy(false);
    if (error || !data?.ok) {
      toast({ title: "Couldn't join", description: error?.message ?? data?.error ?? "Try again.", variant: "destructive" });
      return;
    }
    if (data.session_id) {
      toast({ title: "🔥 Royale starting!", description: "8 players locked in. Quarterfinals begin." });
    } else {
      toast({ title: "In the queue", description: `${data.queue_count}/8 players waiting.` });
    }
    refreshQueue();
    loadActiveSession();
  }

  async function leaveQueue() {
    if (!user) return;
    await supabase.from("battle_royale_queue" as any).delete().eq("user_id", user.id);
    refreshQueue();
  }

  async function reportWin(match: Match, winner: string) {
    const { data, error } = await (supabase.rpc as any)("report_battle_royale_winner", { _match: match.id, _winner: winner });
    if (error || !data?.ok) {
      toast({ title: "Couldn't report", description: data?.error ?? error?.message, variant: "destructive" });
      return;
    }
    if (data.champion) {
      toast({ title: "👑 CHAMPION!", description: `+${data.reward} coins · Balance ${data.new_balance}` });
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mc:coins-changed"));
    } else {
      toast({ title: "Advanced!", description: `Moving to round ${data.next_round}.` });
    }
    loadActiveSession();
  }

  // group matches by round
  const rounds = useMemo(() => {
    const out: Record<number, Match[]> = { 1: [], 2: [], 3: [] };
    matches.forEach((m) => { out[m.round]?.push(m); });
    return out;
  }, [matches]);

  const myCurrentMatch = matches.find(
    (m) => m.status !== "done" && (m.player_a === user?.id || m.player_b === user?.id) && m.player_a && m.player_b
  );

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Chess Battle Royale — MasterChess"
        description="8 players. 3 rounds. 1 champion. Bullet-speed elimination bracket on MasterChess.live."
        path="/battle-royale"
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-primary/50 bg-gradient-to-br from-primary/25 via-primary/10 to-background p-6 md:p-8 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.6)]"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Swords className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Live Event</p>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">Chess Battle Royale</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                8 players · 3 rounds · winner takes <span className="text-amber-400 font-semibold inline-flex items-center gap-0.5"><Coins className="h-3 w-3" />500</span>
              </p>
            </div>
          </div>

          {/* Queue */}
          <div className="relative mt-6 rounded-2xl border border-border bg-background/60 backdrop-blur p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <span className="font-bold text-foreground tabular-nums">{queueCount}</span>
                  <span className="text-muted-foreground"> / 8 players in queue</span>
                </span>
              </div>
              {!user ? (
                <Button asChild size="sm"><Link to="/login">Log in to play</Link></Button>
              ) : session && session.status === "active" ? (
                <span className="text-xs text-primary font-semibold inline-flex items-center gap-1"><Timer className="h-3 w-3" /> Royale in progress</span>
              ) : inQueue ? (
                <Button onClick={leaveQueue} size="sm" variant="secondary">Leave queue</Button>
              ) : (
                <Button onClick={joinRoyale} disabled={busy} size="sm" className="shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.6)]">
                  <Swords className="h-4 w-4 mr-1" /> Join Royale
                </Button>
              )}
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (queueCount / 8) * 100)}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-primary via-amber-400 to-primary"
              />
            </div>
          </div>
        </motion.div>

        {/* My current match call-to-action */}
        <AnimatePresence>
          {myCurrentMatch && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-6 rounded-2xl border border-amber-400/60 bg-amber-400/10 p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="text-sm">
                <p className="font-bold text-foreground">Your match — {ROUND_LABEL[myCurrentMatch.round]}</p>
                <p className="text-muted-foreground text-xs">
                  vs {profiles[myCurrentMatch.player_a === user?.id ? myCurrentMatch.player_b! : myCurrentMatch.player_a!]?.username ?? "opponent"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="secondary"><Link to="/play/online">Open board →</Link></Button>
                <Button size="sm" onClick={() => reportWin(myCurrentMatch, user!.id)}>I won</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bracket */}
        {session && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Bracket
              {session.winner_id && (
                <span className="ml-2 text-xs font-semibold text-amber-400 inline-flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" /> Champion: {profiles[session.winner_id]?.username ?? "—"}
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((round) => (
                <div key={round} className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {ROUND_LABEL[round]}
                  </div>
                  {rounds[round].map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      profiles={profiles}
                      currentUser={user?.id}
                      onReport={reportWin}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="mt-10 rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="font-display text-lg font-bold mb-3">How it works</h2>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Join the queue. When <span className="text-foreground font-semibold">8 players</span> are waiting, the bracket locks instantly.</li>
            <li>• Play your match on the regular online board (1+0 Bullet recommended).</li>
            <li>• Winner reports the result and advances. Champion earns <span className="text-amber-400 font-semibold">500 coins</span>.</li>
            <li>• Lose? You're out — but you can re-queue immediately for the next Royale.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MatchCard({
  match, profiles, currentUser, onReport,
}: {
  match: Match;
  profiles: Record<string, Profile>;
  currentUser?: string;
  onReport: (m: Match, winner: string) => void;
}) {
  const a = match.player_a ? profiles[match.player_a] : null;
  const b = match.player_b ? profiles[match.player_b] : null;
  const isParticipant = currentUser && (match.player_a === currentUser || match.player_b === currentUser);
  const done = match.status === "done";

  return (
    <motion.div
      layout
      className={`rounded-xl border p-3 ${done ? "border-emerald-500/30 bg-emerald-500/5" : isParticipant ? "border-amber-400/50 bg-amber-400/5" : "border-border bg-card/50"}`}
    >
      <Slot profile={a} placeholder="TBD" highlight={match.winner_id === match.player_a} />
      <div className="text-center text-[10px] uppercase tracking-widest text-muted-foreground my-1">vs</div>
      <Slot profile={b} placeholder="TBD" highlight={match.winner_id === match.player_b} />
      {isParticipant && !done && match.player_a && match.player_b && (
        <div className="mt-2 flex gap-1.5">
          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => onReport(match, currentUser!)}>
            I won
          </Button>
          <Button
            size="sm" variant="ghost" className="flex-1 h-7 text-xs text-muted-foreground"
            onClick={() => onReport(match, match.player_a === currentUser ? match.player_b! : match.player_a!)}
          >
            Opponent won
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function Slot({ profile, placeholder, highlight }: { profile: Profile | null; placeholder: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${highlight ? "bg-emerald-500/15 ring-1 ring-emerald-500/40" : ""}`}>
      <div className="w-7 h-7 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-bold text-muted-foreground">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          (profile?.username ?? "?").slice(0, 1).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{profile?.username ?? placeholder}</p>
        {profile && <p className="text-[10px] text-muted-foreground">{profile.rating} ELO</p>}
      </div>
      {highlight && <Crown className="h-3.5 w-3.5 text-amber-400" />}
    </div>
  );
}
