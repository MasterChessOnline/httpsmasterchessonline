import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Megaphone,
  QrCode,
  Copy,
  Check,
  Share2,
  Instagram,
  Youtube,
  TrendingUp,
  Users,
  Zap,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/ShareButton";

export default function Promo() {
  const [qrUrl, setQrUrl] = useState("https://masterchess.live");
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const referralLink = username
    ? `https://masterchess.live/?ref=${encodeURIComponent(username)}`
    : "https://masterchess.live";

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shortTexts = [
    "Check out MasterChess — free online chess with tournaments, AI bots, and analysis!",
    "I just played chess on MasterChess. Real human matches, zero ads. Join me!",
    "Looking for a clean chess site? MasterChess is 🔥 Free, no clutter, instant play.",
    "MasterChess: daily tournaments, Stockfish analysis, opening trainer. All free.",
    "Just hit a new win streak on MasterChess! Who wants to play?",
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>Promote MasterChess — Share & Grow the Community</title>
        <meta name="description" content="Help spread MasterChess! Get your referral link, QR code, and ready-made social posts." />
        <link rel="canonical" href="https://masterchess.live/promo" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-10 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.12),_transparent_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <Megaphone className="w-3 h-3" />
            Promote
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Spread the Word
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mb-6">
            Help us grow the MasterChess community. Share your link, post on social media, or invite friends directly.
          </p>
          <ShareButton
            url="https://masterchess.live"
            text="Play chess online free on MasterChess — tournaments, bots, analysis!"
            variant="gold"
            size="lg"
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-8">
        {/* Referral Link */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">Your Referral Link</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Enter your username to generate a personalized referral link. When friends sign up through it, you both get bonus coins.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Your username (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <code className="flex-1 text-xs text-yellow-400 font-mono truncate">{referralLink}</code>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shrink-0"
              onClick={copyReferral}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </section>

        {/* QR Code */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">QR Code</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Scan or download this QR code to instantly open MasterChess on any device.
          </p>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="p-4 rounded-xl bg-white">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                alt="MasterChess QR Code"
                className="w-40 h-40"
              />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Default: masterchess.live. You can change it to any page (e.g., your profile link).
              </p>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrUrl)}`}
                download="masterchess-qr.png"
                className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Download high-res QR code
              </a>
            </div>
          </div>
        </section>

        {/* Ready-made posts */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold">Ready-Made Posts</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Copy any of these and paste directly on social media.
          </p>
          <div className="space-y-3">
            {shortTexts.map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/20 transition-colors group"
              >
                <p className="flex-1 text-sm text-zinc-300">{text}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(text + " https://masterchess.live");
                    alert("Copied to clipboard!");
                  }}
                  className="shrink-0 p-2 rounded-lg bg-zinc-800 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Stats / Growth */}
        <section className="rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Players", value: "10K+" },
              { icon: Zap, label: "Daily Games", value: "5K+" },
              { icon: Crown, label: "Tournaments", value: "50+/week" },
              { icon: TrendingUp, label: "Growth", value: "+200%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-[#0b0b0d]/50">
                <stat.icon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Social channels */}
        <section className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">Follow & Tag Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="https://www.instagram.com/masterchess.live"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 hover:scale-[1.02] transition-transform"
            >
              <Instagram className="w-6 h-6 text-pink-400" />
              <div>
                <div className="font-semibold text-sm">Instagram</div>
                <div className="text-xs text-zinc-400">@masterchess.live</div>
              </div>
            </a>
            <a
              href="https://www.youtube.com/channel/UC8W92XBMdu20Z0tKBbwsaWA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-red-800/20 border border-red-500/20 hover:scale-[1.02] transition-transform"
            >
              <Youtube className="w-6 h-6 text-red-400" />
              <div>
                <div className="font-semibold text-sm">YouTube</div>
                <div className="text-xs text-zinc-400">DailyChess_12</div>
              </div>
            </a>
            <a
              href="https://www.tiktok.com/@masterchess.live"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 hover:scale-[1.02] transition-transform"
            >
              <Share2 className="w-6 h-6 text-cyan-400" />
              <div>
                <div className="font-semibold text-sm">TikTok</div>
                <div className="text-xs text-zinc-400">@masterchess.live</div>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
