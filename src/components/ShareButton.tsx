import { useState, useCallback } from "react";
import {
  Share2,
  Link as LinkIcon,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  variant?: "default" | "outline" | "ghost" | "gold";
  size?: "sm" | "default" | "lg";
  className?: string;
  showLabel?: boolean;
}

export default function ShareButton({
  url = typeof window !== "undefined" ? window.location.href : "https://masterchess.live",
  title = "MasterChess",
  text = "Join me on MasterChess for free online chess!",
  variant = "gold",
  size = "default",
  className = "",
  showLabel = true,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = { title, text, url };

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled
      }
    }
    setOpen(true);
  }, [shareData]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      color: "bg-green-500 hover:bg-green-400",
    },
    {
      name: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      color: "bg-sky-500 hover:bg-sky-400",
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      color: "bg-zinc-800 hover:bg-zinc-700",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "bg-blue-600 hover:bg-blue-500",
    },
  ];

  return (
    <div className="relative inline-block">
      <Button
        variant={variant === "gold" ? "default" : variant}
        size={size}
        className={`${
          variant === "gold"
            ? "bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
            : ""
        } ${className}`}
        onClick={handleNativeShare}
      >
        <Share2 className="w-4 h-4 mr-2" />
        {showLabel && "Share"}
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 right-0 w-72 rounded-xl border border-yellow-500/20 bg-[#1a1a1e] shadow-2xl shadow-black/50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Share</span>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 transition-colors mb-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <LinkIcon className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
              {copied ? "Copied!" : "Copy link"}
            </span>
          </button>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-2">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2.5 rounded-lg ${link.color} text-white text-xs font-medium transition-transform hover:scale-105`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
