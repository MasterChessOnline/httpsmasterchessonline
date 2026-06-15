import { useState, useEffect, useCallback } from "react";
import {
  Share2,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Check,
  X,
} from "lucide-react";

export default function FloatingShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const url = typeof window !== "undefined" ? window.location.href : "https://masterchess.live";
  const text = "Check out MasterChess — free online chess with tournaments, bots & analysis!";

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
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
      name: "X / Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      color: "bg-zinc-700 hover:bg-zinc-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "bg-blue-600 hover:bg-blue-500",
    },
  ];

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[100] md:bottom-8 md:right-8">
      {open && (
        <div className="absolute bottom-14 right-0 w-64 rounded-xl border border-yellow-500/20 bg-[#1a1a1e] shadow-2xl shadow-black/50 p-4 animate-in fade-in slide-in-from-bottom-4 duration-200 mb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Share</span>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 transition-colors mb-3"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <LinkIcon className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <span className="text-sm text-zinc-300">{copied ? "Copied!" : "Copy link"}</span>
          </button>

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

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
}
