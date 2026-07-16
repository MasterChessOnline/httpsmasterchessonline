import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import MiniFenBoard from "@/components/MiniFenBoard";
import { supabase } from "@/integrations/supabase/client";

// Promotional embeddable widget for bloggers/YouTubers.
// Usage: <iframe src="https://masterchess.live/embed/play?fen=..." width="360" height="440" />
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function EmbedPlay() {
  const params = new URLSearchParams(window.location.search);
  const fen = params.get("fen") || START_FEN;
  const variant = params.get("v") || "default";
  const utm = "?utm_source=embed&utm_medium=widget&utm_campaign=" + encodeURIComponent(variant);

  useEffect(() => {
    // Fire-and-forget analytics beacon
    supabase.from("embed_widgets_analytics").insert({
      widget_type: "play",
      referrer: document.referrer || null,
      variant,
    }).then(() => {}, () => {});
  }, [variant]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-3">
      <Helmet>
        <title>MasterChess — Play chess free</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <a
        href={`https://masterchess.live/play${utm}`}
        target="_blank"
        rel="noopener"
        className="block rounded-xl bg-gradient-to-br from-primary/20 via-background to-background border border-primary/30 shadow-lg p-4 w-full max-w-[340px] hover:scale-[1.01] transition-transform"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold tracking-tight text-primary">♞ MasterChess</div>
          <div className="text-xs text-muted-foreground">Play free</div>
        </div>
        <div className="rounded-lg overflow-hidden mx-auto" style={{ width: 300, height: 300 }}>
          <MiniFenBoard fen={fen} size={300} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">No signup. No ads.</div>
          <div className="text-sm font-semibold text-primary">Play →</div>
        </div>
      </a>
    </div>
  );
}
