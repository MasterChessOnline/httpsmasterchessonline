// /lobby — Open challenge board ("seeks").
// Fixes the classic cold-start deadlock: two players online at the same time but
// in different time controls never meet in the blind queue. Here every waiting
// player is visible and one tap starts the game.
// No fake seeks, no bots — only rows real users created.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Timer, Loader2, Plus, Trash2, Eye, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TIME_CONTROLS } from "@/components/ChessClock";
import EmptyLobbyActions from "@/components/EmptyLobbyActions";
import CreateFreeAccountCta from "@/components/CreateFreeAccountCta";

interface OpenChallenge {
  id: string;
  creator_id: string;
  creator_name: string | null;
  creator_rating: number;
  time_control_label: string;
  base_seconds: number;
  increment: number;
  is_rated: boolean;
  color_pref: string;
  status: string;
  game_id: string | null;
  created_at: string;
}

const QUICK_TCS = ["1+0", "3+0", "3+2", "5+0", "5+3", "10+0", "10+5", "15+10"];

export default function Lobby() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState<OpenChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [rated, setRated] = useState(true);
  const [tcLabel, setTcLabel] = useState("5+0");

  const load = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("open_challenges")
      .select("*")
      .eq("status", "open")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(60);
    setRows((data as OpenChallenge[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("lobby-open-challenges")
      .on("postgres_changes", { event: "*", schema: "public", table: "open_challenges" }, () => load())
      .subscribe();
    // Realtime is primary; the interval is a cheap safety net for flaky mobile nets.
    const t = window.setInterval(load, 8000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(t);
    };
  }, [load]);

  // When my own seek gets matched, jump straight into the game.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`my-seeks-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "open_challenges", filter: `creator_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as OpenChallenge;
          if (row.status === "matched" && row.game_id) {
            navigate(`/play/online?game=${row.game_id}`);
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, navigate]);

  const myOpen = useMemo(
    () => rows.filter((r) => r.creator_id === user?.id),
    [rows, user?.id],
  );
  const others = useMemo(
    () => rows.filter((r) => r.creator_id !== user?.id),
    [rows, user?.id],
  );

  const createSeek = async () => {
    if (!user) { navigate("/signup?from=lobby"); return; }
    const tc = TIME_CONTROLS.find((t) => t.label === tcLabel) || TIME_CONTROLS[5];
    setCreating(true);
    const { error } = await (supabase as any).from("open_challenges").insert({
      creator_id: user.id,
      creator_name: profile?.display_name || profile?.username || "Player",
      creator_rating: profile?.rating ?? 1200,
      time_control_label: tc.label,
      base_seconds: tc.seconds || 300,
      increment: tc.increment,
      is_rated: rated,
      color_pref: "random",
    });
    setCreating(false);
    if (error) {
      toast({ title: "Could not post seek", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Seek posted", description: "Anyone can now accept it — stay on this page." });
    load();
  };

  const cancelSeek = async (id: string) => {
    await (supabase as any).from("open_challenges").delete().eq("id", id);
    load();
  };

  const accept = async (id: string) => {
    if (!user) { navigate("/signup?from=lobby"); return; }
    setBusyId(id);
    const { data, error } = await supabase.rpc("accept_open_challenge" as any, { _challenge_id: id });
    setBusyId(null);
    const res = data as any;
    if (error || !res?.ok) {
      toast({
        title: "Challenge unavailable",
        description: res?.reason === "own_challenge"
          ? "That is your own seek."
          : "Someone else took it first. Try another one.",
      });
      load();
      return;
    }
    navigate(`/play/online?game=${res.game_id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Chess Lobby — Open Challenges | MasterChess"
        description="See every player waiting for a game right now and accept an open challenge with one tap. Free online chess, no download."
        canonical="https://masterchess.live/lobby"
      />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Lobby</h1>
          <p className="text-muted-foreground">
            Every open challenge from a real player. Pick one and you are playing in a second.
          </p>
        </header>

        {/* Create a seek */}
        <section className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Post your own challenge</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_TCS.map((label) => (
              <button
                key={label}
                onClick={() => setTcLabel(label)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  tcLabel === label
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/60 hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={rated} onCheckedChange={setRated} />
              {rated ? "Rated" : "Casual"}
            </label>
            <Button onClick={createSeek} disabled={creating} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
              {user ? "Post challenge" : "Create free account to post"}
            </Button>
          </div>
        </section>

        {myOpen.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Your open seeks</h2>
            <div className="space-y-2">
              {myOpen.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-medium">{r.time_control_label}</span>
                    <Badge variant="outline">{r.is_rated ? "Rated" : "Casual"}</Badge>
                    <span className="text-muted-foreground">waiting for an opponent…</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => cancelSeek(r.id)} className="gap-1 text-muted-foreground">
                    <Trash2 className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="h-3.5 w-3.5" /> Open challenges
            </h2>
            <Link to="/watch" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> Watch live games
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : others.length === 0 ? (
            <EmptyLobbyActions
              title="No open challenges yet"
              subtitle="Post yours above — it stays visible for 15 minutes, or invite a friend directly."
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {others.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.creator_name || "Player"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{r.creator_rating}</span>
                        <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" />{r.time_control_label}</span>
                        <span>{r.is_rated ? "Rated" : "Casual"}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => accept(r.id)} disabled={busyId === r.id} className="gap-2 shrink-0">
                      {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
                      Play
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {!user && <CreateFreeAccountCta className="mt-10" reason="lobby" />}
      </main>

      <Footer />
    </div>
  );
}
