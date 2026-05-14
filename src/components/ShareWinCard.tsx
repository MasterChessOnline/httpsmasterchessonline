import { useEffect, useRef, useState } from "react";
import { Download, Twitter, MessageCircle, Send, X as XIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareWinCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  opponentName: string;
  result: "win" | "loss" | "draw";
  ratingDelta?: number;
  newRating?: number;
  opening?: string;
  moves?: number;
  timeControl?: string;
}

/**
 * Viral share card. Renders a 1200x630 canvas with the player's win,
 * lets them download the PNG and share to social. Triggers after ranked games.
 */
export default function ShareWinCard({
  open,
  onOpenChange,
  playerName,
  opponentName,
  result,
  ratingDelta,
  newRating,
  opening,
  moves,
  timeControl,
}: ShareWinCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient — gold & black
    const bg = ctx.createLinearGradient(0, 0, 1200, 630);
    bg.addColorStop(0, "#0a0a0c");
    bg.addColorStop(0.6, "#15110a");
    bg.addColorStop(1, "#1a1408");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 630);

    // Gold accent bar
    const gold = ctx.createLinearGradient(0, 0, 1200, 0);
    gold.addColorStop(0, "#d4a843");
    gold.addColorStop(0.5, "#f3d97a");
    gold.addColorStop(1, "#a87f2e");
    ctx.fillStyle = gold;
    ctx.fillRect(0, 0, 1200, 6);
    ctx.fillRect(0, 624, 1200, 6);

    // Decorative chess squares grid (subtle)
    ctx.globalAlpha = 0.04;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = "#f3d97a";
          ctx.fillRect(800 + c * 45, 60 + r * 45, 45, 45);
        }
      }
    }
    ctx.globalAlpha = 1;

    // Brand
    ctx.fillStyle = "#f3d97a";
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("♛ MASTERCHESS", 60, 80);
    ctx.fillStyle = "#888";
    ctx.font = "18px system-ui, -apple-system, sans-serif";
    ctx.fillText("masterchess.live", 60, 108);

    // Headline
    const headline =
      result === "win" ? "VICTORY" : result === "draw" ? "DRAW" : "GOOD GAME";
    ctx.fillStyle = result === "win" ? "#f3d97a" : "#ddd";
    ctx.font = "bold 110px system-ui, -apple-system, sans-serif";
    ctx.fillText(headline, 60, 240);

    // Players line
    ctx.fillStyle = "#fff";
    ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
    const playerLine =
      result === "win"
        ? `${truncate(playerName, 18)} defeated ${truncate(opponentName, 18)}`
        : result === "loss"
          ? `${truncate(playerName, 18)} vs ${truncate(opponentName, 18)}`
          : `${truncate(playerName, 18)} = ${truncate(opponentName, 18)}`;
    ctx.fillText(playerLine, 60, 320);

    // Meta row
    ctx.fillStyle = "#bbb";
    ctx.font = "26px system-ui, -apple-system, sans-serif";
    const metaParts: string[] = [];
    if (timeControl) metaParts.push(timeControl);
    if (opening) metaParts.push(opening);
    if (moves) metaParts.push(`${moves} moves`);
    if (metaParts.length) ctx.fillText(metaParts.join("  ·  "), 60, 370);

    // Rating chip
    if (typeof ratingDelta === "number" || typeof newRating === "number") {
      ctx.fillStyle = "rgba(243, 217, 122, 0.12)";
      ctx.strokeStyle = "#d4a843";
      ctx.lineWidth = 2;
      roundRect(ctx, 60, 420, 380, 110, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f3d97a";
      ctx.font = "bold 22px system-ui";
      ctx.fillText("ELO", 84, 454);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 56px system-ui";
      const ratingText = newRating ? `${newRating}` : "—";
      ctx.fillText(ratingText, 84, 510);
      if (typeof ratingDelta === "number" && ratingDelta !== 0) {
        ctx.fillStyle = ratingDelta > 0 ? "#34d399" : "#f87171";
        ctx.font = "bold 32px system-ui";
        const delta = ratingDelta > 0 ? `+${ratingDelta}` : `${ratingDelta}`;
        ctx.fillText(delta, 280, 510);
      }
    }

    // CTA
    ctx.fillStyle = "#f3d97a";
    ctx.font = "bold 28px system-ui";
    ctx.fillText("Play free at masterchess.live →", 60, 590);

    setDataUrl(canvas.toDataURL("image/png"));
  }, [open, playerName, opponentName, result, ratingDelta, newRating, opening, moves, timeControl]);

  const shareUrl = "https://masterchess.live/";
  const shareText =
    result === "win"
      ? `I just beat ${opponentName} on MasterChess${newRating ? ` (${newRating} ELO)` : ""}! ♛`
      : result === "draw"
        ? `Tough draw vs ${opponentName} on MasterChess.`
        : `Played a great game on MasterChess. Come challenge me!`;

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `masterchess-${result}-${Date.now()}.png`;
    a.click();
    toast.success("Card downloaded");
  };

  const enc = encodeURIComponent;
  const links = {
    x: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`,
    reddit: `https://www.reddit.com/submit?url=${enc(shareUrl)}&title=${enc(shareText)}`,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur border-border/60">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-primary">
              {result === "win" ? "Share your win 🎉" : "Share this game"}
            </h2>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg border border-border/40 shadow-lg"
            style={{ aspectRatio: "1200/630" }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button onClick={download} className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            <a
              href={links.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-card/60 hover:bg-card h-10 px-3 text-sm font-medium transition-colors"
            >
              <Twitter className="h-4 w-4" /> X
            </a>
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-card/60 hover:bg-card h-10 px-3 text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={links.reddit}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-card/60 hover:bg-card h-10 px-3 text-sm font-medium transition-colors"
            >
              <Send className="h-4 w-4" /> Reddit
            </a>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Every share helps the community grow — thanks for spreading MasterChess.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
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
