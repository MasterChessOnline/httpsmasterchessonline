import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Share2,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Check,
  X,
  Mail,
  Smartphone,
  Linkedin,
  Instagram,
  ExternalLink,
} from "lucide-react";

/**
 * Floating share button.
 * - Native Web Share API as primary CTA on mobile (opens OS share sheet =
 *   every installed app: TikTok DM, Snapchat, Discord, Signal, etc.)
 * - Direct deep-link fallbacks for the most popular apps when Web Share is
 *   unavailable (desktop, or when user wants a specific target)
 * - Context-aware share text by route
 */
export default function FloatingShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [igHint, setIgHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const url = typeof window !== "undefined" ? window.location.href : "https://masterchess.live";
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  // Context-aware share copy by route
  const text = useMemo(() => {
    if (path.startsWith("/puzzles")) return "Try this chess puzzle on MasterChess — can you solve it?";
    if (path.startsWith("/openings")) return "Learning chess openings on MasterChess — free, no ads.";
    if (path.startsWith("/tournaments")) return "Join free chess tournaments on MasterChess!";
    if (path.startsWith("/play")) return "Playing chess on MasterChess — free online, no ads.";
    if (path.startsWith("/leaderboard")) return "Check out the top chess players on MasterChess!";
    if (path.startsWith("/beat/")) return "I'm trying to beat this bot on MasterChess — join me!";
    return "Check out MasterChess — free online chess with tournaments, bots & analysis!";
  }, [path]);

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const nativeShare = useCallback(async () => {
    if (!hasNativeShare) return false;
    try {
      await navigator.share({ title: "MasterChess", text, url });
      return true;
    } catch {
      return false;
    }
  }, [hasNativeShare, text, url]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    });
  }, [url]);

  const openInstagram = useCallback(() => {
    // Instagram has no public web share URL. Copy text+link, then open IG app/site.
    navigator.clipboard.writeText(`${text} ${url}`).then(() => {
      setIgHint(true);
      setTimeout(() => setIgHint(false), 3500);
      // Try app deep link first (mobile), then web
      const win = window.open(isMobile ? "instagram://camera" : "https://www.instagram.com/", "_blank");
      if (!win && isMobile) window.location.href = "https://www.instagram.com/";
    });
  }, [text, url, isMobile]);

  // Grouped share targets
  const messaging = [
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
      name: "Viber",
      icon: MessageCircle,
      href: `viber://forward?text=${encodeURIComponent(text + " " + url)}`,
      color: "bg-purple-600 hover:bg-purple-500",
    },
    {
      name: "Messenger",
      icon: MessageCircle,
      // FB Messenger requires an app id for web; this deep link works on mobile
      href: isMobile
        ? `fb-messenger://share/?link=${encodeURIComponent(url)}`
        : `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=140586622674265&redirect_uri=${encodeURIComponent(url)}`,
      color: "bg-blue-500 hover:bg-blue-400",
    },
  ];

  const social = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "bg-blue-600 hover:bg-blue-500",
    },
    {
      name: "X / Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      color: "bg-zinc-700 hover:bg-zinc-600",
    },
    {
      name: "Reddit",
      icon: ExternalLink,
      href: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      color: "bg-orange-600 hover:bg-orange-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "bg-sky-700 hover:bg-sky-600",
    },
  ];

  const other = [
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent("MasterChess")}&body=${encodeURIComponent(text + "\n\n" + url)}`,
      color: "bg-zinc-700 hover:bg-zinc-600",
    },
    ...(isMobile
      ? [{
          name: "SMS",
          icon: Smartphone,
          href: `sms:?&body=${encodeURIComponent(text + " " + url)}`,
          color: "bg-emerald-600 hover:bg-emerald-500",
        }]
      : []),
  ];

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[100] md:bottom-8 md:right-8">
      {open && (
        <div className="absolute bottom-14 right-0 w-72 max-h-[70vh] overflow-y-auto rounded-xl border border-yellow-500/20 bg-[#1a1a1e] shadow-2xl shadow-black/50 p-4 animate-in fade-in slide-in-from-bottom-4 duration-200 mb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Share MasterChess</span>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          {/* Native share — primary on mobile, opens OS sheet with ALL apps */}
          {hasNativeShare && (
            <button
              onClick={nativeShare}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-semibold hover:from-yellow-400 hover:to-amber-300 transition-colors mb-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share via apps…</span>
              <span className="ml-auto text-[10px] opacity-70">TikTok · Snap · Discord…</span>
            </button>
          )}

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

          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 px-0.5">Messaging</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {messaging.map((link) => (
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

          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 px-0.5">Social</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {social.map((link) => (
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
            <button
              onClick={openInstagram}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 text-white text-xs font-medium transition-transform hover:scale-105 col-span-2"
            >
              <Instagram className="w-4 h-4" />
              Instagram {igHint && <span className="ml-auto opacity-80">Link copied — paste in IG</span>}
            </button>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 px-0.5">Other</div>
          <div className="grid grid-cols-2 gap-2">
            {other.map((link) => (
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
        aria-label="Share MasterChess"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
}
