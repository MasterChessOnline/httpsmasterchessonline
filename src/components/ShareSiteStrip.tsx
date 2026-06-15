import { Link } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Copy,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

/**
 * "Share MasterChess" strip — one-tap backlink distribution.
 * Renders in the Footer so it appears on every page.
 */
export default function ShareSiteStrip() {
  const url = "https://masterchess.live";
  const text =
    "Play chess online free vs players, AI bots & tournaments — no puzzles, just real chess.";
  const enc = encodeURIComponent;

  const targets = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
    },
    {
      label: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    },
    {
      label: "Reddit",
      icon: MessageCircle,
      href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc("MasterChess — Play chess online free")}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${enc("Check out MasterChess")}&body=${enc(`${text}\n\n${url}`)}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy — long-press to copy manually");
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Spread MasterChess
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Help us grow — share with a friend who plays chess.
          </p>
        </div>
        <Link
          to="/embed-rating"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors self-start sm:self-auto"
        >
          <Code2 className="h-3.5 w-3.5" />
          Embed our rating on your site →
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {targets.map((t) => (
          <a
            key={t.label}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-border/40 bg-background/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
            aria-label={`Share to ${t.label}`}
          >
            <t.icon className="h-4 w-4" />
            <span className="text-[10px] font-medium">{t.label}</span>
          </a>
        ))}
        <button
          onClick={copy}
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-border/40 bg-background/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
          aria-label="Copy link"
        >
          <Copy className="h-4 w-4" />
          <span className="text-[10px] font-medium">Copy</span>
        </button>
      </div>
    </div>
  );
}
