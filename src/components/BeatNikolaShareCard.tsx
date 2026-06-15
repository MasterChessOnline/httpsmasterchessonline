import { useEffect, useRef, useState } from "react";
import { Download, Share2, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import nikolaAvatar from "@/assets/nikola-bot-avatar.jpg";

interface Props {
  moves: number;
  playerName: string;
  onDismiss: () => void;
}

/**
 * Full-screen takeover shown after a player beats the Nikola bot.
 * Generates a branded 1080x1350 share image (IG/TikTok 4:5) on a canvas,
 * then offers Download + Web Share. Pure client-side — no backend round-trip.
 */
export default function BeatNikolaShareCard({ moves, playerName, onDismiss }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background — gold→black radial
    const bg = ctx.createRadialGradient(W / 2, H * 0.3, 80, W / 2, H * 0.5, W);
    bg.addColorStop(0, "#3a2a08");
    bg.addColorStop(0.5, "#1a1206");
    bg.addColorStop(1, "#0a0805");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Gold border
    ctx.strokeStyle = "#d4a64a";
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // Top label
    ctx.fillStyle = "#d4a64a";
    ctx.font = "bold 36px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MASTERCHESS · BEAT NIKOLA", W / 2, 130);

    // Headline
    ctx.fillStyle = "#f5e9c8";
    ctx.font = "bold 110px 'Cormorant Garamond', serif";
    ctx.fillText("I BEAT THE", W / 2, 320);
    ctx.fillText("13-YEAR-OLD", W / 2, 440);
    ctx.fillStyle = "#d4a64a";
    ctx.fillText("FOUNDER", W / 2, 560);

    // Move count
    ctx.fillStyle = "#f5e9c8";
    ctx.font = "bold 80px Inter, sans-serif";
    ctx.fillText(`in ${moves} moves`, W / 2, 680);

    // Player + opponent labels
    ctx.fillStyle = "#9a8b6f";
    ctx.font = "500 32px Inter, sans-serif";
    ctx.fillText(`${playerName.toUpperCase()}  vs  NIKOLA · 3500`, W / 2, 760);

    // Avatar (Nikola)
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Circle clip avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, 950, 140, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, W / 2 - 140, 810, 280, 280);
      ctx.restore();
      // Avatar ring
      ctx.strokeStyle = "#d4a64a";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(W / 2, 950, 140, 0, Math.PI * 2);
      ctx.stroke();

      // CTA
      ctx.fillStyle = "#d4a64a";
      ctx.font = "bold 44px Inter, sans-serif";
      ctx.fillText("masterchess.live/beat-nikola", W / 2, 1230);
      ctx.fillStyle = "#9a8b6f";
      ctx.font = "500 28px Inter, sans-serif";
      ctx.fillText("Think you can do it too?", W / 2, 1280);

      try {
        setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        /* ignore */
      }
    };
    img.onerror = () => {
      // fall back without avatar
      ctx.fillStyle = "#d4a64a";
      ctx.font = "bold 44px Inter, sans-serif";
      ctx.fillText("masterchess.live/beat-nikola", W / 2, 1230);
      try {
        setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        /* ignore */
      }
    };
    img.src = nikolaAvatar;
  }, [moves, playerName]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `beat-nikola-${moves}-moves.png`;
    a.click();
  };

  const share = async () => {
    const url = `${window.location.origin}/beat-nikola`;
    const text = `I just beat a 13-year-old's 3500-rated chess bot in ${moves} moves. Your turn.`;
    // Try native share with image first
    if (dataUrl && typeof navigator !== "undefined" && (navigator as any).canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "beat-nikola.png", { type: "image/png" });
        if ((navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({ files: [file], title: "Beat Nikola", text, url });
          return;
        }
      } catch {
        /* fall through */
      }
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Beat Nikola — MasterChess", text, url });
        return;
      } catch {
        /* ignore */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center p-4 overflow-y-auto">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-2 rounded-full bg-card/80 border border-border/40 text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="max-w-md w-full text-center my-auto">
        <div className="flex items-center justify-center gap-2 text-primary mb-3">
          <Crown className="h-6 w-6" />
          <p className="text-xs font-bold uppercase tracking-[0.25em]">Wall of Fame</p>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-tight">
          You actually <span className="text-gradient-gold">beat Nikola</span>.
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          In {moves} moves. Your name is now on the public leaderboard.
        </p>

        <div className="mt-5 rounded-2xl border border-primary/30 bg-card/60 p-3 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-lg"
            style={{ aspectRatio: "4/5" }}
          />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={share}
            size="lg"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share the proof
          </Button>
          <Button onClick={download} size="lg" variant="outline" className="flex-1">
            <Download className="h-5 w-5 mr-2" />
            Download
          </Button>
        </div>

        <button
          onClick={onDismiss}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
