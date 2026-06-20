import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ShareMoment() {
  const { gameId, ply } = useParams<{ gameId: string; ply: string }>();
  const [game, setGame] = useState<any>(null);
  const url = `https://masterchess.live/share/${gameId}/${ply}`;
  const ogImage = `https://masterchess.live/api/og/board?game=${gameId}&ply=${ply}`;

  useEffect(() => {
    if (!gameId) return;
    (async () => {
      const { data } = await supabase
        .from("online_games")
        .select("id, white_player_id, black_player_id, result, pgn, time_control, finished_at")
        .eq("id", gameId)
        .maybeSingle();
      setGame(data);
    })();
  }, [gameId]);

  const copy = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Helmet>
        <title>Chess moment — MasterChess</title>
        <meta name="description" content="Watch this chess moment on MasterChess. Free online chess, no ads." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="A wild chess moment — MasterChess" />
        <meta property="og:description" content="Click to watch the full game on MasterChess." />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">A wild chess moment</h1>
          <p className="text-zinc-400">Move {ply} • shared from MasterChess</p>
        </header>

        <Card className="mb-6 overflow-hidden border-zinc-800 bg-zinc-950">
          <img src={ogImage} alt={`Chess position at move ${ply}`} className="w-full" loading="eager" />
        </Card>

        <Card className="mb-6 border-zinc-800 bg-zinc-950 p-5">
          {game ? (
            <>
              <p className="mb-1 text-sm text-zinc-400">Time control: {game.time_control}</p>
              <p className="text-sm text-zinc-400">Result: {game.result ?? "in progress"}</p>
            </>
          ) : (
            <p className="text-zinc-500">Loading game…</p>
          )}
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-yellow-500 text-black hover:bg-yellow-400">
            <Link to="/play/online"><Share2 className="mr-2 h-4 w-4" /> Play Free Now</Link>
          </Button>
          <Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4" /> Copy link</Button>
          <Button asChild variant="outline">
            <a target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this chess moment ♟️")}`}>
              <Twitter className="mr-2 h-4 w-4" /> Tweet
            </a>
          </Button>
          <Button asChild variant="outline">
            <a target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>
              <Facebook className="mr-2 h-4 w-4" /> Share
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
