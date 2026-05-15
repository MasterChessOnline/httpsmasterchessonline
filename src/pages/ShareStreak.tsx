import { useParams, Link } from "react-router-dom";
import { useRef, useState } from "react";
import { Download, Copy, Twitter, Check, Flame } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ShareStreak() {
  const { n = "1" } = useParams();
  const days = Math.max(1, Math.min(999, parseInt(n, 10) || 1));
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const url = `https://masterchess.live/share/streak/${days}`;
  const text = `🔥 ${days}-day daily-mate streak on MasterChess! Can you beat it?`;

  const downloadPng = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `masterchess-streak-${days}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Image downloaded");
    } catch {
      toast.error("Couldn't generate image — try screenshotting the card");
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${days}-Day Streak — Daily Chess Mate | MasterChess`}
        description={`I solved the daily mate-in-N puzzle ${days} days in a row on MasterChess. Beat my streak — free chess puzzles every day.`}
        path={`/share/streak/${days}`}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2 text-center">
          Share your <span className="text-gradient-gold">streak</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Download the card, share the link — challenge your friends.
        </p>

        <div className="flex justify-center mb-8">
          <div
            ref={cardRef}
            className="relative w-full max-w-[600px] aspect-[1200/630] rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(0 0% 5%) 0%, hsl(43 50% 8%) 100%)",
              boxShadow: "0 30px 80px -20px hsl(43 90% 55% / 0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(circle at 80% 20%, hsl(43 90% 55% / 0.6), transparent 50%)" }}
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: "radial-gradient(circle at 20% 90%, hsl(43 90% 55% / 0.4), transparent 50%)" }}
            />

            <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-primary/80 font-bold mb-3">
                MasterChess.live
              </div>

              <Flame className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-3" fill="currentColor" />

              <div
                className="font-display text-7xl sm:text-9xl font-black leading-none mb-1"
                style={{
                  background: "linear-gradient(180deg, hsl(43 95% 70%), hsl(43 90% 45%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {days}
              </div>
              <div className="text-xl sm:text-3xl uppercase tracking-widest text-foreground font-bold">
                Day Streak
              </div>
              <div className="text-sm sm:text-base text-muted-foreground mt-2">
                Daily Mate Challenge — Solved
              </div>

              <div className="absolute bottom-4 right-6 text-[10px] sm:text-xs uppercase tracking-widest text-primary/70 font-bold">
                ♞ Beat my streak →
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={downloadPng} className="gap-2">
            <Download className="h-4 w-4" /> Download PNG
          </Button>
          <Button onClick={copyLink} variant="outline" className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <a href={tweet} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2">
              <Twitter className="h-4 w-4" /> Tweet
            </Button>
          </a>
          <Link to="/daily-puzzle">
            <Button variant="ghost">Back to daily</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
