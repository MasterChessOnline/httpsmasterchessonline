import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Share2, RefreshCw, Dna } from "lucide-react";
import { toast } from "sonner";

type Dna = {
  id: string;
  user_id: string;
  style_label: string;
  aggression_score: number;
  defense_score: number;
  tactics_score: number;
  endgame_score: number;
  favorite_openings: Array<{ name: string; count: number }>;
  best_color: string | null;
  weakness: string | null;
  summary: string | null;
  games_analyzed: number;
  updated_at: string;
};

export default function ChessDna() {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const targetId = routeUserId ?? user?.id ?? null;
  const isOwn = !!user && targetId === user.id;

  const [dna, setDna] = useState<Dna | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!targetId) { setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true);
      const [{ data: d }, { data: p }] = await Promise.all([
        supabase.from("chess_dna_snapshots").select("*").eq("user_id", targetId).maybeSingle(),
        supabase.from("profiles").select("username").eq("id", targetId).maybeSingle(),
      ]);
      if (!alive) return;
      setDna((d as unknown as Dna) ?? null);
      setUsername((p?.username as string) || "Player");
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [targetId]);

  async function generate() {
    if (!targetId) return;
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-chess-dna", {
      body: { userId: targetId, regenerate: true },
    });
    setGenerating(false);
    if (error) {
      toast.error("Failed to generate DNA — play a few more games and try again.");
      return;
    }
    if (data?.error === "not_enough_games") {
      toast.error(`Need at least 3 games (you have ${data.games ?? 0}).`);
      return;
    }
    if (data?.dna) {
      setDna(data.dna);
      toast.success("Chess DNA analyzed");
    }
  }

  async function share() {
    const url = `${window.location.origin}/dna/${targetId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${username}'s Chess DNA`, text: dna?.summary ?? "My Chess DNA on MasterChess", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied");
      }
    } catch { /* user canceled */ }
  }

  const title = dna ? `${username}'s Chess DNA — ${dna.style_label}` : "Chess DNA — MasterChess";
  const description = dna?.summary ?? "Discover your unique chess playing style. AI-analyzed fingerprint of your games on MasterChess.";
  const canonical = `https://masterchess.live/dna${targetId ? `/${targetId}` : ""}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="profile" />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Dna className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Chess DNA</h1>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        )}

        {!loading && !targetId && (
          <Card className="p-6">
            <p className="mb-4">Sign in to generate your personal Chess DNA fingerprint.</p>
            <Link to="/login"><Button>Sign in</Button></Link>
          </Card>
        )}

        {!loading && targetId && !dna && (
          <Card className="p-6 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-xl font-semibold">
              {isOwn ? "You haven't generated your DNA yet" : `${username} hasn't generated their DNA yet`}
            </h2>
            {isOwn && (
              <>
                <p className="text-muted-foreground">Play at least 3 games, then let AI analyze your unique style.</p>
                <Button size="lg" onClick={generate} disabled={generating}>
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate my DNA
                </Button>
              </>
            )}
          </Card>
        )}

        {!loading && dna && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-background border-primary/30">
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Style</div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">{dna.style_label}</h2>
              {dna.summary && <p className="text-lg leading-relaxed">{dna.summary}</p>}
              <div className="text-xs text-muted-foreground mt-4">
                Based on {dna.games_analyzed} recent games · Updated {new Date(dna.updated_at).toLocaleDateString()}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Attributes</h3>
              <div className="space-y-4">
                <Attr label="Aggression" value={dna.aggression_score} />
                <Attr label="Defense" value={dna.defense_score} />
                <Attr label="Tactics" value={dna.tactics_score} />
                <Attr label="Endgame" value={dna.endgame_score} />
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Best Color</h3>
                <div className="text-2xl font-bold capitalize">
                  {dna.best_color === "black" ? "♚ Black" : "♔ White"}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Weakness</h3>
                <p className="text-muted-foreground text-sm">{dna.weakness || "—"}</p>
              </Card>
            </div>

            {dna.favorite_openings?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Favorite Openings</h3>
                <ul className="space-y-2">
                  {dna.favorite_openings.slice(0, 5).map((o, i) => (
                    <li key={i} className="flex justify-between text-sm border-b border-border/40 pb-1 last:border-0">
                      <span>{o.name}</span>
                      <span className="text-muted-foreground">{o.count}x</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="flex flex-wrap gap-3">
              <Button onClick={share} variant="default">
                <Share2 className="w-4 h-4 mr-2" /> Share DNA
              </Button>
              {isOwn && (
                <Button onClick={generate} variant="outline" disabled={generating}>
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Regenerate
                </Button>
              )}
              <Link to="/play"><Button variant="secondary">Play more games</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Attr({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-mono text-muted-foreground">{value}/100</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
