// Canvas-generated 1080x1080 share card rendered after a finished game.
// Includes username, outcome, ELO delta, and a QR code linking back to
// the player's challenge URL — meant for IG/X/WhatsApp sharing.
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  outcome: "win" | "loss" | "draw";
  username?: string;
  ratingChange?: number;
  newRating?: number;
  challengeUrl: string;
}

const SIZE = 1080;

export default function SharePositionCard({
  open,
  onClose,
  outcome,
  username,
  ratingChange,
  newRating,
  challengeUrl,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setRendering(true);
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background — dark luxury gradient
      const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      bg.addColorStop(0, "#0a0a0a");
      bg.addColorStop(0.5, "#171717");
      bg.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Subtle gold corner glow
      const glow = ctx.createRadialGradient(SIZE * 0.5, 220, 50, SIZE * 0.5, 220, 700);
      glow.addColorStop(0, "rgba(251,191,36,0.35)");
      glow.addColorStop(1, "rgba(251,191,36,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Brand
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 42px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MASTERCHESS", SIZE / 2, 110);
      ctx.font = "22px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#a8a29e";
      ctx.fillText("masterchess.live", SIZE / 2, 150);

      // Outcome
      const titles = { win: "VICTORY", loss: "DEFEAT", draw: "DRAW" } as const;
      const colors = { win: "#fde047", loss: "#fb7185", draw: "#7dd3fc" } as const;
      ctx.font = "bold 180px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = colors[outcome];
      ctx.fillText(titles[outcome], SIZE / 2, 380);

      // Username
      if (username) {
        ctx.font = "bold 56px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = "#fafaf9";
        ctx.fillText(`@${username}`, SIZE / 2, 480);
      }

      // ELO delta
      if (typeof ratingChange === "number") {
        const sign = ratingChange >= 0 ? "+" : "";
        ctx.font = "bold 96px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = ratingChange >= 0 ? "#34d399" : "#fb7185";
        ctx.fillText(`${sign}${ratingChange} ELO`, SIZE / 2, 610);
        if (typeof newRating === "number") {
          ctx.font = "32px 'Inter', system-ui, sans-serif";
          ctx.fillStyle = "#a8a29e";
          ctx.fillText(`New rating: ${newRating}`, SIZE / 2, 660);
        }
      }

      // Challenge prompt
      ctx.font = "bold 44px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("Think you can beat me?", SIZE / 2, 800);

      // QR code (right-bottom)
      try {
        const qrDataUrl = await QRCode.toDataURL(challengeUrl, {
          width: 260,
          margin: 1,
          color: { dark: "#0a0a0a", light: "#fbbf24" },
        });
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            // White rounded card behind QR for contrast
            ctx.fillStyle = "#fbbf24";
            ctx.fillRect(SIZE / 2 - 130, 870, 260, 140);
            ctx.drawImage(img, SIZE / 2 - 130, 850, 260, 260);
            resolve();
          };
          img.src = qrDataUrl;
        });
      } catch {
        // QR optional — keep going if it fails
      }

      // URL line under card
      ctx.font = "24px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#a8a29e";
      ctx.textAlign = "center";
      ctx.fillText("Scan or visit", SIZE / 2, 1050);

      if (!cancelled) {
        try {
          setDataUrl(canvas.toDataURL("image/png"));
        } catch {
          setDataUrl(null);
        }
        setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, outcome, username, ratingChange, newRating, challengeUrl]);

  if (!open) return null;

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `masterchess-${outcome}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const nativeShare = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "masterchess.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "MasterChess",
          text: "Just won on MasterChess — think you can beat me?",
        });
        return;
      }
    } catch {}
    download();
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close share card"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-zinc-950 p-5 shadow-[0_0_80px_hsl(43,95%,60%,0.3)]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-center text-amber-300 font-bold uppercase tracking-widest text-xs mb-3">
          Share Card
        </h3>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black border border-amber-500/20">
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-300" />
            </div>
          )}
          {dataUrl && (
            // Display the rendered PNG (canvas is hidden — drawing surface only)
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="MasterChess share card" className="w-full h-full object-contain" />
          )}
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            onClick={nativeShare}
            disabled={!dataUrl}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold hover:brightness-110"
          >
            <Share2 className="h-4 w-4 mr-1.5" /> Share
          </Button>
          <Button
            onClick={download}
            disabled={!dataUrl}
            variant="outline"
            className="border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
          >
            <Download className="h-4 w-4 mr-1.5" /> Download
          </Button>
        </div>
        <p className="mt-3 text-center text-[11px] text-zinc-500">
          1080×1080 PNG · perfect for Instagram, X, WhatsApp
        </p>
      </div>
    </div>
  );
}
