import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Beaker, ThumbsUp, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FEATURES = [
  { key: "ai_opening_coach", label: "AI Opening Coach (live hints)", description: "Real-time opening guidance during practice games." },
  { key: "team_arenas", label: "Team Arena Tournaments", description: "5v5 club battles with combined scoring." },
  { key: "voice_chat_lobby", label: "Voice chat in lobbies", description: "WebRTC voice in tournament waiting rooms." },
  { key: "chess960", label: "Chess960 / Fischer Random support", description: "Random starting position mode." },
  { key: "puzzle_storm_24h", label: "24h Puzzle Storm leaderboards", description: "All-day rolling puzzle competitions." },
  { key: "mobile_widget", label: "iOS / Android home-screen widget", description: "Live rating + next tournament countdown." },
];

export default function Beta() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("standard");
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const eligible = useMemo(() => tier === "beta" || tier === "vip", [tier]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("access_tier")
          .eq("id", user.id)
          .maybeSingle();
        setTier(p?.access_tier ?? "standard");

        const { data: mine } = await supabase
          .from("feature_votes")
          .select("feature_key")
          .eq("user_id", user.id)
          .maybeSingle();
        setMyVote(mine?.feature_key ?? null);
      }
      const { data: all } = await supabase.from("feature_votes").select("feature_key");
      const counts: Record<string, number> = {};
      (all ?? []).forEach((v: any) => (counts[v.feature_key] = (counts[v.feature_key] ?? 0) + 1));
      setVotes(counts);
      setLoading(false);
    })();
  }, []);

  const vote = async (key: string) => {
    if (!user) return toast.error("Sign in to vote");
    if (!eligible) return toast.error("Beta access required");
    const { error } = await supabase
      .from("feature_votes")
      .upsert({ user_id: user.id, feature_key: key }, { onConflict: "user_id,feature_key" });
    if (error) return toast.error(error.message);
    setVotes((v) => ({ ...v, [key]: (v[key] ?? 0) + (myVote === key ? 0 : 1), ...(myVote && myVote !== key ? { [myVote]: Math.max(0, (v[myVote] ?? 1) - 1) } : {}) }));
    if (myVote && myVote !== key) {
      await supabase.from("feature_votes").delete().eq("user_id", user.id).eq("feature_key", myVote);
    }
    setMyVote(key);
    toast.success("Vote recorded");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Helmet>
        <title>Beta Lab — Vote on the next MasterChess feature</title>
        <meta name="description" content="MasterChess Beta Lab. Vote on what we build next, test unreleased features, and shape the platform." />
        <link rel="canonical" href="https://masterchess.live/beta" />
      </Helmet>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <header className="mb-10 text-center">
          <Beaker className="mx-auto mb-3 h-12 w-12 text-cyan-400" />
          <h1 className="text-4xl font-bold md:text-5xl">Beta Lab</h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Test what's not shipped yet. Vote on what gets built next.
          </p>
          {!eligible && (
            <Card className="mx-auto mt-6 max-w-md border-cyan-500/30 bg-cyan-950/20 p-4 text-left">
              <div className="mb-2 flex items-center gap-2 text-cyan-300">
                <Lock className="h-4 w-4" /> Beta access locked
              </div>
              <p className="text-sm text-zinc-400">
                Earn beta tier by winning a weekly tournament or finishing top-10 of any season.
              </p>
            </Card>
          )}
        </header>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Vote — one feature per account</h2>
          {loading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : (
            <div className="space-y-3">
              {FEATURES.sort((a, b) => (votes[b.key] ?? 0) - (votes[a.key] ?? 0)).map((f) => (
                <Card key={f.key} className="flex items-center gap-4 border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{f.label}</span>
                      {myVote === f.key && <Badge className="bg-cyan-600">Your vote</Badge>}
                    </div>
                    <p className="text-sm text-zinc-500">{f.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums text-cyan-300">{votes[f.key] ?? 0}</div>
                    <Button
                      size="sm"
                      variant={myVote === f.key ? "default" : "outline"}
                      onClick={() => vote(f.key)}
                      disabled={!eligible}
                      className="mt-1"
                    >
                      <ThumbsUp className="mr-1 h-3 w-3" /> Vote
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
