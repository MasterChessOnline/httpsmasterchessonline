import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Share2, X, Crown, Skull, Copy, Send, MessageCircle, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import nikolaAvatar from "@/assets/nikola-bot-avatar.jpg";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface Props {
  mode: "win" | "loss";
  moves: number;
  playerName: string;
  onDismiss: () => void;
}

/**
 * Full-screen takeover shown after a Nikola-bot game ends.
 *  - win mode  → branded canvas share card (download + Web Share)
 *  - loss mode → "you + 99% lost" counter-hook with soft signup nudge
 * Both share the same dramatic shell so the brand moment stays consistent.
 */
export default function BeatNikolaShareCard({ mode, moves, playerName, onDismiss }: Props) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const isWin = mode === "win";

  // Fire confetti on win — pure dopamine, no business impact.
  useEffect(() => {
    if (!isWin) return;
    const end = Date.now() + 1200;
    const colors = ["#d4a64a", "#f5e9c8", "#ffffff"];
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [isWin]);

  // Only generate the canvas image when the user actually won.
  useEffect(() => {
    if (!isWin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = ctx.createRadialGradient(W / 2, H * 0.3, 80, W / 2, H * 0.5, W);
    bg.addColorStop(0, "#3a2a08");
    bg.addColorStop(0.5, "#1a1206");
    bg.addColorStop(1, "#0a0805");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#d4a64a";
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.fillStyle = "#d4a64a";
    ctx.font = "bold 36px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MASTERCHESS · BEAT NIKOLA", W / 2, 130);

    ctx.fillStyle = "#f5e9c8";
    ctx.font = "bold 110px 'Cormorant Garamond', serif";
    ctx.fillText("I BEAT THE", W / 2, 320);
    ctx.fillText("13-YEAR-OLD", W / 2, 440);
    ctx.fillStyle = "#d4a64a";
    ctx.fillText("FOUNDER", W / 2, 560);

    ctx.fillStyle = "#f5e9c8";
    ctx.font = "bold 80px Inter, sans-serif";
    ctx.fillText(`in ${moves} moves`, W / 2, 680);

    ctx.fillStyle = "#9a8b6f";
    ctx.font = "500 32px Inter, sans-serif";
    ctx.fillText(`${playerName.toUpperCase()}  vs  NIKOLA · 3500`, W / 2, 760);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, 950, 140, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, W / 2 - 140, 810, 280, 280);
      ctx.restore();
      ctx.strokeStyle = "#d4a64a";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(W / 2, 950, 140, 0, Math.PI * 2);
      ctx.stroke();

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
      try {
        setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        /* ignore */
      }
    };
    img.src = nikolaAvatar;
  }, [isWin, moves, playerName]);

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
        <div
          className={`flex items-center justify-center gap-2 mb-3 ${
            isWin ? "text-primary" : "text-destructive"
          }`}
        >
          {isWin ? <Crown className="h-6 w-6" /> : <Skull className="h-6 w-6" />}
          <p className="text-xs font-bold uppercase tracking-[0.25em]">
            {isWin ? "Wall of Fame" : "Like 99% of players"}
          </p>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-tight">
          {isWin ? (
            <>
              You actually <span className="text-gradient-gold">beat Nikola</span>.
            </>
          ) : (
            <>
              Nikola <span className="text-gradient-gold">crushed you</span>.
            </>
          )}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {isWin
            ? `In ${moves} moves. Your name is now on the public leaderboard.`
            : `It took ${moves} moves. Don't feel bad — almost nobody wins on the first try.`}
        </p>

        {isWin ? (
          <>
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

            {/* One-tap social share — viral distribution layer */}
            {(() => {
              const url = `${window.location.origin}/beat-nikola`;
              const text = `I just beat a 13-year-old's 3500-rated chess bot in ${moves} moves. Your turn 👉`;
              const enc = encodeURIComponent;
              const targets = [
                { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${enc(`${text} ${url}`)}`, color: "hover:bg-emerald-500/20 hover:text-emerald-400" },
                { label: "Telegram", icon: Send, href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`, color: "hover:bg-sky-500/20 hover:text-sky-400" },
                { label: "X", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`, color: "hover:bg-foreground/10 hover:text-foreground" },
              ];
              const copy = async () => {
                try {
                  await navigator.clipboard.writeText(`${text} ${url}`);
                  toast.success("Link copied — paste it anywhere");
                } catch {
                  toast.error("Couldn't copy. Long-press to copy manually.");
                }
              };
              return (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {targets.map((t) => (
                    <a
                      key={t.label}
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border border-border/40 bg-card/40 text-muted-foreground transition-colors ${t.color}`}
                      aria-label={`Share to ${t.label}`}
                    >
                      <t.icon className="h-4 w-4" />
                      <span className="text-[10px] font-medium">{t.label}</span>
                    </a>
                  ))}
                  <button
                    onClick={copy}
                    className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl border border-border/40 bg-card/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Copy</span>
                  </button>
                </div>
              );
            })()}
          </>
        ) : (
          <>
            <div className="mt-5 rounded-2xl border border-border/40 bg-card/40 p-5 text-left space-y-3">
              <p className="text-sm text-foreground">
                Your rating drops if you keep losing. But the players on the{" "}
                <Link to="/beat-nikola" className="text-primary underline">
                  Wall of Fame
                </Link>{" "}
                studied openings, practiced endgames, and used the in-built training tools.
              </p>
              <p className="text-sm text-muted-foreground">
                Tip: pick a single opening (Italian or London) and play it 10 times in a row vs
                easier bots first. Then come back.
              </p>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onDismiss}
                size="lg"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Crown className="h-5 w-5 mr-2" />
                Try again
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link to="/openings">Train openings</Link>
              </Button>
            </div>
            {!user && (
              <p className="mt-4 text-xs text-muted-foreground">
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up free
                </Link>{" "}
                to track your rating, streak, and rematch history.
              </p>
            )}
          </>
        )}

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
