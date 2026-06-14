import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Twitter, MessageCircle, Send, Flame, Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRank } from "@/lib/ranks";

interface BragData {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
  peak_rating: number;
  games_played: number;
  games_won: number;
  win_streak: number;
  favorite_openings: string[] | null;
}

/**
 * Public, share-optimized "Brag Card" page at /brag/:username.
 * Renders a 1080x1350 portrait PNG of the player's stats, with download +
 * social share. Crawlable so /brag links unfurl with the auto-generated OG.
 */
export default function Brag() {
  const { username } = useParams<{ username: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<BragData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!username) return;
    (async () => {
      const { data: p, error } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, rating, peak_rating, games_played, games_won, win_streak, favorite_openings")
        .eq("username", username)
        .maybeSingle();
      if (error || !p) {
        setLoading(false);
        return;
      }
      setData(p as BragData);
      setLoading(false);
    })();
  }, [username]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background — deep gold/black radial
    const bg = ctx.createRadialGradient(540, 600, 50, 540, 700, 1100);
    bg.addColorStop(0, "#2a1f0a");
    bg.addColorStop(0.5, "#15110a");
    bg.addColorStop(1, "#08070a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1350);

    // Gold border bars
    const gold = ctx.createLinearGradient(0, 0, 1080, 0);
    gold.addColorStop(0, "#a87f2e");
    gold.addColorStop(0.5, "#f3d97a");
    gold.addColorStop(1, "#a87f2e");
    ctx.fillStyle = gold;
    ctx.fillRect(0, 0, 1080, 8);
    ctx.fillRect(0, 1342, 1080, 8);

    // Chess pattern decor (very subtle)
    ctx.globalAlpha = 0.04;
    for (let r = 0; r < 30; r++) {
      for (let c = 0; c < 24; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = "#f3d97a";
          ctx.fillRect(c * 45, r * 45, 45, 45);
        }
      }
    }
    ctx.globalAlpha = 1;

    // Header brand
    ctx.fillStyle = "#f3d97a";
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
    ctx.fillText("♛ MASTERCHESS", 60, 100);
    ctx.fillStyle = "#888";
    ctx.font = "22px system-ui, -apple-system, sans-serif";
    ctx.fillText("masterchess.live", 60, 134);

    // Big rank line
    const rank = getRank(data.rating);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 56px system-ui, -apple-system, sans-serif";
    ctx.fillText("CHALLENGE ME", 60, 230);

    // Player name
    ctx.fillStyle = "#f3d97a";
    ctx.font = "bold 120px system-ui, -apple-system, sans-serif";
    const name = (data.display_name || data.username || "Player").slice(0, 18);
    ctx.fillText(name, 60, 380);

    ctx.fillStyle = "#aaa";
    ctx.font = "30px system-ui, -apple-system, sans-serif";
    ctx.fillText(`@${data.username}  ·  ${rank.label}`, 60, 430);

    // Stats blocks
    const drawStat = (x: number, y: number, label: string, value: string, accent: string) => {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, 470, 180, 20);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#888";
      ctx.font = "bold 22px system-ui";
      ctx.fillText(label.toUpperCase(), x + 28, y + 50);
      ctx.fillStyle = accent;
      ctx.font = "bold 80px system-ui";
      ctx.fillText(value, x + 28, y + 130);
    };

    drawStat(60, 520, "ELO Rating", String(data.rating), "#f3d97a");
    drawStat(550, 520, "Peak", String(data.peak_rating), "#a78bfa");
    drawStat(60, 720, "Wins", String(data.games_won), "#34d399");
    drawStat(550, 720, "Win Streak", `${data.win_streak} 🔥`, "#fb923c");

    // Openings list
    const ops = (data.favorite_openings ?? []).slice(0, 3);
    if (ops.length) {
      ctx.fillStyle = "#888";
      ctx.font = "bold 24px system-ui";
      ctx.fillText("FAVORITE OPENINGS", 60, 970);
      ctx.fillStyle = "#fff";
      ctx.font = "36px system-ui";
      ops.forEach((o, i) => {
        ctx.fillText(`• ${o.slice(0, 38)}`, 60, 1020 + i * 50);
      });
    }

    // CTA footer
    ctx.fillStyle = "#f3d97a";
    ctx.font = "bold 42px system-ui";
    ctx.fillText("Beat me at:", 60, 1230);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 46px system-ui";
    ctx.fillText(`masterchess.live/u/${data.username}`, 60, 1290);

    setDataUrl(canvas.toDataURL("image/png"));
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-2">Player not found</h1>
          <p className="text-muted-foreground">No public profile exists for @{username}.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const shareUrl = `https://masterchess.live/u/${data.username}`;
  const shareText = `Beat me on MasterChess if you can — ${data.rating} ELO, ${data.games_won} wins, streak of ${data.win_streak} 🔥`;
  const enc = encodeURIComponent;

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `masterchess-${data.username}-brag.png`;
    a.click();
    toast.success("Brag card downloaded — flex away.");
  };

  const pageTitle = `${data.display_name || data.username} · ${data.rating} ELO on MasterChess`;
  const pageDesc = `${data.games_won} wins · win streak ${data.win_streak} · challenge them at masterchess.live`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`https://masterchess.live/brag/${data.username}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={`https://masterchess.live/brag/${data.username}`} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-[#f3d97a] mb-2">Brag Card</div>
          <h1 className="text-3xl sm:text-4xl font-display font-black mb-2">
            Flex {data.display_name || data.username}'s record
          </h1>
          <p className="text-sm text-muted-foreground">
            Download the card or share the link — every share helps the community grow.
          </p>
        </div>

        <div className="grid sm:grid-cols-5 gap-6">
          <div className="sm:col-span-3">
            <canvas
              ref={canvasRef}
              className="w-full rounded-2xl border border-[#d4a843]/40 shadow-[0_0_50px_rgba(212,168,67,0.2)]"
              style={{ aspectRatio: "1080/1350" }}
            />
          </div>
          <div className="sm:col-span-2 space-y-3">
            <div className="rounded-xl border border-border/50 bg-card/40 p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Trophy className="h-4 w-4" /> <span className="text-sm font-semibold">{data.games_won} wins</span>
              </div>
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Flame className="h-4 w-4" /> <span className="text-sm font-semibold">{data.win_streak} streak</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Peak {data.peak_rating} · {data.games_played} games
              </div>
            </div>

            <Button onClick={download} className="w-full gap-2">
              <Download className="h-4 w-4" /> Download PNG
            </Button>
            <a
              href={`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-card/60 hover:bg-card h-10 px-3 text-sm font-medium transition-colors"
            >
              <Twitter className="h-4 w-4" /> Share on X
            </a>
            <a
              href={`https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-card/60 hover:bg-card h-10 px-3 text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={`https://www.reddit.com/submit?url=${enc(shareUrl)}&title=${enc(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-card/60 hover:bg-card h-10 px-3 text-sm font-medium transition-colors"
            >
              <Send className="h-4 w-4" /> Reddit
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
