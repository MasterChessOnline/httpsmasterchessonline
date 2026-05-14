import { useState } from "react";
import { Twitter, Facebook, MessageCircle, Send, Link as LinkIcon, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareBarProps {
  url?: string;
  title?: string;
  /** Compact mode hides labels and uses smaller icons. */
  compact?: boolean;
}

/**
 * Viral social share bar. Drops onto any page — homepage hero, article footer, etc.
 * Renders five buttons: X (Twitter), Facebook, WhatsApp, Reddit, Copy link.
 */
export default function ShareBar({
  url = typeof window !== "undefined" ? window.location.href : "https://masterchess.live/",
  title = "MasterChess — Play chess online free, tournaments, bots & analysis",
  compact = false,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const links = {
    x: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    whatsapp: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
    reddit: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`,
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Long-press to copy manually.");
    }
  };

  const size = compact ? "h-9 w-9" : "h-10 px-3 gap-2";
  const icon = compact ? "h-4 w-4" : "h-4 w-4";

  const Btn = ({ href, label, brand, children }: { href?: string; label: string; brand: string; children: React.ReactNode }) => {
    const cls = `inline-flex items-center justify-center rounded-lg border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 text-foreground transition-all hover:scale-[1.04] hover:shadow-md ${size}`;
    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`} title={`Share on ${label}`} className={cls}>
          {children}
          {!compact && <span className="text-xs font-medium">{brand}</span>}
        </a>
      );
    }
    return (
      <button onClick={copy} aria-label={label} title={label} className={cls}>
        {children}
        {!compact && <span className="text-xs font-medium">{brand}</span>}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Btn href={links.x} label="X" brand="X / Twitter">
        <Twitter className={icon} />
      </Btn>
      <Btn href={links.whatsapp} label="WhatsApp" brand="WhatsApp">
        <MessageCircle className={icon} />
      </Btn>
      <Btn href={links.facebook} label="Facebook" brand="Facebook">
        <Facebook className={icon} />
      </Btn>
      <Btn href={links.reddit} label="Reddit" brand="Reddit">
        <Send className={icon} />
      </Btn>
      <Btn label="Copy link" brand={copied ? "Copied" : "Copy link"}>
        {copied ? <Check className={`${icon} text-emerald-400`} /> : <LinkIcon className={icon} />}
      </Btn>
    </div>
  );
}
