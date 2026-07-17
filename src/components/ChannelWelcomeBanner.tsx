// Channel welcome banner. When a visitor arrives from a marketing link with
// ?src=tiktok / linkedin / reddit / discord / x / kurir, we greet them with a
// themed banner + a one-click "Play now as guest" CTA.
//
// The ?src param is also persisted to localStorage so later navigations still
// know where the visitor came from, and it's logged to the analytics table.
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

type Channel = "tiktok" | "linkedin" | "reddit" | "discord" | "x" | "kurir" | "instagram" | "youtube";

const CHANNEL_COPY: Record<Channel, { emoji: string; title: string; sub: string; accent: string; bg: string }> = {
  tiktok:    { emoji: "🎬", title: "Welcome, TikTok chess crew!",     sub: "You saw the clip — now play a real game. No signup needed.", accent: "from-pink-500 to-cyan-400", bg: "bg-black" },
  linkedin:  { emoji: "💼", title: "Welcome from LinkedIn!",           sub: "Built by a 13-year-old founder. Play a quick game and see for yourself.", accent: "from-sky-500 to-blue-700", bg: "bg-[#0a66c2]" },
  reddit:    { emoji: "👋", title: "Welcome, r/chess!",                sub: "Ad-free, no bots-as-humans, no paywalls. Try a match.", accent: "from-orange-500 to-red-500", bg: "bg-[#ff4500]" },
  discord:   { emoji: "🎮", title: "Welcome, Discord chess server!",   sub: "Jump into a game or challenge a friend in one click.", accent: "from-indigo-500 to-purple-600", bg: "bg-[#5865F2]" },
  x:         { emoji: "✖️", title: "Welcome from X!",                  sub: "Real humans, real ratings, zero clutter. Try one game.", accent: "from-neutral-300 to-neutral-500", bg: "bg-black" },
  kurir:     { emoji: "👑", title: "Dobrodošao sa Kurira!",            sub: "Ovo je sajt koji je napravio klinac (13) iz Srbije. Igraj odmah.", accent: "from-red-600 to-yellow-400", bg: "bg-red-700" },
  instagram: { emoji: "📸", title: "Welcome from Instagram!",          sub: "Play a quick chess game — no ads, no signup.", accent: "from-pink-500 to-orange-400", bg: "bg-black" },
  youtube:   { emoji: "▶️", title: "Welcome from YouTube!",            sub: "Play the position from the video — instantly.", accent: "from-red-600 to-rose-500", bg: "bg-black" },
};

const DISMISS_KEY = "mc_channel_banner_dismissed_v1";

function parseChannel(searchStr: string): Channel | null {
  const params = new URLSearchParams(searchStr);
  // Accept ?src=, ?ref=, ?utm_source=
  const raw = (params.get("src") || params.get("utm_source") || "").toLowerCase().trim();
  if (raw && raw in CHANNEL_COPY) return raw as Channel;
  return null;
}

export default function ChannelWelcomeBanner() {
  const location = useLocation();
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    try {
      // Prefer current URL, else last-known persisted channel.
      const fromUrl = parseChannel(location.search);
      const persisted = (localStorage.getItem("mc_channel") || "") as Channel | "";
      const ch = fromUrl || (persisted in CHANNEL_COPY ? (persisted as Channel) : null);

      if (fromUrl) localStorage.setItem("mc_channel", fromUrl);
      if (!ch) return;

      // Only show once per session per channel (until user dismisses).
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed === ch) return;
      setChannel(ch);
    } catch { /* noop */ }
  }, [location.search]);

  const dismiss = () => {
    if (channel) {
      try { localStorage.setItem(DISMISS_KEY, channel); } catch { /* noop */ }
    }
    setChannel(null);
  };

  if (!channel) return null;
  const c = CHANNEL_COPY[channel];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="fixed top-2 left-2 right-2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:top-3 z-[70] md:max-w-2xl"
        role="region"
        aria-label={`Welcome from ${channel}`}
      >
        <div className={`relative overflow-hidden rounded-xl border border-white/10 shadow-2xl ${c.bg} text-white`}>
          <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${c.accent}`} aria-hidden />
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="text-2xl md:text-3xl" aria-hidden>{c.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm md:text-base font-black leading-tight truncate">{c.title}</div>
              <div className="text-xs md:text-sm opacity-85 leading-snug line-clamp-2">{c.sub}</div>
            </div>
            <Link
              to="/play-guest"
              onClick={dismiss}
              className="hidden sm:inline-flex items-center gap-1 shrink-0 rounded-lg bg-white text-black text-xs md:text-sm font-black uppercase tracking-wide px-3 py-2 hover:scale-[1.03] transition-transform"
            >
              Play now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={dismiss}
              className="shrink-0 rounded-md p-1.5 hover:bg-white/10"
              aria-label="Dismiss welcome banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Link
            to="/play-guest"
            onClick={dismiss}
            className="sm:hidden block bg-white text-black text-center text-xs font-black uppercase tracking-wide py-2 border-t border-black/10"
          >
            Play now — no signup
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
